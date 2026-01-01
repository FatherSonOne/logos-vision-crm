import React, { useState, useEffect } from 'react';
import { outcomeService } from '../services/outcomeService';
import type {
  ImpactStats,
  ProgramImpactSummary,
  ClientOutcomeSummary,
  ImpactSnapshot,
  Program,
  ClientProgress,
  Outcome,
} from '../types';
import {
  PROGRAM_CATEGORY_LABELS,
  PROGRAM_CATEGORY_COLORS,
  PROGRESS_STAGE_LABELS,
} from '../types';

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color = 'blue' }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p className={`mt-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ICONS
// ============================================

const UsersIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TargetIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const AwardIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ============================================
// PROGRAM CARD COMPONENT
// ============================================

const ProgramCard: React.FC<{ program: ProgramImpactSummary }> = ({ program }) => {
  const categoryColor = PROGRAM_CATEGORY_COLORS[program.programCategory] || '#6b7280';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{program.programName}</h4>
          <span
            className="inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            {PROGRAM_CATEGORY_LABELS[program.programCategory]}
          </span>
        </div>
        {program.isActive ? (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            Active
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full">
            Inactive
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Enrolled</p>
          <p className="font-semibold text-slate-900 dark:text-white">{program.totalEnrolled}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Completed</p>
          <p className="font-semibold text-slate-900 dark:text-white">{program.totalCompleted}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Completion Rate</p>
          <p className="font-semibold text-slate-900 dark:text-white">{program.completionRate.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Total Outcomes</p>
          <p className="font-semibold text-slate-900 dark:text-white">{program.totalOutcomes}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Impact</p>
            <p className="font-bold text-green-600 dark:text-green-400">
              ${program.totalImpactValue.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">ROI</p>
            <p className={`font-bold ${program.roiPercentage >= 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {program.roiPercentage.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CLIENT OUTCOMES TABLE
// ============================================

const ClientOutcomesTable: React.FC<{ clients: ClientOutcomeSummary[] }> = ({ clients }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    graduated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Client</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Programs</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Services</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Outcomes</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Impact</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
          </tr>
        </thead>
        <tbody>
          {clients.slice(0, 10).map(client => (
            <tr key={client.clientId} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="py-3 px-4">
                <p className="font-medium text-slate-900 dark:text-white">{client.clientName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{client.clientEmail}</p>
              </td>
              <td className="text-center py-3 px-4">
                <span className="text-slate-900 dark:text-white">{client.programsCompleted}</span>
                <span className="text-slate-400 dark:text-slate-500">/{client.programsEnrolled}</span>
              </td>
              <td className="text-center py-3 px-4 text-slate-900 dark:text-white">{client.totalServices}</td>
              <td className="text-center py-3 px-4 text-slate-900 dark:text-white">{client.totalOutcomes}</td>
              <td className="text-right py-3 px-4 font-semibold text-green-600 dark:text-green-400">
                ${client.totalImpactValue.toLocaleString()}
              </td>
              <td className="text-center py-3 px-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[client.clientStatus]}`}>
                  {client.clientStatus.charAt(0).toUpperCase() + client.clientStatus.slice(1)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          No client data available yet
        </div>
      )}
    </div>
  );
};

// ============================================
// OUTCOME BREAKDOWN CHART
// ============================================

const OutcomeBreakdownChart: React.FC<{ snapshot: ImpactSnapshot | null }> = ({ snapshot }) => {
  if (!snapshot) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        No snapshot data available
      </div>
    );
  }

  const outcomes = [
    { label: 'Employment', value: snapshot.employmentOutcomes, color: PROGRAM_CATEGORY_COLORS.employment },
    { label: 'Housing', value: snapshot.housingOutcomes, color: PROGRAM_CATEGORY_COLORS.housing },
    { label: 'Education', value: snapshot.educationOutcomes, color: PROGRAM_CATEGORY_COLORS.education },
    { label: 'Health', value: snapshot.healthOutcomes, color: PROGRAM_CATEGORY_COLORS.health },
    { label: 'Financial', value: snapshot.financialOutcomes, color: PROGRAM_CATEGORY_COLORS.financial },
  ];

  const total = outcomes.reduce((sum, o) => sum + o.value, 0);
  const maxValue = Math.max(...outcomes.map(o => o.value), 1);

  return (
    <div className="space-y-3">
      {outcomes.map(outcome => (
        <div key={outcome.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600 dark:text-slate-300">{outcome.label}</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {outcome.value} ({total > 0 ? ((outcome.value / total) * 100).toFixed(0) : 0}%)
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(outcome.value / maxValue) * 100}%`,
                backgroundColor: outcome.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ImpactDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'programs' | 'clients' | 'outcomes'>('overview');

  const [stats, setStats] = useState<ImpactStats | null>(null);
  const [programs, setProgramSummaries] = useState<ProgramImpactSummary[]>([]);
  const [clients, setClientSummaries] = useState<ClientOutcomeSummary[]>([]);
  const [snapshot, setSnapshot] = useState<ImpactSnapshot | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, programsData, clientsData, snapshotData] = await Promise.all([
        outcomeService.getImpactStats(),
        outcomeService.getProgramImpactSummaries(),
        outcomeService.getClientOutcomeSummaries(),
        outcomeService.getLatestSnapshot(),
      ]);

      setStats(statsData);
      setProgramSummaries(programsData);
      setClientSummaries(clientsData);
      setSnapshot(snapshotData);
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await outcomeService.createImpactSnapshot();
      await loadData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Impact Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track outcomes, measure impact, and demonstrate mission effectiveness
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshIcon />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex gap-6">
          {(['overview', 'programs', 'clients', 'outcomes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Lives Changed"
              value={stats.totalClientsServed.toLocaleString()}
              subtitle={`${stats.activeClients} currently active`}
              icon={<UsersIcon />}
              color="blue"
            />
            <StatCard
              title="Total Outcomes"
              value={stats.totalOutcomes.toLocaleString()}
              icon={<TargetIcon />}
              color="green"
            />
            <StatCard
              title="Economic Impact"
              value={`$${(stats.totalImpactValue / 1000).toFixed(0)}K`}
              icon={<DollarIcon />}
              color="purple"
            />
            <StatCard
              title="Services Delivered"
              value={stats.totalServicesDelivered.toLocaleString()}
              subtitle={`${stats.totalServiceHours.toFixed(0)} hours`}
              icon={<ClockIcon />}
              color="amber"
            />
            <StatCard
              title="Completion Rate"
              value={`${stats.avgCompletionRate.toFixed(0)}%`}
              icon={<AwardIcon />}
              color="rose"
            />
            <StatCard
              title="Overall ROI"
              value={`${stats.overallROI.toFixed(0)}%`}
              icon={<TrendingUpIcon />}
              color="cyan"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outcome Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Outcomes by Category</h3>
              <OutcomeBreakdownChart snapshot={snapshot} />
            </div>

            {/* Top Programs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Performing Programs</h3>
              <div className="space-y-3">
                {programs.slice(0, 5).map((program, index) => (
                  <div
                    key={program.programId}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{program.programName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {program.totalCompleted} completed • {program.totalOutcomes} outcomes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        ${program.totalImpactValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{program.roiPercentage.toFixed(0)}% ROI</p>
                    </div>
                  </div>
                ))}
                {programs.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                    No program data available yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Client Outcomes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Client Outcomes</h3>
            <ClientOutcomesTable clients={clients} />
          </div>
        </div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map(program => (
              <ProgramCard key={program.programId} program={program} />
            ))}
          </div>
          {programs.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No programs found</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Run the database migration and add programs to see data here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All Client Outcomes</h3>
          <ClientOutcomesTable clients={clients} />
        </div>
      )}

      {/* Outcomes Tab */}
      {activeTab === 'outcomes' && snapshot && (
        <div className="space-y-6">
          {/* Snapshot Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Latest Impact Snapshot</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(snapshot.snapshotDate).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Enrollments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{snapshot.totalEnrollments}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Enrollments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{snapshot.activeEnrollments}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Clients Served</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{snapshot.uniqueClientsServed}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{snapshot.overallCompletionRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          {/* Outcomes by Category */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Outcomes by Category</h3>
            <OutcomeBreakdownChart snapshot={snapshot} />
          </div>

          {/* Impact Summary */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Total Impact Generated</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-green-100">Total Impact Value</p>
                <p className="text-4xl font-bold">${snapshot.totalImpactValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-green-100">Total Outcomes</p>
                <p className="text-4xl font-bold">{snapshot.totalOutcomes}</p>
              </div>
              <div>
                <p className="text-green-100">Avg Cost per Outcome</p>
                <p className="text-4xl font-bold">${snapshot.avgCostPerOutcome.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'outcomes' && !snapshot && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">No snapshot data available</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Click "Refresh Data" to create an impact snapshot
          </p>
        </div>
      )}
    </div>
  );
};

export default ImpactDashboard;
