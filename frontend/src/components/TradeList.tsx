import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Contract Addresses needed for approval
import ContractAddresses from '../contracts/contract-addresses.json';

// Enum matches solidity
const TradeStatus = { Created: 0, Locked: 1, Released: 2, Cancelled: 3 } as const;

interface Trade {
    id: number;
    buyer: string;
    seller: string;
    amount: bigint;
    description: string;
    status: number;
}

export const TradeList = () => {
    const { t } = useTranslation();
    const { escrowContract, tokenContract, account } = useApp();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchTrades = async () => {
        if (!escrowContract) return;
        setLoading(true);
        try {
            if (escrowContract.address.includes("aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaajrwuc9jnb")) {
                throw new Error("Using Mock Address");
            }

            const list: Trade[] = [];
            const counter = await escrowContract.tradeCounter();
            const total = Number(counter);
            const clearedId = Number(localStorage.getItem('cstpg_cleared_id') || '0');

            // Fetch trades newer than the cleared ID, up to last 10
            for (let i = total; i > Math.max(clearedId, total - 10); i--) {
                const trade = await escrowContract.trades(i);
                list.push({
                    id: i,
                    buyer: trade.buyer,
                    seller: trade.seller,
                    amount: trade.amount,
                    description: trade.description,
                    status: Number(trade.status)
                });
            }
            setTrades(list);
        } catch (e) {
            console.warn("Fetch failed, using mock data:", e);
            const clearedId = Number(localStorage.getItem('cstpg_cleared_id') || '0');
            const mockData = [
                {
                    id: 1,
                    buyer: "cfx:mockseller...",
                    seller: "cfx:mockbuyer...",
                    amount: BigInt(100 * 1e18),
                    description: "Demo Trade: Web Design Services (Mock Data)",
                    status: 1
                },
                {
                    id: 2,
                    buyer: "cfx:mockbuyer2...",
                    seller: account || "cfx:user...",
                    amount: BigInt(50 * 1e18),
                    description: "Demo Trade: Logo Design (Mock Data)",
                    status: 0
                }
            ];
            setTrades(mockData.filter(t => t.id > clearedId));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (escrowContract) fetchTrades();
    }, [escrowContract]);

    const handleClear = async () => {
        if (!escrowContract) return;
        try {
            const counter = await escrowContract.tradeCounter();
            localStorage.setItem('cstpg_cleared_id', counter.toString());
            setTrades([]);
        } catch (e) {
            console.error(e);
            // Fallback: use highest ID in current trades
            if (trades.length > 0) {
                const maxId = Math.max(...trades.map(t => t.id));
                localStorage.setItem('cstpg_cleared_id', maxId.toString());
                setTrades([]);
            }
        }
    };

    const handleDeposit = async (trade: Trade) => {
        if (!tokenContract || !escrowContract) return;
        setActionLoading(trade.id);
        try {
            const allowance = await tokenContract.allowance(account, ContractAddresses.Escrow);
            const allowanceBN = BigInt(allowance.toString());
            const amountBN = BigInt(trade.amount.toString());

            if (allowanceBN < amountBN) {
                const approveData = tokenContract.approve(ContractAddresses.Escrow, amountBN.toString()).data;
                // @ts-ignore
                const txHash = await window.conflux.request({
                    method: 'cfx_sendTransaction',
                    params: [{
                        from: account,
                        to: ContractAddresses.MockERC20,
                        data: approveData
                    }]
                });

                alert(t('trade.actions.wait_confirm') + `\nTx: ${txHash}`);
                return;
            }

            const depositData = escrowContract.depositFunds(trade.id).data;
            // @ts-ignore
            await window.conflux.request({
                method: 'cfx_sendTransaction',
                params: [{
                    from: account,
                    to: ContractAddresses.Escrow,
                    data: depositData
                }]
            });
            alert(t('common.success'));
            fetchTrades();
        } catch (e) {
            console.error(e);
            alert(t('common.error', { message: (e as any).message }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleRelease = async (trade: Trade) => {
        if (!escrowContract) return;
        setActionLoading(trade.id);
        try {
            const data = escrowContract.releaseFunds(trade.id).data;
            // @ts-ignore
            await window.conflux.request({
                method: 'cfx_sendTransaction',
                params: [{
                    from: account,
                    to: ContractAddresses.Escrow,
                    data: data
                }]
            });
            alert(t('common.success'));
            fetchTrades();
        } catch (e) {
            console.error(e);
            alert(t('common.error', { message: (e as any).message }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (trade: Trade) => {
        if (!escrowContract) return;
        setActionLoading(trade.id);
        try {
            const data = escrowContract.cancelTrade(trade.id).data;
            // @ts-ignore
            await window.conflux.request({
                method: 'cfx_sendTransaction',
                params: [{
                    from: account,
                    to: ContractAddresses.Escrow,
                    data: data
                }]
            });
            alert(t('common.success'));
            fetchTrades();
        } catch (e) {
            console.error(e);
            alert(t('common.error', { message: (e as any).message }));
        } finally {
            setActionLoading(null);
        }
    };

    const renderAction = (trade: Trade) => {
        const isBuyer = account && trade.buyer.toLowerCase() === account.toLowerCase();
        const isLoading = actionLoading === trade.id;

        if (isLoading) return <Loader2 className="animate-spin" size={20} />;

        if (trade.status === TradeStatus.Created) {
            if (isBuyer) {
                return (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={() => handleDeposit(trade)}
                            style={{ 
                                flex: 1, 
                                background: '#27272a', 
                                color: '#FFA500',
                                border: '1px solid #3f3f46',
                                fontWeight: 600, 
                                fontSize: '0.9rem' 
                            }}
                        >
                            {t('trade.actions.deposit')}
                        </button>
                        <button
                            onClick={() => handleCancel(trade)}
                            style={{ 
                                flex: 1, 
                                background: '#27272a', 
                                color: '#ef4444', 
                                border: '1px solid #3f3f46', 
                                fontWeight: 600, 
                                fontSize: '0.9rem' 
                            }}
                        >
                            {t('trade.actions.cancel')}
                        </button>
                    </div>
                );
            }
            return <div style={{ padding: '0.8rem', borderRadius: '8px', background: '#18181b', border: '1px solid #27272a', textAlign: 'center', color: '#71717a', fontSize: '0.9rem' }}>{t('trade.status.waiting')}</div>;
        }

        if (trade.status === TradeStatus.Locked) {
            if (isBuyer) {
                return <button onClick={() => handleRelease(trade)} style={{ width: '100%', background: '#27272a', color: '#10b981', border: '1px solid #3f3f46', fontWeight: 600 }}>{t('trade.actions.release')}</button>;
            }
            return <div className="badge badge-locked" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.locked')}</div>;
        }

        if (trade.status === TradeStatus.Released) return <div className="badge badge-released" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.released')}</div>;
        if (trade.status === TradeStatus.Cancelled) return <div className="badge badge-cancelled" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.cancelled')}</div>;
        return null;
    };

    return (
        <div className="card">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg style={{ width: '20px', height: '20px', color: '#FFA500' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 style={{ margin: 0 }}>{t('trade.list_title')}</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleClear}
                        style={{ 
                            padding: '0.5rem', 
                            borderRadius: '8px', 
                            background: '#27272a', 
                            color: '#ef4444', 
                            border: '1px solid #3f3f46',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title={t('trade.clear_history')}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={fetchTrades}
                        style={{ 
                            padding: '0.5rem', 
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {trades.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    color: '#71717a', 
                    padding: '3rem 2rem',
                    background: '#18181b',
                    borderRadius: '12px',
                    border: '1px solid #27272a'
                }}>
                    <svg style={{ width: '48px', height: '48px', margin: '0 auto 1rem', color: '#3f3f46' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{t('trade.no_trades')}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trades.map(trade => (
                        <div key={trade.id} style={{
                            background: '#18181b',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #27272a',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 165, 0, 0.3)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#27272a';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <div className="flex-between">
                                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e4e4e7' }}>
                                    {t('trade.item')} <span style={{ color: '#FFA500' }}>#{trade.id}</span>
                                </span>
                                <span style={{ 
                                    color: '#FFA500', 
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    fontFamily: 'monospace'
                                }}>
                                    {(Number(trade.amount) / 1e18).toFixed(2)} cUSD
                                </span>
                            </div>

                            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <span style={{ color: '#71717a', fontWeight: 600 }}>{t('trade.desc')}:</span> {trade.description}
                            </p>

                            <div style={{ 
                                fontSize: '0.8rem', 
                                color: '#71717a', 
                                wordBreak: 'break-all', 
                                lineHeight: '1.6', 
                                background: '#0a0a0a', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                border: '1px solid #27272a',
                                fontFamily: 'monospace'
                            }}>
                                <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ color: '#60a5fa', fontWeight: 600, minWidth: '60px' }}>{t('trade.buyer')}:</span> 
                                    <span style={{ color: '#a1a1aa' }}>{trade.buyer}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ color: '#c084fc', fontWeight: 600, minWidth: '60px' }}>{t('trade.seller')}:</span> 
                                    <span style={{ color: '#a1a1aa' }}>{trade.seller}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.5rem' }}>
                                {renderAction(trade)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
