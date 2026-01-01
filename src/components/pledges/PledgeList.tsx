import React, { useState, useEffect, useMemo } from 'react';
import { pledgeService } from '../../services/pledgeService';
import type { PledgeSummary, PledgeStatus } from '../../types';
import { Button, IconButton } from '../ui/Button';
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  TrendingUp,
  Edit2,
  Trash2,
  RefreshCw,
  Pause,
  Play,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface PledgeListProps {
  onSelectPledge: (pledgeId: string) => void;
  onCreateNew: () => void;
  onEdit: (pledgeId: string) => void;
}

export const PledgeList: React.FC<PledgeListProps> = ({
  onSelectPledge,
  onCreateNew,
  onEdit,
}) => {
  const [pledges, setPledges] = useState<PledgeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PledgeStatus | 'all'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchPledges();
  }, []);

  const fetchPledges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pledgeService.getAll();
      setPledges(data);
    } catch (err: any) {
      console.error('Error fetching pledges:', err);
      setError(err.message || 'Failed to load pledges');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pledgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this pledge? This cannot be undone.')) {
      return;
    }

    try {
      setDeleting(pledgeId);
      await pledgeService.delete(pledgeId);
      setPledges(prev => prev.filter(p => p.id !== pledgeId));
    } catch (err: any) {
      console.error('Error deleting pledge:', err);
      alert(err.message || 'Failed to delete pledge');
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (pledgeId: string, newStatus: PledgeStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await pledgeService.update(pledgeId, { status: newStatus });
      setPledges(prev =>
        prev.map(p => (p.id === pledgeId ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      console.error('Error updating pledge status:', err);
      alert(err.message || 'Failed to update pledge');
    }
  };

  const filteredPledges = useMemo(() => {
    let result = pledges;

    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.clientName.toLowerCase().includes(query) ||
          p.campaign?.toLowerCase().includes(query) ||
          p.fund?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [pledges, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = pledges.filter(p => p.status === 'active');
    const totalPledged = pledges.reduce((sum, p) => sum + p.totalPledged, 0);
    const totalFulfilled = pledges.reduce((sum, p) => sum + p.totalFulfilled, 0);
    return {
      totalCount: pledges.length,
      activeCount: active.length,
      totalPledged,
      totalFulfilled,
      fulfillmentRate: totalPledged > 0 ? (totalFulfilled / totalPledged) * 100 : 0,
    };
  }, [pledges]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: PledgeStatus) => {
    const styles: Record<PledgeStatus, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
      'one-time': 'One-time',
    };
    return labels[frequency] || frequency;
  };

  const getFulfillmentColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pledges</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage recurring donations and pledge commitments
          </p>
        </div>
        <Button variant="primary" onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Pledge
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalPledged)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Pledged</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalFulfilled)}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fulfilled</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.fulfillmentRate.toFixed(1)}%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Fulfillment Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Pledges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by donor, campaign, or fund..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PledgeStatus | 'all')}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pledges Table */}
      {filteredPledges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No pledges found' : 'No pledges yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first pledge to start tracking recurring donations'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button variant="primary" onClick={onCreateNew} className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Pledge
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Next Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredPledges.map((pledge) => (
                <tr
                  key={pledge.id}
                  onClick={() => onSelectPledge(pledge.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{pledge.clientName}</p>
                      {pledge.campaign && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">{pledge.campaign}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(pledge.pledgeAmount)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getFrequencyLabel(pledge.frequency)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">
                          {formatCurrency(pledge.totalFulfilled)}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {pledge.fulfillmentPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getFulfillmentColor(pledge.fulfillmentPercentage)} transition-all`}
                          style={{ width: `${Math.min(pledge.fulfillmentPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 dark:text-white">
                        {formatDate(pledge.nextPaymentDue)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(pledge.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {pledge.status === 'active' && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={<Pause className="w-4 h-4" />}
                          onClick={(e) => handleStatusChange(pledge.id, 'paused', e)}
                          title="Pause"
                          className="text-slate-500 hover:text-yellow-600"
                        />
                      )}
                      {pledge.status === 'paused' && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          icon={<Play className="w-4 h-4" />}
                          onClick={(e) => handleStatusChange(pledge.id, 'active', e)}
                          title="Resume"
                          className="text-slate-500 hover:text-green-600"
                        />
                      )}
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(pledge.id);
                        }}
                        title="Edit"
                        className="text-slate-500 hover:text-emerald-600"
                      />
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={(e) => handleDelete(pledge.id, e)}
                        disabled={deleting === pledge.id}
                        title="Delete"
                        className="text-slate-500 hover:text-red-600"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
