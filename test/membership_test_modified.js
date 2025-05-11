require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { parseEther } = require("ethers"); // ethers v6: import parseEther directly

// --- TEST SUITE: BlockchainClubMembership (Upgradeable) ---
describe("BlockchainClubMembership (Upgradeable)", function () {
  let contract, owner, ops, scholar, user1, user2, officer;
  const baseURI = "https://example.com/meta/";

  beforeEach(async function () {
    [owner, ops, scholar, user1, user2, officer] = await ethers.getSigners();
    const Club = await ethers.getContractFactory("BlockchainClubMembership");
    contract = await upgrades.deployProxy(Club, [baseURI, ops.address, scholar.address], { initializer: "initialize", kind: "uups" });
    await contract.setWhitelist(user1.address, true);
    await contract.setWhitelist(user2.address, true);
    await contract.grantRole(await contract.OFFICER_ROLE(), officer.address);
  });

  it("should allow owner or officer to add/remove officers via AccessControl", async () => {
    await contract.grantRole(await contract.OFFICER_ROLE(), user1.address);
    expect(await contract.hasRole(await contract.OFFICER_ROLE(), user1.address)).to.equal(true);
    await contract.revokeRole(await contract.OFFICER_ROLE(), user1.address);
    expect(await contract.hasRole(await contract.OFFICER_ROLE(), user1.address)).to.equal(false);
  });

  it("should allow minting and enforce role limits", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    await expect(contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") }))
      .to.be.revertedWith("You have already minted this role");
  });

  it("should allow officer to mint officer edition", async () => {
    await contract.setEditionWhitelist("SpecialOfficer", true);
    await contract.connect(officer).mintOfficerEdition("SpecialOfficer");
    const tokenId = await contract.tokenOfOwnerByIndex(officer.address, 0);
    expect(await contract.roles(tokenId)).to.equal("Officer");
  });

  it("should allow officer to mint recovery token", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const oldTokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    await contract.connect(owner).invalidateToken(oldTokenId);
    await contract.connect(officer).mintRecoveryToken(user2.address, oldTokenId, "Member");
    const newTokenId = await contract.tokenOfOwnerByIndex(user2.address, 0);
    expect(await contract.roles(newTokenId)).to.equal("Member");
  });

  it("should support Observer, Alumni, Collector, and ArtDrop roles", async () => {
    await contract.connect(user1).mintToken("Observer", 0, false);
    expect(await contract.roles(1)).to.equal("Observer");
    await contract.connect(user2).mintToken("Alumni", parseEther("0.005"), false, { value: parseEther("0.005") });
    expect(await contract.roles(2)).to.equal("Alumni");
    await contract.connect(user1).mintToken("Collector", parseEther("0.005"), false, { value: parseEther("0.005") });
    expect(await contract.roles(3)).to.equal("Collector");
    await contract.connect(owner).mintToken("ArtDrop", parseEther("0.03"), false, { value: parseEther("0.03") });
    expect(await contract.roles(4)).to.equal("ArtDrop");
  });

  it("should enforce soulbound for Member and Officer, allow transfer for Observer", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    await contract.connect(owner).setSoulbound(1, true);
    await expect(contract.connect(user1).transferFrom(user1.address, user2.address, 1)).to.be.revertedWith("Transfers are restricted for soulbound tokens");
    await contract.connect(user2).mintToken("Observer", 0, false);
    await contract.connect(user2).transferFrom(user2.address, user1.address, 2);
    expect(await contract.ownerOf(2)).to.equal(user1.address);
  });

  it("should return correct voting power for each role", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    await contract.connect(user2).mintToken("Officer", 0, false);
    await contract.connect(user1).mintToken("Observer", 0, false);
    await contract.connect(user2).mintToken("Alumni", parseEther("0.005"), false, { value: parseEther("0.005") });
    expect((await contract.getVotingWeight(1)).toString()).to.equal("1");
    expect((await contract.getVotingWeight(2)).toString()).to.equal("3");
    expect((await contract.getVotingWeight(3)).toString()).to.equal("0");
    expect((await contract.getVotingWeight(4)).toString()).to.equal("0");
  });

  it("should allow setting and reading role and voting power", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    await contract.setRole(tokenId, "Officer");
    expect((await contract.getVotingWeight(tokenId)).toString()).to.equal("3");
    await contract.setRole(tokenId, "Member");
    expect((await contract.getVotingWeight(tokenId)).toString()).to.equal("1");
  });

  it("should enforce soulbound and expiry restrictions", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    await contract.setSoulbound(tokenId, true);
    await expect(contract.connect(user1).transferFrom(user1.address, user2.address, tokenId)).to.be.revertedWith("Transfers are restricted for soulbound tokens");
    await contract.setSoulbound(tokenId, false);
    await contract.connect(user1).transferFrom(user1.address, user2.address, tokenId);
    expect(await contract.ownerOf(tokenId)).to.equal(user2.address);
    const now = Math.floor(Date.now() / 1000);
    await contract.setTokenExpiry(tokenId, now - 1000);
    await expect(contract.connect(user2).transferWithExpiryCheck(owner.address, tokenId)).to.be.revertedWith("Token is expired");
  });

  it("should enforce whitelist for minting", async () => {
    await contract.setWhitelist(user2.address, false);
    await expect(contract.connect(user2).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") })).to.be.revertedWith("You are not whitelisted");
  });

  it("should mint and check all token types", async () => {
    await contract.connect(user1).mintToken("Observer", 0, false);
    expect((await contract.balanceOf(user1.address)).toString()).to.equal("1");
    let tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    expect(await contract.roles(tokenId)).to.equal("Observer");
    await contract.connect(user2).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    tokenId = await contract.tokenOfOwnerByIndex(user2.address, 0);
    expect(await contract.roles(tokenId)).to.equal("Member");
    await contract.setWhitelist(user1.address, true);
    await contract.connect(user1).mintToken("Supporter", parseEther("0.02"), false, { value: parseEther("0.02") });
    tokenId = await contract.tokenOfOwnerByIndex(user1.address, 1);
    expect(await contract.roles(tokenId)).to.equal("Supporter");
  });

  it("should return correct snapshot metadata and tokenURI", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    const [votingPower, role] = await contract.getSnapshotMetadata(tokenId);
    expect(votingPower.toString()).to.equal("1");
    expect(role).to.equal("Member");
    const uri = await contract.tokenURI(tokenId);
    expect(uri).to.be.a("string");
  });

  it("should block minting and transfers when paused", async () => {
    await contract.pause();
    expect(await contract.paused()).to.equal(true);
    await expect(contract.connect(user1).mintToken("Member", await contract.tokenPrice(), true, { value: await contract.tokenPrice() })).to.be.revertedWith("Pausable: paused");
    await contract.unpause();
    await contract.connect(user1).mintToken("Member", await contract.tokenPrice(), true, { value: await contract.tokenPrice() });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    await contract.pause();
    expect(await contract.paused()).to.equal(true);
    await expect(contract.connect(user1).transferFrom(user1.address, user2.address, tokenId)).to.be.revertedWith("Pausable: paused");
    await contract.unpause();
  });

  it("should allow owner to burn non-soulbound tokens only", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    // Try to burn as a non-owner (user2)
    await expect(contract.connect(user2).burn(tokenId)).to.be.revertedWith("You are not the owner of this token");
    await contract.setSoulbound(tokenId, true);
    await expect(contract.connect(user1).burn(tokenId)).to.be.revertedWith("Soulbound tokens cannot be burned");
    await contract.setSoulbound(tokenId, false);
    await contract.connect(user1).burn(tokenId);
    await expect(contract.ownerOf(tokenId)).to.be.reverted;
  });

  it("should allow owner to withdraw contract balance", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    const tx = await contract.withdraw();
    await tx.wait();
    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    expect(ownerBalanceAfter).to.be.gte(ownerBalanceBefore);
  });

  it("should allow batch whitelist and enforce it", async () => {
    await contract.setBatchWhitelist([user1.address, user2.address], false);
    await expect(contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") })).to.be.revertedWith("You are not whitelisted");
    await contract.setBatchWhitelist([user1.address], true);
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
  });

  it("should revert if officer tries to mint recovery for non-invalidated token", async () => {
    await contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    await expect(contract.connect(officer).mintRecoveryToken(user2.address, tokenId, "Member")).to.be.reverted;
  });

  it("should revert if non-officer tries to mint officer edition", async () => {
    await contract.setEditionWhitelist("SpecialOfficer", true);
    await expect(contract.connect(user1).mintOfficerEdition("SpecialOfficer")).to.be.reverted;
  });

  it("should revert if minting with insufficient payment", async () => {
    const requiredPrice = await contract.tokenPrice();
    const insufficient = requiredPrice - 1n;
    await expect(contract.connect(user1).mintToken("Member", requiredPrice, true, { value: insufficient })).to.be.revertedWith("Insufficient payment");
  });

  it("should revert when setting role for non-existent token", async () => {
    await expect(contract.setRole(9999, "Officer")).to.be.revertedWith("Token does not exist");
  });

  it("should emit MembershipMinted event on mint", async () => {
    await expect(contract.connect(user1).mintToken("Member", parseEther("0.01"), true, { value: parseEther("0.01") }))
      .to.emit(contract, "MembershipMinted");
  });
});
