import React, { useState, useEffect } from 'react';
import { campaignService } from '../services/campaignService';
import type {
  Campaign,
  CampaignPerformance,
  CampaignSegment,
  CampaignContact,
  CampaignStats,
  CampaignType,
  CampaignStatus,
  CampaignContactStatus,
  EngagementTier,
} from '../types';
import {
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  ENGAGEMENT_TIER_CONFIG,
} from '../types';

// ============================================
// ICONS
// ============================================

const MegaphoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusColor = (status: CampaignStatus): string => {
  const colors: Record<CampaignStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status];
};

const getContactStatusColor = (status: CampaignContactStatus): string => {
  const colors: Record<CampaignContactStatus, string> = {
    pending: 'bg-gray-100 text-gray-700',
    contacted: 'bg-blue-100 text-blue-700',
    responded: 'bg-yellow-100 text-yellow-700',
    donated: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    unsubscribed: 'bg-gray-200 text-gray-600',
  };
  return colors[status];
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, color = 'indigo' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-xl`}>
        <div className={`text-${color}-600`}>{icon}</div>
      </div>
    </div>
  </div>
);

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

interface ProgressBarProps {
  current: number;
  goal: number;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, goal, showLabel = true }) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const getColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-indigo-500';
  };

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatCurrency(current)}</span>
          <span>{percentage.toFixed(0)}%</span>
          <span>{formatCurrency(goal)}</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// CREATE CAMPAIGN MODAL
// ============================================

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (campaign: Campaign) => void;
}

const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaignType: 'annual_fund' as CampaignType,
    goalAmount: 10000,
    startDate: '',
    endDate: '',
    targetTiers: ['champion', 'core', 'emerging'] as EngagementTier[],
    appealMessage: '',
    thankYouMessage: '',
    useSuggestedAsks: true,
    allowRecurring: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const campaign = await campaignService.createCampaign({
        name: formData.name,
        description: formData.description || null,
        campaignType: formData.campaignType,
        status: 'draft',
        goalAmount: formData.goalAmount,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        targetEngagementTiers: formData.targetTiers,
        minEngagementScore: null,
        maxEngagementScore: null,
        appealMessage: formData.appealMessage || null,
        thankYouMessage: formData.thankYouMessage || null,
        useSuggestedAsks: formData.useSuggestedAsks,
        allowRecurring: formData.allowRecurring,
        createdBy: null,
      });

      // Populate contacts based on selected tiers
      if (formData.targetTiers.length > 0) {
        await campaignService.populateCampaignContacts(
          campaign.id,
          formData.targetTiers
        );
      }

      onCreated(campaign);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTier = (tier: EngagementTier) => {
    setFormData((prev) => ({
      ...prev,
      targetTiers: prev.targetTiers.includes(tier)
        ? prev.targetTiers.filter((t) => t !== tier)
        : [...prev.targetTiers, tier],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Year-End Giving 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type *
              </label>
              <select
                value={formData.campaignType}
                onChange={(e) =>
                  setFormData({ ...formData, campaignType: e.target.value as CampaignType })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Amount *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.goalAmount}
                onChange={(e) =>
                  setFormData({ ...formData, goalAmount: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the campaign..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Engagement Tiers
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ENGAGEMENT_TIER_CONFIG) as EngagementTier[]).map((tier) => {
                  const config = ENGAGEMENT_TIER_CONFIG[tier];
                  const isSelected = formData.targetTiers.includes(tier);
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => toggleTier(tier)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={isSelected ? { backgroundColor: config.color } : {}}
                    >
                      {config.label} ({config.minScore}-{config.maxScore})
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select which donor tiers to include in this campaign
              </p>
            </div>

            <div className="md:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useSuggestedAsks}
                  onChange={(e) =>
                    setFormData({ ...formData, useSuggestedAsks: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Use suggested ask amounts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, allowRecurring: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Allow recurring donations</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// CAMPAIGN DETAIL VIEW
// ============================================

interface CampaignDetailProps {
  campaign: CampaignPerformance;
  onBack: () => void;
  onRefresh: () => void;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign, onBack, onRefresh }) => {
  const [segments, setSegments] = useState<CampaignSegment[]>([]);
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [campaign.id, selectedSegment]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [segmentsData, contactsData] = await Promise.all([
        campaignService.getSegments(campaign.id),
        campaignService.getContacts(campaign.id, {
          segmentId: selectedSegment || undefined,
        }),
      ]);
      setSegments(segmentsData);
      setContacts(contactsData);
    } catch (err) {
      console.error('Failed to load campaign data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    setIsUpdating(true);
    try {
      await campaignService.updateCampaignStatus(campaign.id, newStatus);
      onRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactStatusChange = async (
    contactId: string,
    newStatus: CampaignContactStatus
  ) => {
    try {
      await campaignService.updateContactStatus(contactId, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update contact status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-sm text-gray-500">
              {CAMPAIGN_TYPE_LABELS[campaign.campaignType]} &bull;{' '}
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
          {campaign.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={isUpdating}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              <PlayIcon /> Launch
            </button>
          )}
          {campaign.status === 'active' && (
            <>
              <button
                onClick={() => handleStatusChange('paused')}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium"
              >
                <PauseIcon /> Pause
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                <CheckIcon /> Complete
              </button>
            </>
          )}
          {campaign.status === 'paused' && (
            <button
              onClick={() => handleStatusChange('active')}
              disabled={isUpdating}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              <PlayIcon /> Resume
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Progress</h3>
          <span className="text-2xl font-bold text-indigo-600">
            {campaign.progressPercentage.toFixed(0)}%
          </span>
        </div>
        <ProgressBar current={campaign.raisedAmount} goal={campaign.goalAmount} />
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{campaign.totalContacts}</p>
            <p className="text-sm text-gray-500">Total Contacts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{campaign.contactedCount}</p>
            <p className="text-sm text-gray-500">Contacted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{campaign.respondedCount}</p>
            <p className="text-sm text-gray-500">Responded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{campaign.donationsCount}</p>
            <p className="text-sm text-gray-500">Donated</p>
          </div>
        </div>
      </div>

      {/* Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Segments</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : segments.length === 0 ? (
          <p className="text-gray-500 text-sm">No segments created for this campaign.</p>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => setSelectedSegment(null)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedSegment === null
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">All Segments</span>
                <span className="text-sm text-gray-500">{contacts.length} contacts</span>
              </div>
            </button>
            {segments.map((segment) => {
              const tierConfig = ENGAGEMENT_TIER_CONFIG[segment.engagementTier];
              return (
                <button
                  key={segment.id}
                  onClick={() => setSelectedSegment(segment.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedSegment === segment.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tierConfig?.color }}
                      />
                      <span className="font-medium text-gray-900">{segment.name}</span>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500">{segment.contactCount} contacts</p>
                      <p className="text-green-600">{formatCurrency(segment.totalRaised)} raised</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Contacts {selectedSegment && `(Filtered)`}
          </h3>
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshIcon />
          </button>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No contacts in this campaign.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested Ask
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact) => {
                  const tierConfig = contact.engagementTier
                    ? ENGAGEMENT_TIER_CONFIG[contact.engagementTier]
                    : null;
                  return (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{contact.clientName}</p>
                          <p className="text-sm text-gray-500">{contact.clientEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {tierConfig && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tierConfig.color }}
                          >
                            {tierConfig.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {contact.engagementScore || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {contact.suggestedAsk ? formatCurrency(contact.suggestedAsk) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getContactStatusColor(
                            contact.status
                          )}`}
                        >
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        {contact.donationAmount ? formatCurrency(contact.donationAmount) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={contact.status}
                          onChange={(e) =>
                            handleContactStatusChange(
                              contact.id,
                              e.target.value as CampaignContactStatus
                            )
                          }
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="responded">Responded</option>
                          <option value="donated">Donated</option>
                          <option value="declined">Declined</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignPerformance | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [campaignsData, statsData] = await Promise.all([
        campaignService.getAllCampaignPerformance(),
        campaignService.getStats(),
      ]);

      // Filter if needed
      const filtered = statusFilter
        ? campaignsData.filter((c) => c.status === statusFilter)
        : campaignsData;

      setCampaigns(filtered);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignCreated = (campaign: Campaign) => {
    loadData();
  };

  const handleViewCampaign = async (campaign: CampaignPerformance) => {
    setSelectedCampaign(campaign);
  };

  const handleBackFromDetail = () => {
    setSelectedCampaign(null);
    loadData();
  };

  // Show detail view if campaign is selected
  if (selectedCampaign) {
    return (
      <div className="p-6">
        <CampaignDetail
          campaign={selectedCampaign}
          onBack={handleBackFromDetail}
          onRefresh={async () => {
            const updated = await campaignService.getCampaignPerformance(selectedCampaign.id);
            if (updated) setSelectedCampaign(updated);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-500 mt-1">Create and manage targeted donor appeals</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          <PlusIcon /> New Campaign
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            icon={<MegaphoneIcon />}
            subtitle={`of ${stats.totalCampaigns} total`}
          />
          <StatCard
            title="Total Goal"
            value={formatCurrency(stats.totalGoal)}
            icon={<TargetIcon />}
            color="blue"
          />
          <StatCard
            title="Total Raised"
            value={formatCurrency(stats.totalRaised)}
            icon={<CurrencyIcon />}
            color="green"
          />
          <StatCard
            title="Total Donors"
            value={stats.totalDonors}
            icon={<UsersIcon />}
            subtitle={`${stats.averageResponseRate.toFixed(1)}% avg response`}
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Campaigns</option>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <MegaphoneIcon />
            <p className="text-gray-500 mt-2">No campaigns found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create your first campaign
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewCampaign(campaign)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {CAMPAIGN_STATUS_LABELS[campaign.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {CAMPAIGN_TYPE_LABELS[campaign.campaignType]} &bull;{' '}
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                    <div className="mt-3 w-full max-w-md">
                      <ProgressBar
                        current={campaign.raisedAmount}
                        goal={campaign.goalAmount}
                        showLabel={false}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formatCurrency(campaign.raisedAmount)} of {formatCurrency(campaign.goalAmount)}{' '}
                        ({campaign.progressPercentage.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">{campaign.totalContacts}</p>
                        <p className="text-xs text-gray-500">Contacts</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{campaign.donationsCount}</p>
                        <p className="text-xs text-gray-500">Donations</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {campaign.responseRate.toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">Response</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCampaignCreated}
      />
    </div>
  );
};

export default CampaignManagement;
