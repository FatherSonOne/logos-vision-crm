import React, { useEffect, useState } from 'react';
import { AlertTriangle, Users, Mail } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface LapsedDonor {
  id: string;
  name: string;
  last_gift_date: string;
  total_lifetime_giving: number;
}

export const LapsedDonorAlert: React.FC = () => {
  const [lapsedCount, setLapsedCount] = useState<number>(0);
  const [topLapsed, setTopLapsed] = useState<LapsedDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLapsedDonors();
  }, []);

  const fetchLapsedDonors = async () => {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      // Find clients who gave before but not in last 12 months
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, last_gift_date, total_lifetime_giving')
        .not('last_gift_date', 'is', null)
        .lt('last_gift_date', twelveMonthsAgo.toISOString().split('T')[0])
        .gt('total_lifetime_giving', 0)
        .order('total_lifetime_giving', { ascending: false });

      setLapsedCount(clients?.length || 0);
      setTopLapsed(clients?.slice(0, 5) || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lapsed donors:', error);
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    // Navigate to contacts page with lapsed filter
    // If you have routing, add this:
    // window.location.href = '/contacts?filter=lapsed';
    console.log('Navigate to contacts with lapsed filter');
  };

  const handleSendCampaign = () => {
    // Navigate to email campaigns
    // If you have routing, add this:
    // window.location.href = '/email-campaigns?type=reengagement';
    console.log('Navigate to email campaigns');
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

  return (
    <div className="bg-red-50/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Lapsed Donors
          </h3>
        </div>
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          {lapsedCount}
        </span>
      </div>

      <div className="flex items-baseline space-x-2 mb-4">
        <span className="text-4xl font-bold text-red-600">
          {lapsedCount}
        </span>
        <span className="text-sm text-gray-600">
          donors haven't given in 12+ months
        </span>
      </div>

      {topLapsed.length > 0 ? (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Top Lapsed Donors:
          </p>
          {topLapsed.map((donor) => (
            <div
              key={donor.id}
              className="flex justify-between items-center bg-white/60 rounded-lg p-2 text-xs"
            >
              <span className="font-medium text-gray-700 truncate max-w-[150px]">
                {donor.name}
              </span>
              <span className="text-gray-600">
                ${donor.total_lifetime_giving?.toLocaleString() || 0}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4 text-xs text-gray-600">
          No lapsed donors found. Great retention!
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleViewAll}
          className="flex-1 flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors duration-200"
        >
          <Users className="w-4 h-4" />
          <span>View All</span>
        </button>
        <button
          onClick={handleSendCampaign}
          className="flex-1 flex items-center justify-center space-x-1 bg-white hover:bg-gray-50 text-red-600 text-xs font-semibold py-2 px-3 rounded-lg border border-red-300 transition-colors duration-200"
        >
          <Mail className="w-4 h-4" />
          <span>Re-engage</span>
        </button>
      </div>
    </div>
  );
};
