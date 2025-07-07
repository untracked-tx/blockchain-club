const ethers = require("ethers");
require("dotenv").config();

// --- LOAD DEPLOYMENT INFO ---
const deployment = require("../deployments/deployment.json");
const CONTRACT_ADDRESS = deployment.BlockchainClubMembership.address;
const abi = deployment.BlockchainClubMembership.abi;

async function main() {
    try {
        // Set up provider
        const provider = new ethers.JsonRpcProvider("https://base-sepolia.g.alchemy.com/v2/3I2SnV24h3S6WkVy-eAzJc-6EQjHcwAx");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        // Test specific token types that we created
        const tokenTypes = [
            'president',
            'vice_president', 
            'cfo',
            'treasurer',
            'officer',
            'major_key_alert',
            'trader',
            'trader_chill',
            'custom_membership'
        ];

        console.log('Checking specific token types...\n');

        for (const tokenName of tokenTypes) {
            try {
                const typeId = ethers.keccak256(ethers.toUtf8Bytes(tokenName));
                const config = await contract.tokenTypeConfigs(typeId);
                
                console.log(`✅ ${tokenName} (typeId: ${typeId}):`);
                console.log(`   Name: ${config.name}`);
                console.log(`   Category: ${config.category}`);
                console.log(`   Max Supply: ${config.maxSupply.toString()}`);
                console.log(`   Current Supply: ${config.currentSupply.toString()}`);
                console.log(`   Is Active: ${config.isActive}`);
                console.log(`   Start Time: ${new Date(Number(config.startTime) * 1000).toLocaleString()}`);
                console.log(`   End Time: ${new Date(Number(config.endTime) * 1000).toLocaleString()}`);
                console.log('');
            } catch (error) {
                console.log(`❌ ${tokenName}: Not found or error - ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
