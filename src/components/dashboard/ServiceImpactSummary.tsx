import React, { useEffect, useState } from 'react';
import { Users, Clock, Briefcase, TrendingUp } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface ImpactStats {
  clientsServed: number;
  serviceHours: number;
  activeProjects: number;
  casesResolved: number;
}

export const ServiceImpactSummary: React.FC = () => {
  const [stats, setStats] = useState<ImpactStats>({
    clientsServed: 0,
    serviceHours: 0,
    activeProjects: 0,
    casesResolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];

      // Clients served this month (distinct clients with activities)
      const { data: activities } = await supabase
        .from('activities')
        .select('contact_id')
        .gte('created_at', firstDayStr);

      const uniqueClients = new Set(activities?.map(a => a.contact_id).filter(Boolean) || []);

      // Service hours from completed tasks this month
      const { data: tasks } = await supabase
        .from('tasks')
        .select('estimated_hours')
        .eq('status', 'Done')
        .gte('updated_at', firstDayStr);

      const totalHours = tasks?.reduce((sum, t) => sum + (t.estimated_hours || 0), 0) || 0;

      // Active projects
      const { count: activeCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Cases resolved this month
      const { count: resolvedCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'closed')
        .gte('updated_at', firstDayStr);

      setStats({
        clientsServed: uniqueClients.size,
        serviceHours: Math.round(totalHours),
        activeProjects: activeCount || 0,
        casesResolved: resolvedCount || 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching impact stats:', error);
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

  return (
    <div className="bg-green-50/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-200 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Service Impact
          </h3>
        </div>
        <span className="text-xs text-gray-600">This Month</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Clients Served */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide">Clients</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {stats.clientsServed}
          </p>
          <p className="text-xs text-gray-600">served</p>
        </div>

        {/* Service Hours */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide">Hours</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.serviceHours}
          </p>
          <p className="text-xs text-gray-600">delivered</p>
        </div>

        {/* Active Projects */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide">Projects</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.activeProjects}
          </p>
          <p className="text-xs text-gray-600">active</p>
        </div>

        {/* Cases Resolved */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-gray-600 uppercase tracking-wide">Cases</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {stats.casesResolved}
          </p>
          <p className="text-xs text-gray-600">resolved</p>
        </div>
      </div>
    </div>
  );
};
