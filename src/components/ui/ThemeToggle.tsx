/**
 * CMF Nothing Design System - ThemeToggle Component
 * ==================================================
 * 3-state theme toggle: System -> Light -> Dark -> System
 * Uses CMF design tokens for consistent styling.
 */

import React, { useState, useEffect } from 'react';
import type { ThemeMode, ResolvedTheme } from '../../theme/theme';
import {
  initializeTheme,
  setThemeMode,
  cycleThemeMode,
  getThemeModeLabel,
  onSystemPreferenceChange,
  resolveTheme,
} from '../../theme/theme';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 'md' }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const { mode: initialMode, resolvedTheme: initialResolved } = initializeTheme();
    setMode(initialMode);
    setResolvedTheme(initialResolved);
  }, []);

  // Listen for system preference changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;

    const cleanup = onSystemPreferenceChange((isDark) => {
      const newResolved = isDark ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      // Re-apply theme when system preference changes
      setThemeMode('system');
    });

    return cleanup;
  }, [mode]);

  const sizeClasses = {
    sm: { button: 'h-8 w-8', icon: 'h-4 w-4' },
    md: { button: 'h-10 w-10', icon: 'h-5 w-5' },
    lg: { button: 'h-12 w-12', icon: 'h-6 w-6' },
  };

  const handleClick = () => {
    setIsAnimating(true);
    const nextMode = cycleThemeMode(mode);
    const newResolved = setThemeMode(nextMode);
    setMode(nextMode);
    setResolvedTheme(newResolved);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const isDark = resolvedTheme === 'dark';
  const isSystem = mode === 'system';
  const label = getThemeModeLabel(mode);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        aria-label={`Current theme: ${label}. Click to cycle.`}
        title={`Theme: ${label}${isSystem ? ` (${resolvedTheme})` : ''}`}
        className={`
          ${sizeClasses[size].button}
          relative overflow-hidden rounded-full
          transition-all duration-300 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          group
        `}
        style={{
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border-strong)',
        }}
      >
        {/* Background glow effect */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-500"
          style={{
            background: isDark
              ? 'radial-gradient(circle, var(--cmf-accent-muted) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
            opacity: isAnimating ? 0.8 : 0.4,
          }}
        />

        {/* Icon container */}
        <div className="relative flex items-center justify-center w-full h-full">
          {/* System Icon (Computer/Monitor) */}
          <svg
            className={`
              ${sizeClasses[size].icon}
              absolute
              transition-all duration-500 ease-in-out
              ${isSystem ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
            `}
            style={{ color: 'var(--cmf-accent)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>

          {/* Sun Icon */}
          <svg
            className={`
              ${sizeClasses[size].icon}
              absolute
              transition-all duration-500 ease-in-out
              ${mode === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
            `}
            style={{ color: '#F59E0B' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="4" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            />
          </svg>

          {/* Moon Icon */}
          <svg
            className={`
              ${sizeClasses[size].icon}
              absolute
              transition-all duration-500 ease-in-out
              ${mode === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
            `}
            style={{ color: 'var(--cmf-accent)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>

        {/* Ripple effect on click */}
        {isAnimating && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: 'var(--cmf-accent-muted)',
              animationDuration: '500ms',
              animationIterationCount: 1,
            }}
          />
        )}
      </button>

      {/* Mode indicator badge (optional, shows on hover or always for larger sizes) */}
      {size === 'lg' && (
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--cmf-surface-2)',
            color: 'var(--cmf-text-muted)',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
