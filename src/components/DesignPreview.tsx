import React, { useState, useRef, useCallback } from 'react';
import { Shield, Cpu, Layout, HelpCircle, Layers, CheckCircle, Info, Sparkles, Eye, Download, Palette, Type, Monitor, Smartphone, Tablet, Maximize2 } from 'lucide-react';
import { LogoSelector, LogoPreviewPanel, Logo, LogoVariant, logoVariants, aurora } from './Logo';
import { useLogo } from '../contexts/LogoContext';
import { useFont, type FontFamily, type FontSize, type FontConfig } from '../contexts/FontContext';
import { PaletteSelectorCompact } from './PaletteSelectorCompact';
import { BrandPaletteDisplay } from './BrandPaletteDisplay';

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
 * LogoDownloader - Component to download the logo as PNG
 */
const LogoDownloader: React.FC<{ selectedLogo: LogoVariant }> = ({ selectedLogo }) => {
  const svgRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number>(512);

  const sizes = [
    { label: '64px', value: 64 },
    { label: '128px', value: 128 },
    { label: '256px', value: 256 },
    { label: '512px', value: 512 },
    { label: '1024px', value: 1024 },
  ];

  const downloadAsPng = useCallback(async () => {
    const logoOption = logoVariants[selectedLogo];
    if (!logoOption) return;

    setDownloading(true);

    try {
      // Create a temporary container for the SVG
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="${selectedSize}" height="${selectedSize}">${
        // Get the inner content of the logo SVG
        (logoOption.icon as React.ReactElement).props.children
      }</svg>`;

      // Get the SVG element from logoVariants
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.setAttribute('viewBox', '0 0 64 64');
      svgElement.setAttribute('width', selectedSize.toString());
      svgElement.setAttribute('height', selectedSize.toString());
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Clone the icon's SVG content
      const iconElement = logoOption.icon as React.ReactElement;
      const iconProps = iconElement.props;

      // Create SVG string from the React element
      const svgString = `
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" width="${selectedSize}" height="${selectedSize}">
          ${renderReactSvgToString(iconProps.children)}
        </svg>
      `;

      // Create a blob from the SVG
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      // Create an image to draw on canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = selectedSize;
        canvas.height = selectedSize;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Optional: Add background
          // ctx.fillStyle = '#0f172a';
          // ctx.fillRect(0, 0, selectedSize, selectedSize);

          ctx.drawImage(img, 0, 0, selectedSize, selectedSize);

          // Convert to PNG and download
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngUrl = URL.createObjectURL(pngBlob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `logos-vision-${selectedLogo}-${selectedSize}px.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
            }
            setDownloading(false);
          }, 'image/png');
        }
        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        console.error('Failed to load SVG');
        setDownloading(false);
      };

      img.src = url;
    } catch (error) {
      console.error('Download failed:', error);
      setDownloading(false);
    }
  }, [selectedLogo, selectedSize]);

  // Helper function to convert React children to SVG string
  const renderReactSvgToString = (children: React.ReactNode): string => {
    if (!children) return '';

    const processNode = (node: React.ReactNode): string => {
      if (!node) return '';
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(processNode).join('');

      if (React.isValidElement(node)) {
        const { type, props } = node;
        const tagName = typeof type === 'string' ? type : 'g';

        // Convert props to attributes
        const attrs = Object.entries(props || {})
          .filter(([key]) => key !== 'children')
          .map(([key, value]) => {
            // Convert camelCase to kebab-case for SVG attributes
            const attrName = key
              .replace(/([A-Z])/g, '-$1')
              .toLowerCase()
              .replace(/^-/, '');
            // Handle className -> class
            const finalAttrName = attrName === 'class-name' ? 'class' : attrName;
            return `${finalAttrName}="${value}"`;
          })
          .join(' ');

        const childContent = processNode(props?.children);

        if (childContent) {
          return `<${tagName} ${attrs}>${childContent}</${tagName}>`;
        }
        return `<${tagName} ${attrs}/>`;
      }

      return '';
    };

    return processNode(children);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Download className="w-5 h-5 text-indigo-600" />
        Download Logo as PNG
      </h2>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Preview */}
        <div
          ref={svgRef}
          className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 relative overflow-hidden"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-indigo-500/5 to-transparent rounded-xl" />
          <div className="w-32 h-32 relative z-10">
            {logoVariants[selectedLogo]?.icon}
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${selectedSize === size.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }
                  `}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadAsPng}
              disabled={downloading}
              className={`
                flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                transition-all duration-200
                ${downloading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 hover:shadow-lg hover:shadow-indigo-500/25'
                }
              `}
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Generating...' : `Download PNG (${selectedSize}px)`}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Downloads the "{logoVariants[selectedLogo]?.name}" logo as a transparent PNG file.
          </p>
        </div>
      </div>
    </div>
  );
};

type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'full';


const fontSizes: { id: FontSize; name: string; scale: number }[] = [
  { id: 'small', name: 'Small (90%)', scale: 0.9 },
  { id: 'medium', name: 'Medium (100%)', scale: 1.0 },
  { id: 'large', name: 'Large (110%)', scale: 1.1 },
];

const viewportSizes: { id: ViewportSize; name: string; width: number; height: number; icon: React.ReactNode }[] = [
  { id: 'mobile', name: 'Mobile', width: 375, height: 667, icon: <Smartphone className="w-4 h-4" /> },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: <Tablet className="w-4 h-4" /> },
  { id: 'desktop', name: 'Desktop', width: 1280, height: 720, icon: <Monitor className="w-4 h-4" /> },
  { id: 'full', name: 'Full Screen', width: 0, height: 0, icon: <Maximize2 className="w-4 h-4" /> },
];

/**
 * Font Selector Component
 */
const FontSelector: React.FC = () => {
  const { fontConfig, setFontConfig } = useFont();

  const fontFamilyMap: Record<FontFamily, string> = {
    'inter': "'Inter', system-ui, sans-serif",
    'system': "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    'roboto': "'Roboto', sans-serif",
    'open-sans': "'Open Sans', sans-serif",
    'poppins': "'Poppins', sans-serif",
    'anthropic-serif': "'Crimson Pro', 'Georgia', serif",
    'jetbrains-mono': "'JetBrains Mono', 'Courier New', monospace",
    'fira-code': "'Fira Code', 'Courier New', monospace",
    'source-code-pro': "'Source Code Pro', 'Courier New', monospace",
    'ibm-plex-mono': "'IBM Plex Mono', 'Courier New', monospace",
  };

  const fontsByCategory: Record<string, { id: FontFamily; name: string }[]> = {
    'Sans Serif': [
      { id: 'inter', name: 'Inter' },
      { id: 'system', name: 'System' },
      { id: 'roboto', name: 'Roboto' },
      { id: 'open-sans', name: 'Open Sans' },
      { id: 'poppins', name: 'Poppins' },
    ],
    'Serif': [
      { id: 'anthropic-serif', name: 'Anthropic Serif (Crimson Pro)' },
    ],
    'Monospace': [
      { id: 'jetbrains-mono', name: 'JetBrains Mono' },
      { id: 'fira-code', name: 'Fira Code' },
      { id: 'source-code-pro', name: 'Source Code Pro' },
      { id: 'ibm-plex-mono', name: 'IBM Plex Mono' },
    ],
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Type className="w-5 h-5 text-indigo-600" />
        Typography
      </h2>

      <div className="space-y-6">
        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Font Family</label>
          <div className="space-y-3">
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <div key={category}>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">{category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setFontConfig({ ...fontConfig, family: font.id })}
                      className={`
                        px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left
                        ${fontConfig.family === font.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }
                      `}
                      style={fontConfig.family === font.id ? {} : { fontFamily: fontFamilyMap[font.id] }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Font Size</label>
          <div className="flex gap-2">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontConfig({ ...fontConfig, size: size.id })}
                className={`
                  flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${fontConfig.size === size.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }
                `}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Preview</p>
          <div
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            style={{
              fontFamily: fontFamilyMap[fontConfig.family] || 'Inter',
              fontSize: `${(fontSizes.find(s => s.id === fontConfig.size)?.scale || 1) * 16}px`,
            }}
          >
            <h3 className="font-bold text-lg mb-2">Heading Example</h3>
            <p className="text-base mb-2">Body text example showing how the selected font and size look in practice.</p>
            <p className="text-sm text-gray-600">Small text for labels and metadata.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Responsive Preview Component
 */
const ResponsivePreview: React.FC<{
  viewportSize: ViewportSize;
  onViewportChange: (size: ViewportSize) => void;
  children: React.ReactNode;
}> = ({ viewportSize, onViewportChange, children }) => {
  const currentViewport = viewportSizes.find(v => v.id === viewportSize) || viewportSizes[2];

  // Apply viewport scaling to the entire app with safe scaling limits
  React.useEffect(() => {
    const root = document.documentElement;
    const appContainer = document.getElementById('root');
    
    if (viewportSize === 'full') {
      // Reset scaling for full screen
      root.style.removeProperty('--viewport-scale');
      root.style.removeProperty('--viewport-width');
      root.removeAttribute('data-viewport-scale');
      if (appContainer) {
        appContainer.style.removeProperty('transform');
        appContainer.style.removeProperty('width');
        appContainer.style.removeProperty('transform-origin');
      }
    } else {
      // Calculate scale with safe minimums
      let scale: number;
      const desktopWidth = 1280;
      
      if (viewportSize === 'desktop') {
        scale = 1.0;
      } else if (viewportSize === 'tablet') {
        // Tablet: scale to 60% (768/1280 = 0.6, but we'll use 0.6)
        scale = Math.max(0.6, currentViewport.width / desktopWidth);
      } else if (viewportSize === 'mobile') {
        // Mobile: use 50% scale (safe minimum) - slightly less than tablet but not too small
        // This ensures mobile is visible and usable
        scale = 0.5;
      } else {
        scale = Math.max(0.5, Math.min(1, currentViewport.width / desktopWidth));
      }
      
      // Apply scaling to the entire app
      root.style.setProperty('--viewport-scale', scale.toString());
      root.style.setProperty('--viewport-width', `${currentViewport.width}px`);
      root.setAttribute('data-viewport-scale', viewportSize);
      
      if (appContainer) {
        appContainer.style.transform = `scale(${scale})`;
        appContainer.style.transformOrigin = 'top center';
        appContainer.style.width = `${100 / scale}%`;
      }
    }
    
    return () => {
      // Cleanup on unmount - reset to prevent stuck states
      if (appContainer) {
        appContainer.style.removeProperty('transform');
        appContainer.style.removeProperty('width');
        appContainer.style.removeProperty('transform-origin');
      }
      root.style.removeProperty('--viewport-scale');
      root.style.removeProperty('--viewport-width');
      root.removeAttribute('data-viewport-scale');
    };
  }, [viewportSize, currentViewport]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            Responsive Preview
          </h2>
          <div className="flex items-center gap-2">
            {viewportSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => onViewportChange(size.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${viewportSize === size.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title={size.name}
              >
                {size.icon}
                <span className="hidden sm:inline">{size.name}</span>
              </button>
            ))}
            <button
              onClick={() => {
                // Force reset to desktop
                onViewportChange('desktop');
                const root = document.documentElement;
                const appContainer = document.getElementById('root');
                if (appContainer) {
                  appContainer.style.removeProperty('transform');
                  appContainer.style.removeProperty('width');
                  appContainer.style.removeProperty('transform-origin');
                }
                root.style.removeProperty('--viewport-scale');
                root.style.removeProperty('--viewport-width');
                root.removeAttribute('data-viewport-scale');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              title="Reset to Desktop (Ctrl+Shift+R)"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-100 min-h-[600px]">
        <div className="flex justify-center">
          <div
            className="bg-white rounded-lg shadow-lg transition-all duration-300 overflow-auto"
            style={{
              width: viewportSize === 'full' ? '100%' : `${currentViewport.width}px`,
              maxWidth: '100%',
              maxHeight: viewportSize === 'full' ? 'none' : '80vh',
              height: viewportSize === 'full' ? 'auto' : `${currentViewport.height}px`,
            }}
          >
            <div style={{ width: '100%', minHeight: '100%' }}>
              {children}
            </div>
          </div>
        </div>
        {viewportSize !== 'full' && (
          <p className="text-xs text-gray-500 text-center mt-2">
            {currentViewport.name}: {currentViewport.width} × {currentViewport.height}px
            {viewportSize === 'mobile' && ' (50% scale)'}
            {viewportSize === 'tablet' && ' (60% scale)'}
            {viewportSize === 'desktop' && ' (100% scale)'}
          </p>
        )}
      </div>
    </div>
  );
};

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

      {/* Logo Download Section */}
      <div className="max-w-6xl mx-auto mt-12">
        <LogoDownloader selectedLogo={selectedLogo} />
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
  const { fontConfig } = useFont();
  const [viewportSize, setViewportSize] = useState<ViewportSize>(() => {
    // Reset to desktop on mount to prevent stuck states
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('logos-vision-viewport-size');
      if (stored && ['mobile', 'tablet', 'desktop', 'full'].includes(stored)) {
        return stored as ViewportSize;
      }
    }
    return 'desktop';
  });

  // Reset any global scaling when component mounts
  React.useEffect(() => {
    const root = document.documentElement;
    const appContainer = document.getElementById('root');
    
    // Reset any global scaling
    if (appContainer) {
      appContainer.style.removeProperty('transform');
      appContainer.style.removeProperty('width');
      appContainer.style.removeProperty('transform-origin');
    }
    root.style.removeProperty('--viewport-scale');
    root.style.removeProperty('--viewport-width');
    root.removeAttribute('data-viewport-scale');
    
    // Save viewport size to localStorage
    localStorage.setItem('logos-vision-viewport-size', viewportSize);
    
    // Add keyboard shortcut to reset (Ctrl+Shift+R or Cmd+Shift+R)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setViewportSize('desktop');
        // Force reset
        const rootEl = document.documentElement;
        const appContainerEl = document.getElementById('root');
        if (appContainerEl) {
          appContainerEl.style.removeProperty('transform');
          appContainerEl.style.removeProperty('width');
          appContainerEl.style.removeProperty('transform-origin');
        }
        rootEl.style.removeProperty('--viewport-scale');
        rootEl.style.removeProperty('--viewport-width');
        rootEl.removeAttribute('data-viewport-scale');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Expose reset function to window for console access
    (window as any).resetViewport = () => {
      setViewportSize('desktop');
      const rootEl = document.documentElement;
      const appContainerEl = document.getElementById('root');
      if (appContainerEl) {
        appContainerEl.style.removeProperty('transform');
        appContainerEl.style.removeProperty('width');
        appContainerEl.style.removeProperty('transform-origin');
      }
      rootEl.style.removeProperty('--viewport-scale');
      rootEl.style.removeProperty('--viewport-width');
      rootEl.removeAttribute('data-viewport-scale');
      console.log('Viewport reset to desktop');
    };
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete (window as any).resetViewport;
      // Cleanup on unmount
      if (appContainer) {
        appContainer.style.removeProperty('transform');
        appContainer.style.removeProperty('width');
        appContainer.style.removeProperty('transform-origin');
      }
      root.style.removeProperty('--viewport-scale');
      root.style.removeProperty('--viewport-width');
      root.removeAttribute('data-viewport-scale');
    };
  }, [viewportSize]);


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
          Design Preview
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
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* Brand Palette Selection Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-700">Brand Palette</h2>
            </div>
            <PaletteSelectorCompact />
          </div>

          {/* Typography Section */}
          <div className="p-6 border-b border-gray-200">
            <FontSelector />
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-8">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Responsive Preview Wrapper */}
                <ResponsivePreview viewportSize={viewportSize} onViewportChange={setViewportSize}>
                  <div
                    style={{
                      minHeight: '100%',
                      padding: viewportSize === 'mobile' ? '1rem' : viewportSize === 'tablet' ? '1.5rem' : '2rem',
                    }}
                  >
                    {/* Brand Palette Display */}
                    <div className="mb-6">
                      <BrandPaletteDisplay />
                    </div>

                    {/* Logo & Icon Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-700">Logo & Icon</h2>
                          </div>
                          <button
                            onClick={() => {
                              alert('Guided Tour: This will walk you through the logo selection and customization options.');
                            }}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Start Tour</span>
                            <span className="sm:hidden">Tour</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <LogoSelector currentVariant={selectedVariant} onSelect={setSelectedVariant} />
                      </div>
                    </div>

                    {/* Logo Download Section */}
                    <div>
                      <LogoDownloader selectedLogo={selectedVariant} />
                    </div>
                  </div>
                </ResponsivePreview>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
