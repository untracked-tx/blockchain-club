const ethers = require("ethers");
require("dotenv").config();
const deployment = require("../deployments/deployment.json");

const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);

const CONTRACT_ADDRESS = deployment.Roles.address;
const abi = deployment.Roles.abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

async function grantOfficerRole(address) {
  const officerRole = await contract.OFFICER_ROLE();
  const tx = await contract.grantRole(officerRole, address);
  await tx.wait();
  console.log(`Granted OFFICER_ROLE to ${address}`);
}

// Grant to both wallet address and additional test address if provided
const testAddress = process.env.TEST_ADDRESS || "0x9cd3bb58d05c0be0a5cc5e4906ba5f8ff2e68c9e";

async function main() {
  await grantOfficerRole(wallet.address);
  await grantOfficerRole(testAddress);
}

main()
  .then(() => console.log("Done!"))
  .catch(console.error);
