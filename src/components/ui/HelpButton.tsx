// src/components/ui/HelpButton.tsx
// Help button that links to the user manual

import React from 'react';

interface HelpButtonProps {
  onClick?: () => void;
  manualUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  onClick,
  manualUrl = '/manual',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: { button: 'h-8 w-8', icon: 'h-4 w-4' },
    md: { button: 'h-10 w-10', icon: 'h-5 w-5' },
    lg: { button: 'h-12 w-12', icon: 'h-6 w-6' }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (manualUrl) {
      window.open(manualUrl, '_blank');
    }
  };

  return (
    <button
      id="help-button"
      onClick={handleClick}
      aria-label="Open user manual"
      title="User Manual"
      className={`
        ${sizeClasses[size].button}
        relative overflow-hidden rounded-full
        bg-slate-100 dark:bg-[#0a0a0a]
        border border-slate-200 dark:border-[#1a1a1a]
        hover:bg-slate-200 dark:hover:bg-[#121212]
        hover:border-slate-300 dark:hover:border-[#7dd3fc]/50
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7dd3fc] focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-black
        transition-all duration-300 ease-in-out
        group
        ${className}
      `}
    >
      {/* Background glow on hover */}
      <div
        className="
          absolute inset-0 rounded-full
          bg-gradient-to-br from-[#7dd3fc]/0 to-cyan-500/0
          group-hover:from-[#7dd3fc]/10 group-hover:to-cyan-500/10
          dark:group-hover:from-[#7dd3fc]/20 dark:group-hover:to-cyan-400/10
          transition-all duration-300
        "
      />

      {/* Centered icon container */}
      <div className="relative flex items-center justify-center w-full h-full">
        <svg
          className={`
            ${sizeClasses[size].icon}
            text-slate-600 dark:text-slate-300
            group-hover:text-[#0ea5e9] dark:group-hover:text-[#7dd3fc]
            transition-colors duration-300
          `}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
    </button>
  );
};

export default HelpButton;
