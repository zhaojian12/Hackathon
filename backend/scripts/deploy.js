import { Conflux } from "js-conflux-sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // Use Conflux Core Space Testnet
    const conflux = new Conflux({
        url: "https://test.confluxrpc.com",
        networkId: 1,
        logger: console,
    });

    let account;
    let privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
        if (!privateKey.startsWith("0x")) {
            privateKey = "0x" + privateKey;
        }
        account = conflux.wallet.addPrivateKey(privateKey);
    } else {
        console.log("No PRIVATE_KEY found in .env");
        console.log("Generating random wallet for simulation...");
        account = conflux.wallet.addRandom();
        console.log(`Generated Wallet Address: ${account.address}`);
        console.log(`Generated Private Key: ${account.privateKey}`);
        console.log("Please fund this address with CFX testnet tokens to deploy.");
        // For non-interactive/CI, we can't proceed without funds.
        // But we will try to proceed to see if it fails on gas.
    }

    const balance = await conflux.cfx.getBalance(account.address);
    console.log(`Balance of ${account.address}: ${balance} Drip`);

    if (balance === 0n && !process.env.PRIVATE_KEY) {
        console.error("Insufficient funds. Please provide a PRIVATE_KEY in .env or fund the generated wallet.");
        process.exit(1);
    }

    const loadArtifact = (name) => {
        const p = path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`);
        if (!fs.existsSync(p)) {
            throw new Error(`Artifact not found at ${p}. Did you run 'npx hardhat compile'?`);
        }
        const content = fs.readFileSync(p, "utf-8");
        return JSON.parse(content);
    }

    const mockERC20Artifact = loadArtifact("MockERC20");
    const escrowArtifact = loadArtifact("Escrow");

    // Deploy MockERC20
    console.log("Deploying MockERC20...");
    const mockToken = conflux.Contract({
        abi: mockERC20Artifact.abi,
        bytecode: mockERC20Artifact.bytecode
    });

    let receipt;
    try {
        receipt = await mockToken.constructor().sendTransaction({ from: account.address }).executed();
    } catch (e) {
        console.error("Deployment failed:", e);
        process.exit(1);
    }
    console.log("MockERC20 deployed at:", receipt.contractCreated);
    const tokenAddress = receipt.contractCreated;

    // Deploy Escrow
    console.log("Deploying Escrow...");
    const escrow = conflux.Contract({
        abi: escrowArtifact.abi,
        bytecode: escrowArtifact.bytecode
    });

    try {
        receipt = await escrow.constructor(tokenAddress).sendTransaction({ from: account.address }).executed();
    } catch (e) {
        console.error("Escrow Deployment failed:", e);
        process.exit(1);
    }
    console.log("Escrow deployed at:", receipt.contractCreated);
    const escrowAddress = receipt.contractCreated;

    const addresses = {
        MockERC20: tokenAddress,
        Escrow: escrowAddress
    };
    fs.writeFileSync(path.join(__dirname, "../contract-addresses.json"), JSON.stringify(addresses, null, 2));
    console.log("Addresses saved to contract-addresses.json");
}

main().catch(console.error);
