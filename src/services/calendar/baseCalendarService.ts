/**
 * Base Calendar Service Interface
 * All calendar providers must implement this interface
 */

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

export interface ICalendarService {
  provider: CalendarProvider;
  
  // OAuth & Authentication
  getAuthUrl(state?: string): string;
  exchangeCodeForToken(code: string): Promise<TokenResponse>;
  refreshAccessToken(refreshToken: string): Promise<TokenResponse>;
  revokeAccess(accessToken: string): Promise<void>;
  
  // Calendar List
  listCalendars(credentials: CalendarCredentials): Promise<CalendarListItem[]>;
  
  // Events
  listEvents(
    credentials: CalendarCredentials,
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]>;
  
  getEvent(
    credentials: CalendarCredentials,
    calendarId: string,
    eventId: string
  ): Promise<CalendarEvent>;
  
  createEvent(
    credentials: CalendarCredentials,
    request: CreateEventRequest
  ): Promise<CalendarEvent>;
  
  updateEvent(
    credentials: CalendarCredentials,
    request: UpdateEventRequest
  ): Promise<CalendarEvent>;
  
  deleteEvent(
    credentials: CalendarCredentials,
    calendarId: string,
    eventId: string
  ): Promise<void>;
  
  // Free/Busy
  getFreeBusy(
    credentials: CalendarCredentials,
    request: FreeBusyRequest
  ): Promise<FreeBusyResponse>;
  
  // Webhooks (for real-time sync)
  setupWebhook?(
    credentials: CalendarCredentials,
    calendarId: string,
    webhookUrl: string
  ): Promise<{ id: string; expiration: Date }>;
  
  stopWebhook?(
    credentials: CalendarCredentials,
    webhookId: string
  ): Promise<void>;
}

export abstract class BaseCalendarService implements ICalendarService {
  abstract provider: CalendarProvider;
  protected config: OAuthConfig;
  
  constructor(config: OAuthConfig) {
    this.config = config;
  }
  
  abstract getAuthUrl(state?: string): string;
  abstract exchangeCodeForToken(code: string): Promise<TokenResponse>;
  abstract refreshAccessToken(refreshToken: string): Promise<TokenResponse>;
  abstract revokeAccess(accessToken: string): Promise<void>;
  abstract listCalendars(credentials: CalendarCredentials): Promise<CalendarListItem[]>;
  abstract listEvents(
    credentials: CalendarCredentials,
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]>;
  abstract getEvent(
    credentials: CalendarCredentials,
    calendarId: string,
    eventId: string
  ): Promise<CalendarEvent>;
  abstract createEvent(
    credentials: CalendarCredentials,
    request: CreateEventRequest
  ): Promise<CalendarEvent>;
  abstract updateEvent(
    credentials: CalendarCredentials,
    request: UpdateEventRequest
  ): Promise<CalendarEvent>;
  abstract deleteEvent(
    credentials: CalendarCredentials,
    calendarId: string,
    eventId: string
  ): Promise<void>;
  abstract getFreeBusy(
    credentials: CalendarCredentials,
    request: FreeBusyRequest
  ): Promise<FreeBusyResponse>;
  
  // Helper: Check if token is expired
  protected isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }
  
  // Helper: Auto-refresh token if needed
  protected async ensureValidToken(
    credentials: CalendarCredentials
  ): Promise<CalendarCredentials> {
    if (this.isTokenExpired(credentials.expiresAt)) {
      const tokenResponse = await this.refreshAccessToken(credentials.refreshToken);
      return {
        ...credentials,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || credentials.refreshToken,
        expiresAt: Date.now() + tokenResponse.expiresIn * 1000,
      };
    }
    return credentials;
  }
}
