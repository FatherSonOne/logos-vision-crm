import React, { useState } from 'react';
import { CheckCircle, Palette, Loader2 } from 'lucide-react';
import { useBrandPalette, type BrandPalette } from '../contexts/BrandPaletteContext';

/**
 * Compact PaletteSelector for Sidebar
 * ====================================
 * A simplified version that fits in the sidebar
 */
export const PaletteSelectorCompact: React.FC = () => {
  const { selectedPalette, setSelectedPalette, currentPalette, palettes } = useBrandPalette();
  const [pendingPalette, setPendingPalette] = useState<BrandPalette | null>(null);
  const [applying, setApplying] = useState(false);

  // Use pending palette if set, otherwise use selected
  const displayPalette = pendingPalette || selectedPalette;
  const displayPaletteData = palettes.find(p => p.id === displayPalette) || currentPalette;

  const handleSelect = (paletteId: BrandPalette) => {
    // Set as pending - don't apply yet
    setPendingPalette(paletteId);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const paletteToApply = pendingPalette || selectedPalette;
    
    if (!paletteToApply) {
      console.error('No palette to apply');
      return;
    }
    
    setApplying(true);
    
    console.log('Applying palette:', paletteToApply);
    
    try {
      // Apply the palette
      setSelectedPalette(paletteToApply);
      setPendingPalette(null);
      
      // Verify it was applied
      setTimeout(() => {
        const applied = localStorage.getItem('logos-vision-brand-palette');
        console.log('Palette applied, stored as:', applied);
        setApplying(false);
      }, 500);
    } catch (error) {
      console.error('Error applying palette:', error);
      setApplying(false);
    }
  };

  return (
    <div className="space-y-3">
      {palettes.map((palette) => {
        const isSelected = displayPalette === palette.id;
        const isPending = pendingPalette === palette.id && pendingPalette !== selectedPalette;
        
        return (
        <div
          key={palette.id}
          onClick={() => handleSelect(palette.id)}
          className={`
            p-4 rounded-xl border-2 cursor-pointer transition-all relative
            ${isSelected
              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-2'
              : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}
            ${isPending ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900 text-sm">{palette.name}</h3>
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-indigo-600" />
            )}
            {isPending && (
              <span className="text-xs text-yellow-600 font-medium">Pending</span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">{palette.description}</p>
          
          {/* Color Swatches */}
          <div className="flex gap-2">
            <div 
              className="w-8 h-8 rounded-lg border shadow-sm"
              style={{ backgroundColor: palette.colors.primary }}
              title="Primary"
            />
            <div 
              className="w-8 h-8 rounded-lg border shadow-sm"
              style={{ backgroundColor: palette.colors.secondary }}
              title="Secondary"
            />
            <div 
              className="w-8 h-8 rounded-lg border shadow-sm"
              style={{ backgroundColor: palette.colors.accent }}
              title="Accent"
            />
            <div 
              className="w-8 h-8 rounded-lg border shadow-sm flex-1"
              style={{ 
                background: `linear-gradient(135deg, ${palette.colors.primary}, ${palette.colors.secondary})`
              }}
              title="Gradient"
            />
          </div>
        </div>
        );
      })}
      
      {/* Apply Button */}
      <button
        data-palette-apply-btn
        onClick={handleApply}
        disabled={applying}
        className="w-full mt-4 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          background: applying
            ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
            : `linear-gradient(135deg, ${displayPaletteData.colors.primary}, ${displayPaletteData.colors.secondary})`,
          color: '#FFFFFF',
        }}
      >
        {applying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Applying...
          </>
        ) : pendingPalette && pendingPalette !== selectedPalette ? (
          `Apply "${displayPaletteData.name}" Palette`
        ) : (
          `Apply "${displayPaletteData.name}" Palette`
        )}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Updates colors across the entire app
      </p>
    </div>
  );
};
