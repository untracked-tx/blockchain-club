import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { Contract } from "ethers";
import { VotingPowerStrategy } from "../typechain-types";

describe("VotingPowerStrategy", function () {
  let strategy: VotingPowerStrategy;
  let admin: any, user: any;

  beforeEach(async () => {
    [admin, user] = await ethers.getSigners();
    await deployments.fixture(); // Deploy all contracts using deployAll.ts
    const deployment = await deployments.get("VotingPowerStrategy");
    strategy = await ethers.getContractAt("VotingPowerStrategy", deployment.address, admin) as VotingPowerStrategy;
  });

  it("should read roles' voting power", async () => {
    // TODO: Implement voting power test
  });
});
