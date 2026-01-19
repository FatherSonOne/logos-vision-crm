import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  exportPerformanceMonitor,
  type FormatStats,
  type PerformanceRecommendation,
} from '../../services/reports/export';
import type { ExportFormat } from '../../services/reportService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ExportPerformanceWidgetProps {
  className?: string;
}

export const ExportPerformanceWidget: React.FC<ExportPerformanceWidgetProps> = ({
  className = '',
}) => {
  const [stats, setStats] = useState<FormatStats[]>([]);
  const [summary, setSummary] = useState(exportPerformanceMonitor.getSummary());
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | 'all'>('all');

  useEffect(() => {
    refreshStats();
  }, [selectedFormat]);

  const refreshStats = () => {
    const format = selectedFormat === 'all' ? undefined : selectedFormat;
    setStats(exportPerformanceMonitor.getStats(format));
    setSummary(exportPerformanceMonitor.getSummary());
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Chart data
  const chartData = {
    labels: stats.map(s => s.format.toUpperCase()),
    datasets: [
      {
        label: 'Average Time (ms)',
        data: stats.map(s => s.averageTimeMs),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Average Export Time by Format',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${formatDuration(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (ms)',
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Export Performance</h3>
        <button
          onClick={refreshStats}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Exports</div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.totalExports}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {summary.totalExports > 0
              ? Math.round((summary.successfulExports / summary.totalExports) * 100)
              : 0}
            %
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Time</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatDuration(summary.averageTimeMs)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Slow Exports</div>
          <div className="text-2xl font-bold text-amber-600">
            {summary.slowExports}
          </div>
        </div>
      </div>

      {/* Format Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Format
        </label>
        <select
          value={selectedFormat}
          onChange={e => setSelectedFormat(e.target.value as ExportFormat | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Formats</option>
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
          <option value="png">PNG</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {/* Performance Chart */}
      {stats.length > 0 && (
        <div className="mb-6" style={{ height: '250px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Detailed Statistics */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900">Format Statistics</h4>
        {stats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No export data available yet. Exports will be tracked automatically.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.map(stat => (
              <div
                key={stat.format}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 uppercase">
                      {stat.format}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({stat.totalExports} exports)
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      stat.successRate >= 95
                        ? 'bg-green-100 text-green-800'
                        : stat.successRate >= 80
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {stat.successRate}% success
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatDuration(stat.averageTimeMs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Median:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatDuration(stat.medianTimeMs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Rows:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {stat.averageRows.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Size:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatFileSize(stat.averageFileSizeBytes)}
                    </span>
                  </div>
                </div>

                {stat.minTimeMs > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Range: {formatDuration(stat.minTimeMs)} -{' '}
                    {formatDuration(stat.maxTimeMs)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Used & Fastest Format */}
      {(summary.mostUsedFormat || summary.fastestFormat) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.mostUsedFormat && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Most Used Format</div>
                <div className="text-lg font-bold text-blue-900 uppercase">
                  {summary.mostUsedFormat}
                </div>
              </div>
            )}
            {summary.fastestFormat && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Fastest Format</div>
                <div className="text-lg font-bold text-green-900 uppercase">
                  {summary.fastestFormat}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Format Selection Helper Component
interface FormatSelectorProps {
  rowCount: number;
  onFormatSelect: (format: ExportFormat) => void;
  className?: string;
}

export const FormatSelectorWithRecommendations: React.FC<FormatSelectorProps> = ({
  rowCount,
  onFormatSelect,
  className = '',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>(
    []
  );

  useEffect(() => {
    const recs = exportPerformanceMonitor.getRecommendations(selectedFormat, rowCount);
    setRecommendations(recs);
  }, [selectedFormat, rowCount]);

  const comparison = exportPerformanceMonitor.compareFormats(rowCount);

  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format);
  };

  const handleExport = () => {
    onFormatSelect(selectedFormat);
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'optimization':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'info':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Export {rowCount.toLocaleString()} rows
      </h3>

      {/* Format Comparison */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Export Format
        </label>
        <div className="space-y-2">
          {comparison.map(({ format, estimate, recommendation }) => (
            <label
              key={format}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedFormat === format
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={format}
                checked={selectedFormat === format}
                onChange={() => handleFormatChange(format)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 uppercase">
                    {format}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDuration(estimate.estimatedTimeMs)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{recommendation}</div>
                {estimate.confidence !== 'high' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {estimate.confidence}
                    {estimate.basedOnSamples > 0 &&
                      ` (${estimate.basedOnSamples} samples)`}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getRecommendationColor(rec.type)}`}
              >
                <div className="font-medium text-sm mb-1">{rec.message}</div>
                {rec.details && (
                  <div className="text-xs opacity-90">{rec.details}</div>
                )}
                {rec.estimatedTimeSavingsMs && rec.estimatedTimeSavingsMs > 0 && (
                  <div className="text-xs mt-1 font-medium">
                    Potential time savings: {formatDuration(rec.estimatedTimeSavingsMs)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Export as {selectedFormat.toUpperCase()}
      </button>
    </div>
  );
};
