import React, { useState } from 'react';
import { Shield, Cpu, Activity, Layout, HelpCircle, Layers, CheckCircle, Info, Sparkles, Eye } from 'lucide-react';
import { LogoSelector, LogoPreviewPanel, Logo, LogoVariant, logoVariants, aurora } from './Logo';
import { useLogo } from '../contexts/LogoContext';

interface DesignOption {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  icon: React.ReactNode;
}

/**
 * LogoShowcase - Dedicated preview for the new quantum-inspired logos
 */
export const LogoShowcase: React.FC = () => {
  const [selectedLogo, setSelectedLogo] = useState<LogoVariant>('quantum-ripple');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-teal-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-cyan-200 to-pink-300 bg-clip-text text-transparent">
            Logos Vision - Logo Redesign
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl">
          Serene, quantum-inspired designs that evoke "longview" and "bigger picture" thinking.
          Each logo uses wave interference patterns and the aurora palette for an ethereal, contemplative feel.
        </p>
      </div>

      {/* Main Preview Panel */}
      <div className="max-w-6xl mx-auto mb-12">
        <LogoPreviewPanel
          onSelect={setSelectedLogo}
          initialVariant={selectedLogo}
        />
      </div>

      {/* Individual Logo Showcases */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
          <Eye className="w-5 h-5 text-cyan-400" />
          All Logo Options
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(logoVariants).map((option) => (
            <div
              key={option.id}
              className={`
                rounded-2xl border p-8 transition-all duration-300 cursor-pointer
                ${selectedLogo === option.id
                  ? 'border-teal-400/60 bg-gradient-to-br from-slate-800/80 to-slate-900/80 shadow-xl shadow-teal-500/10'
                  : 'border-slate-700/50 bg-slate-900/30 hover:border-teal-500/30 hover:bg-slate-800/50'}
              `}
              onClick={() => setSelectedLogo(option.id)}
            >
              {/* Large logo display */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center relative">
                  {/* Subtle glow behind logo */}
                  <div className="absolute inset-0 bg-gradient-radial from-teal-500/10 to-transparent rounded-full blur-xl" />
                  <div className="relative z-10">
                    {option.icon}
                  </div>
                </div>
              </div>

              {/* Logo info */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center justify-center gap-2">
                  {option.name}
                  {selectedLogo === option.id && (
                    <CheckCircle className="w-4 h-4 text-teal-400" />
                  )}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{option.description}</p>

                {/* Preview with text */}
                <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/50 rounded-xl">
                  <div className="w-6 h-6">
                    {option.icon}
                  </div>
                  <span className="font-semibold bg-gradient-to-r from-teal-300 via-cyan-200 to-pink-200 bg-clip-text text-transparent">
                    Logos Vision
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Size Variations */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Size Variations</h2>
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
          <div className="flex flex-wrap items-end justify-center gap-12">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-3">Small</p>
              <Logo variant={selectedLogo} size="sm" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-3">Medium</p>
              <Logo variant={selectedLogo} size="md" />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-3">Large</p>
              <Logo variant={selectedLogo} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette Reference */}
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">Aurora Palette</h2>
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-8">
          <div className="flex flex-wrap justify-center gap-6">
            {Object.entries(aurora).map(([name, color]) => (
              <div key={name} className="text-center">
                <div
                  className="w-16 h-16 rounded-xl shadow-lg mb-2 border border-white/10"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs text-slate-400 capitalize">{name}</p>
                <p className="text-xs text-slate-500 font-mono">{color}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="max-w-6xl mx-auto mt-12 mb-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-6">In Context</h2>
        <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          {/* Simulated header */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
            <Logo variant={selectedLogo} size="md" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">Dashboard</span>
              <span className="text-sm text-slate-400">Contacts</span>
              <span className="text-sm text-slate-400">Projects</span>
            </div>
          </div>
          {/* Simulated content */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30" />
              <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30" />
              <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Design Philosophy */}
      <div className="max-w-6xl mx-auto mt-12 mb-8 text-center">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/30 p-8">
          <h3 className="text-lg font-semibold text-teal-300 mb-4">Design Philosophy</h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            These logos embody the quantum nature of possibility and perspective. Wave interference patterns
            represent how multiple viewpoints converge into clarity. The aurora palette evokes the ethereal
            beauty of natural phenomena operating at scales beyond everyday perception - from northern lights
            to quantum probability fields. Each design invites contemplation of the bigger picture.
          </p>
        </div>
      </div>
    </div>
  );
};

export const DesignPreview: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('prism');
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const { selectedVariant, setSelectedVariant } = useLogo();


  const options: DesignOption[] = [
    {
      id: 'prism',
      name: 'The Source Prism',
      description: 'Represents Logos Vision as the central source of truth, refracting clarity into all partner applications. Dark, modern, and high-contrast.',
      colors: {
        primary: '#0F172A', // Slate 900
        secondary: '#3B82F6', // Blue 500
        accent: '#22D3EE', // Cyan 400
        background: '#020617', // Slate 950
        text: '#F8FAFC', // Slate 50
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4L5 20H19L12 4Z" className="stroke-cyan-400" />
          <path d="M12 9L9 16H15L12 9Z" className="stroke-blue-500" fill="currentColor" fillOpacity="0.2" />
          <path d="M5 20L3 22M19 20L21 22M12 4L12 2" className="stroke-slate-500" strokeDasharray="2 2" />
        </svg>
      )
    },
    {
      id: 'network',
      name: 'The Connected Hub',
      description: 'Emphasizes connectivity and integration. Logos Vision is the core node, stabilizing and feeding data to the ecosystem.',
      colors: {
        primary: '#FFFFFF', // White
        secondary: '#6366F1', // Indigo 500
        accent: '#8B5CF6', // Violet 500
        background: '#F3F4F6', // Gray 100
        text: '#1F2937', // Gray 800
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" className="stroke-indigo-600" fill="currentColor" fillOpacity="0.1" />
          <circle cx="12" cy="4" r="2" className="stroke-violet-400" />
          <circle cx="20" cy="12" r="2" className="stroke-violet-400" />
          <circle cx="12" cy="20" r="2" className="stroke-violet-400" />
          <circle cx="4" cy="12" r="2" className="stroke-violet-400" />
          <path d="M12 8V6M16 12H18M12 16V18M8 12H6" className="stroke-gray-400" />
        </svg>
      )
    },
    {
      id: 'iris',
      name: 'The Visionary Iris',
      description: 'Focuses on clarity, foresight, and oversight. A clean, professional look that implies precision and control.',
      colors: {
        primary: '#1E293B', // Slate 800
        secondary: '#10B981', // Emerald 500
        accent: '#34D399', // Emerald 400
        background: '#F8FAFC', // Slate 50
        text: '#334155', // Slate 700
      },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" className="stroke-slate-700" />
          <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" className="stroke-emerald-500" />
          <path d="M12 3C14.5 3 16.5 7 16.5 12C16.5 17 14.5 21 12 21" className="stroke-slate-400" />
          <path d="M12 3C9.5 3 7.5 7 7.5 12C7.5 17 9.5 21 12 21" className="stroke-slate-400" />
          <path d="M3 12H21" className="stroke-slate-300" strokeDasharray="4 4" />
        </svg>
      )
    }
  ];

  const currentDesign = options.find(o => o.id === selectedOption) || options[0];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {/* Top Bar with Help Toggle */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Layout className="w-6 h-6 text-indigo-600" />
          Design Preview: {currentDesign.name}
        </h1>
        <div 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors group relative"
          onClick={() => setShowHelp(!showHelp)}
        >
          <HelpCircle className={`w-5 h-5 ${showHelp ? 'text-indigo-600' : 'text-gray-400'}`} />
          <span className={`text-sm font-medium ${showHelp ? 'text-indigo-700' : 'text-gray-500'}`}>
            Guided Help: {showHelp ? 'ON' : 'OFF'}
          </span>
          
          {/* Example of the hover-help feature */}
          {showHelp && (
            <div className="absolute top-full mt-2 right-0 w-64 bg-slate-800 text-white text-xs p-3 rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="font-bold mb-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Help Toggle
              </div>
              Use this switch to enable or disable the guided tooltips across the application. Great for onboarding new team members!
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Options Selector */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* Logo Selection Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Logo & Icon</h2>
            <LogoSelector currentVariant={selectedVariant} onSelect={setSelectedVariant} />
          </div>
          
          {/* Design Theme Selection */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Design Concepts</h2>
            <div className="space-y-4">
              {options.map(option => (
                <div 
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOption === option.id 
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2' 
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-800">
                      {option.icon}
                    </div>
                    {selectedOption === option.id && <CheckCircle className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <h3 className="font-bold text-gray-900">{option.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{option.description}</p>
                  
                  <div className="flex gap-2 mt-3">
                    <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: option.colors.primary }} title="Primary"></div>
                    <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: option.colors.secondary }} title="Secondary"></div>
                    <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: option.colors.accent }} title="Accent"></div>
                    <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: option.colors.background }} title="Background"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-8 overflow-y-auto" style={{ backgroundColor: currentDesign.colors.background }}>
          <div className="max-w-4xl mx-auto">
            {/* Mock Navigation Header */}
            <div 
              className="rounded-xl shadow-lg p-4 mb-8 flex justify-between items-center relative group"
              style={{ backgroundColor: currentDesign.colors.primary, color: currentDesign.colors.text }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm">
                 {/* Reusing the selected icon but smaller */}
                 <div className="w-8 h-8 text-current">
                   {currentDesign.icon}
                 </div>
                </div>
                <div className="font-bold text-xl tracking-tight">LOGOS VISION</div>
              </div>
              
              <div className="flex items-center gap-6 text-sm font-medium opacity-90">
                {['Dashboard', 'Projects', 'Clients', 'Reports'].map(item => (
                   <span key={item} className="cursor-pointer hover:opacity-100 hover:underline underline-offset-4 decoration-2 decoration-current">
                     {item}
                   </span>
                ))}
              </div>

              {showHelp && (
                 <div className="absolute -bottom-16 left-20 bg-slate-800 text-white text-xs p-3 rounded shadow-lg z-50 pointer-events-none">
                    <div className="font-bold mb-1 text-yellow-400">Navigation Bar</div>
                    Quickly access your key modules. This bar remains visible everywhere.
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                 </div>
              )}
            </div>

            {/* Mock Content Grid */}
            <div className="grid grid-cols-3 gap-6">
              {/* Card 1 */}
              <div 
                className="col-span-2 rounded-xl p-6 shadow-md relative group border"
                style={{ backgroundColor: '#FFFFFF', borderColor: currentDesign.colors.background === '#FFFFFF' ? '#E5E7EB' : 'transparent' }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                         US
                       </div>
                       <div className="flex-1">
                         <div className="h-2 w-3/4 bg-gray-200 rounded mb-2"></div>
                         <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                       </div>
                     </div>
                   ))}
                </div>

                {showHelp && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 text-white text-xs p-4 rounded-lg backdrop-blur-sm z-10 w-64 text-center pointer-events-none">
                     <p className="font-bold text-lg mb-2">Activity Stream</p>
                     <p>Monitor real-time updates from your team and partner apps. Click any item to jump to details.</p>
                  </div>
                )}
              </div>

              {/* Card 2 - Stats */}
              <div 
                className="rounded-xl p-6 shadow-md border relative group"
                 style={{ backgroundColor: '#FFFFFF', borderColor: currentDesign.colors.background === '#FFFFFF' ? '#E5E7EB' : 'transparent' }}
              >
                 <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5" style={{ color: currentDesign.colors.secondary }} />
                    <span className="font-bold text-gray-700">System Health</span>
                 </div>
                 <div className="text-3xl font-bold mb-1" style={{ color: currentDesign.colors.primary }}>98%</div>
                 <div className="text-xs text-gray-500">Operational uptime</div>
                 
                 <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu className="w-5 h-5" style={{ color: currentDesign.colors.accent }} />
                        <span className="font-bold text-gray-700">Integrations</span>
                    </div>
                     <div className="flex gap-2">
                        {['P', 'E', 'V', 'A'].map((l, i) => (
                          <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                               style={{ backgroundColor: i % 2 === 0 ? currentDesign.colors.secondary : currentDesign.colors.accent }}>
                            {l}
                          </div>
                        ))}
                     </div>
                 </div>

                 {showHelp && (
                  <div className="absolute -right-4 top-10 w-48 bg-slate-800 text-white text-xs p-3 rounded shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="font-bold mb-1 text-green-400">System Status</div>
                    Quick view of integration health with Pulse, Entomate, Visionboard, and Agentica.
                    <div className="absolute top-4 -left-1 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <h2 className="text-xl font-bold mb-2">Guided Workflows</h2>
                 <p className="opacity-80 max-w-lg">
                   Experience the new step-by-step interface. Each section now includes contextual hints to guide you through complex tasks.
                 </p>
                 <button 
                   className="mt-4 px-4 py-2 rounded-lg font-medium text-sm transition-transform hover:scale-105 active:scale-95"
                   style={{ backgroundColor: currentDesign.colors.accent, color: '#000' }}
                 >
                   Start Tour
                 </button>
               </div>
               
               {/* Decorative elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

               {showHelp && (
                  <div className="absolute top-4 right-4 bg-white text-gray-900 text-xs p-3 rounded shadow-lg z-50 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="font-bold mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-600" /> Contextual Actions
                    </div>
                    Hovering over sections like this will now reveal specific actions available to you, reducing clutter until needed.
                  </div>
               )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
