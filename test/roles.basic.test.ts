import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("Roles", function () {
  let roles;
  let admin, officer, member, others;

  beforeEach(async () => {
    [admin, officer, member, ...others] = await ethers.getSigners();
    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy();
    await roles.initialize(admin.address);
  });

  it("should assign ADMIN_ROLE to admin on initialize", async () => {
    expect(await roles.hasRole(await roles.ADMIN_ROLE(), admin.address)).to.be.true;
  });

  it("should grant and revoke OFFICER_ROLE", async () => {
    await roles.connect(admin).grantRole(await roles.OFFICER_ROLE(), officer.address);
    expect(await roles.hasRole(await roles.OFFICER_ROLE(), officer.address)).to.be.true;

    await roles.connect(admin).revokeRole(await roles.OFFICER_ROLE(), officer.address);
    expect(await roles.hasRole(await roles.OFFICER_ROLE(), officer.address)).to.be.false;
  });

  it("should support setting and getting voting power", async () => {
    await roles.connect(admin).setVotingPower(await roles.OFFICER_ROLE(), 10);
    expect(await roles.getVotingPower(officer.address)).to.equal(10);
  });

  it("should grant roles in batch", async () => {
    const addresses = [officer.address, member.address];
    await roles.connect(admin).grantRoleBatch(await roles.MEMBER_ROLE(), addresses);
    expect(await roles.hasRole(await roles.MEMBER_ROLE(), officer.address)).to.be.true;
    expect(await roles.hasRole(await roles.MEMBER_ROLE(), member.address)).to.be.true;
  });
});
