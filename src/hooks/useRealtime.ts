// useRealtime Hook - Easy way to subscribe to real-time updates in React components
import { useEffect } from 'react';
import { realtimeService, type RealtimeCallback } from '../services/realtimeService';

/**
 * Subscribe to real-time updates for a table
 * Automatically unsubscribes when component unmounts
 */
export function useRealtime<T = any>(
  table: string,
  callback: RealtimeCallback<T>,
  filter?: { column: string; value: string | number }
) {
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe<T>(table, callback, filter);

    return () => {
      unsubscribe();
    };
  }, [table, filter?.column, filter?.value]); // Re-subscribe if table or filter changes
}

/**
 * Subscribe to INSERT events only
 */
export function useRealtimeInserts<T = any>(
  table: string,
  callback: (record: T) => void
) {
  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToInserts<T>(table, callback);

    return () => {
      unsubscribe();
    };
  }, [table]);
}

/**
 * Subscribe to UPDATE events only
 */
export function useRealtimeUpdates<T = any>(
  table: string,
  callback: (record: T, oldRecord: T) => void
) {
  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToUpdates<T>(table, callback);

    return () => {
      unsubscribe();
    };
  }, [table]);
}

/**
 * Subscribe to DELETE events only
 */
export function useRealtimeDeletes<T = any>(
  table: string,
  callback: (oldRecord: T) => void
) {
  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToDeletes<T>(table, callback);

    return () => {
      unsubscribe();
    };
  }, [table]);
}
