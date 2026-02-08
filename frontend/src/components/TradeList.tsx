import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { RefreshCw, Loader2, Trash2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { InfoModal } from './InfoModal';
import { ShipModal } from './ShipModal';
import ContractAddresses from '../contracts/contract-addresses.json';

// Enum matches solidity
const TradeStatus = { Created: 0, Locked: 1, Shipped: 2, Received: 3, Cancelled: 4 } as const;

interface Trade {
    id: number;
    buyer: string;
    seller: string;
    amount: bigint;
    description: string;
    status: number;
    rating: number;
    trackingNumber: string;
    shippingMethod: string;
    remarks: string;
    hasAllowance?: boolean;
}

export const TradeList = () => {
    const { t } = useTranslation();
    const { escrowContract, tokenContract, account, userRole, currencyConverterContract, usdtContract, usdcContract } = useApp();

    const tokenMap: Record<string, any> = {
        AXCNH: tokenContract,
        USDT: usdtContract,
        USDC: usdcContract
    };
    const [trades, setTrades] = useState<Trade[]>([]);
    const [subTab, setSubTab] = useState<'purchases' | 'sales'>(userRole === 'exporter' ? 'sales' : 'purchases');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        iconType: 'info' | 'zap' | 'success';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        iconType: 'info'
    });

    const [shipModalTrade, setShipModalTrade] = useState<Trade | null>(null);
    const [rateModalTrade, setRateModalTrade] = useState<Trade | null>(null);



    const fetchTrades = async (retryCount = 0) => {
        if (!escrowContract) return;
        setLoading(true);
        try {
            const list: Trade[] = [];
            const counter = await escrowContract.tradeCounter();
            const total = Number(counter);
            console.log(`[TradeList] Fetching count=${total}, account=${account}`);

            let clearedId = Number(localStorage.getItem('cstpg_cleared_id') || '0');
            // If the contract was redeployed (total < clearedId), reset local storage
            if (total < clearedId) {
                console.log(`[TradeList] Counter reset detected (${total} < ${clearedId}). Resetting filter.`);
                localStorage.setItem('cstpg_cleared_id', '0');
                clearedId = 0;
            }

            // Fetch trades newer than the cleared ID, up to last 10
            for (let i = total; i > Math.max(clearedId, total - 10); i--) {
                const trade = await escrowContract.trades(i);
                if (trade && trade.buyer && trade.buyer !== ethers.ZeroAddress) {
                    let hasAllowance = false;
                    try {
                        if (tokenContract && account && Number(trade.status) === 0 && trade.buyer.toLowerCase() === account.toLowerCase()) {
                            const escrowAddress = await escrowContract.getAddress();
                            const allowance = await tokenContract.allowance(account, escrowAddress);
                            if (allowance >= trade.amount) {
                                hasAllowance = true;
                            }
                        }
                    } catch (e) {
                        console.warn("Check allowance failed", e);
                    }

                    list.push({
                        id: i,
                        buyer: trade.buyer,
                        seller: trade.seller,
                        amount: trade.amount,
                        description: trade.description,
                        status: Number(trade.status),
                        rating: Number(trade.rating),
                        trackingNumber: trade.trackingNumber || "",
                        shippingMethod: trade.shippingMethod || "",
                        remarks: trade.remarks || "",
                        hasAllowance
                    });
                }
            }

            setTrades(list);

            // 检查是否有刚操作完但状态还没变的交易 (尝试解决 RPC 同步延迟)
            const isAnyCreated = list.some(t => t.status === 0);
            if (retryCount < 4 && isAnyCreated && total > clearedId) {
                // 如果列表中还有 Created 状态，尝试多刷几次确保同步
                console.log(`[TradeList] Possible sync lag detected, retry ${retryCount + 1}...`);
                setTimeout(() => fetchTrades(retryCount + 1), 1500);
            }

        } catch (e) {
            console.error("Fetch trades failed:", e);
            if (trades.length === 0) {
                const mockData: Trade[] = [
                    {
                        id: 1,
                        buyer: "0xBuyer...",
                        seller: "0xSeller...",
                        amount: ethers.parseUnits("100", 18),
                        description: "Demo Trade: AXCNH Payment (Fallback Data)",
                        status: 1,
                        rating: 0,
                        trackingNumber: "",
                        shippingMethod: "",
                        remarks: ""
                    }
                ];
                setTrades(mockData);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (escrowContract) {
            fetchTrades();
            (window as any).refreshTrades = fetchTrades;
            const interval = setInterval(() => {
                fetchTrades();
            }, 10000);
            return () => {
                clearInterval(interval);
                delete (window as any).refreshTrades;
            };
        }
    }, [escrowContract]);

    useEffect(() => {
        if (userRole === 'exporter') {
            setSubTab('sales');
        } else if (userRole === 'importer') {
            setSubTab('purchases');
        }
    }, [userRole]);

    const handleClear = async () => {
        if (!escrowContract) return;
        try {
            const counter = await escrowContract.tradeCounter();
            localStorage.setItem('cstpg_cleared_id', counter.toString());
            setTrades([]);
        } catch (e) {
            console.error(e);
            if (trades.length > 0) {
                const maxId = Math.max(...trades.map(t => t.id));
                localStorage.setItem('cstpg_cleared_id', maxId.toString());
                setTrades([]);
            }
        }
    };

    const handleTransaction = async (tradeId: number, method: string, ...args: any[]) => {
        if (!escrowContract) return;
        setActionLoading(tradeId);
        try {
            console.log(`[Escrow] Calling ${method} with args:`, args);
            // @ts-ignore
            const tx = await escrowContract[method](...args);
            const receipt = await tx.wait();
            console.log(`[Escrow] ${method} success:`, receipt.hash);

            // 乐观更新：本地立即翻转状态
            setTrades(prev => prev.map(t => {
                if (t.id === tradeId) {
                    if (method === 'depositFunds') return { ...t, status: 1 };
                    if (method === 'confirmShipment') return { ...t, status: 2 };
                    if (method === 'confirmReceipt') return { ...t, status: 3 };
                    if (method === 'confirmReceiptAndRate') return { ...t, status: 3, rating: args[1] }; // args[0] is tradeId, args[1] is rating
                }
                return t;
            }));

            setModalState({
                isOpen: true,
                title: t('trade.modals.op_success'),
                message: t('trade.modals.op_success_desc'),
                iconType: 'success'
            });

            fetchTrades();
            if (typeof (window as any).refreshBalance === 'function') {
                (window as any).refreshBalance();
            }
        } catch (e: any) {
            console.error(e);
            let errorMessage = e.reason || e.message;

            // 拦截 OpenZeppelin ERC20InsufficientBalance (0xe450d38c)
            if (e.data?.includes('0xe450d38c') || e.message?.includes('0xe450d38c')) {
                errorMessage = t('trade.modals.insufficient_balance');
            }

            setModalState({
                isOpen: true,
                title: t('trade.modals.tx_failed'),
                message: errorMessage,
                iconType: 'info'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeposit = async (trade: Trade) => {
        if (!tokenContract || !escrowContract || !account || !currencyConverterContract) return;
        setActionLoading(trade.id);
        try {
            const escrowAddress = await escrowContract.getAddress();
            const converterAddress = await currencyConverterContract.getAddress();
            const usdtAddress = (ContractAddresses as any).USDT;
            const usdtContractRef = (tokenMap as any).USDT;

            // Prioritize USDT payment flow as requested by user
            console.log("[TradeList] Initiating USDT payment flow...");

            // First, calculate how much USDT is needed
            const rate = await currencyConverterContract.rates(usdtAddress);
            if (rate === 0n) throw new Error("USDT rate not set in converter");

            // amountOut = (amountIn * 1e18) / rate => amountIn = (amountOut * rate) / 1e18
            const usdtNeeded = (trade.amount * rate) / ethers.parseUnits("1", 18);
            console.log(`[TradeList] USDT needed: ${ethers.formatUnits(usdtNeeded, 18)}, Current rate: ${ethers.formatUnits(rate, 18)}`);

            // Check USDT balance
            const usdtBalance = await usdtContractRef.balanceOf(account);
            console.log(`[TradeList] USDT balance: ${ethers.formatUnits(usdtBalance, 18)}`);

            if (usdtBalance >= usdtNeeded) {
                // Step 1: Approve USDT for converter
                const usdtAllowance = await usdtContractRef.allowance(account, converterAddress);
                if (usdtAllowance < usdtNeeded) {
                    setModalState({
                        isOpen: true,
                        title: t('trade.modals.payment_step_1'),
                        message: t('trade.modals.payment_step_1_desc', { amount: ethers.formatUnits(usdtNeeded, 12 + 6) }), // Use a cleaner format if possible, but usdt is 18 decimals in mock
                        iconType: 'info'
                    });
                    const approveTx = await usdtContractRef.approve(converterAddress, usdtNeeded);
                    await approveTx.wait();
                }

                // Step 2: Pay with Token
                setModalState({
                    isOpen: true,
                    title: t('trade.modals.payment_step_2'),
                    message: t('trade.modals.payment_step_4_desc'),
                    iconType: 'info'
                });

                const tx = await currencyConverterContract.payWithToken(
                    usdtAddress,
                    usdtNeeded,
                    escrowAddress,
                    trade.id
                );
                await tx.wait();
            } else {
                // If user doesn't have USDT but has AXCNH, fall back to AXCNH (to avoid blocking)
                const axcnhBalance = await tokenContract.balanceOf(account);
                if (axcnhBalance >= trade.amount) {
                    console.log("[TradeList] Insufficient USDT but has AXCNH, falling back to direct AXCNH payment");
                    const allowance = await tokenContract.allowance(account, escrowAddress);
                    if (allowance < trade.amount) {
                        const approveTx = await tokenContract.approve(escrowAddress, trade.amount);
                        await approveTx.wait();
                    }
                    await handleTransaction(trade.id, 'depositFunds', trade.id);
                } else {
                    throw new Error(t('trade.modals.insufficient_usdt', { needed: ethers.formatUnits(usdtNeeded, 18) }));
                }
            }

            fetchTrades();
        } catch (e: any) {
            console.error(e);
            setModalState({
                isOpen: true,
                title: t('trade.modals.op_failed'),
                message: e.reason || e.message,
                iconType: 'info'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleShip = async (trade: Trade) => {
        setShipModalTrade(trade);
    };

    const confirmShipment = async (trackingNumber: string, shippingMethod: string, remarks: string) => {
        if (!shipModalTrade) return;
        const tradeId = shipModalTrade.id;
        setShipModalTrade(null);
        await handleTransaction(tradeId, 'confirmShipment', tradeId, trackingNumber, shippingMethod, remarks);
    };

    const handleReceive = async (trade: Trade) => {
        setRateModalTrade(trade);
    };

    const confirmReceiptAndRate = async (rating: number) => {
        if (!rateModalTrade) return;
        const tradeId = rateModalTrade.id;
        setRateModalTrade(null);
        await handleTransaction(tradeId, 'confirmReceiptAndRate', tradeId, rating);
    };

    const handleRate = async (trade: Trade, rating: number) => {
        await handleTransaction(trade.id, 'rateExporter', trade.id, rating);
    };

    const handleCancel = async (trade: Trade) => {
        await handleTransaction(trade.id, 'cancelTrade', trade.id);
    };

    const renderAction = (trade: Trade) => {
        const isBuyer = account && trade.buyer.toLowerCase() === account.toLowerCase();
        const isSeller = account && trade.seller.toLowerCase() === account.toLowerCase();
        const isLoading = actionLoading === trade.id;

        console.log(`[ActionRender] ID=${trade.id}, status=${trade.status}, isBuyer=${isBuyer}, isSeller=${isSeller}, acc=${account?.substring(0, 6)}`);

        if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Loader2 className="animate-spin" size={24} color="#8b5cf6" /></div>;

        const roleBadge = () => {
            if (isBuyer) return <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', borderRadius: '4px', fontWeight: 600 }}>{t('trade.labels.role_buyer')}</span>;
            if (isSeller) return <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc', borderRadius: '4px', fontWeight: 600 }}>{t('trade.labels.role_seller')}</span>;
            return null;
        };

        if (trade.status === TradeStatus.Created) {
            if (isBuyer) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ marginBottom: '4px' }}>{roleBadge()}</div>
                        <button
                            onClick={() => handleDeposit(trade)}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', fontWeight: 600 }}
                        >
                            {trade.hasAllowance ? t('trade.actions.pay_deposit') : t('trade.actions.deposit')}
                        </button>
                        <button
                            onClick={() => handleCancel(trade)}
                            style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: 'none', fontWeight: 600, fontSize: '0.8rem', padding: '4px' }}
                        >
                            {t('trade.actions.cancel')}
                        </button>
                    </div>
                );
            }
            return <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>{t('trade.status.waiting')}</div>;
        }

        if (trade.status === TradeStatus.Locked) {
            if (isSeller) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ marginBottom: '4px' }}>{roleBadge()}</div>
                        <button
                            onClick={() => handleShip(trade)}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #fbbf24, #d97706)', fontWeight: 600, color: '#000' }}
                        >
                            {t('trade.actions.confirm_shipment')}
                        </button>
                    </div>
                );
            }
            return <div className="badge badge-locked" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.waiting_shipment')}</div>;
        }

        if (trade.status === TradeStatus.Shipped) {
            if (isBuyer) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ marginBottom: '4px' }}>{roleBadge()}</div>
                        <button
                            onClick={() => handleReceive(trade)}
                            style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', fontWeight: 600 }}
                        >
                            {t('trade.actions.receive_and_release')}
                        </button>
                    </div>
                );
            }
            return <div className="badge badge-locked" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>{t('trade.status.shipping')}</div>;
        }

        if (trade.status === TradeStatus.Received) {
            if (trade.rating > 0) {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.6rem', borderRadius: '8px' }}>
                        {[...Array(trade.rating)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" />)}
                        <span style={{ fontSize: '0.9rem', marginLeft: '4px', fontWeight: 600 }}>{t('trade.labels.rated')}</span>
                    </div>
                );
            }
            if (isBuyer) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>{t('trade.labels.rate_prompt')}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => handleRate(trade, star)}
                                    style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                >
                                    <Star size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                );
            }
            return <div className="badge badge-released" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.released')}</div>;
        }
        if (trade.status === TradeStatus.Cancelled) return <div className="badge badge-cancelled" style={{ width: '100%', textAlign: 'center', padding: '0.6rem', boxSizing: 'border-box' }}>{t('trade.status.cancelled')}</div>;
        return null;
    };

    const filteredTrades = trades.filter(t => {
        if (!account) return false;
        if (subTab === 'purchases') {
            return t.buyer.toLowerCase() === account.toLowerCase();
        } else {
            return t.seller.toLowerCase() === account.toLowerCase();
        }
    });

    const [rates, setRates] = useState<Record<string, bigint>>({});

    const fetchRates = async () => {
        if (!currencyConverterContract) return;
        try {
            const usdtAddress = (ContractAddresses as any).USDT;
            const usdcAddress = (ContractAddresses as any).USDC;
            const usdtRate = await currencyConverterContract.rates(usdtAddress);
            const usdcRate = await currencyConverterContract.rates(usdcAddress);
            setRates({ USDT: usdtRate, USDC: usdcRate });
        } catch (e) {
            console.error("Fetch rates failed:", e);
        }
    };

    useEffect(() => {
        fetchRates();
    }, [currencyConverterContract]);

    const renderTradeAmount = (trade: Trade) => {
        const isBuyer = account && trade.buyer.toLowerCase() === account.toLowerCase();

        if (isBuyer && rates.USDT && rates.USDT > 0n) {
            try {
                // axcnh (trade.amount) -> usdt = (axcnh * rate) / 1e18
                const usdtAmount = (trade.amount * rates.USDT) / ethers.parseUnits("1", 18);
                // Round to avoid 3.9999999999999999 USDT issue
                const formatted = parseFloat(ethers.formatUnits(usdtAmount, 18)).toFixed(4);
                return <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{formatted} USDT</span>;
            } catch (e) {
                console.error("[TradeList] Conversion failed in render", e);
            }
        }

        return <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{ethers.formatUnits(trade.amount, 18)} AXCNH</span>;
    };

    return (
        <div className="card">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 style={{ margin: 0 }}>{t('trade.list_title')}</h2>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                            onClick={() => setSubTab('purchases')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: subTab === 'purchases' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: subTab === 'purchases' ? '#a5b4fc' : '#94a3b8',
                                fontSize: '0.85rem',
                                fontWeight: subTab === 'purchases' ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t('trade.labels.my_purchases')}
                        </button>
                        <button
                            onClick={() => setSubTab('sales')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: subTab === 'sales' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                color: subTab === 'sales' ? '#d8b4fe' : '#94a3b8',
                                fontSize: '0.85rem',
                                fontWeight: subTab === 'sales' ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t('trade.labels.my_sales')}
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {account && (
                        <div style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(99, 102, 241, 0.2)', marginRight: '10px' }}>
                            {subTab === 'purchases' ? t('trade.labels.buyer_addr') : t('trade.labels.seller_addr')}: {account.substring(0, 6)}...{account.substring(account.length - 4)}
                        </div>
                    )}
                    <button
                        onClick={handleClear}
                        style={{ padding: '0.4rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                        title={t('trade.clear_history')}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => fetchTrades(0)}
                        style={{ padding: '0.4rem', borderRadius: '50%' }}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {filteredTrades.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>{t('trade.no_trades')}</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredTrades.map(trade => (
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
                                {renderTradeAmount(trade)}
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
                                {(trade.status >= TradeStatus.Shipped || trade.trackingNumber) && (
                                    <div style={{ marginTop: '0.4rem', padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.75rem', marginBottom: '2px' }}>{t('trade.labels.logistics')}</div>
                                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                            <span>{t('trade.labels.tracking')}: {trade.trackingNumber}</span>
                                            <span>{t('trade.labels.method')}: {trade.shippingMethod}</span>
                                        </div>
                                        {trade.remarks && (
                                            <div style={{ marginTop: '0.4rem', borderTop: '1px solid rgba(16, 185, 129, 0.1)', paddingTop: '0.4rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                                                <span style={{ color: '#10b981', fontWeight: 600 }}>{t('trade.labels.remarks')}:</span> {trade.remarks}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '0.4rem' }}>
                                {renderAction(trade)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <InfoModal
                isOpen={modalState.isOpen}
                title={modalState.title}
                message={modalState.message}
                iconType={modalState.iconType}
                onConfirm={modalState.onConfirm || (() => setModalState(s => ({ ...s, isOpen: false })))}
                buttonText={modalState.onConfirm ? t('trade.actions.sign_and_pay') : t('trade.modals.ok')}
            />
            <ShipModal
                isOpen={!!shipModalTrade}
                onClose={() => setShipModalTrade(null)}
                onConfirm={confirmShipment}
            />

            {rateModalTrade && (
                <RateAndConfirmModal
                    isOpen={!!rateModalTrade}
                    onClose={() => setRateModalTrade(null)}
                    onConfirm={(rating) => confirmReceiptAndRate(rating)}
                    trade={rateModalTrade!}
                />
            )}
        </div>
    );
};

interface RateAndConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (rating: number) => void;
    trade: Trade;
}

const RateAndConfirmModal = ({ isOpen, onClose, onConfirm, trade }: RateAndConfirmModalProps) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="animate-scale-in" style={{
                background: '#1e293b', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', textAlign: 'center' }}>{t('trade.modals.confirm_receipt_title')}</h3>
                <div style={{ fontSize: '0.8rem', color: '#6366f1', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {t('trade.modals.order')} #{trade.id}: {trade.description}
                </div>

                <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    {t('trade.modals.confirm_receipt_desc')}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                                background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
                                transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Star
                                size={32}
                                fill={(hoverRating || rating) >= star ? "#fbbf24" : "none"}
                                color={(hoverRating || rating) >= star ? "#fbbf24" : "#64748b"}
                            />
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'transparent', color: '#cbd5e1', cursor: 'pointer'
                        }}
                    >
                        {t('trade.modals.cancel')}
                    </button>
                    <button
                        onClick={() => onConfirm(rating)}
                        style={{
                            flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                            background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        {t('trade.modals.confirm_and_release')}
                    </button>
                </div>
            </div>
        </div>
    );
};
