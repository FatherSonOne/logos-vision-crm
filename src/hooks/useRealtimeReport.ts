import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimePayload } from '../services/realtimeService';

// ============================================
// TYPES
// ============================================

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface RealtimeReportState<T = any> {
  data: T[];
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastUpdate: Date | null;
  error: Error | null;
}

export interface UseRealtimeReportOptions {
  // Enable/disable real-time updates
  enabled?: boolean;
  // Initial data
  initialData?: any[];
  // Debounce rapid updates (in ms)
  debounceMs?: number;
  // Auto-reconnect on disconnect
  autoReconnect?: boolean;
  // Max reconnection attempts
  maxReconnectAttempts?: number;
  // Callback on connection status change
  onConnectionChange?: (status: ConnectionStatus) => void;
  // Callback on data update
  onDataUpdate?: (data: any[]) => void;
  // Callback on error
  onError?: (error: Error) => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Subscribe to real-time changes on a report's data source table
 *
 * Features:
 * - Automatic reconnection on disconnect
 * - Debouncing for rapid updates
 * - Connection status tracking
 * - INSERT, UPDATE, DELETE event handling
 * - Cleanup on unmount
 *
 * @example
 * ```typescript
 * const { data, isConnected, lastUpdate, refresh } = useRealtimeReport(
 *   'donations',
 *   { id: 'report-123' },
 *   { debounceMs: 300 }
 * );
 * ```
 */
export function useRealtimeReport<T = any>(
  tableName: string,
  reportId?: string,
  options: UseRealtimeReportOptions = {}
) {
  const {
    enabled = true,
    initialData = [],
    debounceMs = 200,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    onConnectionChange,
    onDataUpdate,
    onError
  } = options;

  const [state, setState] = useState<RealtimeReportState<T>>({
    data: initialData,
    isConnected: false,
    connectionStatus: 'disconnected',
    lastUpdate: null,
    error: null
  });

  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const debounceTimeout = useRef<NodeJS.Timeout>();
  const pendingUpdates = useRef<Array<() => void>>([]);

  // Update connection status
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setState(prev => ({
      ...prev,
      connectionStatus: status,
      isConnected: status === 'connected'
    }));
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  // Apply debounced updates
  const applyPendingUpdates = useCallback(() => {
    if (pendingUpdates.current.length === 0) return;

    setState(prev => {
      let newData = [...prev.data];

      // Apply all pending updates in order
      pendingUpdates.current.forEach(update => {
        update();
      });

      // Clear pending updates
      const updates = pendingUpdates.current;
      pendingUpdates.current = [];

      return {
        ...prev,
        lastUpdate: new Date()
      };
    });

    onDataUpdate?.(state.data);
  }, [onDataUpdate, state.data]);

  // Handle real-time payload
  const handleRealtimeUpdate = useCallback((payload: RealtimePayload<T>) => {
    const updateFn = () => {
      setState(prev => {
        let newData = [...prev.data];

        switch (payload.eventType) {
          case 'INSERT':
            // Add new record
            newData.push(payload.new);
            break;

          case 'UPDATE':
            // Update existing record
            const updateIndex = newData.findIndex(
              (item: any) => item.id === payload.new.id
            );
            if (updateIndex !== -1) {
              newData[updateIndex] = payload.new;
            }
            break;

          case 'DELETE':
            // Remove deleted record
            newData = newData.filter(
              (item: any) => item.id !== payload.old.id
            );
            break;
        }

        return {
          ...prev,
          data: newData,
          lastUpdate: new Date(),
          error: null
        };
      });
    };

    // Debounce updates
    if (debounceMs > 0) {
      pendingUpdates.current.push(updateFn);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        applyPendingUpdates();
      }, debounceMs);
    } else {
      updateFn();
    }
  }, [debounceMs, applyPendingUpdates]);

  // Reconnect logic
  const attemptReconnect = useCallback(() => {
    if (!autoReconnect || reconnectAttempts.current >= maxReconnectAttempts) {
      updateConnectionStatus('error');
      const error = new Error(`Failed to reconnect after ${maxReconnectAttempts} attempts`);
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    reconnectAttempts.current++;
    updateConnectionStatus('connecting');

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 16000);

    reconnectTimeout.current = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
      // Subscription will be recreated in useEffect
      setState(prev => ({ ...prev, error: null }));
    }, delay);
  }, [autoReconnect, maxReconnectAttempts, updateConnectionStatus, onError]);

  // Manual refresh
  const refresh = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastUpdate: new Date()
    }));
    reconnectAttempts.current = 0;
  }, []);

  // Update data manually (for initial load or manual updates)
  const setData = useCallback((newData: T[] | ((prev: T[]) => T[])) => {
    setState(prev => ({
      ...prev,
      data: typeof newData === 'function' ? newData(prev.data) : newData,
      lastUpdate: new Date()
    }));
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enabled || !tableName) return;

    updateConnectionStatus('connecting');

    try {
      const unsubscribe = realtimeService.subscribe<T>(
        tableName,
        handleRealtimeUpdate
      );

      // Connection successful
      updateConnectionStatus('connected');
      reconnectAttempts.current = 0;

      return () => {
        unsubscribe();
        updateConnectionStatus('disconnected');

        if (debounceTimeout.current) {
          clearTimeout(debounceTimeout.current);
        }
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to real-time updates:', error);
      const err = error instanceof Error ? error : new Error('Failed to subscribe');
      setState(prev => ({ ...prev, error: err }));
      onError?.(err);
      attemptReconnect();
    }
  }, [enabled, tableName, handleRealtimeUpdate, updateConnectionStatus, attemptReconnect, onError]);

  return {
    ...state,
    refresh,
    setData,
    reconnect: attemptReconnect
  };
}
