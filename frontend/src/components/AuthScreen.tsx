import { useState } from 'react';
import { ArrowRight, ShieldCheck, Globe, Smartphone, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AuthScreenProps {
    onLogin: (addr: string) => void;
}

export const AuthScreen = ({ onLogin }: AuthScreenProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState<string | null>(null);
    const [phone, setPhone] = useState('');

    const handleSocialLogin = (type: string) => {
        setLoading(type);
        // 模拟认证过程
        setTimeout(() => {
            onLogin(`${type.toLowerCase()}_user@example.com`);
            setLoading(null);
        }, 1500);
    };

    return (
        <div className="auth-container" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <div className="auth-card card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Globe size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>{t('app.title')}</h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{t('auth.subtitle')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="social-btn"
                        onClick={() => handleSocialLogin('Google')}
                        disabled={!!loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'white',
                            color: '#1e293b',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading === 'Google' ? <Loader2 size={20} className="animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px', height: '18px' }} />}
                        {t('auth.google_login')}
                    </button>

                    <button
                        className="social-btn"
                        onClick={() => handleSocialLogin('Apple')}
                        disabled={!!loading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '12px',
                            background: '#000',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.2)',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {loading === 'Apple' ? <Loader2 size={20} className="animate-spin" /> : <img src="https://www.apple.com/favicon.ico" alt="Apple" style={{ width: '18px', height: '18px' }} />}
                        {t('auth.apple_login')}
                    </button>

                    <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{t('auth.or_phone')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    </div>

                    <div style={{ position: 'relative', marginBottom: '0' }}>
                        <Smartphone size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: '#94a3b8' }} />
                        <input
                            type="tel"
                            placeholder={t('auth.phone_login_placeholder')}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => handleSocialLogin('Phone')}
                        disabled={!!loading}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            gap: '8px'
                        }}>
                        {loading === 'Phone' ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                        {t('auth.phone_login_button')}
                    </button>
                </div>

                <div style={{
                    marginTop: '2.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.05)',
                    border: '1px solid rgba(34, 197, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px',
                    textAlign: 'left'
                }}>
                    <ShieldCheck size={20} style={{ color: '#22c55e', marginTop: '2px' }} />
                    <div>
                        <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px' }}>{t('auth.protected_account')}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{t('auth.protected_desc')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
