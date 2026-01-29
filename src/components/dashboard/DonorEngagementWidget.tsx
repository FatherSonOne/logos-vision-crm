import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Star } from 'lucide-react';
import { engagementService } from '../../services/engagementService';
import type { EngagementScore, EngagementStats } from '../../types';

// Color mapping for engagement levels
const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  'Highly Engaged': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-300' },
  'Engaged': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-300' },
  'Moderate': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-300' },
  'Low Engagement': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300' },
  'At Risk': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-300' },
};

export const DonorEngagementWidget: React.FC = () => {
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [topEngaged, setTopEngaged] = useState<EngagementScore[]>([]);
  const [atRisk, setAtRisk] = useState<EngagementScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top' | 'risk'>('top');

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      const [engagementStats, topDonors, riskDonors] = await Promise.all([
        engagementService.getStats(),
        engagementService.getTopEngaged(5),
        engagementService.getAtRisk(5),
      ]);

      setStats(engagementStats);
      setTopEngaged(topDonors);
      setAtRisk(riskDonors);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const avgScore = stats?.averageScore ?? 0;
  const totalScored = stats?.scoredDonors ?? 0;

  // Get score color based on value
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 20) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Get score badge styling
  const getScoreBadge = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (score >= 20) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-800/50 transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Donor Engagement
          </h3>
        </div>
        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>

      {/* Average Score */}
      <div className="flex items-baseline space-x-2 mb-2">
        <span className={`text-4xl font-bold ${getScoreColor(avgScore)}`}>
          {Math.round(avgScore)}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          avg. engagement score
        </span>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        {totalScored} donor{totalScored !== 1 ? 's' : ''} scored
      </div>

      {/* Engagement Level Distribution */}
      {stats && (
        <div className="grid grid-cols-5 gap-1 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.highlyEngaged}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">High</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.engaged}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">Good</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.moderate}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">Med</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.lowEngagement}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">Low</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.atRisk}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">Risk</div>
          </div>
        </div>
      )}

      {/* Tab Buttons */}
      <div className="flex space-x-2 mb-3">
        <button
          onClick={() => setActiveTab('top')}
          className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'top'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
              : 'bg-white/60 text-gray-600 hover:bg-gray-100 dark:bg-slate-800/40 dark:text-gray-400 dark:hover:bg-slate-700/40'
          }`}
        >
          <Star className="w-3 h-3" />
          <span>Top Engaged</span>
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'risk'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
              : 'bg-white/60 text-gray-600 hover:bg-gray-100 dark:bg-slate-800/40 dark:text-gray-400 dark:hover:bg-slate-700/40'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>At Risk</span>
        </button>
      </div>

      {/* Donor Lists */}
      <div className="space-y-2">
        {activeTab === 'top' && topEngaged.length > 0 && (
          <>
            {topEngaged.map((donor) => (
              <div
                key={donor.id}
                className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                    {donor.clientName}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getScoreBadge(donor.overallScore)}`}>
                  {Math.round(donor.overallScore)}
                </span>
              </div>
            ))}
          </>
        )}

        {activeTab === 'risk' && atRisk.length > 0 && (
          <>
            {atRisk.map((donor) => (
              <div
                key={donor.id}
                className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                    {donor.clientName}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {donor.daysSinceLastDonation && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {donor.daysSinceLastDonation}d ago
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getScoreBadge(donor.overallScore)}`}>
                    {Math.round(donor.overallScore)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'top' && topEngaged.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
            No engagement data available. Run score refresh.
          </p>
        )}

        {activeTab === 'risk' && atRisk.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
            No at-risk donors found.
          </p>
        )}
      </div>

      {/* Footer with refresh hint */}
      <div className="mt-4 pt-3 border-t border-purple-200/50 dark:border-purple-800/30">
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          Scores update periodically based on donation activity
        </p>
      </div>
    </div>
  );
};
