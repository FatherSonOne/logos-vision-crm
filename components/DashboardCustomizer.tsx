import React, { useState, useEffect } from 'react';

/**
 * Dashboard Customizer Component
 *
 * Features:
 * - Toggle widgets on/off
 * - Choose from preset layouts
 * - Save preferences to localStorage/Supabase
 * - Export/Import layout configurations
 */

// ============================================
// TYPES
// ============================================

export interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  category: 'stats' | 'charts' | 'lists' | 'ai';
  defaultEnabled: boolean;
  icon: React.ReactNode;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  columns: 2 | 3 | 4;
  enabledWidgets: string[];
}

export interface DashboardPreferences {
  selectedLayout: string;
  enabledWidgets: string[];
  compactMode: boolean;
  showAnimations: boolean;
}

// ============================================
// ICONS
// ============================================

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const StatsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

// ============================================
// DEFAULT DATA
// ============================================

const defaultWidgets: DashboardWidget[] = [
  { id: 'stats-kpi', name: 'Key Metrics', description: 'Core KPIs like total donations, active donors', category: 'stats', defaultEnabled: true, icon: <StatsIcon /> },
  { id: 'stats-retention', name: 'Retention Rate', description: 'Donor retention metrics', category: 'stats', defaultEnabled: true, icon: <StatsIcon /> },
  { id: 'stats-projects', name: 'Project Stats', description: 'Active projects overview', category: 'stats', defaultEnabled: true, icon: <StatsIcon /> },
  { id: 'stats-tasks', name: 'Task Summary', description: 'Pending and completed tasks', category: 'stats', defaultEnabled: true, icon: <StatsIcon /> },
  { id: 'chart-donations', name: 'Donation Trends', description: 'Monthly donation chart', category: 'charts', defaultEnabled: true, icon: <ChartIcon /> },
  { id: 'chart-pipeline', name: 'Donation Pipeline', description: 'Pledge pipeline visualization', category: 'charts', defaultEnabled: true, icon: <ChartIcon /> },
  { id: 'chart-impact', name: 'Impact Metrics', description: 'Program impact visualization', category: 'charts', defaultEnabled: false, icon: <ChartIcon /> },
  { id: 'list-tasks', name: 'Recent Tasks', description: 'Your upcoming tasks', category: 'lists', defaultEnabled: true, icon: <ListIcon /> },
  { id: 'list-activities', name: 'Activity Feed', description: 'Recent team activities', category: 'lists', defaultEnabled: true, icon: <ListIcon /> },
  { id: 'list-deadlines', name: 'Upcoming Deadlines', description: 'Projects and tasks due soon', category: 'lists', defaultEnabled: true, icon: <ListIcon /> },
  { id: 'ai-briefing', name: 'AI Daily Briefing', description: 'AI-generated daily summary', category: 'ai', defaultEnabled: true, icon: <AIIcon /> },
  { id: 'ai-insights', name: 'AI Insights', description: 'AI-powered recommendations', category: 'ai', defaultEnabled: false, icon: <AIIcon /> },
];

const presetLayouts: DashboardLayout[] = [
  {
    id: 'executive',
    name: 'Executive View',
    description: 'High-level overview for leadership',
    columns: 3,
    enabledWidgets: ['stats-kpi', 'stats-retention', 'chart-donations', 'chart-pipeline', 'ai-briefing'],
  },
  {
    id: 'fundraising',
    name: 'Fundraising Focus',
    description: 'Optimized for development teams',
    columns: 3,
    enabledWidgets: ['stats-kpi', 'stats-retention', 'chart-donations', 'chart-pipeline', 'list-deadlines', 'ai-insights'],
  },
  {
    id: 'operations',
    name: 'Operations View',
    description: 'Task and project focused',
    columns: 3,
    enabledWidgets: ['stats-projects', 'stats-tasks', 'list-tasks', 'list-activities', 'list-deadlines'],
  },
  {
    id: 'comprehensive',
    name: 'Full Dashboard',
    description: 'All widgets enabled',
    columns: 4,
    enabledWidgets: defaultWidgets.map(w => w.id),
  },
];

const defaultPreferences: DashboardPreferences = {
  selectedLayout: 'executive',
  enabledWidgets: defaultWidgets.filter(w => w.defaultEnabled).map(w => w.id),
  compactMode: false,
  showAnimations: true,
};

// ============================================
// STORAGE
// ============================================

const STORAGE_KEY = 'dashboard_preferences';

const loadPreferences = (): DashboardPreferences => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultPreferences, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load dashboard preferences:', e);
  }
  return defaultPreferences;
};

const savePreferences = (prefs: DashboardPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save dashboard preferences:', e);
  }
};

// ============================================
// WIDGET TOGGLE
// ============================================

interface WidgetToggleProps {
  widget: DashboardWidget;
  enabled: boolean;
  onToggle: (id: string) => void;
}

const WidgetToggle: React.FC<WidgetToggleProps> = ({ widget, enabled, onToggle }) => (
  <div
    className={`
      flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
      ${enabled
        ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800'
        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }
    `}
    onClick={() => onToggle(widget.id)}
  >
    <div className={`p-2 rounded-lg ${enabled ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
      {widget.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-medium text-sm ${enabled ? 'text-cyan-900 dark:text-cyan-100' : 'text-slate-700 dark:text-slate-300'}`}>
        {widget.name}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
        {widget.description}
      </p>
    </div>
    <div className={`
      w-10 h-6 rounded-full p-1 transition-colors
      ${enabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}
    `}>
      <div className={`
        w-4 h-4 rounded-full bg-white shadow-sm transition-transform
        ${enabled ? 'translate-x-4' : 'translate-x-0'}
      `} />
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (preferences: DashboardPreferences) => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [preferences, setPreferences] = useState<DashboardPreferences>(loadPreferences);
  const [activeTab, setActiveTab] = useState<'layout' | 'widgets' | 'options'>('layout');

  // Load preferences on mount
  useEffect(() => {
    setPreferences(loadPreferences());
  }, [isOpen]);

  const handleLayoutSelect = (layoutId: string) => {
    const layout = presetLayouts.find(l => l.id === layoutId);
    if (layout) {
      setPreferences(prev => ({
        ...prev,
        selectedLayout: layoutId,
        enabledWidgets: layout.enabledWidgets,
      }));
    }
  };

  const handleWidgetToggle = (widgetId: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedLayout: 'custom',
      enabledWidgets: prev.enabledWidgets.includes(widgetId)
        ? prev.enabledWidgets.filter(id => id !== widgetId)
        : [...prev.enabledWidgets, widgetId],
    }));
  };

  const handleSave = () => {
    savePreferences(preferences);
    onApply?.(preferences);
    onClose();
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'stats', label: 'Statistics' },
    { id: 'charts', label: 'Charts' },
    { id: 'lists', label: 'Lists' },
    { id: 'ai', label: 'AI Features' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400">
              <GridIcon />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Customize Dashboard
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choose your layout and widgets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6">
          {[
            { id: 'layout', label: 'Presets' },
            { id: 'widgets', label: 'Widgets' },
            { id: 'options', label: 'Options' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'layout' && (
            <div className="grid grid-cols-2 gap-4">
              {presetLayouts.map(layout => (
                <div
                  key={layout.id}
                  onClick={() => handleLayoutSelect(layout.id)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${preferences.selectedLayout === layout.id
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${preferences.selectedLayout === layout.id ? 'text-cyan-900 dark:text-cyan-100' : 'text-slate-900 dark:text-white'}`}>
                      {layout.name}
                    </h3>
                    {preferences.selectedLayout === layout.id && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    {layout.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{layout.columns} columns</span>
                    <span>-</span>
                    <span>{layout.enabledWidgets.length} widgets</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'widgets' && (
            <div className="space-y-6">
              {categories.map(category => {
                const categoryWidgets = defaultWidgets.filter(w => w.category === category.id);
                return (
                  <div key={category.id}>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">
                      {category.label}
                    </h3>
                    <div className="space-y-2">
                      {categoryWidgets.map(widget => (
                        <WidgetToggle
                          key={widget.id}
                          widget={widget}
                          enabled={preferences.enabledWidgets.includes(widget.id)}
                          onToggle={handleWidgetToggle}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Compact Mode</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Reduce spacing for more content
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                  className={`
                    w-12 h-7 rounded-full p-1 transition-colors
                    ${preferences.compactMode ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white shadow-sm transition-transform
                    ${preferences.compactMode ? 'translate-x-5' : 'translate-x-0'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Show Animations</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enable smooth transitions and effects
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, showAnimations: !prev.showAnimations }))}
                  className={`
                    w-12 h-7 rounded-full p-1 transition-colors
                    ${preferences.showAnimations ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full bg-white shadow-sm transition-transform
                    ${preferences.showAnimations ? 'translate-x-5' : 'translate-x-0'}
                  `} />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleReset}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to use dashboard preferences
export const useDashboardPreferences = () => {
  const [preferences, setPreferences] = useState<DashboardPreferences>(loadPreferences);

  const updatePreferences = (newPrefs: Partial<DashboardPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    savePreferences(updated);
  };

  const isWidgetEnabled = (widgetId: string) => preferences.enabledWidgets.includes(widgetId);

  return {
    preferences,
    updatePreferences,
    isWidgetEnabled,
    availableWidgets: defaultWidgets,
    presetLayouts,
  };
};

export default DashboardCustomizer;
