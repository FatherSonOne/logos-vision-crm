import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

interface RecordDonationDialogProps {
  contactId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Contact {
  id: string;
  name: string;
  email: string;
}

const RecordDonationDialog: React.FC<RecordDonationDialogProps> = ({
  contactId,
  onClose,
  onSuccess,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: contactId || '',
    amount: '',
    donation_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    campaign: '',
    notes: '',
  });

  // Prevent body scroll when dialog is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fetch contacts for dropdown
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const { data, error } = await supabase
          .from('pulse_contacts')
          .select('id, name, email')
          .order('name', { ascending: true });

        if (error) throw error;
        setContacts(data || []);
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.client_id) {
      setError('Please select a donor');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);

      const selectedContact = contacts.find(c => c.id === formData.client_id);

      const { error: insertError } = await supabase.from('donations').insert([
        {
          client_id: formData.client_id,
          donor_name: selectedContact?.name || '',
          donor_email: selectedContact?.email || '',
          amount: parseFloat(formData.amount),
          donation_date: formData.donation_date,
          payment_method: formData.payment_method,
          campaign: formData.campaign || null,
          notes: formData.notes || null,
        },
      ]);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err: any) {
      console.error('Error recording donation:', err);
      setError(err.message || 'Failed to record donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Record Donation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Donor Selection */}
          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
              Donor *
            </label>
            {loadingContacts ? (
              <div className="text-sm text-gray-500">Loading contacts...</div>
            ) : (
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                disabled={!!contactId}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select a donor...</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} ({contact.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            {/* Donation Date */}
            <div>
              <label htmlFor="donation_date" className="block text-sm font-medium text-gray-700 mb-1">
                Donation Date *
              </label>
              <input
                type="date"
                id="donation_date"
                name="donation_date"
                value={formData.donation_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="PayPal">PayPal</option>
                <option value="Venmo">Venmo</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Campaign */}
            <div>
              <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign (Optional)
              </label>
              <input
                type="text"
                id="campaign"
                name="campaign"
                value={formData.campaign}
                onChange={handleChange}
                placeholder="e.g., Spring Fundraiser"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional notes about this donation..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Donation'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordDonationDialog;
