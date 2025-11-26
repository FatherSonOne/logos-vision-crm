import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

/**
 * Split View / Dual Pane Component
 * 
 * Features:
 * - View two things side-by-side
 * - Resizable panes (drag the divider)
 * - Collapsible panes (hide left/right)
 * - Horizontal or vertical split
 * - Responsive (stacks on mobile)
 * - Persistent sizing (localStorage)
 * - Dark mode support
 * - Smooth animations
 * 
 * Perfect for:
 * - Client list + details
 * - Project list + active project
 * - Inbox + message detail
 * - Document list + preview
 */

export type SplitDirection = 'horizontal' | 'vertical';

interface SplitViewProps {
  // Required
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  
  // Optional
  direction?: SplitDirection;
  defaultLeftWidth?: number; // Percentage (0-100)
  minLeftWidth?: number; // Percentage
  maxLeftWidth?: number; // Percentage
  storageKey?: string; // For persisting size
  showDivider?: boolean;
  collapsible?: boolean;
  className?: string;
  
  // Callbacks
  onResize?: (leftWidth: number) => void;
  onCollapse?: (side: 'left' | 'right') => void;
}

export const SplitView: React.FC<SplitViewProps> = ({
  leftPane,
  rightPane,
  direction = 'horizontal',
  defaultLeftWidth = 40,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  storageKey,
  showDivider = true,
  collapsible = true,
  className = '',
  onResize,
  onCollapse
}) => {
  // Load saved width from localStorage or use default
  const getSavedWidth = () => {
    if (storageKey) {
      const saved = localStorage.getItem(`split-view-${storageKey}`);
      if (saved) {
        const width = parseFloat(saved);
        if (!isNaN(width) && width >= minLeftWidth && width <= maxLeftWidth) {
          return width;
        }
      }
    }
    return defaultLeftWidth;
  };

  const [leftWidth, setLeftWidth] = useState(getSavedWidth());
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  // Save width to localStorage
  useEffect(() => {
    if (storageKey && !isLeftCollapsed && !isRightCollapsed) {
      localStorage.setItem(`split-view-${storageKey}`, leftWidth.toString());
    }
  }, [leftWidth, storageKey, isLeftCollapsed, isRightCollapsed]);

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showDivider) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    let newLeftWidth: number;
    
    if (direction === 'horizontal') {
      const mouseX = e.clientX - rect.left;
      newLeftWidth = (mouseX / rect.width) * 100;
    } else {
      const mouseY = e.clientY - rect.top;
      newLeftWidth = (mouseY / rect.height) * 100;
    }

    // Clamp to min/max
    newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
    
    setLeftWidth(newLeftWidth);
    onResize?.(newLeftWidth);
  }, [isDragging, direction, minLeftWidth, maxLeftWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  // Collapse/expand handlers
  const handleCollapseLeft = () => {
    setIsLeftCollapsed(!isLeftCollapsed);
    onCollapse?.('left');
  };

  const handleCollapseRight = () => {
    setIsRightCollapsed(!isRightCollapsed);
    onCollapse?.('right');
  };

  // Calculate pane sizes
  const getLeftSize = () => {
    if (isLeftCollapsed) return 0;
    if (isRightCollapsed) return 100;
    return leftWidth;
  };

  const getRightSize = () => {
    if (isRightCollapsed) return 0;
    if (isLeftCollapsed) return 100;
    return 100 - leftWidth;
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={`
        split-view relative w-full h-full overflow-hidden
        ${className}
      `}
    >
      <div className={`
        flex h-full
        ${isHorizontal ? 'flex-row' : 'flex-col'}
      `}>
        {/* Left/Top Pane */}
        <div
          className={`
            relative overflow-hidden transition-all duration-300
            ${isLeftCollapsed ? 'w-0 h-0' : ''}
          `}
          style={{
            [isHorizontal ? 'width' : 'height']: `${getLeftSize()}%`
          }}
        >
          <div className="h-full w-full overflow-auto">
            {leftPane}
          </div>
          
          {/* Collapse button for left pane */}
          {collapsible && !isLeftCollapsed && (
            <button
              onClick={handleCollapseLeft}
              className={`
                absolute bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600
                rounded-full p-1 shadow-lg hover:shadow-xl transition-all
                hover:scale-110 z-10
                ${isHorizontal 
                  ? 'top-4 right-2' 
                  : 'bottom-2 right-4'
                }
              `}
              title={`Collapse ${isHorizontal ? 'left' : 'top'} pane`}
            >
              {isHorizontal ? (
                <ChevronLeftIcon className="w-4 h-4" />
              ) : (
                <ChevronLeftIcon className="w-4 h-4 rotate-90" />
              )}
            </button>
          )}
        </div>

        {/* Divider */}
        {showDivider && !isLeftCollapsed && !isRightCollapsed && (
          <div
            ref={dividerRef}
            onMouseDown={handleMouseDown}
            className={`
              relative flex-shrink-0 bg-slate-200 dark:bg-slate-700
              hover:bg-cyan-500 dark:hover:bg-cyan-600
              transition-colors group
              ${isHorizontal ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'}
              ${isDragging ? 'bg-cyan-500 dark:bg-cyan-600' : ''}
            `}
          >
            {/* Drag handle indicator */}
            <div className={`
              absolute bg-slate-400 dark:bg-slate-500 rounded-full
              opacity-0 group-hover:opacity-100 transition-opacity
              ${isHorizontal 
                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8' 
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-8'
              }
            `} />
          </div>
        )}

        {/* Expand button when left is collapsed */}
        {isLeftCollapsed && (
          <button
            onClick={handleCollapseLeft}
            className={`
              flex-shrink-0 bg-slate-100 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-600
              hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors
              flex items-center justify-center
              ${isHorizontal ? 'w-8' : 'h-8'}
            `}
            title={`Expand ${isHorizontal ? 'left' : 'top'} pane`}
          >
            {isHorizontal ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5 rotate-90" />
            )}
          </button>
        )}

        {/* Right/Bottom Pane */}
        <div
          className={`
            relative overflow-hidden transition-all duration-300
            ${isRightCollapsed ? 'w-0 h-0' : ''}
          `}
          style={{
            [isHorizontal ? 'width' : 'height']: `${getRightSize()}%`
          }}
        >
          <div className="h-full w-full overflow-auto">
            {rightPane}
          </div>
          
          {/* Collapse button for right pane */}
          {collapsible && !isRightCollapsed && (
            <button
              onClick={handleCollapseRight}
              className={`
                absolute bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600
                rounded-full p-1 shadow-lg hover:shadow-xl transition-all
                hover:scale-110 z-10
                ${isHorizontal 
                  ? 'top-4 left-2' 
                  : 'top-2 left-4'
                }
              `}
              title={`Collapse ${isHorizontal ? 'right' : 'bottom'} pane`}
            >
              {isHorizontal ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 -rotate-90" />
              )}
            </button>
          )}
        </div>

        {/* Expand button when right is collapsed */}
        {isRightCollapsed && (
          <button
            onClick={handleCollapseRight}
            className={`
              flex-shrink-0 bg-slate-100 dark:bg-slate-800 border-l border-slate-300 dark:border-slate-600
              hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors
              flex items-center justify-center
              ${isHorizontal ? 'w-8' : 'h-8'}
            `}
            title={`Expand ${isHorizontal ? 'right' : 'bottom'} pane`}
          >
            {isHorizontal ? (
              <ChevronLeftIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5 -rotate-90" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Simple wrapper for common split view patterns
 */

// Master-Detail pattern (list + details)
interface MasterDetailProps {
  items: any[];
  selectedItem: any;
  renderItem: (item: any, isSelected: boolean) => React.ReactNode;
  renderDetail: (item: any) => React.ReactNode;
  onSelectItem: (item: any) => void;
  emptyDetailMessage?: string;
  storageKey?: string;
}

export const MasterDetailView: React.FC<MasterDetailProps> = ({
  items,
  selectedItem,
  renderItem,
  renderDetail,
  onSelectItem,
  emptyDetailMessage = 'Select an item to view details',
  storageKey
}) => {
  const leftPane = (
    <div className="h-full bg-slate-50 dark:bg-slate-900/50">
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
          No items to display
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="cursor-pointer"
            >
              {renderItem(item, selectedItem?.id === item.id)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const rightPane = selectedItem ? (
    <div className="h-full p-6">
      {renderDetail(selectedItem)}
    </div>
  ) : (
    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
      {emptyDetailMessage}
    </div>
  );

  return (
    <SplitView
      leftPane={leftPane}
      rightPane={rightPane}
      defaultLeftWidth={35}
      minLeftWidth={25}
      maxLeftWidth={50}
      storageKey={storageKey}
    />
  );
};
