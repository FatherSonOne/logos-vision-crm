/**
 * Export Module Index
 *
 * Central export point for all export-related functionality.
 * Provides unified access to interfaces, services, and utilities.
 */

// ============================================
// INTERFACES & TYPES
// ============================================

export * from '../interfaces/IExportService';
export * from './types';

// ============================================
// EXPORT SERVICES
// ============================================

export {
  CsvExportService,
  csvExportService,
  downloadCsv,
  DELIMITER_PRESETS,
  DATE_FORMAT_PRESETS,
  type CsvExportOptions,
} from './CsvExportService';

export {
  ImageExportService,
  imageExportService,
  findChartElements,
  exportReportCharts,
  downloadImage,
  SOCIAL_MEDIA_PRESETS,
  type ImageExportOptions,
  type SocialMediaPreset,
} from './ImageExportService';

export { PdfExportService } from './PdfExportService';

export { AdvancedPdfExportService } from './AdvancedPdfExportService';
export { default as advancedPdfExportService } from './AdvancedPdfExportService';

export { ExcelExportService } from './ExcelExportService';

export { PdfFormatter } from './formatters/PdfFormatter';

export {
  getNumericFields,
  formatFieldName,
  calculateColumnWidths,
  formatNumberCell,
  formatDateCell,
  createHeaderCell,
  createDataCell,
  calculateSummaryStats,
  isDateField,
  type CellStyle,
  type ColumnInfo,
  type SummaryStats,
  EXCEL_STYLES,
} from './formatters/ExcelFormatter';

export {
  IExportService as IAdvancedExportService,
  ExportOptions as AdvancedExportOptions,
  ChartOptions,
  FilterOption,
} from './IExportService';

// ============================================
// EXPORT ROUTER (STRATEGY PATTERN)
// ============================================

export { ExportRouter, exportRouter as defaultExportRouter } from './ExportRouter';

// ============================================
// CLIENT-SIDE EXPORT SERVICE
// ============================================

export { ClientSideExportService } from './ClientSideExportService';

// ============================================
// PERFORMANCE MONITORING
// ============================================

export {
  ExportPerformanceMonitor,
  exportPerformanceMonitor,
  type ExportMetric,
  type FormatStats,
  type PerformanceRecommendation,
  type TimeEstimate,
} from './ExportPerformanceMonitor';

// ============================================
// LEGACY EXPORT SERVICE
// ============================================

export {
  ExportService,
  exportService,
} from './ExportService';
