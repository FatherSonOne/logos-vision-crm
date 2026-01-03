import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Brand Palette Context
 * =====================
 * Manages the brand color palette selection for Logos Vision CRM.
 * Allows users to choose from 3 distinct color palettes that affect the entire app.
 */

export type BrandPalette = 'logos-vision' | 'ocean-depth' | 'sunset-glow' | 'pulse' | 'light-optimized';

export interface BrandPaletteDefinition {
  id: BrandPalette;
  name: string;
  description: string;
  colors: {
    // Primary accent colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Supporting colors
    accent: string;
    accentLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Light mode backgrounds
    bgLight: string;
    surfaceLight: string;
    surface2Light: string;
    textLight: string;
    textSecondaryLight: string;
    borderLight: string;
    
    // Dark mode backgrounds
    bgDark: string;
    surfaceDark: string;
    surface2Dark: string;
    textDark: string;
    textSecondaryDark: string;
    borderDark: string;
  };
}

/**
 * Logos Vision Palette - Current Brand Colors
 * Cyan/Blue gradient system - Source of Truth theme
 */
const LOGOS_VISION_PALETTE: BrandPaletteDefinition = {
  id: 'logos-vision',
  name: 'Logos Vision',
  description: 'Cyan and blue gradient system - The Source of Truth',
  colors: {
    primary: '#22D3EE',        // Cyan 400
    primaryLight: '#67E8F9',   // Cyan 300
    primaryDark: '#06B6D4',    // Cyan 500
    secondary: '#3B82F6',      // Blue 500
    secondaryLight: '#60A5FA', // Blue 400
    secondaryDark: '#2563EB',  // Blue 600
    accent: '#2DD4BF',         // Teal 400
    accentLight: '#5EEAD4',    // Teal 300
    success: '#4ADE80',        // Green 400
    warning: '#FBBF24',        // Amber 400
    error: '#F87171',          // Red 400
    info: '#38BDF8',           // Sky 400
    // Light mode
    bgLight: '#FFFBF7',        // Warm off-white
    surfaceLight: '#FDF8F3',   // Warm cream
    surface2Light: '#F7F2ED',  // Warm light gray
    textLight: '#1E1B18',      // Warm dark
    textSecondaryLight: '#3D3833',
    borderLight: 'rgba(30, 27, 24, 0.08)',
    // Dark mode
    bgDark: '#020617',         // Slate 950
    surfaceDark: '#0F172A',    // Slate 900
    surface2Dark: '#1E293B',   // Slate 800
    textDark: '#F8FAFC',       // Slate 50
    textSecondaryDark: '#94A3B8', // Slate 400
    borderDark: 'rgba(148, 163, 184, 0.1)',
  }
};

/**
 * Ocean Depth Palette - Deep blues and teals
 * Professional, calming, trustworthy
 */
const OCEAN_DEPTH_PALETTE: BrandPaletteDefinition = {
  id: 'ocean-depth',
  name: 'Ocean Depth',
  description: 'Deep blues and teals - Professional and trustworthy',
  colors: {
    primary: '#0EA5E9',        // Sky 500
    primaryLight: '#38BDF8',  // Sky 400
    primaryDark: '#0284C7',   // Sky 600
    secondary: '#14B8A6',     // Teal 500
    secondaryLight: '#2DD4BF', // Teal 400
    secondaryDark: '#0D9488', // Teal 600
    accent: '#06B6D4',        // Cyan 500
    accentLight: '#22D3EE',   // Cyan 400
    success: '#10B981',       // Emerald 500
    warning: '#F59E0B',       // Amber 500
    error: '#EF4444',         // Red 500
    info: '#3B82F6',          // Blue 500
    // Light mode
    bgLight: '#F0F9FF',       // Sky 50
    surfaceLight: '#E0F2FE',  // Sky 100
    surface2Light: '#BAE6FD', // Sky 200
    textLight: '#0C4A6E',     // Sky 900
    textSecondaryLight: '#075985', // Sky 800
    borderLight: 'rgba(14, 165, 233, 0.1)',
    // Dark mode
    bgDark: '#0C1222',        // Deep navy
    surfaceDark: '#1E293B',   // Slate 800
    surface2Dark: '#334155',  // Slate 700
    textDark: '#E0F2FE',      // Sky 100
    textSecondaryDark: '#7DD3FC', // Sky 300
    borderDark: 'rgba(56, 189, 248, 0.15)',
  }
};

/**
 * Sunset Glow Palette - Warm oranges and purples
 * Energetic, creative, inspiring
 */
const SUNSET_GLOW_PALETTE: BrandPaletteDefinition = {
  id: 'sunset-glow',
  name: 'Sunset Glow',
  description: 'Warm oranges and purples - Energetic and inspiring',
  colors: {
    primary: '#F97316',        // Orange 500
    primaryLight: '#FB923C',   // Orange 400
    primaryDark: '#EA580C',    // Orange 600
    secondary: '#A855F7',     // Purple 500
    secondaryLight: '#C084FC', // Purple 400
    secondaryDark: '#9333EA', // Purple 600
    accent: '#EC4899',         // Pink 500
    accentLight: '#F472B6',    // Pink 400
    success: '#22C55E',        // Green 500
    warning: '#F59E0B',        // Amber 500
    error: '#EF4444',          // Red 500
    info: '#8B5CF6',           // Violet 500
    // Light mode
    bgLight: '#FFF7ED',        // Orange 50
    surfaceLight: '#FFEDD5',  // Orange 100
    surface2Light: '#FED7AA',  // Orange 200
    textLight: '#7C2D12',      // Orange 900
    textSecondaryLight: '#9A3412', // Orange 800
    borderLight: 'rgba(249, 115, 22, 0.1)',
    // Dark mode
    bgDark: '#1C0F0A',         // Deep warm dark
    surfaceDark: '#2D1B0E',   // Warm dark
    surface2Dark: '#431407',  // Orange 950
    textDark: '#FFEDD5',       // Orange 100
    textSecondaryDark: '#FED7AA', // Orange 200
    borderDark: 'rgba(251, 146, 60, 0.15)',
  }
};

/**
 * Pulse Palette - Pink/Rose gradient system
 * Matches Pulse app branding - Energetic, vibrant, communication-focused
 */
const PULSE_PALETTE: BrandPaletteDefinition = {
  id: 'pulse',
  name: 'Pulse',
  description: 'Pink and rose gradient system - Energetic and communication-focused',
  colors: {
    primary: '#EC4899',        // Pink 500
    primaryLight: '#F472B6',   // Pink 400
    primaryDark: '#DB2777',    // Pink 600
    secondary: '#F43F5E',      // Rose 500
    secondaryLight: '#FB7185', // Rose 400
    secondaryDark: '#E11D48',  // Rose 600
    accent: '#F9A8D4',         // Pink 300
    accentLight: '#FBCFE8',    // Pink 200
    success: '#10B981',        // Emerald 500
    warning: '#F59E0B',        // Amber 500
    error: '#EF4444',          // Red 500
    info: '#8B5CF6',           // Violet 500
    // Light mode
    bgLight: '#FDF2F8',        // Pink 50
    surfaceLight: '#FCE7F3',   // Pink 100
    surface2Light: '#FBCFE8', // Pink 200
    textLight: '#831843',      // Pink 900
    textSecondaryLight: '#9F1239', // Rose 900
    borderLight: 'rgba(236, 72, 153, 0.1)',
    // Dark mode
    bgDark: '#1F0A14',         // Deep pink dark
    surfaceDark: '#2D1B24',    // Pink dark
    surface2Dark: '#3F2432',  // Pink darker
    textDark: '#FCE7F3',       // Pink 100
    textSecondaryDark: '#FBCFE8', // Pink 200
    borderDark: 'rgba(244, 114, 182, 0.15)',
  }
};

/**
 * Light Mode Optimized Palette - High contrast, bright colors
 * Designed for maximum readability in light mode
 */
const LIGHT_OPTIMIZED_PALETTE: BrandPaletteDefinition = {
  id: 'light-optimized',
  name: 'Light Optimized',
  description: 'High contrast colors optimized for light mode readability',
  colors: {
    primary: '#2563EB',        // Blue 600 - High contrast
    primaryLight: '#3B82F6',   // Blue 500
    primaryDark: '#1D4ED8',    // Blue 700
    secondary: '#7C3AED',      // Violet 600
    secondaryLight: '#8B5CF6', // Violet 500
    secondaryDark: '#6D28D9',  // Violet 700
    accent: '#059669',          // Emerald 600
    accentLight: '#10B981',    // Emerald 500
    success: '#16A34A',        // Green 600
    warning: '#D97706',        // Amber 600
    error: '#DC2626',          // Red 600
    info: '#0284C7',           // Sky 600
    // Light mode - High contrast
    bgLight: '#FFFFFF',        // Pure white
    surfaceLight: '#F9FAFB',   // Gray 50
    surface2Light: '#F3F4F6',  // Gray 100
    textLight: '#111827',      // Gray 900 - Maximum contrast
    textSecondaryLight: '#374151', // Gray 700
    borderLight: 'rgba(17, 24, 39, 0.1)',
    // Dark mode - Still readable
    bgDark: '#0F172A',         // Slate 900
    surfaceDark: '#1E293B',    // Slate 800
    surface2Dark: '#334155',   // Slate 700
    textDark: '#F1F5F9',       // Slate 100
    textSecondaryDark: '#CBD5E1', // Slate 300
    borderDark: 'rgba(203, 213, 225, 0.1)',
  }
};

export const BRAND_PALETTES: Record<BrandPalette, BrandPaletteDefinition> = {
  'logos-vision': LOGOS_VISION_PALETTE,
  'ocean-depth': OCEAN_DEPTH_PALETTE,
  'sunset-glow': SUNSET_GLOW_PALETTE,
  'pulse': PULSE_PALETTE,
  'light-optimized': LIGHT_OPTIMIZED_PALETTE,
};

interface BrandPaletteContextType {
  selectedPalette: BrandPalette;
  setSelectedPalette: (palette: BrandPalette) => void;
  currentPalette: BrandPaletteDefinition;
  palettes: BrandPaletteDefinition[];
}

const BrandPaletteContext = createContext<BrandPaletteContextType | undefined>(undefined);

const STORAGE_KEY = 'logos-vision-brand-palette';
const DEFAULT_PALETTE: BrandPalette = 'logos-vision';

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Apply the brand palette to the document via CSS variables
 */
const applyBrandPalette = (palette: BrandPaletteDefinition) => {
  const root = document.documentElement;
  const colors = palette.colors;
  
  // Set CSS custom properties
  root.style.setProperty('--brand-primary', colors.primary);
  root.style.setProperty('--brand-primary-light', colors.primaryLight);
  root.style.setProperty('--brand-primary-dark', colors.primaryDark);
  root.style.setProperty('--brand-secondary', colors.secondary);
  root.style.setProperty('--brand-secondary-light', colors.secondaryLight);
  root.style.setProperty('--brand-secondary-dark', colors.secondaryDark);
  root.style.setProperty('--brand-accent', colors.accent);
  root.style.setProperty('--brand-accent-light', colors.accentLight);
  root.style.setProperty('--brand-success', colors.success);
  root.style.setProperty('--brand-warning', colors.warning);
  root.style.setProperty('--brand-error', colors.error);
  root.style.setProperty('--brand-info', colors.info);
  
  // Calculate rgba values for muted/subtle accents
  const primaryRgb = hexToRgb(colors.primary);
  if (primaryRgb) {
    root.style.setProperty('--cmf-accent-muted', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`);
    root.style.setProperty('--cmf-accent-subtle', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
  }
  
  // Light mode colors
  root.style.setProperty('--brand-bg-light', colors.bgLight);
  root.style.setProperty('--brand-surface-light', colors.surfaceLight);
  root.style.setProperty('--brand-surface-2-light', colors.surface2Light);
  root.style.setProperty('--brand-text-light', colors.textLight);
  root.style.setProperty('--brand-text-secondary-light', colors.textSecondaryLight);
  root.style.setProperty('--brand-border-light', colors.borderLight);
  
  // Dark mode colors
  root.style.setProperty('--brand-bg-dark', colors.bgDark);
  root.style.setProperty('--brand-surface-dark', colors.surfaceDark);
  root.style.setProperty('--brand-surface-2-dark', colors.surface2Dark);
  root.style.setProperty('--brand-text-dark', colors.textDark);
  root.style.setProperty('--brand-text-secondary-dark', colors.textSecondaryDark);
  root.style.setProperty('--brand-border-dark', colors.borderDark);
  
  // Set data attribute for CSS selectors
  root.setAttribute('data-brand-palette', palette.id);
  
  // Map brand colors to CMF accent variables so all UI components use the palette
  root.style.setProperty('--cmf-accent', colors.primary);
  root.style.setProperty('--cmf-accent-hover', colors.primaryLight);
  root.style.setProperty('--cmf-accent-muted', `rgba(${hexToRgb(colors.primary)?.r || 34}, ${hexToRgb(colors.primary)?.g || 211}, ${hexToRgb(colors.primary)?.b || 238}, 0.15)`);
  root.style.setProperty('--cmf-accent-subtle', `rgba(${hexToRgb(colors.primary)?.r || 34}, ${hexToRgb(colors.primary)?.g || 211}, ${hexToRgb(colors.primary)?.b || 238}, 0.05)`);
  
  // Update semantic colors
  root.style.setProperty('--cmf-success', colors.success);
  root.style.setProperty('--cmf-warning', colors.warning);
  root.style.setProperty('--cmf-error', colors.error);
  root.style.setProperty('--cmf-info', colors.info);
  
  // Update background and surface colors based on light/dark mode
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    root.style.setProperty('--cmf-bg', colors.bgDark);
    root.style.setProperty('--cmf-surface', colors.surfaceDark);
    root.style.setProperty('--cmf-surface-2', colors.surface2Dark);
    root.style.setProperty('--cmf-text', colors.textDark);
    root.style.setProperty('--cmf-text-secondary', colors.textSecondaryDark);
    root.style.setProperty('--cmf-border', colors.borderDark);
  } else {
    root.style.setProperty('--cmf-bg', colors.bgLight);
    root.style.setProperty('--cmf-surface', colors.surfaceLight);
    root.style.setProperty('--cmf-surface-2', colors.surface2Light);
    root.style.setProperty('--cmf-text', colors.textLight);
    root.style.setProperty('--cmf-text-secondary', colors.textSecondaryLight);
    root.style.setProperty('--cmf-border', colors.borderLight);
  }
};

export const BrandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPalette, setSelectedPaletteState] = useState<BrandPalette>(() => {
    if (typeof window === 'undefined') return DEFAULT_PALETTE;
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as BrandPalette) || DEFAULT_PALETTE;
  });

  const currentPalette = BRAND_PALETTES[selectedPalette];

  // Apply palette on mount and when it changes
  useEffect(() => {
    applyBrandPalette(currentPalette);
  }, [currentPalette]);

  // Apply on initial render (before React hydration)
  useEffect(() => {
    const initial = (localStorage.getItem(STORAGE_KEY) as BrandPalette) || DEFAULT_PALETTE;
    applyBrandPalette(BRAND_PALETTES[initial]);
  }, []);

  const setSelectedPalette = (palette: BrandPalette) => {
    setSelectedPaletteState(palette);
    try {
      localStorage.setItem(STORAGE_KEY, palette);
    } catch (e) {
      console.warn('Failed to save palette preference:', e);
    }
    applyBrandPalette(BRAND_PALETTES[palette]);
  };

  const value: BrandPaletteContextType = {
    selectedPalette,
    setSelectedPalette,
    currentPalette,
    palettes: Object.values(BRAND_PALETTES),
  };

  return (
    <BrandPaletteContext.Provider value={value}>
      {children}
    </BrandPaletteContext.Provider>
  );
};

export const useBrandPalette = (): BrandPaletteContextType => {
  const context = useContext(BrandPaletteContext);
  if (!context) {
    throw new Error('useBrandPalette must be used within a BrandPaletteProvider');
  }
  return context;
};
