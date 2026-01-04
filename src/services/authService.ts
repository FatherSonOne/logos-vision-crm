// Auth Service - Handles all authentication operations using Supabase Auth
import { supabase } from './supabaseClient';
import type { User, Session, Provider } from '@supabase/supabase-js';

// Google Identity Services types (extends the global google namespace)
interface GoogleAccountsId {
  initialize: (config: any) => void;
  prompt: (callback?: (notification: any) => void) => void;
  renderButton: (element: HTMLElement, config: any) => void;
  disableAutoSelect: () => void;
  revoke: (hint: string, callback?: () => void) => void;
  cancel: () => void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: any) => any;
  revoke: (token: string, callback?: () => void) => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
  oauth2: GoogleAccountsOAuth2;
}

// Helper to safely access google.accounts
const getGoogleAccounts = (): GoogleAccounts | undefined => {
  const win = window as any;
  return win.google?.accounts as GoogleAccounts | undefined;
};

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
}

export const authService = {
  // Sign up a new user
  async signUp(email: string, password: string, metadata?: { name?: string; role?: string }): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });

    return { user: data.user, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { user: data.user, error };
  },

  // Sign in with OAuth provider (Google, Microsoft, etc.)
  async signInWithOAuth(provider: Provider): Promise<{ error: any }> {
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'select_account',  // Show Google account picker
        } : undefined
      }
    });

    return { error };
  },

  // Sign out current user - comprehensive cleanup
  async signOut(options?: { revokeGoogle?: boolean; userEmail?: string }): Promise<{ error: any }> {
    try {
      // 1. Get current session to access tokens before signing out
      const { data: { session } } = await supabase.auth.getSession();
      const googleAccounts = getGoogleAccounts();

      // 2. Revoke Google credentials if requested and available
      if (options?.revokeGoogle && googleAccounts?.id) {
        const emailHint = options.userEmail || session?.user?.email;
        if (emailHint) {
          // Revoke Google Sign-In credential
          googleAccounts.id.revoke(emailHint, () => {
            console.log('Google credential revoked for:', emailHint);
          });
        }
        // Disable auto-select for future sign-ins
        googleAccounts.id.disableAutoSelect();
      }

      // 3. If we have an access token from Google OAuth, revoke it
      if (session?.provider_token && googleAccounts?.oauth2) {
        googleAccounts.oauth2.revoke(session.provider_token, () => {
          console.log('Google OAuth token revoked');
        });
      }

      // 4. Clear all local storage items related to auth
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') ||
          key.includes('google') ||
          key.includes('oauth') ||
          key.includes('auth') ||
          key.includes('token')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 5. Clear session storage
      sessionStorage.clear();

      // 6. Sign out from Supabase (global sign out)
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      return { error };
    } catch (err) {
      console.error('Error during sign out:', err);
      // Still try to sign out from Supabase even if other steps fail
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      return { error };
    }
  },

  // Remove user account completely (revokes all access)
  async removeAccount(userEmail: string): Promise<{ error: any }> {
    // First revoke Google credentials
    const googleAccounts = getGoogleAccounts();
    if (googleAccounts?.id) {
      googleAccounts.id.revoke(userEmail, () => {
        console.log('Google credential removed for:', userEmail);
      });
      googleAccounts.id.disableAutoSelect();
    }

    // Then perform full sign out
    return this.signOut({ revokeGoogle: true, userEmail });
  },

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password request
  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  },

  // Update user metadata
  async updateUserMetadata(metadata: { name?: string; role?: string }): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      data: metadata
    });
    return { error };
  },

  // Convert Supabase User to AuthUser
  toAuthUser(user: User | null): AuthUser | null {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      role: user.user_metadata?.role
    };
  }
};
