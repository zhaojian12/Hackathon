import { ethers } from "ethers";

const RPC_URL = "https://evmtestnet.confluxrpc.com";
const CONTRACT_ADDRESS = "0x1f0eaD86C507fc0b63C192896B8F3d91baa80E08";
const SELLER_ADDRESS = "0x917F5c844B8307aEeA3ecf755B6454889d1e45DF";

const ABI = [
    "function getSellerReputation(address _seller) view returns (uint256 averageRating, uint256 totalTrades)"
];

async function main() {
    console.log("Connecting to RPC:", RPC_URL);
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    console.log("Contract Address:", CONTRACT_ADDRESS);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    console.log("Querying reputation for:", SELLER_ADDRESS);
    try {
        const stats = await contract.getSellerReputation(SELLER_ADDRESS);
        console.log("Result:", stats);
        console.log("Average Rating:", Number(stats.averageRating));
        console.log("Total Trades:", Number(stats.totalTrades));
    } catch (error) {
        console.error("Error querying contract:", error);
    }
}

main();
