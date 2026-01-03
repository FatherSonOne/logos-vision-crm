import React from 'react';
import { useBrandPalette } from '../contexts/BrandPaletteContext';
import type { LogoVariant } from './Logo';

/**
 * LogoIcon - Dynamic logo that uses current brand palette colors
 */
interface LogoIconProps {
  variant: LogoVariant;
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ variant, className = '' }) => {
  const { currentPalette } = useBrandPalette();
  const colors = currentPalette.colors;

  // Map variant to SVG based on current palette colors
  const getLogoSVG = () => {
    switch (variant) {
      case 'quantum-ripple':
        return (
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`logo-quantum-ripple ${className}`}>
            <defs>
              <linearGradient id={`quantumGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
                <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id={`quantumCenter-${variant}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.9" />
                <stop offset="70%" stopColor={colors.secondary} stopOpacity="0.5" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="32" cy="32" r="28" stroke={`url(#quantumGrad-${variant})`} strokeWidth="0.5" fill="none" />
            <circle cx="32" cy="32" r="22" stroke={`url(#quantumGrad-${variant})`} strokeWidth="0.75" fill="none" />
            <circle cx="32" cy="32" r="16" stroke={`url(#quantumGrad-${variant})`} strokeWidth="1" fill="none" />
            <circle cx="32" cy="32" r="10" stroke={`url(#quantumGrad-${variant})`} strokeWidth="1.5" fill="none" />
            <circle cx="32" cy="32" r="6" fill={`url(#quantumCenter-${variant})`} />
            <circle cx="32" cy="32" r="2" fill={colors.primary} />
          </svg>
        );
      
      case 'wave-convergence':
        return (
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={`logo-wave-convergence ${className}`}>
            <defs>
              <linearGradient id={`waveGrad1-${variant}`} x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
                <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id={`waveGrad2-${variant}`} x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.8" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id={`waveGrad3-${variant}`} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d="M4 32 Q12 28, 20 32 T36 32" stroke={`url(#waveGrad1-${variant})`} strokeWidth="1.5" fill="none" />
            <path d="M4 36 Q14 30, 24 36 T40 32" stroke={`url(#waveGrad1-${variant})`} strokeWidth="1" fill="none" />
            <path d="M60 32 Q52 36, 44 32 T28 32" stroke={`url(#waveGrad2-${variant})`} strokeWidth="1.5" fill="none" />
            <path d="M60 28 Q50 34, 40 28 T24 32" stroke={`url(#waveGrad2-${variant})`} strokeWidth="1" fill="none" />
            <path d="M32 8 Q28 18, 32 28 T32 44" stroke={`url(#waveGrad3-${variant})`} strokeWidth="1" fill="none" />
            <circle cx="32" cy="32" r="5" fill={colors.primary} fillOpacity="0.3" />
            <circle cx="32" cy="32" r="2.5" fill={colors.primary} />
          </svg>
        );
      
      default:
        // Fallback to a simple circle with brand colors
        return (
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
              <linearGradient id={`defaultGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="100%" stopColor={colors.secondary} />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="24" fill={`url(#defaultGrad-${variant})`} />
            <circle cx="32" cy="32" r="12" fill={colors.accent} fillOpacity="0.5" />
            <circle cx="32" cy="32" r="6" fill={colors.primary} />
          </svg>
        );
    }
  };

  return getLogoSVG();
};
