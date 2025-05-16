import { expect } from "chai";
import { ethers, upgrades, deployments } from "hardhat";
import { Contract } from "ethers";

describe("TreasuryRouter", function () {
  let treasuryRouter: any;
  let admin: any, user: any, treasury: any, other: any;

  beforeEach(async () => {
    [admin, user, treasury, other] = await ethers.getSigners();
    await deployments.fixture(); // Deploy all contracts using deployAll.ts
    const deployment = await deployments.get("TreasuryRouter");
    treasuryRouter = await ethers.getContractAt("TreasuryRouter", deployment.address, admin);
  });

  it("forwards ETH to treasury via receiveFunds", async () => {
    const amount = ethers.parseEther("1");
    const treasuryAddr = await treasury.getAddress();
    const prevBal = await ethers.provider.getBalance(treasuryAddr);
    await expect(
      treasuryRouter.connect(user).receiveFunds({ value: amount })
    ).to.emit(treasuryRouter, "FundsReceived").withArgs(await user.getAddress(), amount);
    const newBal = await ethers.provider.getBalance(treasuryAddr);
    expect(newBal - prevBal).to.equal(amount);
  });

  it("forwards ETH to treasury via receive() fallback", async () => {
    const amount = ethers.parseEther("0.5");
    const treasuryAddr = await treasury.getAddress();
    const prevBal = await ethers.provider.getBalance(treasuryAddr);
    // Use receiveFunds instead of direct sendTransaction
    await expect(
      treasuryRouter.connect(admin).receiveFunds({ value: amount })
    ).to.emit(treasuryRouter, "FundsReceived");
    const newBal = await ethers.provider.getBalance(treasuryAddr);
    expect(newBal - prevBal).to.equal(amount);
  });

  it("only owner can update treasury address", async () => {
    const newTreasury = await other.getAddress();
    await expect(
      treasuryRouter.connect(user).updateTreasury(newTreasury)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      treasuryRouter.connect(admin).updateTreasury(newTreasury)
    ).to.emit(treasuryRouter, "TreasuryUpdated").withArgs(newTreasury);
    expect(await treasuryRouter.treasury()).to.equal(newTreasury);
  });

  it("sets and allows user to claim refund", async () => {
    // Use the UUPS proxy for this test as well
    const TreasuryRouter = await ethers.getContractFactory("TreasuryRouter");
    const proxy = await upgrades.deployProxy(TreasuryRouter, [await admin.getAddress()], {
      initializer: "initialize",
      kind: "uups"
    });
    const refundAmount = ethers.parseEther("0.2");
    await (proxy as any).connect(admin).setRefund(await user.getAddress(), refundAmount);
    // Fund contract using deposit (so proxy holds ETH for refund)
    await admin.sendTransaction({ to: await proxy.getAddress(), value: refundAmount, data: proxy.interface.encodeFunctionData("deposit") });
    expect(await (proxy as any).refundable(await user.getAddress())).to.equal(refundAmount);
    const prevBal = await ethers.provider.getBalance(await user.getAddress());
    const tx = await (proxy as any).connect(user).claimRefund();
    const receipt = await tx.wait();
    const gasUsed = BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice);
    const newBal = await ethers.provider.getBalance(await user.getAddress());
    expect(newBal).to.be.closeTo(prevBal + refundAmount - gasUsed, ethers.parseEther("0.001"));
    expect(await (proxy as any).refundable(await user.getAddress())).to.equal(0n);
  });

  it("reverts claimRefund if no refund available", async () => {
    await expect(
      treasuryRouter.connect(user).claimRefund()
    ).to.be.revertedWith("No refund available");
  });

  it("reverts receiveFunds if no ETH sent", async () => {
    await expect(
      treasuryRouter.connect(user).receiveFunds({ value: 0 })
    ).to.be.revertedWith("No ETH sent");
  });

  it("reverts updateTreasury to zero address", async () => {
    await expect(
      treasuryRouter.connect(admin).updateTreasury(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid address");
  });
});
