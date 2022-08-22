import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BoxContractName, TimelockContractName } from "../constants/constants";
import { DEVELOPMENT_CHAINS } from "../helper-hardhat-config";
import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";
import { Box, TimeLock } from "../typechain-types";

const deployBox: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const args: any[] = [];
  const boxContract = await deploy(BoxContractName, {
    from: deployer,
    args,
    log: true,
    waitConfirmations: DEVELOPMENT_CHAINS.includes(network.name)
      ? undefined
      : 6,
  });

  if (!DEVELOPMENT_CHAINS.includes(network.name)) {
    log("Verifying " + BoxContractName);
    verify(boxContract.address, args);
    log("Verified successfully");
  }

  const BoxContract: Box = await ethers.getContractAt(
    BoxContractName,
    boxContract.address
  );
  const TimeLockContract: TimeLock = await ethers.getContract(
    TimelockContractName
  );

  const transferOwnershipTx = await BoxContract.transferOwnership(
    TimeLockContract.address
  );
  await transferOwnershipTx.wait(1);
  log("Ownership transferred to Timelock Contract");
};
deployBox.tags = ["all", "deployBox"];
export default deployBox;
