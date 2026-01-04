import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useLogo } from '../contexts/LogoContext';
import './LogoAnimations.css';

export type LogoVariant =
  | 'quantum-ripple'
  | 'wave-convergence'
  | 'probability-field'
  | 'nested-horizons'
  | 'interference-bloom'
  | 'singularity-lens'
  | 'team-compass'
  | 'unified-vision'
  | 'strategic-alignment'
  | 'collaborative-hub'
  | 'organized-layers'
  | 'shared-horizon';

interface LogoOption {
  id: LogoVariant;
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Get brand colors from CSS variables (updated by BrandPaletteContext)
const getBrandColor = (varName: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
};

// Dynamic brand colors - pulled from CSS variables set by BrandPaletteContext
const getBrandColors = () => ({
  primary: getBrandColor('--brand-primary', '#22D3EE'),
  primaryLight: getBrandColor('--brand-primary-light', '#67E8F9'),
  primaryDark: getBrandColor('--brand-primary-dark', '#06B6D4'),
  secondary: getBrandColor('--brand-secondary', '#3B82F6'),
  secondaryLight: getBrandColor('--brand-secondary-light', '#60A5FA'),
  secondaryDark: getBrandColor('--brand-secondary-dark', '#2563EB'),
  accent: getBrandColor('--brand-accent', '#2DD4BF'),
  accentLight: getBrandColor('--brand-accent-light', '#5EEAD4'),
  success: getBrandColor('--brand-success', '#4ADE80'),
  warning: getBrandColor('--brand-warning', '#FBBF24'),
  error: getBrandColor('--brand-error', '#F87171'),
  info: getBrandColor('--brand-info', '#38BDF8'),
});

// Fallback colors for SSR
const logosVision = {
  cyan: '#22D3EE',
  cyanLight: '#67E8F9',
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  teal: '#2DD4BF',
  green: '#4ADE80',
  pink: '#F472B6',
  violet: '#A78BFA',
};

// Keep aurora for backward compatibility
const aurora = logosVision;

const logoVariants: Record<LogoVariant, LogoOption> = {
  'quantum-ripple': {
    id: 'quantum-ripple',
    name: 'Quantum Ripple',
    description: 'Concentric waves emanating from a point of infinite potential',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-quantum-ripple">
        <defs>
          <linearGradient id="quantumGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.8" />
            <stop offset="50%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="quantumCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.9" />
            <stop offset="70%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0" />
          </radialGradient>
          <style>{`
            .logo-quantum-ripple circle:nth-child(1) {
              animation: ripple-pulse-1 3s ease-in-out infinite;
            }
            .logo-quantum-ripple circle:nth-child(2) {
              animation: ripple-pulse-2 3s ease-in-out infinite 0.3s;
            }
            .logo-quantum-ripple circle:nth-child(3) {
              animation: ripple-pulse-3 3s ease-in-out infinite 0.6s;
            }
            .logo-quantum-ripple circle:nth-child(4) {
              animation: ripple-pulse-4 3s ease-in-out infinite 0.9s;
            }
            .logo-quantum-ripple circle:nth-child(5) {
              animation: center-pulse 2s ease-in-out infinite;
            }
            @keyframes ripple-pulse-1 {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.05); }
            }
            @keyframes ripple-pulse-2 {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.04); }
            }
            @keyframes ripple-pulse-3 {
              0%, 100% { opacity: 0.7; transform: scale(1); }
              50% { opacity: 0.95; transform: scale(1.03); }
            }
            @keyframes ripple-pulse-4 {
              0%, 100% { opacity: 0.85; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.02); }
            }
            @keyframes center-pulse {
              0%, 100% { opacity: 0.9; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.1); }
            }
          `}</style>
        </defs>
        {/* Outer ripples with pulsing animation */}
        <circle cx="32" cy="32" r="28" stroke="url(#quantumGrad1)" strokeWidth="0.5" fill="none" />
        <circle cx="32" cy="32" r="22" stroke="url(#quantumGrad1)" strokeWidth="0.75" fill="none" />
        <circle cx="32" cy="32" r="16" stroke="url(#quantumGrad1)" strokeWidth="1" fill="none" />
        <circle cx="32" cy="32" r="10" stroke="url(#quantumGrad1)" strokeWidth="1.5" fill="none" />
        {/* Center glow with pulsing */}
        <circle cx="32" cy="32" r="6" fill="url(#quantumCenterGlow)" />
        <circle cx="32" cy="32" r="2" fill="var(--brand-primary, #22D3EE)" />
      </svg>
    )
  },
  'wave-convergence': {
    id: 'wave-convergence',
    name: 'Wave Convergence',
    description: 'Multiple wave fronts meeting at the point of clarity',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-wave-convergence">
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.3" />
          </linearGradient>
          <style>{`
            .logo-wave-convergence path {
              animation: wave-flow 4s ease-in-out infinite;
            }
            .logo-wave-convergence path:nth-child(1) { animation-delay: 0s; }
            .logo-wave-convergence path:nth-child(2) { animation-delay: 0.5s; }
            .logo-wave-convergence path:nth-child(3) { animation-delay: 1s; }
            .logo-wave-convergence path:nth-child(4) { animation-delay: 1.5s; }
            .logo-wave-convergence path:nth-child(5) { animation-delay: 2s; }
            .logo-wave-convergence circle:last-child {
              animation: center-pulse 2s ease-in-out infinite;
            }
            @keyframes wave-flow {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            @keyframes center-pulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.2); opacity: 1; }
            }
          `}</style>
        </defs>
        {/* Horizontal waves from left */}
        <path d="M4 32 Q12 28, 20 32 T36 32" stroke="url(#waveGrad1)" strokeWidth="1.5" fill="none" />
        <path d="M4 36 Q14 30, 24 36 T40 32" stroke="url(#waveGrad1)" strokeWidth="1" fill="none" />
        {/* Horizontal waves from right */}
        <path d="M60 32 Q52 36, 44 32 T28 32" stroke="url(#waveGrad2)" strokeWidth="1.5" fill="none" />
        <path d="M60 28 Q50 34, 40 28 T24 32" stroke="url(#waveGrad2)" strokeWidth="1" fill="none" />
        {/* Vertical waves */}
        <path d="M32 8 Q28 18, 32 28 T32 44" stroke="url(#waveGrad3)" strokeWidth="1" fill="none" />
        {/* Convergence point */}
        <circle cx="32" cy="32" r="5" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.3" />
        <circle cx="32" cy="32" r="2.5" fill="var(--brand-primary, #22D3EE)" />
      </svg>
    )
  },
  'probability-field': {
    id: 'probability-field',
    name: 'Probability Field',
    description: 'Electron cloud orbits representing infinite possibility',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-probability-field">
        <defs>
          <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="orbitGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="orbitGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Orbital ellipses */}
        <ellipse cx="32" cy="32" rx="26" ry="10" stroke="url(#orbitGrad1)" strokeWidth="1" fill="none" transform="rotate(-30 32 32)" />
        <ellipse cx="32" cy="32" rx="26" ry="10" stroke="url(#orbitGrad2)" strokeWidth="1" fill="none" transform="rotate(30 32 32)" />
        <ellipse cx="32" cy="32" rx="26" ry="10" stroke="url(#orbitGrad3)" strokeWidth="1" fill="none" transform="rotate(90 32 32)" />
        {/* Probability particles */}
        <circle cx="48" cy="24" r="1.5" fill="var(--brand-primary, #22D3EE)" />
        <circle cx="16" cy="40" r="1.5" fill="var(--brand-secondary, #3B82F6)" />
        <circle cx="32" cy="10" r="1.5" fill="var(--brand-primary, #22D3EE)" />
        {/* Center nucleus */}
        <circle cx="32" cy="32" r="4" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.4" />
        <circle cx="32" cy="32" r="2" fill="var(--brand-primary, #22D3EE)" />
      </svg>
    )
  },
  'nested-horizons': {
    id: 'nested-horizons',
    name: 'Nested Horizons',
    description: 'Layered perspectives converging toward infinite depth',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-nested-horizons">
        <defs>
          <linearGradient id="horizonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Horizon layers - back to front */}
        <path d="M4 48 Q32 30, 60 48" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1" fill="none" />
        <path d="M8 44 Q32 28, 56 44" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1.2" fill="none" />
        <path d="M12 40 Q32 26, 52 40" stroke="var(--brand-primary, #22D3EE)" strokeWidth="1.4" fill="none" />
        <path d="M16 36 Q32 24, 48 36" stroke="var(--brand-primary, #22D3EE)" strokeWidth="1.6" fill="none" />
        <path d="M20 32 Q32 22, 44 32" stroke="var(--brand-primary, #22D3EE)" strokeWidth="1.8" fill="none" />
        {/* Vanishing point / focal glow */}
        <circle cx="32" cy="24" r="6" fill="url(#horizonGrad)" opacity="0.4" />
        <circle cx="32" cy="24" r="2" fill="var(--brand-primary, #22D3EE)" />
        {/* Subtle reflection lines */}
        <path d="M26 32 L32 24 L38 32" stroke="var(--brand-primary, #22D3EE)" strokeWidth="0.5" fill="none" />
      </svg>
    )
  },
  'interference-bloom': {
    id: 'interference-bloom',
    name: 'Interference Bloom',
    description: 'Overlapping wave patterns creating emergent beauty',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-interference-bloom">
        <defs>
          <radialGradient id="bloomGrad1" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bloomGrad2" cx="70%" cy="30%" r="60%">
            <stop offset="0%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bloomGrad3" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Overlapping bloom circles */}
        <circle cx="24" cy="24" r="18" fill="url(#bloomGrad1)" />
        <circle cx="40" cy="24" r="18" fill="url(#bloomGrad2)" />
        <circle cx="32" cy="40" r="18" fill="url(#bloomGrad3)" />
        {/* Interference pattern lines */}
        <circle cx="32" cy="28" r="12" stroke="var(--brand-primary, #22D3EE)" strokeWidth="0.5" fill="none" />
        <circle cx="32" cy="28" r="8" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="0.5" fill="none" />
        <circle cx="32" cy="28" r="4" stroke="var(--brand-primary, #22D3EE)" strokeWidth="0.5" fill="none" />
        {/* Center point of interference */}
        <circle cx="32" cy="28" r="2" fill="var(--brand-primary, #22D3EE)" />
      </svg>
    )
  },
  'singularity-lens': {
    id: 'singularity-lens',
    name: 'Singularity Lens',
    description: 'Light bending around a point of infinite focus',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-singularity-lens">
        <defs>
          <linearGradient id="lensGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lensGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="singularityGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="var(--brand-primary, #22D3EE)" stopOpacity="0.5" />
          </radialGradient>
        </defs>
        {/* Gravitational lens effect - bent light rays */}
        <path d="M8 20 Q20 32, 32 32 Q44 32, 56 44" stroke="url(#lensGrad1)" strokeWidth="1" fill="none" />
        <path d="M8 28 Q22 34, 32 32 Q42 30, 56 36" stroke="url(#lensGrad1)" strokeWidth="1" fill="none" />
        <path d="M8 36 Q24 34, 32 32 Q40 30, 56 28" stroke="url(#lensGrad2)" strokeWidth="1" fill="none" />
        <path d="M8 44 Q20 32, 32 32 Q44 32, 56 20" stroke="url(#lensGrad2)" strokeWidth="1" fill="none" />
        {/* Event horizon ring */}
        <circle cx="32" cy="32" r="10" stroke="var(--brand-primary, #22D3EE)" strokeWidth="1" fill="none" />
        <circle cx="32" cy="32" r="6" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1.5" fill="none" />
        {/* Singularity core */}
        <circle cx="32" cy="32" r="4" fill="url(#singularityGrad)" />
        <circle cx="32" cy="32" r="1.5" fill="var(--brand-primary, #22D3EE)" />
      </svg>
    )
  },
  'team-compass': {
    id: 'team-compass',
    name: 'Team Compass',
    description: 'Guiding your team toward shared goals with precision and clarity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-team-compass">
        <circle cx="12" cy="12" r="10" stroke="var(--brand-primary, #22D3EE)" strokeWidth="2" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="2" />
        <path d="M12 8l-4 4 4 4 4-4-4-4z" stroke="var(--brand-primary, #22D3EE)" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="2" fill="var(--brand-primary, #22D3EE)" />
        {/* Team members around compass */}
        <circle cx="12" cy="4" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.6" />
        <circle cx="20" cy="12" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.6" />
        <circle cx="12" cy="20" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.6" />
        <circle cx="4" cy="12" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.6" />
      </svg>
    )
  },
  'unified-vision': {
    id: 'unified-vision',
    name: 'Unified Vision',
    description: 'Multiple perspectives converging into a single, clear direction',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-unified-vision">
        {/* Central eye/vision point */}
        <circle cx="12" cy="12" r="8" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.1" />
        <circle cx="12" cy="12" r="4" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="2" fill="var(--brand-primary, #22D3EE)" />
        {/* Converging lines from team members */}
        <path d="M4 4L12 12M20 4L12 12M4 20L12 12M20 20L12 12" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1.5" strokeDasharray="2 2" />
        {/* Team member nodes */}
        <circle cx="4" cy="4" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="20" cy="4" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="4" cy="20" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="20" cy="20" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
      </svg>
    )
  },
  'strategic-alignment': {
    id: 'strategic-alignment',
    name: 'Strategic Alignment',
    description: 'Organized layers working in perfect harmony toward common objectives',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-strategic-alignment">
        {/* Organized layers */}
        <rect x="3" y="3" width="18" height="4" rx="1" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.2" />
        <rect x="3" y="10" width="18" height="4" rx="1" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.3" />
        <rect x="3" y="17" width="18" height="4" rx="1" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.4" />
        {/* Alignment indicator */}
        <path d="M6 5L18 5M6 12L18 12M6 19L18 19" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1.5" />
        {/* Central focus point */}
        <circle cx="12" cy="12" r="2" fill="var(--brand-primary, #22D3EE)" />
        <path d="M12 5L12 19M5 12L19 12" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1" strokeDasharray="1 1" />
      </svg>
    )
  },
  'collaborative-hub': {
    id: 'collaborative-hub',
    name: 'Collaborative Hub',
    description: 'Team members connected around a central source of truth',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-collaborative-hub">
        {/* Central hub */}
        <circle cx="12" cy="12" r="5" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="3" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.4" />
        <circle cx="12" cy="12" r="1.5" fill="var(--brand-primary, #22D3EE)" />
        {/* Connected team members */}
        <circle cx="12" cy="4" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.5" />
        <circle cx="20" cy="12" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.5" />
        <circle cx="12" cy="20" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.5" />
        <circle cx="4" cy="12" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.5" />
        {/* Connection lines */}
        <path d="M12 6L12 9M18 12L15 12M12 18L12 15M6 12L9 12" stroke="var(--brand-primary, #22D3EE)" strokeWidth="1.5" />
        {/* Diagonal connections */}
        <circle cx="17" cy="7" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="7" cy="17" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="17" cy="17" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="7" cy="7" r="1.5" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
      </svg>
    )
  },
  'organized-layers': {
    id: 'organized-layers',
    name: 'Organized Layers',
    description: 'Structured hierarchy with clear vision flowing through each level',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-organized-layers">
        {/* Pyramid structure */}
        <path d="M12 2L4 8L12 14L20 8L12 2Z" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.15" />
        <path d="M12 8L6 12L12 16L18 12L12 8Z" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.25" />
        <path d="M12 12L10 13L12 14L14 13L12 12Z" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.4" />
        {/* Vision flow lines */}
        <path d="M12 2L12 8M12 8L12 12M12 12L12 14" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1.5" />
        <path d="M4 8L6 12M20 8L18 12" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1" strokeDasharray="1 1" />
        {/* Central focus */}
        <circle cx="12" cy="13" r="1" fill="var(--brand-primary, #22D3EE)" />
      </svg>
    )
  },
  'shared-horizon': {
    id: 'shared-horizon',
    name: 'Shared Horizon',
    description: 'Team members looking forward together toward a common future',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-shared-horizon">
        {/* Horizon line */}
        <path d="M2 16L22 16" stroke="var(--brand-primary, #22D3EE)" strokeWidth="2" />
        {/* Team members (figures) */}
        <circle cx="6" cy="12" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        <circle cx="12" cy="10" r="2" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.5" />
        <circle cx="18" cy="12" r="2" fill="var(--brand-secondary, #3B82F6)" fillOpacity="0.4" />
        {/* Vision rays toward horizon */}
        <path d="M6 10L6 16M12 8L12 16M18 10L18 16" stroke="var(--brand-primary, #22D3EE)" strokeWidth="1.5" />
        {/* Shared goal on horizon */}
        <circle cx="12" cy="16" r="3" fill="var(--brand-primary, #22D3EE)" fillOpacity="0.2" />
        <circle cx="12" cy="16" r="1.5" fill="var(--brand-primary, #22D3EE)" />
        {/* Connection between team */}
        <path d="M6 12L12 10L18 12" stroke="var(--brand-secondary, #3B82F6)" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    )
  }
};

interface LogoSelectorProps {
  currentVariant: LogoVariant;
  onSelect: (variant: LogoVariant) => void;
}

export const LogoSelector: React.FC<LogoSelectorProps> = ({ currentVariant, onSelect }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.values(logoVariants).map((option) => (
        <div
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`
            aspect-square p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden
            ${currentVariant === option.id
              ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 ring-2 ring-indigo-200 shadow-md'
              : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 hover:shadow-sm'}
          `}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-indigo-400/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-blue-400/15 to-transparent rounded-full blur-2xl" />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 relative z-10 h-full">
            {/* Logo preview - centered */}
            <div className="w-16 h-16 flex items-center justify-center transition-transform duration-300 hover:scale-110">
              {option.icon}
            </div>

            {/* Name */}
            <div className="text-center">
              <h3 className="font-semibold text-sm text-gray-900 tracking-wide">{option.name}</h3>
            </div>

            {/* Selection indicator */}
            {currentVariant === option.id && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Full preview panel with side-by-side comparison
export const LogoPreviewPanel: React.FC<{
  onSelect?: (variant: LogoVariant) => void;
  initialVariant?: LogoVariant;
}> = ({ onSelect, initialVariant }) => {
  // Use LogoContext directly to ensure changes apply to the app
  const { selectedVariant: contextVariant, setSelectedVariant: setContextVariant } = useLogo();
  const [localVariant, setLocalVariant] = useState<LogoVariant>(initialVariant || contextVariant);
  const [hoveredVariant, setHoveredVariant] = useState<LogoVariant | null>(null);

  // Sync with context if it changes externally
  React.useEffect(() => {
    if (initialVariant && initialVariant !== contextVariant) {
      setLocalVariant(initialVariant);
    } else {
      setLocalVariant(contextVariant);
    }
  }, [contextVariant, initialVariant]);

  const selectedVariant = localVariant;
  const displayVariant = hoveredVariant || selectedVariant;
  const displayOption = logoVariants[displayVariant];

  const handleSelect = (variant: LogoVariant) => {
    setLocalVariant(variant);
    // Update the context - this will change the logo in the app
    setContextVariant(variant);
    // Also call the optional callback if provided
    if (onSelect) {
      onSelect(variant);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <h2 className="text-lg font-semibold text-slate-100">Choose Your Logo</h2>
        <p className="text-sm text-slate-400 mt-1">Serene, quantum-inspired designs for the bigger picture</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Large Preview Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-700/50 min-h-[300px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Aurora background effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-teal-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-radial from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-radial from-cyan-500/25 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          {/* Logo preview */}
          <div className="relative z-10 transition-all duration-500 ease-out transform hover:scale-105">
            <div className="w-40 h-40 flex items-center justify-center">
              {displayOption.icon}
            </div>
          </div>

          {/* Logo name display */}
          <div className="mt-6 text-center relative z-10">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {displayOption.icon}
              </div>
              <span 
                className="text-2xl font-bold tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--brand-primary), var(--brand-secondary), var(--brand-accent))`
                }}
              >
                Logos Vision
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-3 max-w-xs">{displayOption.description}</p>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="lg:w-96 p-4 bg-slate-900/50">
          <div className="grid grid-cols-2 gap-3">
            {Object.values(logoVariants).map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                onMouseEnter={() => setHoveredVariant(option.id)}
                onMouseLeave={() => setHoveredVariant(null)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200 relative
                  ${selectedVariant === option.id
                    ? 'border-teal-400/60 bg-teal-500/10 shadow-md shadow-teal-500/10'
                    : 'border-slate-700/50 hover:border-teal-500/40 hover:bg-slate-800/50'}
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {option.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-300 text-center">{option.name}</span>
                </div>

                {selectedVariant === option.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-400 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-slate-900" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Apply button - Now actually applies to the app via context */}
          <button
            onClick={() => handleSelect(selectedVariant)}
            className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              color: '#FFFFFF',
            }}
          >
            Apply "{logoVariants[selectedVariant].name}"
          </button>
        </div>
      </div>
    </div>
  );
};

export const Logo: React.FC<{
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  showText?: boolean;
  showBackground?: boolean;
}> = ({
  variant,
  size = 'md',
  glow = true,
  showText = true,
  showBackground = true
}) => {
  // Use context variant if no explicit variant is passed
  const { selectedVariant } = useLogo();
  const activeVariant = variant ?? selectedVariant;
  const logoOption = logoVariants[activeVariant];

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  // Padding based on size for the container
  const containerPadding = {
    sm: 'py-1.5 px-2.5',
    md: 'py-2 px-3',
    lg: 'py-2.5 px-4'
  };

  // Gap between icon and text
  const gapSize = {
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3'
  };

  return (
    <div
      className={`
        inline-flex items-center ${gapSize[size]} group
        ${containerPadding[size]}
        rounded-xl
        transition-all duration-300 ease-out
        ${showBackground
          ? 'bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700/60'
          : ''
        }
        ${glow && !showBackground ? 'aurora-glow-pulse' : ''}
      `}
    >
      {/* Logo icon */}
      <div
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center flex-shrink-0
          transition-transform duration-300 ease-out
          group-hover:scale-110
          ${glow ? 'aurora-glow-pulse' : ''}
        `}
      >
        {logoOption.icon}
      </div>
      {/* Logo text with gradient - conditionally shown */}
      {showText && (
        <span
          className={`
            ${textSizes[size]}
            font-bold tracking-tight whitespace-nowrap
            bg-clip-text text-transparent
            transition-all duration-300
          `}
          style={{
            backgroundImage: 'linear-gradient(to right, var(--brand-primary, #0891b2), var(--brand-secondary, #2563eb), var(--brand-accent, #0d9488))'
          }}
        >
          Logos Vision
        </span>
      )}
    </div>
  );
};

// Export for use in other components
export { logoVariants, aurora };
