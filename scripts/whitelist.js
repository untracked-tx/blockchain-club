const hre = require("hardhat");
require("dotenv").config();
const fs = require("fs");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error("CONTRACT_ADDRESS must be set in .env");
  let addresses = [];
  if (process.env.WHITELIST_FILE) {
    addresses = fs.readFileSync(process.env.WHITELIST_FILE, "utf-8").split(/\r?\n/).filter(Boolean);
  } else if (process.env.WHITELIST_ADDRESSES) {
    addresses = process.env.WHITELIST_ADDRESSES.split(",").map(a => a.trim()).filter(Boolean);
  } else {
    throw new Error("Provide WHITELIST_FILE or WHITELIST_ADDRESSES in .env");
  }
  const [officer] = await hre.ethers.getSigners();
  const contract = await hre.ethers.getContractAt("BlockchainClubMembership", contractAddress);
  const tx = await contract.setBatchWhitelist(addresses, true);
  await tx.wait();
  console.log(`Whitelisted addresses:`, addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
