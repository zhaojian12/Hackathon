import React from 'react';
import { useTranslation } from 'react-i18next';
import { Rocket, Users, Globe, Network, TrendingUp } from 'lucide-react';

export const EcosystemVision: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="ecosystem-vision-container" style={{ color: '#fff' }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '2.5rem',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <Rocket className="text-secondary" size={32} />
                        {t('dashboard.ecosystem.title')}
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
                        {t('dashboard.ecosystem.vision_desc')}
                    </p>
                </div>

                {/* Animated Ecosystem Map */}
                <div style={{ position: 'relative', height: '400px', width: '100%', margin: '0 auto', maxWidth: '900px' }}>

                    {/* SVG Light Beams */}
                    <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0, top: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                                <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                                <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Paths */}
                        <path d="M 150,200 L 750,200" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />

                        {/* Moving Light Beams */}
                        <circle r="3" fill="#a855f7">
                            <animateMotion dur="3s" repeatCount="indefinite" path="M 150,200 L 750,200" />
                            <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <circle r="3" fill="#6366f1">
                            <animateMotion dur="4s" repeatCount="indefinite" path="M 150,120 L 450,200" />
                            <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <circle r="3" fill="#ec4899">
                            <animateMotion dur="5s" repeatCount="indefinite" path="M 450,200 L 750,280" />
                            <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" />
                        </circle>
                    </svg>

                    {/* Nodes (Strategic Cards) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', zIndex: 1, height: '100%', justifyContent: 'center' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            {/* Merchant Node */}
                            <div className="vision-card" style={cardStyle('#6366f1')}>
                                <Users size={24} style={{ color: '#6366f1', marginBottom: '12px' }} />
                                <h4 style={{ margin: '0 0 8px 0' }}>{t('dashboard.ecosystem.points.retention.title')}</h4>
                                <p style={descStyle}>{t('dashboard.ecosystem.points.retention.desc')}</p>
                            </div>

                            {/* CFX Core Node */}
                            <div className="vision-card" style={{ ...cardStyle('#a855f7'), transform: 'scale(1.1)', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                <TrendingUp size={32} style={{ color: '#a855f7', marginBottom: '12px' }} />
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{t('dashboard.ecosystem.points.cfx_loop.title')}</h4>
                                <p style={descStyle}>{t('dashboard.ecosystem.points.cfx_loop.desc')}</p>
                            </div>

                            {/* Cross-chain Node */}
                            <div className="vision-card" style={cardStyle('#ec4899')}>
                                <Globe size={24} style={{ color: '#ec4899', marginBottom: '12px' }} />
                                <h4 style={{ margin: '0 0 8px 0' }}>{t('dashboard.ecosystem.points.cross_chain.title')}</h4>
                                <p style={descStyle}>{t('dashboard.ecosystem.points.cross_chain.desc')}</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8' }}>
                        <Network size={18} />
                        {t('dashboard.ecosystem.strategy_title')}
                    </p>
                </div>

                <style>{`
                    .text-secondary { color: #a855f7; }
                    .vision-card {
                        width: 240px;
                        padding: 1.5rem;
                        background: rgba(15, 23, 42, 0.6);
                        border-radius: 20px;
                        backdrop-filter: blur(5px);
                        transition: all 0.3s ease;
                    }
                    .vision-card:hover {
                        transform: translateY(-5px);
                        background: rgba(15, 23, 42, 0.8);
                    }
                `}</style>
            </div>
        </div>
    );
};

const cardStyle = (color: string) => ({
    border: `1px solid ${color}33`,
    boxShadow: `0 0 20px ${color}11`
});

const descStyle = {
    margin: 0,
    fontSize: '0.8rem',
    color: '#94a3b8',
    lineHeight: 1.5
};
