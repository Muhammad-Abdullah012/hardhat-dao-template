import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  BoxContractName,
  GovernanceTokenContractName,
} from "../constants/constants";
import { DEVELOPMENT_CHAINS } from "../helper-hardhat-config";
import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";
import { GovernanceToken } from "../typechain-types";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const args: any[] = [];
  const GovernanceTokenContract = await deploy(GovernanceTokenContractName, {
    from: deployer,
    args,
    log: true,
    waitConfirmations: DEVELOPMENT_CHAINS.includes(network.name)
      ? undefined
      : 6,
  });

  /**Give voting power to deployer */
  delegate(GovernanceTokenContract.address, deployer);
  log("Delegated deployer");

  if (!DEVELOPMENT_CHAINS.includes(network.name)) {
    log("Verifying " + BoxContractName);
    verify(GovernanceTokenContract.address, args);
    log("Verified successfully");
  }
};

/** Give voting power to @param delegatedAccount */
const delegate = async (
  governanceTokenAddress: string,
  delegatedAccount: string
) => {
  const governanceToken: GovernanceToken = await ethers.getContractAt(
    GovernanceTokenContractName,
    governanceTokenAddress
  );
  await (await governanceToken.delegate(delegatedAccount)).wait(1);
  console.log(
    `Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`
  );
};

deployGovernanceToken.tags = ["all", "deployGovernanceToken"];
export default deployGovernanceToken;
