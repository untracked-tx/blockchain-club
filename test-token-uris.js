const ethers = require("ethers");
require("dotenv").config();
const artifact = require("./artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json");

const AMOY_RPC = "https://rpc-amoy.polygon.technology";
const provider = new ethers.JsonRpcProvider(AMOY_RPC);

const CONTRACT_ADDRESS = require("./deployments/deployment.json").BlockchainClubMembership.address;
const abi = artifact.abi;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

async function testTokenURIs() {
  try {
    console.log("Testing token URIs and metadata...");
    console.log("Contract address:", CONTRACT_ADDRESS);
    
    const totalSupply = await contract.totalSupply();
    console.log("Total supply:", totalSupply.toString());
    
    for (let i = 0; i < Number(totalSupply); i++) {
      const tokenId = await contract.tokenByIndex(i);
      const tokenURI = await contract.tokenURI(tokenId);
      
      console.log(`\nToken ID: ${tokenId}`);
      console.log(`Token URI: ${tokenURI}`);
      
      // Try to fetch the metadata
      let resolvedUri = tokenURI;
      if (resolvedUri.startsWith("ipfs://")) {
        resolvedUri = resolvedUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      
      try {
        const response = await fetch(resolvedUri);
        if (response.ok) {
          const metadata = await response.json();
          console.log(`Name: ${metadata.name}`);
          console.log(`Description: ${metadata.description}`);
          console.log(`Image: ${metadata.image}`);
          
          // Test image accessibility
          if (metadata.image) {
            let imageUrl = metadata.image;
            if (imageUrl.startsWith("ipfs://")) {
              imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
            }
            
            try {
              const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
              console.log(`Image accessible: ${imageResponse.ok ? '✅' : '❌'} (${imageResponse.status})`);
            } catch (err) {
              console.log(`Image accessible: ❌ (Error: ${err.message})`);
            }
          }
        } else {
          console.log(`❌ Metadata not accessible (${response.status})`);
        }
      } catch (err) {
        console.log(`❌ Error fetching metadata: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testTokenURIs()
  .then(() => console.log("\nDone!"))
  .catch(console.error);
