import { supabase } from './supabaseClient';
import type {
  DonorCohort,
  CohortMember,
  LifetimeValue,
  RetentionMetric,
  GivingProgression,
  SavedReport,
  CohortRetentionSummary,
  DonorAnalyticsSummary,
  AnalyticsStats,
  AnalyticsRefreshResult,
  ReportType,
} from '../types';

// Helper mappers
const mapCohortRow = (row: any): DonorCohort => ({
  id: row.id,
  cohortYear: row.cohort_year,
  cohortName: row.cohort_name,
  description: row.description,
  totalDonors: row.total_donors || 0,
  totalFirstYearValue: parseFloat(row.total_first_year_value) || 0,
  avgFirstGift: parseFloat(row.avg_first_gift) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCohortMemberRow = (row: any): CohortMember => ({
  id: row.id,
  cohortId: row.cohort_id,
  clientId: row.client_id,
  firstDonationDate: row.first_donation_date,
  firstDonationAmount: parseFloat(row.first_donation_amount) || 0,
  acquisitionSource: row.acquisition_source,
  createdAt: row.created_at,
  clientName: row.clients?.name,
  clientEmail: row.clients?.email,
});

const mapLifetimeValueRow = (row: any): LifetimeValue => ({
  id: row.id,
  clientId: row.client_id,
  totalLifetimeValue: parseFloat(row.total_lifetime_value) || 0,
  totalDonations: row.total_donations || 0,
  avgDonation: parseFloat(row.avg_donation) || 0,
  largestDonation: parseFloat(row.largest_donation) || 0,
  firstDonationDate: row.first_donation_date,
  lastDonationDate: row.last_donation_date,
  donorTenureMonths: row.donor_tenure_months || 0,
  projectedAnnualValue: parseFloat(row.projected_annual_value) || 0,
  projected5YrValue: parseFloat(row.projected_5yr_value) || 0,
  recencyScore: row.recency_score || 0,
  frequencyScore: row.frequency_score || 0,
  monetaryScore: row.monetary_score || 0,
  rfmScore: row.rfm_score || 0,
  calculatedAt: row.calculated_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  clientName: row.clients?.name,
  clientEmail: row.clients?.email,
});

const mapRetentionMetricRow = (row: any): RetentionMetric => ({
  id: row.id,
  cohortId: row.cohort_id,
  metricYear: row.metric_year,
  yearsSinceAcquisition: row.years_since_acquisition,
  donorsStartOfYear: row.donors_start_of_year || 0,
  donorsRetained: row.donors_retained || 0,
  donorsLapsed: row.donors_lapsed || 0,
  donorsReactivated: row.donors_reactivated || 0,
  retentionRate: parseFloat(row.retention_rate) || 0,
  lapseRate: parseFloat(row.lapse_rate) || 0,
  totalValue: parseFloat(row.total_value) || 0,
  avgGift: parseFloat(row.avg_gift) || 0,
  calculatedAt: row.calculated_at,
  createdAt: row.created_at,
  cohortYear: row.donor_cohorts?.cohort_year,
  cohortName: row.donor_cohorts?.cohort_name,
});

const mapGivingProgressionRow = (row: any): GivingProgression => ({
  id: row.id,
  clientId: row.client_id,
  year: row.year,
  giftCount: row.gift_count || 0,
  giftTotal: parseFloat(row.gift_total) || 0,
  avgGift: parseFloat(row.avg_gift) || 0,
  largestGift: parseFloat(row.largest_gift) || 0,
  yoyGiftCountChange: row.yoy_gift_count_change || 0,
  yoyTotalChange: parseFloat(row.yoy_total_change) || 0,
  yoyTotalChangePct: parseFloat(row.yoy_total_change_pct) || 0,
  engagementTierStart: row.engagement_tier_start,
  engagementTierEnd: row.engagement_tier_end,
  tierChanged: row.tier_changed || false,
  tierImproved: row.tier_improved || false,
  createdAt: row.created_at,
  clientName: row.clients?.name,
});

const mapSavedReportRow = (row: any): SavedReport => ({
  id: row.id,
  name: row.name,
  description: row.description,
  reportType: row.report_type as ReportType,
  filters: row.filters || {},
  columns: row.columns || [],
  sortBy: row.sort_by,
  sortDirection: row.sort_direction || 'desc',
  chartType: row.chart_type,
  dateRangeType: row.date_range_type,
  dateFrom: row.date_from,
  dateTo: row.date_to,
  createdBy: row.created_by,
  isFavorite: row.is_favorite || false,
  lastRunAt: row.last_run_at,
  runCount: row.run_count || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCohortRetentionSummaryRow = (row: any): CohortRetentionSummary => ({
  cohortId: row.cohort_id,
  cohortYear: row.cohort_year,
  cohortName: row.cohort_name,
  originalDonors: row.original_donors || 0,
  totalFirstYearValue: parseFloat(row.total_first_year_value) || 0,
  avgFirstGift: parseFloat(row.avg_first_gift) || 0,
  metricYear: row.metric_year,
  yearsSinceAcquisition: row.years_since_acquisition || 0,
  donorsRetained: row.donors_retained || 0,
  retentionRate: parseFloat(row.retention_rate) || 0,
  yearValue: parseFloat(row.year_value) || 0,
  yearAvgGift: parseFloat(row.year_avg_gift) || 0,
  cumulativeRetentionRate: parseFloat(row.cumulative_retention_rate) || 0,
});

const mapDonorAnalyticsSummaryRow = (row: any): DonorAnalyticsSummary => ({
  clientId: row.client_id,
  clientName: row.client_name,
  clientEmail: row.client_email,
  cohortYear: row.cohort_year,
  cohortName: row.cohort_name,
  firstDonationDate: row.first_donation_date,
  firstDonationAmount: row.first_donation_amount ? parseFloat(row.first_donation_amount) : null,
  totalLifetimeValue: row.total_lifetime_value ? parseFloat(row.total_lifetime_value) : null,
  totalDonations: row.total_donations,
  avgDonation: row.avg_donation ? parseFloat(row.avg_donation) : null,
  largestDonation: row.largest_donation ? parseFloat(row.largest_donation) : null,
  donorTenureMonths: row.donor_tenure_months,
  projectedAnnualValue: row.projected_annual_value ? parseFloat(row.projected_annual_value) : null,
  projected5YrValue: row.projected_5yr_value ? parseFloat(row.projected_5yr_value) : null,
  rfmScore: row.rfm_score,
  engagementScore: row.engagement_score,
  engagementLevel: row.engagement_level,
  latestYear: row.latest_year,
  latestGiftCount: row.latest_gift_count,
  latestGiftTotal: row.latest_gift_total ? parseFloat(row.latest_gift_total) : null,
  yoyTotalChangePct: row.yoy_total_change_pct ? parseFloat(row.yoy_total_change_pct) : null,
  tierImproved: row.tier_improved,
});

export const analyticsService = {
  // ==========================================
  // COHORTS
  // ==========================================

  async getCohorts(): Promise<DonorCohort[]> {
    const { data, error } = await supabase
      .from('donor_cohorts')
      .select('*')
      .order('cohort_year', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCohortRow);
  },

  async getCohortById(id: string): Promise<DonorCohort | null> {
    const { data, error } = await supabase
      .from('donor_cohorts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapCohortRow(data);
  },

  async getCohortMembers(cohortId: string): Promise<CohortMember[]> {
    const { data, error } = await supabase
      .from('cohort_members')
      .select(`
        *,
        clients!cohort_members_client_id_fkey(name, email)
      `)
      .eq('cohort_id', cohortId)
      .order('first_donation_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapCohortMemberRow);
  },

  // ==========================================
  // LIFETIME VALUES
  // ==========================================

  async getLifetimeValues(options?: {
    sortBy?: 'ltv' | 'rfm' | 'tenure';
    limit?: number;
  }): Promise<LifetimeValue[]> {
    let query = supabase
      .from('lifetime_values')
      .select(`
        *,
        clients!lifetime_values_client_id_fkey(name, email)
      `);

    // Apply sorting
    switch (options?.sortBy) {
      case 'rfm':
        query = query.order('rfm_score', { ascending: false });
        break;
      case 'tenure':
        query = query.order('donor_tenure_months', { ascending: false });
        break;
      case 'ltv':
      default:
        query = query.order('total_lifetime_value', { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapLifetimeValueRow);
  },

  async getLifetimeValueByClientId(clientId: string): Promise<LifetimeValue | null> {
    const { data, error } = await supabase
      .from('lifetime_values')
      .select(`
        *,
        clients!lifetime_values_client_id_fkey(name, email)
      `)
      .eq('client_id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapLifetimeValueRow(data);
  },

  async getTopDonorsByLTV(limit: number = 10): Promise<LifetimeValue[]> {
    return this.getLifetimeValues({ sortBy: 'ltv', limit });
  },

  // ==========================================
  // RETENTION METRICS
  // ==========================================

  async getRetentionMetrics(cohortId?: string): Promise<RetentionMetric[]> {
    let query = supabase
      .from('retention_metrics')
      .select(`
        *,
        donor_cohorts!retention_metrics_cohort_id_fkey(cohort_year, cohort_name)
      `)
      .order('metric_year', { ascending: false });

    if (cohortId) {
      query = query.eq('cohort_id', cohortId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapRetentionMetricRow);
  },

  async getCohortRetentionSummary(): Promise<CohortRetentionSummary[]> {
    const { data, error } = await supabase
      .from('cohort_retention_summary')
      .select('*')
      .order('cohort_year', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCohortRetentionSummaryRow);
  },

  // ==========================================
  // GIVING PROGRESSION
  // ==========================================

  async getGivingProgression(clientId?: string): Promise<GivingProgression[]> {
    let query = supabase
      .from('giving_progression')
      .select(`
        *,
        clients!giving_progression_client_id_fkey(name)
      `)
      .order('year', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapGivingProgressionRow);
  },

  async getProgressionByYear(year: number): Promise<GivingProgression[]> {
    const { data, error } = await supabase
      .from('giving_progression')
      .select(`
        *,
        clients!giving_progression_client_id_fkey(name)
      `)
      .eq('year', year)
      .order('gift_total', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapGivingProgressionRow);
  },

  // ==========================================
  // DONOR ANALYTICS SUMMARY
  // ==========================================

  async getDonorAnalyticsSummary(options?: {
    sortBy?: 'ltv' | 'rfm' | 'engagement';
    limit?: number;
  }): Promise<DonorAnalyticsSummary[]> {
    let query = supabase
      .from('donor_analytics_summary')
      .select('*');

    // Apply sorting
    switch (options?.sortBy) {
      case 'rfm':
        query = query.order('rfm_score', { ascending: false, nullsFirst: false });
        break;
      case 'engagement':
        query = query.order('engagement_score', { ascending: false, nullsFirst: false });
        break;
      case 'ltv':
      default:
        query = query.order('total_lifetime_value', { ascending: false, nullsFirst: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapDonorAnalyticsSummaryRow);
  },

  // ==========================================
  // SAVED REPORTS
  // ==========================================

  async getSavedReports(options?: {
    reportType?: ReportType;
    favoritesOnly?: boolean;
  }): Promise<SavedReport[]> {
    let query = supabase
      .from('saved_reports')
      .select('*')
      .order('updated_at', { ascending: false });

    if (options?.reportType) {
      query = query.eq('report_type', options.reportType);
    }
    if (options?.favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapSavedReportRow);
  },

  async createReport(report: Omit<SavedReport, 'id' | 'lastRunAt' | 'runCount' | 'createdAt' | 'updatedAt'>): Promise<SavedReport> {
    const { data, error } = await supabase
      .from('saved_reports')
      .insert({
        name: report.name,
        description: report.description,
        report_type: report.reportType,
        filters: report.filters,
        columns: report.columns,
        sort_by: report.sortBy,
        sort_direction: report.sortDirection,
        chart_type: report.chartType,
        date_range_type: report.dateRangeType,
        date_from: report.dateFrom,
        date_to: report.dateTo,
        created_by: report.createdBy,
        is_favorite: report.isFavorite,
      })
      .select()
      .single();

    if (error) throw error;
    return mapSavedReportRow(data);
  },

  async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleReportFavorite(id: string, isFavorite: boolean): Promise<SavedReport> {
    const { data, error } = await supabase
      .from('saved_reports')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapSavedReportRow(data);
  },

  // ==========================================
  // REFRESH ANALYTICS
  // ==========================================

  async refreshAllAnalytics(): Promise<AnalyticsRefreshResult> {
    const { data, error } = await supabase.rpc('refresh_all_analytics');

    if (error) throw error;

    const result = data?.[0] || data;
    return {
      cohortsRefreshed: result?.cohorts_refreshed || 0,
      ltvCalculated: result?.ltv_calculated || 0,
      retentionCalculated: result?.retention_calculated || 0,
      progressionCalculated: result?.progression_calculated || 0,
    };
  },

  async refreshCohorts(): Promise<number> {
    const { data, error } = await supabase.rpc('refresh_donor_cohorts');
    if (error) throw error;
    return data || 0;
  },

  async calculateLifetimeValues(): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_lifetime_values');
    if (error) throw error;
    return data || 0;
  },

  async calculateRetentionMetrics(): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_retention_metrics');
    if (error) throw error;
    return data || 0;
  },

  async calculateGivingProgression(): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_giving_progression');
    if (error) throw error;
    return data || 0;
  },

  // ==========================================
  // STATISTICS
  // ==========================================

  async getStats(): Promise<AnalyticsStats> {
    // Get LTV stats
    const { data: ltvData, error: ltvError } = await supabase
      .from('lifetime_values')
      .select('total_lifetime_value, rfm_score');

    if (ltvError) throw ltvError;

    const ltvRecords = ltvData || [];
    const totalLTV = ltvRecords.reduce((sum, r) => sum + (parseFloat(r.total_lifetime_value) || 0), 0);
    const avgLTV = ltvRecords.length > 0 ? totalLTV / ltvRecords.length : 0;
    const avgRFM = ltvRecords.length > 0
      ? ltvRecords.reduce((sum, r) => sum + (r.rfm_score || 0), 0) / ltvRecords.length
      : 0;

    // Get cohort count
    const { count: cohortCount } = await supabase
      .from('donor_cohorts')
      .select('*', { count: 'exact', head: true });

    // Get avg retention rate
    const { data: retentionData } = await supabase
      .from('retention_metrics')
      .select('retention_rate')
      .gt('years_since_acquisition', 0);

    const retentionRecords = retentionData || [];
    const avgRetention = retentionRecords.length > 0
      ? retentionRecords.reduce((sum, r) => sum + (parseFloat(r.retention_rate) || 0), 0) / retentionRecords.length
      : 0;

    // Get progression stats
    const { data: progressionData } = await supabase
      .from('giving_progression')
      .select('yoy_total_change_pct');

    const progressionRecords = progressionData || [];
    const avgYoyGrowth = progressionRecords.length > 0
      ? progressionRecords.reduce((sum, r) => sum + (parseFloat(r.yoy_total_change_pct) || 0), 0) / progressionRecords.length
      : 0;

    return {
      totalDonors: ltvRecords.length,
      totalLifetimeValue: totalLTV,
      avgLifetimeValue: avgLTV,
      avgRfmScore: Math.round(avgRFM),
      totalCohorts: cohortCount || 0,
      avgRetentionRate: Math.round(avgRetention * 10) / 10,
      donorsWithProgression: progressionRecords.length,
      avgYoyGrowth: Math.round(avgYoyGrowth * 10) / 10,
    };
  },

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  },
};
