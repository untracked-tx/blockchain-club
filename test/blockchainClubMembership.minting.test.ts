import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";

const { ethers, upgrades } = hre;

describe("BlockchainClubMembership", function () {
  let membership, roles;
  let admin, officer, user;

  beforeEach(async () => {
    [admin, officer, user] = await ethers.getSigners();
    // Deploy Roles contract as proxy
    const Roles = await ethers.getContractFactory("Roles", admin);
    roles = await upgrades.deployProxy(Roles, [admin.address], { initializer: "initialize", kind: "uups" });
    await roles.waitForDeployment();
    await roles.grantRole(await roles.OFFICER_ROLE(), officer.address);
    // Deploy Membership contract as proxy
    const Membership = await ethers.getContractFactory("BlockchainClubMembership", admin);
    membership = await upgrades.deployProxy(Membership, ["Blockchain Club", "BCM", roles.target], { initializer: "initialize", kind: "uups" });
    await membership.waitForDeployment();
  });

  it("should create a token type", async () => {
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("Gold Membership"));
    await membership.connect(officer).createTokenType(
      typeId, "Gold Membership", "Gold", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1 // 1 = WHITELIST
    );
    const typeIds = await membership.getAllTokenTypeIds();
    const config = await membership.tokenTypeConfigs(typeIds[0]);
    expect(config.name).to.equal("Gold Membership");
  });

  it("should allow minting to whitelisted user", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("Gold Membership"));
    await membership.connect(officer).createTokenType(
      typeId, "Gold Membership", "Gold", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1 // 1 = WHITELIST
    );

    // Mint
    await membership.connect(officer).mint(user.address, typeId, false);
    expect(await membership.ownerOf(0)).to.equal(user.address);
  });

  it("should enforce soulbound transfer restriction", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("Gold Membership"));
    await membership.connect(officer).createTokenType(
      typeId, "Gold Membership", "Gold", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1 // 1 = WHITELIST
    );
    await membership.connect(officer).mint(user.address, typeId, true);
    await expect(
      membership.connect(user).transferFrom(user.address, user.address, 0)
    ).to.be.revertedWith("Token is soulbound");
  });

  it("should pause and unpause correctly", async () => {
    await membership.connect(admin).pause();
    expect(await membership.paused()).to.be.true;

    await membership.connect(admin).unpause();
    expect(await membership.paused()).to.be.false;
  });

  it("should allow public mint if mintAccess is PUBLIC", async () => {
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("PublicType"));
    await membership.connect(officer).createTokenType(
      typeId, "PublicType", "General", 0, 9999999999, 100, 2 // MintAccess.PUBLIC
    );
    await expect(membership.connect(user).publicMint(typeId, false))
      .to.emit(membership, "TokenMinted");
  });

  it("should grant MEMBER_ROLE on mint if whitelisted and member token", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    // Create member token type
    const typeId = await membership.MEMBER_TOKEN_TYPE();
    await membership.connect(officer).createTokenType(
      typeId, "Member", "General", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1 // 1 = WHITELIST
    );
    // Mint member token
    await membership.connect(officer).mint(user.address, typeId, false);
    // User should have MEMBER_ROLE
    expect(await roles.hasRole(await roles.MEMBER_ROLE(), user.address)).to.be.true;
  });

  it("should not grant MEMBER_ROLE if not whitelisted", async () => {
    // Create member token type
    const typeId = await membership.MEMBER_TOKEN_TYPE();
    await membership.connect(officer).createTokenType(
      typeId, "Member", "General", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1 // 1 = WHITELIST
    );
    // Mint member token (should revert)
    await expect(
      membership.connect(officer).mint(user.address, typeId, false)
    ).to.be.revertedWith("Address not whitelisted");
  });

  it("should set isActive to false after burning last token", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("Gold Membership"));
    await membership.connect(officer).createTokenType(
      typeId, "Gold Membership", "Gold", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1
    );
    await membership.connect(officer).mint(user.address, typeId, false);
    // Burn the token
    await membership.connect(officer).burnToken(0);
    const stats = await membership.memberStats(user.address);
    expect(stats.isActive).to.be.false;
    expect(stats.tokenCount).to.equal(0);
  });

  it("should not mint if token type is not active", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("InactiveType"));
    await membership.connect(officer).createTokenType(
      typeId, "InactiveType", "General", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1
    );
    // Deactivate token type
    await membership.connect(officer).deactivateTokenType(typeId);
    await expect(
      membership.connect(officer).mint(user.address, typeId, false)
    ).to.be.revertedWith("Token type not active");
  });

  it("should not mint if max supply reached", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("LimitedType"));
    await membership.connect(officer).createTokenType(
      typeId, "LimitedType", "General", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 1, 1
    );
    await membership.connect(officer).mint(user.address, typeId, false);
    await expect(
      membership.connect(officer).mint(user.address, typeId, false)
    ).to.be.revertedWith("Max supply reached");
  });

  it("should not mint if before startTime or after endTime", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("TimeType"));
    const now = Math.floor(Date.now() / 1000);
    await membership.connect(officer).createTokenType(
      typeId, "TimeType", "General", now + 1000, now + 2000, 10, 1
    );
    await expect(
      membership.connect(officer).mint(user.address, typeId, false)
    ).to.be.revertedWith("Minting not started for this token type");
  });

  it("should not allow minting more than one of the same token type per user", async () => {
    await membership.connect(officer).updateWhitelist(user.address, true);
    const typeId = ethers.keccak256(ethers.toUtf8Bytes("UniqueType"));
    await membership.connect(officer).createTokenType(
      typeId, "UniqueType", "Special", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1
    );
    // First mint should succeed
    await membership.connect(officer).mint(user.address, typeId, false);
    // Second mint of the same type should fail
    await expect(
      membership.connect(officer).mint(user.address, typeId, false)
    ).to.be.revertedWith("Wallet already owns a token of this type");
    // Mint a different type should succeed
    const typeId2 = ethers.keccak256(ethers.toUtf8Bytes("AnotherType"));
    await membership.connect(officer).createTokenType(
      typeId2, "AnotherType", "Special", Math.floor(Date.now() / 1000) - 1000, Math.floor(Date.now() / 1000) + 1000, 10, 1
    );
    await membership.connect(officer).mint(user.address, typeId2, false);
  });
});
