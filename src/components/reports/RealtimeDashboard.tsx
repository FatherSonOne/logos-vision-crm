import React, { useState } from 'react';
import { useRealtimeDashboard, RefreshInterval } from '../../hooks/useRealtimeDashboard';
import { ReportWidget, ReportDashboard } from '../../services/reportService';

// ============================================
// ICONS
// ============================================

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// ============================================
// TYPES
// ============================================

export interface RealtimeDashboardProps {
  dashboard: ReportDashboard;
  widgets: ReportWidget[];
  onWidgetClick?: (widget: ReportWidget) => void;
}

// ============================================
// CONNECTION STATUS INDICATOR
// ============================================

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastUpdate: Date | null;
  updateCount: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, lastUpdate, updateCount }) => {
  const statusConfig = {
    connected: {
      icon: CheckCircleIcon,
      text: 'Connected',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      dotColor: 'bg-green-500'
    },
    connecting: {
      icon: ClockIcon,
      text: 'Connecting...',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      dotColor: 'bg-yellow-500'
    },
    disconnected: {
      icon: ExclamationIcon,
      text: 'Disconnected',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
      dotColor: 'bg-gray-500'
    },
    error: {
      icon: ExclamationIcon,
      text: 'Error',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      dotColor: 'bg-red-500'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor}`}>
      <div className={`relative flex items-center gap-2 ${config.color}`}>
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
          {status === 'connected' && (
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.dotColor} animate-ping`} />
          )}
        </div>
        <Icon />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
      {lastUpdate && (
        <>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </>
      )}
      {updateCount > 0 && (
        <>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {updateCount} updates
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// REFRESH INTERVAL SELECTOR
// ============================================

interface RefreshIntervalSelectorProps {
  currentInterval: RefreshInterval;
  onIntervalChange: (interval: RefreshInterval) => void;
}

const RefreshIntervalSelector: React.FC<RefreshIntervalSelectorProps> = ({
  currentInterval,
  onIntervalChange
}) => {
  const intervals: Array<{ value: RefreshInterval; label: string }> = [
    { value: 5000, label: '5s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '1m' },
    { value: 300000, label: '5m' }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">Refresh:</span>
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {intervals.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onIntervalChange(value)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              currentInterval === value
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({
  dashboard,
  widgets,
  onWidgetClick
}) => {
  const {
    widgets: widgetDataMap,
    isConnected,
    connectionStatus,
    lastUpdate,
    refreshInterval,
    autoRefresh,
    updateCount,
    refresh,
    setRefreshInterval,
    toggleAutoRefresh
  } = useRealtimeDashboard({
    dashboardId: dashboard.id,
    widgets,
    enabled: true,
    refreshInterval: (dashboard.refreshIntervalSeconds * 1000) as RefreshInterval || 30000,
    autoRefresh: dashboard.autoRefresh
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Title and Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {dashboard.name}
            </h2>
            {dashboard.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {dashboard.description}
              </p>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Connection Status */}
            <ConnectionStatus
              status={connectionStatus}
              lastUpdate={lastUpdate}
              updateCount={updateCount}
            />

            {/* Auto-refresh Toggle */}
            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              {autoRefresh ? <PauseIcon /> : <PlayIcon />}
              <span>Auto-refresh</span>
            </button>

            {/* Refresh Interval Selector */}
            {autoRefresh && (
              <RefreshIntervalSelector
                currentInterval={refreshInterval}
                onIntervalChange={setRefreshInterval}
              />
            )}

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${dashboard.columnCount || 3}, minmax(0, 1fr))`
        }}
      >
        {widgets.map((widget) => {
          const widgetData = widgetDataMap.get(widget.id);

          return (
            <div
              key={widget.id}
              onClick={() => onWidgetClick?.(widget)}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all ${
                onWidgetClick ? 'cursor-pointer hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600' : ''
              }`}
              style={{
                gridColumn: `span ${widget.gridWidth}`,
                gridRow: `span ${widget.gridHeight}`,
                backgroundColor: widget.backgroundColor || undefined,
                borderColor: widget.borderColor || undefined,
                color: widget.textColor || undefined
              }}
            >
              {/* Widget Header */}
              {(widget.title || widget.subtitle) && (
                <div className="mb-4">
                  {widget.title && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {widget.title}
                    </h3>
                  )}
                  {widget.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {widget.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Widget Content */}
              <div className="widget-content">
                {widgetData?.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : widgetData?.error ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <ExclamationIcon />
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                        {widgetData.error.message}
                      </p>
                    </div>
                  </div>
                ) : widgetData?.data ? (
                  <div className="widget-data">
                    {/* Render widget based on type */}
                    {widget.widgetType === 'kpi' && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                          {widgetData.data.prefix || ''}
                          {widgetData.data.currentValue || 0}
                          {widgetData.data.suffix || ''}
                        </div>
                        {widgetData.data.trendPercentage !== null && (
                          <div className={`text-sm mt-2 ${
                            widgetData.data.trendDirection === 'up'
                              ? 'text-green-600'
                              : widgetData.data.trendDirection === 'down'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}>
                            {widgetData.data.trendPercentage > 0 ? '+' : ''}
                            {widgetData.data.trendPercentage.toFixed(1)}% from previous
                          </div>
                        )}
                      </div>
                    )}

                    {widget.widgetType === 'text' && (
                      <div className="prose dark:prose-invert max-w-none">
                        {widget.config?.text || 'No content'}
                      </div>
                    )}

                    {widget.widgetType === 'chart' && (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        Chart rendering not implemented
                      </div>
                    )}

                    {widget.widgetType === 'table' && (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        Table rendering not implemented
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No data available
                  </div>
                )}
              </div>

              {/* Last Update Timestamp */}
              {widgetData?.lastUpdate && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    Updated {widgetData.lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RealtimeDashboard;
