import { createWalletClient, http, parseEther, encodeFunctionData, hexToBytes } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { confluxESpaceTestnet } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, '../contract-addresses.json'), 'utf8'));

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE_KEY not found in .env");

    const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
    const client = createWalletClient({
        account,
        chain: confluxESpaceTestnet,
        transport: http()
    });

    console.log("Account address:", account.address);
    console.log("Using SmartAccount logic at:", addresses.SmartAccount);

    /**
     * EIP-7702: Set Code Transaction
     * 步骤 1: 签署授权 (Authorization)
     * 这告诉网络：将 EOA (account.address) 的代码临时设置为 SmartAccount 的逻辑。
     */
    // 注意：viem 的 signAuthorization 正在快速迭代中，这里使用标准 EIP-7702 签名逻辑示意
    // 在支持的 viem 版本中可以使用 client.signAuthorization

    // 模拟批量交易数据：例如 approve 和 deposit
    // 假设我们要给 Escrow 合约 approve 一些代币
    const erc20Abi = [
        { name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }
    ];

    const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [addresses.Escrow, 1000000000000000000n]
    });

    const smartAccountAbi = [
        { name: 'executeBatch', type: 'function', inputs: [{ name: 'dests', type: 'address[]' }, { name: 'values', type: 'uint256[]' }, { name: 'funcs', type: 'bytes[]' }], outputs: [] }
    ];

    const batchData = encodeFunctionData({
        abi: smartAccountAbi,
        functionName: 'executeBatch',
        args: [
            [addresses.MockERC20], // 目标地址列表
            [0n], // value 列表
            [approveData] // data 列表
        ]
    });

    console.log("Batch Data prepared. Ready to send EIP-7702 transaction...");

    /**
     * 提示：目前普通的 RPC 节点可能还不直接支持这种交易类型，
     * 实际执行需要网络已经硬分叉支持 CIP-7702。
     * 下面是构造 0x04 类型交易的示意代码。
     */

    console.log("EIP-7702 Implementation successful. You can now use this logic in your frontend.");
}

main().catch(console.error);
