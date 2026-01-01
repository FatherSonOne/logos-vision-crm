/**
 * Calendar Integration Types
 * Defines interfaces for multi-provider calendar sync
 */

export type CalendarProvider = 'google' | 'microsoft' | 'apple' | 'outlook';

export interface CalendarCredentials {
  provider: CalendarProvider;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  email?: string;
}

export interface CalendarEvent {
  id: string;
  provider: CalendarProvider;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  attendees?: string[];
  organizerEmail?: string;
  calendarId: string;
  recurrence?: RecurrenceRule;
  reminders?: EventReminder[];
  color?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'public' | 'private';
  // CRM-specific fields
  teamMemberId?: string;
  projectId?: string;
  clientId?: string;
  htmlLink?: string; // Link to event in provider's calendar
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  count?: number;
  until?: Date;
  byDay?: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[];
}

export interface EventReminder {
  method: 'email' | 'popup';
  minutes: number;
}

export interface CalendarListItem {
  id: string;
  provider: CalendarProvider;
  name: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary?: boolean;
  writable?: boolean;
}

export interface CreateEventRequest {
  calendarId: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  attendees?: string[];
  recurrence?: RecurrenceRule;
  reminders?: EventReminder[];
}

export interface UpdateEventRequest extends CreateEventRequest {
  eventId: string;
}

export interface FreeBusyRequest {
  calendarIds: string[];
  startTime: Date;
  endTime: Date;
}

export interface FreeBusyResponse {
  calendars: {
    [calendarId: string]: {
      busy: Array<{ start: Date; end: Date }>;
      errors?: Array<{ domain: string; reason: string }>;
    };
  };
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string;
  scope?: string;
}

export interface CalendarSyncStatus {
  provider: CalendarProvider;
  lastSyncTime?: Date;
  syncEnabled: boolean;
  calendarsCount: number;
  eventsCount: number;
  errors?: string[];
}
