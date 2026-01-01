/**
 * Calendar Manager
 * Coordinates multiple calendar providers and manages credentials
 */

import { GoogleCalendarService } from './googleCalendarService';
import { CALENDAR_CONFIG } from './config';
import type {
  CalendarProvider,
  CalendarCredentials,
  CalendarEvent,
  CalendarListItem,
  CreateEventRequest,
  UpdateEventRequest,
  FreeBusyRequest,
  FreeBusyResponse,
  CalendarSyncStatus,
} from './types';
import type { ICalendarService } from './baseCalendarService';

export class CalendarManager {
  private services: Map<CalendarProvider, ICalendarService>;
  private credentials: Map<CalendarProvider, CalendarCredentials>;
  
  constructor() {
    this.services = new Map();
    this.credentials = new Map();
    
    // Initialize Google Calendar service
    this.services.set('google', new GoogleCalendarService(CALENDAR_CONFIG.google));
    
    // TODO: Initialize Microsoft and Apple services when implemented
  }
  
  // Get service for a provider
  private getService(provider: CalendarProvider): ICalendarService {
    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`Calendar service not available for provider: ${provider}`);
    }
    return service;
  }
  
  // Get credentials for a provider
  private getCredentials(provider: CalendarProvider): CalendarCredentials {
    const creds = this.credentials.get(provider);
    if (!creds) {
      throw new Error(`No credentials available for provider: ${provider}`);
    }
    return creds;
  }
  
  // OAuth: Get authorization URL
  getAuthUrl(provider: CalendarProvider, state?: string): string {
    const service = this.getService(provider);
    return service.getAuthUrl(state);
  }
  
  // OAuth: Handle callback and exchange code for token
  async handleCallback(provider: CalendarProvider, code: string, state?: string): Promise<CalendarCredentials> {
    const service = this.getService(provider);
    const tokenResponse = await service.exchangeCodeForToken(code);
    
    const credentials: CalendarCredentials = {
      provider,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt: Date.now() + tokenResponse.expiresIn * 1000,
    };
    
    this.credentials.set(provider, credentials);
    this.saveCredentialsToStorage(credentials);
    
    return credentials;
  }
  
  // Set credentials manually
  setCredentials(provider: CalendarProvider, credentials: CalendarCredentials): void {
    this.credentials.set(provider, credentials);
  }
  
  // Check if provider is connected
  isConnected(provider: CalendarProvider): boolean {
    return this.credentials.has(provider);
  }
  
  // Disconnect provider
  async disconnect(provider: CalendarProvider): Promise<void> {
    const creds = this.credentials.get(provider);
    if (creds) {
      const service = this.getService(provider);
      await service.revokeAccess(creds.accessToken);
      this.credentials.delete(provider);
      this.removeCredentialsFromStorage(provider);
    }
  }
  
  // List all calendars from all connected providers
  async listAllCalendars(): Promise<CalendarListItem[]> {
    const allCalendars: CalendarListItem[] = [];
    
    for (const [provider, creds] of this.credentials.entries()) {
      try {
        const service = this.getService(provider);
        const calendars = await service.listCalendars(creds);
        allCalendars.push(...calendars);
      } catch (error) {
        console.error(`Failed to list calendars for ${provider}:`, error);
      }
    }
    
    return allCalendars;
  }
  
  // List calendars from a specific provider
  async listCalendars(provider: CalendarProvider): Promise<CalendarListItem[]> {
    const service = this.getService(provider);
    const creds = this.getCredentials(provider);
    return service.listCalendars(creds);
  }
  
  // List events from a specific calendar
  async listEvents(
    provider: CalendarProvider,
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const service = this.getService(provider);
    const creds = this.getCredentials(provider);
    return service.listEvents(creds, calendarId, startDate, endDate);
  }
  
  // List events from ALL connected calendars
  async listAllEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const allEvents: CalendarEvent[] = [];
    
    for (const [provider, creds] of this.credentials.entries()) {
      try {
        const service = this.getService(provider);
        const calendars = await service.listCalendars(creds);
        
        for (const calendar of calendars) {
          const events = await service.listEvents(creds, calendar.id, startDate, endDate);
          allEvents.push(...events);
        }
      } catch (error) {
        console.error(`Failed to list events for ${provider}:`, error);
      }
    }
    
    return allEvents;
  }
  
  // Create event in a specific calendar
  async createEvent(
    provider: CalendarProvider,
    request: CreateEventRequest
  ): Promise<CalendarEvent> {
    const service = this.getService(provider);
    const creds = this.getCredentials(provider);
    return service.createEvent(creds, request);
  }
  
  // Update event
  async updateEvent(
    provider: CalendarProvider,
    request: UpdateEventRequest
  ): Promise<CalendarEvent> {
    const service = this.getService(provider);
    const creds = this.getCredentials(provider);
    return service.updateEvent(creds, request);
  }
  
  // Delete event
  async deleteEvent(
    provider: CalendarProvider,
    calendarId: string,
    eventId: string
  ): Promise<void> {
    const service = this.getService(provider);
    const creds = this.getCredentials(provider);
    return service.deleteEvent(creds, calendarId, eventId);
  }
  
  // Get free/busy information
  async getFreeBusy(
    provider: CalendarProvider,
    request: FreeBusyRequest
  ): Promise<FreeBusyResponse> {
    const service = this.getService(provider);
    const creds = this.getCredentials(provider);
    return service.getFreeBusy(creds, request);
  }
  
  // Get sync status for all providers
  getSyncStatus(): CalendarSyncStatus[] {
    const statuses: CalendarSyncStatus[] = [];
    
    for (const [provider] of this.services.entries()) {
      const isConnected = this.isConnected(provider);
      statuses.push({
        provider,
        syncEnabled: isConnected,
        calendarsCount: 0, // TODO: Track this
        eventsCount: 0, // TODO: Track this
      });
    }
    
    return statuses;
  }
  
  // Storage helpers (localStorage for now, should use secure backend in production)
  private saveCredentialsToStorage(credentials: CalendarCredentials): void {
    try {
      const key = `calendar_creds_${credentials.provider}`;
      // WARNING: This is insecure for production! Use encrypted storage or backend
      localStorage.setItem(key, JSON.stringify(credentials));
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }
  
  private removeCredentialsFromStorage(provider: CalendarProvider): void {
    try {
      const key = `calendar_creds_${provider}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove credentials:', error);
    }
  }
  
  // Load credentials from storage on initialization
  loadCredentialsFromStorage(): void {
    const providers: CalendarProvider[] = ['google', 'microsoft', 'apple'];
    
    for (const provider of providers) {
      try {
        const key = `calendar_creds_${provider}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
          const credentials = JSON.parse(stored) as CalendarCredentials;
          // Check if token is not expired
          if (credentials.expiresAt > Date.now()) {
            this.credentials.set(provider, credentials);
          } else {
            // Token expired, remove from storage
            this.removeCredentialsFromStorage(provider);
          }
        }
      } catch (error) {
        console.error(`Failed to load credentials for ${provider}:`, error);
      }
    }
  }
}

// Singleton instance
export const calendarManager = new CalendarManager();

// Auto-load credentials on module load
calendarManager.loadCredentialsFromStorage();
