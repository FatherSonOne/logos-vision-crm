import React, { useState } from 'react';
import { Anomaly, AnomalyDetectionResult } from '../../../services/aiInsightsService';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface AnomalyDetectionPanelProps {
  result: AnomalyDetectionResult;
  onDismissAnomaly?: (index: number) => void;
  showVisualization?: boolean;
}

export const AnomalyDetectionPanel: React.FC<AnomalyDetectionPanelProps> = ({
  result,
  onDismissAnomaly,
  showVisualization = true,
}) => {
  const [dismissedAnomalies, setDismissedAnomalies] = useState<Set<number>>(new Set());

  const handleDismiss = (index: number) => {
    setDismissedAnomalies(prev => new Set([...prev, index]));
    onDismissAnomaly?.(index);
  };

  const visibleAnomalies = result.anomalies.filter(a => !dismissedAnomalies.has(a.index));

  // Get severity color
  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-400',
          badge: 'bg-red-500',
        };
      case 'moderate':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          border: 'border-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-400',
          badge: 'bg-yellow-500',
        };
      case 'minor':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-500',
          text: 'text-blue-700 dark:text-blue-400',
          badge: 'bg-blue-500',
        };
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format value
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Prepare scatter chart data
  const scatterData = result.anomalies.map(a => ({
    date: a.date,
    value: a.value,
    expected: a.expectedValue,
    severity: a.severity,
    index: a.index,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    const anomaly = result.anomalies.find(a => a.index === data.index);
    if (!anomaly) return null;

    const colors = getSeverityColor(anomaly.severity);

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${colors.badge}`} />
          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {anomaly.severity} Anomaly
          </p>
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Date: <span className="font-medium text-gray-900 dark:text-white">{formatDate(data.date)}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Value: <span className="font-medium text-gray-900 dark:text-white">{formatValue(data.value)}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Expected: <span className="font-medium text-gray-900 dark:text-white">{formatValue(data.expected)}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Deviation: <span className={`font-medium ${colors.text}`}>
              {anomaly.deviationPercentage > 0 ? '+' : ''}{anomaly.deviationPercentage.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Anomalies</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {visibleAnomalies.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {result.anomalyRate.toFixed(1)}% of data points
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {visibleAnomalies.filter(a => a.severity === 'critical').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Require immediate attention
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Methodology</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {result.methodology}
          </div>
        </div>
      </div>

      {/* Visualization */}
      {showVisualization && scatterData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Anomaly Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tickFormatter={(value) => formatValue(value)}
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={scatterData[0]?.expected || 0}
                  stroke="#6b7280"
                  strokeDasharray="3 3"
                  label={{ value: 'Expected', position: 'right' }}
                />
                <Scatter data={scatterData} fill="#3b82f6">
                  {scatterData.map((entry, index) => {
                    const colors = getSeverityColor(entry.severity);
                    const fillColor =
                      entry.severity === 'critical' ? '#ef4444' :
                      entry.severity === 'moderate' ? '#f59e0b' : '#3b82f6';
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Anomaly List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Detected Anomalies
        </h3>

        {visibleAnomalies.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="inline-block p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Anomalies Detected</h3>
            <p className="text-gray-500 dark:text-gray-400">
              All data points are within expected ranges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {visibleAnomalies.map((anomaly) => {
              const colors = getSeverityColor(anomaly.severity);

              return (
                <div
                  key={anomaly.index}
                  className={`${colors.bg} rounded-xl border-l-4 ${colors.border} p-5 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${colors.badge}`} />
                      <div>
                        <span className={`text-xs font-medium uppercase tracking-wide ${colors.text}`}>
                          {anomaly.severity} Anomaly
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                          {formatDate(anomaly.date)}
                        </p>
                      </div>
                    </div>
                    {onDismissAnomaly && (
                      <button
                        onClick={() => handleDismiss(anomaly.index)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 dark:hover:bg-gray-700/50"
                        title="Dismiss"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Data Point Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Actual Value</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatValue(anomaly.value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Expected Value</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatValue(anomaly.expectedValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Deviation</p>
                      <p className={`text-lg font-bold ${colors.text}`}>
                        {anomaly.deviationPercentage > 0 ? '+' : ''}{anomaly.deviationPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Z-Score</p>
                      <p className={`text-lg font-bold ${colors.text}`}>
                        {anomaly.zScore.toFixed(2)}σ
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {anomaly.explanation}
                    </p>
                  </div>

                  {/* Suggested Actions */}
                  {anomaly.suggestedActions.length > 0 && (
                    <div className="p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Suggested Actions:
                      </p>
                      <ul className="space-y-1">
                        {anomaly.suggestedActions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyDetectionPanel;
