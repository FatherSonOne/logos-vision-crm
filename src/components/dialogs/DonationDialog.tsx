import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';

interface DonationDialogProps {
  contactId: string;
  contactName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Campaign {
  id: string;
  name: string;
}

export const DonationDialog: React.FC<DonationDialogProps> = ({
  contactId,
  contactName,
  onClose,
  onSuccess
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    donation_date: new Date().toISOString().split('T')[0],
    payment_method: 'credit_card',
    campaign_id: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get contact email for donor_email field
      const { data: contact } = await supabase
        .from('clients')
        .select('name, email')
        .eq('id', contactId)
        .single();

      // Insert donation
      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          client_id: contactId,
          donor_name: contact?.name || contactName,
          donor_email: contact?.email || '',
          amount: parseFloat(formData.amount),
          donation_date: formData.donation_date,
          payment_method: formData.payment_method,
          campaign_id: formData.campaign_id || null,
          notes: formData.notes || null
        });

      if (donationError) throw donationError;

      // Update client's lifetime giving and last gift date
      const { data: existingClient } = await supabase
        .from('clients')
        .select('total_lifetime_giving')
        .eq('id', contactId)
        .single();

      const newTotal = (existingClient?.total_lifetime_giving || 0) + parseFloat(formData.amount);

      await supabase
        .from('clients')
        .update({
          total_lifetime_giving: newTotal,
          last_gift_date: formData.donation_date
        })
        .eq('id', contactId);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error recording donation:', err);
      setError(err.message || 'Failed to record donation');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Record Donation</h2>
              <p className="text-sm text-gray-600">{contactName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-8 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Donation Date *
            </label>
            <input
              type="date"
              required
              value={formData.donation_date}
              onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Payment Method *
            </label>
            <select
              required
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="credit_card">Credit Card</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="venmo">Venmo</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Campaign (Optional)
            </label>
            <select
              value={formData.campaign_id}
              onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">No campaign</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              placeholder="Additional notes about this donation..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="success" disabled={loading} className="flex-1">
              {loading ? 'Recording...' : 'Record Donation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
