import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TradeCreator } from './TradeCreator';
import { TradeList } from './TradeList';
import { CurrencyExchange } from './CurrencyExchange';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { useApp } from '../AppContext';
import { ProductMarket } from './ProductMarket';
import { Wallet, CheckCircle2, AlertCircle, ShoppingBag, ArrowRightLeft, List } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import ContractAddresses from '../contracts/contract-addresses.json';

interface DashboardProps {
    onNavigate: (page: string) => void;
}

type TabType = 'market' | 'exchange' | 'payment' | 'orders';

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const { userRole, setUserRole, escrowContract, account, currencyConverterContract } = useApp();
    const [prefillOrder, setPrefillOrder] = useState<any>(null);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<TabType>('market');

    // Adjust default tab based on role
    useEffect(() => {
        if (userRole === 'exporter' && (activeTab === 'market' || activeTab === 'payment')) {
            setActiveTab('orders');
        }
    }, [userRole]);

    const handleBuy = (product: any) => {
        setSelectedProduct(product);
        setIsConfirmOpen(true);
    };

    const executePurchase = async () => {
        if (!selectedProduct) return;
        setIsConfirmOpen(false);

        if (!escrowContract || !account) {
            alert(t('common.connect_first'));
            return;
        }

        try {
            setPurchaseLoading(true);

            let axcnhAmount = ethers.parseUnits(selectedProduct.price, 18);

            // Fetch current rate to convert USDT to AXCNH
            // If the product price is in USDT, we should convert it to AXCNH for the escrow contract
            if (currencyConverterContract) {
                try {
                    const usdtAddress = (ContractAddresses as any).USDT;
                    const rate = await currencyConverterContract.rates(usdtAddress);
                    console.log(`[Dashboard] Fetched USDT rate for ${usdtAddress}: ${rate.toString()}`);
                    if (rate > 0n) {
                        // rate is how many USDT for 1 AXCNH (18 decimals)
                        // axcnhAmount = usdtAmount / rate * 1e18
                        const usdtAmount = ethers.parseUnits(selectedProduct.price, 18);
                        axcnhAmount = (usdtAmount * ethers.parseUnits("1", 18)) / rate;
                        console.log(`[Dashboard] Converting ${selectedProduct.price} USDT to ${ethers.formatUnits(axcnhAmount, 18)} AXCNH (Rate: ${ethers.formatUnits(rate, 18)})`);
                    } else {
                        console.warn("[Dashboard] USDT rate is 0 on-chain, using 1:1 fallback");
                    }
                } catch (rateError) {
                    console.warn("[Dashboard] Failed to fetch rate, using fallback 1:7", rateError);
                    // Fallback: 1 USDT = 7 AXCNH -> 1 AXCNH = 0.14 USDT
                    const fallbackAxcnh = parseFloat(selectedProduct.price) * 7.14;
                    axcnhAmount = ethers.parseUnits(fallbackAxcnh.toFixed(2), 18);
                }
            }

            const tx = await escrowContract.createTrade(
                selectedProduct.seller,
                axcnhAmount,
                t('dashboard.status.creating_trade_for_usdt', { name: selectedProduct.name, price: selectedProduct.price })
            );
            await tx.wait();

            setPurchaseSuccess(true);
            setTimeout(() => setPurchaseSuccess(false), 5000);

            if (typeof (window as any).refreshTrades === 'function') {
                setTimeout(() => (window as any).refreshTrades(), 1500);
            }

            // Switch to orders tab to see the new trade
            setActiveTab('orders');
        } catch (e: any) {
            console.error(e);
            alert(t('dashboard.errors.create_failed', { message: e.reason || e.message }));
        } finally {
            setPurchaseLoading(false);
            setSelectedProduct(null);
        }
    };

    const tabs = [
        { id: 'market', label: t('dashboard.tabs.market'), icon: ShoppingBag, roles: ['importer'] },
        { id: 'exchange', label: t('dashboard.tabs.exchange'), icon: ArrowRightLeft, roles: ['importer', 'exporter'] },
        { id: 'payment', label: t('dashboard.tabs.payment'), icon: Wallet, roles: ['importer'] },
        { id: 'orders', label: t('dashboard.tabs.orders'), icon: List, roles: ['importer', 'exporter'] },
    ];

    return (
        <div className="dashboard-container">
            <Header onNavigate={onNavigate} />

            <main className="dashboard-content" style={{ position: 'relative', zIndex: 1, paddingBottom: '40px' }}>
                {/* Background Glows */}
                <div style={{ position: 'fixed', top: '20%', left: '10%', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(100px)', pointerEvents: 'none', borderRadius: '50%' }} />
                <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'rgba(168, 85, 247, 0.08)', filter: 'blur(120px)', pointerEvents: 'none', borderRadius: '50%' }} />

                <div className="welcome-banner" style={{
                    marginBottom: '2rem',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {t('app.title')}
                            <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', borderRadius: '100px', fontWeight: 600 }}>{t('dashboard.status.connected')}</span>
                        </h1>
                        <p style={{ color: '#94a3b8', margin: '8px 0 0 0' }}>{t('dashboard.welcome_back')}</p>
                    </div>

                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '1px'
                }}>
                    {tabs.map(tab => {
                        if (!userRole || !tab.roles.includes(userRole)) return null;
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: isActive ? '2px solid #8b5cf6' : '2px solid transparent',
                                    color: isActive ? '#a5b4fc' : '#94a3b8',
                                    fontSize: '1rem',
                                    fontWeight: isActive ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    borderRadius: '8px 8px 0 0'
                                }}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="main-content">
                    {purchaseSuccess && (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            padding: '1rem',
                            borderRadius: '16px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <CheckCircle2 size={20} />
                            {t('dashboard.success.trade_created')}
                        </div>
                    )}

                    {purchaseLoading && (
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            padding: '1rem',
                            borderRadius: '16px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <AlertCircle size={20} className="animate-pulse" />
                            {t('dashboard.status.creating')}
                        </div>
                    )}

                    {activeTab === 'market' && userRole === 'importer' && (
                        <div className="animate-fade-in">
                            <ProductMarket onBuy={handleBuy} />
                        </div>
                    )}

                    {activeTab === 'exchange' && (
                        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <CurrencyExchange />
                        </div>
                    )}

                    {activeTab === 'payment' && userRole === 'importer' && (
                        <div className="animate-fade-in">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.2rem' }}>
                                <Wallet className="text-primary" />
                                {t('dashboard.tabs.payment')}
                            </h2>
                            <TradeCreator prefill={prefillOrder} onClearPrefill={() => setPrefillOrder(null)} />
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="animate-fade-in">
                            <TradeList />
                        </div>
                    )}
                </div>
            </main>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                title={t('dashboard.modals.confirm_title')}
                productName={selectedProduct?.name || ''}
                price={selectedProduct?.price || '0'}
                seller={selectedProduct?.seller || ''}
                onConfirm={executePurchase}
                onCancel={() => {
                    setIsConfirmOpen(false);
                    setSelectedProduct(null);
                }}
            />
        </div>
    );
};

