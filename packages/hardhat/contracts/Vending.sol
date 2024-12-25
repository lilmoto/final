// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenVendingMachine {
    string public name = "Vending Machine Token";
    string public symbol = "VMT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public tokenPrice = 1 ether; // Цена за 1 токен

    mapping(address => uint256) public balanceOf;

    event TokensPurchased(address indexed buyer, uint256 amount);
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply; // Изначально все токены у владельца
    }

    // Купить токены за ETH
    function buyTokens() public payable {
        require(msg.value > 0, "Send ETH to buy tokens");
        uint256 amount = (msg.value * (10 ** uint256(decimals))) / tokenPrice;
        require(balanceOf[address(this)] >= amount, "Not enough tokens in the vending machine");

        balanceOf[address(this)] -= amount;
        balanceOf[msg.sender] += amount;

        emit TokensPurchased(msg.sender, amount);
    }

    // Перевести токены другому пользователю
    function transferTokens(address to, uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient token balance");
        require(to != address(0), "Invalid address");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        emit TokensTransferred(msg.sender, to, amount);
    }

    // Владелец может добавить токены в автомат
    function refill(uint256 amount) public {
        require(balanceOf[msg.sender] >= amount, "Insufficient tokens for refill");

        balanceOf[msg.sender] -= amount;
        balanceOf[address(this)] += amount;
    }

    // Владелец может вывести ETH
    function withdrawETH() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}