// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Roulette {
    address public owner;
    uint256 public feePercentage = 2; // Fee percentage taken from each bet

    // Events
    event BetPlaced(address indexed player, uint256 amount, uint8 betColor);
    event BetResult(address indexed player, uint8 winningColor, uint256 prize);
    event FeeTransferred(address indexed to, uint256 amount);
    event PrizeTransferred(address indexed to, uint256 amount);

    // Constructor
    constructor() {
        owner = 0xe01569b111125127d57cbE782da08844C6456B49; // Set casino account as owner
    }

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner!");
        _;
    }

    // Place a bet on Green (0), Red (1), or Black (2)
    function placeBet(uint8 betColor) public payable {
        require(betColor == 0 || betColor == 1 || betColor == 2, "Invalid color!");
        require(msg.value > 0, "You need to bet some ETH!");

        // Calculate the fee
        uint256 fee = (msg.value * feePercentage) / 100;
        uint256 netBetAmount = msg.value - fee;

        // Transfer fee directly to the casino owner
        payable(owner).transfer(fee);
        emit FeeTransferred(owner, fee);

        // Determine winning number and color
        uint8 winningNumber = random() % 15;
        uint8 winningColor = calculateColor(winningNumber);

        uint256 prize = 0;

        // Determine prize amount
        if (betColor == winningColor) {
            if (betColor == 0) {
                prize = netBetAmount * 14; // Green payout: 14x
            } else {
                prize = netBetAmount * 2; // Red/Black payout: 2x
            }

            // Send prize directly to the player
            payable(msg.sender).transfer(prize);
            emit PrizeTransferred(msg.sender, prize);
        }

        emit BetPlaced(msg.sender, msg.value, betColor);
        emit BetResult(msg.sender, winningColor, prize);
    }

    // Generate a pseudo-random number
    function random() private view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, blockhash(block.number - 1), msg.sender))) % 15);
    }

    // Determine color based on number
    function calculateColor(uint8 number) private pure returns (uint8) {
        if (number == 0) return 0; // Green
        if (number >= 1 && number <= 7) return 1; // Red
        return 2; // Black
    }
}
