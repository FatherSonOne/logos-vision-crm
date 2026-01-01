import React, { useState } from 'react';
import { KPI, reportService } from '../../services/reportService';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

// ============================================
// ICONS
// ============================================

const TrendUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface KPIMonitoringProps {
  kpis: KPI[];
  onRefresh: () => void;
}

type ViewMode = 'cards' | 'list' | 'scorecard';

// ============================================
// KPI CARD COMPONENT
// ============================================

interface KPIDetailCardProps {
  kpi: KPI;
  onEdit?: () => void;
}

const KPIDetailCard: React.FC<KPIDetailCardProps> = ({ kpi, onEdit }) => {
  const status = reportService.getKPIStatus(kpi);
  const formattedValue = kpi.currentValue !== null && kpi.currentValue !== undefined
    ? reportService.formatValue(kpi.currentValue, kpi.displayFormat, kpi.decimalPlaces)
    : '--';

  const statusColors = {
    success: 'from-green-500 to-emerald-600',
    warning: 'from-yellow-500 to-amber-600',
    critical: 'from-red-500 to-rose-600',
    neutral: 'from-gray-500 to-slate-600',
  };

  const statusBgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    neutral: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  };

  const sparklineData = kpi.valueHistory.length > 0
    ? kpi.valueHistory.slice(-12).map((h, i) => ({ value: h.value, index: i }))
    : Array.from({ length: 12 }, (_, i) => ({ value: Math.random() * 100 + 50, index: i }));

  return (
    <div className={`rounded-xl border p-5 ${statusBgColors[status]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{kpi.name}</h3>
          {kpi.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{kpi.description}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${statusColors[status]} text-white`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {kpi.prefix}{formattedValue}{kpi.suffix}
          </p>
          {kpi.trendDirection && kpi.trendPercentage !== null && (
            <div className={`flex items-center gap-1 mt-2 ${
              kpi.trendDirection === 'up' ? 'text-green-600' : kpi.trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {kpi.trendDirection === 'up' ? <TrendUpIcon /> : kpi.trendDirection === 'down' ? <TrendDownIcon /> : null}
              <span className="text-sm font-medium">
                {kpi.trendPercentage > 0 ? '+' : ''}{kpi.trendPercentage?.toFixed(1)}% from previous
              </span>
            </div>
          )}
        </div>

        {/* Mini Sparkline */}
        {sparklineData.length > 0 && (
          <div className="w-24 h-12" style={{ minWidth: 96, minHeight: 48 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={40}>
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={status === 'success' ? '#10b981' : status === 'warning' ? '#f59e0b' : status === 'critical' ? '#ef4444' : '#6b7280'}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Target Progress */}
      {kpi.targetValue && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Target: {reportService.formatValue(kpi.targetValue, kpi.displayFormat, kpi.decimalPlaces)}</span>
            <span>{((kpi.currentValue || 0) / kpi.targetValue * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${statusColors[status]}`}
              style={{ width: `${Math.min(100, ((kpi.currentValue || 0) / kpi.targetValue * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Thresholds */}
      {(kpi.thresholdWarning || kpi.thresholdCritical) && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {kpi.thresholdWarning && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
              Warning: {kpi.thresholdDirection === 'above' ? '>' : '<'} {reportService.formatValue(kpi.thresholdWarning, kpi.displayFormat, 0)}
            </span>
          )}
          {kpi.thresholdCritical && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
              Critical: {kpi.thresholdDirection === 'above' ? '>' : '<'} {reportService.formatValue(kpi.thresholdCritical, kpi.displayFormat, 0)}
            </span>
          )}
        </div>
      )}

      {/* Alert Status */}
      {kpi.alertEnabled && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <BellIcon />
          <span>Alerts enabled ({kpi.alertRecipients.length} recipients)</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// SCORECARD VIEW
// ============================================

interface ScorecardViewProps {
  kpis: KPI[];
}

const ScorecardView: React.FC<ScorecardViewProps> = ({ kpis }) => {
  // Group KPIs by category
  const groupedKPIs = kpis.reduce((acc, kpi) => {
    const cat = kpi.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(kpi);
    return acc;
  }, {} as Record<string, KPI[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedKPIs).map(([category, categoryKPIs]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">{category}</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Trend</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categoryKPIs.map((kpi) => {
                  const status = reportService.getKPIStatus(kpi);
                  const formattedValue = kpi.currentValue !== null && kpi.currentValue !== undefined
                    ? reportService.formatValue(kpi.currentValue, kpi.displayFormat, kpi.decimalPlaces)
                    : '--';
                  const progress = kpi.targetValue ? ((kpi.currentValue || 0) / kpi.targetValue * 100) : null;

                  const statusColors = {
                    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                  };

                  return (
                    <tr key={kpi.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{kpi.name}</div>
                        {kpi.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{kpi.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">
                        {kpi.prefix}{formattedValue}{kpi.suffix}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-500 dark:text-gray-400">
                        {kpi.targetValue ? `${kpi.prefix || ''}${reportService.formatValue(kpi.targetValue, kpi.displayFormat, 0)}${kpi.suffix || ''}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {progress !== null ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  status === 'success' ? 'bg-green-500' :
                                  status === 'warning' ? 'bg-yellow-500' :
                                  status === 'critical' ? 'bg-red-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{progress.toFixed(0)}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {kpi.trendDirection && kpi.trendPercentage !== null ? (
                          <span className={`flex items-center justify-end gap-1 ${
                            kpi.trendDirection === 'up' ? 'text-green-600' :
                            kpi.trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {kpi.trendDirection === 'up' ? <TrendUpIcon /> : kpi.trendDirection === 'down' ? <TrendDownIcon /> : null}
                            {kpi.trendPercentage > 0 ? '+' : ''}{kpi.trendPercentage?.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const KPIMonitoring: React.FC<KPIMonitoringProps> = ({ kpis, onRefresh }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get unique categories
  const categories = Array.from(new Set(kpis.map(k => k.category || 'Other')));

  // Filter KPIs
  const filteredKPIs = filterCategory === 'all'
    ? kpis
    : kpis.filter(k => (k.category || 'Other') === filterCategory);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reportService.refreshAllKPIs();
      onRefresh();
    } catch (err) {
      console.error('Failed to refresh KPIs:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Summary stats
  const successCount = filteredKPIs.filter(k => reportService.getKPIStatus(k) === 'success').length;
  const warningCount = filteredKPIs.filter(k => reportService.getKPIStatus(k) === 'warning').length;
  const criticalCount = filteredKPIs.filter(k => reportService.getKPIStatus(k) === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">KPI Monitoring</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track key performance indicators and set alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshIcon />
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <PlusIcon />
            Add KPI
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total KPIs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredKPIs.length}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-green-600 dark:text-green-400">On Track</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{successCount}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Warning</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{warningCount}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Critical</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{criticalCount}</p>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors capitalize ${
                filterCategory === cat
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {(['cards', 'list', 'scorecard'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Display */}
      {filteredKPIs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No KPIs found. Create your first KPI to get started.</p>
        </div>
      ) : viewMode === 'scorecard' ? (
        <ScorecardView kpis={filteredKPIs} />
      ) : viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredKPIs.map((kpi) => {
                const status = reportService.getKPIStatus(kpi);
                const formattedValue = kpi.currentValue !== null && kpi.currentValue !== undefined
                  ? reportService.formatValue(kpi.currentValue, kpi.displayFormat, kpi.decimalPlaces)
                  : '--';

                return (
                  <tr key={kpi.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{kpi.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{kpi.category}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">
                      {kpi.prefix}{formattedValue}{kpi.suffix}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {kpi.trendDirection && kpi.trendPercentage !== null ? (
                        <span className={`flex items-center justify-end gap-1 ${
                          kpi.trendDirection === 'up' ? 'text-green-600' :
                          kpi.trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {kpi.trendDirection === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                          {kpi.trendPercentage > 0 ? '+' : ''}{kpi.trendPercentage?.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <SettingsIcon />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKPIs.map((kpi) => (
            <KPIDetailCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KPIMonitoring;
