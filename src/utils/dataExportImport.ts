import { format } from 'date-fns';

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  fields?: string[];
  includeHeaders?: boolean;
}

// CSV Export
export function exportToCSV(data: any[], options: Partial<ExportOptions> = {}) {
  const { filename = 'export', fields, includeHeaders = true } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get all fields if not specified
  const exportFields = fields || Object.keys(data[0]);

  // Create CSV content
  let csv = '';

  // Add headers
  if (includeHeaders) {
    csv += exportFields.map(escapeCSVValue).join(',') + '\n';
  }

  // Add rows
  data.forEach((row) => {
    csv += exportFields
      .map((field) => {
        const value = row[field];
        return escapeCSVValue(value);
      })
      .join(',') + '\n';
  });

  // Download file
  downloadFile(csv, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
}

// JSON Export
export function exportToJSON(data: any[], options: Partial<ExportOptions> = {}) {
  const { filename = 'export' } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
}

// Excel Export (simplified - creates CSV with .xlsx extension)
export function exportToExcel(data: any[], options: Partial<ExportOptions> = {}) {
  const { filename = 'export', fields, includeHeaders = true } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // For a real Excel export, you'd use a library like xlsx or exceljs
  // This is a simplified version that creates a tab-separated file
  const exportFields = fields || Object.keys(data[0]);

  let content = '';

  if (includeHeaders) {
    content += exportFields.join('\t') + '\n';
  }

  data.forEach((row) => {
    content += exportFields.map((field) => row[field] || '').join('\t') + '\n';
  });

  downloadFile(content, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

// PDF Export (simplified - would need a PDF library for real implementation)
export function exportToPDF(data: any[], options: Partial<ExportOptions> = {}) {
  const { filename = 'export' } = options;

  // For real PDF export, use libraries like jsPDF or pdfmake
  // This is a placeholder that exports as JSON
  console.warn('PDF export requires additional library. Exporting as JSON instead.');
  exportToJSON(data, { filename });
}

// Helper: Escape CSV values
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Check if value needs quoting
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape double quotes by doubling them
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return stringValue;
}

// Helper: Download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Bulk export with multiple formats
export async function bulkExport(
  data: any[],
  formats: ExportFormat[],
  options: Partial<ExportOptions> = {}
) {
  const promises = formats.map((format) => {
    switch (format) {
      case 'csv':
        return exportToCSV(data, { ...options, format });
      case 'json':
        return exportToJSON(data, { ...options, format });
      case 'xlsx':
        return exportToExcel(data, { ...options, format });
      case 'pdf':
        return exportToPDF(data, { ...options, format });
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  });

  return Promise.all(promises);
}

// Import from CSV
export async function importFromCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length === 0) {
          reject(new Error('No data found in CSV file'));
          return;
        }

        // First row is headers
        const headers = rows[0];
        const data = rows.slice(1).map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Import from JSON
export async function importFromJSON(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        if (!Array.isArray(data)) {
          reject(new Error('JSON file must contain an array'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Parse CSV with proper quote handling
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      currentRow.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        if (currentRow.some((v) => v)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentValue = '';
      }
      // Skip \r\n
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentValue += char;
    }
  }

  // Add last value and row
  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    if (currentRow.some((v) => v)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Generic import handler
export async function importData(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return importFromCSV(file);
    case 'json':
      return importFromJSON(file);
    default:
      throw new Error(`Unsupported file format: ${extension}`);
  }
}

// Validate imported data
export function validateImportedData(
  data: any[],
  requiredFields: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    errors.push('No data found');
    return { valid: false, errors };
  }

  // Check required fields
  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Row ${index + 1}: Missing required field "${field}"`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
}
