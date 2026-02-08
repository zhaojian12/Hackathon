import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers, type JsonRpcProvider } from 'ethers';
import { getOrCreateLocalAccount, getEthersSignerFromLocalAccount, type LocalAccount } from './utils/accountUtils';
import EscrowArtifact from './contracts/Escrow.json';
import MockERC20Artifact from './contracts/MockERC20.json';
import CurrencyConverterArtifact from './contracts/CurrencyConverter.json';
import ContractAddresses from './contracts/contract-addresses.json';
import i18n from './i18n';

interface AppContextType {
    provider: ethers.BrowserProvider | null;
    signer: ethers.Signer | null;
    account: string;
    balance: string; // CFX balance
    userRole: 'exporter' | 'importer' | null;
    setUserRole: (role: 'exporter' | 'importer') => void;
    connectWallet: () => Promise<void>;
    localAccount: LocalAccount | null; // 添加本地账户状态
    useLocalAccount: boolean; // 是否使用本地账户模式
    escrowContract: ethers.Contract | null;
    tokenContract: ethers.Contract | null;
    currencyConverterContract: ethers.Contract | null;
    usdtContract: ethers.Contract | null;
    usdcContract: ethers.Contract | null;
    loading: boolean;
    isAuthenticated: boolean;
    userEmail: string | null;
    afterLogin: (email: string) => Promise<void>;
    logout: () => void;
    refreshBalance: () => Promise<void>;
    fetchReputation: (seller: string) => Promise<{ averageRating: number, totalTrades: number }>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

// Chain ID for Conflux eSpace Testnet is 71 (0x47)
const ESPACE_TESTNET_CHAIN_ID = '0x47';

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [account, setAccount] = useState<string>("");
    const [balance, setBalance] = useState<string>("0");
    const [userRole, setUserRoleState] = useState<'exporter' | 'importer' | null>(null);
    const [escrowContract, setEscrowContract] = useState<ethers.Contract | null>(null);
    const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
    const [currencyConverterContract, setCurrencyConverterContract] = useState<ethers.Contract | null>(null);
    const [usdtContract, setUsdtContract] = useState<ethers.Contract | null>(null);
    const [usdcContract, setUsdcContract] = useState<ethers.Contract | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [localAccount, setLocalAccount] = useState<LocalAccount | null>(null);
    const [useLocalAccount, setUseLocalAccount] = useState<boolean>(false);

    const initContracts = (currentSigner: ethers.Signer) => {
        const escrow = new ethers.Contract(ContractAddresses.Escrow, EscrowArtifact.abi, currentSigner);
        const token = new ethers.Contract(ContractAddresses.MockERC20, MockERC20Artifact.abi, currentSigner);
        const converter = new ethers.Contract(ContractAddresses.CurrencyConverter, CurrencyConverterArtifact.abi, currentSigner);
        const usdt = new ethers.Contract((ContractAddresses as any).USDT, MockERC20Artifact.abi, currentSigner);
        const usdc = new ethers.Contract((ContractAddresses as any).USDC, MockERC20Artifact.abi, currentSigner);

        setEscrowContract(escrow);
        setTokenContract(token);
        setCurrencyConverterContract(converter);
        setUsdtContract(usdt);
        setUsdcContract(usdc);
    };

    useEffect(() => {
        const savedRole = localStorage.getItem('user_role');
        if (savedRole === 'exporter' || savedRole === 'importer') {
            setUserRoleState(savedRole);
        }

        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            // Handle account changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    browserProvider.getSigner().then(s => {
                        setSigner(s);
                        initContracts(s);
                    });
                    // Update balance for the new account
                    browserProvider.getBalance(accounts[0]).then(bal => {
                        setBalance(ethers.formatEther(bal));
                    });
                } else {
                    setAccount("");
                    setSigner(null);
                }
            });

            // Handle chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    const fetchReputation = async (seller: string) => {
        if (!escrowContract) return { averageRating: 0, totalTrades: 0 };
        try {
            const stats = await escrowContract.getSellerReputation(seller);
            return {
                averageRating: Number(stats.averageRating) / 10,
                totalTrades: Number(stats.totalTrades)
            };
        } catch (e) {
            return { averageRating: 0, totalTrades: 0 };
        }
    };

    const setUserRole = (role: 'exporter' | 'importer') => {
        setUserRoleState(role);
        localStorage.setItem('user_role', role);
    };

    const refreshBalance = async () => {
        if (provider && account) {
            const bal = await provider.getBalance(account);
            setBalance(ethers.formatEther(bal));
        }
    };

    const afterLogin = async (email: string) => {
        setLoading(true);
        setUserEmail(email);
        localStorage.setItem('user_email', email);

        // 检测是否是 Google 登录 (模拟)
        // 如果是 Google 登录，我们启用 "Invisible Wallet" (EIP-7702 PoC)
        if (email.includes('google') || email.includes('example')) {
            console.log("Enabling Invisible Wallet for Google Login user...");
            const account = getOrCreateLocalAccount();
            setLocalAccount(account);
            setUseLocalAccount(true);

            // 自动连接我们的本地账户
            await connectLocalWallet(account);
        } else {
            // 传统模式：尝试连接插件钱包
            if (window.ethereum) {
                await connectWallet();
            }
        }
        setIsAuthenticated(true);
        setLoading(false);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setAccount("");
        setSigner(null);
        setLocalAccount(null);
        setUseLocalAccount(false);
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        // 可选：是否清除本地私钥？为了体验连贯性，暂时保留
        // localStorage.removeItem('conflux_local_pk'); 
        window.location.reload();
    };

    useEffect(() => {
        const checkConnection = async () => {
            const savedEmail = localStorage.getItem('user_email');
            if (savedEmail) {
                setUserEmail(savedEmail);
                setIsAuthenticated(true);

                // 恢复连接逻辑
                if (savedEmail.includes('google') || savedEmail.includes('example')) {
                    const account = getOrCreateLocalAccount();
                    setLocalAccount(account);
                    setUseLocalAccount(true);
                    await connectLocalWallet(account);
                } else if (window.ethereum) {
                    await connectWallet();
                }
            }
        };
        checkConnection();
    }, []);

    const connectLocalWallet = async (lAccount: LocalAccount) => {
        try {
            // 使用 eSpace Testnet RPC
            const rpcUrl = "https://evmtest.confluxrpc.com";
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const signer = await getEthersSignerFromLocalAccount(lAccount, provider);

            setProvider(null); // Local provider logic differs from browser one slightly for read
            // 这里我们可能需要一个全局的 read provider，但为了简单，我们将 signer.provider 视为 provider
            // setProvider(provider as any); 

            setSigner(signer);
            setAccount(lAccount.address);

            const bal = await provider.getBalance(lAccount.address);
            setBalance(ethers.formatEther(bal));

            // 初始化合约
            initContracts(signer);

            if (!userRole) setUserRole('importer');

            console.log("Connected to Invisible Wallet:", lAccount.address);
        } catch (e) {
            console.error("Failed to connect local wallet:", e);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert(i18n.t('wallet.not_installed_alert'));
            return;
        }
        setLoading(true);
        try {
            // Force re-requesting accounts to sync with extension state
            const accounts = await window.ethereum.request({ method: "eth_accounts" });
            const acc = accounts[0] || (await window.ethereum.request({ method: "eth_requestAccounts" }))[0];
            const browserProvider = new ethers.BrowserProvider(window.ethereum);

            // Sync provider and signer
            setProvider(browserProvider);

            // Check Chain ID
            const network = await browserProvider.getNetwork();
            const chainId = "0x" + network.chainId.toString(16);

            const LOCAL_CHAIN_ID = '0x7a69'; // Hardhat Localhost
            const isAllowedChain = chainId === ESPACE_TESTNET_CHAIN_ID || chainId === LOCAL_CHAIN_ID;

            if (!isAllowedChain) {
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: ESPACE_TESTNET_CHAIN_ID }]
                    });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [{
                                chainId: ESPACE_TESTNET_CHAIN_ID,
                                chainName: "Conflux eSpace Testnet",
                                rpcUrls: ["https://evmtestnet.confluxrpc.com"],
                                nativeCurrency: { name: "CFX", symbol: "CFX", decimals: 18 },
                                blockExplorerUrls: ["https://evmtestnet.confluxscan.net"]
                            }]
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            setAccount(acc);
            const s = await browserProvider.getSigner();
            setSigner(s);
            initContracts(s);

            const bal = await browserProvider.getBalance(acc);
            setBalance(ethers.formatEther(bal));

            // If no role, default to importer for PoC
            if (!userRole) {
                setUserRole('importer');
            }
        } catch (error) {
            console.error("Connection failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppContext.Provider value={{
            provider, signer, account, balance, userRole, setUserRole,
            connectWallet, escrowContract, tokenContract,
            currencyConverterContract,
            usdtContract, usdcContract,
            loading, isAuthenticated, userEmail, afterLogin, logout,
            refreshBalance, fetchReputation,
            localAccount, useLocalAccount
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

// Declare window.ethereum
declare global {
    interface Window {
        ethereum: any;
    }
}
