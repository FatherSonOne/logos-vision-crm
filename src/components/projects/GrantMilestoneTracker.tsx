import React, { useState, useMemo } from 'react';
import type { Project, ProjectMilestone } from '../../types';
import { MilestoneType, MilestoneStatus } from '../../types';
import {
  FlagIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  DollarSignIcon,
  CalendarIcon,
  FileTextIcon,
  TrendingUpIcon,
  ChevronRightIcon,
  EditIcon,
  TrashIcon
} from '../icons';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../Modal';

interface GrantMilestoneTrackerProps {
  project: Project;
  onAddMilestone: (milestone: Omit<ProjectMilestone, 'id' | 'createdAt'>) => void;
  onUpdateMilestone: (milestoneId: string, updates: Partial<ProjectMilestone>) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  grantInfo?: {
    grantorName?: string;
    grantAmount?: number;
    grantStart?: string;
    grantEnd?: string;
  };
}

export const GrantMilestoneTracker: React.FC<GrantMilestoneTrackerProps> = ({
  project,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  grantInfo
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [filterType, setFilterType] = useState<MilestoneType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<MilestoneStatus | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: MilestoneType.Deliverable,
    dueDate: '',
    amount: '',
    deliverables: '',
    notes: ''
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const milestones = project.milestones || [];
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === MilestoneStatus.Completed).length;
    const inProgress = milestones.filter(m => m.status === MilestoneStatus.InProgress).length;
    const overdue = milestones.filter(m => m.status === MilestoneStatus.Overdue).length;
    const pending = milestones.filter(m => m.status === MilestoneStatus.Pending).length;

    const totalAmount = milestones.filter(m => m.type === MilestoneType.Financial).reduce((sum, m) => sum + (m.amount || 0), 0);
    const receivedAmount = milestones
      .filter(m => m.type === MilestoneType.Financial && m.status === MilestoneStatus.Completed)
      .reduce((sum, m) => sum + (m.amount || 0), 0);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Next milestone
    const nextMilestone = milestones
      .filter(m => m.status !== MilestoneStatus.Completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

    // Milestones by type
    const byType = {
      [MilestoneType.Deliverable]: milestones.filter(m => m.type === MilestoneType.Deliverable).length,
      [MilestoneType.Reporting]: milestones.filter(m => m.type === MilestoneType.Reporting).length,
      [MilestoneType.Financial]: milestones.filter(m => m.type === MilestoneType.Financial).length,
      [MilestoneType.Progress]: milestones.filter(m => m.type === MilestoneType.Progress).length,
      [MilestoneType.Custom]: milestones.filter(m => m.type === MilestoneType.Custom).length
    };

    return {
      total,
      completed,
      inProgress,
      overdue,
      pending,
      totalAmount,
      receivedAmount,
      completionRate,
      nextMilestone,
      byType
    };
  }, [project.milestones]);

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    let milestones = [...(project.milestones || [])];

    if (filterType !== 'all') {
      milestones = milestones.filter(m => m.type === filterType);
    }

    if (filterStatus !== 'all') {
      milestones = milestones.filter(m => m.status === filterStatus);
    }

    return milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [project.milestones, filterType, filterStatus]);

  // Handle form submission
  const handleSubmit = () => {
    const milestoneData: Omit<ProjectMilestone, 'id' | 'createdAt'> = {
      projectId: project.id,
      name: formData.name,
      description: formData.description || undefined,
      type: formData.type,
      status: MilestoneStatus.Pending,
      dueDate: formData.dueDate,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      deliverables: formData.deliverables ? formData.deliverables.split('\n').filter(d => d.trim()) : undefined,
      notes: formData.notes || undefined
    };

    if (editingMilestone) {
      onUpdateMilestone(editingMilestone.id, milestoneData);
    } else {
      onAddMilestone(milestoneData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: MilestoneType.Deliverable,
      dueDate: '',
      amount: '',
      deliverables: '',
      notes: ''
    });
    setEditingMilestone(null);
    setIsModalOpen(false);
  };

  const openEditModal = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone);
    setFormData({
      name: milestone.name,
      description: milestone.description || '',
      type: milestone.type,
      dueDate: milestone.dueDate,
      amount: milestone.amount?.toString() || '',
      deliverables: milestone.deliverables?.join('\n') || '',
      notes: milestone.notes || ''
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case MilestoneStatus.Completed:
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700';
      case MilestoneStatus.InProgress:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case MilestoneStatus.Overdue:
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700';
      case MilestoneStatus.Blocked:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
    }
  };

  const getTypeIcon = (type: MilestoneType) => {
    switch (type) {
      case MilestoneType.Deliverable:
        return <CheckCircleIcon className="h-4 w-4" />;
      case MilestoneType.Reporting:
        return <FileTextIcon className="h-4 w-4" />;
      case MilestoneType.Financial:
        return <DollarSignIcon className="h-4 w-4" />;
      case MilestoneType.Progress:
        return <TrendingUpIcon className="h-4 w-4" />;
      default:
        return <FlagIcon className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getDaysUntil = (date: string) => {
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Grant Milestones</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {grantInfo?.grantorName && <span>Grant from {grantInfo.grantorName} | </span>}
            Track deliverables, reports, and disbursements
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <PlusIcon size="sm" />
          Add Milestone
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completion</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.completionRate}%</div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${metrics.completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.completed}</div>
          <div className="text-xs text-slate-500">of {metrics.total} milestones</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.inProgress}</div>
          <div className="text-xs text-slate-500">{metrics.pending} pending</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Overdue</div>
          <div className={`text-2xl font-bold ${metrics.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
            {metrics.overdue}
          </div>
          <div className="text-xs text-slate-500">needs attention</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Funds Received</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(metrics.receivedAmount)}
          </div>
          <div className="text-xs text-slate-500">of {formatCurrency(metrics.totalAmount)}</div>
        </div>
      </div>

      {/* Next Milestone Alert */}
      {metrics.nextMilestone && (
        <div className={`p-4 rounded-xl border-l-4 ${
          getDaysUntil(metrics.nextMilestone.dueDate) < 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
          getDaysUntil(metrics.nextMilestone.dueDate) <= 7 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500' :
          'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getTypeIcon(metrics.nextMilestone.type)}
                <span className="font-semibold text-slate-900 dark:text-white">Next: {metrics.nextMilestone.name}</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Due {formatDate(metrics.nextMilestone.dueDate)}
                {getDaysUntil(metrics.nextMilestone.dueDate) < 0 && (
                  <span className="text-red-600 dark:text-red-400 font-medium ml-2">
                    ({Math.abs(getDaysUntil(metrics.nextMilestone.dueDate))} days overdue)
                  </span>
                )}
                {getDaysUntil(metrics.nextMilestone.dueDate) >= 0 && getDaysUntil(metrics.nextMilestone.dueDate) <= 7 && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium ml-2">
                    ({getDaysUntil(metrics.nextMilestone.dueDate)} days remaining)
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateMilestone(metrics.nextMilestone!.id, { status: MilestoneStatus.Completed, completedDate: new Date().toISOString().split('T')[0] })}
            >
              Mark Complete
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
        >
          <option value="all">All Types</option>
          {Object.values(MilestoneType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
        >
          <option value="all">All Status</option>
          {Object.values(MilestoneStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <div className="flex gap-1 ml-auto bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm font-medium ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Milestones Display */}
      {viewMode === 'timeline' ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-6">
              {filteredMilestones.map((milestone, idx) => {
                const daysUntil = getDaysUntil(milestone.dueDate);
                const isOverdue = milestone.status !== MilestoneStatus.Completed && daysUntil < 0;

                return (
                  <div key={milestone.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.status === MilestoneStatus.Completed ? 'bg-green-500 text-white' :
                      isOverdue ? 'bg-red-500 text-white' :
                      milestone.status === MilestoneStatus.InProgress ? 'bg-blue-500 text-white' :
                      'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                      {getTypeIcon(milestone.type)}
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      milestone.status === MilestoneStatus.Completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
                      isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                      'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{milestone.name}</h3>
                          {milestone.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{milestone.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                            {milestone.status}
                          </span>
                          <button
                            onClick={() => openEditModal(milestone)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <EditIcon />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                        </div>
                        {milestone.amount && (
                          <div className="flex items-center gap-1">
                            <DollarSignIcon className="h-4 w-4" />
                            <span>{formatCurrency(milestone.amount)}</span>
                          </div>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          milestone.type === MilestoneType.Deliverable ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                          milestone.type === MilestoneType.Reporting ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                          milestone.type === MilestoneType.Financial ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {milestone.type}
                        </span>
                      </div>

                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Deliverables:</p>
                          <ul className="space-y-1">
                            {milestone.deliverables.map((d, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <CheckCircleIcon className={`h-4 w-4 ${milestone.status === MilestoneStatus.Completed ? 'text-green-500' : 'text-slate-300'}`} />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {milestone.status !== MilestoneStatus.Completed && (
                        <div className="mt-3 flex gap-2">
                          {milestone.status === MilestoneStatus.Pending && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateMilestone(milestone.id, { status: MilestoneStatus.InProgress })}
                            >
                              Start Progress
                            </Button>
                          )}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onUpdateMilestone(milestone.id, { status: MilestoneStatus.Completed, completedDate: new Date().toISOString().split('T')[0] })}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredMilestones.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <FlagIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No milestones found</p>
                  <Button variant="primary" className="mt-4" onClick={() => setIsModalOpen(true)}>
                    Add First Milestone
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Milestone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredMilestones.map(milestone => (
                <tr key={milestone.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{milestone.name}</div>
                    {milestone.description && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{milestone.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                      {getTypeIcon(milestone.type)}
                      {milestone.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(milestone.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                    {milestone.amount ? formatCurrency(milestone.amount) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(milestone)}
                        className="p-1.5 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => onDeleteMilestone(milestone.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Milestone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
      >
        <div className="space-y-4">
          <Input
            label="Milestone Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Q1 Progress Report"
            fullWidth
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe this milestone..."
            rows={2}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type *"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MilestoneType }))}
              options={Object.values(MilestoneType).map(t => ({ value: t, label: t }))}
              fullWidth
            />
            <Input
              label="Due Date *"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              fullWidth
            />
          </div>

          {formData.type === MilestoneType.Financial && (
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="e.g., 10000"
              fullWidth
            />
          )}

          <Textarea
            label="Deliverables (one per line)"
            value={formData.deliverables}
            onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
            placeholder="Submit quarterly report&#10;Update budget spreadsheet&#10;Complete beneficiary survey"
            rows={3}
            fullWidth
          />

          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes..."
            rows={2}
            fullWidth
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!formData.name || !formData.dueDate}>
              {editingMilestone ? 'Update' : 'Add'} Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GrantMilestoneTracker;
