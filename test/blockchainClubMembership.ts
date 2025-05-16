import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { Contract } from "ethers";
import { BlockchainClubMembership, Roles } from "../typechain-types";

describe("BlockchainClubMembership", function () {
  let membership: BlockchainClubMembership;
  let roles: Roles;
  let admin: any, user: any;

  beforeEach(async () => {
    [admin, user] = await ethers.getSigners();
    await deployments.fixture(); // Deploy all contracts using deployAll.ts
    const membershipDeployment = await deployments.get("BlockchainClubMembership");
    const rolesDeployment = await deployments.get("Roles");

    membership = (await ethers.getContractAt(
      "BlockchainClubMembership",
      membershipDeployment.address,
      admin
    )) as BlockchainClubMembership;

    roles = (await ethers.getContractAt(
      "Roles",
      rolesDeployment.address,
      admin
    )) as Roles;
  });

  it("should mint membership token", async () => {
    // TODO: Implement minting test
  });

  it("should enforce role requirements", async () => {
    // TODO: Implement role requirement test
  });

  it("should handle expiry and soulbound behavior", async () => {
    // TODO: Implement expiry and soulbound test
  });

  it("should grant role if missing during mint", async () => {
    const role = "MEMBER_ROLE";
    const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));

    // Ensure user does not have the role initially
    expect(await roles.hasRole(roleHash, user.address)).to.be.false;

    // Mint token
    await membership.connect(user).mint(role, false);

    // Verify role is granted
    expect(await roles.hasRole(roleHash, user.address)).to.be.true;
  });
});
