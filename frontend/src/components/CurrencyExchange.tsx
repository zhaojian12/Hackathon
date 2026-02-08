import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { RefreshCw, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import ContractAddresses from '../contracts/contract-addresses.json';
import { InfoModal } from './InfoModal';

export const CurrencyExchange: React.FC = () => {
    const { t } = useTranslation();
    const {
        account,
        balance, // Native CFX balance from AppContext
        tokenContract,
        usdtContract,
        usdcContract,
        currencyConverterContract
    } = useApp();

    const [amount, setAmount] = useState('');
    const [balances, setBalances] = useState<Record<string, string>>({
        AXCNH: '0',
        CFX: '0',
        USDT: '0',
        USDC: '0'
    });

    const [fromToken, setFromToken] = useState('AXCNH');
    const [toToken, setToToken] = useState('CFX');
    const [loading, setLoading] = useState(false);
    const [swapping, setSwapping] = useState(false);
    const [estimatedRate, setEstimatedRate] = useState(4.0);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'zap' | 'success'
    });

    const tokenMap: Record<string, any> = {
        AXCNH: tokenContract,
        CFX: null, // Native token
        USDT: usdtContract,
        USDC: usdcContract
    };

    const addressMap: Record<string, string> = {
        AXCNH: (ContractAddresses as any).MockERC20,
        CFX: ethers.ZeroAddress,
        USDT: (ContractAddresses as any).USDT,
        USDC: (ContractAddresses as any).USDC
    };

    const fetchBalances = async () => {
        if (!account || !tokenContract) return;
        setLoading(true);
        try {
            const newBalances: Record<string, string> = {
                CFX: balance
            };
            for (const symbol in tokenMap) {
                if (symbol === 'CFX') continue;
                const contract = tokenMap[symbol];
                if (contract) {
                    const bal = await contract.balanceOf(account);
                    newBalances[symbol] = ethers.formatUnits(bal, 18);
                }
            }
            setBalances(newBalances);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, [account, balance, tokenContract, usdtContract, usdcContract]);

    useEffect(() => {
        // Simple rate simulation for UI
        if (fromToken === 'AXCNH') {
            if (toToken === 'CFX') setEstimatedRate(4.0);
            else setEstimatedRate(0.14);
        } else if (fromToken === 'CFX') {
            setEstimatedRate(0.25);
        } else {
            setEstimatedRate(7.14); // 1 / 0.14
        }
    }, [fromToken, toToken]);

    const handleSwapDirection = () => {
        const temp = fromToken;
        setFromToken(toToken);
        setToToken(temp);
    };

    const handleSwap = async () => {
        if (!currencyConverterContract || !account || !amount) return;
        setSwapping(true);
        try {
            const amountBN = ethers.parseUnits(amount, 18);
            const converterAddress = await currencyConverterContract.getAddress();

            let tx;
            if (fromToken === 'AXCNH') {
                const targetTokenAddr = addressMap[toToken];
                const fromContract = tokenMap[fromToken];

                // Approve AXCNH
                const allowance = await fromContract.allowance(account, converterAddress);
                if (allowance < amountBN) {
                    const approveTx = await fromContract.approve(converterAddress, amountBN);
                    await approveTx.wait();
                }

                tx = await currencyConverterContract.swapAXCNHToToken(targetTokenAddr, amountBN);
            } else {
                const sourceTokenAddr = addressMap[fromToken];
                const fromContract = tokenMap[fromToken];

                if (fromToken === 'CFX') {
                    // Native CFX swap
                    tx = await currencyConverterContract.swapTokenToAXCNH(sourceTokenAddr, 0, { value: amountBN });
                } else {
                    // ERC20 swap
                    const allowance = await fromContract.allowance(account, converterAddress);
                    if (allowance < amountBN) {
                        const approveTx = await fromContract.approve(converterAddress, amountBN);
                        await approveTx.wait();
                    }
                    tx = await currencyConverterContract.swapTokenToAXCNH(sourceTokenAddr, amountBN);
                }
            }

            await tx.wait();
            setModalInfo({
                title: t('currency_exchange.swap_success_title'),
                message: t('currency_exchange.swap_success_message', { from: fromToken, to: toToken }),
                type: 'success'
            });
            setModalOpen(true);
            setAmount('');
            fetchBalances();
        } catch (e: any) {
            console.error("Swap Error Debug:", e);
            setModalInfo({
                title: t('currency_exchange.swap_failed_title'),
                message: e.reason || e.message || t('currency_exchange.unknown_error'),
                type: 'info'
            });
            setModalOpen(true);
        } finally {
            setSwapping(false);
        }
    };

    const renderTokenSelector = (current: string, set: (v: string) => void, style: React.CSSProperties = {}) => {
        return (
            <select
                value={current}
                onChange={(e) => set(e.target.value)}
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '4px 8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    ...style
                }}
            >
                {Object.keys(tokenMap).map(t => (
                    <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>
                ))}
            </select>
        );
    };

    return (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ArrowRightLeft className="text-secondary" />
                    {t('currency_exchange.title')}
                </h2>
                <button onClick={fetchBalances} style={{ padding: '4px', background: 'none' }}>
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* From Box */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <span>{t('currency_exchange.balance_label')}: {parseFloat(balances[fromToken] || '0').toFixed(2)}</span>
                        {renderTokenSelector(fromToken, (v) => {
                            setFromToken(v);
                            if (v !== 'AXCNH') setToToken('AXCNH');
                            else if (toToken === 'AXCNH') setToToken('USDT');
                        }, { maxWidth: '100px', padding: '2px 4px', fontSize: '0.85rem' })}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{ flex: 1, background: 'none', border: 'none', fontSize: '1.4rem', outline: 'none', color: '#fff', fontWeight: 600 }}
                        />
                        <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{fromToken}</span>
                    </div>
                </div>

                {/* Swap Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '-1.2rem 0', zIndex: 2 }}>
                    <button
                        onClick={handleSwapDirection}
                        style={{
                            background: '#1e293b',
                            border: '2px solid #334155',
                            padding: '8px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                    >
                        <ArrowRightLeft size={18} color="#8b5cf6" />
                    </button>
                </div>

                {/* To Box */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <span>{t('currency_exchange.estimated_output', { rate: estimatedRate })}</span>
                        {renderTokenSelector(toToken, (v) => {
                            setToToken(v);
                            if (v !== 'AXCNH') setFromToken('AXCNH');
                            else if (fromToken === 'AXCNH') setFromToken('USDT');
                        }, { maxWidth: '100px', padding: '2px 4px', fontSize: '0.85rem' })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 600, color: '#10b981' }}>
                            {amount ? (Number(amount) * estimatedRate).toFixed(2) : '0.00'}
                        </span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{toToken}</span>
                    </div>
                </div>

                <button
                    onClick={handleSwap}
                    disabled={swapping || !amount || fromToken === toToken}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: (swapping || !amount || fromToken === toToken)
                            ? 'rgba(139, 92, 246, 0.3)'
                            : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '1rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: (swapping || !amount || fromToken === toToken) ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)'
                    }}
                >
                    {swapping ? <Loader2 className="animate-spin" size={20} /> : t('currency_exchange.confirm_btn')}
                </button>

                <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: 0, fontStyle: 'italic' }}>
                    {t('currency_exchange.note')}
                </p>
            </div>

            <InfoModal
                isOpen={modalOpen}
                title={modalInfo.title}
                message={modalInfo.message}
                iconType={modalInfo.type}
                onConfirm={() => setModalOpen(false)}
            />
        </div>
    );
};
