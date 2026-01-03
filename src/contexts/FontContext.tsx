import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontFamily = 'inter' | 'system' | 'roboto' | 'open-sans' | 'poppins' | 'anthropic-serif' | 'jetbrains-mono' | 'fira-code' | 'source-code-pro' | 'ibm-plex-mono';
export type FontSize = 'small' | 'medium' | 'large';

export interface FontConfig {
  family: FontFamily;
  size: FontSize;
}

interface FontContextType {
  fontConfig: FontConfig;
  setFontConfig: (config: FontConfig) => void;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const STORAGE_KEY = 'logos-vision-font-config';
const DEFAULT_CONFIG: FontConfig = { family: 'inter', size: 'medium' };

const fontFamilyMap: Record<FontFamily, string> = {
  'inter': "'Inter', system-ui, sans-serif",
  'system': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  'roboto': "'Roboto', sans-serif",
  'open-sans': "'Open Sans', sans-serif",
  'poppins': "'Poppins', sans-serif",
  'anthropic-serif': "'Crimson Pro', 'Georgia', serif",
  'jetbrains-mono': "'JetBrains Mono', 'Courier New', monospace",
  'fira-code': "'Fira Code', 'Courier New', monospace",
  'source-code-pro': "'Source Code Pro', 'Courier New', monospace",
  'ibm-plex-mono': "'IBM Plex Mono', 'Courier New', monospace",
};

const fontSizeMap: Record<FontSize, number> = {
  'small': 0.9,
  'medium': 1.0,
  'large': 1.1,
};

const applyFontConfig = (config: FontConfig) => {
  const root = document.documentElement;
  const fontFamily = fontFamilyMap[config.family] || fontFamilyMap['inter'];
  const fontSize = fontSizeMap[config.size] || 1.0;

  // Apply font family globally
  root.style.setProperty('--app-font-family', fontFamily);
  root.style.setProperty('--app-font-size-scale', fontSize.toString());
  
  // Apply to body and all elements
  document.body.style.fontFamily = fontFamily;
  document.body.style.fontSize = `${fontSize * 16}px`;
  
  // Update CSS variable for font size scaling
  root.style.setProperty('--font-size-base', `${fontSize * 16}px`);
  root.style.setProperty('--font-size-sm', `${fontSize * 14}px`);
  root.style.setProperty('--font-size-lg', `${fontSize * 18}px`);
  root.style.setProperty('--font-size-xl', `${fontSize * 20}px`);
  root.style.setProperty('--font-size-2xl', `${fontSize * 24}px`);
  root.style.setProperty('--font-size-3xl', `${fontSize * 30}px`);
};

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontConfig, setFontConfigState] = useState<FontConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const config: FontConfig = {
          family: parsed.family || DEFAULT_CONFIG.family,
          size: parsed.size || DEFAULT_CONFIG.size,
        };
        applyFontConfig(config);
        return config;
      }
    } catch (e) {
      console.warn('Failed to read font config from localStorage:', e);
    }
    applyFontConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  });

  useEffect(() => {
    applyFontConfig(fontConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fontConfig));
    } catch (e) {
      console.warn('Failed to save font config to localStorage:', e);
    }
  }, [fontConfig]);

  const setFontConfig = (config: FontConfig) => {
    setFontConfigState(config);
  };

  return (
    <FontContext.Provider value={{ fontConfig, setFontConfig }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = (): FontContextType => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};
