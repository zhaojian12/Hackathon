import { X, Info, Zap, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InfoModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    iconType?: 'info' | 'zap' | 'success';
    onConfirm: () => void;
    buttonText?: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    title,
    message,
    iconType = 'info',
    onConfirm,
    buttonText
}) => {
    const { t } = useTranslation();
    const displayButtonText = buttonText || t('trade.modals.ok');
    if (!isOpen) return null;

    const getIcon = () => {
        switch (iconType) {
            case 'zap': return <Zap size={32} />;
            case 'success': return <ShieldCheck size={32} />;
            default: return <Info size={32} />;
        }
    };

    const getIconColor = () => {
        switch (iconType) {
            case 'zap': return '#a855f7';
            case 'success': return '#10b981';
            default: return '#6366f1';
        }
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
                maxWidth: '420px',
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '28px',
                padding: '2.5rem 2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                position: 'relative',
                textAlign: 'center'
            }}>
                <button
                    onClick={onConfirm}
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

                <div style={{
                    width: '64px',
                    height: '64px',
                    background: `rgba(${iconType === 'zap' ? '168, 85, 247' : '99, 102, 241'}, 0.1)`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    color: getIconColor()
                }}>
                    {getIcon()}
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>{title}</h2>

                <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                    whiteSpace: 'pre-wrap'
                }}>
                    {message}
                </p>

                <button
                    onClick={onConfirm}
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
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    {displayButtonText}
                </button>

                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#475569' }}>
                    PayFi Smart Banking Protocol
                </div>
            </div>
        </div>
    );
};
