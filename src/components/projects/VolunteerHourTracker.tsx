import React, { useState, useMemo } from 'react';
import type { Project, Volunteer, VolunteerHourLog, Task } from '../../types';
import {
  ClockIcon,
  UsersIcon,
  PlusIcon,
  CheckCircleIcon,
  DollarSignIcon,
  CalendarIcon,
  TrendingUpIcon,
  FilterIcon,
  DownloadIcon,
  SearchIcon
} from '../icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../Modal';

interface VolunteerHourTrackerProps {
  project: Project;
  volunteers: Volunteer[];
  onLogHours: (log: Omit<VolunteerHourLog, 'id' | 'createdAt'>) => void;
  onApproveHours: (logId: string, approved: boolean, approvedBy: string) => void;
  onUpdateProject?: (updates: Partial<Project>) => void;
  hourlyRate?: number;
}

export const VolunteerHourTracker: React.FC<VolunteerHourTrackerProps> = ({
  project,
  volunteers,
  onLogHours,
  onApproveHours,
  onUpdateProject,
  hourlyRate = 25 // Default volunteer hour value
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVolunteer, setFilterVolunteer] = useState<string>('all');
  const [filterApproved, setFilterApproved] = useState<'all' | 'pending' | 'approved'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'hours' | 'volunteer'>('date');

  // Form state for new log
  const [newLog, setNewLog] = useState({
    volunteerId: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    taskId: '',
    description: ''
  });

  // Get project volunteers
  const projectVolunteers = useMemo(() => {
    return volunteers.filter(v =>
      project.volunteerIds?.includes(v.id) ||
      v.assignedProjectIds.includes(project.id)
    );
  }, [volunteers, project]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const logs = project.volunteerHours || [];
    const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
    const approvedHours = logs.filter(l => l.approved).reduce((sum, log) => sum + log.hours, 0);
    const pendingHours = logs.filter(l => !l.approved).reduce((sum, log) => sum + log.hours, 0);
    const totalValue = totalHours * hourlyRate;
    const approvedValue = approvedHours * hourlyRate;

    // Hours by volunteer
    const byVolunteer = new Map<string, number>();
    logs.forEach(log => {
      byVolunteer.set(log.volunteerId, (byVolunteer.get(log.volunteerId) || 0) + log.hours);
    });

    // Hours by month
    const byMonth = new Map<string, number>();
    logs.forEach(log => {
      const month = log.date.substring(0, 7); // YYYY-MM
      byMonth.set(month, (byMonth.get(month) || 0) + log.hours);
    });

    // Top contributor
    let topContributor = { id: '', hours: 0 };
    byVolunteer.forEach((hours, id) => {
      if (hours > topContributor.hours) {
        topContributor = { id, hours };
      }
    });

    return {
      totalHours,
      approvedHours,
      pendingHours,
      totalValue,
      approvedValue,
      uniqueVolunteers: byVolunteer.size,
      byVolunteer: Array.from(byVolunteer.entries()).sort((a, b) => b[1] - a[1]),
      byMonth: Array.from(byMonth.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      topContributor,
      avgHoursPerVolunteer: byVolunteer.size > 0 ? totalHours / byVolunteer.size : 0
    };
  }, [project.volunteerHours, hourlyRate]);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let logs = [...(project.volunteerHours || [])];

    // Apply filters
    if (filterVolunteer !== 'all') {
      logs = logs.filter(l => l.volunteerId === filterVolunteer);
    }

    if (filterApproved === 'pending') {
      logs = logs.filter(l => !l.approved);
    } else if (filterApproved === 'approved') {
      logs = logs.filter(l => l.approved);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      logs = logs.filter(l =>
        l.description?.toLowerCase().includes(term) ||
        volunteers.find(v => v.id === l.volunteerId)?.name.toLowerCase().includes(term)
      );
    }

    // Sort
    logs.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'hours':
          return b.hours - a.hours;
        case 'volunteer':
          const nameA = volunteers.find(v => v.id === a.volunteerId)?.name || '';
          const nameB = volunteers.find(v => v.id === b.volunteerId)?.name || '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return logs;
  }, [project.volunteerHours, filterVolunteer, filterApproved, searchTerm, sortBy, volunteers]);

  // Handle log submission
  const handleSubmitLog = () => {
    if (!newLog.volunteerId || !newLog.hours || parseFloat(newLog.hours) <= 0) {
      return;
    }

    onLogHours({
      volunteerId: newLog.volunteerId,
      projectId: project.id,
      taskId: newLog.taskId || undefined,
      hours: parseFloat(newLog.hours),
      date: newLog.date,
      description: newLog.description || undefined,
      approved: false,
      hourlyValue: hourlyRate
    });

    setNewLog({
      volunteerId: '',
      hours: '',
      date: new Date().toISOString().split('T')[0],
      taskId: '',
      description: ''
    });
    setIsLogModalOpen(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Volunteer', 'Hours', 'Value', 'Task', 'Description', 'Status'];
    const rows = filteredLogs.map(log => [
      log.date,
      volunteers.find(v => v.id === log.volunteerId)?.name || 'Unknown',
      log.hours,
      `$${(log.hours * hourlyRate).toFixed(2)}`,
      project.tasks.find(t => t.id === log.taskId)?.description || '',
      log.description || '',
      log.approved ? 'Approved' : 'Pending'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteer-hours-${project.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const getVolunteerName = (id: string) => volunteers.find(v => v.id === id)?.name || 'Unknown Volunteer';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Volunteer Hours</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Track and manage volunteer contributions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
            <DownloadIcon />
            Export
          </Button>
          <Button variant="primary" onClick={() => setIsLogModalOpen(true)} className="flex items-center gap-2">
            <PlusIcon size="sm" />
            Log Hours
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <ClockIcon className="h-6 w-6 text-purple-200" />
            <span className="text-purple-200 text-sm font-medium">Total Hours</span>
          </div>
          <div className="text-3xl font-bold">{metrics.totalHours.toFixed(1)}</div>
          <div className="text-purple-200 text-sm mt-1">{metrics.pendingHours.toFixed(1)} pending approval</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSignIcon className="h-6 w-6 text-green-200" />
            <span className="text-green-200 text-sm font-medium">Total Value</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(metrics.totalValue)}</div>
          <div className="text-green-200 text-sm mt-1">@ ${hourlyRate}/hour</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <UsersIcon className="h-6 w-6 text-blue-200" />
            <span className="text-blue-200 text-sm font-medium">Volunteers</span>
          </div>
          <div className="text-3xl font-bold">{metrics.uniqueVolunteers}</div>
          <div className="text-blue-200 text-sm mt-1">Avg: {metrics.avgHoursPerVolunteer.toFixed(1)} hrs each</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUpIcon className="h-6 w-6 text-amber-200" />
            <span className="text-amber-200 text-sm font-medium">Top Contributor</span>
          </div>
          <div className="text-xl font-bold truncate">
            {metrics.topContributor.id ? getVolunteerName(metrics.topContributor.id) : 'N/A'}
          </div>
          <div className="text-amber-200 text-sm mt-1">{metrics.topContributor.hours.toFixed(1)} hours</div>
        </div>
      </div>

      {/* Leaderboard & Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volunteer Leaderboard */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Volunteer Leaderboard</h3>
          <div className="space-y-3">
            {metrics.byVolunteer.slice(0, 5).map(([volunteerId, hours], idx) => {
              const volunteer = volunteers.find(v => v.id === volunteerId);
              const percentage = metrics.totalHours > 0 ? (hours / metrics.totalHours) * 100 : 0;
              return (
                <div key={volunteerId} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                    idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200' :
                    idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900 dark:text-white truncate">{volunteer?.name || 'Unknown'}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{hours.toFixed(1)} hrs</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-amber-500' :
                          idx === 1 ? 'bg-slate-400' :
                          idx === 2 ? 'bg-orange-400' :
                          'bg-slate-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {metrics.byVolunteer.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">No volunteer hours logged yet</p>
            )}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Monthly Breakdown</h3>
          <div className="space-y-3">
            {metrics.byMonth.slice(-6).map(([month, hours]) => {
              const maxHours = Math.max(...metrics.byMonth.map(([, h]) => h));
              const percentage = maxHours > 0 ? (hours / maxHours) * 100 : 0;
              const monthLabel = new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              return (
                <div key={month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{monthLabel}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{hours.toFixed(1)} hrs</span>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {metrics.byMonth.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Hour Logs Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
            />
          </div>
          <select
            value={filterVolunteer}
            onChange={(e) => setFilterVolunteer(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Volunteers</option>
            {projectVolunteers.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <select
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="hours">Sort by Hours</option>
            <option value="volunteer">Sort by Volunteer</option>
          </select>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Volunteer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-medium">
                    {getVolunteerName(log.volunteerId)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white font-bold">
                    {log.hours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                    {formatCurrency(log.hours * (log.hourlyValue || hourlyRate))}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {log.description || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      log.approved
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}>
                      {log.approved ? <CheckCircleIcon className="h-3 w-3" /> : <ClockIcon className="h-3 w-3" />}
                      {log.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!log.approved && (
                      <button
                        onClick={() => onApproveHours(log.id, true, 'current-user')}
                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No hour logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Hours Modal */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Volunteer Hours">
        <div className="space-y-4">
          <Select
            label="Volunteer *"
            value={newLog.volunteerId}
            onChange={(e) => setNewLog(prev => ({ ...prev, volunteerId: e.target.value }))}
            options={[
              { value: '', label: 'Select a volunteer' },
              ...projectVolunteers.map(v => ({ value: v.id, label: v.name }))
            ]}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hours *"
              type="number"
              min="0.25"
              step="0.25"
              value={newLog.hours}
              onChange={(e) => setNewLog(prev => ({ ...prev, hours: e.target.value }))}
              placeholder="e.g., 4.5"
              fullWidth
            />
            <Input
              label="Date *"
              type="date"
              value={newLog.date}
              onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))}
              fullWidth
            />
          </div>

          <Select
            label="Related Task (optional)"
            value={newLog.taskId}
            onChange={(e) => setNewLog(prev => ({ ...prev, taskId: e.target.value }))}
            options={[
              { value: '', label: 'Select a task (optional)' },
              ...project.tasks.map(t => ({ value: t.id, label: t.description }))
            ]}
            fullWidth
          />

          <Input
            label="Description"
            value={newLog.description}
            onChange={(e) => setNewLog(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What did the volunteer work on?"
            fullWidth
          />

          {newLog.hours && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                Estimated value: <span className="font-bold">{formatCurrency(parseFloat(newLog.hours || '0') * hourlyRate)}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmitLog} disabled={!newLog.volunteerId || !newLog.hours}>
              Log Hours
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VolunteerHourTracker;
