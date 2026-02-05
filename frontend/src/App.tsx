import { useState } from 'react';
import { AppProvider } from './AppContext';
import { Dashboard } from './components/Dashboard';
import { HomePage } from './components/HomePage';
import { FinancingPage } from './components/FinancingPage';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

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
    <AppProvider>
      {renderView()}
    </AppProvider>
  )
}

export default App;
