import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';

async function main() {
    try {
        const contractAddress = '0x8fE95C4Ece74B4eC68E8bd5b5b5a08F6A5c3E5a7';
        const abi = JSON.parse(fs.readFileSync('artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json', 'utf8')).abi;
        const provider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/3I2SnV24h3S6WkVy-eAzJc-6EQjHcwAx');
        const contract = new ethers.Contract(contractAddress, abi, provider);

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
                
                console.log(`✅ ${tokenName}:`);
                console.log(`   Name: ${config.name}`);
                console.log(`   Category: ${config.category}`);
                console.log(`   Max Supply: ${config.maxSupply.toString()}`);
                console.log(`   Current Supply: ${config.currentSupply.toString()}`);
                console.log(`   Is Active: ${config.isActive}`);
                console.log(`   Start Time: ${new Date(Number(config.startTime) * 1000).toLocaleString()}`);
                console.log(`   End Time: ${new Date(Number(config.endTime) * 1000).toLocaleString()}`);
                console.log('');
            } catch (error) {
                console.log(`❌ ${tokenName}: Not found or error`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
