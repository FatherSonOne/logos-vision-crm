import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Mobile-Optimized Components
 *
 * Features:
 * - Touch-friendly navigation
 * - Bottom navigation bar for mobile
 * - Swipeable cards and lists
 * - Pull-to-refresh functionality
 * - Mobile quick actions (FAB)
 * - Responsive data tables that transform on mobile
 */

// ============================================
// TYPES
// ============================================

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

// ============================================
// HOOK: Detect Mobile
// ============================================

export const useIsMobile = (breakpoint = 768): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

// ============================================
// HOOK: Pull to Refresh
// ============================================

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 80 }: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
    }
  }, [isPulling, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling: isPulling && pullDistance > 0
  };
};

// ============================================
// BOTTOM NAVIGATION BAR
// ============================================

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onNavigate
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16">
        {items.map(item => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-cyan-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ============================================
// FLOATING ACTION BUTTON (FAB)
// ============================================

interface FloatingActionButtonProps {
  actions: QuickAction[];
  mainIcon?: React.ReactNode;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  mainIcon
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMainIcon = (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      {/* Action buttons */}
      <div className={`absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            className={`flex items-center gap-3 pl-4 pr-3 py-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {action.label}
            </span>
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${action.color}`}>
              {action.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg flex items-center justify-center transition-transform duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {mainIcon || defaultMainIcon}
      </button>
    </div>
  );
};

// ============================================
// SWIPEABLE CARD
// ============================================

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: { label: string; color: string; icon: React.ReactNode };
  rightAction?: { label: string; color: string; icon: React.ReactNode };
  threshold?: number;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;

    // Limit swipe distance
    const limitedDiff = Math.max(Math.min(diff, 150), -150);
    setTranslateX(limitedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setTranslateX(0);
    setIsSwiping(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Left Action Background */}
      {rightAction && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center px-4 ${rightAction.color}`}
          style={{ width: Math.abs(Math.max(translateX, 0)) }}
        >
          {translateX > threshold / 2 && (
            <div className="flex items-center gap-2 text-white">
              {rightAction.icon}
              <span className="font-medium">{rightAction.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Right Action Background */}
      {leftAction && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end px-4 ${leftAction.color}`}
          style={{ width: Math.abs(Math.min(translateX, 0)) }}
        >
          {translateX < -threshold / 2 && (
            <div className="flex items-center gap-2 text-white">
              <span className="font-medium">{leftAction.label}</span>
              {leftAction.icon}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white dark:bg-slate-800 transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ============================================
// PULL TO REFRESH CONTAINER
// ============================================

interface PullToRefreshContainerProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  onRefresh,
  children,
  className = ''
}) => {
  const { containerRef, pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh,
    threshold: 80
  });

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{
          height: isPulling || isRefreshing ? `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px` : 0
        }}
      >
        <div className={`flex items-center gap-2 text-cyan-600 dark:text-cyan-400 ${isRefreshing ? 'animate-pulse' : ''}`}>
          {isRefreshing ? (
            <>
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Refreshing...</span>
            </>
          ) : pullDistance > 60 ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium">Release to refresh</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <span className="text-sm font-medium">Pull to refresh</span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};

// ============================================
// MOBILE DATA TABLE
// ============================================

interface MobileTableColumn<T> {
  key: keyof T;
  label: string;
  primary?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface MobileDataTableProps<T> {
  data: T[];
  columns: MobileTableColumn<T>[];
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
}

export function MobileDataTable<T>({
  data,
  columns,
  onRowClick,
  keyExtractor
}: MobileDataTableProps<T>) {
  const isMobile = useIsMobile();
  const primaryColumn = columns.find(c => c.primary) || columns[0];
  const secondaryColumns = columns.filter(c => c !== primaryColumn);

  if (!isMobile) {
    // Desktop table view
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              {columns.map(column => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.map(row => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
              >
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile card view
  return (
    <div className="space-y-3">
      {data.map(row => (
        <div
          key={keyExtractor(row)}
          onClick={() => onRowClick?.(row)}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 active:bg-slate-50 dark:active:bg-slate-700"
        >
          {/* Primary field */}
          <div className="font-medium text-slate-900 dark:text-white mb-2">
            {primaryColumn.render
              ? primaryColumn.render(row[primaryColumn.key], row)
              : String(row[primaryColumn.key] ?? '-')}
          </div>

          {/* Secondary fields in grid */}
          <div className="grid grid-cols-2 gap-2">
            {secondaryColumns.slice(0, 4).map(column => (
              <div key={String(column.key)}>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {column.label}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 truncate">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? '-')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MOBILE SEARCH BAR
// ============================================

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  onFilter?: () => void;
  hasActiveFilters?: boolean;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  onFilter,
  hasActiveFilters = false
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {onFilter && (
        <button
          onClick={onFilter}
          className={`p-3 rounded-xl transition-colors ${
            hasActiveFilters
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================
// SAMPLE ICONS FOR BOTTOM NAV
// ============================================

export const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

export const ContactsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

export const DonationsIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

export const TasksIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const MoreIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
