const { expect } = require("chai");
const { ethers } = require("ethers");

describe("Sanity check", function () {
  it("can parse ether", function () {
    const val = ethers.parseEther("1.0");
    expect(val.toString()).to.equal("1000000000000000000");
  });
});
