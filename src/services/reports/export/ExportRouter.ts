/**
 * Export Router
 *
 * Strategy pattern implementation for selecting the appropriate export service
 * based on data size, complexity, and required features.
 *
 * Routes between:
 * - ClientSideExportService: For small-medium exports (<10k rows)
 * - Commercial services: For large exports and advanced features (future)
 */

import type {
  IExportService,
  ExportRequest,
  ExportResult,
  ExportStrategyMetadata,
  ExportComplexity,
  ExportSizeCategory,
} from '../interfaces/IExportService';

// ============================================
// STRATEGY SELECTION
// ============================================

/**
 * Performance thresholds for routing decisions
 */
const PERFORMANCE_THRESHOLDS = {
  /** Small dataset - use client-side */
  SMALL_DATASET: 1000,
  /** Medium dataset - use client-side with optimization */
  MEDIUM_DATASET: 10000,
  /** Large dataset - recommend commercial solution */
  LARGE_DATASET: 50000,
  /** Very large dataset - require commercial solution */
  XLARGE_DATASET: 100000,
} as const;

/**
 * Complexity indicators
 */
const COMPLEXITY_FEATURES = {
  SIMPLE: ['basic-table', 'simple-chart'],
  MODERATE: ['multi-sheet', 'basic-formulas', 'basic-charts'],
  COMPLEX: ['advanced-formulas', 'pivot-tables', 'complex-charts'],
  ENTERPRISE: ['encryption', 'digital-signatures', 'watermarks', 'pdf-compliance'],
} as const;

// ============================================
// EXPORT ROUTER
// ============================================

/**
 * Export Router
 *
 * Selects the optimal export service based on request characteristics.
 * Implements strategy pattern for flexible service selection.
 */
export class ExportRouter {
  private static instance: ExportRouter;
  private services: Map<string, IExportService> = new Map();
  private defaultService: IExportService | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ExportRouter {
    if (!ExportRouter.instance) {
      ExportRouter.instance = new ExportRouter();
    }
    return ExportRouter.instance;
  }

  /**
   * Register an export service
   *
   * @param service - Export service to register
   * @param isDefault - Set as default service
   */
  public registerService(service: IExportService, isDefault: boolean = false): void {
    this.services.set(service.serviceName, service);

    if (isDefault || this.defaultService === null) {
      this.defaultService = service;
    }
  }

  /**
   * Unregister an export service
   *
   * @param serviceName - Name of service to unregister
   */
  public unregisterService(serviceName: string): void {
    const service = this.services.get(serviceName);
    this.services.delete(serviceName);

    if (service === this.defaultService) {
      this.defaultService = this.services.values().next().value || null;
    }
  }

  /**
   * Get registered service by name
   *
   * @param serviceName - Name of service
   * @returns Export service or undefined
   */
  public getService(serviceName: string): IExportService | undefined {
    return this.services.get(serviceName);
  }

  /**
   * Get all registered services
   *
   * @returns Array of registered services
   */
  public getServices(): IExportService[] {
    return Array.from(this.services.values());
  }

  /**
   * Analyze export request and determine metadata
   *
   * @param request - Export request to analyze
   * @returns Strategy metadata for routing
   */
  public analyzeRequest(request: ExportRequest): ExportStrategyMetadata {
    const rowCount = this.estimateRowCount(request.data);
    const sizeCategory = this.determineSizeCategory(rowCount);
    const complexity = this.determineComplexity(request);

    return {
      rowCount,
      sizeCategory,
      complexity,
      requiredFeatures: this.extractRequiredFeatures(request),
      format: request.format,
    };
  }

  /**
   * Select the optimal export service for the request
   *
   * @param request - Export request
   * @returns Selected export service
   * @throws Error if no suitable service is available
   */
  public selectStrategy(request: ExportRequest): IExportService {
    const metadata = this.analyzeRequest(request);

    // Find services that support the requested format
    const compatibleServices = Array.from(this.services.values()).filter(
      service => service.supportedFormats.includes(request.format)
    );

    if (compatibleServices.length === 0) {
      throw new Error(`No export service available for format: ${request.format}`);
    }

    // Score each service based on suitability
    const scoredServices = compatibleServices.map(service => {
      const capabilities = service.getCapabilities();
      let score = 0;

      // Check row count capacity
      if (metadata.rowCount <= capabilities.maxRows) {
        score += 100;
      } else {
        return { service, score: -1 }; // Disqualified
      }

      // Prefer client-side for small datasets
      if (metadata.sizeCategory === 'small' && service.serviceType === 'client-side') {
        score += 50;
      }

      // Prefer commercial for large datasets
      if (metadata.sizeCategory === 'large' || metadata.sizeCategory === 'xlarge') {
        if (service.serviceType === 'commercial') {
          score += 50;
        }
      }

      // Check required features
      const requiredFeatures = metadata.requiredFeatures || [];
      const hasAllFeatures = requiredFeatures.every(feature => {
        return capabilities.features[feature as keyof typeof capabilities.features];
      });

      if (hasAllFeatures) {
        score += requiredFeatures.length * 10;
      } else if (requiredFeatures.length > 0) {
        return { service, score: -1 }; // Disqualified
      }

      // Performance bonus
      if (capabilities.performance) {
        const estimatedTime = capabilities.performance.avgTimePerRow
          ? metadata.rowCount * capabilities.performance.avgTimePerRow
          : 0;

        if (estimatedTime < 5000) {
          score += 20;
        }
      }

      return { service, score };
    });

    // Filter out disqualified services and sort by score
    const qualifiedServices = scoredServices
      .filter(item => item.score >= 0)
      .sort((a, b) => b.score - a.score);

    if (qualifiedServices.length === 0) {
      throw new Error(
        `No export service can handle request: ${metadata.rowCount} rows, ` +
        `complexity: ${metadata.complexity}, features: ${metadata.requiredFeatures?.join(', ')}`
      );
    }

    return qualifiedServices[0].service;
  }

  /**
   * Export using automatically selected service
   *
   * @param request - Export request
   * @returns Promise resolving to export result
   */
  public async export(request: ExportRequest): Promise<ExportResult> {
    const service = this.selectStrategy(request);

    // Validate request
    const validation = service.validateRequest(request);
    if (!validation.valid) {
      throw new Error(`Export validation failed: ${validation.errors?.join(', ')}`);
    }

    // Route to appropriate export method
    switch (request.format) {
      case 'pdf':
        return service.exportToPDF(request.data, request.options as any);
      case 'excel':
        return service.exportToExcel(request.data, request.options as any);
      case 'csv':
        return service.exportToCSV(request.data, request.options as any);
      case 'png':
      case 'jpeg':
      case 'svg':
        // For image exports, we need the DOM element
        const element = (request.options as any).selector || request.data;
        return service.exportToImage(element, request.options as any);
      default:
        throw new Error(`Unsupported export format: ${request.format}`);
    }
  }

  /**
   * Estimate row count from data
   *
   * @param data - Data to analyze
   * @returns Estimated row count
   */
  private estimateRowCount(data: any): number {
    if (Array.isArray(data)) {
      return data.length;
    }

    if (data && typeof data === 'object') {
      if ('rows' in data && Array.isArray(data.rows)) {
        return data.rows.length;
      }
      if ('data' in data && Array.isArray(data.data)) {
        return data.data.length;
      }
    }

    return 0;
  }

  /**
   * Determine size category
   *
   * @param rowCount - Number of rows
   * @returns Size category
   */
  private determineSizeCategory(rowCount: number): ExportSizeCategory {
    if (rowCount < PERFORMANCE_THRESHOLDS.SMALL_DATASET) {
      return 'small';
    }
    if (rowCount < PERFORMANCE_THRESHOLDS.MEDIUM_DATASET) {
      return 'medium';
    }
    if (rowCount < PERFORMANCE_THRESHOLDS.LARGE_DATASET) {
      return 'large';
    }
    return 'xlarge';
  }

  /**
   * Determine export complexity
   *
   * @param request - Export request
   * @returns Complexity level
   */
  private determineComplexity(request: ExportRequest): ExportComplexity {
    const options = request.options as any;

    // Check for enterprise features
    if (
      options.encrypt ||
      options.pdfACompliant ||
      options.password ||
      options.digitalSignature
    ) {
      return 'enterprise';
    }

    // Check for complex features
    if (
      options.multiSheet ||
      options.includeCharts ||
      options.includeFormulas ||
      options.includeTOC
    ) {
      return 'complex';
    }

    // Check for moderate features
    if (
      options.includeHeader ||
      options.includeFooter ||
      options.formatAsTable ||
      options.freezeHeader
    ) {
      return 'moderate';
    }

    return 'simple';
  }

  /**
   * Extract required features from request
   *
   * @param request - Export request
   * @returns Array of required feature names
   */
  private extractRequiredFeatures(request: ExportRequest): string[] {
    const features: string[] = [];
    const options = request.options as any;

    if (options.encrypt || options.password) {
      features.push('encryption');
    }
    if (options.multiSheet) {
      features.push('multiSheet');
    }
    if (options.includeCharts) {
      features.push('charts');
    }
    if (options.includeFormulas) {
      features.push('formulas');
    }
    if (options.compressImages) {
      features.push('compression');
    }
    if (options.digitalSignature) {
      features.push('digitalSignatures');
    }

    return features;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

/**
 * Singleton instance of ExportRouter
 */
export const exportRouter = ExportRouter.getInstance();

/**
 * Default export
 */
export default exportRouter;
