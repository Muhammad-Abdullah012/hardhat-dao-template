import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { BoxContractName } from "../../constants/constants";
import { DEVELOPMENT_CHAINS } from "../../helper-hardhat-config";
import { Box } from "../../typechain-types";

(DEVELOPMENT_CHAINS.includes(network.name) ? describe : describe.skip)(
  BoxContractName,
  function () {
    async function deployBoxFixture() {
      const { deployer } = await getNamedAccounts();
      await deployments.fixture("all");
      const BoxContract: Box = await ethers.getContract(
        BoxContractName,
        deployer
      );
      return { deployer, BoxContract };
    }
    it("Should initialize value with zero", async function () {
      const { BoxContract } = await loadFixture(deployBoxFixture);
      expect((await BoxContract.getValue()).toString()).to.equal("0");
    });
    describe("Owner", function () {
      it("Should set right owner", async function () {
        const { BoxContract, deployer } = await loadFixture(deployBoxFixture);
        expect(await BoxContract.owner()).to.equal(deployer);
      });
    });
    describe("ChangeValue", function () {
      it("Should revert if someone else tries to call changeValue", async function () {
        const { BoxContract } = await loadFixture(deployBoxFixture);
        const BoxContractNotOwner = BoxContract.connect(
          (await ethers.getSigners())[1]
        );
        await expect(BoxContractNotOwner.changeValue("1")).to.be.reverted;
      });
      it("Should change value", async function() {
        const { BoxContract } = await loadFixture(deployBoxFixture);
        const txResponse = await BoxContract.changeValue("12");
        const txReceipt = await txResponse.wait(1);
        expect(txReceipt).to.emit(BoxContractName, "valueChanged").withArgs("12");
        expect((await BoxContract.getValue()).toString()).to.equal("12");
      })
    });
  }
);
