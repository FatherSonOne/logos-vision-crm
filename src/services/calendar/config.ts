/**
 * Calendar OAuth Configuration
 * 
 * IMPORTANT: DO NOT commit actual credentials to version control!
 * Use environment variables in production.
 * 
 * Setup Instructions:
 * 
 * 1. Google Calendar:
 *    - Go to https://console.cloud.google.com/
 *    - Create a new project or select existing
 *    - Enable Google Calendar API
 *    - Create OAuth 2.0 credentials
 *    - Add authorized redirect URIs (e.g., http://localhost:5173/auth/callback)
 *    - Copy Client ID and Client Secret
 * 
 * 2. Microsoft Calendar:
 *    - Go to https://portal.azure.com/
 *    - Register an application
 *    - Add Microsoft Graph API permissions (Calendars.ReadWrite)
 *    - Create a client secret
 *    - Add redirect URI
 * 
 * 3. Apple Calendar (iCloud):
 *    - Go to https://developer.apple.com/
 *    - Create App ID
 *    - Enable iCloud capability
 *    - Generate OAuth credentials
 */

import type { OAuthConfig } from './types';

// Dynamic redirect URI that works for both localhost and production
const getGoogleRedirectUri = () => {
  if (typeof window !== 'undefined') {
    // Use current origin to ensure consistency
    return `${window.location.origin}/auth/callback`;
  }
  return import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5176/auth/callback';
};

export const CALENDAR_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    get redirectUri() { return getGoogleRedirectUri(); },
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  } as OAuthConfig,
  
  microsoft: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID',
    clientSecret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || 'YOUR_MICROSOFT_CLIENT_SECRET',
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/callback/microsoft',
    scopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/User.Read',
    ],
  } as OAuthConfig,
  
  apple: {
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
    clientSecret: import.meta.env.VITE_APPLE_CLIENT_SECRET || 'YOUR_APPLE_CLIENT_SECRET',
    redirectUri: import.meta.env.VITE_APPLE_REDIRECT_URI || 'http://localhost:5173/auth/callback/apple',
    scopes: [
      'https://www.icloud.com/calendar',
    ],
  } as OAuthConfig,
};

// Helper to check if credentials are configured
export function isProviderConfigured(provider: 'google' | 'microsoft' | 'apple'): boolean {
  const config = CALENDAR_CONFIG[provider];
  return !config.clientId.startsWith('YOUR_');
}
