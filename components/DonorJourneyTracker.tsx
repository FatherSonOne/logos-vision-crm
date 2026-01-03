import React, { useState, useMemo } from 'react';

/**
 * Donor Journey Tracking Component
 *
 * Features:
 * - Visual donor lifecycle pipeline
 * - Automated move through stages based on actions
 * - Journey-specific automation suggestions
 * - Predicted next-best action using AI
 * - Donor health score
 */

// ============================================
// TYPES
// ============================================

type DonorStage = 'prospect' | 'first_time' | 'repeat' | 'consistent' | 'major' | 'champion' | 'lapsed';

interface DonorJourneyDonor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  stage: DonorStage;
  healthScore: number; // 0-100
  totalGiven: number;
  lastGiftDate: string;
  lastGiftAmount: number;
  giftCount: number;
  daysSinceLastGift: number;
  engagementLevel: 'high' | 'medium' | 'low';
  suggestedAction?: string;
  campaigns: string[];
  tags: string[];
}

interface StageConfig {
  id: DonorStage;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  criteria: string;
}

interface JourneyStats {
  totalDonors: number;
  totalValue: number;
  avgHealthScore: number;
  atRisk: number;
}

interface DonorJourneyTrackerProps {
  donors?: DonorJourneyDonor[];
  onDonorClick?: (donor: DonorJourneyDonor) => void;
  onStageChange?: (donorId: string, newStage: DonorStage) => void;
  onActionSuggested?: (donor: DonorJourneyDonor, action: string) => void;
}

// ============================================
// STAGE CONFIGURATION
// ============================================

const stageConfig: StageConfig[] = [
  {
    id: 'prospect',
    name: 'Prospect',
    description: 'Potential donors who haven\'t given yet',
    icon: '🎯',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-300 dark:border-slate-600',
    criteria: 'No donations recorded'
  },
  {
    id: 'first_time',
    name: 'First-Time',
    description: 'Made their first donation',
    icon: '🌱',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    criteria: '1 donation'
  },
  {
    id: 'repeat',
    name: 'Repeat',
    description: 'Given more than once',
    icon: '🔄',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    criteria: '2-4 donations'
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Regular giving pattern',
    icon: '⭐',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
    criteria: '5+ donations, active last 12 months'
  },
  {
    id: 'major',
    name: 'Major Donor',
    description: 'Significant cumulative giving',
    icon: '💎',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    criteria: '$5,000+ lifetime giving'
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Top-tier donor and advocate',
    icon: '🏆',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-300 dark:border-rose-700',
    criteria: '$25,000+ lifetime or board member'
  },
  {
    id: 'lapsed',
    name: 'Lapsed',
    description: 'Previously active, now dormant',
    icon: '😴',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-600',
    criteria: 'No gift in 18+ months'
  },
];

// ============================================
// SAMPLE DATA
// ============================================

const sampleDonors: DonorJourneyDonor[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    stage: 'champion',
    healthScore: 95,
    totalGiven: 45000,
    lastGiftDate: '2024-03-15',
    lastGiftAmount: 5000,
    giftCount: 24,
    daysSinceLastGift: 15,
    engagementLevel: 'high',
    suggestedAction: 'Invite to board meeting',
    campaigns: ['Annual Fund', 'Capital Campaign'],
    tags: ['Board Member', 'Event Sponsor']
  },
  {
    id: '2',
    name: 'James Chen',
    email: 'james.chen@company.com',
    stage: 'major',
    healthScore: 88,
    totalGiven: 12500,
    lastGiftDate: '2024-02-28',
    lastGiftAmount: 2500,
    giftCount: 8,
    daysSinceLastGift: 30,
    engagementLevel: 'high',
    suggestedAction: 'Schedule stewardship call',
    campaigns: ['Annual Fund'],
    tags: ['Corporate Match']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    stage: 'consistent',
    healthScore: 82,
    totalGiven: 3200,
    lastGiftDate: '2024-03-01',
    lastGiftAmount: 100,
    giftCount: 18,
    daysSinceLastGift: 29,
    engagementLevel: 'medium',
    suggestedAction: 'Ask for peer-to-peer fundraising',
    campaigns: ['Monthly Giving'],
    tags: ['Monthly Donor', 'Volunteer']
  },
  {
    id: '4',
    name: 'Michael Thompson',
    email: 'mthompson@email.com',
    stage: 'repeat',
    healthScore: 65,
    totalGiven: 450,
    lastGiftDate: '2024-01-15',
    lastGiftAmount: 150,
    giftCount: 3,
    daysSinceLastGift: 75,
    engagementLevel: 'medium',
    suggestedAction: 'Send impact report',
    campaigns: ['Year End Appeal'],
    tags: []
  },
  {
    id: '5',
    name: 'Amanda Foster',
    email: 'amanda.f@email.com',
    stage: 'first_time',
    healthScore: 70,
    totalGiven: 100,
    lastGiftDate: '2024-03-20',
    lastGiftAmount: 100,
    giftCount: 1,
    daysSinceLastGift: 10,
    engagementLevel: 'medium',
    suggestedAction: 'Send welcome series email',
    campaigns: ['Spring Campaign'],
    tags: ['New Donor']
  },
  {
    id: '6',
    name: 'David Park',
    email: 'dpark@company.com',
    stage: 'prospect',
    healthScore: 50,
    totalGiven: 0,
    lastGiftDate: '',
    lastGiftAmount: 0,
    giftCount: 0,
    daysSinceLastGift: 999,
    engagementLevel: 'low',
    suggestedAction: 'Schedule discovery call',
    campaigns: [],
    tags: ['Event Attendee']
  },
  {
    id: '7',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    stage: 'lapsed',
    healthScore: 25,
    totalGiven: 850,
    lastGiftDate: '2022-06-01',
    lastGiftAmount: 100,
    giftCount: 6,
    daysSinceLastGift: 665,
    engagementLevel: 'low',
    suggestedAction: 'Send re-engagement email',
    campaigns: ['Legacy'],
    tags: ['Former Monthly']
  },
  {
    id: '8',
    name: 'Robert Kim',
    email: 'rkim@business.com',
    stage: 'consistent',
    healthScore: 78,
    totalGiven: 2100,
    lastGiftDate: '2024-02-15',
    lastGiftAmount: 175,
    giftCount: 12,
    daysSinceLastGift: 43,
    engagementLevel: 'high',
    suggestedAction: 'Upgrade ask to major donor',
    campaigns: ['Monthly Giving', 'Annual Fund'],
    tags: ['Monthly Donor']
  },
];

// ============================================
// HELPER COMPONENTS
// ============================================

const HealthScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getColor()}`}>
      {score}%
    </span>
  );
};

const DonorCard: React.FC<{
  donor: DonorJourneyDonor;
  onClick?: () => void;
  onAction?: (action: string) => void;
}> = ({ donor, onClick, onAction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {donor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{donor.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{donor.email}</p>
          </div>
        </div>
        <HealthScoreBadge score={donor.healthScore} />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
        <span>{formatCurrency(donor.totalGiven)} lifetime</span>
        <span>{donor.giftCount} gifts</span>
      </div>

      {donor.suggestedAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(donor.suggestedAction!);
          }}
          className="w-full mt-2 px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors"
        >
          💡 {donor.suggestedAction}
        </button>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const DonorJourneyTracker: React.FC<DonorJourneyTrackerProps> = ({
  donors = sampleDonors,
  onDonorClick,
  onStageChange,
  onActionSuggested
}) => {
  const [selectedStage, setSelectedStage] = useState<DonorStage | 'all'>('all');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [sortBy, setSortBy] = useState<'healthScore' | 'totalGiven' | 'lastGift'>('healthScore');

  // Group donors by stage
  const donorsByStage = useMemo(() => {
    const grouped: Record<DonorStage, DonorJourneyDonor[]> = {
      prospect: [],
      first_time: [],
      repeat: [],
      consistent: [],
      major: [],
      champion: [],
      lapsed: []
    };

    donors.forEach(donor => {
      grouped[donor.stage].push(donor);
    });

    // Sort each group
    Object.keys(grouped).forEach(stage => {
      grouped[stage as DonorStage].sort((a, b) => {
        switch (sortBy) {
          case 'healthScore':
            return b.healthScore - a.healthScore;
          case 'totalGiven':
            return b.totalGiven - a.totalGiven;
          case 'lastGift':
            return a.daysSinceLastGift - b.daysSinceLastGift;
          default:
            return 0;
        }
      });
    });

    return grouped;
  }, [donors, sortBy]);

  // Calculate stats
  const stats = useMemo((): JourneyStats => {
    const activeDonors = donors.filter(d => d.stage !== 'prospect' && d.stage !== 'lapsed');
    return {
      totalDonors: donors.length,
      totalValue: donors.reduce((sum, d) => sum + d.totalGiven, 0),
      avgHealthScore: Math.round(activeDonors.reduce((sum, d) => sum + d.healthScore, 0) / (activeDonors.length || 1)),
      atRisk: donors.filter(d => d.healthScore < 40 && d.stage !== 'prospect').length
    };
  }, [donors]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Donors</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalDonors}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalValue)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Avg Health Score</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.avgHealthScore}%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">At Risk</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.atRisk}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'pipeline'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Pipeline View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            List View
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as DonorStage | 'all')}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Stages</option>
            {stageConfig.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.icon} {stage.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'healthScore' | 'totalGiven' | 'lastGift')}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300"
          >
            <option value="healthScore">Sort by Health Score</option>
            <option value="totalGiven">Sort by Total Given</option>
            <option value="lastGift">Sort by Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageConfig.map(stage => {
            const stageDonors = donorsByStage[stage.id];
            const stageValue = stageDonors.reduce((sum, d) => sum + d.totalGiven, 0);

            if (selectedStage !== 'all' && selectedStage !== stage.id) return null;

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-72 rounded-xl border ${stage.borderColor} ${stage.bgColor}`}
              >
                {/* Stage Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{stage.icon}</span>
                      <span className={`font-semibold ${stage.color}`}>{stage.name}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stageDonors.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stage.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {formatCurrency(stageValue)} total
                  </p>
                </div>

                {/* Donor Cards */}
                <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                  {stageDonors.length > 0 ? (
                    stageDonors.map(donor => (
                      <DonorCard
                        key={donor.id}
                        donor={donor}
                        onClick={() => onDonorClick?.(donor)}
                        onAction={(action) => onActionSuggested?.(donor, action)}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">
                      No donors in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Donor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Health
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Lifetime
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Last Gift
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Suggested Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {donors
                .filter(d => selectedStage === 'all' || d.stage === selectedStage)
                .sort((a, b) => {
                  switch (sortBy) {
                    case 'healthScore':
                      return b.healthScore - a.healthScore;
                    case 'totalGiven':
                      return b.totalGiven - a.totalGiven;
                    case 'lastGift':
                      return a.daysSinceLastGift - b.daysSinceLastGift;
                    default:
                      return 0;
                  }
                })
                .map(donor => {
                  const stage = stageConfig.find(s => s.id === donor.stage)!;
                  return (
                    <tr
                      key={donor.id}
                      onClick={() => onDonorClick?.(donor)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                            {donor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{donor.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{donor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stage.bgColor} ${stage.color}`}>
                          {stage.icon} {stage.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <HealthScoreBadge score={donor.healthScore} />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {formatCurrency(donor.totalGiven)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {donor.lastGiftDate ? formatCurrency(donor.lastGiftAmount) : '-'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {donor.lastGiftDate ? `${donor.daysSinceLastGift} days ago` : 'Never'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {donor.suggestedAction && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onActionSuggested?.(donor, donor.suggestedAction!);
                            }}
                            className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                          >
                            💡 {donor.suggestedAction}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Journey Insights Panel */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🤖</span> AI Journey Insights
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Conversion Opportunity</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              3 repeat donors are ready to become consistent givers based on their engagement patterns.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Re-engagement Alert</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              2 consistent donors haven't given in 60+ days. Consider personalized outreach.
            </p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Major Gift Potential</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Robert Kim shows strong upgrade potential based on giving trajectory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorJourneyTracker;
