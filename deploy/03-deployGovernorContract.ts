import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  BoxContractName,
  GovernanceTokenContractName,
  GovernorContractName,
  TimelockContractName,
} from "../constants/constants";
import {
  DEVELOPMENT_CHAINS,
  QUORUM_PERCENTAGE,
  VOTING_DELAY,
  VOTING_PERIOD,
} from "../helper-hardhat-config";
import { network } from "hardhat";
import { verify } from "../utils/verify";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deploy, log, get } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const TimeLockContract = await get(TimelockContractName);
  const GovernanceTokenContract = await get(GovernanceTokenContractName);

  const args: any[] = [
    GovernanceTokenContract.address,
    TimeLockContract.address,
    VOTING_DELAY,
    VOTING_PERIOD,
    QUORUM_PERCENTAGE,
  ];
  const GovernorContract = await deploy(GovernorContractName, {
    from: deployer,
    args,
    log: true,
    waitConfirmations: DEVELOPMENT_CHAINS.includes(network.name)
      ? undefined
      : 6,
  });

  if (!DEVELOPMENT_CHAINS.includes(network.name)) {
    log("Verifying " + BoxContractName);
    verify(GovernorContract.address, args);
    log("Verified successfully");
  }
};
deployGovernorContract.tags = ["all", "deployGovernorContract"];
export default deployGovernorContract;
