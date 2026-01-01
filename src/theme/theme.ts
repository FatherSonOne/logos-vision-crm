/**
 * Logos Vision CRM - Theme Mode System
 * =====================================
 * Manages light/dark/system theme preferences with localStorage persistence
 * and real-time system preference detection.
 *
 * Storage key: logos.theme.mode = 'light' | 'dark' | 'system'
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'logos.theme.mode';
const DEFAULT_MODE: ThemeMode = 'system';

/**
 * Get the system's preferred color scheme
 */
export function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve the actual theme (light/dark) from the mode setting
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

/**
 * Get the stored theme mode from localStorage
 */
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (e) {
    console.warn('Failed to read theme mode from localStorage:', e);
  }

  // Migration: check for old 'theme' key
  try {
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme === 'dark' || oldTheme === 'light') {
      // Migrate to new key
      localStorage.setItem(STORAGE_KEY, oldTheme);
      localStorage.removeItem('theme');
      return oldTheme;
    }
  } catch (e) {
    // Ignore migration errors
  }

  return DEFAULT_MODE;
}

/**
 * Save theme mode to localStorage
 */
export function setStoredThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (e) {
    console.warn('Failed to save theme mode to localStorage:', e);
  }
}

/**
 * Apply theme to the document
 * Sets both data-theme attribute and html.dark class for Tailwind compatibility
 */
export function applyTheme(resolvedTheme: ResolvedTheme): void {
  const root = document.documentElement;
  const body = document.body;

  // Set data-theme attribute
  root.setAttribute('data-theme', resolvedTheme);

  // Toggle html.dark class for Tailwind
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
  } else {
    root.classList.remove('dark');
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  }
}

/**
 * Initialize the theme on app load
 * Returns the current mode and resolved theme
 */
export function initializeTheme(): { mode: ThemeMode; resolvedTheme: ResolvedTheme } {
  const mode = getStoredThemeMode();
  const resolvedTheme = resolveTheme(mode);
  applyTheme(resolvedTheme);
  return { mode, resolvedTheme };
}

/**
 * Set the theme mode and apply it
 */
export function setThemeMode(mode: ThemeMode): ResolvedTheme {
  setStoredThemeMode(mode);
  const resolvedTheme = resolveTheme(mode);
  applyTheme(resolvedTheme);
  return resolvedTheme;
}

/**
 * Cycle through theme modes: system -> light -> dark -> system
 */
export function cycleThemeMode(currentMode: ThemeMode): ThemeMode {
  const order: ThemeMode[] = ['system', 'light', 'dark'];
  const currentIndex = order.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % order.length;
  return order[nextIndex];
}

/**
 * Get a display label for the theme mode
 */
export function getThemeModeLabel(mode: ThemeMode): string {
  switch (mode) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
      return 'System';
    default:
      return 'System';
  }
}

/**
 * Create a media query listener for system preference changes
 * Returns a cleanup function
 */
export function onSystemPreferenceChange(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}
