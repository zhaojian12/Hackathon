import { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Star, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    name: string;
    price: string;
    description: string;
    seller: string;
    image: string;
}

const MOCK_PRODUCTS: Product[] = [
    {
        id: 'silk',
        name: 'Premium Silk',
        price: '14',
        description: 'High quality silk',
        seller: '0x917F5c844B8307aEeA3ecf755B6454889d1e45DF',
        image: 'https://lh3.googleusercontent.com/proxy/M-lk1v9Gx6fvLMm_ZfNOToE3LUi6bj_0WHZvVD2M2jLuFJMvA-Bh7AN3RdVP6TdldH2Gt0VLTmUDCrO_08FiRfrv4QYGSwpnbmlJ3l_1L5TlreNvp023C5WZuMYTs3L456TkT4zDzA63JoIjnt69fHyqrA0kUQVdCpw5dp6L2L2HtP2pR92ByYAodrfhig'
    },
    {
        id: 'porcelain',
        name: 'Fine Porcelain',
        price: '4',
        description: 'Traditional craftsmanship',
        seller: '0x917F5c844B8307aEeA3ecf755B6454889d1e45DF',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=300&auto=format&fit=crop'
    }
];

export const ProductMarket = ({ onBuy }: { onBuy: (product: Product) => void }) => {
    const { t } = useTranslation();
    const { fetchReputation } = useApp();
    const [reputations, setReputations] = useState<Record<string, { rating: number, trades: number }>>({});

    useEffect(() => {
        const loadReputations = async () => {
            const uniqueSellers = Array.from(new Set(MOCK_PRODUCTS.map(p => p.seller)));
            const result: Record<string, { rating: number, trades: number }> = {};
            for (const seller of uniqueSellers) {
                const stats = await fetchReputation(seller);
                // Mock data fallback if on-chain data is empty (for demo purposes)
                if (stats.totalTrades === 0) {
                    result[seller] = { rating: 4.8, trades: 128 };
                } else {
                    result[seller] = { rating: stats.averageRating, trades: stats.totalTrades };
                }
            }
            setReputations(result);
        };
        loadReputations();
    }, [fetchReputation]);

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart className="text-primary" />
                {t('product_market.title')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {MOCK_PRODUCTS.map(product => {
                    const stats = reputations[product.seller] || { rating: 0, trades: 0 };
                    return (
                        <div key={product.id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                            <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.3 }}>{t(`product_market.products.${product.id}.name`)}</h3>
                                    <div style={{ color: '#8b5cf6', fontWeight: 800, fontSize: '1.1rem' }}>{product.price} USDT</div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0', lineHeight: 1.5 }}>{t(`product_market.products.${product.id}.desc`)}</p>

                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    padding: '0.8rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    fontSize: '0.8rem'
                                }}>
                                    <div style={{ color: '#64748b', marginBottom: '0.4rem' }}>{t('product_market.seller_rating')}:</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', color: '#fbbf24' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < Math.round(stats.rating) ? "#fbbf24" : "none"} />
                                            ))}
                                        </div>
                                        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{stats.rating.toFixed(1)}</span>
                                        <span style={{ color: '#64748b' }}>{t('product_market.trades_count', { count: stats.trades })}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: 'auto' }}
                                    onClick={() => onBuy(product)}
                                >
                                    {t('product_market.buy_now')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
