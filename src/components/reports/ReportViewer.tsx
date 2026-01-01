import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, FunnelChart, Funnel, LabelList
} from 'recharts';
import { Report, reportService } from '../../services/reportService';

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
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-gray-900 dark:text-white">{formatValue(row.value)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Total</td>
                <td className="px-4 py-3 text-sm text-right font-mono font-bold text-gray-900 dark:text-white">
                  {formatValue(data.reduce((sum, row) => sum + row.value, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Generate sample data based on data source
  const data = useMemo(() => {
    const source = report.dataSource?.table || 'default';
    return generateSampleData(source);
  }, [report.dataSource]);

  const categories = reportService.getReportCategories();
  const category = categories.find(c => c.value === report.category);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'png') => {
    // Placeholder for export functionality
    alert(`Exporting as ${format.toUpperCase()}...`);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto' : ''}`}>
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

          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              <DownloadIcon />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 py-1">
              {['PDF', 'Excel', 'CSV', 'PNG'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format.toLowerCase() as any)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              <select className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                <option>Last 12 Months</option>
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group By</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <ChartRenderer data={data} type={report.visualizationType} />
        )}
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${(data.reduce((sum, d) => sum + d.value, 0) / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${(data.reduce((sum, d) => sum + d.value, 0) / data.length / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
