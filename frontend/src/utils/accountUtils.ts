import { createWalletClient, http, type WalletClient, type Account } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { confluxESpaceTestnet } from 'viem/chains';
import { ethers } from 'ethers';

// 存储 Key 的本地存储键名
const STORAGE_KEY = 'conflux_local_pk';

// 我们部署的 SmartAccount 地址 (eSpace Testnet)
const SMART_ACCOUNT_IMPLEMENTATION = "0x8385766BCE4a36790Eee82436Fc0b3d3F843F390";

export interface LocalAccount {
    address: string;
    privateKey: string;
    account: Account;
}

/**
 * 获取或创建一个本地账户（模拟 Google 登录生成的账户）
 */
export const getOrCreateLocalAccount = (): LocalAccount => {
    let pk = localStorage.getItem(STORAGE_KEY);
    if (!pk) {
        pk = generatePrivateKey();
        localStorage.setItem(STORAGE_KEY, pk);
    }
    const account = privateKeyToAccount(pk as `0x${string}`);
    return {
        address: account.address,
        privateKey: pk,
        account
    };
};

/**
 * 清除本地账户
 */
export const clearLocalAccount = () => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * 使用本地私钥创建一个 viem WalletClient
 */
export const createLocalWalletClient = (account: Account) => {
    return createWalletClient({
        account,
        chain: confluxESpaceTestnet,
        transport: http('https://evmtest.confluxrpc.com') // 使用目前可用的 RPC
    });
};

/**
 * 将 viem 账户转换为 ethers Signer，以便兼容 AppContext.tsx
 * 注意：这里只是为了兼容现有代码。
 */
export const getEthersSignerFromLocalAccount = async (localAccount: LocalAccount, provider: ethers.JsonRpcProvider): Promise<ethers.Wallet> => {
    return new ethers.Wallet(localAccount.privateKey, provider);
};

/**
 * [EIP-7702 Simulation]
 * 构建并签名一个 EIP-7702 授权元组。
 * 由于当前测试网可能尚未完全支持 type 4 tx 的广播，
 * 此函数主要用于演示“用户签署了将代码委托给 SmartAccount”的意图。
 * 
 * 返回 Authorization 结构体: { chainId, address, nonce, yParity, r, s }
 */
export const signSmartAccountAuthorization = async (_client: WalletClient, account: Account) => {
    // 构造 EIP-7702 Authorization
    // 实际上 viable 的 signAuthorization 还在实验阶段，
    // 这里我们用 eip712 或者简单的 personal sign 模拟这个过程，
    // 或者如果 viem 版本支持实验性特性，尝试调用。

    // 仅作演示：打印日志表明我们在做这件事
    console.log(`[EIP-7702] Signing authorization for account ${account.address} to delegate to ${SMART_ACCOUNT_IMPLEMENTATION}`);

    // 模拟签名 (实际生产中应调用 client.signAuthorization)
    // const signature = await client.signAuthorization({
    //    contractAddress: SMART_ACCOUNT_IMPLEMENTATION,
    //    ...
    // });

    // 为了 PoC，我们返回一个模拟对象
    return {
        contractAddress: SMART_ACCOUNT_IMPLEMENTATION,
        chainId: confluxESpaceTestnet.id,
        nonce: 0,
        r: '0x...',
        s: '0x...',
        yParity: 0
    };
};
