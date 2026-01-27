/**
 * Performance Monitoring Service
 * Tracks and reports application performance metrics
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  timestamp: number;
  userAgent: string;
  url: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  /**
   * Start monitoring performance
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Monitor Long Tasks (blocking main thread > 50ms)
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'long_task',
              value: entry.duration,
              timestamp: Date.now(),
              tags: {
                type: entry.entryType,
              },
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }

      // Monitor Layout Shifts (CLS)
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              this.recordMetric({
                name: 'layout_shift',
                value: (entry as any).value,
                timestamp: Date.now(),
              });
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (e) {
        console.warn('Layout shift monitoring not supported');
      }

      // Monitor Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric({
            name: 'lcp',
            value: lastEntry.startTime,
            timestamp: Date.now(),
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }

      // Monitor First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'fid',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID monitoring not supported');
      }
    }

    // Monitor page load metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          this.recordMetric({
            name: 'dns_lookup',
            value: perfData.domainLookupEnd - perfData.domainLookupStart,
            timestamp: Date.now(),
          });
          this.recordMetric({
            name: 'tcp_connection',
            value: perfData.connectEnd - perfData.connectStart,
            timestamp: Date.now(),
          });
          this.recordMetric({
            name: 'dom_content_loaded',
            value: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            timestamp: Date.now(),
          });
          this.recordMetric({
            name: 'page_load_time',
            value: perfData.loadEventEnd - perfData.fetchStart,
            timestamp: Date.now(),
          });
        }
      }, 0);
    });
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring() {
    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms`, metric.tags || '');
    }

    // Keep only last 100 metrics to prevent memory leak
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Measure the execution time of a function
   */
  async measure<T>(name: string, fn: () => T | Promise<T>, tags?: Record<string, string>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        value: duration,
        timestamp: Date.now(),
        tags,
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        value: duration,
        timestamp: Date.now(),
        tags: { ...tags, error: 'true' },
      });
      throw error;
    }
  }

  /**
   * Measure React component render time
   */
  measureRender(componentName: string, duration: number) {
    this.recordMetric({
      name: 'component_render',
      value: duration,
      timestamp: Date.now(),
      tags: { component: componentName },
    });
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average value for a metric
   */
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    return {
      metrics: this.getMetrics(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Log performance summary to console
   */
  logSummary() {
    const report: Record<string, { count: number; avg: number; min: number; max: number }> = {};

    this.metrics.forEach(metric => {
      if (!report[metric.name]) {
        report[metric.name] = {
          count: 0,
          avg: 0,
          min: Infinity,
          max: -Infinity,
        };
      }

      report[metric.name].count++;
      report[metric.name].min = Math.min(report[metric.name].min, metric.value);
      report[metric.name].max = Math.max(report[metric.name].max, metric.value);
    });

    // Calculate averages
    Object.keys(report).forEach(name => {
      const metrics = this.getMetricsByName(name);
      const sum = metrics.reduce((acc, m) => acc + m.value, 0);
      report[name].avg = sum / metrics.length;
    });

    console.table(report);
  }

  /**
   * Get Core Web Vitals summary
   */
  getWebVitals() {
    return {
      lcp: this.getAverageMetric('lcp'),
      fid: this.getAverageMetric('fid'),
      cls: this.metrics
        .filter(m => m.name === 'layout_shift')
        .reduce((sum, m) => sum + m.value, 0),
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start in production
if (!import.meta.env.DEV) {
  performanceMonitor.startMonitoring();
}

/**
 * React Hook for measuring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  return {
    recordRender: () => {
      const duration = performance.now() - startTime;
      performanceMonitor.measureRender(componentName, duration);
    },
  };
}

/**
 * Higher-order component for measuring component performance
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();
      return () => {
        const duration = performance.now() - startTime;
        performanceMonitor.measureRender(componentName, duration);
      };
    }, []);

    return React.createElement(Component, props);
  };
}
