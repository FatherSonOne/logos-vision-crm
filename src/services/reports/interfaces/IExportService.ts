/**
 * Export Service Interface
 *
 * Defines the contract for all export service implementations.
 * Supports client-side and commercial export solutions (PDFtron, Syncfusion, etc.)
 *
 * @architecture Modular abstraction layer supporting multiple export backends
 * @usage Implement this interface for PDF, Excel, CSV, and Image exports
 */

// ============================================
// EXPORT FORMATS
// ============================================

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'png' | 'jpeg' | 'svg' | 'webp';
export type ExportQuality = 'low' | 'medium' | 'high' | 'print';
export type PageOrientation = 'portrait' | 'landscape';
export type PageSize = 'letter' | 'legal' | 'a4' | 'a3' | 'tabloid' | 'custom';
export type ExcelFormat = 'xlsx' | 'xls' | 'csv';
export type ImageFormat = 'png' | 'jpeg' | 'svg' | 'webp';

// ============================================
// EXPORT OPTIONS
// ============================================

/**
 * Base export options shared across all formats
 */
export interface BaseExportOptions {
  /** Output filename without extension */
  filename: string;
  /** Whether to automatically download the file */
  autoDownload?: boolean;
  /** Custom metadata to include in the export */
  metadata?: Record<string, any>;
  /** User ID for audit trail */
  userId?: string;
  /** Report ID being exported */
  reportId?: string;
}

/**
 * PDF export configuration
 */
export interface PDFExportOptions extends BaseExportOptions {
  /** Page orientation */
  orientation?: PageOrientation;
  /** Page size */
  pageSize?: PageSize;
  /** Custom page dimensions (when pageSize is 'custom') */
  customPageSize?: { width: number; height: number };
  /** Page margins in points (1/72 inch) */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Include header on each page */
  includeHeader?: boolean;
  /** Include footer on each page */
  includeFooter?: boolean;
  /** Header text or HTML */
  headerContent?: string;
  /** Footer text or HTML */
  footerContent?: string;
  /** Include page numbers */
  includePageNumbers?: boolean;
  /** Page number format (e.g., "Page {page} of {total}") */
  pageNumberFormat?: string;
  /** Include table of contents */
  includeTOC?: boolean;
  /** Enable PDF/A compliance */
  pdfACompliant?: boolean;
  /** Enable security/encryption */
  encrypt?: boolean;
  /** User password for opening PDF */
  userPassword?: string;
  /** Owner password for permissions */
  ownerPassword?: string;
  /** Permissions for encrypted PDFs */
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
  /** Quality setting for embedded images */
  imageQuality?: ExportQuality;
  /** Compress images */
  compressImages?: boolean;
  /** Embed fonts */
  embedFonts?: boolean;
  /** Font subset to reduce file size */
  subsetFonts?: boolean;
  /** Include report metadata */
  includeMetadata?: boolean;
  /** Include report filters in header */
  includeFilters?: boolean;
  /** Include timestamp in footer */
  includeTimestamp?: boolean;
  /** Include charts in the export */
  includeCharts?: boolean;
}

/**
 * Excel export configuration
 */
export interface ExcelExportOptions extends BaseExportOptions {
  /** Excel format (xlsx recommended) */
  format?: ExcelFormat;
  /** Worksheet name */
  sheetName?: string;
  /** Include multiple sheets */
  multiSheet?: boolean;
  /** Sheet configurations for multi-sheet exports */
  sheets?: Array<{
    name: string;
    data: any[];
    columns?: string[];
  }>;
  /** Include header row */
  includeHeader?: boolean;
  /** Include filters in Excel */
  includeFilters?: boolean;
  /** Auto-size columns */
  autoSizeColumns?: boolean;
  /** Freeze header row */
  freezeHeader?: boolean;
  /** Freeze first N columns */
  freezeColumns?: number;
  /** Apply table formatting */
  formatAsTable?: boolean;
  /** Table style name (e.g., "TableStyleMedium2") */
  tableStyle?: string;
  /** Include charts */
  includeCharts?: boolean;
  /** Chart configurations */
  charts?: Array<{
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
    title: string;
    dataRange: string;
    position?: { row: number; col: number };
  }>;
  /** Include formulas */
  includeFormulas?: boolean;
  /** Column width map */
  columnWidths?: Record<string, number>;
  /** Cell formatting */
  cellFormatting?: {
    headerStyle?: ExcelCellStyle;
    dataStyle?: ExcelCellStyle;
    totalsStyle?: ExcelCellStyle;
  };
  /** Include totals row */
  includeTotals?: boolean;
  /** Columns to total */
  totalColumns?: string[];
  /** Password protect workbook */
  password?: string;
  /** Include metadata sheet */
  includeMetadataSheet?: boolean;
  /** Include timestamp */
  includeTimestamp?: boolean;
}

/**
 * Excel cell style definition
 */
export interface ExcelCellStyle {
  font?: {
    name?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
    color?: string;
  };
  fill?: {
    type?: 'solid' | 'pattern';
    color?: string;
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
    wrapText?: boolean;
  };
  border?: {
    top?: { style: string; color?: string };
    right?: { style: string; color?: string };
    bottom?: { style: string; color?: string };
    left?: { style: string; color?: string };
  };
  numberFormat?: string;
}

/**
 * CSV export configuration
 */
export interface CSVExportOptions extends BaseExportOptions {
  /** Field delimiter */
  delimiter?: ',' | ';' | '\t' | '|';
  /** Line ending */
  lineEnding?: '\n' | '\r\n';
  /** Quote character */
  quoteChar?: '"' | "'";
  /** Escape character */
  escapeChar?: '\\';
  /** Include header row */
  includeHeader?: boolean;
  /** Include BOM for UTF-8 */
  includeBOM?: boolean;
  /** Encoding */
  encoding?: 'utf-8' | 'utf-16' | 'iso-8859-1' | 'utf-8-bom';
  /** Columns to export (null = all) */
  columns?: string[] | null;
  /** Column name mapping */
  columnMapping?: Record<string, string>;
  /** Date format */
  dateFormat?: string;
  /** Number format */
  numberFormat?: {
    decimalSeparator?: '.' | ',';
    thousandsSeparator?: ',' | '.' | ' ' | '';
    decimals?: number;
    currencySymbol?: string;
  };
  /** Handle null/undefined values */
  nullValue?: string;
  /** Include filters */
  includeFilters?: boolean;
  /** Include timestamp */
  includeTimestamp?: boolean;
}

/**
 * Image export configuration
 */
export interface ImageExportOptions extends BaseExportOptions {
  /** Image format */
  format?: ImageFormat;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Scale factor (1 = 100%, 2 = 200%, etc.) */
  scale?: number;
  /** Resolution scaling (1x = standard, 2x = retina, 4x = print quality) */
  resolution?: 1 | 2 | 4;
  /** Quality (0-100 for JPEG) or (0.0-1.0) */
  quality?: number;
  /** Background color (transparent for PNG) */
  backgroundColor?: string;
  /** Enable transparent background (PNG only) */
  transparent?: boolean;
  /** DPI for print quality */
  dpi?: number;
  /** Include chart only (no header/footer) */
  chartOnly?: boolean;
  /** DOM element selector to export */
  selector?: string;
}

/**
 * Social media preset configuration
 */
export interface SocialMediaPreset {
  name: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  width: number;
  height: number;
  format: 'png' | 'jpeg';
  quality?: number;
}

/**
 * Standard social media presets
 */
export const SOCIAL_MEDIA_PRESETS: Record<string, SocialMediaPreset> = {
  twitter: {
    name: 'twitter',
    width: 1200,
    height: 675,
    format: 'png',
  },
  linkedin: {
    name: 'linkedin',
    width: 1200,
    height: 627,
    format: 'png',
  },
  instagram: {
    name: 'instagram',
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 0.9,
  },
  facebook: {
    name: 'facebook',
    width: 1200,
    height: 630,
    format: 'png',
  },
};

// ============================================
// EXPORT REQUEST
// ============================================

/**
 * Complete export request with data and options
 */
export interface ExportRequest {
  /** Export format */
  format: ExportFormat;
  /** Data to export */
  data: any;
  /** Report metadata */
  reportMetadata?: {
    id?: string;
    name?: string;
    description?: string;
    category?: string;
    visualizationType?: string;
    filters?: Record<string, any>;
  };
  /** Format-specific options */
  options: PDFExportOptions | ExcelExportOptions | CSVExportOptions | ImageExportOptions;
}

// ============================================
// EXPORT RESULT
// ============================================

/**
 * Result of an export operation
 */
export interface ExportResult {
  /** Operation success */
  success: boolean;
  /** Blob data (for download) */
  blob?: Blob;
  /** Data URL (for preview) */
  dataUrl?: string;
  /** File size in bytes */
  fileSize?: number;
  /** MIME type */
  mimeType?: string;
  /** Error message if failed */
  error?: string;
  /** Metadata about the export */
  metadata: ExportServiceMetadata;
}

/**
 * Metadata about the export service and operation
 */
export interface ExportServiceMetadata {
  /** Service that performed the export */
  serviceName: string;
  /** Service type (client-side vs commercial) */
  serviceType: 'client-side' | 'commercial';
  /** Export format used */
  format: ExportFormat;
  /** Timestamp of export */
  timestamp: string;
  /** Number of rows exported */
  rowCount?: number;
  /** Processing time in milliseconds */
  processingTime?: number;
  /** File size in bytes */
  fileSize?: number;
  /** User who initiated export */
  userId?: string;
  /** Report ID */
  reportId?: string;
  /** Service version */
  version?: string;
  /** Supported formats */
  supportedFormats?: string[];
  /** Maximum data size */
  maxDataSize?: number;
  /** Requires server-side processing */
  requiresServerSide?: boolean;
  /** Additional metadata */
  additionalMetadata?: Record<string, any>;
}

// ============================================
// EXPORT SERVICE INTERFACE
// ============================================

/**
 * Export service interface
 *
 * All export service implementations must implement this interface.
 * Supports both client-side (jsPDF, xlsx) and commercial (PDFtron, Syncfusion) solutions.
 */
export interface IExportService {
  /**
   * Service identifier
   */
  readonly serviceName: string;

  /**
   * Service type
   */
  readonly serviceType: 'client-side' | 'commercial';

  /**
   * Supported export formats
   */
  readonly supportedFormats: ExportFormat[];

  /**
   * Export data to PDF
   *
   * @param data - Report data to export
   * @param options - PDF export options
   * @returns Promise resolving to export result
   */
  exportToPDF(data: any, options: PDFExportOptions): Promise<ExportResult>;

  /**
   * Export data to Excel
   *
   * @param data - Report data to export
   * @param options - Excel export options
   * @returns Promise resolving to export result
   */
  exportToExcel(data: any, options: ExcelExportOptions): Promise<ExportResult>;

  /**
   * Export data to CSV
   *
   * @param data - Report data to export
   * @param options - CSV export options
   * @returns Promise resolving to export result
   */
  exportToCSV(data: any, options: CSVExportOptions): Promise<ExportResult>;

  /**
   * Export visualization to image
   *
   * @param element - DOM element or selector
   * @param options - Image export options
   * @returns Promise resolving to export result
   */
  exportToImage(element: HTMLElement | string, options: ImageExportOptions): Promise<ExportResult>;

  /**
   * Validate export request
   *
   * @param request - Export request to validate
   * @returns Validation result with errors if any
   */
  validateRequest(request: ExportRequest): { valid: boolean; errors?: string[] };

  /**
   * Get service capabilities and limits
   *
   * @returns Service capabilities
   */
  getCapabilities(): ExportServiceCapabilities;
}

/**
 * Export service capabilities and limits
 */
export interface ExportServiceCapabilities {
  /** Service name */
  serviceName: string;
  /** Service type */
  serviceType: 'client-side' | 'commercial';
  /** Maximum rows per export */
  maxRows: number;
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Supported features */
  features: {
    multiSheet?: boolean;
    charts?: boolean;
    formulas?: boolean;
    encryption?: boolean;
    compression?: boolean;
    watermarks?: boolean;
    digitalSignatures?: boolean;
  };
  /** Performance characteristics */
  performance?: {
    avgTimePerRow?: number; // milliseconds
    recommendedMaxRows?: number;
  };
}

// ============================================
// EXPORT STRATEGY
// ============================================

/**
 * Export complexity level for strategy selection
 */
export type ExportComplexity = 'simple' | 'moderate' | 'complex' | 'enterprise';

/**
 * Export size category
 */
export type ExportSizeCategory = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Export strategy metadata for router
 */
export interface ExportStrategyMetadata {
  /** Estimated row count */
  rowCount: number;
  /** Export complexity */
  complexity: ExportComplexity;
  /** Size category */
  sizeCategory: ExportSizeCategory;
  /** Required features */
  requiredFeatures?: string[];
  /** Format being exported */
  format: ExportFormat;
}
