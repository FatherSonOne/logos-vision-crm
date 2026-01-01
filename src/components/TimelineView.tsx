import React, { useMemo } from 'react';
import type { TeamMember, Project, Activity, CalendarEvent } from '../types';

interface ExtendedCalendarEvent extends Omit<CalendarEvent, 'organizer' | 'attendees'> {
    source: 'google' | 'local';
    description?: string;
    location?: string;
    attendees?: string[];
    organizer?: string;
    meetingLink?: string;
}

type TimelineZoom = 'year' | 'month' | 'week' | 'day' | 'hour';

interface TimelineViewProps {
    teamMembers: TeamMember[];
    projects: Project[];
    activities: Activity[];
    events: ExtendedCalendarEvent[];
    viewDate: Date;
    zoom: TimelineZoom;
    onZoomChange: (zoom: TimelineZoom) => void;
    onDateChange: (date: Date) => void;
    selectedTeamMembers: string[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({
    teamMembers,
    projects,
    activities,
    events,
    viewDate,
    zoom,
    onZoomChange,
    onDateChange,
    selectedTeamMembers
}) => {
    const filteredTeamMembers = useMemo(() => {
        return teamMembers.filter(tm => selectedTeamMembers.includes(tm.id));
    }, [teamMembers, selectedTeamMembers]);

    const timeColumns = useMemo(() => {
        const columns: Date[] = [];
        const start = new Date(viewDate);
        
        switch (zoom) {
            case 'year':
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                for (let i = 0; i < 12; i++) {
                    const month = new Date(start);
                    month.setMonth(i);
                    columns.push(month);
                }
                break;
            case 'month':
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
                for (let i = 0; i < daysInMonth; i++) {
                    const day = new Date(start);
                    day.setDate(i + 1);
                    columns.push(day);
                }
                break;
            case 'week':
                const startOfWeek = new Date(start);
                startOfWeek.setDate(start.getDate() - start.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                for (let i = 0; i < 7; i++) {
                    const day = new Date(startOfWeek);
                    day.setDate(startOfWeek.getDate() + i);
                    columns.push(day);
                }
                break;
            case 'day':
                start.setHours(0, 0, 0, 0);
                columns.push(new Date(start));
                break;
            case 'hour':
                start.setHours(0, 0, 0, 0);
                for (let i = 0; i < 24; i++) {
                    const hour = new Date(start);
                    hour.setHours(i);
                    columns.push(hour);
                }
                break;
        }
        return columns;
    }, [viewDate, zoom]);

    const formatColumnHeader = (date: Date): string => {
        switch (zoom) {
            case 'year': return date.toLocaleDateString('en-US', { month: 'short' });
            case 'month': return date.getDate().toString();
            case 'week': return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            case 'day': return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            case 'hour': return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            default: return '';
        }
    };

    const calculateItemPosition = (startDate: Date, endDate: Date) => {
        const timelineStart = timeColumns[0]?.getTime() || Date.now();
        const timelineEnd = timeColumns[timeColumns.length - 1]?.getTime() || Date.now();
        const totalDuration = timelineEnd - timelineStart || 1;
        const itemStart = Math.max(startDate.getTime(), timelineStart);
        const itemEnd = Math.min(endDate.getTime(), timelineEnd);
        const startPercent = ((itemStart - timelineStart) / totalDuration) * 100;
        const widthPercent = ((itemEnd - itemStart) / totalDuration) * 100;
        return {
            left: `${Math.max(0, Math.min(100, startPercent))}%`,
            width: `${Math.max(1, Math.min(100, widthPercent))}%`
        };
    };

    const navigate = (direction: number) => {
        const newDate = new Date(viewDate);
        switch (zoom) {
            case 'year': newDate.setFullYear(newDate.getFullYear() + direction); break;
            case 'month': newDate.setMonth(newDate.getMonth() + direction); break;
            case 'week': newDate.setDate(newDate.getDate() + (direction * 7)); break;
            case 'day':
            case 'hour': newDate.setDate(newDate.getDate() + direction); break;
        }
        onDateChange(newDate);
    };

    const getDateRangeDisplay = (): string => {
        switch (zoom) {
            case 'year': return viewDate.getFullYear().toString();
            case 'month': return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            case 'week':
                const weekStart = timeColumns[0];
                const weekEnd = timeColumns[timeColumns.length - 1];
                if (!weekStart || !weekEnd) return '';
                return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            case 'day':
            case 'hour':
                return viewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            default: return '';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {(['year', 'month', 'week', 'day', 'hour'] as TimelineZoom[]).map(zoomLevel => (
                            <button key={zoomLevel} onClick={() => onZoomChange(zoomLevel)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${zoom === zoomLevel ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                {zoomLevel.charAt(0).toUpperCase() + zoomLevel.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                        <input type="range" min="0" max="4" value={['year', 'month', 'week', 'day', 'hour'].indexOf(zoom)}
                            onChange={(e) => onZoomChange((['year', 'month', 'week', 'day', 'hour'] as TimelineZoom[])[parseInt(e.target.value)])}
                            className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{getDateRangeDisplay()}</h3>
                    <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="min-w-max">
                    <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex">
                            <div className="w-48 flex-shrink-0 p-3 border-r border-slate-200 dark:border-slate-700">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Team Member</span>
                            </div>
                            <div className="flex flex-1">
                                {timeColumns.map((col, idx) => (
                                    <div key={idx} className="flex-1 min-w-[60px] p-2 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatColumnHeader(col)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {filteredTeamMembers.map((member) => {
                        const memberProjects = projects.filter(p => p.teamMemberIds.includes(member.id));
                        const memberActivities = activities.filter(a => a.teamMemberId === member.id);
                        const memberEvents = events.filter(e => e.attendees?.some(email => email.toLowerCase().includes(member.name.toLowerCase().split(' ')[0])));
                        return (
                            <div key={member.id} className="flex border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="w-48 flex-shrink-0 p-3 border-r border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</span>
                                </div>
                                <div className="flex-1 relative min-h-[60px]">
                                    <div className="absolute inset-0 flex">
                                        {timeColumns.map((_, idx) => (
                                            <div key={idx} className="flex-1 min-w-[60px] border-r border-slate-100 dark:border-slate-700/50 last:border-r-0" />
                                        ))}
                                    </div>
                                    {memberProjects.map((project) => {
                                        const pos = calculateItemPosition(new Date(project.startDate), new Date(project.endDate));
                                        return (
                                            <div key={`project-${project.id}`} className="absolute top-1 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded px-2 flex items-center shadow-sm hover:shadow-md transition-all cursor-pointer z-20 timeline-item"
                                                style={{ left: pos.left, width: pos.width }} title={project.name}>
                                                <span className="text-xs font-medium text-white truncate">📁 {project.name}</span>
                                            </div>
                                        );
                                    })}
                                    {memberActivities.map((activity) => {
                                        const startDate = new Date(activity.date);
                                        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
                                        const pos = calculateItemPosition(startDate, endDate);
                                        return (
                                            <div key={`activity-${activity.id}`} className="absolute top-8 h-5 bg-gradient-to-r from-amber-400 to-orange-500 rounded px-2 flex items-center shadow-sm hover:shadow-md transition-all cursor-pointer z-10 timeline-item"
                                                style={{ left: pos.left, width: pos.width }} title={activity.description}>
                                                <span className="text-xs font-medium text-white truncate">📋 {activity.description}</span>
                                            </div>
                                        );
                                    })}
                                    {memberEvents.map((event) => {
                                        const pos = calculateItemPosition(new Date(event.start), new Date(event.end));
                                        return (
                                            <div key={`event-${event.id}`} className="absolute bottom-2 h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded px-2 flex items-center shadow-sm hover:shadow-md transition-all cursor-pointer z-10 timeline-item"
                                                style={{ left: pos.left, width: pos.width }} title={event.title}>
                                                <span className="text-xs font-medium text-white truncate">◆ {event.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    {filteredTeamMembers.length === 0 && (
                        <div className="p-12 text-center">
                            <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-slate-600 dark:text-slate-400">Select team members to view their timeline</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
                        <span className="text-slate-600 dark:text-slate-400">Projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded"></div>
                        <span className="text-slate-600 dark:text-slate-400">Activities</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded"></div>
                        <span className="text-slate-600 dark:text-slate-400">Events</span>
                    </div>
                </div>
            </div>
        </div>
    );
};