/**
 * Comprehensive test suite for CSV Export Service
 * Tests CSV generation with proper escaping, formatting, and edge case handling
 */

import {
  generateMockContacts,
  measureExecutionTime,
  PerformanceBenchmark,
  validateCsvFormat,
} from './testUtils';

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Import after mocks
import { CsvExportService } from '../../../services/export/CsvExportService';
import type { ExportConfig } from '../../../services/export/types';

describe('CsvExportService', () => {
  let service: CsvExportService;
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    service = new CsvExportService();
    benchmark = new PerformanceBenchmark();
  });

  afterEach(() => {
    jest.clearAllMocks();
    benchmark.clear();
  });

  describe('Basic CSV Generation', () => {
    it('should generate CSV with default settings', async () => {
      const data = generateMockContacts(10);
      const config: ExportConfig = {
        data,
        filename: 'test-export',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toBeDefined();
      const validation = validateCsvFormat(result as string);
      expect(validation.valid).toBe(true);
      expect(validation.rowCount).toBe(11); // 10 data rows + 1 header row
    });

    it('should include headers by default', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'with-headers',
        format: 'csv',
      };

      const result = await service.export(config);
      const lines = (result as string).split('\n');

      expect(lines[0]).toContain('id');
      expect(lines[0]).toContain('name');
      expect(lines[0]).toContain('email');
    });

    it('should generate CSV without headers when specified', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'no-headers',
        format: 'csv',
        includeHeaders: false,
      };

      const result = await service.export(config);
      const lines = (result as string).split('\n');

      expect(lines[0]).not.toContain('id');
      expect(lines[0]).not.toContain('name');
      expect(lines[0]).toMatch(/^contact-/); // Should start with data
    });

    it('should handle empty dataset', async () => {
      const config: ExportConfig = {
        data: [],
        filename: 'empty-export',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toBeDefined();
      expect(result).toBe(''); // Empty CSV
    });

    it('should handle single row', async () => {
      const data = generateMockContacts(1);
      const config: ExportConfig = {
        data,
        filename: 'single-row',
        format: 'csv',
      };

      const result = await service.export(config);
      const lines = (result as string).split('\n');

      expect(lines.length).toBe(2); // Header + 1 data row
    });
  });

  describe('Delimiter Options', () => {
    it('should use comma as default delimiter', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'comma-delimited',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain(',');
    });

    it('should support semicolon delimiter', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'semicolon-delimited',
        format: 'csv',
        delimiter: ';',
      };

      const result = await service.export(config);

      expect(result).toContain(';');
      expect(result).not.toMatch(/,(?![^"]*")/); // No unquoted commas
    });

    it('should support tab delimiter', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'tab-delimited',
        format: 'csv',
        delimiter: '\t',
      };

      const result = await service.export(config);

      expect(result).toContain('\t');
    });

    it('should support pipe delimiter', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'pipe-delimited',
        format: 'csv',
        delimiter: '|',
      };

      const result = await service.export(config);

      expect(result).toContain('|');
    });
  });

  describe('Special Character Handling', () => {
    it('should escape fields containing delimiter', async () => {
      const data = [
        { name: 'Smith, John', email: 'john@example.com', company: 'Acme Corp' },
        { name: 'Doe, Jane', email: 'jane@example.com', company: 'Tech Inc' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'escaped-commas',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('"Smith, John"');
      expect(result).toContain('"Doe, Jane"');
    });

    it('should escape fields containing double quotes', async () => {
      const data = [
        { name: 'John "The Boss" Smith', email: 'john@example.com' },
        { name: 'Jane "CEO" Doe', email: 'jane@example.com' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'escaped-quotes',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('John ""The Boss"" Smith');
      expect(result).toContain('Jane ""CEO"" Doe');
    });

    it('should escape fields containing newlines', async () => {
      const data = [
        { name: 'John Smith', notes: 'Line 1\nLine 2\nLine 3' },
        { name: 'Jane Doe', notes: 'Single line' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'escaped-newlines',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('"Line 1\nLine 2\nLine 3"');
    });

    it('should handle fields with multiple special characters', async () => {
      const data = [
        {
          name: 'Smith, "John" Jr.',
          address: '123 Main St.\nApt 4B',
          notes: 'VIP client, requires special handling',
        },
      ];
      const config: ExportConfig = {
        data,
        filename: 'complex-escaping',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('"Smith, ""John"" Jr."');
      expect(result).toContain('"123 Main St.\nApt 4B"');
    });

    it('should handle unicode characters', async () => {
      const data = [
        { name: 'José García', company: 'Müller GmbH', notes: '中文测试' },
        { name: 'François Lefèvre', company: 'Société Générale', notes: 'Здравствуй' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'unicode',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('José García');
      expect(result).toContain('Müller GmbH');
      expect(result).toContain('中文测试');
      expect(result).toContain('Здравствуй');
    });

    it('should handle emoji characters', async () => {
      const data = [
        { name: 'John Smith', status: '✅ Active', notes: '🎉 New client!' },
        { name: 'Jane Doe', status: '⏸️ Pending', notes: '📞 Call back' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'emoji',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('✅');
      expect(result).toContain('🎉');
      expect(result).toContain('📞');
    });
  });

  describe('Null and Undefined Handling', () => {
    it('should handle null values with default replacement', async () => {
      const data = [
        { name: 'John Smith', email: null, phone: '555-0001' },
        { name: 'Jane Doe', email: 'jane@example.com', phone: null },
      ];
      const config: ExportConfig = {
        data,
        filename: 'null-values',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain(',,'); // Empty field for null
    });

    it('should handle undefined values', async () => {
      const data = [
        { name: 'John Smith', email: undefined, phone: '555-0001' },
        { name: 'Jane Doe', email: 'jane@example.com', phone: undefined },
      ];
      const config: ExportConfig = {
        data,
        filename: 'undefined-values',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain(',,'); // Empty field for undefined
    });

    it('should use custom null replacement value', async () => {
      const data = [
        { name: 'John Smith', email: null, phone: '555-0001' },
        { name: 'Jane Doe', email: 'jane@example.com', phone: null },
      ];
      const config: ExportConfig = {
        data,
        filename: 'custom-null',
        format: 'csv',
        nullValue: 'N/A',
      };

      const result = await service.export(config);

      expect(result).toContain('N/A');
    });

    it('should handle mixed null and undefined', async () => {
      const data = [
        { name: 'John', email: null, phone: undefined, company: 'Acme' },
        { name: null, email: undefined, phone: '555-0001', company: null },
      ];
      const config: ExportConfig = {
        data,
        filename: 'mixed-null',
        format: 'csv',
        nullValue: '',
      };

      const result = await service.export(config);
      const validation = validateCsvFormat(result as string);

      expect(validation.valid).toBe(true);
    });
  });

  describe('Date Formatting', () => {
    it('should format dates with default format', async () => {
      const data = [
        { name: 'John', created_at: new Date('2024-01-15T10:30:00Z') },
        { name: 'Jane', created_at: new Date('2024-02-20T15:45:00Z') },
      ];
      const config: ExportConfig = {
        data,
        filename: 'date-default',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('2024-01-15');
      expect(result).toContain('2024-02-20');
    });

    it('should format dates with custom format', async () => {
      const data = [
        { name: 'John', created_at: new Date('2024-01-15') },
        { name: 'Jane', created_at: new Date('2024-02-20') },
      ];
      const config: ExportConfig = {
        data,
        filename: 'date-custom',
        format: 'csv',
        dateFormat: 'MM/DD/YYYY',
      };

      const result = await service.export(config);

      expect(result).toMatch(/01\/15\/2024/);
      expect(result).toMatch(/02\/20\/2024/);
    });

    it('should format dates with time', async () => {
      const data = [
        { name: 'John', created_at: new Date('2024-01-15T10:30:00Z') },
      ];
      const config: ExportConfig = {
        data,
        filename: 'datetime',
        format: 'csv',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
      };

      const result = await service.export(config);

      expect(result).toMatch(/2024-01-15 \d{2}:\d{2}:\d{2}/);
    });

    it('should handle ISO date strings', async () => {
      const data = [
        { name: 'John', created_at: '2024-01-15T10:30:00.000Z' },
        { name: 'Jane', created_at: '2024-02-20T15:45:00.000Z' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'iso-dates',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('2024-01-15');
      expect(result).toContain('2024-02-20');
    });
  });

  describe('Number Formatting', () => {
    it('should preserve integer values', async () => {
      const data = [
        { name: 'John', age: 25, score: 100 },
        { name: 'Jane', age: 30, score: 95 },
      ];
      const config: ExportConfig = {
        data,
        filename: 'integers',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('25');
      expect(result).toContain('30');
      expect(result).toContain('100');
      expect(result).toContain('95');
    });

    it('should format decimal numbers', async () => {
      const data = [
        { name: 'John', value: 1234.56 },
        { name: 'Jane', value: 9876.54 },
      ];
      const config: ExportConfig = {
        data,
        filename: 'decimals',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('1234.56');
      expect(result).toContain('9876.54');
    });

    it('should format large numbers', async () => {
      const data = [
        { name: 'John', revenue: 1234567.89 },
        { name: 'Jane', revenue: 9876543.21 },
      ];
      const config: ExportConfig = {
        data,
        filename: 'large-numbers',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toContain('1234567.89');
      expect(result).toContain('9876543.21');
    });

    it('should handle scientific notation', async () => {
      const data = [
        { name: 'John', value: 1.23e10 },
        { name: 'Jane', value: 4.56e-5 },
      ];
      const config: ExportConfig = {
        data,
        filename: 'scientific',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).toMatch(/1\.23e\+?10/i);
      expect(result).toMatch(/4\.56e-?5/i);
    });

    it('should format currency values', async () => {
      const data = [
        { name: 'John', amount: 1234.56 },
        { name: 'Jane', amount: 9876.54 },
      ];
      const config: ExportConfig = {
        data,
        filename: 'currency',
        format: 'csv',
        numberFormat: {
          amount: { style: 'currency', currency: 'USD' },
        },
      };

      const result = await service.export(config);

      expect(result).toContain('1234.56');
      expect(result).toContain('9876.54');
    });
  });

  describe('Column Selection and Ordering', () => {
    it('should export only specified columns', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'selected-columns',
        format: 'csv',
        columns: ['name', 'email', 'company'],
      };

      const result = await service.export(config);
      const lines = (result as string).split('\n');
      const headers = lines[0].split(',');

      expect(headers).toContain('name');
      expect(headers).toContain('email');
      expect(headers).toContain('company');
      expect(headers).not.toContain('phone');
      expect(headers).not.toContain('status');
    });

    it('should maintain column order', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'ordered-columns',
        format: 'csv',
        columns: ['email', 'name', 'phone'],
      };

      const result = await service.export(config);
      const lines = (result as string).split('\n');
      const headers = lines[0].split(',');

      expect(headers[0]).toBe('email');
      expect(headers[1]).toBe('name');
      expect(headers[2]).toBe('phone');
    });

    it('should rename columns using headers map', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'renamed-columns',
        format: 'csv',
        columnHeaders: {
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
        },
      };

      const result = await service.export(config);

      expect(result).toContain('Full Name');
      expect(result).toContain('Email Address');
      expect(result).toContain('Phone Number');
    });
  });

  describe('Large Dataset Performance', () => {
    it('should export 1000 rows efficiently', async () => {
      const data = generateMockContacts(1000);
      const config: ExportConfig = {
        data,
        filename: 'perf-1000',
        format: 'csv',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should export 5000 rows efficiently', async () => {
      const data = generateMockContacts(5000);
      const config: ExportConfig = {
        data,
        filename: 'perf-5000',
        format: 'csv',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      expect(duration).toBeLessThan(3000); // Should complete in under 3 seconds
    });

    it('should export 10000 rows efficiently', async () => {
      const data = generateMockContacts(10000);
      const config: ExportConfig = {
        data,
        filename: 'perf-10000',
        format: 'csv',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    it('should export 50000 rows within reasonable time', async () => {
      const data = generateMockContacts(50000);
      const config: ExportConfig = {
        data,
        filename: 'perf-50000',
        format: 'csv',
      };

      const { duration } = await measureExecutionTime(() =>
        service.export(config)
      );

      expect(duration).toBeLessThan(15000); // Should complete in under 15 seconds
    });

    it('should handle memory efficiently with large datasets', async () => {
      const data = generateMockContacts(25000);
      const config: ExportConfig = {
        data,
        filename: 'memory-test',
        format: 'csv',
      };

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      await service.export(config);
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory increase should be reasonable (less than 100MB)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
        expect(memoryIncrease).toBeLessThan(100);
      }
    });
  });

  describe('Error Handling', () => {
    it('should validate data is an array', async () => {
      const config: ExportConfig = {
        data: { name: 'John' } as any, // Not an array
        filename: 'invalid-data',
        format: 'csv',
      };

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should validate filename is provided', async () => {
      const config = {
        data: generateMockContacts(5),
        format: 'csv',
        // Missing filename
      } as ExportConfig;

      await expect(service.export(config)).rejects.toThrow();
    });

    it('should handle data with inconsistent properties', async () => {
      const data = [
        { name: 'John', email: 'john@example.com', phone: '555-0001' },
        { name: 'Jane', email: 'jane@example.com' }, // Missing phone
        { name: 'Bob', company: 'Acme' }, // Different properties
      ];
      const config: ExportConfig = {
        data,
        filename: 'inconsistent',
        format: 'csv',
      };

      const result = await service.export(config);
      const validation = validateCsvFormat(result as string);

      expect(validation.valid).toBe(true);
    });

    it('should handle circular references', async () => {
      const obj1: any = { name: 'John' };
      const obj2: any = { name: 'Jane' };
      obj1.ref = obj2;
      obj2.ref = obj1; // Circular reference

      const config: ExportConfig = {
        data: [obj1],
        filename: 'circular',
        format: 'csv',
      };

      await expect(service.export(config)).rejects.toThrow();
    });
  });

  describe('BOM and Encoding', () => {
    it('should include BOM for UTF-8 when specified', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'with-bom',
        format: 'csv',
        includeBOM: true,
      };

      const result = await service.export(config);

      expect(result).toMatch(/^\uFEFF/); // BOM character
    });

    it('should not include BOM by default', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'no-bom',
        format: 'csv',
      };

      const result = await service.export(config);

      expect(result).not.toMatch(/^\uFEFF/);
    });
  });

  describe('Advanced Features', () => {
    it('should support custom line endings (CRLF)', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'crlf',
        format: 'csv',
        lineEnding: '\r\n',
      };

      const result = await service.export(config);

      expect(result).toContain('\r\n');
    });

    it('should support custom line endings (LF)', async () => {
      const data = generateMockContacts(5);
      const config: ExportConfig = {
        data,
        filename: 'lf',
        format: 'csv',
        lineEnding: '\n',
      };

      const result = await service.export(config);

      expect(result).toContain('\n');
      expect(result).not.toContain('\r\n');
    });

    it('should support quote character customization', async () => {
      const data = [{ name: "Smith, John", email: "john@example.com" }];
      const config: ExportConfig = {
        data,
        filename: 'custom-quote',
        format: 'csv',
        quoteChar: "'",
      };

      const result = await service.export(config);

      expect(result).toContain("'Smith, John'");
    });

    it('should support escape character customization', async () => {
      const data = [{ name: 'John "The Boss" Smith' }];
      const config: ExportConfig = {
        data,
        filename: 'custom-escape',
        format: 'csv',
        escapeChar: '\\',
      };

      const result = await service.export(config);

      expect(result).toMatch(/John \\"The Boss\\" Smith/);
    });

    it('should support trim whitespace option', async () => {
      const data = [
        { name: '  John Smith  ', email: '  john@example.com  ' },
      ];
      const config: ExportConfig = {
        data,
        filename: 'trimmed',
        format: 'csv',
        trimWhitespace: true,
      };

      const result = await service.export(config);

      expect(result).toContain('John Smith');
      expect(result).toContain('john@example.com');
      expect(result).not.toContain('  John');
    });
  });
});
