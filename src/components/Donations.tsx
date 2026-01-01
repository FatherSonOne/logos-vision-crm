import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Search, Plus, Download, DollarSign, Calendar, CreditCard, Tag } from 'lucide-react';
import RecordDonationDialog from './RecordDonationDialog';
import DonationDetailModal from './DonationDetailModal';

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

export const Donations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog state
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [selectedContactForDonation, setSelectedContactForDonation] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Debug: Log when selectedDonation changes
  useEffect(() => {
    console.log('selectedDonation changed:', selectedDonation);
  }, [selectedDonation]);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

  // Fetch donations
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('donations')
        .select('*')
        .order('donation_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setDonations(data || []);
    } catch (error: any) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredDonations = donations.filter((donation) => {
    const donorName = (donation.donor_name || '').toLowerCase();
    const donorEmail = (donation.donor_email || '').toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      donorName.includes(searchTerm.toLowerCase()) ||
      donorEmail.includes(searchTerm.toLowerCase());

    const matchesDateRange =
      (!startDate || donation.donation_date >= startDate) &&
      (!endDate || donation.donation_date <= endDate);

    const matchesAmountRange =
      (!minAmount || donation.amount >= parseFloat(minAmount)) &&
      (!maxAmount || donation.amount <= parseFloat(maxAmount));

    const matchesCampaign =
      selectedCampaign === 'all' || donation.campaign === selectedCampaign;

    const matchesPaymentMethod =
      selectedPaymentMethod === 'all' ||
      donation.payment_method === selectedPaymentMethod;

    return (
      matchesSearch &&
      matchesDateRange &&
      matchesAmountRange &&
      matchesCampaign &&
      matchesPaymentMethod
    );
  });

  // Get unique campaigns and payment methods
  const campaigns = Array.from(
    new Set(donations.map((d) => d.campaign).filter(Boolean))
  );
  const paymentMethods = Array.from(
    new Set(donations.map((d) => d.payment_method).filter(Boolean))
  );

  // Calculate totals
  const totalAmount = filteredDonations.reduce(
    (sum, d) => sum + d.amount,
    0
  );
  const averageAmount =
    filteredDonations.length > 0
      ? totalAmount / filteredDonations.length
      : 0;

  // Export CSV
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Donor Name', 'Email', 'Amount', 'Payment Method', 'Campaign', 'Notes'],
      ...filteredDonations.map((d) => [
        d.donation_date,
        d.donor_name || '',
        d.donor_email || '',
        d.amount,
        d.payment_method,
        d.campaign || '',
        d.notes || ''
      ])
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
              <p className="text-gray-600 mt-1">
                Track and manage all donations
              </p>
            </div>
            <button
              onClick={() => setShowDonationDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Record Donation
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by donor name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <DollarSign size={14} className="inline mr-1" />
                Min Amount
              </label>
              <input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <DollarSign size={14} className="inline mr-1" />
                Max Amount
              </label>
              <input
                type="number"
                placeholder="Any"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Tag size={14} className="inline mr-1" />
                Campaign
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign} value={campaign}>
                    {campaign}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <CreditCard size={14} className="inline mr-1" />
                Payment Method
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(startDate || endDate || minAmount || maxAmount || selectedCampaign !== 'all' || selectedPaymentMethod !== 'all') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setMinAmount('');
                setMaxAmount('');
                setSelectedCampaign('all');
                setSelectedPaymentMethod('all');
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Donations</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredDonations.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Average Gift</p>
            <p className="text-2xl font-bold text-gray-900">
              ${averageAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredDonations.length} of {donations.length} donations
            </p>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading donations...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No donations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <tr
                      key={donation.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        console.log('Clicked donation:', donation);
                        setSelectedDonation(donation);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.donation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.donor_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.donor_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${donation.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {donation.payment_method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {donation.campaign || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {donation.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Record Donation Dialog */}
        {showDonationDialog && (
          <RecordDonationDialog
            contactId={selectedContactForDonation}
            onClose={() => {
              setShowDonationDialog(false);
              setSelectedContactForDonation(null);
            }}
            onSuccess={() => {
              fetchDonations(); // Refresh the table
              setShowDonationDialog(false);
              setSelectedContactForDonation(null);
            }}
          />
        )}

        {/* Donation Detail Modal */}
        {selectedDonation && (
          <DonationDetailModal
            donationId={selectedDonation.id}
            onClose={() => setSelectedDonation(null)}
            onUpdate={() => {
              fetchDonations();
              setSelectedDonation(null);
            }}
            onDelete={() => {
              fetchDonations();
              setSelectedDonation(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
