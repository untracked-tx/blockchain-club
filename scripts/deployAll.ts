import { expect } from "chai";
import hre from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import fs from "fs";
import path from "path";
// No direct import of ethers or upgrades; use hre.ethers and hre.upgrades

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function main() {
  // Use ethers and upgrades from hre
  const [deployer] = await (hre as any).ethers.getSigners();
  const devWallet = deployer.address; // Developer wallet as interim owner

  // Deploy Roles (AccessControl-based, no ownership transfer needed)
  const Roles = await (hre as any).ethers.getContractFactory("Roles");
  const roles = await (hre as any).upgrades.deployProxy(Roles, [devWallet], {
    initializer: "initialize",
    kind: "uups",
  });
  await roles.waitForDeployment();
  const rolesAddress = roles.target;
  console.log("Roles deployed to:", rolesAddress);

  // Deploy TreasuryRouter (needs roles address and treasury address)
  const TreasuryRouter = await (hre as any).ethers.getContractFactory("TreasuryRouter");
  const treasuryRouter = await (hre as any).upgrades.deployProxy(TreasuryRouter, [rolesAddress, devWallet], {
    initializer: "initialize",
    kind: "uups",
  });
  await treasuryRouter.waitForDeployment();
  const treasuryRouterAddress = treasuryRouter.target;
  console.log("TreasuryRouter deployed to:", treasuryRouterAddress);

  // Transfer ownership to dev wallet
  await treasuryRouter.transferOwnership(devWallet);

  // Deploy BlockchainClubMembership (name, symbol, roles address)
  const BlockchainClubMembership = await (hre as any).ethers.getContractFactory("BlockchainClubMembership");
  const membership = await (hre as any).upgrades.deployProxy(
    BlockchainClubMembership,
    ["Blockchain Club Membership", "BCM", rolesAddress],
    { initializer: "initialize", kind: "uups" }
  );
  await membership.waitForDeployment();
  const membershipAddress = membership.target;
  console.log("BlockchainClubMembership deployed to:", membershipAddress);

  // Transfer ownership to dev wallet
  await membership.transferOwnership(devWallet);

  // Prepare output
  const deployment = {
    Roles: {
      address: rolesAddress,
      abi: JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../artifacts/contracts/Roles.sol/Roles.json"),
          "utf8"
        )
      ).abi,
    },
    TreasuryRouter: {
      address: treasuryRouterAddress,
      abi: JSON.parse(
        fs.readFileSync(
          path.join(
            __dirname,
            "../artifacts/contracts/TreasuryRouter.sol/TreasuryRouter.json"
          ),
          "utf8"
        )
      ).abi,
    },
    BlockchainClubMembership: {
      address: membershipAddress,
      abi: JSON.parse(
        fs.readFileSync(
          path.join(
            __dirname,
            "../artifacts/contracts/BlockchainClubMembership.sol/BlockchainClubMembership.json"
          ),
          "utf8"
        )
      ).abi,
    }
  };

  // Ensure the 'deployments' directory exists
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Write deployment info to file
  const outPath = path.join(deploymentsDir, "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("Deployment info written to", outPath);

  console.log("All contracts deployed and ownership transferred to dev wallet.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
