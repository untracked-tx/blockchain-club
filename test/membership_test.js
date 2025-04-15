const { expect } = require("chai");
const hre = require("hardhat");

describe("BlockchainClubMembership", function () {
  let contract;
  let owner, treasury, user1, user2;
  let tokenPrice;
  const baseURI = "https://example.com/meta/";

  beforeEach(async function () {
    tokenPrice = await import("ethers").then(e => e.parseEther("0.01"));
    [owner, treasury, user1, user2] = await hre.ethers.getSigners();
  
    const Club = await hre.ethers.getContractFactory("BlockchainClubMembership");
    contract = await Club.deploy(baseURI); 
  });
  

  
  it("should mint an NFT when correct payment is sent", async () => {
    await contract.connect(user1).mintMembership({ value: tokenPrice });
    expect(await contract.balanceOf(user1.address)).to.equal(1);
  });

  it("should revert if user tries to mint twice", async () => {
    await contract.connect(user1).mintMembership({ value: tokenPrice });
    await expect(
      contract.connect(user1).mintMembership({ value: tokenPrice })
    ).to.be.revertedWith("Already minted");
  });

  it("should revert if incorrect payment is sent", async () => {
    await expect(
      contract.connect(user1).mintMembership({ value: 0 })
    ).to.be.revertedWith("Incorrect payment");
  });

  it("should allow owner to update a member’s role", async () => {
    await contract.connect(user1).mintMembership({ value: tokenPrice });
    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);
    await contract.connect(owner).updateMemberRole(tokenId, "officer");

    const role = await contract.roles(tokenId);
    expect(role).to.equal("officer");
  });

  it("should block transfers if soulbound is active", async () => {
    await contract.connect(user1).mintMembership( { value: tokenPrice });

    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);

    await expect(
      contract.connect(user1).transferFrom(user1.address, user2.address, tokenId)
    ).to.be.revertedWith("Token is soulbound and cannot be transferred");
  });

  it("should allow transfer if soulbound is disabled", async () => {
    await contract.connect(user1).mintMembership({ value: tokenPrice });

    const tokenId = await contract.tokenOfOwnerByIndex(user1.address, 0);

    await contract.connect(owner).toggleTransferable(true); // Assume this function exists
    await contract.connect(user1).transferFrom(user1.address, user2.address, tokenId);

    expect(await contract.ownerOf(tokenId)).to.equal(user2.address);
  });

  it("should support required interfaces", async () => {
    expect(await contract.supportsInterface("0x80ac58cd")).to.equal(true); // ERC721
    expect(await contract.supportsInterface("0x5b5e139f")).to.equal(true); // ERC721Metadata
  });
});
