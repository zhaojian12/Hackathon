import { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Dashboard } from './components/Dashboard';
import { HomePage } from './components/HomePage';
import { FinancingPage } from './components/FinancingPage';
import { AuthScreen } from './components/AuthScreen';
import { Faucet } from './components/Faucet';
import './index.css';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const { isAuthenticated, afterLogin } = useApp();

  if (!isAuthenticated) {
    return <AuthScreen onLogin={afterLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'financing':
        return <FinancingPage onNavigate={setCurrentView} />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      {renderView()}
      <Faucet />
    </>
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
