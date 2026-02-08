import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const addresses = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../contract-addresses.json"), "utf8"));
    const userAddress = "0x02be54bB54c9DB19A6169f76317d5D2A5e61dF49";

    // Mint AXCNH
    const axcnh = await hre.ethers.getContractAt("MockERC20", addresses.MockERC20);
    console.log(`Minting 1000 AXCNH to ${userAddress}...`);
    const tx1 = await axcnh.mint(userAddress, hre.ethers.parseUnits("1000", 18));
    await tx1.wait();
    console.log("AXCNH Minted.");

    // Mint USDT
    const usdt = await hre.ethers.getContractAt("MockERC20", addresses.USDT);
    console.log(`Minting 1000 USDT to ${userAddress}...`);
    const tx2 = await usdt.mint(userAddress, hre.ethers.parseUnits("1000", 18));
    await tx2.wait();
    console.log("USDT Minted.");

    console.log("Airdrop complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
