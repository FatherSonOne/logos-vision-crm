/**
 * Test utilities and mock data generators for export service testing
 */

export interface MockContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  value: number;
  created_at: string;
  category: string;
}

export interface MockChartData {
  name: string;
  value: number;
  percentage?: number;
}

/**
 * Generate mock contact data for testing
 */
export function generateMockContacts(count: number): MockContact[] {
  const statuses = ['active', 'inactive', 'pending', 'archived'];
  const categories = ['prospect', 'customer', 'partner', 'vendor'];
  const companies = ['Acme Corp', 'TechStart', 'Global Solutions', 'Innovation Labs', 'Digital Dynamics'];

  return Array.from({ length: count }, (_, i) => ({
    id: `contact-${i + 1}`,
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@example.com`,
    phone: `+1-555-${String(i + 1).padStart(4, '0')}`,
    company: companies[i % companies.length],
    status: statuses[i % statuses.length],
    value: Math.floor(Math.random() * 100000) + 1000,
    created_at: new Date(2024, 0, 1 + (i % 365)).toISOString(),
    category: categories[i % categories.length],
  }));
}

/**
 * Generate mock chart data for testing
 */
export function generateMockChartData(count: number): MockChartData[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000) + 100,
    percentage: Math.random() * 100,
  }));
}

/**
 * Create a mock chart element for testing
 */
export function createMockChartElement(): HTMLElement {
  const div = document.createElement('div');
  div.id = 'mock-chart';
  div.style.width = '800px';
  div.style.height = '600px';

  // Add SVG content to simulate a real chart
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', '800');
  rect.setAttribute('height', '600');
  rect.setAttribute('fill', '#ffffff');
  svg.appendChild(rect);

  div.appendChild(svg);
  document.body.appendChild(div);

  return div;
}

/**
 * Clean up mock chart elements
 */
export function cleanupMockChartElement(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Measure test execution time
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Create mock blob for testing
 */
export function createMockBlob(content: string, type: string): Blob {
  return new Blob([content], { type });
}

/**
 * Validate CSV format
 */
export function validateCsvFormat(csv: string): {
  valid: boolean;
  rowCount: number;
  columnCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const lines = csv.trim().split('\n');

  if (lines.length === 0) {
    errors.push('CSV is empty');
    return { valid: false, rowCount: 0, columnCount: 0, errors };
  }

  const columnCount = lines[0].split(',').length;

  lines.forEach((line, index) => {
    const columns = line.split(',');
    if (columns.length !== columnCount) {
      errors.push(`Row ${index + 1} has ${columns.length} columns, expected ${columnCount}`);
    }
  });

  return {
    valid: errors.length === 0,
    rowCount: lines.length,
    columnCount,
    errors,
  };
}

/**
 * Mock jsPDF for testing
 */
export class MockJsPDF {
  public pages: any[] = [];
  public currentPage: any = {};
  public options: any = {};

  constructor(options?: any) {
    this.options = options || {};
    this.pages.push({});
  }

  addPage() {
    this.currentPage = {};
    this.pages.push(this.currentPage);
    return this;
  }

  setFontSize(size: number) {
    this.currentPage.fontSize = size;
    return this;
  }

  setFont(font: string, style?: string) {
    this.currentPage.font = { name: font, style };
    return this;
  }

  text(text: string, x: number, y: number) {
    if (!this.currentPage.texts) this.currentPage.texts = [];
    this.currentPage.texts.push({ text, x, y });
    return this;
  }

  addImage(image: any, format: string, x: number, y: number, width: number, height: number) {
    if (!this.currentPage.images) this.currentPage.images = [];
    this.currentPage.images.push({ image, format, x, y, width, height });
    return this;
  }

  save(filename: string) {
    this.currentPage.savedAs = filename;
    return this;
  }

  output(type: string) {
    if (type === 'blob') {
      return createMockBlob('mock-pdf-content', 'application/pdf');
    }
    return 'mock-pdf-output';
  }

  internal = {
    pageSize: {
      getWidth: () => 210,
      getHeight: () => 297,
    },
  };
}

/**
 * Mock XLSX for testing
 */
export const mockXLSX = {
  utils: {
    book_new: jest.fn(() => ({ Sheets: {}, SheetNames: [] })),
    json_to_sheet: jest.fn((data) => ({ data, '!ref': 'A1:Z100' })),
    book_append_sheet: jest.fn((workbook, sheet, name) => {
      workbook.Sheets[name] = sheet;
      workbook.SheetNames.push(name);
    }),
    sheet_add_aoa: jest.fn(),
  },
  write: jest.fn(() => new ArrayBuffer(100)),
  writeFile: jest.fn(),
};

/**
 * Mock html2canvas for testing
 */
export const mockHtml2Canvas = jest.fn(async (element: HTMLElement, options?: any) => {
  const canvas = document.createElement('canvas');
  canvas.width = options?.width || 800;
  canvas.height = options?.height || 600;
  return canvas;
});

/**
 * Performance benchmark helper
 */
export class PerformanceBenchmark {
  private measurements: Map<string, number[]> = new Map();

  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    return result;
  }

  getStats(name: string): {
    min: number;
    max: number;
    avg: number;
    median: number;
    count: number;
  } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      median: sorted[Math.floor(sorted.length / 2)],
      count: sorted.length,
    };
  }

  clear() {
    this.measurements.clear();
  }

  report(): string {
    const lines = ['Performance Benchmark Report', '='.repeat(50)];

    this.measurements.forEach((measurements, name) => {
      const stats = this.getStats(name);
      if (stats) {
        lines.push(`\n${name}:`);
        lines.push(`  Count: ${stats.count}`);
        lines.push(`  Min: ${stats.min.toFixed(2)}ms`);
        lines.push(`  Max: ${stats.max.toFixed(2)}ms`);
        lines.push(`  Avg: ${stats.avg.toFixed(2)}ms`);
        lines.push(`  Median: ${stats.median.toFixed(2)}ms`);
      }
    });

    return lines.join('\n');
  }
}
