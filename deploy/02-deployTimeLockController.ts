import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BoxContractName, TimelockContractName } from "../constants/constants";
import { DEVELOPMENT_CHAINS, MIN_DELAY } from "../helper-hardhat-config";
import { network } from "hardhat";
import { verify } from "../utils/verify";

const deployTimeLockController: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deploy, log } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const args: any[] = [MIN_DELAY, [deployer], [deployer]];
  const TimeLockContract = await deploy(TimelockContractName, {
    from: deployer,
    args,
    log: true,
    waitConfirmations: DEVELOPMENT_CHAINS.includes(network.name)
      ? undefined
      : 6,
  });

  if (!DEVELOPMENT_CHAINS.includes(network.name)) {
    log("Verifying " + BoxContractName);
    verify(TimeLockContract.address, args);
    log("Verified successfully");
  }
};
deployTimeLockController.tags = ["all", "deployTimeLockController"];
export default deployTimeLockController;
