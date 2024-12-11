let web3;
let rouletteContract;
let userAccount;
let selectedBet = null;
let totalSpinDistance = 0;

const abi = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "player",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "betColor",
                type: "uint8",
            },
        ],
        name: "BetPlaced",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "player",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint8",
                name: "winningColor",
                type: "uint8",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "prize",
                type: "uint256",
            },
        ],
        name: "BetResult",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "FeeTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "PrizeTransferred",
        type: "event",
    },
    {
        inputs: [],
        name: "feePercentage",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "betColor",
                type: "uint8",
            },
        ],
        name: "placeBet",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];

const contractAddress = "0x340E36089d1DD8c87E83e4e6FE4F9760F5d8d6bF";

async function init() {
    if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);

        try {
            await ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            rouletteContract = new web3.eth.Contract(abi, contractAddress);

            console.log("Connected account:", userAccount);
            updateCasinoBalance();
        } catch (error) {
            console.error("User denied account access:", error);
        }
    } else {
        alert("Please install MetaMask.");
    }
}

async function updateCasinoBalance() {
    try {
        const ownerAddress = "0xe01569b111125127d57cbE782da08844C6456B49"; // Casino address
        const balance = await web3.eth.getBalance(ownerAddress);
        document.getElementById(
            "contract-balance"
        ).textContent = `Casino Balance: ${web3.utils.fromWei(
            balance,
            "ether"
        )} ETH`;
    } catch (error) {
        console.error("Error fetching casino balance:", error);
    }
}

async function placeBet() {
    const betAmount = document.getElementById("bet-amount").value;
    const betColor =
        selectedBet === "red" ? 1 : selectedBet === "black" ? 2 : 0; // Map colors to numbers: Green=0, Red=1, Black=2

    if (!selectedBet) {
        alert("Please select a color to bet on.");
        return;
    }

    if (!betAmount || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    try {
        const casinoAddress = "0xe01569b111125127d57cbE782da08844C6456B49"; // Casino address

        // Send the bet amount to the casino wallet
        const transaction = await web3.eth.sendTransaction({
            from: userAccount,
            to: casinoAddress,
            value: web3.utils.toWei(betAmount, "ether"),
        });

        console.log("Bet sent to casino:", transaction);

        // Update balances after the transaction is completed
        await updateUserInfo();
        await updateCasinoBalance();

        // Spin the wheel and calculate the result
        spinWheel().then(async ({ winningNumber, winningColor }) => {
            let prize = 0;

            if (betColor === winningColor) {
                if (betColor === 0) {
                    prize = betAmount * 14; // Green payout
                } else {
                    prize = betAmount * 2; // Red/Black payout
                }

                alert(`Congratulations! You won ${prize} ETH!`);

                // Send the prize back to the user
                await web3.eth.sendTransaction({
                    from: casinoAddress,
                    to: userAccount,
                    value: web3.utils.toWei(prize.toString(), "ether"),
                });

                // Update balances after prize payout
                await updateUserInfo();
                await updateCasinoBalance();
            } else {
                alert("Better luck next time!");
            }
        });
    } catch (error) {
        console.error("Error placing bet:", error);
        alert("Transaction failed. Please try again.");
    }
}

function calculateColor(number) {
    if (number === 0) return 0; // Green
    if (number >= 1 && number <= 7) return 1; // Red
    return 2; // Black
}

function spinWheel() {
    return new Promise((resolve) => {
        const spinner = document.getElementById("spinner");
        const segments = Array.from(document.querySelectorAll(".segment"));
        const winningNumber = Math.floor(Math.random() * 15); // Random number between 0-14

        const segmentWidth = 150; // Width of each segment
        const randomOffset = Math.floor(Math.random() * segmentWidth);
        const spinDistance =
            150 * 14 + segmentWidth * winningNumber + randomOffset;

        totalSpinDistance += spinDistance;
        spinner.style.transition = "transform 4s ease-in-out";
        spinner.style.transform = `translateX(-${totalSpinDistance}px)`;

        setTimeout(() => {
            const resultIndex = Math.floor(
                (totalSpinDistance % (segmentWidth * segments.length)) /
                    segmentWidth
            );

            // Get the winning segment from the DOM
            const winningSegment = segments[resultIndex];
            const winningColorClass = winningSegment.className
                .split(" ")
                .find((cls) => ["red", "black", "green"].includes(cls));

            // Extract the winning number and determine the color
            const winningNumber = parseInt(winningSegment.textContent, 10);
            const winningColor =
                winningColorClass === "green"
                    ? 0
                    : winningColorClass === "red"
                    ? 1
                    : 2;

            // Highlight the winning segment
            segments.forEach((segment) =>
                segment.classList.remove("highlight")
            );
            winningSegment.classList.add("highlight");

            // Update the UI with the winning number and resolve the promise
            document.getElementById(
                "result"
            ).textContent = `Result: ${winningNumber}`;
            resolve({ winningNumber, winningColor });
        }, 5000); // Match spin animation duration
    });
}

// Ensure previous highlights are removed
function resetSpinnerHighlights() {
    const segments = document.querySelectorAll(".segment");
    segments.forEach((segment) => segment.classList.remove("highlight"));
}

// Hook into the spin button to reset highlights
document
    .getElementById("spin-button")
    .addEventListener("click", resetSpinnerHighlights);

document.addEventListener("DOMContentLoaded", () => {
    const betAmountInput = document.getElementById("bet-amount");
    const spinButton = document.getElementById("spin-button");
    const betButtons = document.querySelectorAll(".bet-button");
    const betSelectionText = document.getElementById("bet-selection");

    const segments = Array.from({ length: 15 }, (_, i) => {
        if (i === 0) return { name: "0", className: "green" };
        return {
            name: `${i}`,
            className: i % 2 === 0 ? "red" : "black",
        };
    });

    function createSegments() {
        const spinner = document.getElementById("spinner");
        const repeatCount = 1000;
        for (let i = 0; i < repeatCount; i++) {
            segments.forEach((segment) => {
                const div = document.createElement("div");
                div.className = `segment ${segment.className}`;
                div.textContent = segment.name;
                spinner.appendChild(div);
            });
        }
    }
    createSegments();

    function updateSpinButtonState() {
        const betAmount = parseFloat(betAmountInput.value);
        spinButton.disabled = !selectedBet || !betAmount || betAmount <= 0;
    }

    betButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const classes = Array.from(button.classList);
            if (classes.includes("red")) selectedBet = "red";
            else if (classes.includes("green")) selectedBet = "green";
            else if (classes.includes("black")) selectedBet = "black";

            betSelectionText.textContent =
                selectedBet.charAt(0).toUpperCase() + selectedBet.slice(1);
            updateSpinButtonState();
        });
    });

    betAmountInput.addEventListener("input", updateSpinButtonState);

    spinButton.addEventListener("click", async () => {
        await placeBet();
    });
});

window.addEventListener("load", init);

// Additional buttons

function setupBetAdjustments() {
    const betAmountInput = document.getElementById("bet-amount");
    const buttons = document.querySelectorAll(".bet-buttons button");

    buttons.forEach((button) => {
        button.addEventListener("click", async () => {
            const adjust = button.getAttribute("data-adjust");
            let currentBet = parseFloat(betAmountInput.value) || 0;

            if (adjust === "clear") {
                betAmountInput.value = "";
            } else if (adjust === "half") {
                betAmountInput.value = (currentBet / 2).toFixed(2);
            } else if (adjust === "double") {
                betAmountInput.value = (currentBet * 2).toFixed(2);
            } else if (adjust === "max") {
                // Fetch the user's current balance and set it as the maximum bet
                const balance = await web3.eth.getBalance(userAccount);
                const maxBet = parseFloat(
                    web3.utils.fromWei(balance, "ether")
                ).toFixed(2);
                betAmountInput.value = maxBet; // Set the max balance as the bet amount
            } else {
                betAmountInput.value = (
                    currentBet + parseFloat(adjust)
                ).toFixed(2);
            }

            // Update spin button state
            const spinButton = document.getElementById("spin-button");
            spinButton.disabled =
                !betAmountInput.value || parseFloat(betAmountInput.value) <= 0;
        });
    });
}

async function updateUserInfo() {
    try {
        const accounts = await web3.eth.getAccounts();
        userAccount = accounts[0]; // Save user account globally
        const balance = await web3.eth.getBalance(userAccount);
        const formattedBalance = parseFloat(
            web3.utils.fromWei(balance, "ether")
        ).toFixed(2); // Round to 2 decimal places

        document.getElementById(
            "user-info"
        ).textContent = `User: ${userAccount}`;
        document.getElementById(
            "user-balance"
        ).textContent = `Balance: ${formattedBalance} ETH`;
    } catch (error) {
        console.error("Error updating user info:", error);
    }
}

async function updateCasinoBalance() {
    try {
        const ownerAddress = "0xe01569b111125127d57cbE782da08844C6456B49"; // Casino address
        const balance = await web3.eth.getBalance(ownerAddress);
        const formattedBalance = parseFloat(
            web3.utils.fromWei(balance, "ether")
        ).toFixed(2); // Round to 2 decimal places
        document.getElementById(
            "contract-balance"
        ).textContent = `Casino Balance: ${formattedBalance} ETH`;
    } catch (error) {
        console.error("Error fetching casino balance:", error);
    }
}

async function updateBalancesAfterSpin() {
    await updateUserInfo();
    await updateCasinoBalance();
}

window.addEventListener("load", async () => {
    await init(); // Initialize web3 and contract
    updateUserInfo();
    setupBetAdjustments();
});
