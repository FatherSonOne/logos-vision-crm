import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 100,
  overscan = 5,
  className = '',
  emptyMessage = 'No items to display',
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

interface VirtualizedTableProps<T> {
  items: T[];
  columns: Array<{
    key: string;
    label: string;
    render: (item: T) => React.ReactNode;
    width?: string;
  }>;
  estimateSize?: number;
  className?: string;
  emptyMessage?: string;
}

export function VirtualizedTable<T>({
  items,
  columns,
  estimateSize = 60,
  className = '',
  emptyMessage = 'No data available',
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 10,
  });

  return (
    <div className={`w-full ${className}`}>
      {/* Table Header */}
      <div className="grid gap-4 mb-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        {columns.map((column) => (
          <div
            key={column.key}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            style={{ width: column.width }}
          >
            {column.label}
          </div>
        ))}
      </div>

      {/* Table Body */}
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ height: '600px' }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index];
              return (
                <motion.div
                  key={virtualItem.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="text-sm text-gray-900 dark:text-gray-100"
                      style={{ width: column.width }}
                    >
                      {column.render(item)}
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: number;
  estimateSize?: number;
  className?: string;
  emptyMessage?: string;
}

export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = 3,
  estimateSize = 250,
  className = '',
  emptyMessage = 'No items to display',
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Group items into rows
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 3,
  });

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          const startIndex = virtualRow.index * columns;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  height: '100%',
                }}
              >
                {row.map((item, colIndex) => (
                  <div key={startIndex + colIndex}>
                    {renderItem(item, startIndex + colIndex)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
