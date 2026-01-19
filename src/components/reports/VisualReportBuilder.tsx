import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Report } from '../../services/reportService';
import { DataSourceSelector } from './builder/DataSourceSelector';
import { FieldMapper } from './builder/FieldMapper';
import { ChartConfigurator, ChartConfiguration } from './builder/ChartConfigurator';
import { DraggableField, FieldMetadata } from './builder/DraggableField';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ============================================
// ICONS
// ============================================

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PreviewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// ============================================
// SAMPLE DATA GENERATOR
// ============================================

const generateSampleData = (config: ChartConfiguration): any[] => {
  if (config.xAxis.length === 0 || config.yAxis.length === 0) {
    return [];
  }

  const xField = config.xAxis[0];
  const yFields = config.yAxis;

  const categories = xField.dataType === 'date'
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    : ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];

  return categories.map((cat) => {
    const dataPoint: any = { name: cat };
    yFields.forEach((yField) => {
      dataPoint[yField.label] = Math.floor(Math.random() * 100) + 20;
    });
    return dataPoint;
  });
};

// ============================================
// COLOR SCHEMES
// ============================================

const COLOR_SCHEME_COLORS: Record<string, string[]> = {
  default: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  pastel: ['#93c5fd', '#6ee7b7', '#fcd34d', '#fca5a5', '#c4b5fd'],
  vibrant: ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'],
  ocean: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#3b82f6'],
  sunset: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7'],
  forest: ['#16a34a', '#15803d', '#84cc16', '#65a30d', '#059669'],
};

// ============================================
// CHART PREVIEW COMPONENT
// ============================================

interface ChartPreviewProps {
  configuration: ChartConfiguration;
}

const ChartPreview: React.FC<ChartPreviewProps> = ({ configuration }) => {
  const sampleData = generateSampleData(configuration);
  const colors = COLOR_SCHEME_COLORS[configuration.options.colorScheme || 'default'];

  if (configuration.xAxis.length === 0 || configuration.yAxis.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div>
          <PreviewIcon />
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Configure axes to see preview
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Drag fields to X-Axis and Y-Axis drop zones
          </p>
        </div>
      </div>
    );
  }

  const commonProps = {
    data: sampleData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  };

  const renderChart = () => {
    switch (configuration.chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {configuration.options.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis dataKey="name" stroke="currentColor" opacity={0.5} />
            <YAxis stroke="currentColor" opacity={0.5} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            {configuration.options.showLegend !== false && <Legend />}
            {configuration.yAxis.map((yField, idx) => (
              <Bar
                key={yField.id}
                dataKey={yField.label}
                fill={colors[idx % colors.length]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'line':
      case 'area':
        const ChartComponent = configuration.chartType === 'line' ? LineChart : AreaChart;
        const DataComponent = configuration.chartType === 'line' ? Line : Area;
        return (
          <ChartComponent {...commonProps}>
            {configuration.options.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis dataKey="name" stroke="currentColor" opacity={0.5} />
            <YAxis stroke="currentColor" opacity={0.5} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            {configuration.options.showLegend !== false && <Legend />}
            {configuration.yAxis.map((yField, idx) => (
              <DataComponent
                key={yField.id}
                type={configuration.options.lineStyle === 'stepped' ? 'step' : configuration.options.lineStyle === 'straight' ? 'linear' : 'monotone'}
                dataKey={yField.label}
                stroke={colors[idx % colors.length]}
                fill={colors[idx % colors.length]}
                fillOpacity={configuration.chartType === 'area' ? 0.3 : 0}
                strokeWidth={2}
                dot={configuration.options.showPoints !== false}
              />
            ))}
          </ChartComponent>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={sampleData}
              dataKey={configuration.yAxis[0]?.label}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={configuration.chartType === 'donut' ? 60 : 0}
              outerRadius={100}
              paddingAngle={2}
              label={configuration.options.labelPosition !== 'none'}
            >
              {sampleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
            {configuration.options.showLegend !== false && <Legend />}
          </PieChart>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Preview for {configuration.chartType} chart coming soon
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {(configuration.options.title || configuration.options.subtitle) && (
        <div className="text-center mb-4">
          {configuration.options.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {configuration.options.title}
            </h3>
          )}
          {configuration.options.subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {configuration.options.subtitle}
            </p>
          )}
        </div>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

interface VisualReportBuilderProps {
  report?: Report | null;
  onSave: (report: Partial<Report>) => void;
  onCancel: () => void;
}

export const VisualReportBuilder: React.FC<VisualReportBuilderProps> = ({
  report,
  onSave,
  onCancel,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    report?.dataSource?.table || null
  );
  const [availableFields, setAvailableFields] = useState<FieldMetadata[]>([]);
  const [activeField, setActiveField] = useState<FieldMetadata | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    dataSource: true,
    fields: true,
    chartType: true,
    axes: true,
    options: true,
  });

  const [configuration, setConfiguration] = useState<ChartConfiguration>({
    chartType: (report?.visualizationType as any) || 'bar',
    xAxis: [],
    yAxis: [],
    groupBy: [],
    filters: [],
    options: {
      colorScheme: 'default',
      title: report?.name || '',
      subtitle: report?.description || '',
      showLegend: true,
      showGrid: true,
      showValues: false,
      barOrientation: 'vertical',
      barStacking: 'none',
      lineStyle: 'curved',
      areaFill: true,
      showPoints: true,
      labelPosition: 'outside',
      showPercentage: true,
    },
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDataSourceChange = (sourceId: string, fields: FieldMetadata[]) => {
    setSelectedSourceId(sourceId);
    setAvailableFields(fields);
    // Reset configuration when data source changes
    setConfiguration({
      ...configuration,
      xAxis: [],
      yAxis: [],
      groupBy: [],
      filters: [],
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const field = event.active.data.current as FieldMetadata;
    setActiveField(field);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveField(null);

    if (!over) return;

    const field = active.data.current as FieldMetadata;
    const dropZoneId = over.id as string;

    // Map drop zone IDs to configuration keys
    const zoneMap: Record<string, keyof ChartConfiguration> = {
      'x-axis': 'xAxis',
      'y-axis': 'yAxis',
      'group-by': 'groupBy',
      'filters': 'filters',
    };

    const zone = zoneMap[dropZoneId];
    if (!zone) return;

    // Check if field already exists in the zone
    const currentFields = configuration[zone] as FieldMetadata[];
    if (currentFields.some(f => f.id === field.id)) return;

    // Add field to the zone
    setConfiguration({
      ...configuration,
      [zone]: [...currentFields, field],
    });
  };

  const handleSave = () => {
    const reportData: Partial<Report> = {
      name: configuration.options.title || 'Untitled Report',
      description: configuration.options.subtitle || '',
      reportType: 'custom',
      dataSource: { table: selectedSourceId || '' },
      visualizationType: configuration.chartType,
      filters: {
        xAxis: configuration.xAxis.map(f => f.name),
        yAxis: configuration.yAxis.map(f => f.name),
        groupBy: configuration.groupBy.map(f => f.name),
        filters: configuration.filters.map(f => f.name),
        options: configuration.options,
      },
    };
    onSave(reportData);
  };

  const canSave = selectedSourceId && configuration.xAxis.length > 0 && configuration.yAxis.length > 0 && configuration.options.title;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Progress Indicator - Enhanced Design */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {report ? 'Edit Report' : 'Create Visual Report'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Build beautiful, interactive reports with our drag-and-drop interface
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
              >
                <PreviewIcon />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Progress Steps - Enhanced Visual Design */}
            <div className="flex items-center justify-center gap-3">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all shadow-sm ${
                selectedSourceId
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  selectedSourceId ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                }`}>
                  {selectedSourceId ? '✓' : '1'}
                </div>
                <span className="text-sm font-semibold">Data Source</span>
              </div>

              <svg className={`w-6 h-6 transition-colors ${selectedSourceId ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              <div className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all shadow-sm ${
                configuration.xAxis.length > 0 && configuration.yAxis.length > 0
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  configuration.xAxis.length > 0 && configuration.yAxis.length > 0 ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                }`}>
                  {configuration.xAxis.length > 0 && configuration.yAxis.length > 0 ? '✓' : '2'}
                </div>
                <span className="text-sm font-semibold">Configure Chart</span>
              </div>

              <svg className={`w-6 h-6 transition-colors ${configuration.xAxis.length > 0 && configuration.yAxis.length > 0 ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              <div className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all shadow-sm ${
                configuration.options.title
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  configuration.options.title ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                }`}>
                  {configuration.options.title ? '✓' : '3'}
                </div>
                <span className="text-sm font-semibold">Finalize</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Enhanced Spacing */}
        <div className="flex-1 overflow-hidden px-8 py-8">
          <div className={`max-w-7xl mx-auto h-full grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>

            {/* Left Panel: Configuration */}
            <div className="space-y-8 overflow-y-auto pr-4" style={{ scrollbarGutter: 'stable' }}>

              {/* Data Source Section - Enhanced Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-8">
                <button
                  onClick={() => toggleSection('dataSource')}
                  className="w-full flex items-center justify-between mb-6 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Select Data Source
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedSourceId ? `✓ Connected to ${selectedSourceId}` : 'Choose where your data comes from'}
                      </p>
                    </div>
                  </div>
                  <svg className={`w-6 h-6 text-gray-400 transition-all group-hover:text-indigo-600 ${expandedSections.dataSource ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.dataSource && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <DataSourceSelector
                      selectedSourceId={selectedSourceId}
                      onSourceChange={handleDataSourceChange}
                    />
                  </div>
                )}
              </div>

              {/* Available Fields Section - Enhanced */}
              {availableFields.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-8">
                  <button
                    type="button"
                    onClick={() => toggleSection('fields')}
                    className="w-full flex items-center justify-between mb-6 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Available Fields
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Drag fields to configure your chart ({availableFields.length} fields)
                        </p>
                      </div>
                    </div>
                    <svg className={`w-6 h-6 text-gray-400 transition-all group-hover:text-blue-600 ${expandedSections.fields ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSections.fields && (
                    <div className="animate-in fade-in duration-200">
                      <FieldMapper fields={availableFields} compact />
                    </div>
                  )}
                </div>
              )}

              {/* Chart Configuration Section - Enhanced */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Configure Your Chart
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Customize visualization and styling options
                    </p>
                  </div>
                </div>

                <ChartConfigurator
                  configuration={configuration}
                  onConfigurationChange={setConfiguration}
                />
              </div>
            </div>

            {/* Right Panel: Live Preview - Enhanced */}
            {showPreview && (
              <div className="overflow-hidden">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-8 h-full flex flex-col min-h-[600px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <PreviewIcon />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          Live Preview
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          See your chart update in real-time
                        </p>
                      </div>
                    </div>

                    {configuration.xAxis.length > 0 && configuration.yAxis.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold border border-green-200 dark:border-green-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Ready to preview
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <ChartPreview configuration={configuration} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar - Fixed at Bottom - Enhanced */}
        <div className="bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 px-8 py-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all font-semibold border border-gray-300 dark:border-gray-600"
            >
              <CancelIcon />
              Cancel
            </button>

            <div className="flex items-center gap-4">
              {!canSave && (
                <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-700 dark:text-amber-400 rounded-xl border-2 border-amber-200 dark:border-amber-700 shadow-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">
                    Configure data source, axes, and title to save
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-purple-600 transition-all font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 disabled:hover:scale-100"
              >
                <SaveIcon />
                {report ? 'Update Report' : 'Save Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeField ? <DraggableField field={activeField} compact /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default VisualReportBuilder;
