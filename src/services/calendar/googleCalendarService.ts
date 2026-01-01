/**
 * Google Calendar Service Implementation
 * Handles OAuth and API calls to Google Calendar
 */

import { BaseCalendarService } from './baseCalendarService';
import type {
  CalendarEvent,
  CalendarListItem,
  CreateEventRequest,
  UpdateEventRequest,
  FreeBusyRequest,
  FreeBusyResponse,
  CalendarCredentials,
  OAuthConfig,
  TokenResponse,
  CalendarProvider,
} from './types';

export class GoogleCalendarService extends BaseCalendarService {
  provider: CalendarProvider = 'google';
  private static readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly API_BASE = 'https://www.googleapis.com/calendar/v3';
  
  constructor(config: OAuthConfig) {
    super(config);
  }
  
  // OAuth: Generate authorization URL
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `${GoogleCalendarService.AUTH_URL}?${params.toString()}`;
  }
  
  // OAuth: Exchange authorization code for tokens
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch(GoogleCalendarService.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to exchange code: ${error.error_description || error.error}`);
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }
  
  // OAuth: Refresh expired access token
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(GoogleCalendarService.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${error.error_description || error.error}`);
    }
    
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: refreshToken, // Google doesn't return new refresh token
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }
  
  // OAuth: Revoke access
  async revokeAccess(accessToken: string): Promise<void> {
    const response = await fetch(
      `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
      { method: 'POST' }
    );
    
    if (!response.ok) {
      throw new Error('Failed to revoke access');
    }
  }
  
  // Get list of user's calendars
  async listCalendars(credentials: CalendarCredentials): Promise<CalendarListItem[]> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const response = await fetch(`${GoogleCalendarService.API_BASE}/users/me/calendarList`, {
      headers: {
        Authorization: `Bearer ${validCreds.accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list calendars: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id,
      provider: 'google' as CalendarProvider,
      name: item.summary,
      description: item.description,
      backgroundColor: item.backgroundColor,
      foregroundColor: item.foregroundColor,
      primary: item.primary || false,
      writable: item.accessRole === 'owner' || item.accessRole === 'writer',
    }));
  }
  
  // List events in a date range
  async listEvents(
    credentials: CalendarCredentials,
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const params = new URLSearchParams({
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });
    
    const response = await fetch(
      `${GoogleCalendarService.API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: {
          Authorization: `Bearer ${validCreds.accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to list events: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map((item: any) => this.mapGoogleEventToCalendarEvent(item, calendarId));
  }
  
  // Get single event
  async getEvent(
    credentials: CalendarCredentials,
    calendarId: string,
    eventId: string
  ): Promise<CalendarEvent> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const response = await fetch(
      `${GoogleCalendarService.API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${validCreds.accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get event: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.mapGoogleEventToCalendarEvent(data, calendarId);
  }
  
  // Create new event
  async createEvent(
    credentials: CalendarCredentials,
    request: CreateEventRequest
  ): Promise<CalendarEvent> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const googleEvent = this.mapCreateRequestToGoogleEvent(request);
    
    const response = await fetch(
      `${GoogleCalendarService.API_BASE}/calendars/${encodeURIComponent(request.calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${validCreds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create event: ${error.message || response.statusText}`);
    }
    
    const data = await response.json();
    return this.mapGoogleEventToCalendarEvent(data, request.calendarId);
  }
  
  // Update existing event
  async updateEvent(
    credentials: CalendarCredentials,
    request: UpdateEventRequest
  ): Promise<CalendarEvent> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const googleEvent = this.mapCreateRequestToGoogleEvent(request);
    
    const response = await fetch(
      `${GoogleCalendarService.API_BASE}/calendars/${encodeURIComponent(request.calendarId)}/events/${request.eventId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${validCreds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.mapGoogleEventToCalendarEvent(data, request.calendarId);
  }
  
  // Delete event
  async deleteEvent(
    credentials: CalendarCredentials,
    calendarId: string,
    eventId: string
  ): Promise<void> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const response = await fetch(
      `${GoogleCalendarService.API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${validCreds.accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }
  }
  
  // Get free/busy information
  async getFreeBusy(
    credentials: CalendarCredentials,
    request: FreeBusyRequest
  ): Promise<FreeBusyResponse> {
    const validCreds = await this.ensureValidToken(credentials);
    
    const body = {
      timeMin: request.startTime.toISOString(),
      timeMax: request.endTime.toISOString(),
      items: request.calendarIds.map(id => ({ id })),
    };
    
    const response = await fetch(
      `${GoogleCalendarService.API_BASE}/freeBusy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${validCreds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get free/busy: ${response.statusText}`);
    }
    
    const data = await response.json();
    const calendars: FreeBusyResponse['calendars'] = {};
    
    for (const [calendarId, calendarData] of Object.entries(data.calendars)) {
      const busy = (calendarData as any).busy?.map((slot: any) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
      })) || [];
      
      calendars[calendarId] = { busy };
    }
    
    return { calendars };
  }
  
  // Helper: Map Google Calendar event to our format
  private mapGoogleEventToCalendarEvent(googleEvent: any, calendarId: string): CalendarEvent {
    const start = googleEvent.start.dateTime 
      ? new Date(googleEvent.start.dateTime)
      : new Date(googleEvent.start.date);
    const end = googleEvent.end.dateTime
      ? new Date(googleEvent.end.dateTime)
      : new Date(googleEvent.end.date);
    
    return {
      id: googleEvent.id,
      provider: 'google',
      title: googleEvent.summary || '(No title)',
      description: googleEvent.description,
      start,
      end,
      allDay: !googleEvent.start.dateTime,
      location: googleEvent.location,
      attendees: googleEvent.attendees?.map((a: any) => a.email),
      organizerEmail: googleEvent.organizer?.email,
      calendarId,
      status: googleEvent.status,
      visibility: googleEvent.visibility,
      htmlLink: googleEvent.htmlLink,
      reminders: googleEvent.reminders?.overrides?.map((r: any) => ({
        method: r.method,
        minutes: r.minutes,
      })),
    };
  }
  
  // Helper: Map our create request to Google format
  private mapCreateRequestToGoogleEvent(request: CreateEventRequest | UpdateEventRequest): any {
    const event: any = {
      summary: request.title,
      description: request.description,
      location: request.location,
    };
    
    // Handle all-day vs timed events
    if (request.allDay) {
      event.start = { date: request.start.toISOString().split('T')[0] };
      event.end = { date: request.end.toISOString().split('T')[0] };
    } else {
      event.start = { dateTime: request.start.toISOString() };
      event.end = { dateTime: request.end.toISOString() };
    }
    
    // Attendees
    if (request.attendees && request.attendees.length > 0) {
      event.attendees = request.attendees.map(email => ({ email }));
    }
    
    // Reminders
    if (request.reminders && request.reminders.length > 0) {
      event.reminders = {
        useDefault: false,
        overrides: request.reminders.map(r => ({
          method: r.method,
          minutes: r.minutes,
        })),
      };
    }
    
    // Recurrence (basic implementation)
    if (request.recurrence) {
      const rrule = this.buildRRule(request.recurrence);
      event.recurrence = [rrule];
    }
    
    return event;
  }
  
  // Helper: Build iCalendar RRULE string
  private buildRRule(recurrence: any): string {
    let rrule = `RRULE:FREQ=${recurrence.frequency.toUpperCase()}`;
    
    if (recurrence.interval) {
      rrule += `;INTERVAL=${recurrence.interval}`;
    }
    
    if (recurrence.count) {
      rrule += `;COUNT=${recurrence.count}`;
    }
    
    if (recurrence.until) {
      const until = recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rrule += `;UNTIL=${until}`;
    }
    
    if (recurrence.byDay && recurrence.byDay.length > 0) {
      rrule += `;BYDAY=${recurrence.byDay.join(',')}`;
    }
    
    return rrule;
  }
}
