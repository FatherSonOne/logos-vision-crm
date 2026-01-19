/**
 * Virtual Scrolling Hook
 * Optimized table rendering for large datasets using @tanstack/react-virtual
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualizedTableConfig {
  rowCount: number;
  estimateSize?: number;
  overscan?: number;
  enableSmoothScroll?: boolean;
  persistScrollPosition?: boolean;
  scrollPositionKey?: string;
  onScrollEnd?: () => void;
}

export interface VirtualizedTableMetrics {
  totalRows: number;
  virtualRows: number;
  scrollPercentage: number;
  averageRowHeight: number;
  isScrolling: boolean;
}

/**
 * Hook for virtualized table rendering with performance tracking
 */
export function useVirtualizedTable(config: VirtualizedTableConfig) {
  const {
    rowCount,
    estimateSize = 50,
    overscan = 10,
    enableSmoothScroll = true,
    persistScrollPosition = false,
    scrollPositionKey = 'table-scroll',
    onScrollEnd,
  } = config;

  const parentRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [metrics, setMetrics] = useState<VirtualizedTableMetrics>({
    totalRows: rowCount,
    virtualRows: 0,
    scrollPercentage: 0,
    averageRowHeight: estimateSize,
    isScrolling: false,
  });

  // Create virtualizer instance
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? element => element?.getBoundingClientRect().height
        : undefined,
  });

  // Track scrolling state
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, 150);
  }, [onScrollEnd]);

  // Update metrics
  useEffect(() => {
    const virtualRows = virtualizer.getVirtualItems();
    const scrollElement = parentRef.current;

    if (scrollElement) {
      const scrollPercentage = scrollElement.scrollHeight > 0
        ? (scrollElement.scrollTop / (scrollElement.scrollHeight - scrollElement.clientHeight)) * 100
        : 0;

      setMetrics({
        totalRows: rowCount,
        virtualRows: virtualRows.length,
        scrollPercentage: Math.max(0, Math.min(100, scrollPercentage)),
        averageRowHeight: estimateSize,
        isScrolling,
      });
    }
  }, [virtualizer, rowCount, estimateSize, isScrolling]);

  // Persist scroll position
  useEffect(() => {
    if (!persistScrollPosition || !scrollPositionKey) return;

    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    // Restore scroll position on mount
    const savedPosition = sessionStorage.getItem(scrollPositionKey);
    if (savedPosition) {
      scrollElement.scrollTop = parseInt(savedPosition, 10);
    }

    // Save scroll position on scroll
    const handleScrollPersist = () => {
      sessionStorage.setItem(scrollPositionKey, scrollElement.scrollTop.toString());
    };

    scrollElement.addEventListener('scroll', handleScrollPersist);
    return () => scrollElement.removeEventListener('scroll', handleScrollPersist);
  }, [persistScrollPosition, scrollPositionKey]);

  // Attach scroll handler
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smooth scrolling with requestAnimationFrame
  const scrollToIndex = useCallback((index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; smooth?: boolean }) => {
    const { align = 'start', smooth = enableSmoothScroll } = options || {};

    if (smooth) {
      virtualizer.scrollToIndex(index, { align, behavior: 'smooth' });
    } else {
      virtualizer.scrollToIndex(index, { align });
    }
  }, [virtualizer, enableSmoothScroll]);

  const scrollToTop = useCallback(() => {
    scrollToIndex(0, { smooth: true });
  }, [scrollToIndex]);

  const scrollToBottom = useCallback(() => {
    scrollToIndex(rowCount - 1, { align: 'end', smooth: true });
  }, [scrollToIndex, rowCount]);

  return {
    parentRef,
    virtualizer,
    virtualRows: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    metrics,
    isScrolling,
  };
}

/**
 * Hook for dynamic row height calculation
 */
export function useDynamicRowHeight() {
  const [rowHeights, setRowHeights] = useState<Map<number, number>>(new Map());

  const measureRowHeight = useCallback((index: number, element: HTMLElement | null) => {
    if (!element) return;

    const height = element.getBoundingClientRect().height;
    setRowHeights(prev => {
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  }, []);

  const getRowHeight = useCallback((index: number, defaultHeight: number = 50) => {
    return rowHeights.get(index) ?? defaultHeight;
  }, [rowHeights]);

  const clearRowHeights = useCallback(() => {
    setRowHeights(new Map());
  }, []);

  return {
    measureRowHeight,
    getRowHeight,
    clearRowHeights,
    rowHeights,
  };
}

/**
 * Hook for infinite scrolling with virtual tables
 */
export function useInfiniteVirtualTable(config: {
  initialRowCount: number;
  fetchMoreRows: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
}) {
  const {
    initialRowCount,
    fetchMoreRows,
    hasMore,
    threshold = 0.8,
  } = config;

  const [rowCount, setRowCount] = useState(initialRowCount);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const handleScrollEnd = useCallback(async () => {
    if (!hasMore || isLoading) return;

    // Prevent multiple simultaneous fetches
    const now = Date.now();
    if (now - lastFetchRef.current < 500) return;

    lastFetchRef.current = now;
    setIsLoading(true);

    try {
      await fetchMoreRows();
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, fetchMoreRows]);

  const checkLoadMore = useCallback((scrollPercentage: number) => {
    if (scrollPercentage >= threshold * 100 && hasMore && !isLoading) {
      handleScrollEnd();
    }
  }, [threshold, hasMore, isLoading, handleScrollEnd]);

  return {
    rowCount,
    setRowCount,
    isLoading,
    handleScrollEnd,
    checkLoadMore,
  };
}

/**
 * Hook for table selection with virtual scrolling
 */
export function useVirtualTableSelection(rowCount: number) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback((index: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedRows(new Set(Array.from({ length: rowCount }, (_, i) => i)));
  }, [rowCount]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const selectRange = useCallback((start: number, end: number) => {
    const range = new Set<number>();
    const [min, max] = [Math.min(start, end), Math.max(start, end)];
    for (let i = min; i <= max; i++) {
      range.add(i);
    }
    setSelectedRows(range);
  }, []);

  const isSelected = useCallback((index: number) => {
    return selectedRows.has(index);
  }, [selectedRows]);

  const isAllSelected = selectedRows.size === rowCount && rowCount > 0;
  const isPartiallySelected = selectedRows.size > 0 && selectedRows.size < rowCount;

  return {
    selectedRows,
    toggleRow,
    selectAll,
    clearSelection,
    selectRange,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    selectedCount: selectedRows.size,
  };
}

/**
 * Performance monitoring for virtual table
 */
export function useVirtualTablePerformance() {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    scrollTime: 0,
    fps: 60,
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrameId: number;

    const measureFrame = () => {
      const now = performance.now();
      const frameTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      frameTimesRef.current.push(frameTime);
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      // Calculate FPS
      const avgFrameTime = frameTimesRef.current.reduce((sum, t) => sum + t, 0) / frameTimesRef.current.length;
      const fps = Math.round(1000 / avgFrameTime);

      setPerformanceMetrics(prev => ({
        ...prev,
        fps: Math.min(60, Math.max(1, fps)),
      }));

      animationFrameId = requestAnimationFrame(measureFrame);
    };

    animationFrameId = requestAnimationFrame(measureFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return performanceMetrics;
}
