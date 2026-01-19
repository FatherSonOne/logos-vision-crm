/**
 * CSV Export Service
 * Stub implementation - tests are ready, implementation pending
 */

import type { ExportConfig, ExportService } from './types';

export class CsvExportService implements ExportService {
  async export(config: ExportConfig): Promise<string> {
    // TODO: Implement CSV export
    throw new Error('CsvExportService not yet implemented');
  }
}
