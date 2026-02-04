import { useState } from 'react';
import { AppProvider } from './AppContext';
import { ConnectWallet } from './components/ConnectWallet';
import { TradeCreator } from './components/TradeCreator';
import { TradeList } from './components/TradeList';
import { Faucet } from './components/Faucet';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { PopupAssistant } from './components/PopupAssistant';
import { LandingPage } from './components/LandingPage';
import { Logo } from './components/Logo';
import { useTranslation } from 'react-i18next';
import './index.css';

function AppContent() {
  const { t } = useTranslation();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  // Show landing page first
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div>
      {/* Logo */}
      {/* <Logo /> */}
      
      <div className="language-switcher-container">
        <LanguageSwitcher />
      </div>

      {/* 右上角按钮组 - Ask AI 和连接钱包 */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 100 }}>
        {/* Ask AI 按钮 - 极客风格 */}
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.6em 1.2em',
            borderRadius: '8px',
            backgroundColor: '#27272a',
            border: '1px solid #3f3f46',
            color: '#FFA500',
            fontWeight: '500',
            fontSize: '0.9em',
            cursor: 'pointer',
            transition: 'all 0.25s',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3f3f46';
            e.currentTarget.style.borderColor = '#FFA500';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 165, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.borderColor = '#3f3f46';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Toggle AI Chat"
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Ask AI
        </button>

        {/* 连接钱包按钮 */}
        <ConnectWallet />
      </div>

      <h1 style={{ 
        fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
        fontWeight: 700,
        color: '#FFA500',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em'
      }}>
        {t('app.title')}
      </h1>
      <div style={{ 
        fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
        fontWeight: 300, 
        color: '#a1a1aa', 
        marginBottom: '3rem',
        maxWidth: '800px',
        margin: '0 auto 3rem'
      }}>
        {t('app.subtitle')}
      </div>

      <div className="grid-cols-2">
        <TradeCreator />
        <TradeList />
      </div>

      <Faucet />

      {/* AI Assistant 弹窗 */}
      <PopupAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
      />
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
