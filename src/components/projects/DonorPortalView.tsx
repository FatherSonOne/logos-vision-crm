import React, { useState, useMemo } from 'react';
import type { Project, Client, ProjectMilestone, VolunteerHourLog } from '../../types';
import { ProjectStatus, MilestoneStatus, MilestoneType } from '../../types';
import {
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  DollarSignIcon,
  TrendingUpIcon,
  CalendarIcon,
  FlagIcon,
  HeartIcon,
  ChevronRightIcon,
  ShareIcon,
  EyeIcon,
  LockIcon
} from '../icons';

interface DonorPortalViewProps {
  project: Project;
  client?: Client;
  donations?: { amount: number; date: string; donorName: string }[];
  onClose?: () => void;
  isPreview?: boolean;
}

export const DonorPortalView: React.FC<DonorPortalViewProps> = ({
  project,
  client,
  donations = [],
  onClose,
  isPreview = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'impact' | 'updates'>('overview');

  // Calculate progress metrics
  const metrics = useMemo(() => {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = project.milestones?.filter(m => m.status === MilestoneStatus.Completed).length || 0;
    const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const fundraisingProgress = project.fundraisingGoal && project.fundraisingGoal > 0
      ? Math.round(((project.fundraisingRaised || 0) / project.fundraisingGoal) * 100)
      : 0;

    const totalVolunteerHours = project.volunteerHours?.reduce((sum, log) => sum + log.hours, 0) || 0;
    const volunteerValue = project.volunteerHours?.reduce((sum, log) => sum + (log.hours * (log.hourlyValue || 25)), 0) || 0;

    const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const timeProgress = totalDays > 0 ? Math.round(((totalDays - daysRemaining) / totalDays) * 100) : 0;

    return {
      taskProgress,
      completedTasks,
      totalTasks,
      milestoneProgress,
      completedMilestones,
      totalMilestones,
      fundraisingProgress,
      totalVolunteerHours,
      volunteerValue,
      daysRemaining,
      timeProgress
    };
  }, [project]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Progress Ring Component
  const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({
    progress,
    size = 120,
    strokeWidth = 8,
    color = '#06b6d4'
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{progress}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${isPreview ? 'p-4' : 'p-8'}`}>
      {/* Preview Banner */}
      {isPreview && (
        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <EyeIcon />
            <span className="font-medium">Preview Mode</span>
            <span className="text-sm">- This is how donors will see your project</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-amber-800 dark:text-amber-200 hover:underline text-sm">
              Close Preview
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium mb-1">{client?.name || 'Organization'}</p>
                <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                <p className="text-cyan-100 max-w-2xl">{project.description}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  project.status === ProjectStatus.Completed ? 'bg-green-500/20 text-green-100' :
                  project.status === ProjectStatus.InProgress ? 'bg-blue-500/20 text-blue-100' :
                  'bg-white/20 text-white'
                }`}>
                  {project.status === ProjectStatus.Completed && <CheckCircleIcon className="h-4 w-4" />}
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{metrics.taskProgress}%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.daysRemaining}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Days Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalVolunteerHours}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Volunteer Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {project.fundraisingGoal ? `${metrics.fundraisingProgress}%` : 'N/A'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Fundraising</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm">
          {(['overview', 'milestones', 'impact', 'updates'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Project Progress</h2>
                <div className="flex items-center gap-8">
                  <ProgressRing progress={metrics.taskProgress} />
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Tasks Completed</span>
                        <span className="font-medium text-slate-900 dark:text-white">{metrics.completedTasks}/{metrics.totalTasks}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${metrics.taskProgress}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Milestones Reached</span>
                        <span className="font-medium text-slate-900 dark:text-white">{metrics.completedMilestones}/{metrics.totalMilestones}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${metrics.milestoneProgress}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Timeline Progress</span>
                        <span className="font-medium text-slate-900 dark:text-white">{metrics.timeProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${metrics.timeProgress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fundraising Progress */}
              {project.fundraisingGoal && project.fundraisingGoal > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSignIcon className="h-5 w-5 text-green-500" />
                    Fundraising Progress
                  </h2>
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(project.fundraisingRaised || 0)}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          of {formatCurrency(project.fundraisingGoal)} goal
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {metrics.fundraisingProgress}%
                      </span>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(metrics.fundraisingProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                  {donations.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Recent Contributions</p>
                      <div className="space-y-2">
                        {donations.slice(0, 3).map((donation, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{donation.donorName}</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(donation.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Updates</h2>
                <div className="space-y-4">
                  {project.tasks.filter(t => t.status === 'Done').slice(0, 5).map((task, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{task.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
                      </div>
                    </div>
                  ))}
                  {project.tasks.filter(t => t.status === 'Done').length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No updates yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                  Timeline
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Start Date</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">End Date</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Days Remaining</span>
                    <span className={`font-bold ${metrics.daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                      {metrics.daysRemaining}
                    </span>
                  </div>
                </div>
              </div>

              {/* Volunteer Impact */}
              {metrics.totalVolunteerHours > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <HeartIcon className="h-5 w-5 text-pink-500" />
                    Volunteer Impact
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Hours</span>
                      <span className="font-bold text-slate-900 dark:text-white">{metrics.totalVolunteerHours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Value</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(metrics.volunteerValue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Volunteers</span>
                      <span className="font-bold text-slate-900 dark:text-white">{project.volunteerIds?.length || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <h2 className="text-lg font-bold mb-2">Share This Project</h2>
                <p className="text-cyan-100 text-sm mb-4">Help spread the word and grow our impact!</p>
                <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <ShareIcon className="h-4 w-4" />
                  Share Project
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Project Milestones</h2>
            {project.milestones && project.milestones.length > 0 ? (
              <div className="space-y-4">
                {project.milestones.map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      milestone.status === MilestoneStatus.Completed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : milestone.status === MilestoneStatus.InProgress
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : milestone.status === MilestoneStatus.Overdue
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FlagIcon className={`h-4 w-4 ${
                            milestone.status === MilestoneStatus.Completed ? 'text-green-600' :
                            milestone.status === MilestoneStatus.InProgress ? 'text-blue-600' :
                            milestone.status === MilestoneStatus.Overdue ? 'text-red-600' :
                            'text-slate-400'
                          }`} />
                          <h3 className="font-semibold text-slate-900 dark:text-white">{milestone.name}</h3>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Due: {formatDate(milestone.dueDate)}
                          </span>
                          {milestone.amount && (
                            <span className="flex items-center gap-1">
                              <DollarSignIcon className="h-3 w-3" />
                              {formatCurrency(milestone.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        milestone.status === MilestoneStatus.Completed ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                        milestone.status === MilestoneStatus.InProgress ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                        milestone.status === MilestoneStatus.Overdue ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <FlagIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No milestones defined for this project</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volunteer Impact */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-purple-500" />
                Volunteer Contributions
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalVolunteerHours}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Hours Donated</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(metrics.volunteerValue)}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Estimated Value</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Volunteer time is valued at $25/hour, the industry standard for nonprofit volunteer contributions.
                </p>
              </div>
            </div>

            {/* Financial Impact */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-green-500" />
                Financial Overview
              </h2>
              <div className="space-y-3">
                {project.budget && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Project Budget</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(project.budget)}</span>
                  </div>
                )}
                {project.budgetSpent !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Spent to Date</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(project.budgetSpent)}</span>
                  </div>
                )}
                {project.fundraisingRaised !== undefined && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Funds Raised</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(project.fundraisingRaised)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 dark:text-slate-400">In-Kind Value</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{formatCurrency(metrics.volunteerValue)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Project Updates</h2>
            <div className="space-y-6">
              {/* Timeline of completed tasks as updates */}
              {project.tasks.filter(t => t.status === 'Done').length > 0 ? (
                project.tasks.filter(t => t.status === 'Done').map((task, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      {idx < project.tasks.filter(t => t.status === 'Done').length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h3 className="font-medium text-slate-900 dark:text-white">{task.description}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {task.phase && <span className="text-purple-600 dark:text-purple-400">{task.phase}</span>}
                      </p>
                      {task.notes && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No updates yet. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Powered by Logos Vision CRM</p>
      </div>
    </div>
  );
};

export default DonorPortalView;
