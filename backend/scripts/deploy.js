import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance));

    // Deploy AXCNH (MockERC20)
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    console.log("Deploying MockERC20 (AXCNH)...");
    const axcnh = await MockERC20.deploy("Asia-Pacific CNY Stable", "AXCNH");
    await axcnh.waitForDeployment();
    const axcnhAddress = await axcnh.getAddress();
    console.log("AXCNH deployed to:", axcnhAddress);

    // Deploy USDT (MockERC20)
    console.log("Deploying MockERC20 (USDT)...");
    const usdt = await MockERC20.deploy("Mock USDT", "USDT");
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();
    console.log("USDT deployed to:", usdtAddress);

    // Deploy USDC (MockERC20)
    console.log("Deploying MockERC20 (USDC)...");
    const usdc = await MockERC20.deploy("Mock USDC", "USDC");
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("USDC deployed to:", usdcAddress);

    // Deploy Escrow
    const Escrow = await hre.ethers.getContractFactory("Escrow");
    console.log("Deploying Escrow...");
    const escrow = await Escrow.deploy(axcnhAddress);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("Escrow deployed to:", escrowAddress);

    // Deploy CurrencyConverter
    const CurrencyConverter = await hre.ethers.getContractFactory("CurrencyConverter");
    console.log("Deploying CurrencyConverter...");
    const converter = await CurrencyConverter.deploy(axcnhAddress);
    await converter.waitForDeployment();
    const converterAddress = await converter.getAddress();
    console.log("CurrencyConverter deployed to:", converterAddress);

    // Set Rates
    console.log("Setting exchange rates...");
    // 1 AXCNH = 4.0 CFX (Simulation)
    await (await converter.setRate(hre.ethers.ZeroAddress, hre.ethers.parseUnits("4.0", 18))).wait();
    // 1 AXCNH = 0.14 USDT (~7.2 CNY/USD)
    await (await converter.setRate(usdtAddress, hre.ethers.parseUnits("0.14", 18))).wait();
    // 1 AXCNH = 0.14 USDC
    await (await converter.setRate(usdcAddress, hre.ethers.parseUnits("0.14", 18))).wait();
    console.log("Rates set successfully.");

    // Funding Converter with liquidity
    console.log("Funding Converter with liquidity...");
    try {
        const tokens = [
            { contract: axcnh, name: "AXCNH" },
            { contract: usdt, name: "USDT" },
            { contract: usdc, name: "USDC" }
        ];

        for (const token of tokens) {
            const transferTx = await token.contract.transfer(converterAddress, hre.ethers.parseUnits("5000", 18));
            await transferTx.wait();
            console.log(`Funded ${token.name} successfully.`);
        }

        // Fund with Native CFX
        console.log("Funding with CFX...");
        const fundTx = await converter.fund(hre.ethers.ZeroAddress, 0, { value: hre.ethers.parseUnits("100", 18) });
        await fundTx.wait();
        console.log("Funded CFX successfully.");
    } catch (e) {
        console.log("Funding failed:", e.message);
    }

    // Deploy SmartAccount logic
    const SmartAccount = await hre.ethers.getContractFactory("SmartAccount");
    console.log("Deploying SmartAccount logic...");
    const smartAccount = await SmartAccount.deploy();
    await smartAccount.waitForDeployment();
    const smartAccountAddress = await smartAccount.getAddress();
    console.log("SmartAccount logic deployed to:", smartAccountAddress);

    const addresses = {
        MockERC20: axcnhAddress,
        USDT: usdtAddress,
        USDC: usdcAddress,
        Escrow: escrowAddress,
        CurrencyConverter: converterAddress,
        SmartAccount: smartAccountAddress
    };

    const addressesPath = path.join(__dirname, "../contract-addresses.json");
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));

    const frontendAddressesPath = path.resolve(__dirname, "../../frontend/src/contracts/contract-addresses.json");
    const frontendDir = path.dirname(frontendAddressesPath);
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }
    fs.writeFileSync(frontendAddressesPath, JSON.stringify(addresses, null, 2));

    console.log("Addresses saved to:", addressesPath);
    console.log("Addresses also saved to frontend:", frontendAddressesPath);

    // Copy ABIs to frontend
    const contracts = ["Escrow", "CurrencyConverter", "MockERC20"];
    for (const name of contracts) {
        const artifactPath = path.resolve(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`);
        const frontendArtifactPath = path.resolve(__dirname, `../../frontend/src/contracts/${name}.json`);
        if (fs.existsSync(artifactPath)) {
            fs.copyFileSync(artifactPath, frontendArtifactPath);
            console.log(`Copied ${name} ABI to frontend.`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
