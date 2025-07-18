const ethers = require("ethers");
require("dotenv").config();
const deployment = require("../deployments/deployment.json");
const CONTRACT_ADDRESS = deployment.BlockchainClubMembership.address;
const abi = deployment.BlockchainClubMembership.abi;

const AMOY_RPC = "https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Set PRIVATE_KEY in your .env file");
const wallet = new ethers.Wallet(privateKey, provider);
const address = wallet.address;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

async function main() {
  const balance = await contract.balanceOf(address);
  console.log(`Address: ${address}`);
  console.log(`Token balance: ${balance.toString()}`);
  if (balance > 0) {
    let tokens = [];
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);
      tokens.push(tokenId.toString());
    }
    console.log(`Token IDs: ${tokens.join(", ")}`);
  }
}

main().catch(console.error);
