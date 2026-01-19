/**
 * Web Worker for Heavy Data Processing
 * Handles data aggregation, sampling, and transformations off the main thread
 */

import { lttb, sampleMinMax, adaptiveSample, type DataPoint } from '../utils/chartSampling';
import {
  aggregateByTime,
  aggregateBy,
  calculatePercentiles,
  calculateMovingAverage,
  calculateEMA,
  calculateGrowthRate,
  detectOutliers,
  binData,
  type TimeSeriesConfig,
  type AggregationConfig,
} from '../utils/dataAggregation';

// Message types
export type WorkerMessage =
  | { type: 'sample'; method: 'lttb' | 'minmax' | 'adaptive'; data: DataPoint[]; threshold: number }
  | { type: 'aggregateTime'; data: any[]; config: TimeSeriesConfig }
  | { type: 'aggregateBy'; data: any[]; config: AggregationConfig }
  | { type: 'percentiles'; data: number[]; percentiles?: number[] }
  | { type: 'movingAverage'; data: any[]; field: string; windowSize?: number }
  | { type: 'ema'; data: any[]; field: string; alpha?: number }
  | { type: 'growthRate'; data: any[]; field: string }
  | { type: 'detectOutliers'; data: any[]; field: string; threshold?: number }
  | { type: 'binData'; data: any[]; field: string; binCount?: number };

export type WorkerResponse =
  | { type: 'success'; result: any }
  | { type: 'error'; error: string }
  | { type: 'progress'; progress: number };

// Worker message handler
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    let result: any;

    switch (message.type) {
      case 'sample':
        result = handleSampling(message.data, message.method, message.threshold);
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

    // Send success response
    const response: WorkerResponse = { type: 'success', result };
    self.postMessage(response);
  } catch (error) {
    // Send error response
    const response: WorkerResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
});

/**
 * Handle sampling with progress updates
 */
function handleSampling(
  data: DataPoint[],
  method: 'lttb' | 'minmax' | 'adaptive',
  threshold: number
): DataPoint[] {
  // Send initial progress
  const progressResponse: WorkerResponse = { type: 'progress', progress: 0 };
  self.postMessage(progressResponse);

  let result: DataPoint[];

  switch (method) {
    case 'lttb':
      result = lttb(data, threshold);
      break;
    case 'minmax':
      result = sampleMinMax(data, threshold);
      break;
    case 'adaptive':
      result = adaptiveSample(data, threshold);
      break;
    default:
      result = data;
  }

  // Send completion progress
  const completeResponse: WorkerResponse = { type: 'progress', progress: 100 };
  self.postMessage(completeResponse);

  return result;
}

// Export empty object to make this a module
export {};
