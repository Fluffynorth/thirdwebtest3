import { useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";

export default function Component() {
  const { contract } = useContract("0x83FB325a7C94274E24E07cb7f6C5F16484fb9Cf7");
  const { mutateAsync: castVoteWithReasonAndParamsBySig, isLoading } = useContractWrite(contract, "castVoteWithReasonAndParamsBySig")

  const call = async () => {
    try {
      const data = await castVoteWithReasonAndParamsBySig([ proposalId, support, reason, params, v, r, s ]);
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  }
}