import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';
import EscrowArtifact from './contracts/Escrow.json';
import MockERC20Artifact from './contracts/MockERC20.json';
import CurrencyConverterArtifact from './contracts/CurrencyConverter.json';
import ContractAddresses from './contracts/contract-addresses.json';
import i18n from './i18n';

interface AppContextType {
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
    account: string;
    balance: string; // CFX balance
    userRole: 'exporter' | 'importer' | null;
    setUserRole: (role: 'exporter' | 'importer') => void;
    connectWallet: () => Promise<void>;
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
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
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

    const initContracts = (currentSigner: ethers.JsonRpcSigner) => {
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

        // 自动连接或模拟连接
        if (window.ethereum) {
            await connectWallet();
        }
        setIsAuthenticated(true);
        setLoading(false);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setAccount("");
        setSigner(null);
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        window.location.reload();
    };

    useEffect(() => {
        const checkConnection = async () => {
            const savedEmail = localStorage.getItem('user_email');
            if (savedEmail) {
                setUserEmail(savedEmail);
                setIsAuthenticated(true);
                // 自动尝试连接钱包以恢复 account 状态
                if (window.ethereum) {
                    await connectWallet();
                }
            }
        };
        checkConnection();
    }, []);

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
            refreshBalance, fetchReputation
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
