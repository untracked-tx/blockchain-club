const { upgrades, ethers } = require("hardhat");

async function main() {
  const proxyAddress = "0x19dabB29410C114e4758b6b05Ba634315995D292";
  const Membership = await ethers.getContractFactory("BlockchainClubMembership");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, Membership);
  console.log("Upgraded Membership at:", upgraded.address);
}

main();
