import React from 'react';
import { Box, Wallet, Layers, Zap, Lock, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';

interface HomePageProps {
    onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="home-container">
            <Header onNavigate={onNavigate} />

            <main style={{ width: '100%' }}>
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            {t('home.hero_title')}
                        </h1>
                        <p className="hero-subtitle">
                            {t('home.hero_subtitle_1')}<br />
                            <span style={{ color: '#fbbf24' }}>{t('home.hero_subtitle_2')}</span>
                        </p>
                        <p className="hero-description">
                            {t('home.hero_desc')}
                        </p>

                        <div className="hero-cta-group">
                            <button className="btn-primary" onClick={() => onNavigate('dashboard')}>
                                {t('home.get_started')}
                            </button>
                            <button className="btn-secondary" onClick={() => onNavigate('financing')}>
                                {t('home.nav.financing')}
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="cyber-sphere">
                            <div className="cyber-ring"></div>
                        </div>
                    </div>
                </section>

                <div className="feature-cards" style={{ maxWidth: '1280px', margin: '0 auto 6rem', padding: '0 2rem' }}>
                    <div className="feature-card">
                        <div className="icon-wrapper">
                            <Box size={32} />
                        </div>
                        <h3>{t('home.features.stablecoin.title')}</h3>
                        <p>{t('home.features.stablecoin.desc')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-wrapper">
                            <Wallet size={32} />
                        </div>
                        <h3>{t('home.features.escrow.title')}</h3>
                        <p>{t('home.features.escrow.desc')}</p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-wrapper">
                            <Layers size={32} />
                        </div>
                        <h3>{t('home.features.finance.title')}</h3>
                        <p>{t('home.features.finance.desc')}</p>
                    </div>
                </div>

                <div className="advantages-section">
                    <h2>{t('home.advantages.title')}</h2>
                    <div className="advantages-grid">
                        <div className="advantage-item">
                            <div className="adv-icon"><Zap /></div>
                            <h4>{t('home.advantages.fast.title')}</h4>
                            <p>{t('home.advantages.fast.desc')}</p>
                        </div>
                        <div className="advantage-item active">
                            <div className="adv-icon"><Lock /></div>
                            <h4>{t('home.advantages.secure.title')}</h4>
                            <p>{t('home.advantages.secure.desc')}</p>
                        </div>
                        <div className="advantage-item">
                            <div className="adv-icon"><Activity /></div>
                            <h4>{t('home.advantages.low_cost.title')}</h4>
                            <p>{t('home.advantages.low_cost.desc')}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
