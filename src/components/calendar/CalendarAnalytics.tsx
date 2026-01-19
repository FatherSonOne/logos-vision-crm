import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, Calendar, BarChart3, PieChart, X } from 'lucide-react';

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'overdue';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  timeEstimate?: number;
  timeSpent?: number;
  assignedToId: string;
}

interface CalendarAnalyticsProps {
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarAnalytics: React.FC<CalendarAnalyticsProps> = ({
  tasks,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // This week's completion
    const thisWeekCompleted = tasks.filter(t => {
      if (t.status !== 'completed') return false;
      // In a real app, track completion date
      return true; // Simplified
    }).length;

    // Priority breakdown
    const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
    const highTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    const mediumTasks = tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length;
    const lowTasks = tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length;

    // Time tracking
    const totalEstimated = tasks.reduce((sum, t) => sum + (t.timeEstimate || 0), 0);
    const totalSpent = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const timeEfficiency = totalEstimated > 0 ? (totalEstimated / totalSpent) * 100 : 0;

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = tasks.filter(t => {
      if (t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    }).length;

    // Status distribution
    const statusCounts = {
      new: tasks.filter(t => t.status === 'new').length,
      assigned: tasks.filter(t => t.status === 'assigned').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
    };

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
      completionRate,
      thisWeekCompleted,
      criticalTasks,
      highTasks,
      mediumTasks,
      lowTasks,
      totalEstimated,
      totalSpent,
      timeEfficiency,
      upcomingDeadlines,
      statusCounts,
    };
  }, [tasks]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Analytics Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              <div>
                <h2 className="text-2xl font-bold">Calendar Analytics</h2>
                <p className="text-sm text-white/80 mt-0.5">Task insights and productivity metrics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-120px)] overflow-y-auto p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Completion Rate */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Completion Rate</span>
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {analytics.completionRate.toFixed(0)}%
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  {analytics.completedTasks}/{analytics.totalTasks}
                </span>
              </div>
              <div className="mt-2 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${analytics.completionRate}%` }}
                />
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Overdue Tasks</span>
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {analytics.overdueTasks}
                </span>
                {analytics.overdueTasks > 0 && (
                  <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Needs attention
                  </span>
                )}
              </div>
              {analytics.overdueTasks > 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Complete these tasks as soon as possible
                </p>
              )}
            </div>

            {/* In Progress */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">In Progress</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {analytics.inProgressTasks}
                </span>
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Active tasks
                </span>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Next 7 Days</span>
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {analytics.upcomingDeadlines}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Deadlines
                </span>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-500" />
              Priority Distribution
            </h3>
            <div className="space-y-3">
              {/* Critical */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    🟥 Critical
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {analytics.criticalTasks}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                    style={{ width: `${analytics.criticalTasks > 0 ? (analytics.criticalTasks / analytics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    🟧 High
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {analytics.highTasks}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                    style={{ width: `${analytics.highTasks > 0 ? (analytics.highTasks / analytics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    🟨 Medium
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {analytics.mediumTasks}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                    style={{ width: `${analytics.mediumTasks > 0 ? (analytics.mediumTasks / analytics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    ◽ Low
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {analytics.lowTasks}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-slate-500 to-slate-600 transition-all duration-500"
                    style={{ width: `${analytics.lowTasks > 0 ? (analytics.lowTasks / analytics.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              Status Overview
            </h3>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {analytics.statusCounts.new}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">New</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {analytics.statusCounts.assigned}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Assigned</div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {analytics.statusCounts.in_progress}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">In Progress</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {analytics.statusCounts.completed}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">Done</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {analytics.statusCounts.overdue}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">Overdue</div>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          {analytics.totalEstimated > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-500" />
                Time Tracking
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Estimated</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.totalEstimated}h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Spent</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {analytics.totalSpent}h
                  </div>
                </div>
              </div>
              {analytics.totalSpent > analytics.totalEstimated && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                    <TrendingUp className="w-4 h-4" />
                    {((analytics.totalSpent - analytics.totalEstimated) / analytics.totalEstimated * 100).toFixed(0)}% over estimate
                  </div>
                </div>
              )}
              {analytics.totalSpent <= analytics.totalEstimated && analytics.totalSpent > 0 && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <TrendingDown className="w-4 h-4" />
                    On track or under estimate
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Productivity Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Productivity Insights
            </h3>
            <div className="space-y-2 text-sm">
              {analytics.completionRate >= 70 && (
                <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Great job! Your completion rate is above 70%</span>
                </div>
              )}
              {analytics.overdueTasks > 0 && (
                <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>You have {analytics.overdueTasks} overdue task{analytics.overdueTasks !== 1 ? 's' : ''} - prioritize these</span>
                </div>
              )}
              {analytics.criticalTasks > 0 && (
                <div className="flex items-start gap-2 text-orange-700 dark:text-orange-300">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{analytics.criticalTasks} critical priority task{analytics.criticalTasks !== 1 ? 's' : ''} need{analytics.criticalTasks === 1 ? 's' : ''} immediate attention</span>
                </div>
              )}
              {analytics.upcomingDeadlines > 0 && (
                <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{analytics.upcomingDeadlines} deadline{analytics.upcomingDeadlines !== 1 ? 's' : ''} in the next 7 days</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
