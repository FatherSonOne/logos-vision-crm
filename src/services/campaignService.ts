import { supabase } from './supabaseClient';
import type {
  Campaign,
  CampaignSegment,
  CampaignContact,
  CampaignPerformance,
  CampaignStats,
  CampaignType,
  CampaignStatus,
  CampaignContactStatus,
  EngagementTier,
} from '../types';

// Helper to map database row to Campaign type
const mapCampaignRow = (row: any): Campaign => ({
  id: row.id,
  name: row.name,
  description: row.description,
  campaignType: row.campaign_type as CampaignType,
  status: row.status as CampaignStatus,
  goalAmount: parseFloat(row.goal_amount) || 0,
  raisedAmount: parseFloat(row.raised_amount) || 0,
  donorCount: row.donor_count || 0,
  startDate: row.start_date,
  endDate: row.end_date,
  targetEngagementTiers: row.target_engagement_tiers || [],
  minEngagementScore: row.min_engagement_score,
  maxEngagementScore: row.max_engagement_score,
  appealMessage: row.appeal_message,
  thankYouMessage: row.thank_you_message,
  useSuggestedAsks: row.use_suggested_asks ?? true,
  allowRecurring: row.allow_recurring ?? false,
  emailSentCount: row.email_sent_count || 0,
  emailOpenedCount: row.email_opened_count || 0,
  emailClickedCount: row.email_clicked_count || 0,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Helper to map database row to CampaignSegment type
const mapSegmentRow = (row: any): CampaignSegment => ({
  id: row.id,
  campaignId: row.campaign_id,
  name: row.name,
  engagementTier: row.engagement_tier as EngagementTier,
  minScore: row.min_score,
  maxScore: row.max_score,
  suggestedAskMultiplier: parseFloat(row.suggested_ask_multiplier) || 1.0,
  expectedResponseRate: parseFloat(row.expected_response_rate) || 0.1,
  contactCount: row.contact_count || 0,
  respondedCount: row.responded_count || 0,
  donatedCount: row.donated_count || 0,
  totalRaised: parseFloat(row.total_raised) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Helper to map database row to CampaignContact type
const mapContactRow = (row: any): CampaignContact => ({
  id: row.id,
  campaignId: row.campaign_id,
  segmentId: row.segment_id,
  clientId: row.client_id,
  engagementScore: row.engagement_score,
  engagementTier: row.engagement_tier as EngagementTier | null,
  suggestedAsk: row.suggested_ask ? parseFloat(row.suggested_ask) : null,
  actualAsk: row.actual_ask ? parseFloat(row.actual_ask) : null,
  status: row.status as CampaignContactStatus,
  emailSentAt: row.email_sent_at,
  emailOpenedAt: row.email_opened_at,
  emailClickedAt: row.email_clicked_at,
  respondedAt: row.responded_at,
  responseNotes: row.response_notes,
  donationId: row.donation_id,
  donationAmount: row.donation_amount ? parseFloat(row.donation_amount) : null,
  donatedAt: row.donated_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  clientName: row.client_name || row.clients?.name,
  clientEmail: row.client_email || row.clients?.email,
});

// Helper to map performance view row
const mapPerformanceRow = (row: any): CampaignPerformance => ({
  ...mapCampaignRow(row),
  progressPercentage: parseFloat(row.progress_percentage) || 0,
  totalContacts: row.total_contacts || 0,
  contactedCount: row.contacted_count || 0,
  respondedCount: row.responded_count || 0,
  donationsCount: row.donations_count || 0,
  responseRate: parseFloat(row.response_rate) || 0,
  openRate: parseFloat(row.open_rate) || 0,
  clickRate: parseFloat(row.click_rate) || 0,
});

export const campaignService = {
  // ==========================================
  // CAMPAIGNS CRUD
  // ==========================================

  async getCampaigns(filters?: {
    status?: CampaignStatus;
    campaignType?: CampaignType;
  }): Promise<Campaign[]> {
    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.campaignType) {
      query = query.eq('campaign_type', filters.campaignType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapCampaignRow);
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapCampaignRow(data);
  },

  async getCampaignPerformance(id: string): Promise<CampaignPerformance | null> {
    const { data, error } = await supabase
      .from('campaign_performance_summary')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapPerformanceRow(data);
  },

  async getAllCampaignPerformance(): Promise<CampaignPerformance[]> {
    const { data, error } = await supabase
      .from('campaign_performance_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapPerformanceRow);
  },

  async createCampaign(
    campaign: Omit<Campaign, 'id' | 'raisedAmount' | 'donorCount' | 'emailSentCount' | 'emailOpenedCount' | 'emailClickedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<Campaign> {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: campaign.name,
        description: campaign.description,
        campaign_type: campaign.campaignType,
        status: campaign.status,
        goal_amount: campaign.goalAmount,
        start_date: campaign.startDate,
        end_date: campaign.endDate,
        target_engagement_tiers: campaign.targetEngagementTiers,
        min_engagement_score: campaign.minEngagementScore,
        max_engagement_score: campaign.maxEngagementScore,
        appeal_message: campaign.appealMessage,
        thank_you_message: campaign.thankYouMessage,
        use_suggested_asks: campaign.useSuggestedAsks,
        allow_recurring: campaign.allowRecurring,
        created_by: campaign.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return mapCampaignRow(data);
  },

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.campaignType !== undefined) updateData.campaign_type = updates.campaignType;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.goalAmount !== undefined) updateData.goal_amount = updates.goalAmount;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.targetEngagementTiers !== undefined) updateData.target_engagement_tiers = updates.targetEngagementTiers;
    if (updates.minEngagementScore !== undefined) updateData.min_engagement_score = updates.minEngagementScore;
    if (updates.maxEngagementScore !== undefined) updateData.max_engagement_score = updates.maxEngagementScore;
    if (updates.appealMessage !== undefined) updateData.appeal_message = updates.appealMessage;
    if (updates.thankYouMessage !== undefined) updateData.thank_you_message = updates.thankYouMessage;
    if (updates.useSuggestedAsks !== undefined) updateData.use_suggested_asks = updates.useSuggestedAsks;
    if (updates.allowRecurring !== undefined) updateData.allow_recurring = updates.allowRecurring;

    const { data, error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapCampaignRow(data);
  },

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    return this.updateCampaign(id, { status });
  },

  // ==========================================
  // CAMPAIGN SEGMENTS
  // ==========================================

  async getSegments(campaignId: string): Promise<CampaignSegment[]> {
    const { data, error } = await supabase
      .from('campaign_segments')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('min_score', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapSegmentRow);
  },

  // ==========================================
  // CAMPAIGN CONTACTS
  // ==========================================

  async getContacts(
    campaignId: string,
    filters?: {
      status?: CampaignContactStatus;
      segmentId?: string;
      engagementTier?: EngagementTier;
    }
  ): Promise<CampaignContact[]> {
    let query = supabase
      .from('campaign_contacts')
      .select(`
        *,
        clients!campaign_contacts_client_id_fkey(name, email)
      `)
      .eq('campaign_id', campaignId)
      .order('engagement_score', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.segmentId) {
      query = query.eq('segment_id', filters.segmentId);
    }
    if (filters?.engagementTier) {
      query = query.eq('engagement_tier', filters.engagementTier);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapContactRow);
  },

  async updateContactStatus(
    contactId: string,
    status: CampaignContactStatus,
    notes?: string
  ): Promise<CampaignContact> {
    const updateData: any = { status };

    if (status === 'responded' || status === 'donated') {
      updateData.responded_at = new Date().toISOString();
    }
    if (notes) {
      updateData.response_notes = notes;
    }

    const { data, error } = await supabase
      .from('campaign_contacts')
      .update(updateData)
      .eq('id', contactId)
      .select(`
        *,
        clients!campaign_contacts_client_id_fkey(name, email)
      `)
      .single();

    if (error) throw error;
    return mapContactRow(data);
  },

  async markContactEmailed(contactId: string): Promise<CampaignContact> {
    const { data, error } = await supabase
      .from('campaign_contacts')
      .update({
        status: 'contacted',
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .select(`
        *,
        clients!campaign_contacts_client_id_fkey(name, email)
      `)
      .single();

    if (error) throw error;
    return mapContactRow(data);
  },

  // ==========================================
  // POPULATE CONTACTS FROM ENGAGEMENT SCORES
  // ==========================================

  async populateCampaignContacts(
    campaignId: string,
    engagementTiers?: EngagementTier[],
    minScore?: number,
    maxScore?: number
  ): Promise<number> {
    const { data, error } = await supabase.rpc('populate_campaign_contacts', {
      p_campaign_id: campaignId,
      p_engagement_tiers: engagementTiers || null,
      p_min_score: minScore ?? null,
      p_max_score: maxScore ?? null,
    });

    if (error) throw error;
    return data || 0;
  },

  // ==========================================
  // RECORD DONATION
  // ==========================================

  async recordDonation(
    campaignId: string,
    clientId: string,
    donationId: string,
    amount: number
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('record_campaign_donation', {
      p_campaign_id: campaignId,
      p_client_id: clientId,
      p_donation_id: donationId,
      p_amount: amount,
    });

    if (error) throw error;
    return data;
  },

  // ==========================================
  // STATISTICS
  // ==========================================

  async getStats(): Promise<CampaignStats> {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('status, goal_amount, raised_amount, donor_count');

    if (error) throw error;

    const allCampaigns = campaigns || [];
    const activeCampaigns = allCampaigns.filter((c) => c.status === 'active');

    // Get total response stats from performance view
    const { data: performanceData } = await supabase
      .from('campaign_performance_summary')
      .select('response_rate')
      .eq('status', 'active');

    const responseRates = (performanceData || [])
      .map((p) => parseFloat(p.response_rate) || 0)
      .filter((r) => r > 0);

    const averageResponseRate =
      responseRates.length > 0
        ? responseRates.reduce((a, b) => a + b, 0) / responseRates.length
        : 0;

    return {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: activeCampaigns.length,
      totalGoal: allCampaigns.reduce((sum, c) => sum + (parseFloat(c.goal_amount) || 0), 0),
      totalRaised: allCampaigns.reduce((sum, c) => sum + (parseFloat(c.raised_amount) || 0), 0),
      totalDonors: allCampaigns.reduce((sum, c) => sum + (c.donor_count || 0), 0),
      averageResponseRate,
    };
  },

  // ==========================================
  // HELPER: GET ENGAGEMENT TIER SUMMARY
  // ==========================================

  async getEngagementTierSummary(): Promise<
    Array<{
      tier: EngagementTier;
      count: number;
      avgScore: number;
    }>
  > {
    const { data, error } = await supabase.from('engagement_scores').select('total_score');

    if (error) throw error;

    const scores = data || [];
    const tiers: EngagementTier[] = ['champion', 'core', 'emerging', 'at_risk', 'lapsed'];
    const tierRanges: Record<EngagementTier, { min: number; max: number }> = {
      champion: { min: 85, max: 100 },
      core: { min: 70, max: 84 },
      emerging: { min: 50, max: 69 },
      at_risk: { min: 30, max: 49 },
      lapsed: { min: 0, max: 29 },
    };

    return tiers.map((tier) => {
      const range = tierRanges[tier];
      const tierScores = scores.filter(
        (s) => s.total_score >= range.min && s.total_score <= range.max
      );
      const avgScore =
        tierScores.length > 0
          ? tierScores.reduce((sum, s) => sum + s.total_score, 0) / tierScores.length
          : 0;

      return {
        tier,
        count: tierScores.length,
        avgScore: Math.round(avgScore),
      };
    });
  },
};
