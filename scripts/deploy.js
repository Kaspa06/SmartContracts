const hre = require("hardhat");

async function main() {
    console.log("HRE ETHERS:", hre.ethers); // Debug line to check ethers availability

    const Roulette = await hre.ethers.getContractFactory("Roulette");
    const roulette = await Roulette.deploy();
    await roulette.deployed();

    console.log(`Roulette deployed to: ${roulette.address}`);
}

main().catch((error) => {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
});
