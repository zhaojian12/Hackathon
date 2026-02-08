import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { LogIn, LogOut, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

export const ConnectWallet = () => {
    const { account, connectWallet, loading, userEmail, logout, usdtContract } = useApp();
    const { t } = useTranslation();
    const [usdtBalance, setUsdtBalance] = useState('0.00');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            if (account && usdtContract) {
                try {
                    const bal = await usdtContract.balanceOf(account);
                    // USDT typically has 18 decimals in this mock setup, but let's assume it matches the contract.
                    // If MockERC20 was used for USDT, it likely has 18 decimals. 
                    // Standard USDT has 6, but check MockERC20Artifact or previous usage.
                    // Previous context implies 18 decimals for test tokens.
                    setUsdtBalance(ethers.formatUnits(bal, 18));
                } catch (e) {
                    console.error("Failed to fetch USDT balance", e);
                }
            }
        };
        fetchBalance();
        // Set up an interval to refresh balance periodically
        const interval = setInterval(fetchBalance, 10000);
        return () => clearInterval(interval);
    }, [account, usdtContract]);

    const handleCopy = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            connectWallet();
        }
    };

    if (userEmail || account) {
        return (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div className="account-info-desktop" style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                        {userEmail?.split('@')[0] || t('common.user')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {t('auth.protected_account')}
                    </div>
                </div>
                <div className="badge" style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#a5b4fc',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                }}>
                    {Number(usdtBalance).toFixed(2)} USDT
                </div>
                <button
                    className="flex-between"
                    style={{
                        gap: '0.5rem',
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        cursor: 'pointer'
                    }}
                    onClick={handleCopy}
                    title="Click to copy address"
                >
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 800
                    }}>
                        {userEmail ? userEmail[0].toUpperCase() : 'U'}
                    </div>
                    <span style={{ fontSize: '0.85rem' }}>
                        {copied
                            ? <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Copied</span>
                            : (account ? `${account.slice(0, 4)}...${account.slice(-4)}` : t('wallet.not_connected'))}
                    </span>
                </button>
                <button
                    onClick={logout}
                    title={t('wallet.logout')}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '10px',
                        padding: '8px',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <LogOut size={16} />
                </button>
            </div>
        );
    }

    return (
        <button onClick={connectWallet} disabled={loading} className="flex-between" style={{ gap: '0.5rem' }}>
            <LogIn size={18} />
            {loading ? t('wallet.connecting') : t('wallet.connect')}
        </button>
    );
};

