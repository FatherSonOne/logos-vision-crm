import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useLogo } from '../contexts/LogoContext';

export type LogoVariant =
  | 'quantum-ripple'
  | 'wave-convergence'
  | 'probability-field'
  | 'nested-horizons'
  | 'interference-bloom'
  | 'singularity-lens';

interface LogoOption {
  id: LogoVariant;
  name: string;
  description: string;
  icon: React.ReactNode;
}

// Aurora palette colors
const aurora = {
  green: '#4ade80',      // Ethereal green
  teal: '#2dd4bf',       // Soft teal
  pink: '#f472b6',       // Gentle pink
  violet: '#a78bfa',     // Soft violet
  cyan: '#22d3ee',       // Light cyan
  rose: '#fb7185',       // Soft rose
};

const logoVariants: Record<LogoVariant, LogoOption> = {
  'quantum-ripple': {
    id: 'quantum-ripple',
    name: 'Quantum Ripple',
    description: 'Concentric waves emanating from a point of infinite potential',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="auroraGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={aurora.teal} stopOpacity="0.8" />
            <stop offset="50%" stopColor={aurora.green} stopOpacity="0.5" />
            <stop offset="100%" stopColor={aurora.pink} stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="centerGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={aurora.cyan} stopOpacity="0.9" />
            <stop offset="100%" stopColor={aurora.teal} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Outer ripples */}
        <circle cx="32" cy="32" r="28" stroke="url(#auroraGrad1)" strokeWidth="0.5" fill="none" opacity="0.3" />
        <circle cx="32" cy="32" r="22" stroke="url(#auroraGrad1)" strokeWidth="0.75" fill="none" opacity="0.5" />
        <circle cx="32" cy="32" r="16" stroke="url(#auroraGrad1)" strokeWidth="1" fill="none" opacity="0.7" />
        <circle cx="32" cy="32" r="10" stroke="url(#auroraGrad1)" strokeWidth="1.5" fill="none" opacity="0.85" />
        {/* Center glow */}
        <circle cx="32" cy="32" r="6" fill="url(#centerGlow1)" />
        <circle cx="32" cy="32" r="2" fill={aurora.cyan} />
      </svg>
    )
  },
  'wave-convergence': {
    id: 'wave-convergence',
    name: 'Wave Convergence',
    description: 'Multiple wave fronts meeting at the point of clarity',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={aurora.green} stopOpacity="0.8" />
            <stop offset="100%" stopColor={aurora.teal} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor={aurora.pink} stopOpacity="0.8" />
            <stop offset="100%" stopColor={aurora.violet} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waveGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={aurora.cyan} stopOpacity="0.6" />
            <stop offset="100%" stopColor={aurora.green} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Horizontal waves from left */}
        <path d="M4 32 Q12 28, 20 32 T36 32" stroke="url(#waveGrad1)" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M4 36 Q14 30, 24 36 T40 32" stroke="url(#waveGrad1)" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Horizontal waves from right */}
        <path d="M60 32 Q52 36, 44 32 T28 32" stroke="url(#waveGrad2)" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M60 28 Q50 34, 40 28 T24 32" stroke="url(#waveGrad2)" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Vertical waves */}
        <path d="M32 8 Q28 18, 32 28 T32 44" stroke="url(#waveGrad3)" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Convergence point */}
        <circle cx="32" cy="32" r="5" fill={aurora.teal} fillOpacity="0.3" />
        <circle cx="32" cy="32" r="2.5" fill={aurora.cyan} />
      </svg>
    )
  },
  'probability-field': {
    id: 'probability-field',
    name: 'Probability Field',
    description: 'Electron cloud orbits representing infinite possibility',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="orbitGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={aurora.green} stopOpacity="0.9" />
            <stop offset="100%" stopColor={aurora.teal} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="orbitGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={aurora.pink} stopOpacity="0.8" />
            <stop offset="100%" stopColor={aurora.violet} stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="orbitGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={aurora.cyan} stopOpacity="0.7" />
            <stop offset="100%" stopColor={aurora.green} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Orbital ellipses */}
        <ellipse cx="32" cy="32" rx="26" ry="10" stroke="url(#orbitGrad1)" strokeWidth="1" fill="none" transform="rotate(-30 32 32)" opacity="0.6" />
        <ellipse cx="32" cy="32" rx="26" ry="10" stroke="url(#orbitGrad2)" strokeWidth="1" fill="none" transform="rotate(30 32 32)" opacity="0.6" />
        <ellipse cx="32" cy="32" rx="26" ry="10" stroke="url(#orbitGrad3)" strokeWidth="1" fill="none" transform="rotate(90 32 32)" opacity="0.6" />
        {/* Probability particles */}
        <circle cx="48" cy="24" r="1.5" fill={aurora.green} opacity="0.8" />
        <circle cx="16" cy="40" r="1.5" fill={aurora.pink} opacity="0.8" />
        <circle cx="32" cy="10" r="1.5" fill={aurora.cyan} opacity="0.8" />
        {/* Center nucleus */}
        <circle cx="32" cy="32" r="4" fill={aurora.teal} fillOpacity="0.4" />
        <circle cx="32" cy="32" r="2" fill={aurora.cyan} />
      </svg>
    )
  },
  'nested-horizons': {
    id: 'nested-horizons',
    name: 'Nested Horizons',
    description: 'Layered perspectives converging toward infinite depth',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="horizonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={aurora.violet} stopOpacity="0.3" />
            <stop offset="50%" stopColor={aurora.teal} stopOpacity="0.6" />
            <stop offset="100%" stopColor={aurora.green} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* Horizon layers - back to front */}
        <path d="M4 48 Q32 30, 60 48" stroke={aurora.violet} strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M8 44 Q32 28, 56 44" stroke={aurora.pink} strokeWidth="1.2" fill="none" opacity="0.5" />
        <path d="M12 40 Q32 26, 52 40" stroke={aurora.teal} strokeWidth="1.4" fill="none" opacity="0.6" />
        <path d="M16 36 Q32 24, 48 36" stroke={aurora.cyan} strokeWidth="1.6" fill="none" opacity="0.7" />
        <path d="M20 32 Q32 22, 44 32" stroke={aurora.green} strokeWidth="1.8" fill="none" opacity="0.85" />
        {/* Vanishing point / focal glow */}
        <circle cx="32" cy="24" r="6" fill="url(#horizonGrad)" opacity="0.4" />
        <circle cx="32" cy="24" r="2" fill={aurora.cyan} />
        {/* Subtle reflection lines */}
        <path d="M26 32 L32 24 L38 32" stroke={aurora.green} strokeWidth="0.5" fill="none" opacity="0.5" />
      </svg>
    )
  },
  'interference-bloom': {
    id: 'interference-bloom',
    name: 'Interference Bloom',
    description: 'Overlapping wave patterns creating emergent beauty',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bloomGrad1" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor={aurora.green} stopOpacity="0.6" />
            <stop offset="100%" stopColor={aurora.green} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bloomGrad2" cx="70%" cy="30%" r="60%">
            <stop offset="0%" stopColor={aurora.pink} stopOpacity="0.5" />
            <stop offset="100%" stopColor={aurora.pink} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bloomGrad3" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor={aurora.cyan} stopOpacity="0.5" />
            <stop offset="100%" stopColor={aurora.cyan} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Overlapping bloom circles */}
        <circle cx="24" cy="24" r="18" fill="url(#bloomGrad1)" />
        <circle cx="40" cy="24" r="18" fill="url(#bloomGrad2)" />
        <circle cx="32" cy="40" r="18" fill="url(#bloomGrad3)" />
        {/* Interference pattern lines */}
        <circle cx="32" cy="28" r="12" stroke={aurora.teal} strokeWidth="0.5" fill="none" opacity="0.6" />
        <circle cx="32" cy="28" r="8" stroke={aurora.teal} strokeWidth="0.5" fill="none" opacity="0.7" />
        <circle cx="32" cy="28" r="4" stroke={aurora.teal} strokeWidth="0.5" fill="none" opacity="0.8" />
        {/* Center point of interference */}
        <circle cx="32" cy="28" r="2" fill={aurora.cyan} />
      </svg>
    )
  },
  'singularity-lens': {
    id: 'singularity-lens',
    name: 'Singularity Lens',
    description: 'Light bending around a point of infinite focus',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lensGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={aurora.green} stopOpacity="0.7" />
            <stop offset="100%" stopColor={aurora.teal} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lensGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={aurora.pink} stopOpacity="0.7" />
            <stop offset="100%" stopColor={aurora.violet} stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="singularityGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor={aurora.cyan} stopOpacity="0.5" />
          </radialGradient>
        </defs>
        {/* Gravitational lens effect - bent light rays */}
        <path d="M8 20 Q20 32, 32 32 Q44 32, 56 44" stroke="url(#lensGrad1)" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M8 28 Q22 34, 32 32 Q42 30, 56 36" stroke="url(#lensGrad1)" strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M8 36 Q24 34, 32 32 Q40 30, 56 28" stroke="url(#lensGrad2)" strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M8 44 Q20 32, 32 32 Q44 32, 56 20" stroke="url(#lensGrad2)" strokeWidth="1" fill="none" opacity="0.6" />
        {/* Event horizon ring */}
        <circle cx="32" cy="32" r="10" stroke={aurora.cyan} strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="32" cy="32" r="6" stroke={aurora.teal} strokeWidth="1.5" fill="none" opacity="0.7" />
        {/* Singularity core */}
        <circle cx="32" cy="32" r="4" fill="url(#singularityGrad)" />
        <circle cx="32" cy="32" r="1.5" fill={aurora.cyan} />
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {Object.values(logoVariants).map((option) => (
        <div
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`
            p-6 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden
            ${currentVariant === option.id
              ? 'border-teal-400/60 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-pink-500/5 ring-1 ring-teal-400/30 shadow-lg shadow-teal-500/10'
              : 'border-slate-700/50 hover:border-teal-500/30 hover:bg-slate-800/30 hover:shadow-md hover:shadow-teal-500/5'}
          `}
        >
          {/* Subtle aurora background glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-green-400/20 to-transparent rounded-full blur-2xl" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-pink-400/15 to-transparent rounded-full blur-2xl" />
          </div>

          <div className="flex flex-col items-center gap-4 relative z-10">
            {/* Large logo preview */}
            <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-110">
              {option.icon}
            </div>

            {/* Name and description */}
            <div className="text-center">
              <h3 className="font-semibold text-base text-slate-100 tracking-wide">{option.name}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[200px]">{option.description}</p>
            </div>

            {/* Selection indicator */}
            {currentVariant === option.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <CheckCircle className="w-4 h-4 text-slate-900" />
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
  onSelect: (variant: LogoVariant) => void;
  initialVariant?: LogoVariant;
}> = ({ onSelect, initialVariant = 'quantum-ripple' }) => {
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant>(initialVariant);
  const [hoveredVariant, setHoveredVariant] = useState<LogoVariant | null>(null);

  const displayVariant = hoveredVariant || selectedVariant;
  const displayOption = logoVariants[displayVariant];

  const handleSelect = (variant: LogoVariant) => {
    setSelectedVariant(variant);
    onSelect(variant);
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
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-pink-300 bg-clip-text text-transparent">
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

          {/* Apply button */}
          <button
            onClick={() => onSelect(selectedVariant)}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 font-semibold text-sm transition-all duration-200 hover:from-teal-400 hover:to-cyan-400 hover:shadow-lg hover:shadow-teal-500/25"
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
        <span className={`
          ${textSizes[size]}
          font-bold tracking-tight whitespace-nowrap
          bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600
          dark:from-teal-300 dark:via-cyan-200 dark:to-pink-200
          bg-clip-text text-transparent
          transition-all duration-300
          group-hover:from-cyan-500 group-hover:via-teal-500 group-hover:to-pink-500
          dark:group-hover:from-cyan-300 dark:group-hover:via-teal-300 dark:group-hover:to-pink-300
        `}>
          Logos Vision
        </span>
      )}
    </div>
  );
};

// Export for use in other components
export { logoVariants, aurora };
