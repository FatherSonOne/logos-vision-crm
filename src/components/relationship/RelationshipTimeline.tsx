import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineFiltersPanel } from './TimelineFilters';
import { TimelineHeader } from './TimelineHeader';
import { relationshipTimelineService } from '../../services/relationshipTimelineService';
import type {
  UnifiedTimelineEvent,
  TimelineFilters,
  TimelinePaginationCursor,
  TimelineSummaryStats,
} from '../../types';

interface RelationshipTimelineProps {
  entityId: string;
  entityName: string;
  entityType: 'contact' | 'organization' | 'project';
  teamMembers?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  onEventClick?: (event: UnifiedTimelineEvent) => void;
  onAddEvent?: () => void;
}

// Date grouping helper
const groupEventsByDate = (events: UnifiedTimelineEvent[]) => {
  const groups: { label: string; events: UnifiedTimelineEvent[] }[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  let currentGroup: { label: string; events: UnifiedTimelineEvent[] } | null = null;

  events.forEach(event => {
    const eventDate = new Date(event.timestamp);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    let label: string;
    if (eventDay.getTime() === today.getTime()) {
      label = 'Today';
    } else if (eventDay.getTime() === yesterday.getTime()) {
      label = 'Yesterday';
    } else if (eventDate >= thisWeek) {
      label = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
    } else if (eventDate.getFullYear() === now.getFullYear()) {
      label = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } else {
      label = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, events: [event] };
      groups.push(currentGroup);
    } else {
      currentGroup.events.push(event);
    }
  });

  return groups;
};

export const RelationshipTimeline: React.FC<RelationshipTimelineProps> = ({
  entityId,
  entityName,
  entityType,
  teamMembers = [],
  projects = [],
  onEventClick,
  onAddEvent,
}) => {
  const [events, setEvents] = useState<UnifiedTimelineEvent[]>([]);
  const [filters, setFilters] = useState<TimelineFilters>({
    entityType,
    entityId,
    eventSources: ['activity', 'touchpoint', 'task', 'donation', 'project_milestone', 'communication_log'],
    eventTypes: [],
    searchQuery: '',
  });
  const [cursor, setCursor] = useState<TimelinePaginationCursor | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [stats, setStats] = useState<TimelineSummaryStats | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial events
  const loadInitialEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await relationshipTimelineService.fetchTimeline(filters, undefined, 20);
      setEvents(result.events);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Load more events
  const loadMoreEvents = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const result = await relationshipTimelineService.fetchTimeline(filters, cursor, 20);
      setEvents(prev => [...prev, ...result.events]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, cursor, hasMore, isLoadingMore]);

  // Load summary stats
  const loadStats = useCallback(async () => {
    try {
      const summaryStats = await relationshipTimelineService.getSummaryStats(entityId, filters);
      setStats(summaryStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [entityId, filters]);

  // Initial load
  useEffect(() => {
    loadInitialEvents();
    loadStats();
  }, [loadInitialEvents, loadStats]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreEvents();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMoreEvents]);

  // Real-time subscriptions
  useEffect(() => {
    const unsubscribe = relationshipTimelineService.subscribeToUpdates(
      entityId,
      entityType,
      (newEvent) => {
        // Add new event to the top of the list
        setEvents(prev => {
          // Check if event already exists (update case)
          const existingIndex = prev.findIndex(e => e.id === newEvent.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newEvent;
            return updated;
          }
          // New event - add to top
          return [newEvent, ...prev];
        });

        // Reload stats
        loadStats();
      }
    );

    return () => unsubscribe();
  }, [entityId, entityType, loadStats]);

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Title', 'Description', 'Created By', 'Status', 'Amount'];
    const rows = events.map(event => [
      event.timestamp.toISOString(),
      event.source,
      event.title,
      event.description || '',
      event.createdByName || '',
      event.status || '',
      event.amount?.toString() || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${entityName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [events, entityName]);

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900">
      {/* Filters Sidebar */}
      <TimelineFiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        teamMembers={teamMembers}
        projects={projects}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TimelineHeader
          entityName={entityName}
          entityType={entityType}
          stats={stats}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onExport={handleExport}
        />

        {/* Timeline Feed */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Event Button */}
          {onAddEvent && (
            <button
              onClick={onAddEvent}
              className="w-full mb-4 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Timeline Event</span>
              </div>
            </button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && events.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Timeline Events
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {searchQuery
                  ? 'No events match your search criteria. Try adjusting your filters.'
                  : 'There are no recorded events for this entity yet. Start by adding activities, touchpoints, or tasks.'}
              </p>
            </div>
          )}

          {/* Event Groups */}
          {!isLoading && groupedEvents.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {/* Date Group Header */}
              <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 pb-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {group.label}
                </h3>
              </div>

              {/* Events in Group */}
              {group.events.map(event => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick}
                />
              ))}
            </div>
          ))}

          {/* Load More Trigger */}
          {hasMore && !isLoading && (
            <div ref={observerTarget} className="flex items-center justify-center py-8">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more events...</span>
                </div>
              )}
            </div>
          )}

          {/* End of Timeline */}
          {!hasMore && events.length > 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-12 h-px bg-slate-300 dark:bg-slate-600"></div>
                <span>End of timeline</span>
                <div className="w-12 h-px bg-slate-300 dark:bg-slate-600"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
