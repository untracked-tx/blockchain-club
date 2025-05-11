const ethers = require("ethers");
const crypto = require("crypto");

async function main() {
  try {
    const roleHash = "0x" + crypto.createHash("sha256").update("OFFICER_ROLE").digest("hex");
    console.log("[DEBUG] Generated role hash using crypto:", roleHash);
  } catch (error) {
    console.error("[ERROR] Failed to generate role hash using crypto:", error);
  }
}

main();
