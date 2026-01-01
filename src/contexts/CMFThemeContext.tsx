import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * CMF Nothing Theme Context
 * ===========================
 * Manages the user-selectable highlight color (accent) for the CMF Nothing design system.
 *
 * Features:
 * - 5 highlight color options (Red, Cyan, Lime, Amber, Violet)
 * - localStorage persistence
 * - Real-time CSS variable updates via data attribute
 */

export type CMFHighlight = 'red' | 'cyan' | 'lime' | 'amber' | 'violet';

interface CMFHighlightOption {
  id: CMFHighlight;
  name: string;
  hex: string;
  textOnAccent: 'light' | 'dark'; // Whether to use light or dark text on this accent
}

export const CMF_HIGHLIGHTS: CMFHighlightOption[] = [
  { id: 'red', name: 'Red', hex: '#D71921', textOnAccent: 'light' },
  { id: 'cyan', name: 'Cyan', hex: '#00D1FF', textOnAccent: 'dark' },
  { id: 'lime', name: 'Lime', hex: '#B6FF4D', textOnAccent: 'dark' },
  { id: 'amber', name: 'Amber', hex: '#FFB000', textOnAccent: 'dark' },
  { id: 'violet', name: 'Violet', hex: '#8A5CFF', textOnAccent: 'light' },
];

const STORAGE_KEY = 'logos.theme.highlight';
const DEFAULT_HIGHLIGHT: CMFHighlight = 'red';

interface CMFThemeContextValue {
  highlight: CMFHighlight;
  setHighlight: (highlight: CMFHighlight) => void;
  highlightOptions: CMFHighlightOption[];
  currentHighlightOption: CMFHighlightOption;
}

const CMFThemeContext = createContext<CMFThemeContextValue | undefined>(undefined);

/**
 * Apply the highlight theme to the document
 * Uses data-cmf-highlight attribute which is picked up by CSS
 */
const applyHighlight = (highlight: CMFHighlight) => {
  document.documentElement.setAttribute('data-cmf-highlight', highlight);
};

/**
 * Get the initial highlight from localStorage or default
 */
const getInitialHighlight = (): CMFHighlight => {
  if (typeof window === 'undefined') return DEFAULT_HIGHLIGHT;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CMF_HIGHLIGHTS.some(h => h.id === stored)) {
      return stored as CMFHighlight;
    }
  } catch (e) {
    console.warn('Failed to read highlight preference from localStorage:', e);
  }

  return DEFAULT_HIGHLIGHT;
};

interface CMFThemeProviderProps {
  children: React.ReactNode;
  defaultHighlight?: CMFHighlight;
}

export const CMFThemeProvider: React.FC<CMFThemeProviderProps> = ({
  children,
  defaultHighlight
}) => {
  const [highlight, setHighlightState] = useState<CMFHighlight>(() => {
    return defaultHighlight || getInitialHighlight();
  });

  // Apply highlight on mount and when it changes
  useEffect(() => {
    applyHighlight(highlight);
  }, [highlight]);

  // Apply on initial render (before React hydration completes)
  useEffect(() => {
    const initial = defaultHighlight || getInitialHighlight();
    applyHighlight(initial);
  }, [defaultHighlight]);

  const setHighlight = useCallback((newHighlight: CMFHighlight) => {
    setHighlightState(newHighlight);

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, newHighlight);
    } catch (e) {
      console.warn('Failed to save highlight preference to localStorage:', e);
    }
  }, []);

  const currentHighlightOption = CMF_HIGHLIGHTS.find(h => h.id === highlight) || CMF_HIGHLIGHTS[0];

  const value: CMFThemeContextValue = {
    highlight,
    setHighlight,
    highlightOptions: CMF_HIGHLIGHTS,
    currentHighlightOption,
  };

  return (
    <CMFThemeContext.Provider value={value}>
      {children}
    </CMFThemeContext.Provider>
  );
};

/**
 * Hook to access the CMF theme context
 */
export const useCMFTheme = (): CMFThemeContextValue => {
  const context = useContext(CMFThemeContext);
  if (!context) {
    throw new Error('useCMFTheme must be used within a CMFThemeProvider');
  }
  return context;
};

/**
 * Standalone function to get current highlight (for use outside React)
 */
export const getCurrentHighlight = (): CMFHighlight => {
  return getInitialHighlight();
};

/**
 * Standalone function to set highlight (for use outside React)
 */
export const setCurrentHighlight = (highlight: CMFHighlight): void => {
  try {
    localStorage.setItem(STORAGE_KEY, highlight);
    applyHighlight(highlight);
  } catch (e) {
    console.warn('Failed to set highlight:', e);
  }
};

export default CMFThemeContext;
