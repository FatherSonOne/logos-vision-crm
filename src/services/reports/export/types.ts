// ============================================
// EXPORT TYPES
// ============================================

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png';

export interface ExportOptions {
  reportName: string;
  data: any[];
  chartElement?: HTMLElement | null;
  filters?: Record<string, any>;
  timestamp?: Date;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  fileSize?: number;
  error?: string;
}

export interface IExportService {
  export(options: ExportOptions): Promise<ExportResult>;
  getSupportedFormat(): ExportFormat;
}
