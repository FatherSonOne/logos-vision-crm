import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimePayload } from '../services/realtimeService';
import { reportService, KPI } from '../services/reportService';

// ============================================
// TYPES
// ============================================

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface KPIAlert {
  id: string;
  kpiId: string;
  type: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  value: number;
  threshold: number;
}

export interface RealtimeKPIState {
  kpi: KPI | null;
  isLoading: boolean;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastUpdate: Date | null;
  error: Error | null;
  alerts: KPIAlert[];
  hasValueChanged: boolean;
}

export interface UseRealtimeKPIOptions {
  // Enable/disable real-time updates
  enabled?: boolean;
  // Recalculation interval (in ms, 0 = disabled)
  recalculateIntervalMs?: number;
  // Enable alert notifications
  enableAlerts?: boolean;
  // Callback on KPI value change
  onValueChange?: (kpi: KPI, previousValue: number | null) => void;
  // Callback on threshold breach
  onThresholdBreach?: (alert: KPIAlert) => void;
  // Callback on connection status change
  onConnectionChange?: (status: ConnectionStatus) => void;
  // Callback on error
  onError?: (error: Error) => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Subscribe to real-time KPI value changes
 *
 * Features:
 * - Real-time KPI recalculation on data source changes
 * - Trend direction updates
 * - Alert triggering for threshold breaches
 * - Connection status tracking
 * - Automatic cleanup
 *
 * @example
 * ```typescript
 * const { kpi, isLoading, isConnected, alerts } = useRealtimeKPI('kpi-123', {
 *   enableAlerts: true,
 *   onValueChange: (kpi, prevValue) => {
 *     console.log(`KPI changed from ${prevValue} to ${kpi.currentValue}`);
 *   }
 * });
 * ```
 */
export function useRealtimeKPI(
  kpiId: string,
  options: UseRealtimeKPIOptions = {}
) {
  const {
    enabled = true,
    recalculateIntervalMs = 5000, // Recalculate every 5 seconds
    enableAlerts = true,
    onValueChange,
    onThresholdBreach,
    onConnectionChange,
    onError
  } = options;

  const [state, setState] = useState<RealtimeKPIState>({
    kpi: null,
    isLoading: true,
    isConnected: false,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    error: null,
    alerts: [],
    hasValueChanged: false
  });

  const recalculateInterval = useRef<NodeJS.Timeout>();
  const previousValue = useRef<number | null>(null);
  const animationTimeout = useRef<NodeJS.Timeout>();

  // Update connection status
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({
      ...prev,
      connectionStatus: status,
      isConnected: status === 'connected'
    }));
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  // Load initial KPI data
  const loadKPI = useCallback(async () => {
    if (!kpiId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const kpis = reportService.getKPIs();
      const kpi = kpis.find(k => k.id === kpiId);

      if (!kpi) {
        throw new Error(`KPI not found: ${kpiId}`);
      }

      setState(prev => ({
        ...prev,
        kpi,
        isLoading: false,
        lastUpdate: new Date()
      }));

      previousValue.current = kpi.currentValue ?? null;
    } catch (error) {
      console.error('❌ Failed to load KPI:', error);
      const err = error instanceof Error ? error : new Error('Failed to load KPI');
      setState(prev => ({ ...prev, error: err, isLoading: false }));
      onError?.(err);
    }
  }, [kpiId, onError]);

  // Recalculate KPI value
  const recalculateKPI = useCallback(async () => {
    if (!state.kpi) return;

    try {
      await reportService.calculateKPI(state.kpi.id);
      const updatedKPIs = reportService.getKPIs();
      const updatedKPI = updatedKPIs.find(k => k.id === state.kpi!.id);

      if (!updatedKPI) return;

      const valueChanged = updatedKPI.currentValue !== previousValue.current;

      setState(prev => ({
        ...prev,
        kpi: updatedKPI,
        lastUpdate: new Date(),
        hasValueChanged: valueChanged
      }));

      // Trigger value change callback
      if (valueChanged && onValueChange) {
        onValueChange(updatedKPI, previousValue.current);
      }

      // Check for threshold breaches and trigger alerts
      if (enableAlerts && valueChanged) {
        checkThresholds(updatedKPI);
      }

      previousValue.current = updatedKPI.currentValue ?? null;

      // Reset animation flag after delay
      if (valueChanged) {
        if (animationTimeout.current) {
          clearTimeout(animationTimeout.current);
        }
        animationTimeout.current = setTimeout(() => {
          setState(prev => ({ ...prev, hasValueChanged: false }));
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Failed to recalculate KPI:', error);
      const err = error instanceof Error ? error : new Error('Failed to recalculate KPI');
      setState(prev => ({ ...prev, error: err }));
      onError?.(err);
    }
  }, [state.kpi, enableAlerts, onValueChange, onError]);

  // Check threshold breaches
  const checkThresholds = useCallback((kpi: KPI) => {
    if (!kpi.currentValue) return;

    const alerts: KPIAlert[] = [];

    // Check critical threshold
    if (kpi.thresholdCritical !== null && kpi.thresholdCritical !== undefined) {
      const breached = kpi.thresholdDirection === 'above'
        ? kpi.currentValue > kpi.thresholdCritical
        : kpi.currentValue < kpi.thresholdCritical;

      if (breached) {
        const alert: KPIAlert = {
          id: `alert-${Date.now()}-critical`,
          kpiId: kpi.id,
          type: 'critical',
          message: `${kpi.name} has breached critical threshold: ${kpi.currentValue} ${kpi.thresholdDirection} ${kpi.thresholdCritical}`,
          timestamp: new Date(),
          value: kpi.currentValue,
          threshold: kpi.thresholdCritical
        };
        alerts.push(alert);
        onThresholdBreach?.(alert);
      }
    }

    // Check warning threshold (only if critical not breached)
    if (alerts.length === 0 && kpi.thresholdWarning !== null && kpi.thresholdWarning !== undefined) {
      const breached = kpi.thresholdDirection === 'above'
        ? kpi.currentValue > kpi.thresholdWarning
        : kpi.currentValue < kpi.thresholdWarning;

      if (breached) {
        const alert: KPIAlert = {
          id: `alert-${Date.now()}-warning`,
          kpiId: kpi.id,
          type: 'warning',
          message: `${kpi.name} has breached warning threshold: ${kpi.currentValue} ${kpi.thresholdDirection} ${kpi.thresholdWarning}`,
          timestamp: new Date(),
          value: kpi.currentValue,
          threshold: kpi.thresholdWarning
        };
        alerts.push(alert);
        onThresholdBreach?.(alert);
      }
    }

    if (alerts.length > 0) {
      setState(prev => ({
        ...prev,
        alerts: [...prev.alerts, ...alerts].slice(-10) // Keep last 10 alerts
      }));
    }
  }, [onThresholdBreach]);

  // Handle real-time updates from data source
  const handleDataSourceUpdate = useCallback((payload: RealtimePayload) => {
    console.log(`📊 KPI data source updated:`, payload.eventType);
    // Recalculate KPI when data source changes
    recalculateKPI();
  }, [recalculateKPI]);

  // Manual refresh
  const refresh = useCallback(() => {
    recalculateKPI();
  }, [recalculateKPI]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setState(prev => ({ ...prev, alerts: [] }));
  }, []);

  // Load KPI initially
  useEffect(() => {
    loadKPI();
  }, [loadKPI]);

  // Subscribe to data source changes
  useEffect(() => {
    if (!enabled || !state.kpi?.dataSource) return;

    updateConnectionStatus('connecting');

    try {
      // Subscribe to the KPI's data source table
      const unsubscribe = realtimeService.subscribe(
        state.kpi.dataSource,
        handleDataSourceUpdate
      );

      updateConnectionStatus('connected');

      return () => {
        unsubscribe();
        updateConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to KPI data source:', error);
      const err = error instanceof Error ? error : new Error('Failed to subscribe');
      setState(prev => ({ ...prev, error: err }));
      updateConnectionStatus('error');
      onError?.(err);
    }
  }, [enabled, state.kpi?.dataSource, handleDataSourceUpdate, updateConnectionStatus, onError]);

  // Set up periodic recalculation
  useEffect(() => {
    if (!enabled || recalculateIntervalMs <= 0) return;

    recalculateInterval.current = setInterval(() => {
      recalculateKPI();
    }, recalculateIntervalMs);

    return () => {
      if (recalculateInterval.current) {
        clearInterval(recalculateInterval.current);
      }
    };
  }, [enabled, recalculateIntervalMs, recalculateKPI]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh,
    clearAlerts
  };
}
