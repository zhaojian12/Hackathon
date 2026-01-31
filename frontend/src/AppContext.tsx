import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Conflux } from 'js-conflux-sdk';
import EscrowArtifact from './contracts/Escrow.json';
import MockERC20Artifact from './contracts/MockERC20.json';
import ContractAddresses from './contracts/contract-addresses.json';

interface AppContextType {
    conflux: Conflux | null;
    account: string;
    balance: string; // CFX balance
    connectWallet: () => Promise<void>;
    escrowContract: any; // Conflux Contract Object
    tokenContract: any;
    loading: boolean;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

// Helper to check if Fluent is installed
const isFluentInstalled = () => {
    return window.conflux && window.conflux.isFluent;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [conflux, setConflux] = useState<Conflux | null>(null);
    const [account, setAccount] = useState<string>("");
    const [balance, setBalance] = useState<string>("0");
    const [escrowContract, setEscrowContract] = useState<any>(null);
    const [tokenContract, setTokenContract] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        // Initialize SDK with Public RPC for reading data
        const sdk = new Conflux({
            url: "https://test.confluxrpc.com",
            networkId: 1,
        });
        setConflux(sdk);

        // Setup initial contracts (read-only until account connected)
        // logic moved to connectWallet or keep independent?
        // Let's keep it simple: Init contracts here for reading.
        const escrow = sdk.Contract({
            abi: EscrowArtifact.abi,
            address: ContractAddresses.Escrow
        });
        setEscrowContract(escrow);

        const token = sdk.Contract({
            abi: MockERC20Artifact.abi,
            address: ContractAddresses.MockERC20
        });
        setTokenContract(token);

    }, []);

    const connectWallet = async () => {
        if (!isFluentInstalled()) {
            alert("Please install Fluent Wallet!");
            window.open("https://fluentwallet.com/", "_blank");
            return;
        }
        setLoading(true);
        try {
            // @ts-ignore
            let accounts = await window.conflux.request({ method: "cfx_requestAccounts" });
            if (accounts.length > 0) {
                // Check Chain ID
                // @ts-ignore
                const chainId = await window.conflux.request({ method: "cfx_chainId" });
                if (chainId !== "0x1") {
                    try {
                        // @ts-ignore
                        await window.conflux.request({
                            method: "wallet_switchConfluxChain",
                            params: [{ chainId: "0x1" }]
                        });
                        // RE-FETCH accounts to ensure prefix is updated (cfx: -> cfxtest:)
                        // @ts-ignore
                        accounts = await window.conflux.request({ method: "cfx_accounts" });
                    } catch (switchError) {
                        alert("Please switch your wallet to Conflux Testnet!");
                        return;
                    }
                }

                const acc = accounts[0];
                setAccount(acc);

                // Refresh balance using the SDK we already initialized
                if (conflux) {
                    const bal = await conflux.cfx.getBalance(acc);
                    setBalance((Number(bal) / 1e18).toFixed(4));
                }
            }

        } catch (error) {
            console.error("Connection failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppContext.Provider value={{ conflux, account, balance, connectWallet, escrowContract, tokenContract, loading }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);

// Declare window.conflux
declare global {
    interface Window {
        conflux: any;
    }
}
