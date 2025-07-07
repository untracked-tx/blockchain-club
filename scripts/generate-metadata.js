const fs = require("fs");
const path = require("path");

// Updated image CID
const imageCID = "bafybeiffaxkrzhxiovhk6n3eablbsuaunfekmheehthm5oyemz7jdnmazm";

// Paste your array here
const types = [
  // Governance - Member tokens
  { typeName: "Trader", category: "Governance", maxSupply: 10, mintAccess: 2, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Initiation", category: "Governance", maxSupply: 10, mintAccess: 2, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Trader Chill", category: "Governance", maxSupply: 10, mintAccess: 2, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Let's Get This Party Started", category: "Governance", maxSupply: 10, mintAccess: 2, expiresIn: 365*24*3600, role: "MEMBER" },
  { typeName: "Custom Membership", category: "Governance", maxSupply: 10, mintAccess: 2, expiresIn: 365*24*3600, role: "MEMBER" },

  // Governance - Officer tokens
  { typeName: "President", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Vice President", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "CFO", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Treasurer", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Major Key Alert", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },
  { typeName: "Officer", category: "Governance", maxSupply: 2, mintAccess: 0, expiresIn: 365*24*3600, role: "OFFICER" },

  // Supporter tokens
  { typeName: "The Graduate", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 10*365*24*3600, role: null },
  { typeName: "Rhodes Scholar", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 10*365*24*3600, role: null },
  { typeName: "Digital Art", category: "Supporter", maxSupply: 100000, mintAccess: 2, expiresIn: 10*365*24*3600, role: null },

  // POAPs
  { typeName: "Mint & Slurp", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Quad", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Secret Sauce", category: "POAP", maxSupply: 1000, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },

  // Awards & Recognition
  { typeName: "Founders Series", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Gold Star", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },
  { typeName: "Long Run", category: "Award", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true },

  // Replacement
  { typeName: "The Fool", category: "Replacement", maxSupply: 100, mintAccess: 0, expiresIn: 10*365*24*3600, role: null, soulbound: true }
];

// Helper to normalize filenames, with special cases
function toFilename(typeName) {
  if (typeName === "Treasurer") return "tres.png";
  if (typeName === "Founders Series") return "hist_glitch.png";
  return typeName.toLowerCase().replace(/[\s&]+/g, "_").replace(/[^\w_]/g, "") + ".png";
}

const outDir = "./metadata";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

types.forEach((type, i) => {
  const expiration = new Date(Date.now() + type.expiresIn * 1000).toISOString().split("T")[0];
  const soulbound = type.soulbound ? "True" : "False";
  const attributes = [
    { trait_type: "Category", value: type.category },
    { trait_type: "Token Type", value: type.typeName },
    { trait_type: "Max Supply", value: type.maxSupply.toString() },
    { trait_type: "Mint Access", value: (["OFFICER_ONLY", "WHITELIST_ONLY", "PUBLIC"])[type.mintAccess] || type.mintAccess },
    { trait_type: "Role", value: type.role || "None" },
    { trait_type: "Expiration", value: expiration },
    { trait_type: "Soulbound", value: soulbound }
  ];

  const meta = {
    name: `${type.typeName} Token`,
    description: `Blockchain Club NFT: ${type.typeName}.`,
    image: `ipfs://${imageCID}/${toFilename(type.typeName)}`,
    attributes
  };

  const filename = path.join(outDir, `${toFilename(type.typeName).replace(".png", ".json")}`);
  fs.writeFileSync(filename, JSON.stringify(meta, null, 2));
  console.log(`Wrote metadata: ${filename}`);
});
