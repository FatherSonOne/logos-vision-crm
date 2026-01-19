import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel, LabelList
} from 'recharts';
import { ColumnDef } from '@tanstack/react-table';
import { Report, reportService } from '../../services/reportService';
import { exportService } from '../../services/reports/export/ExportService';
import { saveAs } from 'file-saver';
import { AdvancedDataTable } from './tables/AdvancedDataTable';
import {
  selectRenderStrategy,
  selectChartStrategy,
  globalPerformanceMonitor,
  estimateMemoryUsage,
} from '../../utils/performanceOptimizer';
import { autoSample } from '../../utils/chartSampling';
import { PerformanceMonitor } from './PerformanceMonitor';

// ============================================
// ICONS
// ============================================

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-5 h-5 ${filled ? 'text-yellow-500' : 'text-gray-400'}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const FullscreenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// ============================================
// CHART COLORS
// ============================================

const COLORS = [
  '#4F46E5', '#7C3AED', '#0EA5E9', '#14B8A6', '#F59E0B',
  '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981',
  '#F97316', '#6366F1', '#84CC16', '#A855F7', '#22D3EE',
];

// ============================================
// TYPES
// ============================================

interface ReportViewerProps {
  report: Report;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

// ============================================
// SAMPLE DATA GENERATOR
// ============================================

const generateSampleData = (dataSource: string, count: number = 12) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (dataSource === 'donations') {
    return months.map((month, i) => ({
      name: month,
      value: Math.floor(Math.random() * 50000) + 10000,
      count: Math.floor(Math.random() * 50) + 10,
    }));
  }

  if (dataSource === 'clients') {
    return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Other'].map(location => ({
      name: location,
      value: Math.floor(Math.random() * 500) + 50,
    }));
  }

  if (dataSource === 'projects') {
    return ['Planning', 'In Progress', 'On Hold', 'Completed'].map(status => ({
      name: status,
      value: Math.floor(Math.random() * 30) + 5,
    }));
  }

  if (dataSource === 'cases') {
    return ['New', 'In Progress', 'Resolved', 'Closed'].map(status => ({
      name: status,
      value: Math.floor(Math.random() * 40) + 10,
    }));
  }

  if (dataSource === 'activities') {
    return ['Call', 'Email', 'Meeting', 'Note'].map(type => ({
      name: type,
      value: Math.floor(Math.random() * 100) + 20,
    }));
  }

  if (dataSource === 'engagement_scores') {
    return ['Highly Engaged', 'Engaged', 'Moderate', 'Low', 'At Risk'].map(level => ({
      name: level,
      value: Math.floor(Math.random() * 200) + 30,
    }));
  }

  return months.map((month) => ({
    name: month,
    value: Math.floor(Math.random() * 1000) + 100,
  }));
};

// ============================================
// CHART COMPONENTS
// ============================================

interface ChartProps {
  data: any[];
  type: string;
}

const ChartRenderer: React.FC<ChartProps> = ({ data, type }) => {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tickFormatter={formatValue} tick={{ fill: '#6b7280' }} />
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} name="Value" />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tickFormatter={formatValue} tick={{ fill: '#6b7280' }} />
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Value" />
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
    case 'donut':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={type === 'donut' ? 150 : 160}
              innerRadius={type === 'donut' ? 80 : 0}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tickFormatter={formatValue} tick={{ fill: '#6b7280' }} />
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#4F46E5" fillOpacity={1} fill="url(#colorValue)" name="Value" />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} name="Name" />
            <YAxis dataKey="value" tick={{ fill: '#6b7280' }} tickFormatter={formatValue} name="Value" />
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
            <Scatter name="Data Points" data={data} fill="#4F46E5" />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <PolarRadiusAxis tick={{ fill: '#6b7280' }} />
            <Radar name="Value" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      );

    case 'funnel':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <FunnelChart>
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Funnel dataKey="value" data={data} isAnimationActive>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList position="right" fill="#374151" stroke="none" dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      );

    case 'table':
      // Define columns for the advanced table
      const tableColumns: ColumnDef<any>[] = [
        {
          accessorKey: 'name',
          header: 'Name',
          cell: info => info.getValue(),
          enableSorting: true,
          enableColumnFilter: true,
        },
        {
          accessorKey: 'value',
          header: 'Value',
          cell: info => formatValue(info.getValue() as number),
          enableSorting: true,
          enableColumnFilter: true,
        },
        {
          id: 'count',
          accessorKey: 'count',
          header: 'Count',
          cell: info => info.getValue() || 'N/A',
          enableSorting: true,
          enableColumnFilter: true,
        },
      ];

      return (
        <AdvancedDataTable
          data={data}
          columns={tableColumns}
          enableRowSelection={true}
          enableMultiSort={true}
          enableColumnFilters={true}
          enableGlobalFilter={true}
          enablePagination={true}
          pageSize={10}
          onExport={(selectedRows) => {
            // Use existing export functionality
            handleExport('csv');
          }}
          onBulkAction={(action, selectedRows) => {
            console.log(`Bulk action: ${action}`, selectedRows);
          }}
          emptyMessage="No data available for this report"
        />
      );

    case 'kpi':
      const total = data.reduce((sum, row) => sum + row.value, 0);
      const avg = total / data.length;
      const max = Math.max(...data.map(d => d.value));
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-indigo-200 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold mt-2">{formatValue(total)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <p className="text-green-200 text-sm font-medium">Average</p>
            <p className="text-3xl font-bold mt-2">{formatValue(avg)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-purple-200 text-sm font-medium">Maximum</p>
            <p className="text-3xl font-bold mt-2">{formatValue(max)}</p>
          </div>
        </div>
      );

    default:
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tickFormatter={formatValue} tick={{ fill: '#6b7280' }} />
            <Tooltip formatter={(value: number) => formatValue(value)} />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Value" />
          </BarChart>
        </ResponsiveContainer>
      );
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate sample data based on data source
  const rawData = useMemo(() => {
    const source = report.dataSource?.table || 'default';
    return generateSampleData(source);
  }, [report.dataSource]);

  // Performance optimization - select rendering strategy
  const renderStrategy = useMemo(() => {
    return selectRenderStrategy(rawData.length);
  }, [rawData.length]);

  // Performance optimization - sample chart data if needed
  const data = useMemo(() => {
    const startTime = performance.now();
    const chartStrategy = selectChartStrategy(rawData.length);

    let sampledData = rawData;

    // Apply sampling for large datasets
    if (chartStrategy.type === 'lttb' || chartStrategy.type === 'sample') {
      sampledData = autoSample(rawData, report.visualizationType as any, {
        maxPoints: chartStrategy.targetPoints,
        xKey: 'name',
        yKey: 'value',
      });

      if (import.meta.env.DEV) {
        console.log(
          `[Performance] Chart sampling: ${rawData.length} -> ${sampledData.length} points (${chartStrategy.type})`
        );
      }
    }

    const duration = performance.now() - startTime;
    globalPerformanceMonitor.recordMetric('data_sampling', duration);

    return sampledData;
  }, [rawData, report.visualizationType]);

  // Track render performance
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      globalPerformanceMonitor.recordMetric('report_render', duration);
    };
  }, [data]);

  // Show performance warnings for large datasets
  const performanceWarning = useMemo(() => {
    const memoryUsage = estimateMemoryUsage(rawData);

    if (rawData.length > 50000) {
      return {
        type: 'critical' as const,
        message: `Very large dataset (${rawData.length.toLocaleString()} rows). Consider using server-side pagination.`,
      };
    } else if (rawData.length > 10000) {
      return {
        type: 'warning' as const,
        message: `Large dataset (${rawData.length.toLocaleString()} rows). Using ${renderStrategy.type} rendering for optimal performance.`,
      };
    } else if (memoryUsage > 50 * 1024 * 1024) {
      return {
        type: 'warning' as const,
        message: `High memory usage (${(memoryUsage / 1024 / 1024).toFixed(1)}MB). Consider data optimization.`,
      };
    }

    return null;
  }, [rawData, renderStrategy]);

  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === report.category);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    const startTime = Date.now();
    setIsExporting(true);

    try {
      // For large datasets, offer option to export sampled or full data
      let exportData = data;

      if (rawData.length > 10000 && format !== 'png') {
        const useSampledData = window.confirm(
          `This dataset has ${rawData.length.toLocaleString()} rows. ` +
          `Export sampled data (${data.length.toLocaleString()} rows) for faster processing, ` +
          `or full dataset?\n\nClick OK for sampled, Cancel for full dataset.`
        );

        if (!useSampledData) {
          exportData = rawData;
        }
      }

      // Generate filename with report name and date
      const dateStr = new Date().toISOString().split('T')[0];
      const sanitizedName = report.name
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
      const filename = `${sanitizedName}_${dateStr}`;

      let blob: Blob;

      // Use appropriate export method based on format
      switch (format) {
        case 'csv':
          blob = await exportService.exportToCSV(exportData, `${filename}.csv`);
          break;

        case 'excel':
          blob = await exportService.exportToExcel(exportData, `${filename}.xlsx`);
          break;

        case 'pdf':
          blob = await exportService.exportToPDF(exportData, `${filename}.pdf`, report.name);
          break;

        case 'png':
          if (!chartRef.current) {
            throw new Error('Chart element not available for PNG export');
          }
          blob = await exportService.exportToPNG(chartRef.current, `${filename}.png`);
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Download using saveAs
      saveAs(blob, `${filename}.${format === 'excel' ? 'xlsx' : format}`);

      // Track export using reportService.logExport
      const executionTime = Date.now() - startTime;
      await reportService.logExport({
        reportId: report.id,
        format,
        rowCount: exportData.length,
        executionTimeMs: executionTime,
        fileSizeBytes: blob.size,
        success: true,
      });

      console.log(`Export successful: ${format} (${blob.size} bytes in ${executionTime}ms)`);
    } catch (error) {
      // Handle errors with user-friendly messages
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      console.error('Export failed:', error);

      // Track failed export
      await reportService.logExport({
        reportId: report.id,
        format,
        rowCount: data.length,
        executionTimeMs: executionTime,
        success: false,
        errorMessage,
      });

      // Show user-friendly error message
      alert(`Export failed: ${errorMessage}`);
    } finally {
      // Reset loading state
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto' : ''}`}>
        {/* Performance Warning */}
        {performanceWarning && (
          <div className={`mb-4 p-4 rounded-lg border ${
            performanceWarning.type === 'critical'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium">{performanceWarning.message}</p>
                {rawData.length !== data.length && (
                  <p className="text-sm mt-1">
                    Displaying {data.length.toLocaleString()} of {rawData.length.toLocaleString()} data points for optimal performance.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{report.name}</h1>
            {report.isTemplate && (
              <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                Template
              </span>
            )}
          </div>
          {report.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{report.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            {category && (
              <span className={`px-2 py-1 rounded-full bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-600 text-xs`}>
                {category.label}
              </span>
            )}
            <span className="capitalize">{report.visualizationType} Chart</span>
            <span>{report.viewCount} views</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFavorite}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <StarIcon filled={report.isFavorite} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Filters"
          >
            <FilterIcon />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Toggle fullscreen"
          >
            <FullscreenIcon />
          </button>
          {import.meta.env.DEV && (
            <button
              onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-indigo-600"
              title="Performance Monitor (Dev Only)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}

          <div className="relative group">
            <button
              type="button"
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Export
                </>
              )}
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
              {['PDF', 'Excel', 'CSV', 'PNG'].map((format) => (
                <button
                  type="button"
                  key={format}
                  onClick={() => handleExport(format.toLowerCase() as any)}
                  disabled={isExporting}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {!report.isTemplate && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <EditIcon />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete report"
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
              <select aria-label="Date Range" className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                <option>Last 12 Months</option>
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group By</label>
              <select aria-label="Group By" className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                <option>Month</option>
                <option>Quarter</option>
                <option>Year</option>
                <option>Category</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div ref={chartRef} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            {renderProgress > 0 && (
              <div className="w-64">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Loading... {renderProgress}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <ChartRenderer data={data} type={report.visualizationType} />
            {rawData.length !== data.length && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Performance Mode:</span> Displaying {data.length.toLocaleString()} of {rawData.length.toLocaleString()} data points.
                  Export to see full dataset.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{rawData.length.toLocaleString()}</p>
          {rawData.length !== data.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ({data.length.toLocaleString()} displayed)
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${(rawData.reduce((sum, d) => sum + d.value, 0) / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${(rawData.reduce((sum, d) => sum + d.value, 0) / rawData.length / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Render Strategy</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 capitalize">
            {renderStrategy.type}
          </p>
        </div>
      </div>
    </div>

    {/* Performance Monitor (Dev Mode Only) */}
    <PerformanceMonitor
      show={showPerformanceMonitor && import.meta.env.DEV}
      dataSize={rawData.length}
      renderStrategy={renderStrategy.type}
      onClose={() => setShowPerformanceMonitor(false)}
    />
    </>
  );
};

export default ReportViewer;
