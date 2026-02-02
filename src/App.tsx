import React from 'react';
import PortfolioDashboard from './PortfolioDashboard';
import AuthGuard from './AuthGuard';

const App: React.FC = () => {
  return (
    <AuthGuard>
      <PortfolioDashboard />
    </AuthGuard>
  );
};

export default App;
