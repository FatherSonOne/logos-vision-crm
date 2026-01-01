import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { TeamMember, Project, Activity, CalendarEvent } from '../types';
import { calendarManager } from '../services/calendar';
import { Calendar, ChevronLeft, ChevronRight, Plus, Users, Clock, Bell, Share2, RefreshCw, Video, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CalendarViewProps {
    teamMembers: TeamMember[];
    projects: Project[];
    activities: Activity[];
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

interface GoogleCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  calendarColor?: string;
  organizer?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ teamMembers, projects, activities }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(() => teamMembers.map(tm => tm.id));
    const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
    const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [activeEvent, setActiveEvent] = useState<GoogleCalendarEvent | CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [error, setError] = useState<string>('');

    // Check if Google Calendar is connected
    useEffect(() => {
        const connected = calendarManager.isConnected('google');
        setIsConnected(connected);
        if (connected) {
            syncCalendar();
        } else {
            loadLocalEvents();
        }
    }, []);

    // Load local events from projects, tasks, and activities
    const loadLocalEvents = useCallback(() => {
        const events: CalendarEvent[] = [];
        const colors = [
            { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-800 dark:text-violet-300', border: 'border-violet-300 dark:border-violet-600' },
            { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-600' },
            { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-600' },
            { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-600' },
        ];

        const getColor = (id: string) => colors[teamMembers.findIndex(tm => tm.id === id) % colors.length];

        // Add project events
        projects.forEach(project => {
            project.teamMemberIds.forEach(memberId => {
                events.push({
                    id: `proj-${project.id}-${memberId}`,
                    title: `📁 ${project.name}`,
                    start: new Date(project.startDate),
                    end: new Date(project.endDate),
                    allDay: true,
                    teamMemberId: memberId,
                    color: getColor(memberId),
                    type: 'project',
                });
            });

            // Add task events
            project.tasks.forEach(task => {
                events.push({
                    id: task.id,
                    title: `✓ ${task.description}`,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    allDay: true,
                    teamMemberId: task.teamMemberId,
                    color: getColor(task.teamMemberId),
                    type: 'task',
                });
            });
        });

        // Add activity events
        activities.forEach(activity => {
            const startDate = new Date(activity.activityDate);
            if (activity.activityTime) {
                const [hours, minutes] = activity.activityTime.split(':');
                startDate.setHours(parseInt(hours), parseInt(minutes));
            }

            events.push({
                id: activity.id,
                title: `${activity.type === 'Meeting' ? '📅' : activity.type === 'Call' ? '📞' : '📧'} ${activity.title}`,
                start: startDate,
                end: startDate,
                allDay: !activity.activityTime,
                teamMemberId: activity.createdById,
                color: getColor(activity.createdById),
                type: 'activity',
            });
        });

        setLocalEvents(events);
    }, [projects, activities, teamMembers]);

    // Sync with Google Calendar
    const syncCalendar = async () => {
        if (!isConnected) return;

        setIsSyncing(true);
        setError('');

        try {
            // Get date range (current month ± 1 month)
            const startDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
            const endDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 2, 0);

            // Fetch events from Google Calendar
            const googleCalEvents = await calendarManager.listAllEvents(startDate, endDate);

            // Convert to our format
            const formattedEvents: GoogleCalendarEvent[] = googleCalEvents.map(event => ({
                id: event.id,
                title: event.title,
                start: new Date(event.start),
                end: new Date(event.end),
                allDay: event.allDay || false,
                description: event.description,
                location: event.location,
                attendees: event.attendees?.map(a => a.email),
                calendarColor: event.color || '#4285f4',
                organizer: event.organizer?.email,
            }));

            setGoogleEvents(formattedEvents);
            setLastSync(new Date());
            loadLocalEvents(); // Also load local events
        } catch (err) {
            console.error('Failed to sync calendar:', err);
            setError(err instanceof Error ? err.message : 'Failed to sync calendar');
            // Fallback to local events only
            loadLocalEvents();
        } finally {
            setIsSyncing(false);
        }
    };

    // Auto-sync every 5 minutes
    useEffect(() => {
        if (isConnected) {
            const interval = setInterval(() => {
                syncCalendar();
            }, 5 * 60 * 1000); // 5 minutes

            return () => clearInterval(interval);
        }
    }, [isConnected, viewDate]);

    // Change view date
    const changeView = (offset: number) => {
        setViewDate(current => {
            const newDate = new Date(current);
            if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() + offset);
            } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + (offset * 7));
            } else if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() + offset);
            }
            return newDate;
        });
    };

    const goToToday = () => {
        setViewDate(new Date());
    };

    // Get calendar days for month view
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: Date[] = [];

        // Add previous month's days
        for (let i = 0; i < startingDayOfWeek; i++) {
            const date = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push(date);
        }

        // Add current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        // Add next month's days to complete the grid
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    }, [viewDate]);

    // Get events for a specific day
    const getEventsForDay = (date: Date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Combine Google and local events
        const allEvents = [
            ...googleEvents.map(e => ({ ...e, source: 'google' as const })),
            ...localEvents.filter(e => selectedTeamMembers.includes(e.teamMemberId)).map(e => ({ ...e, source: 'local' as const }))
        ];

        return allEvents.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return eventStart <= dayEnd && eventEnd >= dayStart;
        });
    };

    const handleTeamMemberToggle = (id: string) => {
        setSelectedTeamMembers(prev =>
            prev.includes(id) ? prev.filter(tmId => tmId !== id) : [...prev, id]
        );
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(date);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === viewDate.getMonth();
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-8 h-8 text-rose-500" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Team Calendar
                            </h1>
                        </div>
                        {isConnected && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-green-700 dark:text-green-300">
                                    Google Calendar Synced
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sync Button */}
                        {isConnected && (
                            <button
                                onClick={syncCalendar}
                                disabled={isSyncing}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                                title={lastSync ? `Last synced: ${lastSync.toLocaleTimeString()}` : 'Sync now'}
                            >
                                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Syncing...' : 'Sync'}
                            </button>
                        )}

                        {/* Create Event Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create Event
                        </button>

                        {/* View Mode Selector */}
                        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                        viewMode === mode
                                            ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => changeView(-1)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white min-w-[200px] text-center">
                            {formatDate(viewDate)}
                        </h2>
                        <button
                            onClick={() => changeView(1)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                    </div>

                    {/* Team Member Filter */}
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Team:</span>
                        <div className="flex items-center gap-2">
                            {teamMembers.slice(0, 5).map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => handleTeamMemberToggle(member.id)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                        selectedTeamMembers.includes(member.id)
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                    title={member.name}
                                >
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                </button>
                            ))}
                            {teamMembers.length > 5 && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    +{teamMembers.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">Sync Error</p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 p-6 overflow-auto">
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        {/* Day headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div
                                key={day}
                                className="bg-slate-50 dark:bg-slate-800 p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Calendar days */}
                        {calendarDays.map((date, index) => {
                            const dayEvents = getEventsForDay(date);
                            const isCurrentDay = isToday(date);
                            const isCurrentMonthDay = isCurrentMonth(date);

                            return (
                                <div
                                    key={index}
                                    className={`bg-white dark:bg-slate-900 min-h-[120px] p-2 ${
                                        isCurrentDay ? 'ring-2 ring-rose-500 ring-inset' : ''
                                    } ${!isCurrentMonthDay ? 'opacity-40' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={`text-sm font-medium ${
                                                isCurrentDay
                                                    ? 'w-7 h-7 flex items-center justify-center bg-rose-500 text-white rounded-full'
                                                    : isCurrentMonthDay
                                                    ? 'text-slate-900 dark:text-white'
                                                    : 'text-slate-400 dark:text-slate-600'
                                            }`}
                                        >
                                            {date.getDate()}
                                        </span>
                                        {dayEvents.length > 3 && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                +{dayEvents.length - 3}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                            <button
                                                key={eventIndex}
                                                onClick={() => setActiveEvent(event)}
                                                className="w-full text-left px-2 py-1 text-xs rounded hover:shadow-md transition-shadow"
                                                style={{
                                                    backgroundColor: event.source === 'google'
                                                        ? event.calendarColor + '20'
                                                        : undefined,
                                                    borderLeft: `3px solid ${event.source === 'google' ? event.calendarColor : '#ef4444'}`
                                                }}
                                            >
                                                <div className="font-medium truncate text-slate-900 dark:text-white">
                                                    {event.title}
                                                </div>
                                                {!event.allDay && (
                                                    <div className="text-slate-600 dark:text-slate-400 text-[10px]">
                                                        {new Date(event.start).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Loading State */}
                {isSyncing && (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Syncing with Google Calendar...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
