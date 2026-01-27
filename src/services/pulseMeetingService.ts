// src/services/pulseMeetingService.ts
// Handles Pulse meeting integration with Logos calendar and activities
// Phase 9: Enhanced with auto-sync meeting notes to Documents

import { supabase } from './supabaseClient';
import { pulseDocumentSync } from './pulseDocumentSync';

// ============================================
// TYPES
// ============================================

export interface PulseMeeting {
  id: string;
  pulseMeetingId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  roomUrl?: string;
  roomId?: string;
  passcode?: string;
  isRecorded?: boolean;
  recordingUrl?: string;
  recordingDurationSeconds?: number;
  transcription?: string;
  organizerId?: string;
  organizerName?: string;
  attendees: MeetingAttendee[];
  agenda?: string;
  notes?: string;
  actionItems: ActionItem[];
  status: MeetingStatus;
  linkedProjectId?: string;
  linkedClientId?: string;
  linkedActivityId?: string;
  linkedCalendarEventId?: string;
  autoCreateActivity?: boolean;
  activityCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingAttendee {
  id: string;
  name: string;
  email?: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  isOrganizer?: boolean;
  joinedAt?: string;
  leftAt?: string;
}

export interface ActionItem {
  id: string;
  task: string;
  assigneeId?: string;
  assigneeName?: string;
  dueDate?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: { id?: string; name: string; email?: string }[];
  linkedProjectId?: string;
  linkedClientId?: string;
  autoCreateActivity?: boolean;
}

export interface MeetingRoomInfo {
  roomUrl: string;
  roomId: string;
  passcode?: string;
  expiresAt?: string;
}

// ============================================
// PULSE API CONFIGURATION
// ============================================

const PULSE_BASE_URL = import.meta.env.VITE_PULSE_API_URL || 'http://localhost:5174'; // Local Pulse app
const PULSE_SUPABASE_URL = import.meta.env.VITE_PULSE_SUPABASE_URL || import.meta.env.HUB_SUPABASE_URL;
const PULSE_SUPABASE_KEY = import.meta.env.VITE_PULSE_SUPABASE_KEY || import.meta.env.HUB_SUPABASE_ANON_KEY;

// ============================================
// ROW MAPPERS
// ============================================

const mapMeetingRow = (row: any): PulseMeeting => ({
  id: row.id,
  pulseMeetingId: row.pulse_meeting_id,
  title: row.title,
  description: row.description,
  startTime: row.start_time,
  endTime: row.end_time,
  timezone: row.timezone || 'America/New_York',
  roomUrl: row.room_url,
  roomId: row.room_id,
  passcode: row.passcode,
  isRecorded: row.is_recorded || false,
  recordingUrl: row.recording_url,
  recordingDurationSeconds: row.recording_duration_seconds,
  transcription: row.transcription,
  organizerId: row.organizer_id,
  organizerName: row.organizer_name,
  attendees: row.attendees || [],
  agenda: row.agenda,
  notes: row.notes,
  actionItems: row.action_items || [],
  status: row.status || 'scheduled',
  linkedProjectId: row.linked_project_id,
  linkedClientId: row.linked_client_id,
  linkedActivityId: row.linked_activity_id,
  linkedCalendarEventId: row.linked_calendar_event_id,
  autoCreateActivity: row.auto_create_activity !== false,
  activityCreated: row.activity_created || false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ============================================
// SERVICE
// ============================================

export const pulseMeetingService = {
  // ==========================================
  // MEETING CRUD
  // ==========================================

  async getMeetings(options?: {
    status?: MeetingStatus;
    projectId?: string;
    clientId?: string;
    upcoming?: boolean;
    limit?: number;
  }): Promise<PulseMeeting[]> {
    let query = supabase
      .from('pulse_meetings')
      .select('*')
      .order('start_time', { ascending: true });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.projectId) {
      query = query.eq('linked_project_id', options.projectId);
    }
    if (options?.clientId) {
      query = query.eq('linked_client_id', options.clientId);
    }
    if (options?.upcoming) {
      query = query.gte('start_time', new Date().toISOString());
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapMeetingRow);
  },

  async getMeetingById(id: string): Promise<PulseMeeting | null> {
    const { data, error } = await supabase
      .from('pulse_meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapMeetingRow(data);
  },

  /**
   * Get upcoming meetings (scheduled or in progress)
   */
  async getUpcomingMeetings(limit: number = 10): Promise<PulseMeeting[]> {
    const { data, error } = await supabase
      .from('pulse_meetings')
      .select('*')
      .in('status', ['scheduled', 'in_progress'])
      .gte('start_time', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Include meetings that started up to 1 hour ago
      .order('start_time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapMeetingRow);
  },

  async createMeeting(input: CreateMeetingInput): Promise<PulseMeeting> {
    // Generate meeting room
    const roomInfo = this.generateMeetingRoom();

    const attendees: MeetingAttendee[] = input.attendees.map((a, i) => ({
      id: a.id || `attendee-${Date.now()}-${i}`,
      name: a.name,
      email: a.email,
      status: 'pending',
      isOrganizer: i === 0,
    }));

    const { data, error } = await supabase
      .from('pulse_meetings')
      .insert({
        title: input.title,
        description: input.description,
        start_time: input.startTime,
        end_time: input.endTime,
        room_url: roomInfo.roomUrl,
        room_id: roomInfo.roomId,
        passcode: roomInfo.passcode,
        attendees,
        status: 'scheduled',
        linked_project_id: input.linkedProjectId,
        linked_client_id: input.linkedClientId,
        auto_create_activity: input.autoCreateActivity !== false,
        organizer_name: attendees[0]?.name,
      })
      .select()
      .single();

    if (error) throw error;
    return mapMeetingRow(data);
  },

  async updateMeeting(id: string, updates: Partial<PulseMeeting>): Promise<PulseMeeting> {
    const updateData: Record<string, any> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
    if (updates.attendees !== undefined) updateData.attendees = updates.attendees;
    if (updates.agenda !== undefined) updateData.agenda = updates.agenda;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.actionItems !== undefined) updateData.action_items = updates.actionItems;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.linkedProjectId !== undefined) updateData.linked_project_id = updates.linkedProjectId;
    if (updates.linkedClientId !== undefined) updateData.linked_client_id = updates.linkedClientId;
    if (updates.recordingUrl !== undefined) updateData.recording_url = updates.recordingUrl;
    if (updates.transcription !== undefined) updateData.transcription = updates.transcription;

    const { data, error } = await supabase
      .from('pulse_meetings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapMeetingRow(data);
  },

  async deleteMeeting(id: string): Promise<void> {
    const { error } = await supabase
      .from('pulse_meetings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ==========================================
  // MEETING ROOM MANAGEMENT
  // ==========================================

  generateMeetingRoom(projectId?: string): MeetingRoomInfo {
    const roomId = projectId || `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const passcode = Math.random().toString(36).substr(2, 6).toUpperCase();

    return {
      roomUrl: `${PULSE_BASE_URL}/meeting/${roomId}`,
      roomId,
      passcode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
  },

  openMeetingRoom(roomUrl: string): void {
    window.open(roomUrl, '_blank', 'width=1200,height=800,menubar=no,toolbar=no');
  },

  async startMeeting(meetingId: string): Promise<PulseMeeting> {
    return this.updateMeeting(meetingId, { status: 'in_progress' });
  },

  async endMeeting(
    meetingId: string,
    options?: {
      notes?: string;
      autoSaveNotes?: boolean;
      createActivity?: boolean;
    }
  ): Promise<PulseMeeting> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const updates: Partial<PulseMeeting> = { status: 'completed' };
    if (options?.notes) {
      updates.notes = meeting.notes
        ? `${meeting.notes}\n\n---\n\n${options.notes}`
        : options.notes;
    }

    const updatedMeeting = await this.updateMeeting(meetingId, updates);

    // Auto-save meeting notes to Documents if enabled
    if (options?.autoSaveNotes !== false && (updatedMeeting.notes || updatedMeeting.actionItems.length > 0)) {
      try {
        await this.autoSaveMeetingNotesToDocument(meetingId);
        console.log('✅ Meeting notes auto-saved to Documents');
      } catch (error) {
        console.error('Failed to auto-save meeting notes:', error);
      }
    }

    // Create activity if enabled
    if (options?.createActivity && updatedMeeting.autoCreateActivity && !updatedMeeting.activityCreated) {
      try {
        await this.createActivityFromMeeting(meetingId);
        console.log('✅ Activity created from meeting');
      } catch (error) {
        console.error('Failed to create activity from meeting:', error);
      }
    }

    return this.getMeetingById(meetingId) as Promise<PulseMeeting>;
  },

  // ==========================================
  // NOTES & ACTION ITEMS
  // ==========================================

  async addMeetingNotes(meetingId: string, notes: string): Promise<PulseMeeting> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const updatedNotes = meeting.notes
      ? `${meeting.notes}\n\n---\n\n${notes}`
      : notes;

    return this.updateMeeting(meetingId, { notes: updatedNotes });
  },

  async addActionItem(
    meetingId: string,
    task: string,
    assigneeId?: string,
    assigneeName?: string,
    dueDate?: string
  ): Promise<PulseMeeting> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const newItem: ActionItem = {
      id: `action-${Date.now()}`,
      task,
      assigneeId,
      assigneeName,
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const actionItems = [...meeting.actionItems, newItem];
    return this.updateMeeting(meetingId, { actionItems });
  },

  async updateActionItem(
    meetingId: string,
    actionItemId: string,
    updates: Partial<ActionItem>
  ): Promise<PulseMeeting> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const actionItems = meeting.actionItems.map(item =>
      item.id === actionItemId ? { ...item, ...updates } : item
    );

    return this.updateMeeting(meetingId, { actionItems });
  },

  async convertActionItemsToTasks(
    meetingId: string,
    projectId: string
  ): Promise<{ tasksCreated: number }> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const pendingItems = meeting.actionItems.filter(item => item.status === 'pending');
    let tasksCreated = 0;

    for (const item of pendingItems) {
      const { error } = await supabase
        .from('lv_tasks')
        .insert({
          description: item.task,
          project_id: projectId,
          assigned_to_id: item.assigneeId,
          due_date: item.dueDate || meeting.endTime,
          status: 'todo',
          created_at: new Date().toISOString(),
          notes: `Created from meeting: ${meeting.title}`,
        });

      if (!error) {
        tasksCreated++;
        // Mark action item as completed
        await this.updateActionItem(meetingId, item.id, { status: 'completed' });
      }
    }

    return { tasksCreated };
  },

  // ==========================================
  // CALENDAR INTEGRATION
  // ==========================================

  async linkToCalendarEvent(meetingId: string, calendarEventId: string): Promise<PulseMeeting> {
    const { data, error } = await supabase
      .from('pulse_meetings')
      .update({ linked_calendar_event_id: calendarEventId })
      .eq('id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return mapMeetingRow(data);
  },

  async createFromCalendarEvent(event: {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees?: { name: string; email?: string }[];
    projectId?: string;
    clientId?: string;
  }): Promise<PulseMeeting> {
    const meeting = await this.createMeeting({
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      attendees: event.attendees || [],
      linkedProjectId: event.projectId,
      linkedClientId: event.clientId,
    });

    // Link to calendar event
    await this.linkToCalendarEvent(meeting.id, event.id);

    return this.getMeetingById(meeting.id) as Promise<PulseMeeting>;
  },

  // ==========================================
  // ACTIVITY INTEGRATION
  // ==========================================

  async createActivityFromMeeting(meetingId: string): Promise<string> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    if (meeting.activityCreated) {
      throw new Error('Activity already created for this meeting');
    }

    // Build notes with action items
    let activityNotes = meeting.notes || '';
    if (meeting.actionItems.length > 0) {
      activityNotes += '\n\n**Action Items:**\n';
      meeting.actionItems.forEach(item => {
        activityNotes += `- ${item.task}${item.assigneeName ? ` (${item.assigneeName})` : ''}${item.dueDate ? ` - Due: ${item.dueDate}` : ''}\n`;
      });
    }

    // Create activity
    const { data, error } = await supabase
      .from('lv_activities')
      .insert({
        type: 'Meeting',
        title: `Meeting: ${meeting.title}`,
        description: meeting.description,
        activity_date: meeting.endTime,
        status: 'Completed',
        project_id: meeting.linkedProjectId,
        client_id: meeting.linkedClientId,
        notes: activityNotes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Mark meeting as having activity created
    await supabase
      .from('pulse_meetings')
      .update({
        activity_created: true,
        linked_activity_id: data.id,
      })
      .eq('id', meetingId);

    return data.id;
  },

  // ==========================================
  // RECORDINGS
  // ==========================================

  async saveRecording(
    meetingId: string,
    recordingUrl: string,
    durationSeconds?: number
  ): Promise<PulseMeeting> {
    return this.updateMeeting(meetingId, {
      recordingUrl,
      recordingDurationSeconds: durationSeconds,
      isRecorded: true,
    });
  },

  async saveTranscription(meetingId: string, transcription: string): Promise<PulseMeeting> {
    return this.updateMeeting(meetingId, { transcription });
  },

  // ==========================================
  // SYNC WITH PULSE
  // ==========================================

  async syncFromPulse(): Promise<{ meetingsSynced: number }> {
    console.log('🔄 Syncing meetings from Pulse...');

    try {
      const response = await fetch(`${PULSE_SUPABASE_URL}/rest/v1/logos_meetings`, {
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch meetings from Pulse');
      }

      const pulseMeetings = await response.json();
      let synced = 0;

      for (const pm of pulseMeetings) {
        const { error } = await supabase
          .from('pulse_meetings')
          .upsert({
            pulse_meeting_id: pm.id,
            title: pm.title,
            description: pm.description,
            start_time: pm.start_time,
            end_time: pm.end_time,
            room_url: pm.room_url,
            attendees: pm.attendees,
            status: pm.status,
            notes: pm.notes,
            recording_url: pm.recording_url,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'pulse_meeting_id',
          });

        if (!error) synced++;
      }

      console.log(`✅ Synced ${synced} meetings from Pulse`);
      return { meetingsSynced: synced };
    } catch (error) {
      console.error('❌ Failed to sync meetings from Pulse:', error);
      return { meetingsSynced: 0 };
    }
  },

  async syncToPulse(meeting: PulseMeeting): Promise<void> {
    console.log(`🔄 Syncing meeting "${meeting.title}" to Pulse...`);

    try {
      const response = await fetch(`${PULSE_SUPABASE_URL}/rest/v1/logos_meetings?on_conflict=id`, {
        method: 'POST',
        headers: {
          'apikey': PULSE_SUPABASE_KEY,
          'Authorization': `Bearer ${PULSE_SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation,resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: meeting.pulseMeetingId || meeting.id,
          title: meeting.title,
          description: meeting.description,
          start_time: meeting.startTime,
          end_time: meeting.endTime,
          room_url: meeting.roomUrl,
          attendees: meeting.attendees,
          status: meeting.status,
          notes: meeting.notes,
          project_id: meeting.linkedProjectId,
          synced_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync meeting to Pulse');
      }

      console.log(`✅ Meeting synced to Pulse`);
    } catch (error) {
      console.error('❌ Failed to sync meeting to Pulse:', error);
      throw error;
    }
  },

  // ==========================================
  // AUTO-SYNC MEETING NOTES TO DOCUMENTS
  // ==========================================

  /**
   * Automatically saves meeting notes as a document in the Document Library.
   * This is triggered when a meeting ends if it has notes or action items.
   */
  async autoSaveMeetingNotesToDocument(meetingId: string): Promise<string | null> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      console.warn('Meeting not found for auto-save:', meetingId);
      return null;
    }

    // Only save if there's content worth saving
    if (!meeting.notes && meeting.actionItems.length === 0 && !meeting.transcription) {
      console.log('No notes or action items to save for meeting:', meetingId);
      return null;
    }

    try {
      const documentId = await pulseDocumentSync.saveMeetingNotesAsDocument({
        id: meeting.id,
        title: meeting.title,
        notes: meeting.notes || '',
        actionItems: meeting.actionItems.map(item => ({
          task: item.task,
          assigneeName: item.assigneeName,
          dueDate: item.dueDate,
        })),
        recordingUrl: meeting.recordingUrl,
        transcription: meeting.transcription,
        linkedProjectId: meeting.linkedProjectId,
        linkedClientId: meeting.linkedClientId,
      });

      // Update meeting record with document link
      await supabase
        .from('pulse_meetings')
        .update({
          notes_document_id: documentId,
          notes_synced_at: new Date().toISOString(),
        })
        .eq('id', meetingId);

      console.log(`✅ Meeting notes saved as document: ${documentId}`);
      return documentId;
    } catch (error) {
      console.error('❌ Failed to save meeting notes as document:', error);
      throw error;
    }
  },

  /**
   * Manually trigger syncing meeting notes to Documents.
   * Use this for meetings that were completed before auto-sync was enabled.
   */
  async syncCompletedMeetingNotes(meetingId: string): Promise<string | null> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }
    if (meeting.status !== 'completed') {
      throw new Error('Can only sync notes for completed meetings');
    }
    return this.autoSaveMeetingNotesToDocument(meetingId);
  },

  /**
   * Batch sync all completed meetings that haven't had their notes saved.
   * Useful for initial migration or catching up after enabling auto-sync.
   */
  async batchSyncCompletedMeetingNotes(options?: {
    limit?: number;
    projectId?: string;
    clientId?: string;
  }): Promise<{ synced: number; failed: number }> {
    console.log('🔄 Batch syncing meeting notes to Documents...');

    let query = supabase
      .from('pulse_meetings')
      .select('id')
      .eq('status', 'completed')
      .is('notes_document_id', null)
      .or('notes.neq.,action_items.neq.[]');

    if (options?.projectId) {
      query = query.eq('linked_project_id', options.projectId);
    }
    if (options?.clientId) {
      query = query.eq('linked_client_id', options.clientId);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: meetings, error } = await query;

    if (error) {
      console.error('Failed to fetch meetings for batch sync:', error);
      return { synced: 0, failed: 0 };
    }

    let synced = 0;
    let failed = 0;

    for (const meeting of meetings || []) {
      try {
        await this.autoSaveMeetingNotesToDocument(meeting.id);
        synced++;
      } catch (err) {
        console.error(`Failed to sync meeting ${meeting.id}:`, err);
        failed++;
      }
    }

    console.log(`✅ Batch sync complete: ${synced} synced, ${failed} failed`);
    return { synced, failed };
  },

  /**
   * Watch for meeting completions and auto-sync notes.
   * This sets up a Supabase realtime subscription.
   */
  subscribeToMeetingCompletions(callback?: (documentId: string, meetingId: string) => void): () => void {
    const channel = supabase
      .channel('meeting-completions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pulse_meetings',
          filter: 'status=eq.completed',
        },
        async (payload) => {
          const meeting = payload.new as any;

          // Only process if this is a status change to completed
          if (payload.old && (payload.old as any).status !== 'completed') {
            console.log(`📝 Meeting completed: ${meeting.title}, auto-syncing notes...`);

            try {
              const documentId = await this.autoSaveMeetingNotesToDocument(meeting.id);
              if (documentId && callback) {
                callback(documentId, meeting.id);
              }
            } catch (error) {
              console.error('Auto-sync failed for meeting:', meeting.id, error);
            }
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ==========================================
  // UTILITIES
  // ==========================================

  formatMeetingDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  },

  isUpcoming(meeting: PulseMeeting): boolean {
    return new Date(meeting.startTime) > new Date();
  },

  isInProgress(meeting: PulseMeeting): boolean {
    const now = new Date();
    return new Date(meeting.startTime) <= now && new Date(meeting.endTime) >= now;
  },

  getAttendeeStatus(meeting: PulseMeeting): {
    accepted: number;
    pending: number;
    declined: number;
  } {
    return {
      accepted: meeting.attendees.filter(a => a.status === 'accepted').length,
      pending: meeting.attendees.filter(a => a.status === 'pending').length,
      declined: meeting.attendees.filter(a => a.status === 'declined').length,
    };
  },
};

export default pulseMeetingService;
