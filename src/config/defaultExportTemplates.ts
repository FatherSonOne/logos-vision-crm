/**
 * Default Export Templates
 * Pre-configured templates for common export scenarios
 */

export interface ExportTemplateConfiguration {
  // PDF Configuration
  pdf?: {
    orientation: 'portrait' | 'landscape';
    pageSize: 'letter' | 'a4' | 'legal' | 'tabloid';
    includeCharts: boolean;
    includeFilters: boolean;
    includeSummary: boolean;
    includeMetadata: boolean;
    headerText?: string;
    footerText?: string;
    showPageNumbers: boolean;
    showDate: boolean;
    showBranding: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'color' | 'grayscale';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };

  // Excel Configuration
  excel?: {
    includeMultipleSheets: boolean;
    includeSummarySheet: boolean;
    includeChartsSheet: boolean;
    includeRawDataSheet: boolean;
    includeMetadata: boolean;
    includeFormulas: boolean;
    applyFormatting: boolean;
    freezeHeaders: boolean;
    autoFilter: boolean;
    columnWidthMode: 'auto' | 'fixed' | 'content';
    includeConditionalFormatting: boolean;
    colorScheme: 'default' | 'professional' | 'vibrant';
    numberFormat: string;
    dateFormat: string;
  };

  // CSV Configuration
  csv?: {
    delimiter: ',' | ';' | '\t' | '|';
    encoding: 'utf-8' | 'utf-16' | 'ascii' | 'iso-8859-1';
    includeHeaders: boolean;
    dateFormat: string;
    numberFormat: 'standard' | 'scientific';
    quoteStrings: boolean;
    lineEnding: 'crlf' | 'lf';
    bom: boolean;
  };

  // PNG Configuration
  png?: {
    width: number;
    height: number;
    resolution: 72 | 150 | 300 | 600;
    format: 'png' | 'jpg' | 'webp';
    quality: number; // 1-100
    backgroundColor: string;
    includeCharts: boolean;
    includeFilters: boolean;
    scale: number; // 1-3
    cropToContent: boolean;
  };
}

export interface ExportTemplate {
  id?: string;
  name: string;
  description: string;
  template_type: 'pdf' | 'excel' | 'csv' | 'png';
  configuration: ExportTemplateConfiguration;
  is_public: boolean;
  thumbnail_url?: string;
  usage_count?: number;
}

// Default Templates
export const DEFAULT_EXPORT_TEMPLATES: ExportTemplate[] = [
  // PDF Templates
  {
    name: 'Professional PDF',
    description: 'Portrait layout with branding and full details for professional reports',
    template_type: 'pdf',
    is_public: true,
    configuration: {
      pdf: {
        orientation: 'portrait',
        pageSize: 'letter',
        includeCharts: true,
        includeFilters: true,
        includeSummary: true,
        includeMetadata: true,
        headerText: 'Logos Vision CRM Report',
        footerText: 'Confidential',
        showPageNumbers: true,
        showDate: true,
        showBranding: true,
        fontSize: 'medium',
        colorScheme: 'color',
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
      },
    },
  },
  {
    name: 'Presentation PDF',
    description: 'Landscape layout with large fonts, perfect for presentations and displays',
    template_type: 'pdf',
    is_public: true,
    configuration: {
      pdf: {
        orientation: 'landscape',
        pageSize: 'letter',
        includeCharts: true,
        includeFilters: false,
        includeSummary: true,
        includeMetadata: false,
        showPageNumbers: false,
        showDate: false,
        showBranding: true,
        fontSize: 'large',
        colorScheme: 'color',
        margins: {
          top: 15,
          right: 15,
          bottom: 15,
          left: 15,
        },
      },
    },
  },
  {
    name: 'Compact PDF',
    description: 'Minimal layout for quick reports without charts or extras',
    template_type: 'pdf',
    is_public: true,
    configuration: {
      pdf: {
        orientation: 'portrait',
        pageSize: 'a4',
        includeCharts: false,
        includeFilters: false,
        includeSummary: false,
        includeMetadata: false,
        showPageNumbers: true,
        showDate: true,
        showBranding: false,
        fontSize: 'small',
        colorScheme: 'grayscale',
        margins: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        },
      },
    },
  },

  // Excel Templates
  {
    name: 'Detailed Excel Workbook',
    description: 'Complete workbook with multiple sheets, formulas, and formatting',
    template_type: 'excel',
    is_public: true,
    configuration: {
      excel: {
        includeMultipleSheets: true,
        includeSummarySheet: true,
        includeChartsSheet: true,
        includeRawDataSheet: true,
        includeMetadata: true,
        includeFormulas: true,
        applyFormatting: true,
        freezeHeaders: true,
        autoFilter: true,
        columnWidthMode: 'auto',
        includeConditionalFormatting: true,
        colorScheme: 'professional',
        numberFormat: '#,##0.00',
        dateFormat: 'yyyy-mm-dd',
      },
    },
  },
  {
    name: 'Simple Excel Export',
    description: 'Single sheet with basic data and minimal formatting',
    template_type: 'excel',
    is_public: true,
    configuration: {
      excel: {
        includeMultipleSheets: false,
        includeSummarySheet: false,
        includeChartsSheet: false,
        includeRawDataSheet: true,
        includeMetadata: false,
        includeFormulas: false,
        applyFormatting: false,
        freezeHeaders: true,
        autoFilter: true,
        columnWidthMode: 'content',
        includeConditionalFormatting: false,
        colorScheme: 'default',
        numberFormat: '0.00',
        dateFormat: 'mm/dd/yyyy',
      },
    },
  },
  {
    name: 'Analysis Excel',
    description: 'Optimized for data analysis with formulas and conditional formatting',
    template_type: 'excel',
    is_public: true,
    configuration: {
      excel: {
        includeMultipleSheets: true,
        includeSummarySheet: true,
        includeChartsSheet: false,
        includeRawDataSheet: true,
        includeMetadata: true,
        includeFormulas: true,
        applyFormatting: true,
        freezeHeaders: true,
        autoFilter: true,
        columnWidthMode: 'auto',
        includeConditionalFormatting: true,
        colorScheme: 'vibrant',
        numberFormat: '#,##0.00',
        dateFormat: 'yyyy-mm-dd',
      },
    },
  },

  // CSV Templates
  {
    name: 'Standard CSV',
    description: 'UTF-8 encoded CSV with comma delimiter for universal compatibility',
    template_type: 'csv',
    is_public: true,
    configuration: {
      csv: {
        delimiter: ',',
        encoding: 'utf-8',
        includeHeaders: true,
        dateFormat: 'yyyy-MM-dd',
        numberFormat: 'standard',
        quoteStrings: true,
        lineEnding: 'crlf',
        bom: true,
      },
    },
  },
  {
    name: 'European CSV',
    description: 'Semicolon delimiter and European date format',
    template_type: 'csv',
    is_public: true,
    configuration: {
      csv: {
        delimiter: ';',
        encoding: 'utf-8',
        includeHeaders: true,
        dateFormat: 'dd/MM/yyyy',
        numberFormat: 'standard',
        quoteStrings: true,
        lineEnding: 'crlf',
        bom: true,
      },
    },
  },
  {
    name: 'Tab-Delimited',
    description: 'Tab-separated values for importing into databases',
    template_type: 'csv',
    is_public: true,
    configuration: {
      csv: {
        delimiter: '\t',
        encoding: 'utf-8',
        includeHeaders: true,
        dateFormat: 'yyyy-MM-dd',
        numberFormat: 'standard',
        quoteStrings: false,
        lineEnding: 'lf',
        bom: false,
      },
    },
  },

  // PNG Templates
  {
    name: 'High-Resolution Print',
    description: '300 DPI PNG for printing and high-quality documents',
    template_type: 'png',
    is_public: true,
    configuration: {
      png: {
        width: 3300,
        height: 2550,
        resolution: 300,
        format: 'png',
        quality: 95,
        backgroundColor: '#ffffff',
        includeCharts: true,
        includeFilters: true,
        scale: 2,
        cropToContent: false,
      },
    },
  },
  {
    name: 'Screen Resolution',
    description: 'Standard 1920x1080 for presentations and displays',
    template_type: 'png',
    is_public: true,
    configuration: {
      png: {
        width: 1920,
        height: 1080,
        resolution: 72,
        format: 'png',
        quality: 90,
        backgroundColor: '#ffffff',
        includeCharts: true,
        includeFilters: false,
        scale: 1,
        cropToContent: true,
      },
    },
  },
  {
    name: 'Social Media',
    description: 'Optimized dimensions for social media sharing (1200x630)',
    template_type: 'png',
    is_public: true,
    configuration: {
      png: {
        width: 1200,
        height: 630,
        resolution: 72,
        format: 'jpg',
        quality: 85,
        backgroundColor: '#ffffff',
        includeCharts: true,
        includeFilters: false,
        scale: 1,
        cropToContent: true,
      },
    },
  },
  {
    name: 'Email Attachment',
    description: 'Compressed JPEG for email sharing with small file size',
    template_type: 'png',
    is_public: true,
    configuration: {
      png: {
        width: 1280,
        height: 720,
        resolution: 72,
        format: 'jpg',
        quality: 75,
        backgroundColor: '#ffffff',
        includeCharts: true,
        includeFilters: false,
        scale: 1,
        cropToContent: true,
      },
    },
  },
];

// Helper function to get templates by type
export function getTemplatesByType(type: 'pdf' | 'excel' | 'csv' | 'png'): ExportTemplate[] {
  return DEFAULT_EXPORT_TEMPLATES.filter((template) => template.template_type === type);
}

// Helper function to get template by name
export function getTemplateByName(name: string): ExportTemplate | undefined {
  return DEFAULT_EXPORT_TEMPLATES.find((template) => template.name === name);
}

// Export format display names
export const EXPORT_FORMAT_NAMES = {
  pdf: 'PDF Document',
  excel: 'Excel Workbook',
  csv: 'CSV File',
  png: 'Image',
};

// Export format icons
export const EXPORT_FORMAT_ICONS = {
  pdf: 'FileText',
  excel: 'Table',
  csv: 'FileSpreadsheet',
  png: 'Image',
};
