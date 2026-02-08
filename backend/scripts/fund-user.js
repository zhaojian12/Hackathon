import hre from "hardhat";

async function main() {
    const userAddress = "0x02be54bb54c9db19a6169f76317d5d2a5e61df49";
    const axcnhAddress = "0x30CF2DFca979cD1eF780e4F4b4e64fc9ffbB1a25";

    console.log(`Funding user ${userAddress} with AXCNH...`);

    const [deployer] = await hre.ethers.getSigners();
    const axcnh = await hre.ethers.getContractAt("MockERC20", axcnhAddress, deployer);

    // Check initial balance
    const balanceBefore = await axcnh.balanceOf(userAddress);
    console.log(`Balance before: ${hre.ethers.formatUnits(balanceBefore, 18)} AXCNH`);

    // Mint 10,000 AXCNH
    const amount = hre.ethers.parseUnits("10000", 18);
    const tx = await axcnh.mint(userAddress, amount);
    await tx.wait();

    // Check final balance
    const balanceAfter = await axcnh.balanceOf(userAddress);
    console.log(`Balance after: ${hre.ethers.formatUnits(balanceAfter, 18)} AXCNH`);
    console.log("Funding successful!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
