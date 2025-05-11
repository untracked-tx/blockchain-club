const fs = require("fs");
const path = require("path");

async function main() {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "BlockchainClubMembership.sol",
    "BlockchainClubMembership.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact file not found at:", artifactPath);
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  if (!artifact.abi) {
    console.error("ABI not found in artifact file.");
    process.exit(1);
  }

  console.log("Extracted ABI:", JSON.stringify(artifact.abi, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
