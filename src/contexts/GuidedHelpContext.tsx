import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Guided Help Context
 * ===================
 * Manages the global state for the "Guided Help" system.
 * Allows toggling help tooltips on/off across the application.
 */

interface GuidedHelpContextType {
  isHelpEnabled: boolean;
  toggleHelp: () => void;
  setHelpEnabled: (enabled: boolean) => void;
}

const GuidedHelpContext = createContext<GuidedHelpContextType | undefined>(undefined);

const STORAGE_KEY = 'logos-vision-guided-help-enabled';

export const GuidedHelpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHelpEnabled, setIsHelpEnabledState] = useState<boolean>(() => {
    // Default to true for new users, or load from storage
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  // Persist state changes
  const setHelpEnabled = (enabled: boolean) => {
    setIsHelpEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  };

  const toggleHelp = () => {
    setHelpEnabled(!isHelpEnabled);
  };

  // Sync state on mount/storage change
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setIsHelpEnabledState(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <GuidedHelpContext.Provider value={{ isHelpEnabled, toggleHelp, setHelpEnabled }}>
      {children}
    </GuidedHelpContext.Provider>
  );
};

export const useGuidedHelp = (): GuidedHelpContextType => {
  const context = useContext(GuidedHelpContext);
  if (!context) {
    throw new Error('useGuidedHelp must be used within a GuidedHelpProvider');
  }
  return context;
};

