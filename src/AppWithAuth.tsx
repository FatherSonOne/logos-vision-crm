import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

// Wrapper component that provides auth, permissions, and error handling to App
const AppWithAuth: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PermissionProvider>
          <App />
        </PermissionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppWithAuth;
