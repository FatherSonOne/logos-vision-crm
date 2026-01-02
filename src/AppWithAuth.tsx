import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { googleDriveService } from './services/googleDriveService';
import { supabase } from './services/supabaseClient';

type PageView = 'landing' | 'login' | 'privacy' | 'terms' | 'app';

// Auth callback handler for OAuth redirects
const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      // Handle OAuth errors
      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setTimeout(() => { window.location.href = '/'; }, 3000);
        return;
      }

      // Handle Google Drive OAuth callback
      if (state === 'google_drive_connect' && code) {
        setMessage('Connecting to Google Drive...');
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await googleDriveService.init(user.id);
            await googleDriveService.exchangeCodeForTokens(code);
            setMessage('Google Drive connected successfully!');
          } else {
            setError('User not authenticated');
          }
        } catch (err) {
          console.error('Google Drive OAuth error:', err);
          setError(err instanceof Error ? err.message : 'Failed to connect Google Drive');
        }
        setTimeout(() => { window.location.href = '/'; }, 2000);
        return;
      }

      // Default: Supabase auth will handle via AuthContext listener
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 3000);

      return () => clearTimeout(timer);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-4xl mb-4">✕</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

// Inner component that uses auth context
const AuthenticatedApp: React.FC = () => {
  const { user, loading, signIn, signUp, signInWithOAuth } = useAuth();
  const [pageView, setPageView] = useState<PageView>('landing');

  // Check if we're on the auth callback route
  const isAuthCallback = window.location.pathname.startsWith('/auth/callback');

  // Check for direct routes
  const isPrivacyRoute = window.location.pathname === '/privacy';
  const isTermsRoute = window.location.pathname === '/terms';
  const isLoginRoute = window.location.pathname === '/login';

  // Sync page view with URL routes
  useEffect(() => {
    if (isPrivacyRoute) setPageView('privacy');
    else if (isTermsRoute) setPageView('terms');
    else if (isLoginRoute) setPageView('login');
  }, [isPrivacyRoute, isTermsRoute, isLoginRoute]);

  // If authenticated, always show app
  useEffect(() => {
    if (user && !loading) {
      setPageView('app');
    }
  }, [user, loading]);

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  // Show legal pages (accessible without auth)
  if (pageView === 'privacy') {
    return (
      <PrivacyPolicy
        onBack={() => {
          setPageView(user ? 'app' : 'landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  if (pageView === 'terms') {
    return (
      <TermsOfService
        onBack={() => {
          setPageView(user ? 'app' : 'landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
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

  // Show main app if authenticated
  if (user) {
    return <App />;
  }

  // Show login page
  if (pageView === 'login') {
    return (
      <Login
        onLogin={signIn}
        onSignUp={(email, password, name) => signUp(email, password, { name })}
        onGoogleSignIn={() => signInWithOAuth('google')}
        onShowPrivacyPolicy={() => setPageView('privacy')}
        onShowTermsOfService={() => setPageView('terms')}
        onBack={() => {
          setPageView('landing');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Show public landing page for unauthenticated visitors
  return (
    <LandingPage
      onGetStarted={() => {
        setPageView('login');
        window.history.pushState({}, '', '/login');
      }}
      onShowPrivacyPolicy={() => {
        setPageView('privacy');
        window.history.pushState({}, '', '/privacy');
      }}
      onShowTermsOfService={() => {
        setPageView('terms');
        window.history.pushState({}, '', '/terms');
      }}
    />
  );
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
