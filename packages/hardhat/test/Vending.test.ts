import { expect } from "chai";
import { ethers } from "hardhat";

describe("TokenVendingMachine", function () {
  let vendingMachine: any;
  let owner: any;
  let addr1: any;
  let addr2: any;
  const initialSupply: number = 1000000;

  beforeEach(async function () {
    // Получаем аккаунты
    [owner, addr1, addr2] = await ethers.getSigners();

    // Разворачиваем контракт
    const VendingMachine = await ethers.getContractFactory("TokenVendingMachine");
    vendingMachine = await VendingMachine.deploy(initialSupply);
    await vendingMachine.waitForDeployment();
  });

  it("Should deploy with initial token supply to owner", async function () {
    const ownerBalance = await vendingMachine.balanceOf(owner.address);
    expect(ownerBalance).to.equal(initialSupply * 10 ** 18);
  });

  it("Should allow owner to refill the vending machine", async function () {
    await vendingMachine.refill(100000);
    const vendingMachineBalance = await vendingMachine.balanceOf(vendingMachine.target);
    expect(vendingMachineBalance).to.equal(100000);
  });

  it("Should allow users to buy tokens with ETH", async function () {
    await vendingMachine.refill(100000);

    await vendingMachine.connect(addr1).buyTokens({ value: ethers.parseEther("0.1") });
    const addr1Balance = await vendingMachine.balanceOf(addr1.address);
    expect(addr1Balance).to.be.greaterThan(0);
  });

  it("Should not allow buying tokens if vending machine is empty", async function () {
    await expect(vendingMachine.connect(addr1).buyTokens({ value: ethers.parseEther("0.1") })).to.be.revertedWith(
      "Not enough tokens in the vending machine",
    );
  });

  it("Should allow token transfer between users", async function () {
    await vendingMachine.refill(100000);
    await vendingMachine.connect(addr1).buyTokens({ value: ethers.parseEther("0.1") });

    const addr1BalanceBefore = await vendingMachine.balanceOf(addr1.address);

    await vendingMachine.connect(addr1).transferTokens(addr2.address, 100);
    const addr1BalanceAfter = await vendingMachine.balanceOf(addr1.address);
    const addr2Balance = await vendingMachine.balanceOf(addr2.address);

    expect(addr1BalanceAfter).to.equal(addr1BalanceBefore - 100);
    expect(addr2Balance).to.equal(100);
  });

  it("Should fail to transfer tokens if sender does not have enough balance", async function () {
    await expect(vendingMachine.connect(addr1).transferTokens(addr2.address, 100)).to.be.revertedWith(
      "Insufficient token balance",
    );
  });

  it("Should allow owner to withdraw ETH from the contract", async function () {
    await vendingMachine.refill(100000);
    await vendingMachine.connect(addr1).buyTokens({ value: ethers.parseEther("0.1") });

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    await vendingMachine.withdrawETH();
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

    expect(finalOwnerBalance).to.be.greaterThan(initialOwnerBalance);
  });
});
