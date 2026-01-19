import { IExportService, ExportOptions, ExportResult } from './types';
import html2canvas from 'html2canvas';

// ============================================
// PNG EXPORT SERVICE
// ============================================

export class PngExportService implements IExportService {
  getSupportedFormat() {
    return 'png' as const;
  }

  async export(options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      const { reportName, chartElement, timestamp = new Date() } = options;

      if (!chartElement) {
        return {
          success: false,
          filename: '',
          error: 'No chart element available for PNG export',
        };
      }

      // Capture chart as canvas
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/png',
          1.0
        );
      });

      // Generate filename
      const dateStr = timestamp.toISOString().split('T')[0];
      const filename = `${this.sanitizeFilename(reportName)}_${dateStr}.png`;

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        blob,
        filename,
        fileSize: blob.size,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'PNG export failed',
      };
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}
