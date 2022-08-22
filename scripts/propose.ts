import { ethers, network } from "hardhat";
import * as fs from "fs";
import {
  BoxContractName,
  GovernorContractName,
  PROPOSALS_FILE_PATH,
} from "../constants/constants";
import {
  DEVELOPMENT_CHAINS,
  FUNCTION_TO_CALL,
  NEW_VALUE,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
} from "../helper-hardhat-config";
import { Box, GovernorContract } from "../typechain-types";
import { PromiseOrValue } from "../typechain-types/common";
import { moveBlocks } from "../utils/move_blocks";

type proposalData = {
  [chainId: string]: string[];
};

const readProposalsFile = (): Promise<proposalData> => {
  const readStream = fs.createReadStream(PROPOSALS_FILE_PATH, {
    encoding: "utf8",
    autoClose: true,
  });
  return new Promise((resolve, reject) => {
    readStream.on("data", (chunck) => {
      resolve(JSON.parse(chunck.toString()));
    });
    readStream.on("error", (err) => {
      console.error(err);
      reject(1);
    });
  });
};

const writeProposalFile = (proposalsData: proposalData): Promise<void> => {
  const writeStream = fs.createWriteStream(PROPOSALS_FILE_PATH, {
    encoding: "utf8",
    autoClose: true,
  });
  console.log("Writing : ", JSON.stringify(proposalsData) + " to file");
  return new Promise<void>((resolve, reject) => {
    writeStream.write(JSON.stringify(proposalsData), (error) => {
      process.stderr.write("An error occured: " + error?.stack);
    });
    writeStream.close();
    writeStream.once("close", () => {
      resolve();
    });
  });
};

export async function propose(
  args: [PromiseOrValue<string>],
  functionToCall: any,
  proposalDescription: string
) {
  const GovernorContract: GovernorContract = await ethers.getContract(
    GovernorContractName
  );
  const BoxContract: Box = await ethers.getContract(BoxContractName);
  const encodedFunctionCall = BoxContract.interface.encodeFunctionData(
    functionToCall,
    args
  );
  const chainId: string = network.config.chainId!.toString(); //! is to say typescript that there will be chainId, confirmed and don't complain about it.
  console.log(
    `Proposing ${functionToCall} on ${BoxContract.address} with ${args}`
  );
  console.log(`Proposal description: \n${proposalDescription}`);
  const proposeTx = await GovernorContract.propose(
    [BoxContract.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );
  const proposeReceipt = await proposeTx.wait(1);

  if (DEVELOPMENT_CHAINS.includes(network.name)) {
    moveBlocks(VOTING_DELAY + 1);
  }
  const proposalId = proposeReceipt.events?.[0].args?.proposalId.toString();
  /**Now need to store proposal Id in json file */
  console.log(proposalId);
  const proposalsData = await readProposalsFile();
  console.log("proposalData: ", proposalsData);
  if (proposalsData[chainId] === undefined) {
    proposalsData[chainId] = [proposalId];
  } else {
    proposalsData[chainId].push(proposalId);
  }

  await writeProposalFile(proposalsData);
}

propose([NEW_VALUE], FUNCTION_TO_CALL, PROPOSAL_DESCRIPTION)
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
