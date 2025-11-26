import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './src/AppWithAuth';
import { ToastProvider } from './src/components/ui/Toast';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AppWithAuth />
    </ToastProvider>
  </React.StrictMode>
);