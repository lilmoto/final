"use client";

import { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { hardhat } from "viem/chains";

// Клиенты
const walletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

// Адрес контракта
const CONTRACT_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

// ABI контракта
const abi = parseAbi([
  "function buyTokens() external payable",
  "function transferTokens(address to, uint256 amount) external",
  "function balanceOf(address owner) external view returns (uint256)",
]);

export default function VendingMachine() {
  const [address, setAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [balance, setBalance] = useState("0");
  const [status, setStatus] = useState("");

  // 🟢 Получение баланса
  async function getBalance() {
    try {
      if (!address) {
        setStatus("Address is required to fetch balance");
        return;
      }

      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "balanceOf",
        args: [address],
      });

      setBalance(result.toString());
      setStatus("Balance updated successfully");
    } catch (error) {
      console.error("Error fetching balance:", error);
      setStatus("Failed to fetch balance");
    }
  }

  // 🟢 Покупка токенов
  async function buyTokens() {
    try {
      if (!ethAmount) {
        setStatus("Enter ETH amount to buy tokens");
        return;
      }

      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "buyTokens",
        account: address,
        value: BigInt(ethAmount) * 10n ** 18n,
      });

      setStatus("Tokens purchased successfully!");
      getBalance();
    } catch (error) {
      console.error("Error buying tokens:", error);
      setStatus("Failed to buy tokens");
    }
  }

  // 🟢 Перевод токенов
  async function transferTokens() {
    try {
      if (!recipient || !amount) {
        setStatus("Recipient and amount are required");
        return;
      }

      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "transferTokens",
        account: address,
        args: [recipient, BigInt(amount)],
      });

      setStatus("Tokens transferred successfully!");
      getBalance();
    } catch (error) {
      console.error("Error transferring tokens:", error);
      setStatus("Failed to transfer tokens");
    }
  }

  useEffect(() => {
    if (address) {
      getBalance();
    }
  }, [address]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">🛒 Token Vending Machine</h1>

      {/* Ввод адреса */}
      <div>
        <h2 className="text-lg font-semibold">🔍 Address</h2>
        <input
          type="text"
          placeholder="Your Address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="border px-4 py-2 w-full"
        />
        <button onClick={getBalance} className="bg-blue-500 px-4 py-2 mt-2 text-white">
          Get Balance
        </button>
        <p>💼 Balance: {balance} VMT</p>
      </div>

      {/* Покупка токенов */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">💵 Buy Tokens</h2>
        <input
          type="text"
          placeholder="ETH Amount"
          value={ethAmount}
          onChange={e => setEthAmount(e.target.value)}
          className="border px-4 py-2 w-full"
        />
        <button onClick={buyTokens} className="bg-green-500 px-4 py-2 mt-2 text-white">
          Buy Tokens
        </button>
      </div>
      {/* Перевод токенов */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">🔄 Transfer Tokens</h2>
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          className="border px-4 py-2 w-full"
        />
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border px-4 py-2 w-full mt-2"
        />
        <button onClick={transferTokens} className="bg-yellow-500 px-4 py-2 mt-2 text-white">
          Transfer Tokens
        </button>
      </div>

      {/* Статус операций */}
      <p className="mt-4 text-red-500">{status}</p>
    </div>
  );
}
