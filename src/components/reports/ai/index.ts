// Export all AI Insights components

export { default as ForecastChart } from './ForecastChart';
export { default as AnomalyDetectionPanel } from './AnomalyDetectionPanel';
export { default as CorrelationMatrix } from './CorrelationMatrix';
export { default as AIInsightsDemo } from './AIInsightsDemo';

// Re-export types from the service
export type {
  TimeSeriesDataPoint,
  MetricData,
  ForecastOptions,
  ForecastPrediction,
  ForecastResult,
  AnomalyOptions,
  Anomaly,
  AnomalyDetectionResult,
  CorrelationOptions,
  CorrelationPair,
  CorrelationAnalysisResult,
} from '../../../services/aiInsightsService';

// Re-export functions from the service
export {
  generateForecast,
  detectAnomalies,
  findCorrelations,
} from '../../../services/aiInsightsService';
