import React, { createContext, useContext, useState, useEffect } from 'react';
import type { LogoVariant } from '../components/Logo';

interface LogoContextType {
  selectedVariant: LogoVariant;
  setSelectedVariant: (variant: LogoVariant) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const STORAGE_KEY = 'logos-vision-logo-variant';
const DEFAULT_VARIANT: LogoVariant = 'quantum-ripple';

export const LogoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVariant, setSelectedVariantState] = useState<LogoVariant>(() => {
    if (typeof window === 'undefined') return DEFAULT_VARIANT;
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as LogoVariant) || DEFAULT_VARIANT;
  });

  const setSelectedVariant = (variant: LogoVariant) => {
    setSelectedVariantState(variant);
    localStorage.setItem(STORAGE_KEY, variant);
    // Update favicon
    updateFavicon(variant);
  };

  // Update favicon on mount
  useEffect(() => {
    updateFavicon(selectedVariant);
  }, [selectedVariant]);

  return (
    <LogoContext.Provider value={{ selectedVariant, setSelectedVariant }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = (): LogoContextType => {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};

// Function to update favicon based on selected logo
function updateFavicon(variant: LogoVariant) {
  const svgContent = getFaviconSVG(variant);
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
  
  // Find or create favicon link
  let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.href = svgDataUrl;
}

function getFaviconSVG(variant: LogoVariant): string {
  // Aurora palette colors for favicon
  const teal = '#2dd4bf';
  const cyan = '#22d3ee';
  const green = '#4ade80';
  const pink = '#f472b6';

  const svgs: Record<LogoVariant, string> = {
    'quantum-ripple': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="#020617"/>
      <circle cx="12" cy="12" r="10" stroke="${teal}" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="12" cy="12" r="7" stroke="${teal}" stroke-width="0.75" fill="none" opacity="0.5"/>
      <circle cx="12" cy="12" r="4" stroke="${teal}" stroke-width="1" fill="none" opacity="0.7"/>
      <circle cx="12" cy="12" r="2" fill="${cyan}"/>
    </svg>`,
    'wave-convergence': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="#020617"/>
      <path d="M2 12 Q6 10, 10 12 T18 12" stroke="${green}" stroke-width="1" fill="none" opacity="0.7"/>
      <path d="M22 12 Q18 14, 14 12 T6 12" stroke="${pink}" stroke-width="1" fill="none" opacity="0.7"/>
      <circle cx="12" cy="12" r="3" fill="${teal}" fill-opacity="0.3"/>
      <circle cx="12" cy="12" r="1.5" fill="${cyan}"/>
    </svg>`,
    'probability-field': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="#020617"/>
      <ellipse cx="12" cy="12" rx="9" ry="4" stroke="${green}" stroke-width="0.75" fill="none" transform="rotate(-30 12 12)" opacity="0.6"/>
      <ellipse cx="12" cy="12" rx="9" ry="4" stroke="${pink}" stroke-width="0.75" fill="none" transform="rotate(30 12 12)" opacity="0.6"/>
      <ellipse cx="12" cy="12" rx="9" ry="4" stroke="${cyan}" stroke-width="0.75" fill="none" transform="rotate(90 12 12)" opacity="0.6"/>
      <circle cx="12" cy="12" r="2" fill="${cyan}"/>
    </svg>`,
    'nested-horizons': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="#020617"/>
      <path d="M2 18 Q12 10, 22 18" stroke="${pink}" stroke-width="0.75" fill="none" opacity="0.4"/>
      <path d="M4 16 Q12 9, 20 16" stroke="${teal}" stroke-width="1" fill="none" opacity="0.6"/>
      <path d="M6 14 Q12 8, 18 14" stroke="${cyan}" stroke-width="1.25" fill="none" opacity="0.8"/>
      <path d="M8 12 Q12 7, 16 12" stroke="${green}" stroke-width="1.5" fill="none" opacity="0.9"/>
      <circle cx="12" cy="8" r="1.5" fill="${cyan}"/>
    </svg>`,
    'interference-bloom': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="#020617"/>
      <circle cx="9" cy="9" r="6" fill="${green}" fill-opacity="0.3"/>
      <circle cx="15" cy="9" r="6" fill="${pink}" fill-opacity="0.25"/>
      <circle cx="12" cy="15" r="6" fill="${cyan}" fill-opacity="0.25"/>
      <circle cx="12" cy="10" r="4" stroke="${teal}" stroke-width="0.5" fill="none" opacity="0.6"/>
      <circle cx="12" cy="10" r="1.5" fill="${cyan}"/>
    </svg>`,
    'singularity-lens': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" fill="#020617"/>
      <path d="M3 8 Q10 12, 12 12 Q14 12, 21 16" stroke="${green}" stroke-width="0.75" fill="none" opacity="0.6"/>
      <path d="M3 12 Q10 13, 12 12 Q14 11, 21 12" stroke="${green}" stroke-width="0.75" fill="none" opacity="0.7"/>
      <path d="M3 16 Q10 12, 12 12 Q14 12, 21 8" stroke="${pink}" stroke-width="0.75" fill="none" opacity="0.6"/>
      <circle cx="12" cy="12" r="4" stroke="${cyan}" stroke-width="0.75" fill="none" opacity="0.5"/>
      <circle cx="12" cy="12" r="2" fill="#020617"/>
      <circle cx="12" cy="12" r="1" fill="${cyan}"/>
    </svg>`
  };

  return svgs[variant];
}

