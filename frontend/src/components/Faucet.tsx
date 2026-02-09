import { useState } from 'react';
import { useApp } from '../AppContext';
import { RefreshCw, Droplets, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { InfoModal } from './InfoModal';

export const Faucet = () => {
    const {
        tokenContract,
        usdtContract,
        usdcContract,
        account,
        refreshBalance
    } = useApp();
    const { t } = useTranslation();
    const [minting, setMinting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null, message: string | null }>({ type: null, message: null });
    const [showGasModal, setShowGasModal] = useState(false);
    const { balance } = useApp();

    const handleMint = async () => {
        if (!account) {
            setStatus({ type: 'error', message: t('common.connect_first') });
            return;
        }

        // Check for sufficient CFX for gas (using 0.002 CFX as safe threshold)
        if (parseFloat(balance) < 0.002) {
            setShowGasModal(true);
            return;
        }

        setMinting(true);
        setStatus({ type: 'info', message: t('faucet.minting_in_progress') });

        try {
            const amount = ethers.parseUnits("1000", 18);
            const contracts = [
                { name: 'AXCNH', contract: tokenContract },
                { name: 'USDT', contract: usdtContract },
                { name: 'USDC', contract: usdcContract }
            ];

            for (const item of contracts) {
                if (item.contract) {
                    setStatus({ type: 'info', message: t('faucet.minting_token', { token: item.name }) });
                    try {
                        const tx = await item.contract.mint(account, amount);
                        await tx.wait();
                    } catch (innerError: any) {
                        console.error(`Failed to mint ${item.name}:`, innerError);
                        throw new Error(`Failed to mint ${item.name}: ${innerError.reason || innerError.message}`);
                    }
                }
            }

            setStatus({ type: 'success', message: t('faucet.mint_success') });
            if (refreshBalance) await refreshBalance();

            // Clear status after 5 seconds
            setTimeout(() => setStatus({ type: null, message: null }), 5000);
        } catch (e: any) {
            console.error("Minting error:", e);
            setStatus({ type: 'error', message: t('common.error', { message: e.message }) });
        } finally {
            setMinting(false);
        }
    };

    if (!account) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.5rem'
        }}>
            {status.message && (
                <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: status.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    color: status.type === 'success' ? '#4ade80' : status.type === 'error' ? '#f87171' : '#60a5fa',
                    border: `1px solid ${status.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(8px)',
                    maxWidth: '300px',
                    fontSize: '0.85rem'
                }}>
                    {status.type === 'success' && <CheckCircle size={16} />}
                    {status.type === 'error' && <AlertCircle size={16} />}
                    {status.type === 'info' && <RefreshCw size={16} className="animate-spin" />}
                    <span>{status.message}</span>
                </div>
            )}
            <button
                onClick={handleMint}
                disabled={minting}
                style={{
                    borderRadius: '50%',
                    width: '3.5rem',
                    height: '3.5rem',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: minting ? 0.7 : 1
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                title={t('faucet.mint')}
            >
                {minting ? <Loader2 className="animate-spin" /> : <Droplets size={24} />}
            </button>

            <InfoModal
                isOpen={showGasModal}
                title={t('faucet.insufficient_gas_title')}
                message={t('faucet.insufficient_gas_desc')}
                onConfirm={() => {
                    window.open('https://efaucet.confluxnetwork.org/', '_blank');
                    setShowGasModal(false);
                }}
                buttonText={t('faucet.get_cfx_btn')}
                iconType="info"
            />
        </div>
    );
};
