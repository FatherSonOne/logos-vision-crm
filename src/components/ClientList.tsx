import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Users, Home, Award, AlertCircle, Plus, Mail, Phone, Calendar, DollarSign, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Badge, DonorStageBadge, EngagementBadge } from './ui/Badge';
import type { DonorStage, EngagementLevel } from './ui/Badge';
import { ActivityDialog } from './ActivityDialog';
import RecordDonationDialog from './RecordDonationDialog';
import type { Activity, Client as ClientType, Project } from '../types';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  household_id: string | null;
  household?: {
    household_name: string;
  };
  total_lifetime_giving: number;
  last_gift_date: string | null;
  donor_stage: string;
  engagement_score: string;
  created_at: string;
}

interface FilterState {
  search: string;
  engagement: string[];
  donorStage: string[];
  hasHousehold: boolean | null;
}

export const ClientList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; client: Client } | null>(null);

  // Dialog states
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [selectedClientForAction, setSelectedClientForAction] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    engagement: [],
    donorStage: [],
    hasHousehold: null
  });

  useEffect(() => {
    fetchClients();
    fetchProjects();

    // Close context menu on click outside
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      if (!error && data) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          household:households(household_name)
        `)
        .order('name');

      if (error) throw error;
      setClients(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setLoading(false);
    }
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.organization?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Engagement filter
      if (filters.engagement.length > 0) {
        if (!filters.engagement.includes(client.engagement_score)) return false;
      }

      // Donor stage filter
      if (filters.donorStage.length > 0) {
        if (!filters.donorStage.includes(client.donor_stage || 'Prospect')) return false;
      }

      // Household filter
      if (filters.hasHousehold !== null) {
        const hasHousehold = !!client.household_id;
        if (hasHousehold !== filters.hasHousehold) return false;
      }

      return true;
    });
  }, [clients, filters]);

  // Use design system badge components
  const getEngagementBadge = (score: string) => {
    const level = (score?.toLowerCase() || 'low') as EngagementLevel;
    return <EngagementBadge level={level} size="sm" />;
  };

  const getDonorStageBadge = (stage: string) => {
    const validStage = (stage || 'Prospect') as DonorStage;
    return <DonorStageBadge stage={validStage} size="sm" />;
  };

  const handleContextMenu = (e: React.MouseEvent, client: Client) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, client });
  };

  const handleQuickAction = (action: string, client: Client) => {
    console.log(`Quick action: ${action} for ${client.name}`);
    setContextMenu(null);
    setSelectedClientForAction(client);

    switch (action) {
      case 'log-interaction':
        setActivityDialogOpen(true);
        break;
      case 'record-donation':
        setDonationDialogOpen(true);
        break;
      case 'send-email':
        // Open default email client with mailto link
        if (client.email) {
          window.location.href = `mailto:${client.email}`;
        } else {
          alert('No email address available for this contact.');
        }
        break;
      case 'schedule-task':
        // Open activity dialog with Meeting type pre-selected
        setActivityDialogOpen(true);
        break;
    }
  };

  const handleActivitySave = async (activity: Omit<Activity, 'createdById'> & { id?: string }) => {
    try {
      const { error } = await supabase
        .from('activities')
        .insert({
          type: activity.type,
          title: activity.title,
          client_id: selectedClientForAction?.id || activity.clientId,
          project_id: activity.projectId,
          activity_date: activity.activityDate,
          activity_time: activity.activityTime,
          status: activity.status,
          notes: activity.notes,
          shared_with_client: activity.sharedWithClient,
        });

      if (error) throw error;

      setActivityDialogOpen(false);
      setSelectedClientForAction(null);
      // Refresh data could be added here if needed
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity. Please try again.');
    }
  };

  const handleDonationSuccess = () => {
    setDonationDialogOpen(false);
    setSelectedClientForAction(null);
    fetchClients(); // Refresh to show updated donation data
  };

  const toggleFilter = (type: 'engagement' | 'donorStage', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      engagement: [],
      donorStage: [],
      hasHousehold: null
    });
  };

  const activeFilterCount =
    filters.engagement.length +
    filters.donorStage.length +
    (filters.hasHousehold !== null ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredClients.length} of {clients.length} contacts
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
            {/* Engagement Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Engagement</p>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map(level => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.engagement.includes(level)}
                      onChange={() => toggleFilter('engagement', level)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Donor Stage Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Donor Stage</p>
              <div className="space-y-2">
                {['Prospect', 'First-time Donor', 'Repeat Donor', 'Major Donor', 'Lapsed'].map(stage => (
                  <label key={stage} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.donorStage.includes(stage)}
                      onChange={() => toggleFilter('donorStage', stage)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Household Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Household</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.hasHousehold === true}
                    onChange={() => setFilters(prev => ({ ...prev, hasHousehold: true }))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">In household</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.hasHousehold === false}
                    onChange={() => setFilters(prev => ({ ...prev, hasHousehold: false }))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Individual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={filters.hasHousehold === null}
                    onChange={() => setFilters(prev => ({ ...prev, hasHousehold: null }))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">All</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Client Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Donor Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Lifetime Giving
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Gift
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map(client => (
              <tr
                key={client.id}
                onContextMenu={(e) => handleContextMenu(e, client)}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {client.household_id && (
                      <Home className="w-4 h-4 text-blue-600" title={`Household: ${(client.household as any)?.household_name}`} />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{client.name}</div>
                      {client.organization && (
                        <div className="text-sm text-gray-500">{client.organization}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.email || '—'}</div>
                  <div className="text-sm text-gray-500">{client.phone || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getEngagementBadge(client.engagement_score)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getDonorStageBadge(client.donor_stage)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ${client.total_lifetime_giving?.toLocaleString() || '0'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.last_gift_date
                    ? new Date(client.last_gift_date).toLocaleDateString()
                    : '—'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No contacts found</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700 underline text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => handleQuickAction('log-interaction', contextMenu.client)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Log Interaction
          </button>
          <button
            onClick={() => handleQuickAction('record-donation', contextMenu.client)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Record Donation
          </button>
          <button
            onClick={() => handleQuickAction('send-email', contextMenu.client)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Email
          </button>
          <button
            onClick={() => handleQuickAction('schedule-task', contextMenu.client)}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Schedule Follow-up
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={() => {
              console.log('View profile:', contextMenu.client.id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-blue-600"
          >
            <Users className="w-4 h-4" />
            View Full Profile
          </button>
        </div>
      )}

      {/* Activity Dialog */}
      <ActivityDialog
        isOpen={activityDialogOpen}
        onClose={() => {
          setActivityDialogOpen(false);
          setSelectedClientForAction(null);
        }}
        onSave={handleActivitySave}
        clients={clients.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          organization: c.organization,
          notes: '',
        })) as ClientType[]}
        projects={projects}
      />

      {/* Record Donation Dialog */}
      {donationDialogOpen && (
        <RecordDonationDialog
          contactId={selectedClientForAction?.id || null}
          onClose={() => {
            setDonationDialogOpen(false);
            setSelectedClientForAction(null);
          }}
          onSuccess={handleDonationSuccess}
        />
      )}
    </div>
  );
};
