const ethers = require("ethers");
require("dotenv").config();
const rolesArtifact = require("./artifacts/contracts/Roles.sol/Roles.json");

const AMOY_RPC = "https://polygon-amoy.g.alchemy.com/v2/BKOaUhVk2Adt-aEqV-3AaKd4nmnfdaGa";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);

const ROLES_ADDRESS = require("./deployments/deployment.json").Roles.address;
const abi = rolesArtifact.abi;
const contract = new ethers.Contract(ROLES_ADDRESS, abi, provider);

async function checkVotingPower() {
  try {
    console.log("Checking voting power for addresses...");
    console.log("Roles contract address:", ROLES_ADDRESS);
    
    // Test addresses - replace with actual addresses that have tokens
    const testAddresses = [
      // Add some test addresses here if you know them, or we can get them from the membership contract
    ];
    
    // First, let's get some token holders from the membership contract
    const membershipArtifact = require("./artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");
    const membershipContract = new ethers.Contract(
      require("./deployments/deployment.json").BlockchainClubMembership.address,
      membershipArtifact.abi,
      provider
    );
    
    const totalSupply = await membershipContract.totalSupply();
    console.log(`Total NFT supply: ${totalSupply}`);
    
    const tokenHolders = new Set();
    for (let i = 0; i < Number(totalSupply); i++) {
      const tokenId = await membershipContract.tokenByIndex(i);
      const owner = await membershipContract.ownerOf(tokenId);
      tokenHolders.add(owner);
    }
    
    console.log(`\nFound ${tokenHolders.size} unique token holders\n`);
    
    for (const address of tokenHolders) {
      console.log(`\n--- Address: ${address} ---`);
      
      // Check role
      const hasMemberRole = await contract.hasRole(await contract.MEMBER_ROLE(), address);
      const hasOfficerRole = await contract.hasRole(await contract.OFFICER_ROLE(), address);
      const currentRole = await contract.getUserCurrentRole(address);
      
      console.log(`Has MEMBER_ROLE: ${hasMemberRole}`);
      console.log(`Has OFFICER_ROLE: ${hasOfficerRole}`);
      console.log(`Current role: ${currentRole}`);
      
      // Check voting power
      const votingPower = await contract.getVotingPower(address);
      console.log(`Voting power: ${votingPower.toString()}`);
      
      // Check custom voting power
      const customPower = await contract.customVotingPower(address);
      console.log(`Custom voting power: ${customPower.toString()}`);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkVotingPower()
  .then(() => console.log("\nDone!"))
  .catch(console.error);
