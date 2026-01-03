import React, { useState } from 'react';
import { CheckCircle, Palette, Sparkles } from 'lucide-react';
import { useBrandPalette, type BrandPalette } from '../contexts/BrandPaletteContext';

/**
 * PaletteSelector Component
 * =========================
 * Allows users to preview and select from 3 brand palettes.
 * Shows color swatches and applies the selected palette to the entire app.
 */
export const PaletteSelector: React.FC = () => {
  const { selectedPalette, setSelectedPalette, currentPalette, palettes } = useBrandPalette();
  const [hoveredPalette, setHoveredPalette] = useState<BrandPalette | null>(null);

  const displayPalette = hoveredPalette 
    ? palettes.find(p => p.id === hoveredPalette) || currentPalette
    : currentPalette;

  const handleApply = (paletteId: BrandPalette) => {
    setSelectedPalette(paletteId);
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Brand Palette</h2>
            <p className="text-sm text-slate-400 mt-0.5">Choose your color theme</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Large Preview Area */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-700/50 min-h-[400px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Preview Card */}
          <div 
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${displayPalette.colors.surfaceDark}, ${displayPalette.colors.surface2Dark})`,
              border: `1px solid ${displayPalette.colors.borderDark}`,
            }}
          >
            {/* Preview Header */}
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${displayPalette.colors.primary}, ${displayPalette.colors.secondary})`,
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: displayPalette.colors.textDark }}
                >
                  {displayPalette.name}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: displayPalette.colors.textSecondaryDark }}
                >
                  {displayPalette.description}
                </p>
              </div>
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="space-y-2">
                <div 
                  className="h-16 rounded-lg shadow-lg"
                  style={{ backgroundColor: displayPalette.colors.primary }}
                />
                <p className="text-xs text-center" style={{ color: displayPalette.colors.textSecondaryDark }}>
                  Primary
                </p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-16 rounded-lg shadow-lg"
                  style={{ backgroundColor: displayPalette.colors.secondary }}
                />
                <p className="text-xs text-center" style={{ color: displayPalette.colors.textSecondaryDark }}>
                  Secondary
                </p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-16 rounded-lg shadow-lg"
                  style={{ backgroundColor: displayPalette.colors.accent }}
                />
                <p className="text-xs text-center" style={{ color: displayPalette.colors.textSecondaryDark }}>
                  Accent
                </p>
              </div>
              <div className="space-y-2">
                <div 
                  className="h-16 rounded-lg shadow-lg"
                  style={{ backgroundColor: displayPalette.colors.success }}
                />
                <p className="text-xs text-center" style={{ color: displayPalette.colors.textSecondaryDark }}>
                  Success
                </p>
              </div>
            </div>

            {/* Preview Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${displayPalette.colors.primary}, ${displayPalette.colors.secondary})`,
                  color: displayPalette.colors.textDark,
                }}
              >
                Primary Action
              </button>
              <button
                className="px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border"
                style={{
                  borderColor: displayPalette.colors.primary,
                  color: displayPalette.colors.primary,
                  backgroundColor: 'transparent',
                }}
              >
                Secondary
              </button>
            </div>
          </div>

          {/* Palette Name Display */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400 max-w-xs">{displayPalette.description}</p>
          </div>
        </div>

        {/* Selection Grid */}
        <div className="lg:w-96 p-6 bg-slate-900/50">
          <div className="space-y-3">
            {palettes.map((palette) => (
              <div
                key={palette.id}
                onClick={() => handleApply(palette.id)}
                onMouseEnter={() => setHoveredPalette(palette.id)}
                onMouseLeave={() => setHoveredPalette(null)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200 relative
                  ${selectedPalette === palette.id
                    ? 'border-cyan-400/60 bg-cyan-500/10 shadow-md shadow-cyan-500/10'
                    : 'border-slate-700/50 hover:border-cyan-500/40 hover:bg-slate-800/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Color Swatches */}
                  <div className="flex gap-1.5">
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: palette.colors.primary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: palette.colors.secondary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: palette.colors.accent }}
                    />
                  </div>

                  {/* Palette Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-slate-200">{palette.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{palette.description}</p>
                  </div>

                  {/* Selection Indicator */}
                  {selectedPalette === palette.id && (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-900" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Apply Button */}
          <button
            onClick={() => handleApply(selectedPalette)}
            className="w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/25"
            style={{
              background: `linear-gradient(135deg, ${currentPalette.colors.primary}, ${currentPalette.colors.secondary})`,
              color: currentPalette.colors.textDark,
            }}
          >
            Apply "{currentPalette.name}" Palette
          </button>

          <p className="text-xs text-slate-500 mt-3 text-center">
            This will update colors across the entire application
          </p>
        </div>
      </div>
    </div>
  );
};
