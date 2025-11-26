// Auth Service - Handles all authentication operations using Supabase Auth
import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
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

  // Sign out current user
  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
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
      name: user.user_metadata?.name,
      role: user.user_metadata?.role
    };
  }
};
