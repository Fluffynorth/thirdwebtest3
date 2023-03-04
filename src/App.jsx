import {
  useAddress,
  useContract,
  ConnectWallet,
  Web3Button,
  useTokenBalance,
  useBalance,
} from '@thirdweb-dev/react';
import { Phoenix } from "@thirdweb-dev/chains";
import { useState, useEffect } from 'react';
import { AddressZero } from '@ethersproject/constants';



// const { contract } = useContract(tokenAddress);
// const balance = await contract.balanceOf(walletAddress);

const activeChain = Phoenix;
const App = () => {
  // Use the hooks thirdweb give us.
  const address = useAddress();

  // Initialize our token contract
  const tokenAddress = '0xAe8879c810cb8Ad2409B36f52FeaeC96EaEB0B5f';
  const { contract: token } = useContract(
    tokenAddress,
    "token",
  );
  console.log('Token:', token);

  const voteAddress = '0x83FB325a7C94274E24E07cb7f6C5F16484fb9Cf7';
  const { contract: vote } = useContract(
    voteAddress,
    'vote', 
  );
  
  // Hook to check if the user has our token
  const useBalanceData = useBalance(address);
  const tokenBalanceData = useTokenBalance(token, address, '0');
  const tokenBalance = tokenBalanceData.data;
  const balance = useBalanceData;
  const amounts = balance;

  // Holds the amount of token each  has in state.
  const [TokenAmounts, setTokenAmounts] = useState([]);
  // The array holding all of our s addresses.
  const [Addresses, setAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + '...' + str.substring(str.length - 4);
  };

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (tokenBalance) {
      return;
    }

    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
        console.log('🌈 Proposals:', proposals);
      } catch (error) {
        console.log('failed to get proposals', error);
      }
    };
    getAllProposals();
  }, [vote]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (tokenBalance) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }

    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log('🥵 User has already voted');
        } else {
          console.log('🙂 User has not voted yet');
        }
      } catch (error) {
        console.error('Failed to check if wallet has voted', error);
      }
    };
    checkIfUserHasVoted();
  }, [proposals, address, vote]);

  // This useEffect grabs all the addresses holding our token.
  useEffect(() => {
    if (!tokenBalance) {
      return;
    }
    const activeProposals = proposals.filter((proposal) => proposal.state === 'active');
    const inactiveProposals = proposals.filter((proposal) => proposal.state !== 'active');

    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our token
    // with tokenId 0.
    const getAllAddresses = async () => {
      try {
        const Addresses = await token?.history.getAllHolderBalances();
          await token?.history.getAllHolderBalances();
        setAddresses(Addresses);
      } catch (error) {
        console.error('failed to get list', error);
      }
    };
    getAllAddresses();
  }, [tokenBalance]);

  // This useEffect grabs the # of token each  holds.
  useEffect(() => {
    if (!tokenBalance) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token?.history.getAllHolderBalances();
        setTokenAmounts(amounts);
        console.log('👜 Amounts', amounts);
      } catch (error) {
        console.error('failed to get balances', error);
      }
    };
    getAllBalances();
  }, [tokenBalance]);

// Now, we combine the Addresses and TokenAmounts into a single array
  const List = (() => {
    return Addresses.map((address) => {
      // We're checking if we are finding the address in the TokenAmounts array.
      // If we are, we'll return the amount of token the user has.
      // Otherwise, return 0.
      const TokenAmounts = tokenBalance.amounts
const List = TokenAmounts?.find(({ holder }) => holder === address);


      return {
        address,
        tokenAmount: List ? List.balance.displayValue : '0',
      };
    });
  }, [Addresses, TokenAmounts]);

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h1>🐔Welcome to GPHX DAO</h1>
        <div className="btn-hero">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  // If the user has already claimed their token we want to display the interal DAO page to them
  // only DAO s will see this. Render all the s + token amounts.
  {
    return (
      <div className="-page">
        <h1>🐔DAO  Page</h1>
        <p>Phoenix Powered Dao</p>
        <div>
          <div>
            <h2>💰Member💰</h2> 
            <table className="card">
              <thead>
                <tr>
                  <td>Address {shortenAddress(address)}</td>
                  <td>KFC Amount {tokenBalance?.displayValue}</td>
                </tr>
              </thead>
              <tbody>
          {() => (
            <tr key={address}>
            <td>{shortenAddress(address)}</td>
              <td>{tokenBalance}</td>
            </tr>
            )}
              </tbody>
              </table>
                </div>
                  <div>
                    <h2>Active Proposals {vote.vote}</h2>
                    <form
                  onSubmit={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                    const voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + '-' + vote.type,
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await token.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await token.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId, vote: _vote }) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await vote.get(proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return vote.vote(proposalId, _vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      }),
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await vote.get(proposalId);

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return vote.execute(proposalId);
                          }
                        }),
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log('successfully voted');
                    } catch (err) {
                      console.error('failed to execute votes', err);
                    }
                  } catch (err) {
                    console.error('failed to vote', err);
                  }
                } catch (err) {
                  console.error('failed to delegate tokens');
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map(({ type, label }) => (
                      <div key={type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + '-' + type}
                          name={proposal.proposalId}
                          value={type}
                          //default the "abstain" vote to checked
                          defaultChecked={type === 2}
                        />
                        <label htmlFor={proposal.proposalId + '-' + type}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? 'Voting...'
                  : hasVoted
                  ? 'You Already Voted'
                  : 'Submit Votes'}
              </button>
              {!hasVoted && (
                <small>
                  This will trigger multiple transactions that you will need to
                  sign.
                </small>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  
};

export default App;
