import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

// Wrapper component that provides auth context to App
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;
