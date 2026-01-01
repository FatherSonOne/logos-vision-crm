import { supabase } from './supabaseClient';
import type { EngagementScore, EngagementStats, EngagementLevel } from '../types';

// Helper to map database row to EngagementScore type
const mapEngagementRow = (row: any): EngagementScore => ({
  id: row.id,
  clientId: row.client_id,
  clientName: row.client_name || 'Unknown',
  clientEmail: row.client_email,
  overallScore: parseFloat(row.overall_score) || 0,
  engagementLevel: row.engagement_level as EngagementLevel,
  donationFrequencyScore: parseFloat(row.donation_frequency_score) || 0,
  donationRecencyScore: parseFloat(row.donation_recency_score) || 0,
  donationAmountScore: parseFloat(row.donation_amount_score) || 0,
  pledgeFulfillmentScore: parseFloat(row.pledge_fulfillment_score) || 0,
  communicationScore: parseFloat(row.communication_score) || 0,
  totalDonations: row.total_donations || 0,
  totalDonated: parseFloat(row.total_donated) || 0,
  lastDonationDate: row.last_donation_date,
  daysSinceLastDonation: row.days_since_last_donation,
  averageDonation: parseFloat(row.average_donation) || 0,
  scoreHistory: row.score_history || [],
  calculatedAt: row.calculated_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const engagementService = {
  // Get all engagement scores
  async getAll(filters?: {
    engagementLevel?: EngagementLevel;
    minScore?: number;
    maxScore?: number;
  }): Promise<EngagementScore[]> {
    let query = supabase
      .from('engagement_score_summary')
      .select('*')
      .order('overall_score', { ascending: false });

    if (filters?.engagementLevel) {
      query = query.eq('engagement_level', filters.engagementLevel);
    }
    if (filters?.minScore !== undefined) {
      query = query.gte('overall_score', filters.minScore);
    }
    if (filters?.maxScore !== undefined) {
      query = query.lte('overall_score', filters.maxScore);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapEngagementRow);
  },

  // Get engagement score for a specific client
  async getByClientId(clientId: string): Promise<EngagementScore | null> {
    const { data, error } = await supabase
      .from('engagement_score_summary')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return mapEngagementRow(data);
  },

  // Get top engaged donors
  async getTopEngaged(limit: number = 10): Promise<EngagementScore[]> {
    const { data, error } = await supabase
      .from('engagement_score_summary')
      .select('*')
      .order('overall_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapEngagementRow);
  },

  // Get at-risk donors (low engagement)
  async getAtRisk(limit: number = 10): Promise<EngagementScore[]> {
    const { data, error } = await supabase
      .from('engagement_score_summary')
      .select('*')
      .in('engagement_level', ['At Risk', 'Low Engagement'])
      .order('overall_score', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(mapEngagementRow);
  },

  // Get donors by engagement level
  async getByLevel(level: EngagementLevel): Promise<EngagementScore[]> {
    const { data, error } = await supabase
      .from('engagement_score_summary')
      .select('*')
      .eq('engagement_level', level)
      .order('overall_score', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapEngagementRow);
  },

  // Refresh engagement scores (calls the database function)
  async refreshScores(): Promise<number> {
    const { data, error } = await supabase.rpc('refresh_engagement_scores');

    if (error) throw error;
    return data || 0;
  },

  // Get engagement statistics
  async getStats(): Promise<EngagementStats> {
    const { data, error } = await supabase
      .from('donor_engagement_scores')
      .select('engagement_level, overall_score');

    if (error) throw error;

    const scores = data || [];
    const totalDonors = scores.length;

    // Count by engagement level
    const levelCounts = {
      highlyEngaged: 0,
      engaged: 0,
      moderate: 0,
      lowEngagement: 0,
      atRisk: 0,
    };

    let totalScore = 0;

    scores.forEach((score) => {
      totalScore += parseFloat(score.overall_score) || 0;
      switch (score.engagement_level) {
        case 'Highly Engaged':
          levelCounts.highlyEngaged++;
          break;
        case 'Engaged':
          levelCounts.engaged++;
          break;
        case 'Moderate':
          levelCounts.moderate++;
          break;
        case 'Low Engagement':
          levelCounts.lowEngagement++;
          break;
        case 'At Risk':
          levelCounts.atRisk++;
          break;
      }
    });

    // Get total number of clients for comparison
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    return {
      totalDonors: clientCount || 0,
      scoredDonors: totalDonors,
      averageScore: totalDonors > 0 ? totalScore / totalDonors : 0,
      ...levelCounts,
    };
  },

  // Get score distribution for charts
  async getScoreDistribution(): Promise<{ range: string; count: number }[]> {
    const { data, error } = await supabase
      .from('donor_engagement_scores')
      .select('overall_score');

    if (error) throw error;

    // Create distribution buckets
    const distribution = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ];

    (data || []).forEach((score) => {
      const value = parseFloat(score.overall_score) || 0;
      if (value <= 20) distribution[0].count++;
      else if (value <= 40) distribution[1].count++;
      else if (value <= 60) distribution[2].count++;
      else if (value <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  },

  // Get donors needing attention (haven't donated recently but used to be engaged)
  async getDonorsNeedingAttention(): Promise<EngagementScore[]> {
    const { data, error } = await supabase
      .from('engagement_score_summary')
      .select('*')
      .lte('donation_recency_score', 40) // Haven't donated recently
      .gte('donation_frequency_score', 50) // But used to donate regularly
      .gt('total_donations', 1) // And have donated more than once
      .order('days_since_last_donation', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []).map(mapEngagementRow);
  },

  // Get engagement trend for a specific donor
  async getEngagementTrend(clientId: string): Promise<Array<{ date: string; score: number }>> {
    const { data, error } = await supabase
      .from('donor_engagement_scores')
      .select('score_history')
      .eq('client_id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return [];
      throw error;
    }

    return data?.score_history || [];
  },

  // Get level distribution for pie chart
  async getLevelDistribution(): Promise<{ level: string; count: number; percentage: number }[]> {
    const stats = await this.getStats();
    const total = stats.scoredDonors || 1;

    return [
      { level: 'Highly Engaged', count: stats.highlyEngaged, percentage: (stats.highlyEngaged / total) * 100 },
      { level: 'Engaged', count: stats.engaged, percentage: (stats.engaged / total) * 100 },
      { level: 'Moderate', count: stats.moderate, percentage: (stats.moderate / total) * 100 },
      { level: 'Low Engagement', count: stats.lowEngagement, percentage: (stats.lowEngagement / total) * 100 },
      { level: 'At Risk', count: stats.atRisk, percentage: (stats.atRisk / total) * 100 },
    ];
  },
};
