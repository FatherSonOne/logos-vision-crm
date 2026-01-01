import React, { useEffect, useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { pledgeService } from '../../services/pledgeService';
import type { PledgeSummary } from '../../types';

interface PledgeStats {
  totalPledges: number;
  activePledges: number;
  totalPledgedAmount: number;
  totalFulfilledAmount: number;
  overallFulfillmentRate: number;
}

interface UnfulfilledPledge {
  id: string;
  donor_name: string;
  remaining: number;
}

export const PledgeFulfillmentWidget: React.FC = () => {
  const [stats, setStats] = useState<PledgeStats | null>(null);
  const [topUnfulfilled, setTopUnfulfilled] = useState<UnfulfilledPledge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPledgeData();
  }, []);

  const fetchPledgeData = async () => {
    try {
      // Get overall stats
      const pledgeStats = await pledgeService.getStats();
      setStats(pledgeStats);

      // Get active pledges to find top unfulfilled
      const activePledges = await pledgeService.getAll({ status: 'active' });

      // Get top 5 unfulfilled pledges sorted by remaining amount
      const unfulfilled = activePledges
        .filter(p => p.remainingAmount > 0)
        .sort((a, b) => b.remainingAmount - a.remainingAmount)
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          donor_name: p.clientName,
          remaining: p.remainingAmount
        }));

      setTopUnfulfilled(unfulfilled);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pledge data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const fulfillmentRate = stats?.overallFulfillmentRate ?? 0;
  const totalPledged = stats?.totalPledgedAmount ?? 0;
  const totalFulfilled = stats?.totalFulfilledAmount ?? 0;

  return (
    <div className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-800/50 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Pledge Fulfillment
          </h3>
        </div>
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>

      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          {Math.round(fulfillmentRate)}%
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          fulfilled overall
        </span>
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        ${totalFulfilled.toLocaleString()} of ${totalPledged.toLocaleString()} pledged
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(fulfillmentRate, 100)}%` }}
        ></div>
      </div>

      {/* Top Unfulfilled Pledges */}
      {topUnfulfilled.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Top Unfulfilled:
          </p>
          {topUnfulfilled.map((pledge) => (
            <div
              key={pledge.id}
              className="flex justify-between items-center bg-white/60 dark:bg-slate-800/60 rounded-lg p-2 text-xs"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                {pledge.donor_name}
              </span>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                ${pledge.remaining.toLocaleString()} due
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Show active pledge count */}
      {stats && stats.activePledges > 0 && (
        <div className="mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-800/30">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {stats.activePledges} active pledge{stats.activePledges !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};
