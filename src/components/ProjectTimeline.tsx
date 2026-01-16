import React, { useMemo } from 'react';
import type { Project, Client } from '../types';
import { ProjectStatus } from '../types';

// --- Date Helpers ---
const addDays = (date: Date, days: number): Date => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };
const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, months: number): Date => { const d = new Date(date); d.setMonth(d.getMonth() + months); return d; };
const differenceInDays = (dateLeft: Date, dateRight: Date): number => Math.round((dateLeft.getTime() - dateRight.getTime()) / (1000 * 60 * 60 * 24));

const statusColors: { [key in ProjectStatus]: { bg: string; border: string } } = {
    [ProjectStatus.Planning]: { bg: 'bg-green-400', border: 'border-green-500' },
    [ProjectStatus.InProgress]: { bg: 'bg-blue-500', border: 'border-blue-600' },
    [ProjectStatus.Completed]: { bg: 'bg-teal-500', border: 'border-teal-600' },
    [ProjectStatus.OnHold]: { bg: 'bg-rose-500', border: 'border-rose-600' },
    [ProjectStatus.Active]: { bg: 'bg-emerald-500', border: 'border-emerald-600' },
    [ProjectStatus.Cancelled]: { bg: 'bg-gray-500', border: 'border-gray-600' },
};

interface ProjectTimelineProps {
  projects: Project[];
  clients: Client[];
  onSelectProject: (id: string) => void;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projects, clients, onSelectProject }) => {
    if (projects.length === 0) {
        return <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500 dark:bg-slate-800 dark:border-slate-700">No projects to display in timeline view.</div>;
    }

    const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
        if (projects.length === 0) {
            const today = new Date();
            return {
                timelineStart: startOfMonth(today),
                timelineEnd: addMonths(startOfMonth(today), 1),
                totalDays: 30,
            };
        }
        const startDates = projects.map(p => new Date(p.startDate));
        const endDates = projects.map(p => new Date(p.endDate));

        const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

        const timelineStart = startOfMonth(minDate);
        const timelineEnd = addDays(new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0), 1);
        const totalDays = differenceInDays(timelineEnd, timelineStart);

        return { timelineStart, timelineEnd, totalDays: totalDays > 0 ? totalDays : 1 };
    }, [projects]);

    // Calculate completion percentage for each project
    const getCompletionPercentage = (project: Project) => {
        if (project.tasks.length === 0) return 0;
        const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
        return (completedTasks / project.tasks.length) * 100;
    };
    
    // Create month headers
    const months = useMemo(() => {
        const monthHeaders = [];
        let currentMonth = startOfMonth(timelineStart);
        while (currentMonth < timelineEnd) {
            const start = currentMonth > timelineStart ? currentMonth : timelineStart;
            let endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
            const end = endOfMonth < timelineEnd ? endOfMonth : timelineEnd;

            const daysInView = differenceInDays(end, start) + 1;
            if (daysInView > 0) {
                monthHeaders.push({
                    name: currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' }),
                    width: (daysInView / totalDays) * 100,
                });
            }
            currentMonth = addMonths(currentMonth, 1);
        }
        return monthHeaders;
    }, [timelineStart, timelineEnd, totalDays]);
    
    const today = new Date();
    const todayPosition = today >= timelineStart && today <= timelineEnd ? (differenceInDays(today, timelineStart) / totalDays) * 100 : null;

    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Unknown Client';

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
                <div className="min-w-[1100px]">
                    {/* Header with month breakdown */}
                    <div className="flex">
                        <div className="w-56 flex-shrink-0"></div>
                        <div className="flex-1 relative flex border-b-2 border-slate-200 dark:border-slate-700 pb-2">
                            {months.map((month, index) => (
                                <div key={index} style={{ width: `${month.width}%` }} className="text-sm text-center font-semibold text-slate-500 dark:text-slate-400">
                                    {month.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Body with project rows */}
                    <div className="relative mt-4">
                        {todayPosition !== null && (
                            <div className="absolute top-0 bottom-0 z-10" style={{ left: `calc(14rem + ${todayPosition}%)` }}>
                                <div className="w-0.5 h-full bg-violet-500"></div>
                                <div className="absolute -top-6 -translate-x-1/2 text-xs bg-violet-500 text-white px-1.5 py-0.5 rounded-full">Today</div>
                            </div>
                        )}
                        {projects.map((project, index) => {
                            const projectStart = new Date(project.startDate);
                            const projectEnd = new Date(project.endDate);

                            if (projectEnd < timelineStart || projectStart > timelineEnd) return null;

                            const offsetDays = Math.max(0, differenceInDays(projectStart, timelineStart));
                            const durationDays = Math.max(1, differenceInDays(projectEnd, projectStart) + 1);

                            const left = (offsetDays / totalDays) * 100;
                            const width = (durationDays / totalDays) * 100;

                            const projectColors = statusColors[project.status] || statusColors[ProjectStatus.InProgress];
                            const completion = getCompletionPercentage(project);

                            // Calculate if project is overdue
                            const isOverdue = new Date(project.endDate) < today && project.status !== ProjectStatus.Completed;

                            return (
                                <div
                                    key={project.id}
                                    className={`flex items-center h-14 group relative hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                                        index > 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''
                                    }`}
                                >
                                    {/* Project Name Column */}
                                    <div className="w-56 flex-shrink-0 pr-4">
                                        <button
                                            onClick={() => onSelectProject(project.id)}
                                            className="w-full text-left group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
                                        >
                                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                {getClientName(project.clientId)}
                                            </p>
                                        </button>
                                    </div>

                                    {/* Timeline Bar Column */}
                                    <div className="flex-1 relative h-full">
                                        <div className="absolute top-1/2 -translate-y-1/2 h-10 w-full">
                                            <div
                                                className={`absolute h-full rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all ${
                                                    isOverdue ? 'ring-2 ring-red-500' : ''
                                                }`}
                                                style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                                                onClick={() => onSelectProject(project.id)}
                                            >
                                                {/* Background */}
                                                <div className={`absolute inset-0 ${projectColors.bg} opacity-30`}></div>

                                                {/* Progress Bar */}
                                                <div
                                                    className={`absolute inset-0 ${projectColors.bg} transition-all duration-300`}
                                                    style={{ width: `${completion}%` }}
                                                ></div>

                                                {/* Border */}
                                                <div className={`absolute inset-0 border-2 ${projectColors.border} rounded-lg pointer-events-none`}></div>

                                                {/* Content */}
                                                <div className="absolute inset-0 flex items-center px-2 z-10">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-xs font-bold text-white drop-shadow-md truncate">
                                                            {Math.round(completion)}%
                                                        </span>
                                                        {isOverdue && (
                                                            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Enhanced Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-sm p-3 bg-slate-800 text-white text-xs rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 border border-slate-600 dark:bg-slate-900 dark:border-slate-500">
                                                    <div className="space-y-1.5">
                                                        <p className="font-bold text-sm">{project.name}</p>
                                                        <div className="flex items-center gap-2 pt-1 border-t border-slate-600">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${projectColors.bg} border ${projectColors.border}`}>
                                                                {project.status}
                                                            </span>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="text-slate-300">{Math.round(completion)}% complete</span>
                                                        </div>
                                                        <p className="text-slate-300">
                                                            <span className="font-medium">Client:</span> {getClientName(project.clientId)}
                                                        </p>
                                                        <p className="text-slate-300">
                                                            <span className="font-medium">Duration:</span> {projectStart.toLocaleDateString()} → {projectEnd.toLocaleDateString()}
                                                        </p>
                                                        <p className="text-slate-300">
                                                            <span className="font-medium">Tasks:</span> {project.tasks.filter(t => t.status === 'Done').length} / {project.tasks.length} completed
                                                        </p>
                                                        {isOverdue && (
                                                            <p className="text-red-400 font-medium pt-1 border-t border-slate-600">
                                                                ⚠️ Project is overdue
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
