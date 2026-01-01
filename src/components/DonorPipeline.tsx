import React, { useState, useEffect, useMemo } from 'react';
import type {
  DonorMove,
  DonorStage,
  DonorType,
  GivingCapacity,
  MovePriority,
  CultivationActivitySummary,
  Client,
} from '../types';
import {
  DONOR_STAGE_LABELS,
  DONOR_STAGE_COLORS,
  DONOR_TYPE_LABELS,
  GIVING_CAPACITY_LABELS,
} from '../types';
import * as movesService from '../services/movesManagementService';

interface DonorPipelineProps {
  clients: Client[];
  onViewDonor?: (clientId: string) => void;
  onCreatePlan?: (clientId: string) => void;
}

const STAGES: DonorStage[] = [
  'identification',
  'qualification',
  'cultivation',
  'solicitation',
  'stewardship',
];

export const DonorPipeline: React.FC<DonorPipelineProps> = ({
  clients,
  onViewDonor,
  onCreatePlan,
}) => {
  const [donorMoves, setDonorMoves] = useState<DonorMove[]>([]);
  const [activitySummaries, setActivitySummaries] = useState<CultivationActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<DonorStage | null>(null);
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [filterDonorType, setFilterDonorType] = useState<DonorType | 'all'>('all');
  const [filterCapacity, setFilterCapacity] = useState<GivingCapacity | 'all'>('all');
  const [draggedDonor, setDraggedDonor] = useState<DonorMove | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [moves, summaries] = await Promise.all([
        movesService.getDonorMoves(),
        movesService.getCultivationActivitySummary(),
      ]);
      setDonorMoves(moves);
      setActivitySummaries(summaries);
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group donors by stage
  const donorsByStage = useMemo(() => {
    const grouped: Record<DonorStage, DonorMove[]> = {
      identification: [],
      qualification: [],
      cultivation: [],
      solicitation: [],
      stewardship: [],
      lapsed: [],
    };

    donorMoves
      .filter(d => d.isActive)
      .filter(d => filterDonorType === 'all' || d.donorType === filterDonorType)
      .filter(d => filterCapacity === 'all' || d.givingCapacity === filterCapacity)
      .forEach(move => {
        if (grouped[move.currentStage]) {
          grouped[move.currentStage].push(move);
        }
      });

    return grouped;
  }, [donorMoves, filterDonorType, filterCapacity]);

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const total = donorMoves.filter(d => d.isActive).length;
    const totalValue = donorMoves
      .filter(d => d.isActive && d.targetGiftAmount)
      .reduce((sum, d) => sum + (d.targetGiftAmount || 0), 0);

    return {
      total,
      totalValue,
      byStage: STAGES.map(stage => ({
        stage,
        count: donorsByStage[stage].length,
        value: donorsByStage[stage].reduce((sum, d) => sum + (d.targetGiftAmount || 0), 0),
      })),
    };
  }, [donorMoves, donorsByStage]);

  // Get client info
  const getClientInfo = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  // Get activity summary for a client
  const getActivitySummary = (clientId: string) => {
    return activitySummaries.find(s => s.clientId === clientId);
  };

  // Handle drag & drop
  const handleDragStart = (e: React.DragEvent, donor: DonorMove) => {
    setDraggedDonor(donor);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: DonorStage) => {
    e.preventDefault();
    if (!draggedDonor || draggedDonor.currentStage === targetStage) {
      setDraggedDonor(null);
      return;
    }

    try {
      await movesService.advanceDonorStage(draggedDonor.id, targetStage);
      await loadData();
    } catch (error) {
      console.error('Failed to move donor:', error);
    }
    setDraggedDonor(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: MovePriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Donor Pipeline</h1>
          <p className="text-gray-400 mt-1">
            Track and manage donor relationships through cultivation stages
          </p>
        </div>
        <button
          onClick={() => setShowAddDonorModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add to Pipeline
        </button>
      </div>

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Total in Pipeline</div>
          <div className="text-2xl font-bold text-white mt-1">{pipelineMetrics.total}</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Pipeline Value</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {formatCurrency(pipelineMetrics.totalValue)}
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">In Solicitation</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {donorsByStage.solicitation.length}
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Stewardship</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            {donorsByStage.stewardship.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterDonorType}
          onChange={(e) => setFilterDonorType(e.target.value as DonorType | 'all')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Donor Types</option>
          {Object.entries(DONOR_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filterCapacity}
          onChange={(e) => setFilterCapacity(e.target.value as GivingCapacity | 'all')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Capacities</option>
          {Object.entries(GIVING_CAPACITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="min-w-[280px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Stage Header */}
            <div
              className="rounded-t-xl px-4 py-3 border-b-2"
              style={{
                backgroundColor: `${DONOR_STAGE_COLORS[stage]}20`,
                borderColor: DONOR_STAGE_COLORS[stage],
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{DONOR_STAGE_LABELS[stage]}</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${DONOR_STAGE_COLORS[stage]}30`,
                    color: DONOR_STAGE_COLORS[stage],
                  }}
                >
                  {donorsByStage[stage].length}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {formatCurrency(
                  donorsByStage[stage].reduce((sum, d) => sum + (d.targetGiftAmount || 0), 0)
                )}
              </div>
            </div>

            {/* Stage Content */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-b-xl border border-gray-700/50 border-t-0 p-2 min-h-[400px] space-y-2">
              {donorsByStage[stage].map((donor) => {
                const client = getClientInfo(donor.clientId);
                const activity = getActivitySummary(donor.clientId);

                return (
                  <div
                    key={donor.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, donor)}
                    className="bg-gray-900/80 rounded-lg p-3 cursor-move hover:bg-gray-800/80 transition-colors border border-gray-700/50 hover:border-gray-600"
                  >
                    {/* Donor Name & Type */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-white">
                          {client?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {DONOR_TYPE_LABELS[donor.donorType]}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(donor.priority)}`}>
                        {donor.priority}
                      </span>
                    </div>

                    {/* Target Amount */}
                    {donor.targetGiftAmount && (
                      <div className="text-cyan-400 font-semibold mb-2">
                        {formatCurrency(donor.targetGiftAmount)}
                      </div>
                    )}

                    {/* Capacity & Affinity */}
                    <div className="flex gap-2 mb-2">
                      {donor.givingCapacity && (
                        <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300">
                          {GIVING_CAPACITY_LABELS[donor.givingCapacity]}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                        {donor.affinityScore}% affinity
                      </span>
                    </div>

                    {/* Activity Summary */}
                    {activity && (
                      <div className="text-xs text-gray-400 flex gap-3 mb-2">
                        <span>{activity.totalTouchpoints} touchpoints</span>
                        <span>{activity.pendingTasks} tasks</span>
                      </div>
                    )}

                    {/* Target Date */}
                    {donor.targetGiftDate && (
                      <div className="text-xs text-gray-500">
                        Target: {new Date(donor.targetGiftDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-700/50">
                      <button
                        onClick={() => onViewDonor?.(donor.clientId)}
                        className="flex-1 px-2 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onCreatePlan?.(donor.clientId)}
                        className="flex-1 px-2 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                      >
                        Plan
                      </button>
                    </div>
                  </div>
                );
              })}

              {donorsByStage[stage].length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No donors in this stage</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lapsed Donors Section */}
      {donorsByStage.lapsed.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Lapsed Donors ({donorsByStage.lapsed.length})
          </h3>
          <div className="bg-red-500/10 rounded-xl border border-red-500/30 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {donorsByStage.lapsed.map((donor) => {
                const client = getClientInfo(donor.clientId);
                return (
                  <div
                    key={donor.id}
                    className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50"
                  >
                    <div className="font-medium text-white">{client?.name || 'Unknown'}</div>
                    <div className="text-sm text-red-400 mt-1">
                      Lapsed since {new Date(donor.stageEnteredAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => onViewDonor?.(donor.clientId)}
                      className="mt-2 w-full px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                    >
                      Re-engage
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Donor Modal */}
      {showAddDonorModal && (
        <AddDonorToPipelineModal
          clients={clients}
          existingDonorClientIds={donorMoves.map(d => d.clientId)}
          onClose={() => setShowAddDonorModal(false)}
          onAdd={async (data) => {
            try {
              await movesService.createDonorMove(data);
              await loadData();
              setShowAddDonorModal(false);
            } catch (error) {
              console.error('Failed to add donor to pipeline:', error);
            }
          }}
        />
      )}
    </div>
  );
};

// Add Donor Modal Component
interface AddDonorToPipelineModalProps {
  clients: Client[];
  existingDonorClientIds: string[];
  onClose: () => void;
  onAdd: (data: Omit<DonorMove, 'id' | 'createdAt' | 'updatedAt' | 'stageEnteredAt'>) => void;
}

const AddDonorToPipelineModal: React.FC<AddDonorToPipelineModalProps> = ({
  clients,
  existingDonorClientIds,
  onClose,
  onAdd,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [donorType, setDonorType] = useState<DonorType>('prospect');
  const [givingCapacity, setGivingCapacity] = useState<GivingCapacity>('medium');
  const [priority, setPriority] = useState<MovePriority>('medium');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [affinityScore, setAffinityScore] = useState(50);

  const availableClients = clients.filter(c => !existingDonorClientIds.includes(c.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    onAdd({
      clientId: selectedClientId,
      currentStage: 'identification',
      previousStage: null,
      donorType,
      givingCapacity,
      affinityScore,
      assignedTo: null,
      targetGiftAmount: targetAmount ? parseFloat(targetAmount) : null,
      targetGiftDate: targetDate || null,
      targetGiftType: 'one-time',
      isActive: true,
      priority,
      notes: null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Donor to Pipeline</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Select Contact
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="">Choose a contact...</option>
              {availableClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          {/* Donor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Donor Type
            </label>
            <select
              value={donorType}
              onChange={(e) => setDonorType(e.target.value as DonorType)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(DONOR_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Giving Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Giving Capacity
            </label>
            <select
              value={givingCapacity}
              onChange={(e) => setGivingCapacity(e.target.value as GivingCapacity)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(GIVING_CAPACITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Affinity Score */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Affinity Score: {affinityScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={affinityScore}
              onChange={(e) => setAffinityScore(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Target Gift Amount
            </label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Enter target amount"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as MovePriority)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedClientId}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Add to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorPipeline;
