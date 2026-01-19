/**
 * Export Performance Monitor - Usage Examples
 *
 * This file demonstrates common usage patterns for the Export Performance Monitoring System.
 */

import { exportPerformanceMonitor, exportService } from '../index';
import type { ExportFormat } from '../../../reportService';

// ============================================
// EXAMPLE 1: Basic Export with Tracking
// ============================================

export async function basicExportExample(data: any[]) {
  console.log('Example 1: Basic Export with Tracking');

  // Export to CSV - tracking happens automatically
  await exportService.exportToCSV(data, 'report.csv');

  // Get statistics after export
  const summary = exportPerformanceMonitor.getSummary();
  console.log('Export Summary:', summary);
}

// ============================================
// EXAMPLE 2: Get Recommendations Before Export
// ============================================

export function getRecommendationsExample(rowCount: number) {
  console.log('Example 2: Get Recommendations');

  const format: ExportFormat = 'pdf';

  // Get recommendations for the format and data size
  const recommendations = exportPerformanceMonitor.getRecommendations(
    format,
    rowCount
  );

  // Get time estimate
  const estimate = exportPerformanceMonitor.estimateTime(format, rowCount);

  console.log(`Estimated time: ${estimate.estimatedTimeMs}ms`);
  console.log(`Confidence: ${estimate.confidence}`);
  console.log(`Based on ${estimate.basedOnSamples} samples`);
  console.log('Recommendations:');

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.type.toUpperCase()}] ${rec.message}`);
    if (rec.suggestedFormat) {
      console.log(`   Suggested format: ${rec.suggestedFormat}`);
    }
    if (rec.details) {
      console.log(`   ${rec.details}`);
    }
  });
}

// ============================================
// EXAMPLE 3: Smart Format Selection
// ============================================

export function smartFormatSelectionExample(rowCount: number) {
  console.log('Example 3: Smart Format Selection');

  // Compare all formats
  const comparison = exportPerformanceMonitor.compareFormats(rowCount);

  console.log(`\nComparing formats for ${rowCount.toLocaleString()} rows:\n`);

  comparison.forEach(({ format, estimate, recommendation }, index) => {
    console.log(`${index + 1}. ${format.toUpperCase()}`);
    console.log(`   Time: ${estimate.estimatedTimeMs}ms`);
    console.log(`   Confidence: ${estimate.confidence}`);
    console.log(`   ${recommendation}`);
    console.log('');
  });

  // Select fastest format
  const fastest = comparison[0];
  console.log(`Recommended format: ${fastest.format.toUpperCase()}`);

  return fastest.format;
}

// ============================================
// EXAMPLE 4: Performance Statistics
// ============================================

export function performanceStatsExample() {
  console.log('Example 4: Performance Statistics');

  // Get stats for all formats
  const allStats = exportPerformanceMonitor.getStats();

  console.log('\nPerformance Statistics by Format:\n');

  allStats.forEach(stat => {
    if (stat.totalExports === 0) return;

    console.log(`${stat.format.toUpperCase()}:`);
    console.log(`  Total exports: ${stat.totalExports}`);
    console.log(`  Success rate: ${stat.successRate}%`);
    console.log(`  Avg time: ${stat.averageTimeMs}ms`);
    console.log(`  Median time: ${stat.medianTimeMs}ms`);
    console.log(`  Avg rows: ${stat.averageRows.toLocaleString()}`);
    console.log(`  Avg file size: ${formatFileSize(stat.averageFileSizeBytes)}`);
    console.log('');
  });

  // Get overall summary
  const summary = exportPerformanceMonitor.getSummary();

  console.log('Overall Summary:');
  console.log(`  Total exports: ${summary.totalExports}`);
  console.log(`  Success rate: ${Math.round((summary.successfulExports / summary.totalExports) * 100)}%`);
  console.log(`  Average time: ${summary.averageTimeMs}ms`);
  console.log(`  Slow exports: ${summary.slowExports}`);
  console.log(`  Most used format: ${summary.mostUsedFormat || 'N/A'}`);
  console.log(`  Fastest format: ${summary.fastestFormat || 'N/A'}`);
}

// ============================================
// EXAMPLE 5: Export with User Confirmation
// ============================================

export async function exportWithConfirmationExample(
  data: any[],
  format: ExportFormat
) {
  console.log('Example 5: Export with User Confirmation');

  const rowCount = data.length;

  // Get recommendations
  const recommendations = exportPerformanceMonitor.getRecommendations(
    format,
    rowCount
  );

  // Check for warnings
  const hasWarnings = recommendations.some(r => r.type === 'warning');

  if (hasWarnings) {
    const warning = recommendations.find(r => r.type === 'warning');
    console.log(`WARNING: ${warning?.message}`);

    if (warning?.suggestedFormat) {
      console.log(`Recommended alternative: ${warning.suggestedFormat}`);

      // In real app, show confirmation dialog
      const userConfirmed = confirm(
        `${warning.message}\n\nContinue anyway?`
      );

      if (!userConfirmed) {
        console.log('Export cancelled by user');
        return;
      }
    }
  }

  // Get time estimate
  const estimate = exportPerformanceMonitor.estimateTime(format, rowCount);

  console.log(
    `Starting export of ${rowCount.toLocaleString()} rows as ${format.toUpperCase()}`
  );
  console.log(`Estimated time: ${formatDuration(estimate.estimatedTimeMs)}`);

  // Perform export
  if (format === 'csv') {
    await exportService.exportToCSV(data, 'report.csv');
  } else if (format === 'excel') {
    await exportService.exportToExcel(data, 'report.xlsx');
  } else if (format === 'pdf') {
    await exportService.exportToPDF(data, 'report.pdf');
  } else if (format === 'json') {
    await exportService.exportToJSON(data, 'report.json');
  }

  console.log('Export completed successfully');
}

// ============================================
// EXAMPLE 6: Adaptive Export Strategy
// ============================================

export async function adaptiveExportExample(data: any[]) {
  console.log('Example 6: Adaptive Export Strategy');

  const rowCount = data.length;

  // Automatically select best format based on data size
  let format: ExportFormat;

  if (rowCount > 10000) {
    format = 'csv'; // Large datasets
    console.log('Large dataset detected - using CSV format');
  } else if (rowCount > 1000) {
    format = 'excel'; // Medium datasets
    console.log('Medium dataset detected - using Excel format');
  } else {
    format = 'pdf'; // Small datasets
    console.log('Small dataset detected - using PDF format');
  }

  // Verify selection with performance monitor
  const recommendations = exportPerformanceMonitor.getRecommendations(
    format,
    rowCount
  );

  const hasOptimizations = recommendations.some(r => r.type === 'optimization');

  if (hasOptimizations) {
    const optimization = recommendations.find(r => r.type === 'optimization');
    if (optimization?.suggestedFormat) {
      console.log(`Optimization available: ${optimization.message}`);
      format = optimization.suggestedFormat;
    }
  }

  console.log(`Final format selection: ${format.toUpperCase()}`);

  // Perform export
  if (format === 'csv') {
    await exportService.exportToCSV(data, 'report.csv');
  } else if (format === 'excel') {
    await exportService.exportToExcel(data, 'report.xlsx');
  } else if (format === 'pdf') {
    await exportService.exportToPDF(data, 'report.pdf');
  }
}

// ============================================
// EXAMPLE 7: Performance Dashboard Data
// ============================================

export function getDashboardDataExample() {
  console.log('Example 7: Performance Dashboard Data');

  const summary = exportPerformanceMonitor.getSummary();
  const stats = exportPerformanceMonitor.getStats();

  // Format for dashboard display
  const dashboardData = {
    summary: {
      totalExports: summary.totalExports,
      successRate: summary.totalExports > 0
        ? Math.round((summary.successfulExports / summary.totalExports) * 100)
        : 0,
      averageTime: formatDuration(summary.averageTimeMs),
      slowExports: summary.slowExports,
      mostUsedFormat: summary.mostUsedFormat,
      fastestFormat: summary.fastestFormat,
    },
    formats: stats
      .filter(s => s.totalExports > 0)
      .map(s => ({
        format: s.format.toUpperCase(),
        totalExports: s.totalExports,
        successRate: s.successRate,
        averageTime: formatDuration(s.averageTimeMs),
        medianTime: formatDuration(s.medianTimeMs),
        averageRows: s.averageRows.toLocaleString(),
        averageFileSize: formatFileSize(s.averageFileSizeBytes),
      })),
  };

  console.log('Dashboard Data:', JSON.stringify(dashboardData, null, 2));

  return dashboardData;
}

// ============================================
// EXAMPLE 8: Batch Export with Progress
// ============================================

export async function batchExportExample(
  datasets: Array<{ name: string; data: any[] }>,
  format: ExportFormat
) {
  console.log('Example 8: Batch Export with Progress');

  const totalDatasets = datasets.length;
  let completed = 0;

  for (const dataset of datasets) {
    const estimate = exportPerformanceMonitor.estimateTime(format, dataset.data.length);

    console.log(`\nExporting ${dataset.name} (${dataset.data.length} rows)`);
    console.log(`Estimated time: ${formatDuration(estimate.estimatedTimeMs)}`);
    console.log(`Progress: ${completed + 1}/${totalDatasets}`);

    // Perform export
    if (format === 'csv') {
      await exportService.exportToCSV(dataset.data, `${dataset.name}.csv`);
    } else if (format === 'excel') {
      await exportService.exportToExcel(dataset.data, `${dataset.name}.xlsx`);
    }

    completed++;
    console.log(`Completed ${Math.round((completed / totalDatasets) * 100)}%`);
  }

  console.log('\nBatch export completed!');

  // Show performance summary
  const summary = exportPerformanceMonitor.getSummary();
  console.log(`Total exports: ${summary.totalExports}`);
  console.log(`Average time: ${formatDuration(summary.averageTimeMs)}`);
}

// ============================================
// EXAMPLE 9: Error Handling
// ============================================

export async function errorHandlingExample(data: any[], format: ExportFormat) {
  console.log('Example 9: Error Handling');

  try {
    // Attempt export
    if (format === 'csv') {
      await exportService.exportToCSV(data, 'report.csv');
    }

    console.log('Export successful');
  } catch (error) {
    console.error('Export failed:', error);

    // Get failure statistics
    const stats = exportPerformanceMonitor.getStats(format);
    const formatStats = stats[0];

    if (formatStats.failedExports > 0) {
      console.log(`\n${format.toUpperCase()} format has ${formatStats.failedExports} failed exports`);
      console.log(`Success rate: ${formatStats.successRate}%`);

      // Suggest alternative format
      const comparison = exportPerformanceMonitor.compareFormats(data.length);
      const alternative = comparison.find(c => c.format !== format);

      if (alternative) {
        console.log(`\nConsider trying ${alternative.format.toUpperCase()} format instead`);
      }
    }

    throw error;
  }
}

// ============================================
// EXAMPLE 10: Cleanup Old Metrics
// ============================================

export function cleanupExample() {
  console.log('Example 10: Cleanup Old Metrics');

  // Get current metrics count
  const beforeCount = exportPerformanceMonitor.getMetrics().length;
  console.log(`Current metrics: ${beforeCount}`);

  // Clear metrics older than 7 days
  const removed = exportPerformanceMonitor.clearOldMetrics(7);
  console.log(`Removed ${removed} old metrics`);

  // Get new count
  const afterCount = exportPerformanceMonitor.getMetrics().length;
  console.log(`Remaining metrics: ${afterCount}`);

  // Optionally clear all metrics
  // exportPerformanceMonitor.clearMetrics();
  // console.log('All metrics cleared');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

export async function runAllExamples() {
  const sampleData = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.random() * 100,
  }));

  console.log('='.repeat(60));
  console.log('Export Performance Monitor - Usage Examples');
  console.log('='.repeat(60));

  await basicExportExample(sampleData);
  console.log('\n' + '-'.repeat(60) + '\n');

  getRecommendationsExample(1000);
  console.log('\n' + '-'.repeat(60) + '\n');

  smartFormatSelectionExample(5000);
  console.log('\n' + '-'.repeat(60) + '\n');

  performanceStatsExample();
  console.log('\n' + '-'.repeat(60) + '\n');

  await exportWithConfirmationExample(sampleData, 'csv');
  console.log('\n' + '-'.repeat(60) + '\n');

  await adaptiveExportExample(sampleData);
  console.log('\n' + '-'.repeat(60) + '\n');

  getDashboardDataExample();
  console.log('\n' + '-'.repeat(60) + '\n');

  cleanupExample();
  console.log('\n' + '='.repeat(60) + '\n');
}
