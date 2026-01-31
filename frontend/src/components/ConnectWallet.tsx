import { useApp } from '../AppContext';
import { Wallet, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ConnectWallet = () => {
    const { account, balance, connectWallet, loading } = useApp();
    const { t } = useTranslation();

    if (account) {
        return (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span className="badge badge-created" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' }}>
                    {balance} CFX
                </span>
                <button className="flex-between" disabled style={{ gap: '0.5rem', opacity: 1, cursor: 'default' }}>
                    <Wallet size={18} />
                    {account.slice(0, 6)}...{account.slice(-4)}
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
