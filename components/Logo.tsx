import React, { useState } from 'react';

export const Logo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo SVG with animations */}
      <div className="relative">
        {/* Ripple container - shows on hover */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isHovered ? 'logo-ripple-active' : ''}`}>
          <div className="logo-ripple-ring logo-ripple-ring-1"></div>
          <div className="logo-ripple-ring logo-ripple-ring-2"></div>
          <div className="logo-ripple-ring logo-ripple-ring-3"></div>
        </div>

        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="text-cyan-500 dark:text-cyan-400 relative z-10 logo-svg"
        >
          {/* Glimmer overlay */}
          <defs>
            <linearGradient id="logo-glimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="60%" stopColor="transparent" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <mask id="logo-mask">
              <g fill="white" stroke="white" strokeWidth="1">
                <line x1="12" y1="6.5" x2="12" y2="3.5" />
                <line x1="16.95" y1="7.05" x2="18.5" y2="5.5" />
                <line x1="17.5" y1="12" x2="20.5" y2="12" />
                <line x1="16.95" y1="16.95" x2="18.5" y2="18.5" />
                <line x1="12" y1="17.5" x2="12" y2="20.5" />
                <line x1="7.05" y1="16.95" x2="5.5" y2="18.5" />
                <line x1="6.5" y1="12" x2="3.5" y2="12" />
                <line x1="7.05" y1="7.05" x2="5.5" y2="5.5" />
                <circle cx="12" cy="2" r="1.3" />
                <circle cx="19.5" cy="4.5" r="1.3" />
                <circle cx="22" cy="12" r="1.3" />
                <circle cx="19.5" cy="19.5" r="1.3" />
                <circle cx="12" cy="22" r="1.3" />
                <circle cx="4.5" cy="19.5" r="1.3" />
                <circle cx="2" cy="12" r="1.3" />
                <circle cx="4.5" cy="4.5" r="1.3" />
                <path fillRule="evenodd" d="M12 17.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-3 4a1 1 0 011-1h4a1 1 0 011 1v-1.5a2.5 2.5 0 00-5 0V16z" />
              </g>
            </mask>
            {/* Glow filter for hover */}
            <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Main logo group with breathing animation */}
          <g
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            className="logo-compass-lines"
            filter={isHovered ? "url(#logo-glow)" : undefined}
          >
            {/* Compass lines with staggered pulse */}
            <line x1="12" y1="6.5" x2="12" y2="3.5" className="logo-line logo-line-n" />
            <line x1="16.95" y1="7.05" x2="18.5" y2="5.5" className="logo-line logo-line-ne" />
            <line x1="17.5" y1="12" x2="20.5" y2="12" className="logo-line logo-line-e" />
            <line x1="16.95" y1="16.95" x2="18.5" y2="18.5" className="logo-line logo-line-se" />
            <line x1="12" y1="17.5" x2="12" y2="20.5" className="logo-line logo-line-s" />
            <line x1="7.05" y1="16.95" x2="5.5" y2="18.5" className="logo-line logo-line-sw" />
            <line x1="6.5" y1="12" x2="3.5" y2="12" className="logo-line logo-line-w" />
            <line x1="7.05" y1="7.05" x2="5.5" y2="5.5" className="logo-line logo-line-nw" />
          </g>

          {/* Corner circles with breathing glow */}
          <g fill="currentColor" className="logo-corners">
            <circle cx="12" cy="2" r="1.3" className="logo-corner logo-corner-1" />
            <circle cx="19.5" cy="4.5" r="1.3" className="logo-corner logo-corner-2" />
            <circle cx="22" cy="12" r="1.3" className="logo-corner logo-corner-3" />
            <circle cx="19.5" cy="19.5" r="1.3" className="logo-corner logo-corner-4" />
            <circle cx="12" cy="22" r="1.3" className="logo-corner logo-corner-5" />
            <circle cx="4.5" cy="19.5" r="1.3" className="logo-corner logo-corner-6" />
            <circle cx="2" cy="12" r="1.3" className="logo-corner logo-corner-7" />
            <circle cx="4.5" cy="4.5" r="1.3" className="logo-corner logo-corner-8" />
          </g>

          {/* Center design */}
          <g fill="currentColor" className="logo-center">
            <path
              fillRule="evenodd"
              d="M12 17.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm-3 4a1 1 0 011-1h4a1 1 0 011 1v-1.5a2.5 2.5 0 00-5 0V16z"
              className="logo-center-path"
            />
          </g>

          {/* Glimmer sweep overlay */}
          <rect
            x="-2"
            y="-2"
            width="28"
            height="28"
            fill="url(#logo-glimmer)"
            mask="url(#logo-mask)"
            className="logo-glimmer-overlay"
          />
        </svg>
      </div>

      {/* Text with subtle shimmer */}
      <span className="text-xl font-semibold text-slate-800 dark:text-slate-100 hidden sm:inline text-shadow-strong logo-text">
        Logos Vision
      </span>
    </div>
  );
};
