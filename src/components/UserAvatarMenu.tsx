import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, UserCircle, ExternalLink, UserMinus, Users } from 'lucide-react';

interface UserAvatarMenuProps {
  className?: string;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({ className = '' }) => {
  const { user, signOut, removeAccount, signInWithOAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
      setIsOpen(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsOpen(false);
    // Sign out first, then trigger new sign in
    await signOut({ revokeGoogle: false });
    // Trigger OAuth flow which will show the account picker
    await signInWithOAuth('google');
  };

  const handleAddAccount = async () => {
    setIsOpen(false);
    // Trigger OAuth flow with account selection
    await signInWithOAuth('google');
  };

  const handleRemoveAccount = async () => {
    if (!confirm('This will remove your account from this device and require you to sign in again. Continue?')) {
      return;
    }
    setIsRemoving(true);
    try {
      await removeAccount();
    } catch (error) {
      console.error('Remove account error:', error);
    } finally {
      setIsRemoving(false);
      setIsOpen(false);
    }
  };

  const handleManageGoogleAccount = () => {
    // Official Google Account management URL
    window.open('https://myaccount.google.com/', '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  if (!user) {
    return null;
  }

  // Get user info
  const avatarUrl = user.avatar_url;
  const userName = user.name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Avatar Button - Google-style circular button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Google Account"
        title={`Google Account\n${userName}\n${userEmail}`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-blue-400 transition-all"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown Menu - Google Account Picker Style */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header with user info - Google style */}
          <div className="px-6 py-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
            <div className="flex items-start gap-4">
              {/* Large avatar */}
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                    {initials}
                  </div>
                )}
              </div>
              {/* User details */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {userName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Manage Google Account button - Official Google style */}
            <button
              onClick={handleManageGoogleAccount}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
            >
              Manage your Google Account
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700" />

          {/* Menu Items */}
          <div className="py-2">
            {/* Add another account */}
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Users className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span>Add another account</span>
            </button>

            {/* Switch account */}
            <button
              onClick={handleSwitchAccount}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <UserCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span>Sign in with a different account</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700" />

          {/* Sign out and Remove options */}
          <div className="py-2">
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut || isRemoving}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {isSigningOut ? (
                <svg className="animate-spin w-5 h-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <LogOut className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              )}
              <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
            </button>

            {/* Remove account from device */}
            <button
              onClick={handleRemoveAccount}
              disabled={isSigningOut || isRemoving}
              className="w-full flex items-center gap-3 px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <UserMinus className="w-5 h-5" />
              )}
              <span>{isRemoving ? 'Removing...' : 'Remove account from this device'}</span>
            </button>
          </div>

          {/* Footer with privacy links */}
          <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                Privacy Policy
              </a>
              <span>•</span>
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
