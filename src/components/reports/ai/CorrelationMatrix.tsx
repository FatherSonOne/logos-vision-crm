import React, { useState } from 'react';
import { CorrelationAnalysisResult, CorrelationPair } from '../../../services/aiInsightsService';

interface CorrelationMatrixProps {
  result: CorrelationAnalysisResult;
  onVisualize?: (pair: CorrelationPair) => void;
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  result,
  onVisualize,
}) => {
  const [selectedPair, setSelectedPair] = useState<CorrelationPair | null>(null);

  // Get color based on correlation strength and direction
  const getCorrelationColor = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    const isPositive = coefficient > 0;

    if (abs >= 0.9) {
      return isPositive
        ? 'bg-green-700 text-white'
        : 'bg-red-700 text-white';
    } else if (abs >= 0.7) {
      return isPositive
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white';
    } else if (abs >= 0.5) {
      return isPositive
        ? 'bg-green-300 text-gray-900'
        : 'bg-red-300 text-gray-900';
    } else if (abs >= 0.3) {
      return isPositive
        ? 'bg-green-100 text-gray-700'
        : 'bg-red-100 text-gray-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  // Get strength badge color
  const getStrengthColor = (strength: CorrelationPair['strength']) => {
    switch (strength) {
      case 'very strong':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'strong':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'weak':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get visualization icon
  const getVisualizationIcon = (type: CorrelationPair['suggestedVisualization']) => {
    switch (type) {
      case 'scatter':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'dual-axis-line':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'stacked-area':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const handleCellClick = (pair: CorrelationPair) => {
    setSelectedPair(pair);
  };

  const handleVisualize = (pair: CorrelationPair) => {
    onVisualize?.(pair);
  };

  // Get unique metrics
  const metrics = new Set<string>();
  result.correlations.forEach(c => {
    metrics.add(c.metric1);
    metrics.add(c.metric2);
  });
  const metricList = Array.from(metrics);

  // Build matrix lookup
  const correlationMap = new Map<string, CorrelationPair>();
  result.correlations.forEach(c => {
    correlationMap.set(`${c.metric1}-${c.metric2}`, c);
    correlationMap.set(`${c.metric2}-${c.metric1}`, c);
  });

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Pairs Analyzed</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {result.totalPairsAnalyzed}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Significant Correlations</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {result.significantCorrelations}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Methodology</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {result.methodology}
          </div>
        </div>
      </div>

      {/* Correlation Matrix Heatmap */}
      {metricList.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-x-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Correlation Heatmap
          </h3>
          <div className="inline-block min-w-full">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-left border-b border-r border-gray-200 dark:border-gray-700">
                    {/* Empty cell */}
                  </th>
                  {metricList.map((metric) => (
                    <th
                      key={metric}
                      className="p-2 text-xs font-medium text-gray-900 dark:text-white text-center border-b border-gray-200 dark:border-gray-700 min-w-[80px]"
                    >
                      <div className="transform -rotate-45 origin-left whitespace-nowrap">
                        {metric}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metricList.map((metric1) => (
                  <tr key={metric1}>
                    <td className="p-2 text-xs font-medium text-gray-900 dark:text-white text-right border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      {metric1}
                    </td>
                    {metricList.map((metric2) => {
                      if (metric1 === metric2) {
                        return (
                          <td key={metric2} className="p-1">
                            <div className="w-16 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">
                              1.00
                            </div>
                          </td>
                        );
                      }

                      const pair = correlationMap.get(`${metric1}-${metric2}`);
                      if (!pair) {
                        return (
                          <td key={metric2} className="p-1">
                            <div className="w-16 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-400">
                              —
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={metric2} className="p-1">
                          <button
                            onClick={() => handleCellClick(pair)}
                            className={`w-16 h-12 flex items-center justify-center rounded text-xs font-medium hover:shadow-lg transition-shadow ${getCorrelationColor(pair.coefficient)}`}
                            title={`${pair.strength} ${pair.direction} correlation`}
                          >
                            {pair.coefficient.toFixed(2)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-red-700 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Strong Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-gray-100 dark:bg-gray-700 rounded" />
                <span className="text-gray-600 dark:text-gray-400">No Correlation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-green-700 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Strong Positive</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Correlation List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Correlation Details
        </h3>

        {result.correlations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Significant Correlations
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No strong correlations found between the analyzed metrics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {result.correlations.map((pair, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all ${
                  selectedPair === pair ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getStrengthColor(pair.strength)}`}>
                        {pair.strength}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                        pair.direction === 'positive'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {pair.direction}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {pair.metric1} ↔ {pair.metric2}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pair.coefficient.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Correlation
                    </div>
                  </div>
                </div>

                {/* Business Implication */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                        Business Implication
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {pair.businessImplication}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visualization Button */}
                {onVisualize && (
                  <button
                    onClick={() => handleVisualize(pair)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    {getVisualizationIcon(pair.suggestedVisualization)}
                    <span className="font-medium">
                      View {pair.suggestedVisualization === 'scatter' ? 'Scatter Plot' :
                           pair.suggestedVisualization === 'dual-axis-line' ? 'Dual-Axis Chart' : 'Stacked Area Chart'}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationMatrix;
