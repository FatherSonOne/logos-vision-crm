/**
 * Image Export Service
 *
 * Implements high-quality image export for charts and reports using html2canvas.
 * Supports multiple formats, resolutions, and social media presets.
 *
 * @architecture Implements IExportService interface
 * @dependencies html2canvas for DOM-to-canvas rendering
 * @performance Optimized for large charts with configurable quality settings
 */

import html2canvas from 'html2canvas';
import { IExportService, ExportOptions, ExportResult, ExportFormat } from './types';

// ============================================
// IMAGE EXPORT OPTIONS
// ============================================

export interface ImageExportOptions {
  /** Image format */
  format?: 'png' | 'jpeg' | 'webp';

  /** Resolution scaling (1x = standard, 2x = retina, 4x = print quality) */
  resolution?: 1 | 2 | 4;

  /** Enable transparent background (PNG only) */
  transparent?: boolean;

  /** Custom width in pixels (defaults to element width) */
  width?: number;

  /** Custom height in pixels (defaults to element height) */
  height?: number;

  /** JPEG/WebP quality (0.0 - 1.0) */
  quality?: number;
}

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
// IMAGE EXPORT SERVICE
// ============================================

/**
 * Image export service using html2canvas
 *
 * Features:
 * - Multiple formats: PNG, JPEG, WebP
 * - Configurable resolution (1x, 2x, 4x for print quality)
 * - Transparent backgrounds (PNG only)
 * - Custom dimensions
 * - Batch export capabilities
 * - Social media presets
 */
export class ImageExportService implements IExportService {
  private readonly defaultImageOptions: Required<ImageExportOptions> = {
    format: 'png',
    resolution: 2,
    transparent: false,
    width: 0,
    height: 0,
    quality: 0.95,
  };

  getSupportedFormat(): ExportFormat {
    return 'png';
  }

  /**
   * Export chart to image
   *
   * @param options Export options
   * @returns Promise resolving to export result
   */
  async export(options: ExportOptions & { imageOptions?: ImageExportOptions }): Promise<ExportResult> {
    const startTime = Date.now();

    try {
      const { reportName, chartElement, timestamp = new Date(), imageOptions } = options;

      if (!chartElement) {
        return {
          success: false,
          filename: '',
          error: 'No chart element provided for image export',
        };
      }

      // Export to image blob
      const blob = await this.exportToImage(chartElement, imageOptions);

      // Generate filename
      const dateStr = timestamp.toISOString().split('T')[0];
      const format = imageOptions?.format || 'png';
      const filename = `${this.sanitizeFilename(reportName)}_${dateStr}.${format}`;

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
        error: error instanceof Error ? error.message : 'Image export failed',
      };
    }
  }

  /**
   * Export HTML element to image
   *
   * @param element HTML element to capture
   * @param options Image export options
   * @returns Promise resolving to image blob
   */
  async exportToImage(
    element: HTMLElement,
    options?: ImageExportOptions
  ): Promise<Blob> {
    const opts = { ...this.defaultImageOptions, ...options };

    // Validate element
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('Invalid element provided for image export');
    }

    // Calculate dimensions
    const targetWidth = opts.width || element.offsetWidth;
    const targetHeight = opts.height || element.offsetHeight;

    if (targetWidth === 0 || targetHeight === 0) {
      throw new Error('Element has zero dimensions. Cannot export to image.');
    }

    try {
      // Capture element to canvas with high quality
      const canvas = await html2canvas(element, {
        scale: opts.resolution,
        backgroundColor: opts.transparent ? null : '#ffffff',
        width: targetWidth,
        height: targetHeight,
        useCORS: true, // Enable cross-origin images
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
      });

      // Resize if custom dimensions specified
      const finalCanvas = this.resizeCanvas(
        canvas,
        opts.width,
        opts.height,
        opts.resolution
      );

      // Convert to blob with specified format
      return await this.canvasToBlob(finalCanvas, opts.format, opts.quality);
    } catch (error) {
      throw new Error(
        `Image export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export multiple chart elements in batch
   *
   * @param elements Array of HTML elements to capture
   * @param options Export options (applied to all elements)
   * @returns Promise resolving to array of image blobs
   */
  async exportAllCharts(
    elements: HTMLElement[],
    options?: ImageExportOptions
  ): Promise<Blob[]> {
    if (!elements || elements.length === 0) {
      throw new Error('No elements provided for batch export');
    }

    try {
      // Export all charts in parallel for better performance
      const exportPromises = elements.map((element) =>
        this.exportToImage(element, options)
      );

      return await Promise.all(exportPromises);
    } catch (error) {
      throw new Error(
        `Batch export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export chart for social media with preset dimensions
   *
   * @param element HTML element to capture
   * @param platform Social media platform name
   * @returns Promise resolving to optimized image blob
   */
  async exportForSocialMedia(
    element: HTMLElement,
    platform: keyof typeof SOCIAL_MEDIA_PRESETS
  ): Promise<Blob> {
    const preset = SOCIAL_MEDIA_PRESETS[platform];

    if (!preset) {
      throw new Error(
        `Unknown social media platform: ${platform}. Supported: ${Object.keys(SOCIAL_MEDIA_PRESETS).join(', ')}`
      );
    }

    return this.exportToImage(element, {
      format: preset.format,
      width: preset.width,
      height: preset.height,
      resolution: 2, // High quality for social media
      transparent: false,
      quality: preset.quality || 0.9,
    });
  }

  /**
   * Export element with custom preset
   *
   * @param element HTML element to capture
   * @param preset Custom social media preset
   * @returns Promise resolving to image blob
   */
  async exportWithPreset(
    element: HTMLElement,
    preset: SocialMediaPreset
  ): Promise<Blob> {
    return this.exportToImage(element, {
      format: preset.format,
      width: preset.width,
      height: preset.height,
      resolution: 2,
      quality: preset.quality || 0.9,
    });
  }

  /**
   * Resize canvas to target dimensions
   *
   * @param sourceCanvas Original canvas
   * @param targetWidth Target width (0 = keep original)
   * @param targetHeight Target height (0 = keep original)
   * @param scale Resolution scale factor
   * @returns Resized canvas or original if no resize needed
   */
  private resizeCanvas(
    sourceCanvas: HTMLCanvasElement,
    targetWidth: number | undefined,
    targetHeight: number | undefined,
    scale: number
  ): HTMLCanvasElement {
    // No resize needed if dimensions not specified
    if (!targetWidth || !targetHeight) {
      return sourceCanvas;
    }

    const scaledWidth = targetWidth * scale;
    const scaledHeight = targetHeight * scale;

    // No resize needed if dimensions match
    if (
      sourceCanvas.width === scaledWidth &&
      sourceCanvas.height === scaledHeight
    ) {
      return sourceCanvas;
    }

    // Create new canvas with target dimensions
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = scaledWidth;
    resizedCanvas.height = scaledHeight;

    const ctx = resizedCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context for resizing');
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw source canvas onto resized canvas
    ctx.drawImage(sourceCanvas, 0, 0, scaledWidth, scaledHeight);

    return resizedCanvas;
  }

  /**
   * Convert canvas to blob with specified format and quality
   *
   * @param canvas Canvas element
   * @param format Image format
   * @param quality Image quality (0.0 - 1.0)
   * @returns Promise resolving to image blob
   */
  private async canvasToBlob(
    canvas: HTMLCanvasElement,
    format: 'png' | 'jpeg' | 'webp',
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const mimeType = this.getMimeType(format);

      // PNG doesn't use quality parameter
      const qualityParam = format === 'png' ? undefined : quality;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to convert canvas to ${format} blob`));
          }
        },
        mimeType,
        qualityParam
      );
    });
  }

  /**
   * Get MIME type for image format
   *
   * @param format Image format
   * @returns MIME type string
   */
  private getMimeType(format: 'png' | 'jpeg' | 'webp'): string {
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };

    return mimeTypes[format] || 'image/png';
  }

  /**
   * Sanitize filename for safe downloads
   *
   * @param filename Original filename
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Singleton instance for convenience
 */
export const imageExportService = new ImageExportService();

/**
 * Helper function to find all chart elements in a container
 *
 * @param container Parent container element
 * @param selector CSS selector for chart elements (default: '[data-chart-id]')
 * @returns Array of chart elements
 */
export function findChartElements(
  container: HTMLElement = document.body,
  selector: string = '[data-chart-id]'
): HTMLElement[] {
  return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
}

/**
 * Helper function to export all charts in a report
 *
 * @param reportId Report identifier
 * @param options Export options
 * @returns Promise resolving to array of image blobs
 */
export async function exportReportCharts(
  reportId: string,
  options?: ImageExportOptions
): Promise<Blob[]> {
  const charts = findChartElements(
    document.body,
    `[data-report-id="${reportId}"] [data-chart-id]`
  );

  if (charts.length === 0) {
    throw new Error(`No charts found for report: ${reportId}`);
  }

  return imageExportService.exportAllCharts(charts, options);
}

/**
 * Helper function to download image blob
 *
 * @param blob Image blob
 * @param filename Download filename
 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
