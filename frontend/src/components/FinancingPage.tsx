import React from 'react';
import { Header } from './Header';
import { useTranslation } from 'react-i18next';

interface FinancingPageProps {
    onNavigate: (page: string) => void;
}

export const FinancingPage: React.FC<FinancingPageProps> = ({ onNavigate }) => {
    const { t } = useTranslation();


    return (
        <div className="home-container">
            <Header onNavigate={onNavigate} />
            <main className="dashboard-content" style={{ textAlign: 'left', maxWidth: '900px' }}>
                <div
                    className="financing-card"
                    style={{
                        marginTop: '2rem',
                        // Background gradient to blend naturally
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)',
                        // Remove border as requested
                        border: 'none',
                        padding: '2rem',
                        borderRadius: '16px'
                    }}
                >
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('financing.title')}</h1>
                    <div className="subtitle" style={{ marginBottom: '3rem', fontSize: '1.2rem' }}>
                        {t('financing.subtitle')}
                    </div>

                    <h2 style={{ color: 'var(--accent-color)' }}>{t('financing.needs.title')}</h2>
                    <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        {t('financing.needs.desc')}
                    </p>
                    <ul style={{ color: '#e2e8f0', lineHeight: '2', margin: '1rem 0', paddingLeft: '1.5rem' }}>
                        {((t('financing.needs.items', { returnObjects: true }) as string[]) || []).map((item, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>
                                <span dangerouslySetInnerHTML={{ __html: item }} />
                            </li>
                        ))}
                    </ul>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '3rem 0' }}></div>

                    <h2 style={{ color: 'var(--accent-color)' }}>{t('financing.solution.title')}</h2>
                    <p style={{ color: '#94a3b8', lineHeight: '1.8', marginBottom: '2rem' }}>
                        {t('financing.solution.desc')}
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginTop: '1.5rem', color: '#fff', fontSize: '1.3rem' }}>{t('financing.solution.point1.title')}</h3>
                        <ul style={{ color: '#e2e8f0', lineHeight: '2', paddingLeft: '1.5rem' }}>
                            {((t('financing.solution.point1.items', { returnObjects: true }) as string[]) || []).map((item, index) => (
                                <li key={index} style={{ marginBottom: '0.5rem' }}>
                                    <span dangerouslySetInnerHTML={{ __html: item }} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ marginTop: '1.5rem', color: '#fff', fontSize: '1.3rem' }}>{t('financing.solution.point2.title')}</h3>
                        <ul style={{ color: '#e2e8f0', lineHeight: '2', paddingLeft: '1.5rem' }}>
                            {((t('financing.solution.point2.items', { returnObjects: true }) as string[]) || []).map((item, index) => (
                                <li key={index} style={{ marginBottom: '0.5rem' }}>
                                    <span dangerouslySetInnerHTML={{ __html: item }} />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main >
        </div >
    );
};
