import React, { useState } from 'react';
import { Search, Download, Calendar, TrendingUp, X } from 'lucide-react';
import type { TimelineSummaryStats } from '../../types';

interface TimelineHeaderProps {
  entityName: string;
  entityType: 'contact' | 'organization' | 'project';
  stats?: TimelineSummaryStats;
  searchQuery?: string;
  onSearchChange: (query: string) => void;
  onExport?: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  entityName,
  entityType,
  stats,
  searchQuery = '',
  onSearchChange,
  onExport,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  const formatDateRange = () => {
    if (!stats?.dateRange) return '';

    const { earliest, latest } = stats.dateRange;
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 90) {
      return `Last ${diffDays} days`;
    } else if (diffDays <= 365) {
      return `Last ${Math.floor(diffDays / 30)} months`;
    } else {
      return `Since ${earliest.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      {/* Title Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Relationship Timeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Activity history for {entityName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`
              p-2 rounded-lg transition-colors
              ${showSearch
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }
            `}
            title="Search timeline"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Export Button */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Export timeline"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search timeline events..."
              className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Events */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              <span>Total Events</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalEvents}
            </div>
            {stats.dateRange && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatDateRange()}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>Last 30 Days</span>
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {stats.recentActivity}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {stats.totalEvents > 0
                ? `${Math.round((stats.recentActivity / stats.totalEvents) * 100)}% of total`
                : 'No activity'
              }
            </div>
          </div>

          {/* Top Event Type */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs mb-1">
              <Calendar className="w-3 h-3" />
              <span>Most Common</span>
            </div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300 truncate">
              {Object.entries(stats.eventCounts)
                .sort(([, a], [, b]) => b - a)[0]?.[0]
                ?.replace('_', ' ')
                ?.replace(/\b\w/g, l => l.toUpperCase()) || 'None'}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {Object.values(stats.eventCounts).reduce((a, b) => Math.max(a, b), 0)} events
            </div>
          </div>

          {/* Top Participant */}
          {stats.topParticipants && stats.topParticipants.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Top Participant</span>
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300 truncate">
                {stats.topParticipants[0].name}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {stats.topParticipants[0].count} events
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
