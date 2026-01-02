import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { googleDriveService } from './services/googleDriveService';
import { calendarManager } from './services/calendar';
import { supabase } from './services/supabaseClient';

type PageView = 'landing' | 'login' | 'privacy' | 'terms' | 'app';

// Auth callback handler for OAuth redirects (Google Drive, Calendar, etc.)
const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      console.log('Auth callback - state:', state, 'code:', code ? 'present' : 'missing');

      // Handle OAuth errors
      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setTimeout(() => { window.location.href = '/'; }, 3000);
        return;
      }

      if (!code) {
        // No code - might be Supabase auth callback with hash params
        setTimeout(() => { window.location.href = '/'; }, 2000);
        return;
      }

      // Handle Google Drive OAuth callback
      if (state === 'google_drive_connect') {
        setMessage('Connecting to Google Drive...');
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await googleDriveService.init(user.id);
            await googleDriveService.exchangeCodeForTokens(code);
            setSuccess(true);
            setMessage('Google Drive connected successfully!');
            // Redirect back to documents page
            setTimeout(() => { window.location.href = '/?view=documents&gdrive=connected'; }, 2000);
          } else {
            setError('User not authenticated. Please sign in first.');
          }
        } catch (err) {
          console.error('Google Drive OAuth error:', err);
          setError(err instanceof Error ? err.message : 'Failed to connect Google Drive');
          setTimeout(() => { window.location.href = '/'; }, 3000);
        }
        return;
      }

      // Handle Google Calendar OAuth callback (state contains random string from CalendarSettings)
      if (code && !state?.startsWith('google_drive')) {
        setMessage('Connecting to Google Calendar...');
        try {
          const credentials = await calendarManager.handleCallback('google', code, state || undefined);
          // Also store in localStorage for CalendarSettings to pick up
          localStorage.setItem('google_calendar_credentials', JSON.stringify(credentials));
          setSuccess(true);
          setMessage('Google Calendar connected successfully!');
          // Redirect to calendar settings with success indicator
          setTimeout(() => { window.location.href = '/?view=settings&tab=calendar&success=true'; }, 2000);
        } catch (err) {
          console.error('Google Calendar OAuth error:', err);
          setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar');
          setTimeout(() => { window.location.href = '/'; }, 3000);
        }
        return;
      }

      // Default: Unknown state, redirect home
      console.log('Unknown OAuth state, redirecting home');
      setTimeout(() => { window.location.href = '/'; }, 2000);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Connection Failed</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <p className="text-sm text-slate-500">Redirecting...</p>
          </>
        ) : success ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Connected!</h2>
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
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
        onShowPrivacyPolicy={() => { setPageView('privacy'); window.scrollTo(0, 0); }}
        onShowTermsOfService={() => { setPageView('terms'); window.scrollTo(0, 0); }}
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
        window.scrollTo(0, 0);
      }}
      onShowTermsOfService={() => {
        setPageView('terms');
        window.history.pushState({}, '', '/terms');
        window.scrollTo(0, 0);
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
