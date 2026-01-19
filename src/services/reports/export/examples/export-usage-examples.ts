/**
 * Export Services Usage Examples
 *
 * Demonstrates common usage patterns for ImageExportService and CsvExportService.
 * These examples can be used as templates for integrating export functionality
 * into report components.
 */

import {
  imageExportService,
  csvExportService,
  downloadImage,
  downloadCsv,
  SOCIAL_MEDIA_PRESETS,
  DELIMITER_PRESETS,
  DATE_FORMAT_PRESETS,
  type ImageExportOptions,
  type CsvExportOptions,
} from '../index';

// ============================================
// IMAGE EXPORT EXAMPLES
// ============================================

/**
 * Example 1: Basic PNG Export
 */
export async function exportChartToPNG(chartElementId: string, reportName: string) {
  const chartElement = document.getElementById(chartElementId) as HTMLElement;

  if (!chartElement) {
    console.error('Chart element not found');
    return;
  }

  const result = await imageExportService.export({
    reportName,
    chartElement,
    imageOptions: {
      format: 'png',
      resolution: 2, // Retina quality
      transparent: false,
    },
  });

  if (result.success && result.blob) {
    downloadImage(result.blob, result.filename);
    console.log(`Exported ${result.fileSize} bytes`);
  } else {
    console.error('Export failed:', result.error);
  }
}

/**
 * Example 2: High-Resolution Print Export
 */
export async function exportChartForPrint(chartElement: HTMLElement) {
  try {
    const blob = await imageExportService.exportToImage(chartElement, {
      format: 'png',
      resolution: 4, // 4x resolution for print quality
      width: 3000,
      height: 2000,
      transparent: false,
    });

    downloadImage(blob, 'chart-print-quality.png');
  } catch (error) {
    console.error('Print export failed:', error);
  }
}

/**
 * Example 3: Export for Social Media
 */
export async function exportChartForSocialMedia(
  chartElement: HTMLElement,
  platform: keyof typeof SOCIAL_MEDIA_PRESETS
) {
  try {
    const blob = await imageExportService.exportForSocialMedia(chartElement, platform);

    const filename = `chart-${platform}.${SOCIAL_MEDIA_PRESETS[platform].format}`;
    downloadImage(blob, filename);

    console.log(`Exported for ${platform}:`, {
      width: SOCIAL_MEDIA_PRESETS[platform].width,
      height: SOCIAL_MEDIA_PRESETS[platform].height,
      format: SOCIAL_MEDIA_PRESETS[platform].format,
    });
  } catch (error) {
    console.error(`Social media export failed for ${platform}:`, error);
  }
}

/**
 * Example 4: Batch Export All Charts
 */
export async function exportAllChartsInReport(reportId: string) {
  try {
    const chartElements = Array.from(
      document.querySelectorAll(`[data-report-id="${reportId}"] [data-chart-id]`)
    ) as HTMLElement[];

    if (chartElements.length === 0) {
      console.warn('No charts found in report');
      return;
    }

    const blobs = await imageExportService.exportAllCharts(chartElements, {
      format: 'png',
      resolution: 2,
    });

    console.log(`Exported ${blobs.length} charts`);

    // Download each chart
    blobs.forEach((blob, index) => {
      downloadImage(blob, `chart-${index + 1}.png`);
    });
  } catch (error) {
    console.error('Batch export failed:', error);
  }
}

/**
 * Example 5: Export with Transparent Background
 */
export async function exportChartTransparent(chartElement: HTMLElement) {
  try {
    const blob = await imageExportService.exportToImage(chartElement, {
      format: 'png',
      resolution: 2,
      transparent: true, // Transparent background
    });

    downloadImage(blob, 'chart-transparent.png');
  } catch (error) {
    console.error('Transparent export failed:', error);
  }
}

// ============================================
// CSV EXPORT EXAMPLES
// ============================================

/**
 * Example 6: Basic CSV Export
 */
export async function exportDataToCSV(data: any[], reportName: string) {
  const result = await csvExportService.export({
    reportName,
    data,
    csvOptions: {
      includeHeaders: true,
      delimiter: DELIMITER_PRESETS.US,
      encoding: 'utf-8-bom',
    },
  });

  if (result.success && result.blob) {
    downloadCsv(result.blob, result.filename);
    console.log(`Exported ${data.length} rows, ${result.fileSize} bytes`);
  } else {
    console.error('CSV export failed:', result.error);
  }
}

/**
 * Example 7: European Format CSV
 */
export async function exportDataEuropeanFormat(data: any[], reportName: string) {
  const result = await csvExportService.export({
    reportName,
    data,
    csvOptions: {
      delimiter: DELIMITER_PRESETS.EU, // Semicolon
      dateFormat: DATE_FORMAT_PRESETS.EU,
      numberFormat: {
        decimals: 2,
        thousandsSeparator: '.', // European: 1.000,50
        decimalSeparator: ',',
        currencySymbol: '€',
      },
      encoding: 'utf-8-bom',
    },
  });

  if (result.success && result.blob) {
    downloadCsv(result.blob, result.filename);
  }
}

/**
 * Example 8: CSV with Metadata Footer
 */
export async function exportDataWithMetadata(
  data: any[],
  reportName: string,
  filters: Record<string, any>
) {
  const result = await csvExportService.export({
    reportName,
    data,
    filters,
    csvOptions: {
      includeHeaders: true,
      includeTimestamp: true,
      includeFilters: true,
      delimiter: ',',
      dateFormat: DATE_FORMAT_PRESETS.ISO_TIME,
    },
  });

  if (result.success && result.blob) {
    downloadCsv(result.blob, result.filename);
  }
}

/**
 * Example 9: Export Selected Columns
 */
export async function exportSelectedColumns(
  data: any[],
  columns: string[],
  reportName: string
) {
  try {
    const result = await csvExportService.exportSelectedColumns(
      data,
      columns,
      reportName,
      {
        includeHeaders: true,
        delimiter: ',',
      }
    );

    if (result.success && result.blob) {
      downloadCsv(result.blob, result.filename);
      console.log(`Exported ${columns.length} columns`);
    }
  } catch (error) {
    console.error('Column export failed:', error);
  }
}

/**
 * Example 10: Export Filtered Rows
 */
export async function exportLargeDonations(donations: any[], threshold: number) {
  try {
    const result = await csvExportService.exportFilteredRows(
      donations,
      (row) => row.amount > threshold,
      'Large Donations',
      {
        numberFormat: {
          decimals: 2,
          thousandsSeparator: ',',
          decimalSeparator: '.',
          currencySymbol: '$',
        },
        includeTimestamp: true,
      }
    );

    if (result.success && result.blob) {
      downloadCsv(result.blob, result.filename);
    }
  } catch (error) {
    console.error('Filtered export failed:', error);
  }
}

/**
 * Example 11: Tab-Delimited Export
 */
export async function exportTabDelimited(data: any[], reportName: string) {
  const result = await csvExportService.export({
    reportName,
    data,
    csvOptions: {
      delimiter: DELIMITER_PRESETS.TAB,
      includeHeaders: true,
      encoding: 'utf-8',
    },
  });

  if (result.success && result.blob) {
    // Save with .tsv extension for tab-separated values
    const filename = result.filename.replace('.csv', '.tsv');
    downloadCsv(result.blob, filename);
  }
}

/**
 * Example 12: Custom Date and Number Formatting
 */
export async function exportWithCustomFormatting(data: any[], reportName: string) {
  const result = await csvExportService.export({
    reportName,
    data,
    csvOptions: {
      dateFormat: 'MMM dd, yyyy hh:mm a', // "Jan 15, 2024 02:30 PM"
      numberFormat: {
        decimals: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
      },
      nullValue: 'N/A',
      includeHeaders: true,
    },
  });

  if (result.success && result.blob) {
    downloadCsv(result.blob, result.filename);
  }
}

// ============================================
// COMBINED EXAMPLES
// ============================================

/**
 * Example 13: Export Report with Both Chart and Data
 */
export async function exportCompleteReport(
  reportName: string,
  chartElement: HTMLElement,
  data: any[]
) {
  try {
    // Export chart as PNG
    const imageResult = await imageExportService.export({
      reportName: `${reportName} Chart`,
      chartElement,
      imageOptions: {
        format: 'png',
        resolution: 2,
      },
    });

    if (imageResult.success && imageResult.blob) {
      downloadImage(imageResult.blob, imageResult.filename);
    }

    // Export data as CSV
    const csvResult = await csvExportService.export({
      reportName: `${reportName} Data`,
      data,
      csvOptions: {
        includeHeaders: true,
        includeTimestamp: true,
      },
    });

    if (csvResult.success && csvResult.blob) {
      downloadCsv(csvResult.blob, csvResult.filename);
    }

    console.log('Complete report exported successfully');
  } catch (error) {
    console.error('Complete report export failed:', error);
  }
}

/**
 * Example 14: Export for Multiple Social Media Platforms
 */
export async function exportChartForAllPlatforms(chartElement: HTMLElement) {
  const platforms: (keyof typeof SOCIAL_MEDIA_PRESETS)[] = [
    'twitter',
    'linkedin',
    'instagram',
    'facebook',
  ];

  for (const platform of platforms) {
    try {
      await exportChartForSocialMedia(chartElement, platform);
    } catch (error) {
      console.error(`Failed to export for ${platform}:`, error);
    }
  }
}

/**
 * Example 15: Export with Error Handling and Progress
 */
export async function exportWithProgressTracking(
  data: any[],
  reportName: string,
  onProgress?: (percentage: number) => void
) {
  try {
    onProgress?.(10); // Starting

    const result = await csvExportService.export({
      reportName,
      data,
      csvOptions: {
        includeHeaders: true,
      },
    });

    onProgress?.(90); // Processing complete

    if (result.success && result.blob) {
      downloadCsv(result.blob, result.filename);
      onProgress?.(100); // Download initiated
      return { success: true, filename: result.filename };
    } else {
      throw new Error(result.error || 'Export failed');
    }
  } catch (error) {
    onProgress?.(0); // Reset on error
    console.error('Export with progress failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if element is ready for export
 */
export function isElementReadyForExport(element: HTMLElement | null): boolean {
  if (!element) return false;
  if (element.offsetWidth === 0 || element.offsetHeight === 0) return false;
  return true;
}

/**
 * Get recommended resolution based on use case
 */
export function getRecommendedResolution(useCase: 'web' | 'print' | 'social'): 1 | 2 | 4 {
  switch (useCase) {
    case 'web':
      return 1;
    case 'social':
      return 2;
    case 'print':
      return 4;
    default:
      return 2;
  }
}

/**
 * Get file size estimation
 */
export function estimateFileSize(rowCount: number, columnCount: number): string {
  const bytesPerCell = 20; // Rough average
  const estimatedBytes = rowCount * columnCount * bytesPerCell;

  if (estimatedBytes < 1024) return `${estimatedBytes} B`;
  if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024).toFixed(2)} KB`;
  return `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;
}
