import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * PageContainer - Unified page wrapper for CMF Nothing Brand styling
 * Provides consistent layout for all major sections:
 * Organizations, Contacts, Households, Projects, Case Management, Activities
 */

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconGradient?: string;
  actions?: React.ReactNode;
  stats?: StatItem[];
  className?: string;
}

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}

const colorClasses = {
  default: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    value: 'text-slate-900 dark:text-white',
    icon: 'text-slate-500 dark:text-slate-400',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-500 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    value: 'text-red-700 dark:text-red-300',
    icon: 'text-red-500 dark:text-red-400',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
    value: 'text-sky-700 dark:text-sky-300',
    icon: 'text-sky-500 dark:text-sky-400',
  },
};

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  iconGradient = 'from-sky-500 to-cyan-500',
  actions,
  stats,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => {
            const colors = colorClasses[stat.color || 'default'];
            const StatIcon = stat.icon;

            return (
              <button
                key={index}
                onClick={stat.onClick}
                disabled={!stat.onClick}
                className={`
                  ${colors.bg} p-4 rounded-xl border border-slate-200 dark:border-slate-700
                  transition-all duration-200
                  ${stat.onClick ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  {StatIcon && <StatIcon className={`w-5 h-5 ${colors.icon}`} />}
                  {stat.trend && (
                    <span className={`text-xs font-medium ${stat.trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stat.trend.value >= 0 ? '+' : ''}{stat.trend.value}%
                    </span>
                  )}
                </div>
                <p className={`text-2xl font-bold ${colors.value}`}>{stat.value}</p>
                <p className={`text-xs mt-1 ${colors.text}`}>{stat.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
};

PageContainer.displayName = 'PageContainer';

/**
 * SectionCard - Card wrapper for page sections with CMF Nothing Brand styling
 */
interface SectionCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  padding = 'md',
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-900/50 rounded-xl
        border border-slate-200 dark:border-slate-800
        shadow-sm
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-sky-500 dark:text-sky-400" />}
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

SectionCard.displayName = 'SectionCard';

/**
 * FilterBar - Unified filter/search bar for all sections
 */
interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  showFiltersButton?: boolean;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  activeFilterCount?: number;
  onClearFilters?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  showFiltersButton = true,
  filtersOpen = false,
  onToggleFilters,
  activeFilterCount = 0,
  onClearFilters,
}) => {
  return (
    <SectionCard padding="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5
                bg-slate-50 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                rounded-lg
                text-slate-900 dark:text-white
                placeholder-slate-400 dark:placeholder-slate-500
                focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-transparent
                transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          {showFiltersButton && onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors
                ${filtersOpen || activeFilterCount > 0
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }
              `}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-sky-600 dark:bg-sky-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Clear Filters */}
          {activeFilterCount > 0 && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {filtersOpen && filters && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            {filters}
          </div>
        )}
      </div>
    </SectionCard>
  );
};

FilterBar.displayName = 'FilterBar';

/**
 * DataTable - Unified table styling for all sections
 */
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  onRowContextMenu?: (e: React.MouseEvent, item: T) => void;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  getItemId?: (item: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  onRowContextMenu,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyMessage = 'Try adjusting your filters',
  loading = false,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  getItemId = (item) => item.id,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <SectionCard padding="lg">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-sky-500 border-t-transparent"></div>
        </div>
      </SectionCard>
    );
  }

  if (data.length === 0) {
    return (
      <SectionCard padding="lg">
        <div className="text-center py-12">
          {emptyIcon && (
            <div className="text-slate-300 dark:text-slate-600 mb-4">
              {emptyIcon}
            </div>
          )}
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{emptyTitle}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{emptyMessage}</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && data.every(item => selectedIds.includes(getItemId(item)))}
                    onChange={() => {
                      if (data.every(item => selectedIds.includes(getItemId(item)))) {
                        data.forEach(item => onToggleSelect?.(getItemId(item)));
                      } else {
                        data.forEach(item => {
                          if (!selectedIds.includes(getItemId(item))) {
                            onToggleSelect?.(getItemId(item));
                          }
                        });
                      }
                    }}
                    className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {data.map((item, index) => (
              <tr
                key={getItemId(item) || index}
                onClick={() => onRowClick?.(item)}
                onContextMenu={(e) => onRowContextMenu?.(e, item)}
                className={`
                  transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  hover:bg-sky-50/50 dark:hover:bg-sky-900/10
                `}
              >
                {selectable && (
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(getItemId(item))}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.(getItemId(item));
                      }}
                      className="rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

DataTable.displayName = 'DataTable';

/**
 * ActionButton - Primary action button with CMF Nothing Brand styling
 */
interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
  ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 font-semibold rounded-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

ActionButton.displayName = 'ActionButton';
