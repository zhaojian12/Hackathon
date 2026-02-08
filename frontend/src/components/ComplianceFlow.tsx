import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCheck, Link, FileSearch, CheckCircle2, ExternalLink } from 'lucide-react';

export const ComplianceFlow: React.FC = () => {
    const { t } = useTranslation();

    const flowSteps = [
        {
            id: 'kyc',
            icon: UserCheck,
            title: t('dashboard.compliance.steps.kyc.title'),
            desc: t('dashboard.compliance.steps.kyc.desc'),
            status: t('dashboard.compliance.steps.kyc.status'),
            color: '#6366f1'
        },
        {
            id: 'wallet',
            icon: Link,
            title: t('dashboard.compliance.steps.wallet.title'),
            desc: t('dashboard.compliance.steps.wallet.desc'),
            status: t('dashboard.compliance.steps.wallet.status'),
            color: '#8b5cf6'
        },
        {
            id: 'audit',
            icon: FileSearch,
            title: t('dashboard.compliance.steps.audit.title'),
            desc: t('dashboard.compliance.steps.audit.desc'),
            status: t('dashboard.compliance.steps.audit.status'),
            color: '#4ade80'
        }
    ];

    const mockAuditLogs = [
        { txId: '0xab12...c98', type: 'KYC_VERIFIED', time: '2026-02-08 14:22:10', status: 'COMPLIANT' },
        { txId: '0x7d34...f21', type: 'WALLET_BOUND', time: '2026-02-08 14:25:05', status: 'COMPLIANT' },
        { txId: '0x9e56...d44', type: 'ESCROW_PAYMENT', time: '2026-02-09 09:15:33', status: 'COMPLIANT' },
    ];

    return (
        <div className="compliance-flow-container" style={{ color: '#fff' }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShieldCheck className="text-primary" />
                        {t('dashboard.compliance.title')}
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
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}>
                        <CheckCircle2 size={16} />
                        {t('dashboard.compliance.shield_status')}
                    </div>
                </div>

                {/* Stepper Flow */}
                <div style={{ position: 'relative', marginBottom: '3rem' }}>
                    <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '50px',
                        right: '50px',
                        height: '2px',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                    }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', position: 'relative', zIndex: 1 }}>
                        {flowSteps.map((step, i) => (
                            <div key={step.id} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: i < 3 ? `rgba(99, 102, 241, 0.1)` : 'rgba(255,255,255,0.05)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    border: `2px solid ${step.color}`,
                                    boxShadow: `0 0 20px ${step.color}33`,
                                    position: 'relative'
                                }}>
                                    <step.icon size={32} style={{ color: step.color }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-5px',
                                        right: '-5px',
                                        background: '#4ade80',
                                        borderRadius: '50%',
                                        padding: '2px',
                                        border: '2px solid #0f172a'
                                    }}>
                                        <CheckCircle2 size={14} color="#0f172a" />
                                    </div>
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{step.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', maxWidth: '200px' }}>{step.desc}</p>
                                <span style={{ marginTop: '12px', fontSize: '0.75rem', padding: '4px 12px', background: `${step.color}22`, color: step.color, borderRadius: '100px', fontWeight: 600 }}>{step.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Logs Section */}
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{t('dashboard.compliance.audit_title')}</h4>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{t('dashboard.compliance.audit_desc')}</p>
                        </div>
                        <button style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {t('dashboard.compliance.report_btn')}
                            <ExternalLink size={14} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mockAuditLogs.map((log, i) => (
                            <div key={i} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1.5fr 1.2fr 0.8fr',
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                alignItems: 'center',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{log.type}</span>
                                <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{log.txId}</span>
                                <span style={{ color: '#64748b' }}>{log.time}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', justifyContent: 'flex-end' }}>
                                    <ShieldCheck size={14} />
                                    {log.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                    .text-primary { color: #8b5cf6; }
                `}</style>
            </div>
        </div>
    );
};
