import React from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ForecastResult, TimeSeriesDataPoint } from '../../../services/aiInsightsService';

interface ForecastChartProps {
  historicalData: TimeSeriesDataPoint[];
  forecast: ForecastResult;
  title?: string;
  valueLabel?: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  historicalData,
  forecast,
  title = 'Forecast Analysis',
  valueLabel = 'Value',
}) => {
  // Combine historical and forecast data
  const chartData = [
    ...historicalData.map(d => ({
      date: d.date,
      actual: d.value,
      label: d.label,
    })),
    ...forecast.predictions.map(p => ({
      date: p.date,
      predicted: p.predictedValue,
      confidence80Lower: p.confidenceIntervals.find(ci => ci.level === 0.80)?.lower,
      confidence80Upper: p.confidenceIntervals.find(ci => ci.level === 0.80)?.upper,
      confidence95Lower: p.confidenceIntervals.find(ci => ci.level === 0.95)?.lower,
      confidence95Upper: p.confidenceIntervals.find(ci => ci.level === 0.95)?.upper,
    })),
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format value for display
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {formatDate(label)}
        </p>
        {payload.map((entry: any, index: number) => {
          if (entry.value === undefined) return null;

          let label = entry.name;
          let color = entry.color;

          if (entry.name === 'actual') {
            label = 'Actual';
          } else if (entry.name === 'predicted') {
            label = 'Predicted';
          } else if (entry.name.includes('confidence')) {
            return null; // Don't show in tooltip
          }

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{label}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatValue(entry.value)}
              </span>
            </div>
          );
        })}
        {payload.find((p: any) => p.name === 'confidence80Upper') && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              80% CI: {formatValue(payload.find((p: any) => p.name === 'confidence80Lower')?.value)} - {formatValue(payload.find((p: any) => p.name === 'confidence80Upper')?.value)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              95% CI: {formatValue(payload.find((p: any) => p.name === 'confidence95Lower')?.value)} - {formatValue(payload.find((p: any) => p.name === 'confidence95Upper')?.value)}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Get trend color and icon
  const getTrendColor = () => {
    switch (forecast.trend) {
      case 'upward':
        return 'text-green-600 dark:text-green-400';
      case 'downward':
        return 'text-red-600 dark:text-red-400';
      case 'cyclical':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (forecast.trend) {
      case 'upward':
        return '↗';
      case 'downward':
        return '↘';
      case 'cyclical':
        return '↻';
      default:
        return '→';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Trend:</span>
            <span className={`font-medium ${getTrendColor()}`}>
              {getTrendIcon()} {forecast.trend.charAt(0).toUpperCase() + forecast.trend.slice(1)}
            </span>
          </div>
          {forecast.seasonality.detected && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Seasonality:</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {forecast.seasonality.description}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Accuracy:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {forecast.expectedAccuracy.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tickFormatter={formatValue}
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* 95% Confidence Interval (lighter) */}
            <Area
              type="monotone"
              dataKey="confidence95Upper"
              fill="#93c5fd"
              fillOpacity={0.2}
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="confidence95Lower"
              fill="#93c5fd"
              fillOpacity={0.2}
              stroke="none"
            />

            {/* 80% Confidence Interval (darker) */}
            <Area
              type="monotone"
              dataKey="confidence80Upper"
              fill="#60a5fa"
              fillOpacity={0.3}
              stroke="none"
            />
            <Area
              type="monotone"
              dataKey="confidence80Lower"
              fill="#60a5fa"
              fillOpacity={0.3}
              stroke="none"
            />

            {/* Vertical line separating historical from forecast */}
            <ReferenceLine
              x={historicalData[historicalData.length - 1]?.date}
              stroke="#6b7280"
              strokeDasharray="3 3"
              label={{ value: 'Forecast →', position: 'top' }}
            />

            {/* Actual data line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Historical"
            />

            {/* Predicted data line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#8b5cf6', r: 4 }}
              name="Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Methodology and AI Analysis */}
      <div className="mt-6 space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Methodology:</span>
          <span className="text-gray-700 dark:text-gray-300">{forecast.methodology}</span>
        </div>
        {forecast.aiAnalysis && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">AI Insights</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">{forecast.aiAnalysis}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-600" />
            <span>Historical Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-purple-600 border-dashed" style={{ borderTop: '2px dashed' }} />
            <span>Forecast</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 opacity-30 rounded" />
            <span>80% Confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-300 opacity-20 rounded" />
            <span>95% Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastChart;
