import { expect } from "chai";
import { ethers, upgrades, deployments } from "hardhat";
import { Contract, Signer } from "ethers";

describe("Roles", function () {
  let roles: any;
  let admin: any, officer: any, user: any;

  beforeEach(async () => {
    [admin, officer, user] = await ethers.getSigners();
    await deployments.fixture(); // Deploy all contracts using deployAll.ts
    const deployment = await deployments.get("Roles");
    roles = await ethers.getContractAt("Roles", deployment.address, admin);
  });

  it("should assign DEFAULT_ADMIN_ROLE to deployer", async () => {
    expect(await roles.hasRole(await roles.DEFAULT_ADMIN_ROLE(), await admin.getAddress())).to.be.true;
  });

  it("can whitelist and read back", async () => {
    await roles.connect(admin).grantRole(await roles.OFFICER_ROLE(), await officer.getAddress());
    await roles.connect(officer).setWhitelist(await user.getAddress(), true);
    expect(await roles.isWhitelisted(await user.getAddress())).to.be.true;
  });

  it("should allow self-granting if permitted", async () => {
    const role = await roles.MEMBER_ROLE();

    // Grant OFFICER_ROLE to user
    await roles.connect(admin).grantRole(await roles.OFFICER_ROLE(), user.address);

    // Verify user can self-grant MEMBER_ROLE
    expect(await roles.canSelfGrant(role, user.address)).to.be.true;
    await roles.connect(user).grantRole(role, user.address);
    expect(await roles.hasRole(role, user.address)).to.be.true;
  });
});
