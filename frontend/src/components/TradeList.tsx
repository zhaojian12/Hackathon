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
                            style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            {t('trade.actions.deposit')}
                        </button>
                        <button
                            onClick={() => handleCancel(trade)}
                            style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            {t('trade.actions.cancel')}
                        </button>
                    </div>
                );
            }
            return <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>{t('trade.status.waiting')}</div>;
        }

        if (trade.status === TradeStatus.Locked) {
            if (isBuyer) {
                return <button onClick={() => handleRelease(trade)} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600 }}>{t('trade.actions.release')}</button>;
            }
            return <div className="badge badge-locked" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.locked')}</div>;
        }

        if (trade.status === TradeStatus.Released) return <div className="badge badge-released" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.released')}</div>;
        if (trade.status === TradeStatus.Cancelled) return <div className="badge badge-cancelled" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.cancelled')}</div>;
        return null;
    };

    return (
        <div className="card">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h2>{t('trade.list_title')}</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleClear}
                        style={{ padding: '0.4rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        title={t('trade.clear_history')}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={fetchTrades}
                        style={{ padding: '0.4rem', borderRadius: '50%' }}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {trades.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>{t('trade.no_trades')}</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {trades.map(trade => (
                        <div key={trade.id} style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            padding: '1.2rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem'
                        }}>
                            <div className="flex-between">
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{t('trade.item')} #{trade.id}</span>
                                <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{(Number(trade.amount) / 1e18).toFixed(2)} cUSD</span>
                            </div>

                            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>
                                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{t('trade.desc')}:</span> {trade.description}
                            </p>

                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', wordBreak: 'break-all', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '8px' }}>
                                <div style={{ marginBottom: '0.4rem' }}>
                                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{t('trade.buyer')}:</span> {trade.buyer}
                                </div>
                                <div>
                                    <span style={{ color: '#c084fc', fontWeight: 600 }}>{t('trade.seller')}:</span> {trade.seller}
                                </div>
                            </div>

                            <div style={{ marginTop: '0.4rem' }}>
                                {renderAction(trade)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
