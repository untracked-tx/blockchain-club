const ethers = require("ethers");
require("dotenv").config();
const artifact = require("./artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");

const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);

const CONTRACT_ADDRESS = require("./deployments/deployment.json").BlockchainClubMembership.address;
const abi = artifact.abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

async function checkBaseURI() {
  try {
    console.log("Checking BlockchainClubMembership contract...");
    console.log("Contract address:", CONTRACT_ADDRESS);
    
    // Check if contract has _baseURI function (it's internal, but we can try tokenURI)
    // Let's get a sample token to check the URI
    const totalSupply = await contract.totalSupply();
    console.log("Total supply:", totalSupply.toString());
    
    if (totalSupply > 0) {
      // Get tokenURI for the first token
      const tokenId = await contract.tokenByIndex(0);
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`Token ID ${tokenId} URI:`, tokenURI);
      
      // Extract base URI (everything before the filename)
      if (tokenURI.includes('/')) {
        const baseURI = tokenURI.substring(0, tokenURI.lastIndexOf('/') + 1);
        console.log("Extracted base URI:", baseURI);
      }
    } else {
      console.log("No tokens minted yet to check tokenURI");
    }
    
  } catch (error) {
    console.error("Error checking base URI:", error.message);
  }
}

checkBaseURI()
  .then(() => console.log("Done!"))
  .catch(console.error);
