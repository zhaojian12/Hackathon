import { AppProvider } from './AppContext';
import { ConnectWallet } from './components/ConnectWallet';
import { TradeCreator } from './components/TradeCreator';
import { TradeList } from './components/TradeList';
import { Faucet } from './components/Faucet';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import './index.css';

function AppContent() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="language-switcher-container">
        <LanguageSwitcher />
      </div>

      <div className="connect-wallet-container">
        <ConnectWallet />
      </div>

      <h1>
        {t('app.title')}
        <div style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8', marginTop: '0.5rem' }}>
          {t('app.subtitle')}
        </div>
      </h1>

      <div className="grid-cols-2">
        <TradeCreator />
        <TradeList />
      </div>

      <Faucet />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App;
