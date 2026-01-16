import React, { useState, useEffect } from 'react';
import { X, Layout, Grid, Maximize2, Move, Eye, EyeOff, RotateCcw } from 'lucide-react';
import type { DashboardRole } from './Dashboard';

/**
 * Enhanced Dashboard Customizer - Phase 3.4
 *
 * Features:
 * - Widget visibility toggles
 * - Layout presets (Compact, Balanced, Detailed)
 * - Drag-and-drop reordering (visual placeholder)
 * - Reset to defaults
 * - Save to localStorage
 */

interface WidgetDefinition {
  id: string;
  title: string;
  roles: DashboardRole[];
  category: 'fundraising' | 'programs' | 'leadership' | 'general';
}

interface LayoutPreset {
  id: 'compact' | 'balanced' | 'detailed';
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultCollapsed: string[];
  defaultHidden: string[];
}

interface EnhancedDashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: DashboardRole;
  availableWidgets: WidgetDefinition[];
  hiddenWidgets: string[];
  collapsedWidgets: string[];
  onToggleWidget: (widgetId: string) => void;
  onApplyPreset: (preset: LayoutPreset) => void;
  onResetToDefaults: () => void;
}

const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'compact',
    name: 'Compact',
    description: 'Essential widgets only, minimal view',
    icon: <Maximize2 className="w-5 h-5" />,
    defaultCollapsed: ['sentiment', 'opportunities', 'meeting-prep', 'service-impact'],
    defaultHidden: ['project-risk', 'resource-allocator', 'household', 'projects-deadline'],
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Most popular widgets, recommended for daily use',
    icon: <Layout className="w-5 h-5" />,
    defaultCollapsed: [],
    defaultHidden: [],
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'All widgets visible, comprehensive view',
    icon: <Grid className="w-5 h-5" />,
    defaultCollapsed: [],
    defaultHidden: [],
  },
];

const WIDGET_CATEGORIES = {
  fundraising: { label: 'Fundraising', color: 'from-emerald-500 to-teal-600' },
  programs: { label: 'Programs & Services', color: 'from-blue-500 to-indigo-600' },
  leadership: { label: 'Leadership & Analytics', color: 'from-purple-500 to-pink-600' },
  general: { label: 'General', color: 'from-gray-500 to-slate-600' },
};

export const EnhancedDashboardCustomizer: React.FC<EnhancedDashboardCustomizerProps> = ({
  isOpen,
  onClose,
  currentRole,
  availableWidgets,
  hiddenWidgets,
  collapsedWidgets,
  onToggleWidget,
  onApplyPreset,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'presets'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<'compact' | 'balanced' | 'detailed' | null>(null);

  // Group widgets by category
  const widgetsByCategory = availableWidgets.reduce((acc, widget) => {
    // Determine category based on widget roles
    let category: 'fundraising' | 'programs' | 'leadership' | 'general' = 'general';
    if (widget.roles.includes('fundraising') && !widget.roles.includes('programs')) {
      category = 'fundraising';
    } else if (widget.roles.includes('programs')) {
      category = 'programs';
    } else if (widget.roles.includes('leadership')) {
      category = 'leadership';
    }

    if (!acc[category]) acc[category] = [];
    acc[category].push(widget);
    return acc;
  }, {} as Record<string, WidgetDefinition[]>);

  const handleApplyPreset = (preset: LayoutPreset) => {
    setSelectedPreset(preset.id);
    onApplyPreset(preset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--cmf-border)' }}
        >
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
              Customize Dashboard
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--cmf-text-secondary)' }}>
              Personalize your {currentRole} dashboard experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close customizer"
          >
            <X className="w-5 h-5" style={{ color: 'var(--cmf-text-secondary)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 px-6 py-3 border-b"
          style={{ borderColor: 'var(--cmf-border)', backgroundColor: 'var(--cmf-surface-2)' }}
        >
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'presets' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'presets' ? 'var(--cmf-surface)' : 'transparent',
              color: activeTab === 'presets' ? 'var(--cmf-accent)' : 'var(--cmf-text-secondary)',
            }}
          >
            <Layout className="w-4 h-4 inline mr-2" />
            Layout Presets
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'widgets' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'widgets' ? 'var(--cmf-surface)' : 'transparent',
              color: activeTab === 'widgets' ? 'var(--cmf-accent)' : 'var(--cmf-text-secondary)',
            }}
          >
            <Grid className="w-4 h-4 inline mr-2" />
            Widget Visibility
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {activeTab === 'presets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--cmf-text)' }}>
                  Choose a Layout Preset
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--cmf-text-secondary)' }}>
                  Select a preset to quickly configure your dashboard layout
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LAYOUT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                      selectedPreset === preset.id
                        ? 'ring-2 scale-105'
                        : 'hover:scale-102 hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor: 'var(--cmf-surface-2)',
                      borderColor: selectedPreset === preset.id ? 'var(--cmf-accent)' : 'var(--cmf-border)',
                      ringColor: 'var(--cmf-accent)',
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div
                        className={`p-4 rounded-full ${
                          selectedPreset === preset.id ? 'bg-gradient-to-br' : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        style={{
                          backgroundImage: selectedPreset === preset.id ? 'linear-gradient(to bottom right, var(--cmf-accent), var(--cmf-accent-secondary))' : undefined,
                          color: selectedPreset === preset.id ? 'white' : 'var(--cmf-text-secondary)',
                        }}
                      >
                        {preset.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg" style={{ color: 'var(--cmf-text)' }}>
                          {preset.name}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--cmf-text-secondary)' }}>
                          {preset.description}
                        </p>
                      </div>
                      {selectedPreset === preset.id && (
                        <div
                          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'var(--cmf-accent)' }}
                        >
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Preset Details */}
              {selectedPreset && (
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--cmf-surface-2)',
                    borderColor: 'var(--cmf-border)',
                  }}
                >
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--cmf-text)' }}>
                    What's included in {LAYOUT_PRESETS.find(p => p.id === selectedPreset)?.name}?
                  </h4>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                    {selectedPreset === 'compact' && (
                      <>
                        <li>✓ Essential KPI widgets only</li>
                        <li>✓ Daily Briefing always visible</li>
                        <li>✓ Advanced widgets hidden for cleaner view</li>
                      </>
                    )}
                    {selectedPreset === 'balanced' && (
                      <>
                        <li>✓ All popular widgets visible</li>
                        <li>✓ Recommended for daily use</li>
                        <li>✓ Balance between detail and performance</li>
                      </>
                    )}
                    {selectedPreset === 'detailed' && (
                      <>
                        <li>✓ All available widgets visible</li>
                        <li>✓ Complete data overview</li>
                        <li>✓ Best for comprehensive analysis</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'widgets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--cmf-text)' }}>
                  Widget Visibility
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--cmf-text-secondary)' }}>
                  Toggle individual widgets on or off. Hidden widgets won't appear on your dashboard.
                </p>
              </div>

              {Object.entries(widgetsByCategory).map(([category, widgets]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className={`w-1 h-6 rounded-full bg-gradient-to-b ${WIDGET_CATEGORIES[category as keyof typeof WIDGET_CATEGORIES]?.color || 'from-gray-500 to-gray-600'}`}
                    />
                    <h4 className="font-semibold" style={{ color: 'var(--cmf-text)' }}>
                      {WIDGET_CATEGORIES[category as keyof typeof WIDGET_CATEGORIES]?.label || category}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--cmf-surface-2)', color: 'var(--cmf-text-faint)' }}>
                      {widgets.length} widgets
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {widgets.map((widget) => {
                      const isHidden = hiddenWidgets.includes(widget.id);
                      const isCollapsed = collapsedWidgets.includes(widget.id);

                      return (
                        <button
                          key={widget.id}
                          onClick={() => onToggleWidget(widget.id)}
                          className={`group flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
                            isHidden ? 'opacity-50' : 'hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: 'var(--cmf-surface-2)',
                            borderColor: isHidden ? 'var(--cmf-border)' : 'var(--cmf-accent-subtle)',
                          }}
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isHidden ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gradient-to-br'
                            }`}
                            style={{
                              backgroundImage: !isHidden ? `linear-gradient(to bottom right, var(--cmf-accent), var(--cmf-accent-secondary))` : undefined,
                            }}
                          >
                            {isHidden ? (
                              <EyeOff className="w-5 h-5" style={{ color: 'var(--cmf-text-faint)' }} />
                            ) : (
                              <Eye className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                              {widget.title}
                            </h5>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--cmf-text-faint)' }}>
                              {isHidden ? 'Hidden' : isCollapsed ? 'Collapsed' : 'Visible'}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isHidden ? 'bg-transparent' : 'bg-gradient-to-br border-transparent'
                            }`}
                            style={{
                              borderColor: isHidden ? 'var(--cmf-border)' : 'var(--cmf-accent)',
                              backgroundImage: !isHidden ? 'linear-gradient(to bottom right, var(--cmf-accent), var(--cmf-accent))' : undefined,
                            }}
                          >
                            {!isHidden && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: 'var(--cmf-border)', backgroundColor: 'var(--cmf-surface-2)' }}
        >
          <button
            onClick={onResetToDefaults}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: 'var(--cmf-text-secondary)',
              backgroundColor: 'transparent',
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: 'var(--cmf-text-secondary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--cmf-border)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--cmf-accent)',
                color: 'white',
              }}
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
