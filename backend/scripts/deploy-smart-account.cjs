const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SmartAccount = await hre.ethers.getContractFactory("SmartAccount");
    const smartAccount = await SmartAccount.deploy();

    await smartAccount.waitForDeployment();
    const address = await smartAccount.getAddress();

    console.log("SmartAccount deployed to:", address);

    // 更新地址文件
    const filePath = path.join(__dirname, "../contract-addresses.json");
    let addresses = {};
    if (fs.existsSync(filePath)) {
        addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    addresses["SmartAccount"] = address;
    fs.writeFileSync(filePath, JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
