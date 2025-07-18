const ethers = require("ethers");
require("dotenv").config();
const artifact = require("../artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");

const AMOY_RPC = "https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

const CONTRACT_ADDRESS = require("../deployments/deployment.json").BlockchainClubMembership.address;
const abi = artifact.abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

async function setBaseURI() {
  const newBaseURI = "ipfs://bafybeibjyxu74cmrimlmu4dgmhnlxqlplrlr46y4j6h2s5g7wqpftsbzcu/";
  const tx = await contract.setBaseURI(newBaseURI);
  await tx.wait();
  console.log(`Base URI set to: ${newBaseURI}`);
}

setBaseURI()
  .then(() => console.log("Done!"))
  .catch(console.error);
