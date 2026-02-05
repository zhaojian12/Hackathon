import React from 'react';
import { TradeCreator } from './TradeCreator';
import { TradeList } from './TradeList';
import { Faucet } from './Faucet';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';

interface DashboardProps {
    onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    return (
        <div className="dashboard-container">
            <Header onNavigate={onNavigate} />

            <main className="dashboard-content">
                <h1>
                    {t('app.title')}
                    <div className="subtitle">
                        {t('app.subtitle')}
                    </div>
                </h1>

                <div className="grid-cols-2">
                    <TradeCreator />
                    <TradeList />
                </div>

                <Faucet />
            </main>
        </div>
    );
};
