/**
 * Export Service Interface
 * Defines the contract for different export formats (PDF, Excel, CSV)
 */

export interface ExportOptions {
  title: string;
  description?: string;
  includeCharts?: boolean;
  includeFilters?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
  fileName?: string;
}

export interface ChartOptions {
  element: HTMLElement;
  title: string;
  width?: number;
  height?: number;
  resolution?: number; // Scale factor for high-res capture (default: 2)
}

export interface FilterOption {
  label: string;
  value: string | string[] | Date | null;
}

export interface IExportService {
  /**
   * Export data to PDF format
   * @param data - Array of data objects to export
   * @param options - Export configuration options
   * @param charts - Optional array of chart elements to include
   * @param filters - Optional array of active filters to display
   */
  exportToPDF(
    data: any[],
    options: ExportOptions,
    charts?: ChartOptions[],
    filters?: FilterOption[]
  ): Promise<void>;

  /**
   * Export data to Excel format
   * @param data - Array of data objects to export
   * @param options - Export configuration options
   */
  exportToExcel(data: any[], options: ExportOptions): Promise<void>;

  /**
   * Export data to CSV format
   * @param data - Array of data objects to export
   * @param options - Export configuration options
   */
  exportToCSV(data: any[], options: ExportOptions): Promise<void>;
}
