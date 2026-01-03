import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './AppWithAuth';
import { ToastProvider } from './components/ui/Toast';
import { CMFThemeProvider } from './contexts/CMFThemeContext';
import { GuidedHelpProvider } from './contexts/GuidedHelpContext';
import { LogoProvider } from './contexts/LogoContext';
import { initializePWA } from './lib/pwa';
import './styles/design-tokens.css';
import '../index.css';

// Initialize PWA features (service worker, install prompt)
initializePWA();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CMFThemeProvider>
      <LogoProvider>
        <GuidedHelpProvider>
          <ToastProvider>
            <AppWithAuth />
          </ToastProvider>
        </GuidedHelpProvider>
      </LogoProvider>
    </CMFThemeProvider>
  </React.StrictMode>
);