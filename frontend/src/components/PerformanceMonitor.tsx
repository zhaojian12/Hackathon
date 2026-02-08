import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Zap, Cpu } from 'lucide-react';

export const PerformanceMonitor: React.FC = () => {
    const { t } = useTranslation();
    const [tps, setTps] = useState(482);
    const [load, setLoad] = useState(88);
    const peak = 1000;

    // Simulate real-time fluctuations
    useEffect(() => {
        const interval = setInterval(() => {
            setTps(prev => {
                const change = Math.floor(Math.random() * 21) - 10;
                const next = prev + change;
                return next > 450 && next < 550 ? next : prev;
            });

            setLoad(prev => {
                const change = Math.floor(Math.random() * 5) - 2;
                const next = prev + change;
                return next > 85 && next < 95 ? next : prev;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const metrics = [
        { label: t('dashboard.performance.current_tps'), value: tps, unit: t('dashboard.performance.tps_unit'), icon: Zap, color: '#4ade80' },
        { label: t('dashboard.performance.peak_tps'), value: peak, unit: t('dashboard.performance.tps_unit'), icon: Activity, color: '#f87171' },
        { label: t('dashboard.performance.load_capacity'), value: `${load}%`, unit: '', icon: Cpu, color: '#6366f1' },
    ];

    return (
        <div className="performance-monitor" style={{ color: '#fff' }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity className="text-primary" />
                        {t('dashboard.performance.title')}
                    </h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 16px',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '100px',
                        color: '#4ade80',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }} className="animate-pulse" />
                        {t('dashboard.performance.status_active')}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {metrics.map((m, i) => (
                        <div key={i} style={{
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <m.icon size={16} />
                                {m.label}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: m.color }}>
                                {m.value}
                                <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '6px', fontWeight: 400 }}>{m.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Load Indicator */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{t('dashboard.performance.desc')}</span>
                        <span style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>{load}% 优化中</span>
                    </div>
                    <div style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '100px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${load}%`,
                            background: 'linear-gradient(90deg, #6366f1, #4ade80)',
                            borderRadius: '100px',
                            transition: 'width 0.5s ease-out',
                            boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                        }} />
                    </div>
                </div>

                <style>{`
                    .text-primary { color: #8b5cf6; }
                `}</style>
            </div>
        </div>
    );
};
