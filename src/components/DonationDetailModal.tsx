import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { X, Edit2, Save, Trash2 } from 'lucide-react';
import { Button, IconButton } from './ui/Button';

interface DonationDetailModalProps {
  donationId: string;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

interface Donation {
  id: string;
  client_id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  donation_date: string;
  payment_method: string;
  campaign: string | null;
  notes: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
}

const DonationDetailModal: React.FC<DonationDetailModalProps> = ({
  donationId,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    amount: '',
    donation_date: '',
    payment_method: '',
    campaign: '',
    notes: '',
  });

  // Fetch donation and contacts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch donation
        const { data: donationData, error: donationError } = await supabase
          .from('donations')
          .select('*')
          .eq('id', donationId)
          .single();

        if (donationError) throw donationError;
        setDonation(donationData);

        // Fetch contacts for dropdown
        const { data: contactsData, error: contactsError } = await supabase
          .from('pulse_contacts')
          .select('id, name, email')
          .order('name', { ascending: true });

        if (contactsError) throw contactsError;
        setContacts(contactsData || []);

        // Set form data
        setFormData({
          client_id: donationData.client_id,
          amount: donationData.amount.toString(),
          donation_date: donationData.donation_date,
          payment_method: donationData.payment_method,
          campaign: donationData.campaign || '',
          notes: donationData.notes || '',
        });
      } catch (err: any) {
        console.error('Error fetching donation:', err);
        setError(err.message || 'Failed to load donation');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [donationId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
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
      setSaving(true);

      const selectedContact = contacts.find((c) => c.id === formData.client_id);

      const { error: updateError } = await supabase
        .from('donations')
        .update({
          client_id: formData.client_id,
          donor_name: selectedContact?.name || '',
          donor_email: selectedContact?.email || '',
          amount: parseFloat(formData.amount),
          donation_date: formData.donation_date,
          payment_method: formData.payment_method,
          campaign: formData.campaign || null,
          notes: formData.notes || null,
        })
        .eq('id', donationId);

      if (updateError) throw updateError;

      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      console.error('Error updating donation:', err);
      setError(err.message || 'Failed to update donation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this donation? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);

      const { error: deleteError } = await supabase
        .from('donations')
        .delete()
        .eq('id', donationId);

      if (deleteError) throw deleteError;

      onDelete();
      onClose();
    } catch (err: any) {
      console.error('Error deleting donation:', err);
      setError(err.message || 'Failed to delete donation');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-8" onClick={(e) => e.stopPropagation()}>
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading donation...</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-8" onClick={(e) => e.stopPropagation()}>
          <p className="text-red-600">Failed to load donation</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Donation Details</h2>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <IconButton
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit2 size={20} />}
                title="Edit"
                className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              />
            )}
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              icon={<Trash2 size={20} />}
              title="Delete"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            />
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X size={24} />}
              aria-label="Close"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              {/* Donor Selection */}
              <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Donor *
                </label>
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select a donor...</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} ({contact.email})
                    </option>
                  ))}
                </select>
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
            </div>
          ) : (
            // View Mode
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Donor Name</p>
                  <p className="text-base text-gray-900">{donation.donor_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Donor Email</p>
                  <p className="text-base text-gray-900">{donation.donor_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${donation.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Donation Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(donation.donation_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-base text-gray-900">{donation.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Campaign</p>
                  <p className="text-base text-gray-900">{donation.campaign || '-'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="text-base text-gray-900">{donation.notes || '-'}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500">Record Created</p>
                <p className="text-base text-gray-900">
                  {new Date(donation.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  // Reset form data
                  setFormData({
                    client_id: donation.client_id,
                    amount: donation.amount.toString(),
                    donation_date: donation.donation_date,
                    payment_method: donation.payment_method,
                    campaign: donation.campaign || '',
                    notes: donation.notes || '',
                  });
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetailModal;
