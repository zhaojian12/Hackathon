import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    productName: string;
    price: string;
    seller: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    productName,
    price,
    seller,
    onConfirm,
    onCancel
}) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                animation: 'modalFadeIn 0.3s ease-out'
            }}>
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        right: '1.5rem',
                        top: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        color: '#6366f1'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h2>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '16px',
                    padding: '1.2rem',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('trade.modals.product_name')}</div>
                        <div style={{ fontWeight: 600 }}>{productName}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('trade.modals.amount_label')}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{price} <span style={{ fontSize: '0.9rem', color: '#6366f1' }}>AXCNH</span></div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('trade.modals.recipient')}</div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{seller.slice(0, 6)}...{seller.slice(-4)}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {t('trade.actions.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 2,
                            padding: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {t('trade.modals.init_trade')}
                        <ArrowRight size={18} />
                    </button>
                </div>

                <div style={{
                    marginTop: '1.2rem',
                    textAlign: 'center',
                    color: '#4ade80',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                }}>
                    <ShieldCheck size={12} />
                    {t('trade.modals.security_note')}
                </div>
            </div>
        </div>
    );
};
