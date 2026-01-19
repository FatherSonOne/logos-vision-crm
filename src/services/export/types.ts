/**
 * Type definitions for export services
 */

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png' | 'jpeg' | 'webp';

export interface ExportConfig {
  data: any[];
  filename: string;
  format?: ExportFormat;

  // Common options
  chartElement?: HTMLElement;
  chartType?: string;
  chartResolution?: 'low' | 'medium' | 'high';

  // PDF-specific
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
  rowsPerPage?: number;
  includePageNumbers?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeFilterSummary?: boolean;
  includeTableOfContents?: boolean;
  title?: string;
  metadata?: Record<string, any>;
  branding?: {
    companyName?: string;
    logoUrl?: string;
  };
  appliedFilters?: Record<string, any>;
  fontFamily?: string;
  fontSize?: {
    title?: number;
    header?: number;
    body?: number;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    header?: string;
    headerBackground?: string;
  };
  includeSummaryStats?: boolean;
  sections?: Array<{
    title: string;
    data: any[];
  }>;

  // Excel-specific
  sheets?: Array<{
    name: string;
    data: any[];
  }>;
  includeSummarySheet?: boolean;
  includeMetadataSheet?: boolean;
  styling?: {
    headerStyle?: any;
    alternatingRows?: boolean;
    evenRowColor?: string;
    oddRowColor?: string;
  };
  conditionalFormatting?: any[];
  freezeHeader?: boolean;
  autoSizeColumns?: boolean;
  includeFormulas?: boolean;
  formulas?: {
    sum?: string[];
    average?: string[];
    min?: string[];
    max?: string[];
    count?: string[];
  };
  customFormulas?: Array<{
    cell: string;
    formula: string;
  }>;
  columnFormats?: Record<string, any>;
  nullValue?: string;
  summaryStats?: string[];
  summaryColumns?: string[];
  groupBy?: string[];
  columnHeaders?: Record<string, string>;
  dataValidation?: Record<string, any>;
  comments?: Array<{
    cell: string;
    text: string;
  }>;
  hyperlinks?: Record<string, any>;

  // Image-specific
  resolution?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  quality?: number;
  compressionType?: 'lossy' | 'lossless';
  preset?: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'instagram-story';
  batchExport?: Array<{
    chartElement: HTMLElement;
    filename: string;
    format?: ExportFormat;
  }>;
  continueOnError?: boolean;
  watermark?: {
    text: string;
    position: string;
    opacity: number;
  };
  cropRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  filters?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
  includeMetadata?: boolean;
  pixelRatio?: number;

  // CSV-specific
  includeHeaders?: boolean;
  delimiter?: string;
  dateFormat?: string;
  numberFormat?: Record<string, any>;
  columns?: string[];
  includeBOM?: boolean;
  lineEnding?: string;
  quoteChar?: string;
  escapeChar?: string;
  trimWhitespace?: boolean;

  // Router-specific
  complexity?: 'simple' | 'moderate' | 'complex';
  includeReport?: boolean;
  requireData?: boolean;
  sanitizeFilename?: boolean;
  formats?: ExportFormat[];
  useFallback?: boolean;
}

export interface ExportStrategy {
  canHandle(config: ExportConfig): boolean;
  execute(config: ExportConfig): Promise<any>;
  priority: number;
}

export interface ExportService {
  export(config: ExportConfig): Promise<any>;
}
