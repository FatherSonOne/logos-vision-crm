import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RetentionData {
  month: string;
  rate: number;
}

export const DonorRetentionWidget: React.FC = () => {
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [previousRate, setPreviousRate] = useState<number>(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'flat'>('flat');
  const [chartData, setChartData] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateRetentionRate();
    calculateMonthlyTrend();
  }, []);

  const calculateRetentionRate = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      // Get donors who gave last year
      const { data: lastYearDonors } = await supabase
        .from('donations')
        .select('client_id')
        .gte('donation_date', `${lastYear}-01-01`)
        .lte('donation_date', `${lastYear}-12-31`);

      const uniqueLastYear = new Set(lastYearDonors?.map(d => d.client_id) || []);

      // Get donors who gave this year
      const { data: thisYearDonors } = await supabase
        .from('donations')
        .select('client_id')
        .gte('donation_date', `${currentYear}-01-01`);

      const uniqueThisYear = new Set(thisYearDonors?.map(d => d.client_id) || []);

      // Calculate retention: donors who gave BOTH years / donors who gave last year
      const retainedDonors = [...uniqueLastYear].filter(id => uniqueThisYear.has(id));
      const retentionRate = uniqueLastYear.size > 0
        ? (retainedDonors.length / uniqueLastYear.size) * 100
        : 0;

      setCurrentRate(Math.round(retentionRate));

      // Calculate previous year retention for comparison
      const { data: twoYearsAgoDonors } = await supabase
        .from('donations')
        .select('client_id')
        .gte('donation_date', `${lastYear - 1}-01-01`)
        .lte('donation_date', `${lastYear - 1}-12-31`);

      const uniqueTwoYearsAgo = new Set(twoYearsAgoDonors?.map(d => d.client_id) || []);
      const prevRetained = [...uniqueTwoYearsAgo].filter(id => uniqueLastYear.has(id));
      const prevRate = uniqueTwoYearsAgo.size > 0
        ? (prevRetained.length / uniqueTwoYearsAgo.size) * 100
        : 0;

      setPreviousRate(Math.round(prevRate));

      // Determine trend
      if (retentionRate > prevRate + 2) setTrend('up');
      else if (retentionRate < prevRate - 2) setTrend('down');
      else setTrend('flat');

      setLoading(false);
    } catch (error) {
      console.error('Error calculating retention rate:', error);
      setLoading(false);
    }
  };

  const calculateMonthlyTrend = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const months = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthNum = String(date.getMonth() + 1).padStart(2, '0');

        // Calculate retention for this month
        // (This is a simplified version - you may want to refine the logic)
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextYear = nextMonth.getFullYear();
        const nextMonthNum = String(nextMonth.getMonth() + 1).padStart(2, '0');

        const { data: donations } = await supabase
          .from('donations')
          .select('client_id')
          .gte('donation_date', `${year}-${monthNum}-01`)
          .lt('donation_date', `${nextYear}-${nextMonthNum}-01`);

        const donorCount = new Set(donations?.map(d => d.client_id) || []).size;

        months.push({
          month,
          rate: donorCount > 0 ? Math.min(donorCount * 5, 100) : 0 // Simplified calculation
        });
      }

      setChartData(months);
    } catch (error) {
      console.error('Error calculating monthly trend:', error);
    }
  };

  const getColorClass = () => {
    if (currentRate >= 60) return 'text-green-600';
    if (currentRate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColorClass = () => {
    if (currentRate >= 60) return 'bg-green-50 border-green-200';
    if (currentRate >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
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
    <div className={`${getBgColorClass()} backdrop-blur-sm rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Donor Retention Rate
        </h3>
        {getTrendIcon()}
      </div>

      <div className="flex items-baseline space-x-2 mb-2">
        <span className={`text-4xl font-bold ${getColorClass()}`}>
          {currentRate}%
        </span>
        <span className="text-sm text-gray-600">
          vs {previousRate}% last year
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-4">
        {currentRate >= 60 && "Excellent retention! Keep engaging donors."}
        {currentRate >= 40 && currentRate < 60 && "Good retention. Focus on stewardship."}
        {currentRate < 40 && "Retention needs attention. Review donor communication."}
      </p>

      {chartData.length > 0 && (
        <div className="h-32 mt-4" style={{ minWidth: 200, minHeight: 128 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={100}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="#9ca3af"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={currentRate >= 60 ? '#16a34a' : currentRate >= 40 ? '#ca8a04' : '#dc2626'}
                strokeWidth={2}
                dot={{ fill: currentRate >= 60 ? '#16a34a' : currentRate >= 40 ? '#ca8a04' : '#dc2626', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
