const { ethers } = require("hardhat");
const { contracts } = require("../frontend/lib/contracts");

async function checkActiveTokens() {
    console.log("🔍 Checking active token types in the contract...");
    
    const membershipContract = await ethers.getContractAt(
        "BlockchainClubMembership", 
        contracts.membership.address
    );
    
    // Common token names to check
    const tokenNamesToCheck = [
        "Trader",
        "Trader Chill", 
        "Let's Get This Party Started",
        "Custom Membership",
        "President",
        "Vice President",
        "CFO",
        "Treasurer",
        "Major Key Alert",
        "Officer",
        "Mint & Slurp",
        "Quad",
        "Secret Sauce",
        "The Graduate",
        "Rhodes Scholar",
        "Digital Art",
        "Founders Series",
        "Gold Star",
        "Long Run"
    ];
    
    console.log("\n📋 Token Type Status:");
    console.log("=" * 50);
    
    for (const tokenName of tokenNamesToCheck) {
        try {
            const tokenNameBytes32 = ethers.keccak256(ethers.toUtf8Bytes(tokenName));
            const tokenInfo = await membershipContract.getTokenTypeInfo(tokenNameBytes32);
            
            console.log(`✅ ${tokenName}:`);
            console.log(`   - Active: ${tokenInfo.active}`);
            console.log(`   - Max Supply: ${tokenInfo.maxSupply}`);
            console.log(`   - Current Supply: ${tokenInfo.currentSupply}`);
            console.log(`   - Mint Access: ${tokenInfo.mintAccess}`);
            console.log(`   - Cost: ${ethers.formatEther(tokenInfo.cost)} ETH`);
            console.log("");
        } catch (error) {
            console.log(`❌ ${tokenName}: Not configured in contract`);
        }
    }
}

checkActiveTokens()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
