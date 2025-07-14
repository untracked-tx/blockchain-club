const ethers = require("ethers");
require("dotenv").config();
const rolesArtifact = require("./artifacts/contracts/Roles.sol/Roles.json");

const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);

// Get your wallet address from env or hardcode for testing  
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "0xDA30c053156E690176574dAEe79CEB94e3C8F0cC"; // Your actual wallet address

const ROLES_CONTRACT_ADDRESS = require("./deployments/deployment.json").Roles.address;
const abi = rolesArtifact.abi;
const contract = new ethers.Contract(ROLES_CONTRACT_ADDRESS, abi, provider);

async function testVotingPower() {
  try {
    console.log("Testing voting power...");
    console.log("Roles contract address:", ROLES_CONTRACT_ADDRESS);
    console.log("Wallet address:", WALLET_ADDRESS);
    
    // Get voting power
    const votingPower = await contract.getVotingPower(WALLET_ADDRESS);
    console.log("Voting power:", votingPower.toString());
    
    // Get role constants first
    const memberRole = await contract.MEMBER_ROLE();
    const officerRole = await contract.OFFICER_ROLE();
    const adminRole = await contract.ADMIN_ROLE();
    
    console.log("MEMBER_ROLE hash:", memberRole);
    console.log("OFFICER_ROLE hash:", officerRole);
    console.log("ADMIN_ROLE hash:", adminRole);
    
    // Check individual roles
    const hasMemberRole = await contract.hasRole(memberRole, WALLET_ADDRESS);
    const hasOfficerRole = await contract.hasRole(officerRole, WALLET_ADDRESS);
    const hasAdminRole = await contract.hasRole(adminRole, WALLET_ADDRESS);
    
    console.log("Has MEMBER_ROLE:", hasMemberRole);
    console.log("Has OFFICER_ROLE:", hasOfficerRole);
    console.log("Has ADMIN_ROLE:", hasAdminRole);
    
    // Get role voting powers
    const memberVotingPower = await contract.MEMBER_VOTING_POWER();
    const officerVotingPower = await contract.OFFICER_VOTING_POWER();
    
    console.log("MEMBER_VOTING_POWER:", memberVotingPower.toString());
    console.log("OFFICER_VOTING_POWER:", officerVotingPower.toString());
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testVotingPower()
  .then(() => console.log("Done!"))
  .catch(console.error);
