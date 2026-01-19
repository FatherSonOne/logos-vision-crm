import React from 'react';
import { FieldMetadata } from './DraggableField';
import { DropZone } from './DropZone';

// ============================================
// TYPES
// ============================================

export type ChartType =
  | 'bar' | 'line' | 'pie' | 'donut' | 'area'
  | 'scatter' | 'bubble' | 'funnel' | 'waterfall'
  | 'heatmap' | 'treemap' | 'radar' | 'histogram';

export interface ChartConfiguration {
  chartType: ChartType;
  xAxis: FieldMetadata[];
  yAxis: FieldMetadata[];
  groupBy: FieldMetadata[];
  filters: FieldMetadata[];
  options: ChartOptions;
}

export interface ChartOptions {
  // Bar Chart
  barOrientation?: 'vertical' | 'horizontal';
  barStacking?: 'none' | 'stacked' | 'grouped';

  // Line Chart
  lineStyle?: 'straight' | 'curved' | 'stepped';
  areaFill?: boolean;
  showPoints?: boolean;

  // Pie/Donut Chart
  donutMode?: boolean;
  labelPosition?: 'inside' | 'outside' | 'none';
  showPercentage?: boolean;

  // Color & Style
  colorScheme?: string;
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
}

// ============================================
// CHART TYPE DEFINITIONS
// ============================================

const CHART_TYPES = [
  {
    id: 'bar' as ChartType,
    name: 'Bar Chart',
    icon: '📊',
    description: 'Compare values across categories',
    requiresX: true,
    requiresY: true,
    maxY: 5,
  },
  {
    id: 'line' as ChartType,
    name: 'Line Chart',
    icon: '📈',
    description: 'Show trends over time',
    requiresX: true,
    requiresY: true,
    maxY: 5,
  },
  {
    id: 'pie' as ChartType,
    name: 'Pie Chart',
    icon: '🥧',
    description: 'Show proportions of a whole',
    requiresX: true,
    requiresY: true,
    maxY: 1,
  },
  {
    id: 'donut' as ChartType,
    name: 'Donut Chart',
    icon: '🍩',
    description: 'Pie chart with a hole in the middle',
    requiresX: true,
    requiresY: true,
    maxY: 1,
  },
  {
    id: 'area' as ChartType,
    name: 'Area Chart',
    icon: '📉',
    description: 'Line chart with filled area',
    requiresX: true,
    requiresY: true,
    maxY: 5,
  },
  {
    id: 'scatter' as ChartType,
    name: 'Scatter Plot',
    icon: '⚬',
    description: 'Show correlation between two variables',
    requiresX: true,
    requiresY: true,
    maxY: 1,
  },
];

const COLOR_SCHEMES = [
  { id: 'default', name: 'Default', colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] },
  { id: 'pastel', name: 'Pastel', colors: ['#93c5fd', '#6ee7b7', '#fcd34d', '#fca5a5', '#c4b5fd'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#3b82f6'] },
  { id: 'sunset', name: 'Sunset', colors: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'] },
  { id: 'forest', name: 'Forest', colors: ['#16a34a', '#15803d', '#84cc16', '#65a30d', '#059669'] },
];

// ============================================
// COMPONENT
// ============================================

interface ChartConfiguratorProps {
  configuration: ChartConfiguration;
  onConfigurationChange: (config: ChartConfiguration) => void;
}

export const ChartConfigurator: React.FC<ChartConfiguratorProps> = ({
  configuration,
  onConfigurationChange,
}) => {
  const [expandedSections, setExpandedSections] = React.useState({
    chartType: true,
    axes: true,
    options: true,
    styling: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedChartType = CHART_TYPES.find(ct => ct.id === configuration.chartType) || CHART_TYPES[0];

  const handleChartTypeChange = (chartType: ChartType) => {
    onConfigurationChange({
      ...configuration,
      chartType,
      // Reset axes if chart type changes
      yAxis: [],
    });
  };

  const handleFieldAdd = (zone: 'xAxis' | 'yAxis' | 'groupBy' | 'filters', field: FieldMetadata) => {
    onConfigurationChange({
      ...configuration,
      [zone]: [...configuration[zone], field],
    });
  };

  const handleFieldRemove = (zone: 'xAxis' | 'yAxis' | 'groupBy' | 'filters', fieldId: string) => {
    onConfigurationChange({
      ...configuration,
      [zone]: configuration[zone].filter(f => f.id !== fieldId),
    });
  };

  const handleOptionsChange = (options: Partial<ChartOptions>) => {
    onConfigurationChange({
      ...configuration,
      options: {
        ...configuration.options,
        ...options,
      },
    });
  };

  const validateYAxisField = (field: FieldMetadata) => {
    if (!field.isNumeric && configuration.chartType !== 'pie' && configuration.chartType !== 'donut') {
      return {
        valid: false,
        error: 'Y-axis requires numeric fields for this chart type',
      };
    }
    return { valid: true };
  };

  return (
    <div className="space-y-8">
      {/* Chart Type Selector - Enhanced with Groups */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection('chartType')}
          className="w-full flex items-center justify-between mb-6 group"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Chart Type</span>
          </h3>
          <svg className={`w-6 h-6 text-gray-400 transition-all group-hover:text-indigo-600 ${expandedSections.chartType ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.chartType && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Popular Charts Section */}
            <div>
              <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Most Popular
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CHART_TYPES.slice(0, 3).map((chartType) => (
                  <button
                    type="button"
                    key={chartType.id}
                    onClick={() => handleChartTypeChange(chartType.id)}
                    className={`group relative p-6 rounded-2xl border-2 text-center transition-all hover:shadow-xl hover:scale-105 ${
                      configuration.chartType === chartType.id
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 shadow-lg ring-4 ring-indigo-200 dark:ring-indigo-800'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{chartType.icon}</div>
                    <div className="font-bold text-gray-900 dark:text-white text-base mb-2">
                      {chartType.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {chartType.description}
                    </div>
                    {configuration.chartType === chartType.id && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* All Other Charts */}
            <div>
              <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">All Chart Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CHART_TYPES.slice(3).map((chartType) => (
                  <button
                    type="button"
                    key={chartType.id}
                    onClick={() => handleChartTypeChange(chartType.id)}
                    className={`group p-5 rounded-xl border-2 text-center transition-all hover:shadow-lg hover:scale-102 ${
                      configuration.chartType === chartType.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{chartType.icon}</div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {chartType.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {chartType.description}
                    </div>
                    {configuration.chartType === chartType.id && (
                      <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drop Zones */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => toggleSection('axes')}
          className="w-full flex items-center justify-between mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Configure Axes & Filters
          </h3>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.axes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.axes && (
          <div className="space-y-6">
            {/* X-Axis */}
            <DropZone
          id="x-axis"
          label="X-Axis (Categories/Labels)"
          description="Drag dimension fields here"
          maxItems={1}
          fields={configuration.xAxis}
          onRemove={(fieldId) => handleFieldRemove('xAxis', fieldId)}
          required
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-12 5h12" />
            </svg>
          }
        />

        {/* Y-Axis */}
        <DropZone
          id="y-axis"
          label="Y-Axis (Values/Metrics)"
          description="Drag numeric fields here"
          acceptedTypes={['number']}
          maxItems={selectedChartType.maxY}
          fields={configuration.yAxis}
          onRemove={(fieldId) => handleFieldRemove('yAxis', fieldId)}
          required
          validate={validateYAxisField}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          }
        />

        {/* Group By */}
        <DropZone
          id="group-by"
          label="Group By (Optional)"
          description="Group data by category"
          maxItems={1}
          fields={configuration.groupBy}
          onRemove={(fieldId) => handleFieldRemove('groupBy', fieldId)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

            {/* Filters */}
            <DropZone
              id="filters"
              label="Filters (Optional)"
              description="Filter data by conditions"
              maxItems={5}
              fields={configuration.filters}
              onRemove={(fieldId) => handleFieldRemove('filters', fieldId)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              }
            />
          </div>
        )}
      </div>

      {/* Chart Options */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => toggleSection('options')}
          className="w-full flex items-center justify-between mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Chart Options & Styling
          </h3>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.options ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.options && (
          <div className="space-y-6">
            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="chart-title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Chart Title
                </label>
                <input
                  id="chart-title"
                  type="text"
                  value={configuration.options.title || ''}
                  onChange={(e) => handleOptionsChange({ title: e.target.value })}
                  placeholder="Enter chart title..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="chart-subtitle" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  id="chart-subtitle"
                  type="text"
                  value={configuration.options.subtitle || ''}
                  onChange={(e) => handleOptionsChange({ subtitle: e.target.value })}
                  placeholder="Enter subtitle..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Color Scheme
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    type="button"
                    key={scheme.id}
                    onClick={() => handleOptionsChange({ colorScheme: scheme.id })}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      configuration.options.colorScheme === scheme.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex gap-1.5 mb-3 justify-center">
                      {scheme.colors.slice(0, 5).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      {scheme.name}
                    </div>
                    {configuration.options.colorScheme === scheme.id && (
                      <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        ✓ Active
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart-specific Options */}
            {(configuration.chartType === 'bar') && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Bar Chart Settings
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bar-orientation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orientation
                    </label>
                    <select
                      id="bar-orientation"
                      value={configuration.options.barOrientation || 'vertical'}
                      onChange={(e) => handleOptionsChange({ barOrientation: e.target.value as 'vertical' | 'horizontal' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bar-stacking" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stacking
                    </label>
                    <select
                      id="bar-stacking"
                      value={configuration.options.barStacking || 'none'}
                      onChange={(e) => handleOptionsChange({ barStacking: e.target.value as 'none' | 'stacked' | 'grouped' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="none">None</option>
                      <option value="stacked">Stacked</option>
                      <option value="grouped">Grouped</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {(configuration.chartType === 'line' || configuration.chartType === 'area') && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Line/Area Chart Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="line-style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Line Style
                    </label>
                    <select
                      id="line-style"
                      value={configuration.options.lineStyle || 'curved'}
                      onChange={(e) => handleOptionsChange({ lineStyle: e.target.value as 'straight' | 'curved' | 'stepped' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="straight">Straight</option>
                      <option value="curved">Curved</option>
                      <option value="stepped">Stepped</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configuration.options.areaFill || false}
                        onChange={(e) => handleOptionsChange({ areaFill: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Area Fill</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configuration.options.showPoints !== false}
                        onChange={(e) => handleOptionsChange({ showPoints: e.target.checked })}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Points</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {(configuration.chartType === 'pie' || configuration.chartType === 'donut') && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Pie/Donut Chart Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="label-position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Label Position
                    </label>
                    <select
                      id="label-position"
                      value={configuration.options.labelPosition || 'outside'}
                      onChange={(e) => handleOptionsChange({ labelPosition: e.target.value as 'inside' | 'outside' | 'none' })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="inside">Inside</option>
                      <option value="outside">Outside</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={configuration.options.showPercentage !== false}
                      onChange={(e) => handleOptionsChange({ showPercentage: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Percentages</span>
                  </label>
                </div>
              </div>
            )}

            {/* General Display Options */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Display Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={configuration.options.showLegend !== false}
                    onChange={(e) => handleOptionsChange({ showLegend: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Legend</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={configuration.options.showGrid !== false}
                    onChange={(e) => handleOptionsChange({ showGrid: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Grid Lines</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={configuration.options.showValues || false}
                    onChange={(e) => handleOptionsChange({ showValues: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Data Values</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartConfigurator;
