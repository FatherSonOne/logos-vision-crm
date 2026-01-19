import React, { useState, useEffect } from 'react';
import { AIInsight, reportService } from '../../services/reportService';
import { generateReportSummary } from '../../services/geminiService';
import {
  generateForecast,
  detectAnomalies,
  findCorrelations,
  TimeSeriesDataPoint,
  MetricData,
  ForecastResult,
  AnomalyDetectionResult,
  CorrelationAnalysisResult,
} from '../../services/aiInsightsService';
import ForecastChart from './ai/ForecastChart';
import AnomalyDetectionPanel from './ai/AnomalyDetectionPanel';
import CorrelationMatrix from './ai/CorrelationMatrix';

// ============================================
// ICONS
// ============================================

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TrendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ForecastIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface AIInsightsPanelEnhancedProps {
  insights?: AIInsight[];
  data?: TimeSeriesDataPoint[]; // Time series data for analysis
  metrics?: MetricData[]; // Multiple metrics for correlation
  onDismiss?: (id: string) => void;
  onRefresh?: () => void;
}

type TabType = 'summary' | 'forecast' | 'anomalies' | 'correlations';

// ============================================
// MAIN COMPONENT
// ============================================

export const AIInsightsPanelEnhanced: React.FC<AIInsightsPanelEnhancedProps> = ({
  insights = [],
  data = [],
  metrics = [],
  onDismiss,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analysis results
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [anomalyResult, setAnomalyResult] = useState<AnomalyDetectionResult | null>(null);
  const [correlationResult, setCorrelationResult] = useState<CorrelationAnalysisResult | null>(null);

  // Auto-generate insights when data changes
  useEffect(() => {
    if (data.length > 0) {
      generateInsights();
    }
  }, [data, metrics]);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate forecast if we have time series data
      if (data.length >= 3) {
        const forecast = await generateForecast(data, {
          periodsAhead: 90,
          confidenceLevels: [0.80, 0.95],
          includeSeasonality: true,
        });
        setForecastResult(forecast);

        // Detect anomalies
        const anomalies = await detectAnomalies(data, {
          zScoreThreshold: 3,
          includeContext: true,
        });
        setAnomalyResult(anomalies);
      }

      // Find correlations if we have multiple metrics
      if (metrics.length >= 2) {
        const correlations = await findCorrelations(metrics, {
          minCorrelation: 0.7,
          includeBusinessContext: true,
        });
        setCorrelationResult(correlations);
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    generateInsights();
    onRefresh?.();
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'summary',
      label: 'Summary',
      icon: <LightbulbIcon />,
      count: insights.length,
    },
    {
      id: 'forecast',
      label: 'Forecast',
      icon: <ForecastIcon />,
    },
    {
      id: 'anomalies',
      label: 'Anomalies',
      icon: <AlertIcon />,
      count: anomalyResult?.anomalies.length,
    },
    {
      id: 'correlations',
      label: 'Correlations',
      icon: <ChartIcon />,
      count: correlationResult?.significantCorrelations,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Advanced analytics with forecasting, anomaly detection, and correlation analysis
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshIcon />
          {isLoading ? 'Generating...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertIcon />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <p className="text-gray-600 dark:text-gray-400">Analyzing data...</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {!isLoading && (
        <div className="min-h-[400px]">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div>
              {insights.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <LightbulbIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No insights yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    AI insights will appear here as your data grows. Click 'Refresh Insights' to generate new ones.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {insight.insightType}
                        </span>
                        {onDismiss && (
                          <button
                            onClick={() => onDismiss(insight.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      {insight.insightTitle && (
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {insight.insightTitle}
                        </h3>
                      )}
                      <p className="text-gray-700 dark:text-gray-300">{insight.insightText}</p>
                      {insight.suggestedAction && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            Suggested Action:
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                            {insight.suggestedAction}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div>
              {forecastResult && data.length > 0 ? (
                <ForecastChart
                  historicalData={data}
                  forecast={forecastResult}
                  title="Revenue Forecast"
                  valueLabel="Revenue"
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <ForecastIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No forecast available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Need at least 3 data points to generate a forecast. Add more data or check back later.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Anomalies Tab */}
          {activeTab === 'anomalies' && (
            <div>
              {anomalyResult ? (
                <AnomalyDetectionPanel
                  result={anomalyResult}
                  showVisualization={true}
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <AlertIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No anomaly detection available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Need at least 3 data points to detect anomalies. Add more data or check back later.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Correlations Tab */}
          {activeTab === 'correlations' && (
            <div>
              {correlationResult ? (
                <CorrelationMatrix result={correlationResult} />
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <ChartIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No correlation analysis available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Need at least 2 metrics to perform correlation analysis. Add more metrics or check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanelEnhanced;
