import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useGuidedHelp } from '../../contexts/GuidedHelpContext';

/**
 * HelpToggle Component
 * ====================
 * A switch to enable/disable the global Guided Help system.
 * Designed to sit in the header or settings area.
 */
export const HelpToggle: React.FC = () => {
  const { isHelpEnabled, toggleHelp } = useGuidedHelp();

  return (
    <button
      onClick={toggleHelp}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 group
        ${isHelpEnabled 
          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20' 
          : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-400'}
      `}
      title={isHelpEnabled ? "Turn off guided help" : "Turn on guided help"}
    >
      <HelpCircle className={`w-4 h-4 ${isHelpEnabled ? 'animate-pulse-slow' : ''}`} />
      <span className="text-xs font-medium hidden sm:inline">
        Help: {isHelpEnabled ? 'ON' : 'OFF'}
      </span>
      
      {/* Mini indicator dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${isHelpEnabled ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-slate-600'}`}></span>
    </button>
  );
};

