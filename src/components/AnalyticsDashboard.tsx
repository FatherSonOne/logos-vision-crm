import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import type {
  DonorCohort,
  LifetimeValue,
  CohortRetentionSummary,
  DonorAnalyticsSummary,
  AnalyticsStats,
  AnalyticsRefreshResult,
} from '../types';

// ============================================
// ICONS
// ============================================

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const getRFMColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-blue-600 bg-blue-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  if (score >= 20) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

const getRetentionColor = (rate: number): string => {
  if (rate >= 70) return 'bg-green-500';
  if (rate >= 50) return 'bg-blue-500';
  if (rate >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = 'indigo',
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            <span className="ml-1">vs last year</span>
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-xl`}>
        <div className={`text-${color}-600`}>{icon}</div>
      </div>
    </div>
  </div>
);

// ============================================
// COHORT TABLE COMPONENT
// ============================================

interface CohortTableProps {
  cohorts: DonorCohort[];
  onSelectCohort: (cohort: DonorCohort) => void;
}

const CohortTable: React.FC<CohortTableProps> = ({ cohorts, onSelectCohort }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CalendarIcon /> Donor Cohorts
      </h3>
      <p className="text-sm text-gray-500 mt-1">Donors grouped by first donation year</p>
    </div>
    {cohorts.length === 0 ? (
      <div className="p-8 text-center text-gray-500">
        No cohort data available. Run analytics refresh to generate cohorts.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donors</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Year Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg First Gift</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cohorts.map((cohort) => (
              <tr key={cohort.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{cohort.cohortName}</div>
                  <div className="text-xs text-gray-500">{cohort.cohortYear}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{cohort.totalDonors}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {formatCurrency(cohort.totalFirstYearValue)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(cohort.avgFirstGift)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onSelectCohort(cohort)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ============================================
// RETENTION CHART COMPONENT
// ============================================

interface RetentionChartProps {
  data: CohortRetentionSummary[];
}

const RetentionChart: React.FC<RetentionChartProps> = ({ data }) => {
  // Group by cohort year
  const cohortYears = Array.from(new Set(data.map((d) => d.cohortYear))).sort((a, b) => b - a).slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <TargetIcon /> Retention by Cohort
      </h3>
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No retention data available. Run analytics refresh to generate metrics.
        </div>
      ) : (
        <div className="space-y-4">
          {cohortYears.map((year) => {
            const cohortData = data.filter((d) => d.cohortYear === year);
            const latestRetention = cohortData.find((d) => d.yearsSinceAcquisition > 0);

            return (
              <div key={year} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Class of {year}</span>
                  <span className="text-gray-500">
                    {latestRetention ? formatPercent(latestRetention.retentionRate) : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${getRetentionColor(latestRetention?.retentionRate || 0)}`}
                    style={{ width: `${latestRetention?.retentionRate || 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================
// TOP DONORS TABLE COMPONENT
// ============================================

interface TopDonorsTableProps {
  donors: LifetimeValue[];
}

const TopDonorsTable: React.FC<TopDonorsTableProps> = ({ donors }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <StarIcon /> Top Donors by Lifetime Value
      </h3>
    </div>
    {donors.length === 0 ? (
      <div className="p-8 text-center text-gray-500">
        No LTV data available. Run analytics refresh to calculate lifetime values.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lifetime Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donations</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Gift</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFM Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donors.map((donor, index) => (
              <tr key={donor.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{donor.clientName || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{donor.clientEmail || '-'}</div>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-green-600">
                  {formatCurrency(donor.totalLifetimeValue)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{donor.totalDonations}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(donor.avgDonation)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRFMColor(donor.rfmScore)}`}>
                    {donor.rfmScore}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ============================================
// DONOR SUMMARY TABLE COMPONENT
// ============================================

interface DonorSummaryTableProps {
  donors: DonorAnalyticsSummary[];
}

const DonorSummaryTable: React.FC<DonorSummaryTableProps> = ({ donors }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <UsersIcon /> Donor Analytics Summary
      </h3>
    </div>
    {donors.length === 0 ? (
      <div className="p-8 text-center text-gray-500">
        No donor analytics data available.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTV</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFM</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">YoY Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {donors.slice(0, 10).map((donor) => (
              <tr key={donor.clientId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{donor.clientName}</div>
                  <div className="text-xs text-gray-500">{donor.clientEmail || '-'}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {donor.cohortYear || '-'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">
                  {donor.totalLifetimeValue ? formatCurrency(donor.totalLifetimeValue) : '-'}
                </td>
                <td className="px-4 py-3">
                  {donor.rfmScore ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRFMColor(donor.rfmScore)}`}>
                      {donor.rfmScore}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {donor.engagementLevel || '-'}
                </td>
                <td className="px-4 py-3">
                  {donor.yoyTotalChangePct !== null && donor.yoyTotalChangePct !== undefined ? (
                    <span className={`text-sm font-medium ${donor.yoyTotalChangePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {donor.yoyTotalChangePct >= 0 ? '+' : ''}{donor.yoyTotalChangePct.toFixed(1)}%
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

type TabType = 'overview' | 'cohorts' | 'ltv' | 'donors';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [cohorts, setCohorts] = useState<DonorCohort[]>([]);
  const [topDonors, setTopDonors] = useState<LifetimeValue[]>([]);
  const [retentionData, setRetentionData] = useState<CohortRetentionSummary[]>([]);
  const [donorSummaries, setDonorSummaries] = useState<DonorAnalyticsSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<AnalyticsRefreshResult | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, cohortsData, topDonorsData, retentionSummary, summaries] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getCohorts(),
        analyticsService.getTopDonorsByLTV(10),
        analyticsService.getCohortRetentionSummary(),
        analyticsService.getDonorAnalyticsSummary({ sortBy: 'ltv', limit: 20 }),
      ]);

      setStats(statsData);
      setCohorts(cohortsData);
      setTopDonors(topDonorsData);
      setRetentionData(retentionSummary);
      setDonorSummaries(summaries);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAnalytics = async () => {
    setIsRefreshing(true);
    setRefreshResult(null);
    try {
      const result = await analyticsService.refreshAllAnalytics();
      setRefreshResult(result);
      await loadData();
    } catch (err) {
      console.error('Failed to refresh analytics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSelectCohort = (cohort: DonorCohort) => {
    // Could navigate to cohort detail view
    console.log('Selected cohort:', cohort);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: <ChartBarIcon /> },
    { id: 'cohorts' as TabType, label: 'Cohorts', icon: <CalendarIcon /> },
    { id: 'ltv' as TabType, label: 'Lifetime Value', icon: <CurrencyIcon /> },
    { id: 'donors' as TabType, label: 'Donor Details', icon: <UsersIcon /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="text-gray-500 mt-1">
            Donor insights, cohort analysis, and lifetime value metrics
          </p>
        </div>
        <button
          onClick={handleRefreshAnalytics}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshIcon />
          {isRefreshing ? 'Refreshing...' : 'Refresh Analytics'}
        </button>
      </div>

      {/* Refresh Result */}
      {refreshResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Analytics refreshed successfully!</p>
          <p className="text-green-600 text-sm mt-1">
            Cohorts: {refreshResult.cohortsRefreshed} |
            LTV: {refreshResult.ltvCalculated} |
            Retention: {refreshResult.retentionCalculated} |
            Progression: {refreshResult.progressionCalculated}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Donors"
                    value={stats.totalDonors}
                    icon={<UsersIcon />}
                    subtitle={`${stats.totalCohorts} cohorts`}
                  />
                  <StatCard
                    title="Total Lifetime Value"
                    value={formatCurrency(stats.totalLifetimeValue)}
                    icon={<CurrencyIcon />}
                    color="green"
                  />
                  <StatCard
                    title="Avg Lifetime Value"
                    value={formatCurrency(stats.avgLifetimeValue)}
                    icon={<TrendingUpIcon />}
                    subtitle={`RFM Score: ${stats.avgRfmScore}`}
                    color="blue"
                  />
                  <StatCard
                    title="Avg Retention Rate"
                    value={formatPercent(stats.avgRetentionRate)}
                    icon={<TargetIcon />}
                    subtitle={`${stats.avgYoyGrowth > 0 ? '+' : ''}${stats.avgYoyGrowth.toFixed(1)}% YoY growth`}
                    color="purple"
                  />
                </div>
              )}

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RetentionChart data={retentionData} />
                <TopDonorsTable donors={topDonors.slice(0, 5)} />
              </div>

              {/* Cohort Overview */}
              <CohortTable cohorts={cohorts.slice(0, 5)} onSelectCohort={handleSelectCohort} />
            </div>
          )}

          {/* Cohorts Tab */}
          {activeTab === 'cohorts' && (
            <div className="space-y-6">
              <CohortTable cohorts={cohorts} onSelectCohort={handleSelectCohort} />
              <RetentionChart data={retentionData} />
            </div>
          )}

          {/* LTV Tab */}
          {activeTab === 'ltv' && (
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Lifetime Value"
                    value={formatCurrency(stats.totalLifetimeValue)}
                    icon={<CurrencyIcon />}
                    color="green"
                  />
                  <StatCard
                    title="Average LTV"
                    value={formatCurrency(stats.avgLifetimeValue)}
                    icon={<TrendingUpIcon />}
                    color="blue"
                  />
                  <StatCard
                    title="Avg RFM Score"
                    value={stats.avgRfmScore}
                    icon={<TargetIcon />}
                    subtitle="Recency + Frequency + Monetary"
                    color="purple"
                  />
                </div>
              )}
              <TopDonorsTable donors={topDonors} />
            </div>
          )}

          {/* Donors Tab */}
          {activeTab === 'donors' && (
            <div className="space-y-6">
              <DonorSummaryTable donors={donorSummaries} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
