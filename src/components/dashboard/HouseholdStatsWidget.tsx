import React, { useEffect, useState } from 'react';
import { Users, Home, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface HouseholdStats {
  totalHouseholds: number;
  totalMembers: number;
  totalGiving: number;
  avgGivingPerHousehold: number;
  householdsWithDonations: number;
}

interface TopHousehold {
  id: string;
  name: string;
  memberCount: number;
  totalDonated: number;
}

export const HouseholdStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<HouseholdStats>({
    totalHouseholds: 0,
    totalMembers: 0,
    totalGiving: 0,
    avgGivingPerHousehold: 0,
    householdsWithDonations: 0,
  });
  const [topHouseholds, setTopHouseholds] = useState<TopHousehold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouseholdStats();
  }, []);

  const fetchHouseholdStats = async () => {
    try {
      // Fetch household totals from the view
      const { data: householdData, error } = await supabase
        .from('household_totals')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (householdData && householdData.length > 0) {
        const totalHouseholds = householdData.length;
        const totalMembers = householdData.reduce((sum, h) => sum + (h.member_count || 0), 0);
        const totalGiving = householdData.reduce((sum, h) => sum + (parseFloat(h.total_donated) || 0), 0);
        const householdsWithDonations = householdData.filter(h => parseFloat(h.total_donated) > 0).length;
        const avgGivingPerHousehold = totalHouseholds > 0 ? totalGiving / totalHouseholds : 0;

        setStats({
          totalHouseholds,
          totalMembers,
          totalGiving,
          avgGivingPerHousehold,
          householdsWithDonations,
        });

        // Get top 5 households by giving
        const topFive = [...householdData]
          .sort((a, b) => (parseFloat(b.total_donated) || 0) - (parseFloat(a.total_donated) || 0))
          .slice(0, 5)
          .map(h => ({
            id: h.household_id,
            name: h.household_name,
            memberCount: h.member_count || 0,
            totalDonated: parseFloat(h.total_donated) || 0,
          }));

        setTopHouseholds(topFive);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching household stats:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-rose-200 dark:border-rose-800 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Household Giving
        </h3>
        <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
          <Home className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
      </div>

      {/* Main stat */}
      <div className="flex items-baseline space-x-2 mb-4">
        <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
          {formatCurrency(stats.totalGiving)}
        </span>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          total
        </span>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Households</span>
          </div>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">{stats.totalHouseholds}</p>
        </div>
        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Avg/Household</span>
          </div>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">{formatCurrency(stats.avgGivingPerHousehold)}</p>
        </div>
      </div>

      {/* Top households */}
      {topHouseholds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-800/50">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
            Top Giving Households
          </p>
          <ul className="space-y-2">
            {topHouseholds.slice(0, 3).map((household, index) => (
              <li key={household.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                    index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' :
                    index === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                    {household.name}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {formatCurrency(household.totalDonated)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats.totalHouseholds === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No households created yet.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            Start by creating a household from the Households page.
          </p>
        </div>
      )}
    </div>
  );
};
