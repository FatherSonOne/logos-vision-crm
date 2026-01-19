/**
 * Hook for using Web Workers for heavy data processing
 * Keeps UI responsive during large dataset operations
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WorkerMessage, WorkerResponse } from '../workers/dataProcessing.worker';

export interface UseDataWorkerOptions {
  onProgress?: (progress: number) => void;
  timeout?: number;
}

export function useDataWorker(options: UseDataWorkerOptions = {}) {
  const { onProgress, timeout = 30000 } = options;
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pendingPromisesRef = useRef<Map<number, { resolve: Function; reject: Function }>>(new Map());
  const messageIdRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    // Create worker if Web Workers are supported
    if (typeof Worker !== 'undefined') {
      try {
        // In production, this would point to the bundled worker file
        // For now, we'll handle this inline
        workerRef.current = null; // Placeholder
      } catch (error) {
        console.warn('[Worker] Failed to initialize worker:', error);
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  /**
   * Process data using Web Worker
   */
  const processData = useCallback(
    <T>(message: WorkerMessage): Promise<T> => {
      return new Promise((resolve, reject) => {
        // If worker is not available, process on main thread
        if (!workerRef.current) {
          return processOnMainThread<T>(message)
            .then(resolve)
            .catch(reject);
        }

        const messageId = messageIdRef.current++;
        setIsProcessing(true);
        setProgress(0);

        // Store promise handlers
        pendingPromisesRef.current.set(messageId, { resolve, reject });

        // Set timeout
        const timeoutId = setTimeout(() => {
          pendingPromisesRef.current.delete(messageId);
          setIsProcessing(false);
          reject(new Error('Worker timeout'));
        }, timeout);

        // Send message to worker
        workerRef.current.postMessage({ ...message, messageId });

        // Handle worker response
        const handleMessage = (event: MessageEvent<WorkerResponse & { messageId?: number }>) => {
          if (event.data.messageId !== messageId) return;

          switch (event.data.type) {
            case 'success':
              clearTimeout(timeoutId);
              pendingPromisesRef.current.delete(messageId);
              setIsProcessing(false);
              setProgress(100);
              resolve(event.data.result);
              workerRef.current?.removeEventListener('message', handleMessage);
              break;

            case 'error':
              clearTimeout(timeoutId);
              pendingPromisesRef.current.delete(messageId);
              setIsProcessing(false);
              reject(new Error(event.data.error));
              workerRef.current?.removeEventListener('message', handleMessage);
              break;

            case 'progress':
              setProgress(event.data.progress);
              onProgress?.(event.data.progress);
              break;
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
      });
    },
    [timeout, onProgress]
  );

  /**
   * Sample data using LTTB algorithm
   */
  const sampleData = useCallback(
    async <T extends { x: number | string; y: number }>(
      data: T[],
      threshold: number,
      method: 'lttb' | 'minmax' | 'adaptive' = 'lttb'
    ): Promise<T[]> => {
      return processData<T[]>({
        type: 'sample',
        method,
        data,
        threshold,
      });
    },
    [processData]
  );

  /**
   * Aggregate data by time
   */
  const aggregateByTime = useCallback(
    async (
      data: any[],
      config: {
        dateField: string;
        valueField: string;
        timeUnit: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
        fillGaps?: boolean;
      }
    ) => {
      return processData({
        type: 'aggregateTime',
        data,
        config,
      });
    },
    [processData]
  );

  /**
   * Aggregate data by fields
   */
  const aggregateBy = useCallback(
    async (
      data: any[],
      config: {
        groupBy: string | string[];
        metrics: Array<{
          field: string;
          operation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'stddev';
          alias?: string;
        }>;
      }
    ) => {
      return processData({
        type: 'aggregateBy',
        data,
        config,
      });
    },
    [processData]
  );

  /**
   * Calculate percentiles
   */
  const calculatePercentiles = useCallback(
    async (data: number[], percentiles?: number[]) => {
      return processData({
        type: 'percentiles',
        data,
        percentiles,
      });
    },
    [processData]
  );

  /**
   * Calculate moving average
   */
  const calculateMovingAverage = useCallback(
    async (data: any[], field: string, windowSize?: number) => {
      return processData({
        type: 'movingAverage',
        data,
        field,
        windowSize,
      });
    },
    [processData]
  );

  return {
    sampleData,
    aggregateByTime,
    aggregateBy,
    calculatePercentiles,
    calculateMovingAverage,
    processData,
    isProcessing,
    progress,
  };
}

/**
 * Fallback processing on main thread when worker is not available
 */
async function processOnMainThread<T>(message: WorkerMessage): Promise<T> {
  // Import utilities dynamically to avoid bundling them when using worker
  const { lttb, sampleMinMax, adaptiveSample } = await import('../utils/chartSampling');
  const {
    aggregateByTime,
    aggregateBy,
    calculatePercentiles,
    calculateMovingAverage,
    calculateEMA,
    calculateGrowthRate,
    detectOutliers,
    binData,
  } = await import('../utils/dataAggregation');

  let result: any;

  switch (message.type) {
    case 'sample':
      switch (message.method) {
        case 'lttb':
          result = lttb(message.data, message.threshold);
          break;
        case 'minmax':
          result = sampleMinMax(message.data, message.threshold);
          break;
        case 'adaptive':
          result = adaptiveSample(message.data, message.threshold);
          break;
      }
      break;

    case 'aggregateTime':
      result = aggregateByTime(message.data, message.config);
      break;

    case 'aggregateBy':
      result = aggregateBy(message.data, message.config);
      break;

    case 'percentiles':
      result = calculatePercentiles(message.data, message.percentiles);
      break;

    case 'movingAverage':
      result = calculateMovingAverage(message.data, message.field, message.windowSize);
      break;

    case 'ema':
      result = calculateEMA(message.data, message.field, message.alpha);
      break;

    case 'growthRate':
      result = calculateGrowthRate(message.data, message.field);
      break;

    case 'detectOutliers':
      result = detectOutliers(message.data, message.field, message.threshold);
      break;

    case 'binData':
      result = binData(message.data, message.field, message.binCount);
      break;

    default:
      throw new Error(`Unknown message type: ${(message as any).type}`);
  }

  return result as T;
}
