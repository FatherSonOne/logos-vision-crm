import React from 'react';
import type { Client, Donation, Task, Pledge, Page } from '../../types';
import {
    UsersIcon, DonationIcon, CheckSquareIcon, CalendarIcon,
    TrendingUpIcon, PipelineIcon, HandHeartIcon, TargetIcon
} from '../icons';

// Common widget container
interface WidgetProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const Widget: React.FC<WidgetProps> = ({ title, icon, children, action, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden ${className}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
                <span className="text-gray-400 dark:text-gray-500">{icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {action && (
                <button
                    onClick={action.onClick}
                    className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
                >
                    {action.label}
                </button>
            )}
        </div>
        <div className="p-4">
            {children}
        </div>
    </div>
);

// Stat card component
interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'rose' | 'teal';
}

const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400'
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    changeLabel,
    icon,
    color = 'blue'
}) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            {icon && (
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            )}
        </div>
        <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
            {change !== undefined && (
                <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? '+' : ''}{change}%
                    {changeLabel && <span className="text-gray-400 ml-1">{changeLabel}</span>}
                </span>
            )}
        </div>
    </div>
);

// Recent Donations Widget
interface RecentDonationsWidgetProps {
    donations: Donation[];
    clients: Client[];
    onViewAll: () => void;
    onViewDonation?: (id: string) => void;
}

export const RecentDonationsWidget: React.FC<RecentDonationsWidgetProps> = ({
    donations,
    clients,
    onViewAll,
    onViewDonation
}) => {
    const recentDonations = [...donations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    const getClient = (id: string) => clients.find(c => c.id === id);

    return (
        <Widget
            title="Recent Donations"
            icon={<DonationIcon />}
            action={{ label: 'View All', onClick: onViewAll }}
        >
            {recentDonations.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No donations yet</p>
            ) : (
                <div className="space-y-3">
                    {recentDonations.map(donation => {
                        const client = getClient(donation.clientId);
                        return (
                            <button
                                key={donation.id}
                                onClick={() => onViewDonation?.(donation.id)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                                        ${donation.amount >= 1000 ? Math.floor(donation.amount / 1000) + 'k' : donation.amount}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {client?.name || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {donation.campaign || 'General Fund'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        ${donation.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(donation.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </Widget>
    );
};

// Upcoming Tasks Widget
interface UpcomingTasksWidgetProps {
    tasks: Task[];
    onViewAll: () => void;
    onToggleTask?: (id: string) => void;
}

export const UpcomingTasksWidget: React.FC<UpcomingTasksWidgetProps> = ({
    tasks,
    onViewAll,
    onToggleTask
}) => {
    const upcomingTasks = [...tasks]
        .filter(t => t.status !== 'Done' && t.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

    const isOverdue = (date: string) => new Date(date) < new Date();
    const isDueSoon = (date: string) => {
        const due = new Date(date);
        const now = new Date();
        const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    };

    return (
        <Widget
            title="Upcoming Tasks"
            icon={<CheckSquareIcon />}
            action={{ label: 'View All', onClick: onViewAll }}
        >
            {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming tasks</p>
            ) : (
                <div className="space-y-2">
                    {upcomingTasks.map(task => (
                        <div
                            key={task.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        >
                            <button
                                onClick={() => onToggleTask?.(task.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    task.status === 'Done'
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                                }`}
                            >
                                {task.status === 'Done' && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {task.title}
                                </p>
                                {task.assignee && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {task.assignee}
                                    </p>
                                )}
                            </div>
                            {task.dueDate && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    isOverdue(task.dueDate)
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : isDueSoon(task.dueDate)
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                }`}>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Widget>
    );
};

// Pipeline Summary Widget
interface PipelineSummaryWidgetProps {
    onViewPipeline: () => void;
    pipelineStats?: {
        identification: number;
        qualification: number;
        cultivation: number;
        solicitation: number;
        stewardship: number;
        lapsed: number;
        totalPotential: number;
    };
}

export const PipelineSummaryWidget: React.FC<PipelineSummaryWidgetProps> = ({
    onViewPipeline,
    pipelineStats
}) => {
    const stages = [
        { key: 'identification', label: 'Identification', color: 'bg-gray-400' },
        { key: 'qualification', label: 'Qualification', color: 'bg-blue-400' },
        { key: 'cultivation', label: 'Cultivation', color: 'bg-purple-400' },
        { key: 'solicitation', label: 'Solicitation', color: 'bg-orange-400' },
        { key: 'stewardship', label: 'Stewardship', color: 'bg-green-400' },
        { key: 'lapsed', label: 'Lapsed', color: 'bg-red-400' }
    ];

    const stats = pipelineStats || {
        identification: 0,
        qualification: 0,
        cultivation: 0,
        solicitation: 0,
        stewardship: 0,
        lapsed: 0,
        totalPotential: 0
    };

    const total = Object.values(stats).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - stats.totalPotential;

    return (
        <Widget
            title="Donor Pipeline"
            icon={<PipelineIcon />}
            action={{ label: 'View Pipeline', onClick: onViewPipeline }}
        >
            <div className="space-y-3">
                {/* Funnel visualization */}
                <div className="flex items-end gap-1 h-20">
                    {stages.map((stage, index) => {
                        const value = stats[stage.key as keyof typeof stats] as number || 0;
                        const height = total > 0 ? Math.max(10, (value / total) * 100) : 10;
                        return (
                            <div
                                key={stage.key}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div
                                    className={`w-full ${stage.color} rounded-t transition-all duration-300`}
                                    style={{ height: `${height}%` }}
                                    title={`${stage.label}: ${value}`}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {value}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                    {stages.map(stage => (
                        <div key={stage.key} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                            <span className="text-gray-600 dark:text-gray-400 truncate">{stage.label}</span>
                        </div>
                    ))}
                </div>

                {/* Total potential */}
                {stats.totalPotential > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Potential</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                ${stats.totalPotential.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Widget>
    );
};

// Engagement Overview Widget
interface EngagementWidgetProps {
    onViewAnalytics: () => void;
    engagementStats?: {
        highlyEngaged: number;
        engaged: number;
        atRisk: number;
        disengaged: number;
        averageScore: number;
    };
}

export const EngagementWidget: React.FC<EngagementWidgetProps> = ({
    onViewAnalytics,
    engagementStats
}) => {
    const stats = engagementStats || {
        highlyEngaged: 0,
        engaged: 0,
        atRisk: 0,
        disengaged: 0,
        averageScore: 0
    };

    const segments = [
        { key: 'highlyEngaged', label: 'Highly Engaged', color: 'bg-green-500', value: stats.highlyEngaged },
        { key: 'engaged', label: 'Engaged', color: 'bg-blue-500', value: stats.engaged },
        { key: 'atRisk', label: 'At Risk', color: 'bg-yellow-500', value: stats.atRisk },
        { key: 'disengaged', label: 'Disengaged', color: 'bg-red-500', value: stats.disengaged }
    ];

    const total = segments.reduce((sum, s) => sum + s.value, 0);

    return (
        <Widget
            title="Engagement Overview"
            icon={<TrendingUpIcon />}
            action={{ label: 'View Analytics', onClick: onViewAnalytics }}
        >
            <div className="space-y-4">
                {/* Score gauge */}
                <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle
                                className="text-gray-200 dark:text-slate-700"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="48"
                                cy="48"
                            />
                            <circle
                                className="text-rose-500"
                                strokeWidth="8"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="40"
                                cx="48"
                                cy="48"
                                strokeDasharray={`${(stats.averageScore / 100) * 251.2} 251.2`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.averageScore}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Segments */}
                <div className="space-y-2">
                    {segments.map(segment => (
                        <div key={segment.key} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                            <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                                {segment.label}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {segment.value}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({total > 0 ? Math.round((segment.value / total) * 100) : 0}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Widget>
    );
};

// Quick Stats Row
interface QuickStatsProps {
    clients: Client[];
    donations: Donation[];
    tasks: Task[];
    pledges?: Pledge[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({
    clients,
    donations,
    tasks,
    pledges = []
}) => {
    // Calculate stats
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const thisMonthDonations = donations
        .filter(d => {
            const date = new Date(d.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        })
        .reduce((sum, d) => sum + d.amount, 0);

    const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
    const overdueTasks = tasks.filter(t => {
        if (t.status === 'Done' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
    }).length;

    const activePledges = pledges.filter(p => p.status === 'active').length;
    const pledgeTotal = pledges
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + p.totalAmount, 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Total Contacts"
                value={clients.length}
                icon={<UsersIcon />}
                color="blue"
            />
            <StatCard
                label="This Month's Giving"
                value={`$${thisMonthDonations.toLocaleString()}`}
                icon={<DonationIcon />}
                color="green"
            />
            <StatCard
                label="Pending Tasks"
                value={pendingTasks}
                icon={<CheckSquareIcon />}
                color="purple"
                change={overdueTasks > 0 ? undefined : undefined}
                changeLabel={overdueTasks > 0 ? `${overdueTasks} overdue` : undefined}
            />
            <StatCard
                label="Active Pledges"
                value={activePledges}
                icon={<TargetIcon />}
                color="orange"
                changeLabel={`$${pledgeTotal.toLocaleString()} total`}
            />
        </div>
    );
};

