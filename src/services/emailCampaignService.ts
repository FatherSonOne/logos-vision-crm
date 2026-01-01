// Email Campaign Service - Handles all database operations for Email Campaigns
import { supabase } from './supabaseClient';
import type { EmailCampaign } from '../types';

function dbToEmailCampaign(dbCampaign: any): EmailCampaign {
  return {
    id: dbCampaign.id,
    name: dbCampaign.name,
    status: dbCampaign.status,
    subject: dbCampaign.subject,
    subjectLineB: dbCampaign.subject_line_b,
    body: dbCampaign.body,
    headerImageUrl: dbCampaign.header_image_url,
    recipientSegment: dbCampaign.recipient_segment || 'All Contacts',
    recipientCount: dbCampaign.recipient_count || 0,
    sentDate: dbCampaign.sent_date,
    stats: dbCampaign.stats || { sent: 0, opened: 0, clicked: 0, unsubscribes: 0 }
  };
}

export const emailCampaignService = {
  async getAll(): Promise<EmailCampaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbToEmailCampaign);
  },

  async getById(id: string): Promise<EmailCampaign | null> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return dbToEmailCampaign(data);
  },

  async create(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert([{
        name: campaign.name,
        status: campaign.status || 'Draft',
        subject: campaign.subject,
        subject_line_b: campaign.subjectLineB,
        body: campaign.body,
        header_image_url: campaign.headerImageUrl,
        recipient_count: campaign.recipientCount || 0,
        sent_date: campaign.sentDate,
        stats: campaign.stats || { sent: 0, opened: 0, clicked: 0, unsubscribes: 0 }
      }])
      .select()
      .single();

    if (error) throw error;
    return dbToEmailCampaign(data);
  },

  async update(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.subjectLineB !== undefined) updateData.subject_line_b = updates.subjectLineB;
    if (updates.body !== undefined) updateData.body = updates.body;
    if (updates.headerImageUrl !== undefined) updateData.header_image_url = updates.headerImageUrl;
    if (updates.recipientCount !== undefined) updateData.recipient_count = updates.recipientCount;
    if (updates.sentDate !== undefined) updateData.sent_date = updates.sentDate;
    if (updates.stats !== undefined) updateData.stats = updates.stats;

    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return dbToEmailCampaign(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
