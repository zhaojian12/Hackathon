import React, { useState } from 'react';
import { X, Truck, ClipboardList, PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ShipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (trackingNumber: string, shippingMethod: string, remarks: string) => void;
}

export const ShipModal: React.FC<ShipModalProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    const { t } = useTranslation();
    const [trackingNumber, setTrackingNumber] = useState('SF12345678');
    const [shippingMethod, setShippingMethod] = useState(t('trade.labels.method_placeholder').split(' / ')[0].replace('如：', ''));
    const [remarks, setRemarks] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(trackingNumber, shippingMethod, remarks);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(12px)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '28px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '1.5rem',
                        top: '1.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#475569',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(56, 189, 248, 0.1)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8'
                    }}>
                        <Truck size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>{t('trade.shipment_modal.title')}</h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>{t('trade.shipment_modal.desc')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ClipboardList size={14} /> {t('trade.labels.tracking')}
                        </label>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder={t('trade.labels.tracking_placeholder')}
                            required
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={14} /> {t('trade.labels.method')}
                        </label>
                        <input
                            type="text"
                            value={shippingMethod}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            placeholder={t('trade.labels.method_placeholder')}
                            required
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <PenTool size={14} /> {t('trade.labels.remarks')}
                        </label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={t('trade.labels.remarks_placeholder')}
                            rows={3}
                            style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                resize: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            borderRadius: '14px',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
                            marginTop: '1rem'
                        }}
                    >
                        {t('trade.actions.confirm_and_submit_shipment')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#475569' }}>
                    PayFi Logistics Synchronization Protocol
                </div>
            </div>
        </div>
    );
};
