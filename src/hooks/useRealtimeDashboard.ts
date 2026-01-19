import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimePayload } from '../services/realtimeService';
import { reportService, ReportWidget, KPI } from '../services/reportService';

// ============================================
// TYPES
// ============================================

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type RefreshInterval = 5000 | 30000 | 60000 | 300000; // 5s, 30s, 1m, 5m

export interface WidgetData {
  widgetId: string;
  data: any;
  lastUpdate: Date;
  isLoading: boolean;
  error: Error | null;
}

export interface RealtimeDashboardState {
  widgets: Map<string, WidgetData>;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastUpdate: Date | null;
  error: Error | null;
  refreshInterval: RefreshInterval;
  autoRefresh: boolean;
  updateCount: number;
}

export interface UseRealtimeDashboardOptions {
  // Dashboard ID
  dashboardId: string;
  // Widgets to monitor
  widgets: ReportWidget[];
  // Enable/disable real-time updates
  enabled?: boolean;
  // Auto-refresh interval
  refreshInterval?: RefreshInterval;
  // Enable auto-refresh
  autoRefresh?: boolean;
  // Batch update delay (ms) to avoid flickering
  batchUpdateDelayMs?: number;
  // Enable optimistic updates
  optimisticUpdates?: boolean;
  // Callback on widget update
  onWidgetUpdate?: (widgetId: string, data: any) => void;
  // Callback on connection status change
  onConnectionChange?: (status: ConnectionStatus) => void;
  // Callback on error
  onError?: (error: Error) => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Subscribe to real-time updates for multiple dashboard widgets
 *
 * Features:
 * - Multi-widget subscription management
 * - Batch updates to avoid flickering
 * - Optimistic updates for better UX
 * - Configurable refresh intervals
 * - Manual refresh trigger
 * - Connection status tracking
 *
 * @example
 * ```typescript
 * const {
 *   widgets,
 *   isConnected,
 *   lastUpdate,
 *   refresh,
 *   setRefreshInterval,
 *   toggleAutoRefresh
 * } = useRealtimeDashboard({
 *   dashboardId: 'dash-123',
 *   widgets: dashboardWidgets,
 *   refreshInterval: 30000,
 *   autoRefresh: true
 * });
 * ```
 */
export function useRealtimeDashboard(options: UseRealtimeDashboardOptions) {
  const {
    dashboardId,
    widgets: widgetConfigs,
    enabled = true,
    refreshInterval: initialRefreshInterval = 30000,
    autoRefresh: initialAutoRefresh = true,
    batchUpdateDelayMs = 300,
    optimisticUpdates = true,
    onWidgetUpdate,
    onConnectionChange,
    onError
  } = options;

  const [state, setState] = useState<RealtimeDashboardState>({
    widgets: new Map(),
    isConnected: false,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    error: null,
    refreshInterval: initialRefreshInterval,
    autoRefresh: initialAutoRefresh,
    updateCount: 0
  });

  const refreshIntervalTimer = useRef<NodeJS.Timeout>();
  const batchUpdateTimer = useRef<NodeJS.Timeout>();
  const pendingUpdates = useRef<Map<string, any>>(new Map());
  const subscriptions = useRef<Map<string, () => void>>(new Map());

  // Update connection status
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({
      ...prev,
      connectionStatus: status,
      isConnected: status === 'connected'
    }));
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  // Load widget data
  const loadWidgetData = useCallback(async (widget: ReportWidget) => {
    try {
      setState(prev => {
        const newWidgets = new Map(prev.widgets);
        newWidgets.set(widget.id, {
          widgetId: widget.id,
          data: null,
          lastUpdate: new Date(),
          isLoading: true,
          error: null
        });
        return { ...prev, widgets: newWidgets };
      });

      let data: any = null;

      // Load data based on widget type
      if (widget.widgetType === 'kpi' && widget.config?.kpiId) {
        const kpis = reportService.getKPIs();
        const kpi = kpis.find((k: KPI) => k.id === widget.config.kpiId);
        if (kpi) {
          await reportService.calculateKPI(kpi.id);
          data = reportService.getKPIs().find((k: KPI) => k.id === kpi.id);
        }
      } else if (widget.reportId) {
        // Load report data
        const reports = reportService.getReports();
        const report = reports.find(r => r.id === widget.reportId);
        data = report;
      } else {
        data = widget.config;
      }

      setState(prev => {
        const newWidgets = new Map(prev.widgets);
        newWidgets.set(widget.id, {
          widgetId: widget.id,
          data,
          lastUpdate: new Date(),
          isLoading: false,
          error: null
        });
        return { ...prev, widgets: newWidgets };
      });

      onWidgetUpdate?.(widget.id, data);
    } catch (error) {
      console.error(`❌ Failed to load widget ${widget.id}:`, error);
      const err = error instanceof Error ? error : new Error('Failed to load widget');

      setState(prev => {
        const newWidgets = new Map(prev.widgets);
        newWidgets.set(widget.id, {
          widgetId: widget.id,
          data: null,
          lastUpdate: new Date(),
          isLoading: false,
          error: err
        });
        return { ...prev, widgets: newWidgets };
      });

      onError?.(err);
    }
  }, [onWidgetUpdate, onError]);

  // Apply batched updates
  const applyBatchedUpdates = useCallback(() => {
    if (pendingUpdates.current.size === 0) return;

    setState(prev => {
      const newWidgets = new Map(prev.widgets);

      pendingUpdates.current.forEach((data, widgetId) => {
        const existing = newWidgets.get(widgetId);
        if (existing) {
          newWidgets.set(widgetId, {
            ...existing,
            data,
            lastUpdate: new Date(),
            isLoading: false
          });
        }
      });

      pendingUpdates.current.clear();

      return {
        ...prev,
        widgets: newWidgets,
        lastUpdate: new Date(),
        updateCount: prev.updateCount + 1
      };
    });
  }, []);

  // Handle real-time update
  const handleRealtimeUpdate = useCallback((
    widgetId: string,
    payload: RealtimePayload
  ) => {
    console.log(`📊 Widget ${widgetId} data updated:`, payload.eventType);

    // Queue update for batching
    const widget = widgetConfigs.find(w => w.id === widgetId);
    if (!widget) return;

    if (batchUpdateDelayMs > 0) {
      // Add to pending updates
      pendingUpdates.current.set(widgetId, payload.new);

      // Clear existing timer
      if (batchUpdateTimer.current) {
        clearTimeout(batchUpdateTimer.current);
      }

      // Set new timer
      batchUpdateTimer.current = setTimeout(() => {
        applyBatchedUpdates();
      }, batchUpdateDelayMs);
    } else {
      // Apply immediately
      loadWidgetData(widget);
    }
  }, [widgetConfigs, batchUpdateDelayMs, applyBatchedUpdates, loadWidgetData]);

  // Subscribe to widget data source
  const subscribeToWidget = useCallback((widget: ReportWidget) => {
    if (!widget.reportId && !widget.config?.kpiId) return;

    let tableName: string | null = null;

    // Determine data source table
    if (widget.config?.kpiId) {
      const kpis = reportService.getKPIs();
      const kpi = kpis.find((k: KPI) => k.id === widget.config.kpiId);
      tableName = kpi?.dataSource || null;
    } else if (widget.reportId) {
      const reports = reportService.getReports();
      const report = reports.find(r => r.id === widget.reportId);
      tableName = report?.dataSource?.table || null;
    }

    if (!tableName) return;

    try {
      const unsubscribe = realtimeService.subscribe(
        tableName,
        (payload) => handleRealtimeUpdate(widget.id, payload)
      );

      subscriptions.current.set(widget.id, unsubscribe);
    } catch (error) {
      console.error(`❌ Failed to subscribe to widget ${widget.id}:`, error);
      const err = error instanceof Error ? error : new Error('Failed to subscribe');
      onError?.(err);
    }
  }, [handleRealtimeUpdate, onError]);

  // Unsubscribe from widget
  const unsubscribeFromWidget = useCallback((widgetId: string) => {
    const unsubscribe = subscriptions.current.get(widgetId);
    if (unsubscribe) {
      unsubscribe();
      subscriptions.current.delete(widgetId);
    }
  }, []);

  // Refresh all widgets
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, lastUpdate: new Date() }));

    for (const widget of widgetConfigs) {
      await loadWidgetData(widget);
    }
  }, [widgetConfigs, loadWidgetData]);

  // Set refresh interval
  const setRefreshInterval = useCallback((interval: RefreshInterval) => {
    setState(prev => ({ ...prev, refreshInterval: interval }));
  }, []);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, []);

  // Initialize widgets
  useEffect(() => {
    if (!enabled) return;

    updateConnectionStatus('connecting');

    // Load initial data for all widgets
    widgetConfigs.forEach(widget => {
      loadWidgetData(widget);
      subscribeToWidget(widget);
    });

    updateConnectionStatus('connected');

    return () => {
      // Cleanup all subscriptions
      subscriptions.current.forEach((unsubscribe) => {
        unsubscribe();
      });
      subscriptions.current.clear();
      updateConnectionStatus('disconnected');
    };
  }, [enabled, widgetConfigs, loadWidgetData, subscribeToWidget, updateConnectionStatus]);

  // Auto-refresh timer
  useEffect(() => {
    if (!state.autoRefresh || !enabled) return;

    refreshIntervalTimer.current = setInterval(() => {
      refresh();
    }, state.refreshInterval);

    return () => {
      if (refreshIntervalTimer.current) {
        clearInterval(refreshIntervalTimer.current);
      }
    };
  }, [state.autoRefresh, state.refreshInterval, enabled, refresh]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (batchUpdateTimer.current) {
        clearTimeout(batchUpdateTimer.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh,
    setRefreshInterval,
    toggleAutoRefresh
  };
}
