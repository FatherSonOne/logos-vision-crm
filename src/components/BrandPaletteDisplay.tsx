import React from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { useBrandPalette, BRAND_PALETTES } from '../contexts/BrandPaletteContext';

/**
 * BrandPaletteDisplay Component
 * ==============================
 * Displays the current Logos Vision brand palette with all color swatches
 */
export const BrandPaletteDisplay: React.FC = () => {
  const { currentPalette } = useBrandPalette();
  // Use the currently selected palette, not hardcoded
  const displayPalette = currentPalette;

  const colorGroups = [
    {
      title: 'Primary Colors',
      colors: [
        { name: 'Primary', value: displayPalette.colors.primary, description: 'Main brand color' },
        { name: 'Primary Light', value: displayPalette.colors.primaryLight, description: 'Hover states' },
        { name: 'Primary Dark', value: displayPalette.colors.primaryDark, description: 'Active states' },
      ]
    },
    {
      title: 'Secondary Colors',
      colors: [
        { name: 'Secondary', value: displayPalette.colors.secondary, description: 'Supporting brand color' },
        { name: 'Secondary Light', value: displayPalette.colors.secondaryLight, description: 'Hover states' },
        { name: 'Secondary Dark', value: displayPalette.colors.secondaryDark, description: 'Active states' },
      ]
    },
    {
      title: 'Accent & Semantic',
      colors: [
        { name: 'Accent', value: displayPalette.colors.accent, description: 'Complementary accent' },
        { name: 'Success', value: displayPalette.colors.success, description: 'Positive actions' },
        { name: 'Warning', value: displayPalette.colors.warning, description: 'Cautions' },
        { name: 'Error', value: displayPalette.colors.error, description: 'Errors' },
        { name: 'Info', value: displayPalette.colors.info, description: 'Information' },
      ]
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{displayPalette.name} Brand Palette</h2>
            <p className="text-sm text-slate-400 mt-0.5">{displayPalette.description}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Color Swatches */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="space-y-2">
            <div 
              className="h-24 rounded-xl shadow-lg border border-slate-700/30"
              style={{ backgroundColor: displayPalette.colors.primary }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-200">Primary</p>
              <p className="text-xs text-slate-400 font-mono">{displayPalette.colors.primary}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div 
              className="h-24 rounded-xl shadow-lg border border-slate-700/30"
              style={{ backgroundColor: displayPalette.colors.secondary }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-200">Secondary</p>
              <p className="text-xs text-slate-400 font-mono">{displayPalette.colors.secondary}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div 
              className="h-24 rounded-xl shadow-lg border border-slate-700/30"
              style={{ backgroundColor: displayPalette.colors.accent }}
            />
            <div>
              <p className="text-sm font-semibold text-slate-200">Accent</p>
              <p className="text-xs text-slate-400 font-mono">{displayPalette.colors.accent}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div 
              className="h-24 rounded-xl shadow-lg border border-slate-700/30 flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${displayPalette.colors.primary}, ${displayPalette.colors.secondary})`
              }}
            >
              <Sparkles className="w-8 h-8 text-white/80" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Gradient</p>
              <p className="text-xs text-slate-400">Primary → Secondary</p>
            </div>
          </div>
        </div>

        {/* Detailed Color Groups */}
        <div className="space-y-6">
          {colorGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
                {group.title}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {group.colors.map((color, colorIdx) => (
                  <div key={colorIdx} className="space-y-2">
                    <div 
                      className="h-16 rounded-lg shadow-md border"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: 'rgba(148, 163, 184, 0.2)'
                      }}
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-200">{color.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{color.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{color.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Light/Dark Mode Preview */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">
            Light & Dark Mode
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Light Mode Preview */}
            <div 
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: displayPalette.colors.surfaceLight,
                borderColor: displayPalette.colors.borderLight,
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: displayPalette.colors.textLight }}>
                Light Mode
              </p>
              <div className="space-y-2">
                <div 
                  className="h-8 rounded-lg"
                  style={{ backgroundColor: displayPalette.colors.bgLight }}
                />
                <div 
                  className="h-8 rounded-lg"
                  style={{ backgroundColor: displayPalette.colors.surfaceLight }}
                />
                <div 
                  className="h-8 rounded-lg"
                  style={{ backgroundColor: displayPalette.colors.surface2Light }}
                />
              </div>
            </div>

            {/* Dark Mode Preview */}
            <div 
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: displayPalette.colors.surfaceDark,
                borderColor: displayPalette.colors.borderDark,
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: displayPalette.colors.textDark }}>
                Dark Mode
              </p>
              <div className="space-y-2">
                <div 
                  className="h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: displayPalette.colors.bgDark,
                    borderColor: displayPalette.colors.borderDark
                  }}
                />
                <div 
                  className="h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: displayPalette.colors.surfaceDark,
                    borderColor: displayPalette.colors.borderDark
                  }}
                />
                <div 
                  className="h-8 rounded-lg border"
                  style={{ 
                    backgroundColor: displayPalette.colors.surface2Dark,
                    borderColor: displayPalette.colors.borderDark
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
