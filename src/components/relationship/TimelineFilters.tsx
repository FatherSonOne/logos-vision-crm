import React, { useState } from 'react';
import { X, Calendar, Users, FolderKanban, RotateCcw } from 'lucide-react';
import type { TimelineFilters, TimelineEventSource, TIMELINE_EVENT_SOURCE_LABELS } from '../../types';
import { TIMELINE_EVENT_SOURCE_LABELS as SOURCE_LABELS } from '../../types';

interface TimelineFiltersProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  teamMembers?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
}

export const TimelineFiltersPanel: React.FC<TimelineFiltersProps> = ({
  filters,
  onFiltersChange,
  teamMembers = [],
  projects = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleEventSourceToggle = (source: TimelineEventSource) => {
    const newSources = filters.eventSources.includes(source)
      ? filters.eventSources.filter(s => s !== source)
      : [...filters.eventSources, source];

    onFiltersChange({ ...filters, eventSources: newSources });
  };

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    const date = value ? new Date(value) : undefined;
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'dateFrom' : 'dateTo']: date,
    });
  };

  const handleQuickDateFilter = (days: number) => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    onFiltersChange({
      ...filters,
      dateFrom: pastDate,
      dateTo: today,
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      ...filters,
      eventSources: ['activity', 'touchpoint', 'task', 'donation', 'project_milestone', 'communication_log'],
      dateFrom: undefined,
      dateTo: undefined,
      teamMemberIds: [],
      projectIds: [],
      statusFilters: [],
      priorityFilters: [],
    });
  };

  const handleTeamMemberToggle = (memberId: string) => {
    const newMembers = filters.teamMemberIds?.includes(memberId)
      ? filters.teamMemberIds.filter(id => id !== memberId)
      : [...(filters.teamMemberIds || []), memberId];

    onFiltersChange({ ...filters, teamMemberIds: newMembers });
  };

  const handleProjectToggle = (projectId: string) => {
    const newProjects = filters.projectIds?.includes(projectId)
      ? filters.projectIds.filter(id => id !== projectId)
      : [...(filters.projectIds || []), projectId];

    onFiltersChange({ ...filters, projectIds: newProjects });
  };

  const eventSources: TimelineEventSource[] = [
    'activity',
    'touchpoint',
    'task',
    'donation',
    'project_milestone',
    'communication_log',
  ];

  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Filters</h3>
          <button
            onClick={handleResetFilters}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        </div>

        {/* Event Sources */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Event Types
          </h4>
          <div className="space-y-2">
            {eventSources.map(source => (
              <label key={source} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.eventSources.includes(source)}
                  onChange={() => handleEventSourceToggle(source)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                  {SOURCE_LABELS[source]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400">From</label>
              <input
                type="date"
                value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400">To</label>
              <input
                type="date"
                value={filters.dateTo?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-3 space-y-1">
            <button
              onClick={() => handleQuickDateFilter(7)}
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Last 7 days
            </button>
            <button
              onClick={() => handleQuickDateFilter(30)}
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Last 30 days
            </button>
            <button
              onClick={() => handleQuickDateFilter(90)}
              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Last 90 days
            </button>
          </div>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teamMembers.map(member => (
                <label key={member.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.teamMemberIds?.includes(member.id)}
                    onChange={() => handleTeamMemberToggle(member.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                    {member.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && filters.entityType === 'contact' && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Projects
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {projects.map(project => (
                <label key={project.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.projectIds?.includes(project.id)}
                    onChange={() => handleProjectToggle(project.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                    {project.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters Count */}
        {(filters.eventSources.length < 6 || filters.dateFrom || filters.dateTo ||
          (filters.teamMemberIds && filters.teamMemberIds.length > 0) ||
          (filters.projectIds && filters.projectIds.length > 0)) && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {[
                filters.eventSources.length < 6 ? `${6 - filters.eventSources.length} sources hidden` : null,
                filters.dateFrom || filters.dateTo ? 'Date range set' : null,
                filters.teamMemberIds?.length ? `${filters.teamMemberIds.length} team members` : null,
                filters.projectIds?.length ? `${filters.projectIds.length} projects` : null,
              ].filter(Boolean).join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
