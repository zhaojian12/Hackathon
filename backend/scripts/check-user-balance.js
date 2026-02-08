import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const addresses = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../contract-addresses.json"), "utf8"));
    const axcnh = await hre.ethers.getContractAt("MockERC20", addresses.MockERC20);
    const userAddress = "0x02be54bB54c9DB19A6169f76317d5D2A5e61dF49";

    const balance = await axcnh.balanceOf(userAddress);
    const symbol = await axcnh.symbol();
    console.log(`Balance for ${userAddress} in ${addresses.MockERC20} (${symbol}): ${hre.ethers.formatUnits(balance, 18)}`);

    const usdt = await hre.ethers.getContractAt("MockERC20", addresses.USDT);
    const usdtBalance = await usdt.balanceOf(userAddress);
    console.log(`USDT Balance: ${hre.ethers.formatUnits(usdtBalance, 18)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
