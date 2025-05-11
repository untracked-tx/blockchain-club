import contractJson from "./BlockchainClubMembership.json";

// Export the ABI for use in the frontend
export const CONTRACT_ABI = contractJson.abi;

// IMPORTANT: Use the correct deployed contract address for Polygon Amoy
export const CONTRACT_ADDRESS = "0xA36958F6E5efC6a2FeAB65a670771F1c2a3C586F"; // Updated to verified proxy address

// Mapping of tokenId to role for gallery and owned token display
export const TOKEN_ROLE_MAP: Record<number, string> = {
  1: "Observer",
  2: "The Graduate",
  3: "Member",
  4: "Member",
  5: "Officer",
  6: "Officer",
  7: "Officer",
  8: "Officer",
  9: "Officer",
  10: "Officer",
  11: "Officer",
  12: "Officer",
  13: "Officer",
  14: "The Graduate",
  15: "Scholarship",
  16: "Founder Series",
  17: "Secret Sauce Token",
  18: "Loyalty Token",
  19: "Gold Star Award",
  20: "Art Drop",
  21: "Founder Series"
};
