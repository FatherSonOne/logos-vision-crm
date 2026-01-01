import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { pledgeService } from '../../services/pledgeService';
import type { Pledge, PledgeFrequency, PledgeStatus } from '../../types';
import { Modal } from '../Modal';
import { Button } from '../ui/Button';
import { HandHeart, Calendar, DollarSign, RefreshCw } from 'lucide-react';

interface PledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pledgeId?: string | null; // If provided, we're editing
  preselectedClientId?: string | null; // For creating from contact detail
}

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
}

export const PledgeModal: React.FC<PledgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  pledgeId,
  preselectedClientId,
}) => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    clientId: '',
    pledgeAmount: '',
    frequency: 'monthly' as PledgeFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active' as PledgeStatus,
    campaign: '',
    fund: '',
    notes: '',
    reminderEnabled: true,
    reminderDaysBefore: '7',
  });

  const isEditing = !!pledgeId;

  // Fetch clients and campaigns on open
  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchCampaigns();

      if (pledgeId) {
        fetchPledge();
      } else {
        // Reset form for new pledge
        setFormData({
          clientId: preselectedClientId || '',
          pledgeAmount: '',
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'active',
          campaign: '',
          fund: '',
          notes: '',
          reminderEnabled: true,
          reminderDaysBefore: '7',
        });
        setError(null);
      }
    }
  }, [isOpen, pledgeId, preselectedClientId]);

  const fetchClients = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setClients(data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const campaignList = await pledgeService.getCampaigns();
      setCampaigns(campaignList);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchPledge = async () => {
    if (!pledgeId) return;

    try {
      setFetchingData(true);
      setError(null);

      const pledge = await pledgeService.getById(pledgeId);

      if (!pledge) {
        setError('Pledge not found');
        return;
      }

      setFormData({
        clientId: pledge.clientId,
        pledgeAmount: pledge.pledgeAmount.toString(),
        frequency: pledge.frequency,
        startDate: pledge.startDate,
        endDate: pledge.endDate || '',
        status: pledge.status,
        campaign: pledge.campaign || '',
        fund: pledge.fund || '',
        notes: pledge.notes || '',
        reminderEnabled: pledge.reminderEnabled,
        reminderDaysBefore: pledge.reminderDaysBefore.toString(),
      });
    } catch (err: any) {
      console.error('Error fetching pledge:', err);
      setError(err.message || 'Failed to load pledge');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.clientId) {
      setError('Please select a donor');
      return;
    }

    const amount = parseFloat(formData.pledgeAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid pledge amount');
      return;
    }

    if (!formData.startDate) {
      setError('Please select a start date');
      return;
    }

    try {
      setLoading(true);

      const pledgeData = {
        clientId: formData.clientId,
        pledgeAmount: amount,
        totalPledged: amount,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        status: formData.status,
        campaign: formData.campaign || null,
        fund: formData.fund || null,
        notes: formData.notes || null,
        reminderEnabled: formData.reminderEnabled,
        reminderDaysBefore: parseInt(formData.reminderDaysBefore) || 7,
      };

      if (isEditing && pledgeId) {
        await pledgeService.update(pledgeId, pledgeData);
      } else {
        await pledgeService.create(pledgeData);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving pledge:', err);
      setError(err.message || 'Failed to save pledge');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      clientId: '',
      pledgeAmount: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      campaign: '',
      fund: '',
      notes: '',
      reminderEnabled: true,
      reminderDaysBefore: '7',
    });
    setError(null);
    onClose();
  };

  const frequencyOptions: { value: PledgeFrequency; label: string }[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
    { value: 'one-time', label: 'One-Time' },
  ];

  const statusOptions: { value: PledgeStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Pledge' : 'Create New Pledge'}
    >
      {fetchingData ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Donor Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Donor *
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              disabled={!!preselectedClientId}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:opacity-60"
            >
              <option value="">Select a donor...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.email ? `(${client.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Amount and Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Pledge Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  name="pledgeAmount"
                  value={formData.pledgeAmount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <RefreshCw className="inline w-4 h-4 mr-1" />
                Frequency *
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {frequencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Calendar className="inline w-4 h-4 mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                End Date
                <span className="text-slate-400 ml-1">(optional)</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Status (only shown when editing) */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campaign and Fund */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Campaign
              </label>
              <input
                type="text"
                name="campaign"
                value={formData.campaign}
                onChange={handleChange}
                list="campaign-list"
                placeholder="e.g., Annual Fund"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <datalist id="campaign-list">
                {campaigns.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Fund
              </label>
              <input
                type="text"
                name="fund"
                value={formData.fund}
                onChange={handleChange}
                placeholder="e.g., General Fund"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Reminder Settings */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="reminderEnabled"
                name="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={(e) => setFormData(prev => ({ ...prev, reminderEnabled: e.target.checked }))}
                className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-500"
              />
              <label htmlFor="reminderEnabled" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enable payment reminders
              </label>
            </div>
            {formData.reminderEnabled && (
              <div className="flex items-center gap-2 ml-7">
                <span className="text-sm text-slate-600 dark:text-slate-400">Remind</span>
                <input
                  type="number"
                  name="reminderDaysBefore"
                  value={formData.reminderDaysBefore}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-16 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">days before payment is due</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes about this pledge..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Pledge'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
