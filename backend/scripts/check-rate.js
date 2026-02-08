import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const addresses = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../contract-addresses.json"), "utf8"));
    const converter = await hre.ethers.getContractAt("CurrencyConverter", addresses.CurrencyConverter);
    const usdtAddress = addresses.USDT;
    const rate = await converter.rates(usdtAddress);
    console.log("USDT Rate:", rate.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
