import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { Login } from './components/Login';

// Auth callback handler for OAuth redirects
const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    // The auth state change listener in AuthContext will handle the session
    // This component just shows a loading state during the redirect
    const timer = setTimeout(() => {
      // If we're still here after 3 seconds, redirect to home
      window.location.href = '/';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
};

// Inner component that uses auth context
const AuthenticatedApp: React.FC = () => {
  const { user, loading, signIn, signUp, signInWithOAuth } = useAuth();

  // Check if we're on the auth callback route
  const isAuthCallback = window.location.pathname.startsWith('/auth/callback');

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <Login
        onLogin={signIn}
        onSignUp={(email, password, name) => signUp(email, password, { name })}
        onGoogleSignIn={() => signInWithOAuth('google')}
      />
    );
  }

  // Show main app if authenticated
  return <App />;
};

// Wrapper component that provides auth context to App
const AppWithAuth: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
      <Analytics />
    </AuthProvider>
  );
};

export default AppWithAuth;
