import React from 'react';
import { useGuidedHelp } from '../contexts/GuidedHelpContext';
import { Info } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

/**
 * HelpTooltip Component
 * =====================
 * Wraps any element to provide context-sensitive help when Guided Help is enabled.
 * 
 * Usage:
 * <HelpTooltip content="This button saves your work." title="Save Action">
 *   <button>Save</button>
 * </HelpTooltip>
 */
export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  title, 
  position = 'top', 
  children,
  className = ''
}) => {
  const { isHelpEnabled } = useGuidedHelp();

  // If help is disabled, just render children without wrapper overhead if possible,
  // but we need the wrapper for consistent layout usually.
  if (!isHelpEnabled) {
    return <>{children}</>;
  }

  // Positioning logic classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-800'
  };

  return (
    <div className={`relative group ${className} inline-block`}>
      {children}
      
      {/* Tooltip Content */}
      <div 
        className={`absolute ${positionClasses[position]} w-64 p-3 bg-slate-800 text-slate-50 text-xs rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-sm border border-slate-700/50`}
      >
        {title && (
          <div className="font-bold mb-1 flex items-center gap-1.5 text-cyan-400">
            <Info className="w-3 h-3" />
            {title}
          </div>
        )}
        <p className="leading-relaxed opacity-90">{content}</p>
        
        {/* Arrow */}
        <div className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}></div>
      </div>
    </div>
  );
};

