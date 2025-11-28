import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { ToastProvider } from './contexts/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

// Wrapper component that provides auth, permissions, toast notifications, and error handling to App
const AppWithAuth: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PermissionProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </PermissionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppWithAuth;
