// Relationship Timeline Service - Aggregates activity data from multiple sources into unified timeline
import { supabase } from './supabaseClient';
import type {
  UnifiedTimelineEvent,
  TimelineFilters,
  TimelinePaginationCursor,
  TimelinePageResult,
  TimelineSummaryStats,
  TimelineEventSource,
  Activity,
  Touchpoint,
  Task,
  Donation,
  ProjectMilestone,
  CommunicationLog,
} from '../types';

// Helper function to convert database format to app format for activities
function mapActivityToEvent(activity: any): UnifiedTimelineEvent {
  return {
    id: `activity-${activity.id}`,
    eventId: activity.id,
    source: 'activity' as TimelineEventSource,
    title: activity.title,
    description: activity.notes,
    timestamp: new Date(activity.activity_date + (activity.activity_time ? ` ${activity.activity_time}` : '')),
    clientId: activity.client_id,
    projectId: activity.project_id,
    eventType: activity.type?.toLowerCase() || 'activity',
    status: activity.status,
    createdBy: activity.created_by_id,
    createdByName: activity.created_by_name,
    color: getEventTypeColor(activity.type),
    icon: getEventTypeIcon(activity.type),
  };
}

// Helper function to convert touchpoints to timeline events
function mapTouchpointToEvent(touchpoint: any): UnifiedTimelineEvent {
  return {
    id: `touchpoint-${touchpoint.id}`,
    eventId: touchpoint.id,
    source: 'touchpoint' as TimelineEventSource,
    title: touchpoint.subject || `${touchpoint.touchpoint_type} - ${touchpoint.direction}`,
    description: touchpoint.description,
    timestamp: new Date(touchpoint.touchpoint_date),
    clientId: touchpoint.client_id,
    donorMoveId: touchpoint.donor_move_id,
    eventType: touchpoint.touchpoint_type,
    sentiment: touchpoint.sentiment,
    engagementLevel: touchpoint.engagement_level,
    createdBy: touchpoint.recorded_by,
    color: '#8b5cf6',
    icon: 'handshake',
  };
}

// Helper function to convert tasks to timeline events
function mapTaskToEvent(task: any): UnifiedTimelineEvent {
  return {
    id: `task-${task.id}`,
    eventId: task.id,
    source: 'task' as TimelineEventSource,
    title: task.title || task.description,
    description: task.notes,
    timestamp: new Date(task.due_date),
    projectId: task.project_id,
    eventType: task.status === 'Done' ? 'task_completed' : 'task_created',
    status: task.status,
    priority: task.priority,
    createdByName: task.assigned_to_name,
    color: '#f59e0b',
    icon: task.status === 'Done' ? 'check-circle' : 'circle',
  };
}

// Helper function to convert donations to timeline events
function mapDonationToEvent(donation: any): UnifiedTimelineEvent {
  return {
    id: `donation-${donation.id}`,
    eventId: donation.id,
    source: 'donation' as TimelineEventSource,
    title: `Donation: $${donation.amount.toLocaleString()}`,
    description: donation.notes,
    timestamp: new Date(donation.donation_date),
    clientId: donation.client_id,
    eventType: 'donation',
    amount: donation.amount,
    color: '#22c55e',
    icon: 'dollar-sign',
  };
}

// Helper function to convert project milestones to timeline events
function mapMilestoneToEvent(milestone: any, projectName?: string): UnifiedTimelineEvent {
  return {
    id: `milestone-${milestone.id}`,
    eventId: milestone.id,
    source: 'project_milestone' as TimelineEventSource,
    title: milestone.name,
    description: milestone.description,
    timestamp: new Date(milestone.due_date),
    projectId: milestone.project_id,
    eventType: milestone.type?.toLowerCase() || 'milestone',
    status: milestone.status,
    amount: milestone.amount,
    color: '#10b981',
    icon: 'flag',
  };
}

// Helper function to convert communication logs to timeline events
function mapCommunicationLogToEvent(log: any): UnifiedTimelineEvent {
  return {
    id: `communication-${log.id}`,
    eventId: log.id,
    source: 'communication_log' as TimelineEventSource,
    title: log.subject || `${log.type} - ${log.direction}`,
    description: log.content,
    timestamp: new Date(log.sent_at),
    clientId: log.client_id,
    eventType: log.type,
    color: '#ec4899',
    icon: log.type === 'email' ? 'mail' : 'phone',
  };
}

// Helper functions for UI display
function getEventTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'call': '#3b82f6',
    'email': '#8b5cf6',
    'meeting': '#10b981',
    'note': '#6b7280',
  };
  return colors[type?.toLowerCase()] || '#6b7280';
}

function getEventTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'call': 'phone',
    'email': 'mail',
    'meeting': 'users',
    'note': 'file-text',
  };
  return icons[type?.toLowerCase()] || 'activity';
}

export const relationshipTimelineService = {
  /**
   * Fetch paginated timeline events from multiple sources
   */
  async fetchTimeline(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    pageSize: number = 20
  ): Promise<TimelinePageResult> {
    try {
      const allEvents: UnifiedTimelineEvent[] = [];

      // Fetch from each enabled source in parallel
      const promises: Promise<UnifiedTimelineEvent[]>[] = [];

      if (filters.eventSources.includes('activity')) {
        promises.push(this.fetchActivities(filters, cursor, pageSize));
      }
      if (filters.eventSources.includes('touchpoint')) {
        promises.push(this.fetchTouchpoints(filters, cursor, pageSize));
      }
      if (filters.eventSources.includes('task')) {
        promises.push(this.fetchTasks(filters, cursor, pageSize));
      }
      if (filters.eventSources.includes('donation')) {
        promises.push(this.fetchDonations(filters, cursor, pageSize));
      }
      if (filters.eventSources.includes('project_milestone')) {
        promises.push(this.fetchMilestones(filters, cursor, pageSize));
      }
      if (filters.eventSources.includes('communication_log')) {
        promises.push(this.fetchCommunicationLogs(filters, cursor, pageSize));
      }

      const results = await Promise.all(promises);
      results.forEach(events => allEvents.push(...events));

      // Sort by timestamp descending
      allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply search filter if present
      let filteredEvents = allEvents;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredEvents = allEvents.filter(event =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
        );
      }

      // Apply pagination
      const paginatedEvents = filteredEvents.slice(0, pageSize);
      const hasMore = filteredEvents.length > pageSize;
      const nextCursor = hasMore && paginatedEvents.length > 0
        ? {
            timestamp: paginatedEvents[paginatedEvents.length - 1].timestamp,
            eventId: paginatedEvents[paginatedEvents.length - 1].eventId,
          }
        : undefined;

      return {
        events: paginatedEvents,
        nextCursor,
        hasMore,
        totalCount: filteredEvents.length,
      };
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  },

  /**
   * Fetch activities for timeline
   */
  async fetchActivities(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    limit: number = 100
  ): Promise<UnifiedTimelineEvent[]> {
    try {
      let query = supabase
        .from('activities')
        .select('*, team_members!activities_created_by_id_fkey(name)');

      // Apply entity filter (skip if entityId is "all" or "demo")
      if (filters.entityId !== 'all' && !filters.entityId.startsWith('demo-')) {
        if (filters.entityType === 'contact' || filters.entityType === 'organization') {
          query = query.eq('client_id', filters.entityId);
        } else if (filters.entityType === 'project') {
          query = query.eq('project_id', filters.entityId);
        }
      }

    // Apply date range filters
    if (filters.dateFrom) {
      query = query.gte('activity_date', filters.dateFrom.toISOString().split('T')[0]);
    }
    if (filters.dateTo) {
      query = query.lte('activity_date', filters.dateTo.toISOString().split('T')[0]);
    }

    // Apply cursor for pagination
    if (cursor) {
      query = query.lt('activity_date', cursor.timestamp.toISOString().split('T')[0]);
    }

      query = query.order('activity_date', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(activity => mapActivityToEvent({
        ...activity,
        created_by_name: activity.team_members?.name,
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Fetch touchpoints for timeline
   */
  async fetchTouchpoints(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    limit: number = 100
  ): Promise<UnifiedTimelineEvent[]> {
    try {
      let query = supabase
        .from('touchpoints')
        .select('*');

      if (filters.entityId !== 'all' && !filters.entityId.startsWith('demo-')) {
        if (filters.entityType === 'contact' || filters.entityType === 'organization') {
          query = query.eq('client_id', filters.entityId);
        }
      }

      if (filters.dateFrom) {
        query = query.gte('touchpoint_date', filters.dateFrom.toISOString().split('T')[0]);
      }
      if (filters.dateTo) {
        query = query.lte('touchpoint_date', filters.dateTo.toISOString().split('T')[0]);
      }

      if (cursor) {
        query = query.lt('touchpoint_date', cursor.timestamp.toISOString().split('T')[0]);
      }

      query = query.order('touchpoint_date', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(mapTouchpointToEvent);
    } catch (error) {
      console.error('Error fetching touchpoints:', error);
      return [];
    }
  },

  /**
   * Fetch tasks for timeline
   */
  async fetchTasks(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    limit: number = 100
  ): Promise<UnifiedTimelineEvent[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*, team_members!tasks_team_member_id_fkey(name)');

      if (filters.entityId !== 'all' && !filters.entityId.startsWith('demo-')) {
        if (filters.entityType === 'project') {
          query = query.eq('project_id', filters.entityId);
        }
      }

      if (filters.dateFrom) {
        query = query.gte('due_date', filters.dateFrom.toISOString().split('T')[0]);
      }
      if (filters.dateTo) {
        query = query.lte('due_date', filters.dateTo.toISOString().split('T')[0]);
      }

      if (cursor) {
        query = query.lt('due_date', cursor.timestamp.toISOString().split('T')[0]);
      }

      query = query.order('due_date', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(task => mapTaskToEvent({
        ...task,
        assigned_to_name: task.team_members?.name,
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  /**
   * Fetch donations for timeline
   */
  async fetchDonations(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    limit: number = 100
  ): Promise<UnifiedTimelineEvent[]> {
    try {
      let query = supabase
        .from('donations')
        .select('*');

      if (filters.entityId !== 'all' && !filters.entityId.startsWith('demo-')) {
        if (filters.entityType === 'contact' || filters.entityType === 'organization') {
          query = query.eq('client_id', filters.entityId);
        }
      }

      if (filters.dateFrom) {
        query = query.gte('donation_date', filters.dateFrom.toISOString().split('T')[0]);
      }
      if (filters.dateTo) {
        query = query.lte('donation_date', filters.dateTo.toISOString().split('T')[0]);
      }

      if (cursor) {
        query = query.lt('donation_date', cursor.timestamp.toISOString().split('T')[0]);
      }

      query = query.order('donation_date', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(mapDonationToEvent);
    } catch (error) {
      console.error('Error fetching donations:', error);
      return [];
    }
  },

  /**
   * Fetch project milestones for timeline
   * NOTE: project_milestones table does not exist yet - returning empty array
   */
  async fetchMilestones(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    limit: number = 100
  ): Promise<UnifiedTimelineEvent[]> {
    // Table does not exist in current schema
    return [];

    /* Disabled until project_milestones table is created
    try {
      let query = supabase
        .from('project_milestones')
        .select('*, projects(name)');

      if (filters.entityId !== 'all' && !filters.entityId.startsWith('demo-')) {
        if (filters.entityType === 'project') {
          query = query.eq('project_id', filters.entityId);
        }
      }

      if (filters.dateFrom) {
        query = query.gte('due_date', filters.dateFrom.toISOString().split('T')[0]);
      }
      if (filters.dateTo) {
        query = query.lte('due_date', filters.dateTo.toISOString().split('T')[0]);
      }

      if (cursor) {
        query = query.lt('due_date', cursor.timestamp.toISOString().split('T')[0]);
      }

      query = query.order('due_date', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(milestone => mapMilestoneToEvent(milestone, milestone.projects?.name));
    } catch (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }
    */
  },

  /**
   * Fetch communication logs for timeline
   * NOTE: communication_logs table does not exist yet - returning empty array
   */
  async fetchCommunicationLogs(
    filters: TimelineFilters,
    cursor?: TimelinePaginationCursor,
    limit: number = 100
  ): Promise<UnifiedTimelineEvent[]> {
    // Table does not exist in current schema (should be communication_log singular)
    return [];

    /* Disabled until communication_logs table is created
    try {
      let query = supabase
        .from('communication_logs')
        .select('*');

      if (filters.entityId !== 'all' && !filters.entityId.startsWith('demo-')) {
        if (filters.entityType === 'contact' || filters.entityType === 'organization') {
          query = query.eq('client_id', filters.entityId);
        }
      }

      if (filters.dateFrom) {
        query = query.gte('sent_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('sent_at', filters.dateTo.toISOString());
      }

      if (cursor) {
        query = query.lt('sent_at', cursor.timestamp.toISOString());
      }

      query = query.order('sent_at', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(mapCommunicationLogToEvent);
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      return [];
    }
    */
  },

  /**
   * Get summary statistics for timeline
   */
  async getSummaryStats(
    entityId: string,
    filters: Partial<TimelineFilters>
  ): Promise<TimelineSummaryStats> {
    const fullFilters: TimelineFilters = {
      entityType: filters.entityType || 'contact',
      entityId,
      eventSources: filters.eventSources || ['activity', 'touchpoint', 'task', 'donation', 'project_milestone', 'communication_log'],
      eventTypes: filters.eventTypes || [],
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      teamMemberIds: filters.teamMemberIds,
      projectIds: filters.projectIds,
      statusFilters: filters.statusFilters,
      priorityFilters: filters.priorityFilters,
    };

    const result = await this.fetchTimeline(fullFilters, undefined, 1000);

    const eventCounts: Record<TimelineEventSource, number> = {
      activity: 0,
      touchpoint: 0,
      task: 0,
      project_milestone: 0,
      calendar_event: 0,
      communication_log: 0,
      donation: 0,
    };

    const participantMap = new Map<string, { id: string; name: string; count: number }>();

    let earliest = new Date();
    let latest = new Date(0);

    result.events.forEach(event => {
      eventCounts[event.source]++;

      if (event.timestamp < earliest) earliest = event.timestamp;
      if (event.timestamp > latest) latest = event.timestamp;

      if (event.createdByName) {
        const existing = participantMap.get(event.createdByName);
        if (existing) {
          existing.count++;
        } else {
          participantMap.set(event.createdByName, {
            id: event.createdBy || event.createdByName,
            name: event.createdByName,
            count: 1,
          });
        }
      }
    });

    const topParticipants = Array.from(participantMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivity = result.events.filter(e => e.timestamp >= thirtyDaysAgo).length;

    return {
      totalEvents: result.events.length,
      eventCounts,
      dateRange: { earliest, latest },
      topParticipants,
      recentActivity,
    };
  },

  /**
   * Create a new activity/event
   */
  async createActivity(data: {
    type: string;
    title: string;
    description?: string;
    activityDate: string;
    activityTime?: string;
    projectId?: string;
    clientId?: string;
    createdById?: string;
  }): Promise<UnifiedTimelineEvent> {
    const { data: activity, error } = await supabase
      .from('activities')
      .insert([{
        type: data.type,
        title: data.title,
        notes: data.description,
        activity_date: data.activityDate,
        activity_time: data.activityTime,
        project_id: data.projectId || null,
        client_id: data.clientId || null,
        created_by_id: data.createdById || null,
        status: 'Completed',
        shared_with_client: false,
      }])
      .select('*, team_members!activities_created_by_id_fkey(name)')
      .single();

    if (error) throw error;

    return mapActivityToEvent({
      ...activity,
      created_by_name: activity.team_members?.name,
    });
  },

  /**
   * Subscribe to real-time updates for timeline events
   */
  subscribeToUpdates(
    entityId: string,
    entityType: 'contact' | 'organization' | 'project',
    onUpdate: (event: UnifiedTimelineEvent) => void
  ): () => void {
    const subscriptions: any[] = [];

    // Subscribe to activities
    const activitiesChannel = supabase
      .channel('timeline-activities')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: entityType === 'project' ? `project_id=eq.${entityId}` : `client_id=eq.${entityId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(mapActivityToEvent(payload.new));
        }
      })
      .subscribe();

    subscriptions.push(activitiesChannel);

    // Subscribe to touchpoints
    if (entityType !== 'project') {
      const touchpointsChannel = supabase
        .channel('timeline-touchpoints')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'touchpoints',
          filter: `client_id=eq.${entityId}`,
        }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onUpdate(mapTouchpointToEvent(payload.new));
          }
        })
        .subscribe();

      subscriptions.push(touchpointsChannel);
    }

    // Subscribe to tasks
    const tasksChannel = supabase
      .channel('timeline-tasks')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${entityId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          onUpdate(mapTaskToEvent(payload.new));
        }
      })
      .subscribe();

    subscriptions.push(tasksChannel);

    // Subscribe to donations
    if (entityType !== 'project') {
      const donationsChannel = supabase
        .channel('timeline-donations')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'donations',
          filter: `client_id=eq.${entityId}`,
        }, (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onUpdate(mapDonationToEvent(payload.new));
          }
        })
        .subscribe();

      subscriptions.push(donationsChannel);
    }

    // Return unsubscribe function
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  },
};
