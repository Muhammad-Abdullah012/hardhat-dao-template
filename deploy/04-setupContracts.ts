import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import {
  GovernorContractName,
  TimelockContractName,
} from "../constants/constants";
import { GovernorContract, TimeLock } from "../typechain-types";
import { ZERO_ADDRESS } from "../helper-hardhat-config";

const setupContracts: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const TimeLockContract: TimeLock = await ethers.getContract(
    TimelockContractName,
    deployer
  );
  const GovernorContract: GovernorContract = await ethers.getContract(
    GovernorContractName,
    deployer
  );

  log("Setting contracts");
  const proposerRole = await TimeLockContract.PROPOSER_ROLE();
  const executorRole = await TimeLockContract.EXECUTOR_ROLE();
  const adminRole = await TimeLockContract.TIMELOCK_ADMIN_ROLE();

  const proposalTx = await TimeLockContract.grantRole(proposerRole, GovernorContract.address);
  await proposalTx.wait(1);
  const executorTx = await TimeLockContract.grantRole(executorRole, ZERO_ADDRESS);
  await executorTx.wait(1);

  const revokeTx = await TimeLockContract.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
};

setupContracts.tags = ["all", "setupContracts"];
export default setupContracts;
