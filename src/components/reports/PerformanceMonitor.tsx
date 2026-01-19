/**
 * Performance Monitor Component
 * Developer tool to monitor report performance in real-time
 */

import React, { useState, useEffect } from 'react';
import {
  globalPerformanceMonitor,
  generateRecommendations,
  type PerformanceMetrics,
  type OptimizationRecommendation,
} from '../../utils/performanceOptimizer';
import { apiCache } from '../../services/cacheManager';

interface PerformanceMonitorProps {
  show?: boolean;
  dataSize?: number;
  renderStrategy?: string;
  onClose?: () => void;
}

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CriticalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  show = false,
  dataSize = 0,
  renderStrategy = 'unknown',
  onClose,
}) => {
  const [metrics, setMetrics] = useState<{
    renderTime: number;
    dataFetchTime: number;
    cacheHitRate: number;
    memoryUsage: number;
  }>({
    renderTime: 0,
    dataFetchTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
  });

  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      // Get performance metrics
      const renderMetric = globalPerformanceMonitor.getMetric('report_render');
      const fetchMetric = globalPerformanceMonitor.getMetric('data_fetch');
      const cacheStats = apiCache.getStats();

      // Get memory usage if available
      let memoryUsage = 0;
      if ('memory' in performance && (performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize;
      }

      const newMetrics = {
        renderTime: renderMetric?.avg || 0,
        dataFetchTime: fetchMetric?.avg || 0,
        cacheHitRate: cacheStats.hitRate || 0,
        memoryUsage,
      };

      setMetrics(newMetrics);

      // Generate recommendations
      const perfMetrics: PerformanceMetrics = {
        renderTime: newMetrics.renderTime,
        dataFetchTime: newMetrics.dataFetchTime,
        cacheHitRate: newMetrics.cacheHitRate,
        memoryUsage: newMetrics.memoryUsage,
        dataSize,
        strategy: { type: renderStrategy as any },
      };

      setRecommendations(generateRecommendations(perfMetrics));
    }, 1000);

    return () => clearInterval(interval);
  }, [show, dataSize, renderStrategy]);

  if (!show) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <ChartIcon />
          Performance Monitor
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl">
        <div className="flex items-center gap-2 text-white">
          <ChartIcon />
          <h3 className="font-semibold">Performance Monitor</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 p-1 rounded transition-colors"
            title="Minimize"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              title="Close"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {/* Render Time */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Render Time</span>
            <span className={`text-lg font-bold ${metrics.renderTime > 1000 ? 'text-red-600' : metrics.renderTime > 500 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.renderTime.toFixed(0)}ms
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${metrics.renderTime > 1000 ? 'bg-red-500' : metrics.renderTime > 500 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, (metrics.renderTime / 2000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Data Fetch Time */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Fetch Time</span>
            <span className={`text-lg font-bold ${metrics.dataFetchTime > 2000 ? 'text-red-600' : metrics.dataFetchTime > 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.dataFetchTime.toFixed(0)}ms
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${metrics.dataFetchTime > 2000 ? 'bg-red-500' : metrics.dataFetchTime > 1000 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, (metrics.dataFetchTime / 3000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cache Hit Rate</span>
            <span className={`text-lg font-bold ${metrics.cacheHitRate < 50 ? 'text-red-600' : metrics.cacheHitRate < 75 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.cacheHitRate.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${metrics.cacheHitRate < 50 ? 'bg-red-500' : metrics.cacheHitRate < 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${metrics.cacheHitRate}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        {metrics.memoryUsage > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Memory Usage</span>
              <span className={`text-lg font-bold ${metrics.memoryUsage > 50 * 1024 * 1024 ? 'text-red-600' : metrics.memoryUsage > 10 * 1024 * 1024 ? 'text-yellow-600' : 'text-green-600'}`}>
                {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${metrics.memoryUsage > 50 * 1024 * 1024 ? 'bg-red-500' : metrics.memoryUsage > 10 * 1024 * 1024 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (metrics.memoryUsage / (100 * 1024 * 1024)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Data Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Data Size</span>
              <p className="font-semibold text-gray-900 dark:text-white">{dataSize.toLocaleString()} rows</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Strategy</span>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{renderStrategy}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommendations</h4>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 flex gap-2 ${
                  rec.type === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : rec.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${
                  rec.type === 'critical'
                    ? 'text-red-600 dark:text-red-400'
                    : rec.type === 'warning'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {rec.type === 'critical' ? <CriticalIcon /> : rec.type === 'warning' ? <WarningIcon /> : <InfoIcon />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    rec.type === 'critical'
                      ? 'text-red-800 dark:text-red-200'
                      : rec.type === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {rec.message}
                  </p>
                  {rec.action && (
                    <p className={`text-xs mt-1 ${
                      rec.type === 'critical'
                        ? 'text-red-600 dark:text-red-300'
                        : rec.type === 'warning'
                        ? 'text-yellow-600 dark:text-yellow-300'
                        : 'text-blue-600 dark:text-blue-300'
                    }`}>
                      Action: {rec.action}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Development Mode Only - Updates every 1s
        </p>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
