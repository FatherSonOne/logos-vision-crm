import React, { useState, useEffect } from 'react';
import type {
  CultivationPlan,
  CultivationTask,
  CultivationPlanStatus,
  CultivationGoalType,
  CultivationTaskType,
  CultivationTaskStatus,
  MovePriority,
  DonorMove,
  Client,
  Touchpoint,
} from '../types';
import {
  CULTIVATION_TASK_TYPE_LABELS,
  DONOR_STAGE_LABELS,
  DONOR_STAGE_COLORS,
} from '../types';
import * as movesService from '../services/movesManagementService';

interface CultivationPlanBuilderProps {
  clients: Client[];
  selectedClientId?: string;
  onClose?: () => void;
}

export const CultivationPlanBuilder: React.FC<CultivationPlanBuilderProps> = ({
  clients,
  selectedClientId,
  onClose,
}) => {
  const [plans, setPlans] = useState<CultivationPlan[]>([]);
  const [donorMoves, setDonorMoves] = useState<DonorMove[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CultivationPlan | null>(null);
  const [tasks, setTasks] = useState<CultivationTask[]>([]);
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CultivationPlanStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, movesData] = await Promise.all([
        movesService.getCultivationPlans(),
        movesService.getDonorMoves(),
      ]);
      setPlans(plansData);
      setDonorMoves(movesData);

      // If a specific client is selected, filter to their plans
      if (selectedClientId) {
        const clientPlans = plansData.filter(p => p.clientId === selectedClientId);
        if (clientPlans.length > 0) {
          setSelectedPlan(clientPlans[0]);
          await loadPlanDetails(clientPlans[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load cultivation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDetails = async (planId: string) => {
    try {
      const [tasksData, plan] = await Promise.all([
        movesService.getCultivationTasksByPlanId(planId),
        movesService.getCultivationPlanById(planId),
      ]);
      setTasks(tasksData);
      if (plan) {
        const touchpointsData = await movesService.getTouchpointsByClientId(plan.clientId);
        setTouchpoints(touchpointsData.filter(t => t.cultivationPlanId === planId));
      }
    } catch (error) {
      console.error('Failed to load plan details:', error);
    }
  };

  const handleSelectPlan = async (plan: CultivationPlan) => {
    setSelectedPlan(plan);
    await loadPlanDetails(plan.id);
  };

  const handleCreatePlan = async (data: Omit<CultivationPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPlan = await movesService.createCultivationPlan(data);
      setPlans([newPlan, ...plans]);
      setSelectedPlan(newPlan);
      setTasks([]);
      setShowNewPlanModal(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleCreateTask = async (data: Omit<CultivationTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await movesService.createCultivationTask(data);
      setTasks([...tasks, newTask]);
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const updatedTask = await movesService.completeCultivationTask(taskId);
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleUpdatePlanStatus = async (status: CultivationPlanStatus) => {
    if (!selectedPlan) return;
    try {
      const updated = await movesService.updateCultivationPlan(selectedPlan.id, { status });
      setSelectedPlan(updated);
      setPlans(plans.map(p => p.id === selectedPlan.id ? updated : p));
    } catch (error) {
      console.error('Failed to update plan status:', error);
    }
  };

  const getClientInfo = (clientId: string) => clients.find(c => c.id === clientId);
  const getDonorMove = (clientId: string) => donorMoves.find(d => d.clientId === clientId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: CultivationPlanStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'draft': return 'bg-gray-500/20 text-gray-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-cyan-500/20 text-cyan-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
    }
  };

  const getTaskStatusColor = (status: CultivationTaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400';
      case 'scheduled': return 'bg-purple-500/20 text-purple-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'deferred': return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredPlans = filterStatus === 'all'
    ? plans
    : plans.filter(p => p.status === filterStatus);

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
          <h1 className="text-2xl font-bold text-white">Cultivation Plans</h1>
          <p className="text-gray-400 mt-1">
            Create and manage strategic plans for cultivating donor relationships
          </p>
        </div>
        <button
          onClick={() => setShowNewPlanModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Plan
        </button>
      </div>

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CultivationPlanStatus | 'all')}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Plans</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Plans */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPlans.map((plan) => {
              const client = getClientInfo(plan.clientId);
              const donorMove = getDonorMove(plan.clientId);

              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-white">{plan.name}</div>
                      <div className="text-sm text-gray-400">{client?.name || 'Unknown'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>

                  {donorMove && (
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs mb-2"
                      style={{
                        backgroundColor: `${DONOR_STAGE_COLORS[donorMove.currentStage]}20`,
                        color: DONOR_STAGE_COLORS[donorMove.currentStage],
                      }}
                    >
                      {DONOR_STAGE_LABELS[donorMove.currentStage]}
                    </div>
                  )}

                  {plan.goalAmount && (
                    <div className="text-cyan-400 font-semibold text-sm">
                      Goal: {formatCurrency(plan.goalAmount)}
                    </div>
                  )}

                  {plan.targetCompletionDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {new Date(plan.targetCompletionDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPlans.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No plans found
              </div>
            )}
          </div>
        </div>

        {/* Plan Details */}
        <div className="lg:col-span-2">
          {selectedPlan ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              {/* Plan Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPlan.name}</h2>
                  <p className="text-gray-400 mt-1">
                    {getClientInfo(selectedPlan.clientId)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedPlan.status}
                    onChange={(e) => handleUpdatePlanStatus(e.target.value as CultivationPlanStatus)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Plan Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Goal Type</div>
                  <div className="text-white font-medium mt-1">
                    {selectedPlan.goalType || 'Not set'}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Goal Amount</div>
                  <div className="text-cyan-400 font-semibold mt-1">
                    {selectedPlan.goalAmount ? formatCurrency(selectedPlan.goalAmount) : 'Not set'}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Start Date</div>
                  <div className="text-white font-medium mt-1">
                    {new Date(selectedPlan.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-400 text-xs">Target Date</div>
                  <div className="text-white font-medium mt-1">
                    {selectedPlan.targetCompletionDate
                      ? new Date(selectedPlan.targetCompletionDate).toLocaleDateString()
                      : 'Not set'}
                  </div>
                </div>
              </div>

              {/* Strategy */}
              {selectedPlan.strategy && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Strategy</h3>
                  <p className="text-gray-400 text-sm bg-gray-900/50 rounded-lg p-3">
                    {selectedPlan.strategy}
                  </p>
                </div>
              )}

              {/* Tasks Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300">Cultivation Tasks</h3>
                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    + Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg"
                    >
                      <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                      <button
                        onClick={() => task.status !== 'completed' && handleCompleteTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-500 hover:border-green-500'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-gray-700 rounded">
                            {CULTIVATION_TASK_TYPE_LABELS[task.taskType]}
                          </span>
                          {task.dueDate && (
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}

                  {tasks.length === 0 && (
                    <div className="text-center text-gray-500 py-4 bg-gray-900/50 rounded-lg">
                      No tasks yet. Add tasks to track cultivation activities.
                    </div>
                  )}
                </div>
              </div>

              {/* Touchpoints Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Related Touchpoints ({touchpoints.length})
                </h3>
                {touchpoints.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {touchpoints.slice(0, 5).map((tp) => (
                      <div key={tp.id} className="flex items-center gap-3 p-2 bg-gray-900/30 rounded-lg text-sm">
                        <span className="text-gray-400">
                          {new Date(tp.touchpointDate).toLocaleDateString()}
                        </span>
                        <span className="text-white">{tp.touchpointType}</span>
                        {tp.subject && <span className="text-gray-400">- {tp.subject}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4 bg-gray-900/50 rounded-lg">
                    No touchpoints recorded for this plan yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 text-center">
              <div className="text-gray-400">
                Select a plan to view details or create a new plan to get started.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Plan Modal */}
      {showNewPlanModal && (
        <NewPlanModal
          clients={clients}
          donorMoves={donorMoves}
          preselectedClientId={selectedClientId}
          onClose={() => setShowNewPlanModal(false)}
          onCreate={handleCreatePlan}
        />
      )}

      {/* New Task Modal */}
      {showNewTaskModal && selectedPlan && (
        <NewTaskModal
          planId={selectedPlan.id}
          existingTaskCount={tasks.length}
          onClose={() => setShowNewTaskModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
};

// New Plan Modal
interface NewPlanModalProps {
  clients: Client[];
  donorMoves: DonorMove[];
  preselectedClientId?: string;
  onClose: () => void;
  onCreate: (data: Omit<CultivationPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const NewPlanModal: React.FC<NewPlanModalProps> = ({
  clients,
  donorMoves,
  preselectedClientId,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [strategy, setStrategy] = useState('');
  const [goalType, setGoalType] = useState<CultivationGoalType>('first-gift');
  const [goalAmount, setGoalAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetDate, setTargetDate] = useState('');

  // Filter clients that have donor moves
  const clientsWithMoves = clients.filter(c => donorMoves.some(d => d.clientId === c.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) return;

    const donorMove = donorMoves.find(d => d.clientId === clientId);
    if (!donorMove) return;

    onCreate({
      donorMoveId: donorMove.id,
      clientId,
      name,
      description: null,
      strategy: strategy || null,
      startDate,
      targetCompletionDate: targetDate || null,
      actualCompletionDate: null,
      goalDescription: null,
      goalAmount: goalAmount ? parseFloat(goalAmount) : null,
      goalType,
      status: 'active',
      successCriteria: null,
      outcomeNotes: null,
      wasSuccessful: null,
      createdBy: null,
      assignedTo: null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Cultivation Plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Major Gift Cultivation - Q1 2025"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Donor</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="">Select a donor...</option>
              {clientsWithMoves.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {clientsWithMoves.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                No donors in pipeline. Add donors to the pipeline first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Goal Type</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as CultivationGoalType)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="first-gift">First Gift</option>
              <option value="upgrade">Upgrade Gift</option>
              <option value="major-gift">Major Gift</option>
              <option value="recurring">Recurring Gift</option>
              <option value="planned-gift">Planned Gift</option>
              <option value="retention">Retention</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Goal Amount</label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              placeholder="Enter target amount"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Strategy</label>
            <textarea
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              placeholder="Describe your cultivation strategy..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

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
              disabled={!name || !clientId}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// New Task Modal
interface NewTaskModalProps {
  planId: string;
  existingTaskCount: number;
  onClose: () => void;
  onCreate: (data: Omit<CultivationTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
  planId,
  existingTaskCount,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<CultivationTaskType>('call');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<MovePriority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onCreate({
      cultivationPlanId: planId,
      title,
      description: description || null,
      taskType,
      dueDate: dueDate || null,
      scheduledDate: null,
      completedDate: null,
      status: 'pending',
      priority,
      assignedTo: null,
      sequenceOrder: existingTaskCount,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Schedule lunch meeting"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as CultivationTaskType)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(CULTIVATION_TASK_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

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
              disabled={!title}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CultivationPlanBuilder;
