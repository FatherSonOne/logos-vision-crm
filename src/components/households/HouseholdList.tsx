import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import type { HouseholdTotals } from '../../types';
import { Button, IconButton } from '../ui/Button';
import { Input } from '../ui/Input';
import { Users, Plus, Edit2, Trash2, Search, DollarSign, Calendar } from 'lucide-react';

interface HouseholdListProps {
  onSelectHousehold: (householdId: string) => void;
  onCreateNew: () => void;
  onEdit: (householdId: string) => void;
}

export const HouseholdList: React.FC<HouseholdListProps> = ({
  onSelectHousehold,
  onCreateNew,
  onEdit,
}) => {
  const [households, setHouseholds] = useState<HouseholdTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('household_totals')
        .select('*')
        .eq('is_active', true)
        .order('household_name', { ascending: true });

      if (fetchError) throw fetchError;

      // Map database columns to TypeScript interface
      const mapped: HouseholdTotals[] = (data || []).map((row: any) => ({
        householdId: row.id || row.household_id,
        householdName: row.household_name,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        phone: row.phone,
        email: row.email,
        primaryContactId: row.primary_contact_id,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        memberCount: row.member_count || 0,
        totalDonated: parseFloat(row.total_giving) || parseFloat(row.total_donated) || 0,
        lastDonationDate: row.last_donation_date,
      }));

      setHouseholds(mapped);
    } catch (err: any) {
      console.error('Error fetching households:', err);
      setError(err.message || 'Failed to load households');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (householdId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this household? Members will be unlinked but not deleted.')) {
      return;
    }

    try {
      setDeleting(householdId);

      // Soft delete - just set is_active to false
      const { error: deleteError } = await supabase
        .from('households')
        .update({ is_active: false })
        .eq('id', householdId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setHouseholds(prev => prev.filter(h => h.householdId !== householdId));
    } catch (err: any) {
      console.error('Error deleting household:', err);
      alert(err.message || 'Failed to delete household');
    } finally {
      setDeleting(null);
    }
  };

  const filteredHouseholds = useMemo(() => {
    if (!searchQuery.trim()) return households;

    const query = searchQuery.toLowerCase();
    return households.filter(h =>
      h.householdName.toLowerCase().includes(query) ||
      h.city?.toLowerCase().includes(query) ||
      h.email?.toLowerCase().includes(query)
    );
  }, [households, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Households</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage family groups and track household giving
          </p>
        </div>
        <Button variant="primary" onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Household
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search households by name, city, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Households Grid */}
      {filteredHouseholds.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchQuery ? 'No households found' : 'No households yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first household to start grouping contacts'}
          </p>
          {!searchQuery && (
            <Button variant="primary" onClick={onCreateNew} className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Household
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHouseholds.map((household) => (
            <div
              key={household.householdId}
              onClick={() => onSelectHousehold(household.householdId)}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-600 transition-all cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {household.householdName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {household.memberCount} member{household.memberCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(household.householdId);
                    }}
                    title="Edit"
                    className="text-slate-500 hover:text-rose-600"
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={(e) => handleDelete(household.householdId, e)}
                    disabled={deleting === household.householdId}
                    title="Delete"
                    className="text-slate-500 hover:text-red-600"
                  />
                </div>
              </div>

              {/* Location */}
              {(household.city || household.state) && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {[household.city, household.state].filter(Boolean).join(', ')}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Given</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(household.totalDonated)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Last Gift</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatDate(household.lastDonationDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {households.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{households.length}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Households</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {households.reduce((sum, h) => sum + h.memberCount, 0)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(households.reduce((sum, h) => sum + h.totalDonated, 0))}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Combined Giving</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(
                households.length > 0
                  ? households.reduce((sum, h) => sum + h.totalDonated, 0) / households.length
                  : 0
              )}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg per Household</p>
          </div>
        </div>
      )}
    </div>
  );
};
