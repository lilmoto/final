import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVendingMachine: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts(); // Берём аккаунт владельца

  console.log("Deployer Address:", deployer);

  const initialSupply = 1000000n; // Используем BigInt для безопасности

  // Деплой контракта с передачей deployer как владельца
  await deploy("TokenVendingMachine", {
    from: deployer,
    args: [initialSupply],
    log: true,
  });

  const vendingMachine = await ethers.getContract("TokenVendingMachine", deployer);

  // Пополняем автомат токенами от владельца
  const refillTx = await vendingMachine.refill(500000n);
  await refillTx.wait();

  console.log(`✅ Contract deployed by: ${deployer}`);
  console.log(`✅ Vending machine refilled with 500,000 tokens`);
};

export default deployVendingMachine;
deployVendingMachine.tags = ["VendingMachine"];
