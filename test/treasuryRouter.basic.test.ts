import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
import { parseEther } from "ethers";
import { TreasuryRouter } from "../typechain-types";
import { ethers } from "hardhat";

describe("TreasuryRouter", function () {
  let treasuryRouter: TreasuryRouter;
  let admin: any, officer: any, treasury: any, user: any;

  beforeEach(async () => {
    [admin, officer, treasury, user] = await ethers.getSigners();

    // Use admin.address as a dummy roles address
    const dummyRolesAddress = admin.address;

    // Deploy treasury
    const TreasuryRouter = await ethers.getContractFactory("TreasuryRouter");
    treasuryRouter = await TreasuryRouter.deploy() as TreasuryRouter;
    await treasuryRouter.initialize(dummyRolesAddress, treasury.address);
  });

  it("should receive and queue funds", async () => {
    await treasuryRouter.connect(user).receiveFunds({ value: parseEther("1") });
    const ids = await treasuryRouter.pendingTransferIds();
    expect(ids.length).to.be.greaterThan(0);
  });

  it("should execute transfers after delay", async () => {
    const amount = parseEther("1");
    await treasuryRouter.connect(user).receiveFunds({ value: amount });
    const ids = await treasuryRouter.pendingTransferIds();
    const id = ids[0];
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

  // You can re-enable ERC20/NFT tests if you want, or keep them commented for now
});
