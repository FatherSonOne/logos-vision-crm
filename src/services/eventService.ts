// Event Service - Handles all database operations for Events
import { supabase } from './supabaseClient';
import type { Event } from '../types';

function dbToEvent(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    clientId: dbEvent.client_id,
    eventDate: dbEvent.event_date,
    location: dbEvent.location,
    description: dbEvent.description,
    bannerImageUrl: dbEvent.banner_image_url,
    isPublished: dbEvent.is_published,
    schedule: dbEvent.schedule || [],
    ticketTypes: dbEvent.ticket_types || [],
    volunteerIds: dbEvent.volunteer_ids || []
  };
}

export const eventService = {
  async getAll(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(dbToEvent);
  },

  async getById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return dbToEvent(data);
  },

  async create(event: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        client_id: event.clientId,
        event_date: event.eventDate,
        location: event.location,
        description: event.description,
        banner_image_url: event.bannerImageUrl,
        is_published: event.isPublished || false,
        schedule: event.schedule || [],
        ticket_types: event.ticketTypes || [],
        volunteer_ids: event.volunteerIds || []
      }])
      .select()
      .single();

    if (error) throw error;
    return dbToEvent(data);
  },

  async update(id: string, updates: Partial<Event>): Promise<Event> {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.eventDate !== undefined) updateData.event_date = updates.eventDate;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.bannerImageUrl !== undefined) updateData.banner_image_url = updates.bannerImageUrl;
    if (updates.isPublished !== undefined) updateData.is_published = updates.isPublished;
    if (updates.schedule !== undefined) updateData.schedule = updates.schedule;
    if (updates.ticketTypes !== undefined) updateData.ticket_types = updates.ticketTypes;
    if (updates.volunteerIds !== undefined) updateData.volunteer_ids = updates.volunteerIds;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return dbToEvent(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
