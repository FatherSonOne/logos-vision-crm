import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, type AuthUser } from '../services/authService';
import type { Session, Provider } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: { name?: string; role?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (metadata: { name?: string; role?: string }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);

        if (session?.user) {
          setUser(authService.toAuthUser(session.user));
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      // Development mode bypass - check if VITE_DEV_MODE is set to 'true'
      const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

      if (isDevelopmentMode) {
        console.log('🔧 Development Mode: Authentication bypassed');
        console.log('Using demo user for development');
        setUser({
          id: 'dev-user-001',
          email: 'demo@logosvision.com',
          name: 'Demo User',
          role: 'admin'
        });
        setLoading(false);
        return;
      }

      const session = await authService.getSession();
      setSession(session);

      if (session?.user) {
        setUser(authService.toAuthUser(session.user));
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // In development mode, accept any credentials
    const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

    if (isDevelopmentMode) {
      console.log('🔧 Development Mode: Sign in bypassed');
      setUser({
        id: 'dev-user-001',
        email: email || 'demo@logosvision.com',
        name: 'Demo User',
        role: 'admin'
      });
      return { error: null };
    }

    const { user: authUser, error } = await authService.signIn(email, password);

    if (authUser && !error) {
      setUser(authService.toAuthUser(authUser));
    }

    return { error };
  };

  const signInWithOAuth = async (provider: Provider) => {
    // In development mode, simulate OAuth sign-in
    const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';

    if (isDevelopmentMode) {
      console.log(`🔧 Development Mode: ${provider} OAuth bypassed`);
      setUser({
        id: 'dev-user-001',
        email: 'demo@logosvision.com',
        name: 'Demo User',
        avatar_url: undefined,
        role: 'admin'
      });
      return { error: null };
    }

    const { error } = await authService.signInWithOAuth(provider);
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: { name?: string; role?: string }) => {
    const { user: authUser, error } = await authService.signUp(email, password, metadata);

    if (authUser && !error) {
      setUser(authService.toAuthUser(authUser));
    }

    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (metadata: { name?: string; role?: string }) => {
    const { error } = await authService.updateUserMetadata(metadata);

    if (!error && user) {
      setUser({ ...user, ...metadata });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
