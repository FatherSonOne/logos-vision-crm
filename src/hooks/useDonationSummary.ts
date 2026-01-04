import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface DonationSummary {
  thisYearTotal: number;
  lastYearTotal: number;
  thisYearCount: number;
  lastYearCount: number;
  averageGiftThisYear: number;
  averageGiftLastYear: number;
  loading: boolean;
  error: string | null;
  currentYear: number;
  lastYear: number;
}

export const useDonationSummary = (): DonationSummary => {
  const currentYear = new Date().getFullYear();
  const [state, setState] = useState<DonationSummary>({
    thisYearTotal: 0,
    lastYearTotal: 0,
    thisYearCount: 0,
    lastYearCount: 0,
    averageGiftThisYear: 0,
    averageGiftLastYear: 0,
    loading: true,
    error: null,
    currentYear,
    lastYear: currentYear - 1
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const now = new Date();
        const thisYear = now.getFullYear();
        const lastYear = thisYear - 1;

        const thisYearStart = `${thisYear}-01-01`;
        const thisYearEnd = `${thisYear}-12-31`;
        const lastYearStart = `${lastYear}-01-01`;
        const lastYearEnd = `${lastYear}-12-31`;

        // This year
        const { data: thisYearData, error: thisYearError } = await supabase
          .from('donations')
          .select('amount, donation_date')
          .gte('donation_date', thisYearStart)
          .lte('donation_date', thisYearEnd);

        if (thisYearError) throw thisYearError;

        const thisYearTotal = (thisYearData || []).reduce(
          (sum, d: any) => sum + (Number(d.amount) || 0),
          0
        );
        const thisYearCount = thisYearData?.length || 0;
        const averageGiftThisYear =
          thisYearCount > 0 ? thisYearTotal / thisYearCount : 0;

        // Last year
        const { data: lastYearData, error: lastYearError } = await supabase
          .from('donations')
          .select('amount, donation_date')
          .gte('donation_date', lastYearStart)
          .lte('donation_date', lastYearEnd);

        if (lastYearError) throw lastYearError;

        const lastYearTotal = (lastYearData || []).reduce(
          (sum, d: any) => sum + (Number(d.amount) || 0),
          0
        );
        const lastYearCount = lastYearData?.length || 0;
        const averageGiftLastYear =
          lastYearCount > 0 ? lastYearTotal / lastYearCount : 0;

        setState({
          thisYearTotal,
          lastYearTotal,
          thisYearCount,
          lastYearCount,
          averageGiftThisYear,
          averageGiftLastYear,
          loading: false,
          error: null,
          currentYear: thisYear,
          lastYear
        });
      } catch (err: any) {
        console.error('Error fetching donation summary:', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load donation summary'
        }));
      }
    };

    fetchSummary();
  }, []);

  return state;
};
