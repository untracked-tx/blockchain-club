import hre from "hardhat";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { parseEther } from "ethers";

const { ethers } = hre;

describe("TreasuryRouter", function () {
  let treasuryRouter, roles;
  let admin, officer, treasury, user;

  beforeEach(async () => {
    [admin, officer, treasury, user] = await ethers.getSigners();

    // Deploy roles contract
    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy();
    await roles.initialize(admin.address);
    await roles.connect(admin).grantRole(await roles.ADMIN_ROLE(), admin.address);

    // Deploy treasury
    const TreasuryRouter = await ethers.getContractFactory("TreasuryRouter");
    treasuryRouter = await TreasuryRouter.deploy();
    await treasuryRouter.initialize(roles.address, treasury.address);
  });

  it("should receive and queue funds", async () => {
    await treasuryRouter.connect(user).receiveFunds({ value: parseEther("1") });

    const ids = await treasuryRouter.pendingTransferIds();
    expect(ids.length).to.be.greaterThan(0);
  });

  it("should execute transfers after delay", async () => {
    const amount = parseEther("1");
    await treasuryRouter.connect(user).receiveFunds({ value: amount });

    const id = await treasuryRouter.pendingTransferIds(0);

    // fast-forward time
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 + 1]);
    await ethers.provider.send("evm_mine");

    const initialTreasuryBalance = await ethers.provider.getBalance(treasury.address);

    await treasuryRouter.executeTransferBatch([id]);

    const newBalance = await ethers.provider.getBalance(treasury.address);
    expect(newBalance - initialTreasuryBalance).to.equal(amount);
  });

  it("should allow emergency withdraw", async () => {
    const amount = parseEther("1");
    await treasuryRouter.connect(user).receiveFunds({ value: amount });

    const initialAdminBalance = await ethers.provider.getBalance(admin.address);

    await treasuryRouter.connect(admin).emergencyWithdraw();

    const newBalance = await ethers.provider.getBalance(admin.address);
    expect(newBalance).to.be.above(initialAdminBalance);
  });
});
