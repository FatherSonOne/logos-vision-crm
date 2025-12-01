import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

// Wrapper component that provides auth context to App
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <App />
      <Analytics />
    </AuthProvider>
  );
};

export default AppWithAuth;
