import React, { useState, useEffect } from 'react';
import { pledgeService } from '../../services/pledgeService';
import type { PledgeSummary, PledgePayment } from '../../types';
import { Button, IconButton } from '../ui/Button';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  RefreshCw,
  User,
  Mail,
  Bell,
  BellOff,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  CreditCard,
} from 'lucide-react';

interface PledgeDetailProps {
  pledgeId: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PledgeDetail: React.FC<PledgeDetailProps> = ({
  pledgeId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [pledge, setPledge] = useState<PledgeSummary | null>(null);
  const [payments, setPayments] = useState<PledgePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPledgeData();
  }, [pledgeId]);

  const fetchPledgeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pledgeData, paymentsData] = await Promise.all([
        pledgeService.getById(pledgeId),
        pledgeService.getPayments(pledgeId),
      ]);

      if (!pledgeData) {
        setError('Pledge not found');
        return;
      }

      setPledge(pledgeData);
      setPayments(paymentsData);
    } catch (err: any) {
      console.error('Error fetching pledge:', err);
      setError(err.message || 'Failed to load pledge');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'completed' | 'cancelled') => {
    if (!pledge) return;

    try {
      setActionLoading(true);
      await pledgeService.update(pledgeId, { status: newStatus });
      await fetchPledgeData();
    } catch (err: any) {
      console.error('Error updating status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleReminders = async () => {
    if (!pledge) return;

    try {
      setActionLoading(true);
      await pledgeService.update(pledgeId, { reminderEnabled: !pledge.reminderEnabled });
      await fetchPledgeData();
    } catch (err: any) {
      console.error('Error toggling reminders:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'annually': 'Annually',
      'one-time': 'One-Time',
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      paused: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      completed: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
      cancelled: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.active}`}>
        {status === 'active' && <Play className="w-3 h-3" />}
        {status === 'paused' && <Pause className="w-3 h-3" />}
        {status === 'completed' && <CheckCircle className="w-3 h-3" />}
        {status === 'cancelled' && <XCircle className="w-3 h-3" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (error || !pledge) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pledges
        </Button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error || 'Pledge not found'}
        </div>
      </div>
    );
  }

  const fulfillmentPercentage = pledge.fulfillmentPercentage;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pledge.clientName}'s Pledge
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {getFrequencyLabel(pledge.frequency)} • Started {formatDate(pledge.startDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(pledge.status)}
          <Button variant="outline" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              Fulfillment Progress
            </h3>

            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(pledge.totalFulfilled)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    of {formatCurrency(pledge.totalPledged)} pledged
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {fulfillmentPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">fulfilled</p>
                </div>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-500 ${
                    fulfillmentPercentage >= 100
                      ? 'bg-emerald-500'
                      : fulfillmentPercentage >= 75
                      ? 'bg-sky-500'
                      : fulfillmentPercentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(fulfillmentPercentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{pledge.paymentCount} payments made</span>
                <span>{formatCurrency(pledge.remainingAmount)} remaining</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              Payment History
            </h3>

            {payments.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No payments recorded yet</p>
                <p className="text-sm mt-1">Payments will appear here when donations are linked to this pledge</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info & Actions */}
        <div className="space-y-6">
          {/* Donor Info */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-500" />
              Donor Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-slate-400" />
                <span>{pledge.clientName}</span>
              </div>
              {pledge.clientEmail && (
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${pledge.clientEmail}`} className="hover:text-rose-500">
                    {pledge.clientEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Pledge Details */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-500" />
              Pledge Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Amount</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(pledge.pledgeAmount)} / {getFrequencyLabel(pledge.frequency).toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Start Date</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatDate(pledge.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">End Date</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {pledge.endDate ? formatDate(pledge.endDate) : 'Ongoing'}
                </span>
              </div>
              {pledge.nextPaymentDue && pledge.status === 'active' && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Next Due</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {formatDate(pledge.nextPaymentDue)}
                  </span>
                </div>
              )}
              {pledge.campaign && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Campaign</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {pledge.campaign}
                  </span>
                </div>
              )}
              {pledge.fund && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Fund</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {pledge.fund}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {pledge.status === 'active' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('paused')}
                  disabled={actionLoading}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Pledge
                </Button>
              )}
              {pledge.status === 'paused' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('active')}
                  disabled={actionLoading}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Pledge
                </Button>
              )}
              {(pledge.status === 'active' || pledge.status === 'paused') && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStatusChange('completed')}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-rose-600 hover:text-rose-700"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Pledge
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleReminders}
                disabled={actionLoading}
              >
                {pledge.reminderEnabled ? (
                  <>
                    <BellOff className="w-4 h-4 mr-2" />
                    Disable Reminders
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Reminders
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Notes */}
          {pledge.notes && (
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Notes
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {pledge.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
