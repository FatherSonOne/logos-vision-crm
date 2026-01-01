import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { TeamMember, Project, Activity, CalendarEvent } from '../types';
import { calendarManager } from '../services/calendar';
import { EnhancedCalendarEvent } from './calendar/EnhancedCalendarEvent';
import { LivingTimeline } from './calendar/LivingTimeline';
import { detectEventType } from './calendar/EventTypeIndicator';
import type { EventType } from './calendar/EventTypeIndicator';
import { CalendarSettings } from './CalendarSettings';

interface CalendarViewProps {
    teamMembers: TeamMember[];
    projects: Project[];
    activities: Activity[];
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'timeline';

type TimelineZoom = 'year' | 'month' | 'week' | 'day' | 'hour';

interface EventColor {
    bg: string;
    text: string;
    border: string;
}

interface ExtendedCalendarEvent extends Omit<CalendarEvent, 'color' | 'provider' | 'calendarId' | 'organizer' | 'attendees'> {
    source: 'google' | 'outlook' | 'local';
    description?: string;
    location?: string;
    attendees?: string[];
    organizer?: string;
    meetingLink?: string;
    recurrence?: string;
    reminder?: number;
    color?: EventColor;
    status?: 'confirmed' | 'tentative' | 'cancelled';
}

interface NewEvent {
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    allDay: boolean;
    description: string;
    location: string;
    attendees: string[];
    calendarId?: string;
    color: string;
    reminder: number;
    recurrence: string;
}

// Sample calendar events for demonstration
const sampleCalendarEvents: ExtendedCalendarEvent[] = [
    {
        id: 'evt-1',
        title: 'Board Meeting - Q4 Review',
        start: new Date(new Date().setHours(9, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 0, 0, 0)),
        allDay: false,
        teamMemberId: '1',
        color: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
        type: 'activity',
        source: 'local',
        description: 'Quarterly board meeting to review organizational performance',
        location: 'Conference Room A',
        attendees: ['sarah@logosvision.org', 'michael@logosvision.org'],
        reminder: 30,
    },
    {
        id: 'evt-2',
        title: 'Hope Harbor Foundation - Strategy Call',
        start: new Date(new Date().setDate(new Date().getDate() + 1)),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
        allDay: false,
        teamMemberId: '2',
        color: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
        type: 'activity',
        source: 'local',
        description: 'Strategic planning session with Hope Harbor leadership',
        location: 'Zoom Meeting',
        meetingLink: 'https://zoom.us/j/123456789',
        reminder: 15,
    },
    {
        id: 'evt-3',
        title: 'Grant Deadline - Federal Application',
        start: new Date(new Date().setDate(new Date().getDate() + 3)),
        end: new Date(new Date().setDate(new Date().getDate() + 3)),
        allDay: true,
        teamMemberId: '1',
        color: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
        type: 'task',
        source: 'local',
        description: 'Submit federal grant application for community programs',
        reminder: 1440, // 1 day
    },
    {
        id: 'evt-4',
        title: 'Team Building Workshop',
        start: new Date(new Date().setDate(new Date().getDate() + 5)),
        end: new Date(new Date().setDate(new Date().getDate() + 5)),
        allDay: false,
        teamMemberId: '3',
        color: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
        type: 'activity',
        source: 'local',
        description: 'Annual team building and professional development workshop',
        location: 'Retreat Center',
        attendees: ['team@logosvision.org'],
        reminder: 60,
    },
    {
        id: 'evt-5',
        title: 'Client Onboarding - New Nonprofit',
        start: new Date(new Date().setDate(new Date().getDate() + 2)),
        end: new Date(new Date().setDate(new Date().getDate() + 2)),
        allDay: false,
        teamMemberId: '2',
        color: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
        type: 'activity',
        source: 'local',
        description: 'Initial onboarding session for new consulting client',
        location: 'Virtual',
        reminder: 30,
    },
    {
        id: 'evt-6',
        title: 'Monthly Donor Report Due',
        start: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        allDay: true,
        teamMemberId: '1',
        color: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
        type: 'task',
        source: 'local',
        description: 'Compile and send monthly donor impact report',
        reminder: 2880, // 2 days
    },
    {
        id: 'evt-7',
        title: 'Fundraising Gala Planning',
        start: new Date(new Date().setDate(new Date().getDate() + 7)),
        end: new Date(new Date().setDate(new Date().getDate() + 7)),
        allDay: false,
        teamMemberId: '4',
        color: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
        type: 'activity',
        source: 'local',
        description: 'Committee meeting to plan annual fundraising gala',
        location: 'Main Office',
        attendees: ['events@logosvision.org', 'development@logosvision.org'],
        reminder: 60,
    },
    {
        id: 'evt-8',
        title: 'Volunteer Orientation',
        start: new Date(new Date().setDate(new Date().getDate() + 4)),
        end: new Date(new Date().setDate(new Date().getDate() + 4)),
        allDay: false,
        teamMemberId: '3',
        color: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
        type: 'activity',
        source: 'local',
        description: 'New volunteer orientation and training session',
        location: 'Training Room',
        reminder: 30,
    },
    {
        id: 'evt-9',
        title: 'Impact Assessment Review',
        start: new Date(new Date().setDate(new Date().getDate() + 6)),
        end: new Date(new Date().setDate(new Date().getDate() + 6)),
        allDay: false,
        teamMemberId: '1',
        color: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
        type: 'activity',
        source: 'local',
        description: 'Review quarterly impact assessment metrics',
        location: 'Conference Room B',
        reminder: 15,
    },
    {
        id: 'evt-10',
        title: 'Partner Meeting - Community Foundation',
        start: new Date(new Date().setDate(new Date().getDate() + 8)),
        end: new Date(new Date().setDate(new Date().getDate() + 8)),
        allDay: false,
        teamMemberId: '2',
        color: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
        type: 'activity',
        source: 'local',
        description: 'Quarterly partnership review with Community Foundation',
        location: 'Partner Office',
        reminder: 60,
    },
];

// Event colors for creating new events
const eventColors = [
    { name: 'Rose', value: '#f43f5e', bg: 'bg-rose-500' },
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Green', value: '#22c55e', bg: 'bg-green-500' },
    { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500' },
    { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500' },
];

export const CalendarView: React.FC<CalendarViewProps> = ({ teamMembers, projects, activities }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(() => teamMembers.map(tm => tm.id));
    const [events, setEvents] = useState<ExtendedCalendarEvent[]>(sampleCalendarEvents);
    const [isConnected, setIsConnected] = useState(false);
    const [isOutlookConnected, setIsOutlookConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [activeEvent, setActiveEvent] = useState<ExtendedCalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Timeline view state
    const [timelineZoom, setTimelineZoom] = useState<TimelineZoom>('week');
    const [showTimeline, setShowTimeline] = useState(false);
    const [timelinePins, setTimelinePins] = useState<Array<{
        id: string;
        date: Date;
        title: string;
        color: string;
        userId: string;
        userName: string;
    }>>([]);

    // Filter states
    const [filterSource, setFilterSource] = useState<'all' | 'google' | 'outlook' | 'local'>('all');
    const [filterType, setFilterType] = useState<'all' | 'meeting' | 'task' | 'event'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // New event form state
    const [newEvent, setNewEvent] = useState<NewEvent>({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '10:00',
        allDay: false,
        description: '',
        location: '',
        attendees: [],
        calendarId: 'primary',
        color: '#f43f5e',
        reminder: 15,
        recurrence: 'none',
    });

    // Team scheduling state
    const [scheduleStartDate, setScheduleStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduleEndDate, setScheduleEndDate] = useState(() => {
        const end = new Date();
        end.setDate(end.getDate() + 7);
        return end.toISOString().split('T')[0];
    });
    const [scheduleDuration, setScheduleDuration] = useState(60);
    const [freeSlots, setFreeSlots] = useState<Array<{ start: Date; end: Date }>>([]);
    const [isFindingSlots, setIsFindingSlots] = useState(false);

    // Check if Google Calendar is connected
    useEffect(() => {
        const connected = calendarManager.isConnected('google');
        setIsConnected(connected);
        if (connected) {
            syncCalendar();
        } else {
            setEvents([...sampleCalendarEvents, ...loadLocalEvents()]);
        }
    }, []);

    // Load local events from projects, tasks, and activities
    const loadLocalEvents = useCallback(() => {
        const localEvents: ExtendedCalendarEvent[] = [];
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
                localEvents.push({
                    id: `proj-${project.id}-${memberId}`,
                    title: `📁 ${project.name}`,
                    start: new Date(project.startDate),
                    end: new Date(project.endDate),
                    allDay: true,
                    teamMemberId: memberId,
                    color: getColor(memberId),
                    type: 'project',
                    source: 'local',
                });
            });

            // Add task events
            project.tasks.forEach(task => {
                localEvents.push({
                    id: task.id,
                    title: `✓ ${task.description}`,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    allDay: true,
                    teamMemberId: task.teamMemberId,
                    color: getColor(task.teamMemberId),
                    type: 'task',
                    source: 'local',
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

            localEvents.push({
                id: activity.id,
                title: `${activity.type === 'Meeting' ? '📅' : activity.type === 'Call' ? '📞' : '📧'} ${activity.title}`,
                start: startDate,
                end: startDate,
                allDay: !activity.activityTime,
                teamMemberId: activity.createdById,
                color: getColor(activity.createdById),
                type: 'activity',
                source: 'local',
            });
        });

        return localEvents;
    }, [projects, activities, teamMembers]);

    // Helper function to get default titles for event types
    const getDefaultTitleForType = (type: EventType): string => {
        const titles = {
            project: 'New Project',
            activity: 'New Activity',
            meeting: 'Team Meeting',
            call: 'Phone Call',
            event: 'New Event',
            milestone: 'Project Milestone',
            deadline: 'Important Deadline',
            note: 'Reminder',
            urgent: 'Urgent Task',
            'task-complete': 'Completed Task',
            'task-deadline': 'Task Deadline'
        };
        return titles[type] || 'New Event';
    };

    // Sync with Google Calendar
    const syncCalendar = async () => {
        setIsSyncing(true);
        setError('');

        try {
            const startDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 2, 1);
            const endDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 3, 0);

            let allEvents: ExtendedCalendarEvent[] = [...sampleCalendarEvents];

            if (calendarManager.isConnected('google')) {
                try {
                    const googleCalEvents = await calendarManager.listAllEvents(startDate, endDate);

                    const formattedGoogleEvents: ExtendedCalendarEvent[] = googleCalEvents.map(event => ({
                        id: `google-${event.id}`,
                        title: event.title,
                        start: new Date(event.start),
                        end: new Date(event.end),
                        allDay: event.allDay || false,
                        description: event.description,
                        location: event.location,
                        attendees: event.attendees?.map(a => a.email),
                        organizer: event.organizer?.email,
                        meetingLink: event.hangoutLink,
                        teamMemberId: '',
                        color: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-600' },
                        type: 'activity',
                        source: 'google',
                    }));

                    allEvents = [...allEvents, ...formattedGoogleEvents];
                    setLastSync(new Date());
                    setIsConnected(true);
                } catch (err) {
                    console.error('Google Calendar sync error:', err);
                    setError('Failed to sync with Google Calendar');
                }
            }

            const localEvents = loadLocalEvents();
            allEvents = [...allEvents, ...localEvents];

            setEvents(allEvents);
        } catch (err) {
            console.error('Calendar sync error:', err);
            setError(err instanceof Error ? err.message : 'Failed to sync calendar');
            setEvents([...sampleCalendarEvents, ...loadLocalEvents()]);
        } finally {
            setIsSyncing(false);
        }
    };

    // Create new event
    const handleCreateEvent = async () => {
        if (!newEvent.title.trim()) {
            setError('Please enter an event title');
            return;
        }

        setIsCreatingEvent(true);
        setError('');

        try {
            const startDateTime = newEvent.allDay
                ? new Date(newEvent.startDate)
                : new Date(`${newEvent.startDate}T${newEvent.startTime}`);

            const endDateTime = newEvent.allDay
                ? new Date(newEvent.endDate)
                : new Date(`${newEvent.endDate}T${newEvent.endTime}`);

            // Create local event
            const newLocalEvent: ExtendedCalendarEvent = {
                id: `local-${Date.now()}`,
                title: newEvent.title,
                start: startDateTime,
                end: endDateTime,
                allDay: newEvent.allDay,
                description: newEvent.description,
                location: newEvent.location,
                attendees: newEvent.attendees,
                teamMemberId: '',
                color: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
                type: 'activity',
                source: 'local',
                reminder: newEvent.reminder,
            };

            setEvents(prev => [...prev, newLocalEvent]);

            // If connected to Google, also create there
            if (isConnected) {
                try {
                    await calendarManager.createEvent('google', {
                        calendarId: newEvent.calendarId || 'primary',
                        title: newEvent.title,
                        description: newEvent.description,
                        location: newEvent.location,
                        start: startDateTime.toISOString(),
                        end: endDateTime.toISOString(),
                        allDay: newEvent.allDay,
                        attendees: newEvent.attendees.map(email => ({ email })),
                    });
                } catch (err) {
                    console.warn('Could not sync to Google Calendar:', err);
                }
            }

            setSuccessMessage('Event created successfully!');
            setShowCreateModal(false);
            setNewEvent({
                title: '',
                startDate: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endDate: new Date().toISOString().split('T')[0],
                endTime: '10:00',
                allDay: false,
                description: '',
                location: '',
                attendees: [],
                calendarId: 'primary',
                color: '#f43f5e',
                reminder: 15,
                recurrence: 'none',
            });

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error creating event:', err);
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setIsCreatingEvent(false);
        }
    };

    // Delete event
    const handleDeleteEvent = (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setShowEventModal(false);
        setActiveEvent(null);
        setSuccessMessage('Event deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // Find free time slots for team scheduling
    const findFreeTimeSlots = async () => {
        setIsFindingSlots(true);
        setError('');
        setFreeSlots([]);

        try {
            const start = new Date(scheduleStartDate + 'T00:00:00');
            const end = new Date(scheduleEndDate + 'T23:59:59');

            const busyTimes: Array<{ start: Date; end: Date }> = [];

            const rangeEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return eventStart <= end && eventEnd >= start;
            });

            rangeEvents.forEach(event => {
                busyTimes.push({
                    start: new Date(event.start),
                    end: new Date(event.end),
                });
            });

            busyTimes.sort((a, b) => a.start.getTime() - b.start.getTime());

            const slots: Array<{ start: Date; end: Date }> = [];
            const currentDate = new Date(start);

            while (currentDate <= end) {
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    currentDate.setDate(currentDate.getDate() + 1);
                    continue;
                }

                for (let hour = 9; hour < 17; hour++) {
                    const slotStart = new Date(currentDate);
                    slotStart.setHours(hour, 0, 0, 0);

                    const slotEnd = new Date(slotStart);
                    slotEnd.setMinutes(slotEnd.getMinutes() + scheduleDuration);

                    const isFree = !busyTimes.some(busy => {
                        return slotStart < busy.end && slotEnd > busy.start;
                    });

                    if (isFree && slotEnd.getHours() <= 17) {
                        slots.push({ start: slotStart, end: slotEnd });
                    }
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            setFreeSlots(slots.slice(0, 20));
        } catch (err) {
            console.error('Error finding free slots:', err);
            setError(err instanceof Error ? err.message : 'Failed to find free time slots');
        } finally {
            setIsFindingSlots(false);
        }
    };

    // Schedule meeting in a free slot
    const scheduleInSlot = (slot: { start: Date; end: Date }) => {
        setNewEvent({
            ...newEvent,
            startDate: slot.start.toISOString().split('T')[0],
            startTime: slot.start.toTimeString().slice(0, 5),
            endDate: slot.end.toISOString().split('T')[0],
            endTime: slot.end.toTimeString().slice(0, 5),
        });
        setShowScheduleModal(false);
        setShowCreateModal(true);
    };

    // Auto-sync every 5 minutes
    useEffect(() => {
        if (isConnected) {
            const interval = setInterval(() => {
                syncCalendar();
            }, 5 * 60 * 1000);

            return () => clearInterval(interval);
        }
    }, [isConnected, viewDate]);

    // Sync when view date changes
    useEffect(() => {
        if (isConnected) {
            syncCalendar();
        } else {
            setEvents([...sampleCalendarEvents, ...loadLocalEvents()]);
        }
    }, [viewDate, isConnected]);

    const changeView = (offset: number) => {
        setViewDate(current => {
            const newDate = new Date(current);
            if (viewMode === 'month') {
                newDate.setMonth(newDate.getMonth() + offset);
            } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + (offset * 7));
            } else if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() + offset);
            } else if (viewMode === 'agenda') {
                newDate.setDate(newDate.getDate() + (offset * 7));
            }
            return newDate;
        });
    };

    const goToToday = () => {
        setViewDate(new Date());
    };

    const goToDate = (date: Date) => {
        setViewDate(date);
    };

    // Generate calendar days for month view
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: Date[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            const date = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push(date);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    }, [viewDate]);

    // Generate mini calendar days
    const miniCalendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [viewDate]);

    // Get week days for week view
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(viewDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    }, [viewDate]);

    // Get hours for day/week view
    const hours = useMemo(() => {
        const hrs: number[] = [];
        for (let i = 0; i < 24; i++) {
            hrs.push(i);
        }
        return hrs;
    }, []);

    // Get agenda events (next 14 days)
    const agendaEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 14);

        return events
            .filter(event => {
                const eventStart = new Date(event.start);
                return eventStart >= today && eventStart <= endDate;
            })
            .filter(event => {
                if (filterSource !== 'all' && event.source !== filterSource) return false;
                if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events, filterSource, searchQuery]);

    // Group agenda events by date
    const groupedAgendaEvents = useMemo(() => {
        const groups: { [key: string]: ExtendedCalendarEvent[] } = {};
        agendaEvents.forEach(event => {
            const dateKey = new Date(event.start).toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(event);
        });
        return groups;
    }, [agendaEvents]);

    const getEventsForDay = (date: Date) => {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        return events.filter(event => {
            if (event.source === 'local' && event.teamMemberId && !selectedTeamMembers.includes(event.teamMemberId)) {
                return false;
            }
            if (filterSource !== 'all' && event.source !== filterSource) return false;
            if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return eventStart <= dayEnd && eventEnd >= dayStart;
        }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    };

    const getEventsForHour = (date: Date, hour: number) => {
        const hourStart = new Date(date);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(date);
        hourEnd.setHours(hour, 59, 59, 999);

        return events.filter(event => {
            if (event.allDay) return false;
            if (event.source === 'local' && event.teamMemberId && !selectedTeamMembers.includes(event.teamMemberId)) {
                return false;
            }
            if (filterSource !== 'all' && event.source !== filterSource) return false;

            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            return eventStart <= hourEnd && eventEnd >= hourStart;
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

    const formatWeekRange = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const formatDayDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
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

    const hasEventsOnDay = (date: Date) => {
        return getEventsForDay(date).length > 0;
    };

    // View mode icons
    const viewModeIcons: Record<ViewMode, React.ReactNode> = {
        month: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        week: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        day: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        agenda: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        ),
        timeline: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    };

    return (
        <div className="h-full flex bg-white dark:bg-slate-900">
            {/* Sidebar - Mini Calendar & Filters */}
            {showSidebar && (
                <div className="w-72 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800/50">
                    {/* Create Event Button */}
                    <div className="p-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Event
                        </button>
                    </div>

                    {/* Mini Calendar */}
                    <div className="px-4 pb-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            {/* Mini Calendar Header */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    onClick={() => {
                                        const newDate = new Date(viewDate);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setViewDate(newDate);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => {
                                        const newDate = new Date(viewDate);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        setViewDate(newDate);
                                    }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Mini Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <div key={i} className="text-xs font-medium text-slate-500 dark:text-slate-400 py-1">
                                        {day}
                                    </div>
                                ))}
                                {miniCalendarDays.map((date, i) => (
                                    <button
                                        key={i}
                                        onClick={() => date && goToDate(date)}
                                        disabled={!date}
                                        className={`
                                            w-7 h-7 text-xs rounded-full transition-all relative
                                            ${!date ? 'invisible' : ''}
                                            ${date && isToday(date)
                                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold'
                                                : date && isCurrentMonth(date)
                                                ? 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                                                : 'text-slate-400 dark:text-slate-600'
                                            }
                                        `}
                                    >
                                        {date?.getDate()}
                                        {date && hasEventsOnDay(date) && !isToday(date) && (
                                            <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="px-4 pb-4 space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Source Filter */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Calendars
                            </h4>
                            <div className="space-y-1">
                                {[
                                    { value: 'all', label: 'All Calendars', icon: '📅', color: 'text-slate-600' },
                                    { value: 'local', label: 'Local Events', icon: '💼', color: 'text-rose-600' },
                                    { value: 'google', label: 'Google Calendar', icon: '🔵', color: 'text-blue-600' },
                                    { value: 'outlook', label: 'Outlook Calendar', icon: '🟦', color: 'text-indigo-600' },
                                ].map(source => (
                                    <button
                                        key={source.value}
                                        onClick={() => setFilterSource(source.value as any)}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                            filterSource === source.value
                                                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                                                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        <span>{source.icon}</span>
                                        <span>{source.label}</span>
                                        {filterSource === source.value && (
                                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Team Members */}
                        <div>
                            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Team Members
                            </h4>
                            <div className="space-y-1">
                                {teamMembers.slice(0, 6).map(member => {
                                    const isSelected = selectedTeamMembers.includes(member.id);
                                    return (
                                        <button
                                            key={member.id}
                                            onClick={() => handleTeamMemberToggle(member.id)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                                isSelected
                                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                                isSelected
                                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                                                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                                            }`}>
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="truncate">{member.name}</span>
                                            {isSelected && (
                                                <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="space-y-2">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                isConnected
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`} />
                                <span className="text-xs font-medium">
                                    {isConnected ? 'Google Connected' : 'Google Not Connected'}
                                </span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                isOutlookConnected
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                                <span className={`w-2 h-2 rounded-full ${isOutlookConnected ? 'bg-blue-500' : 'bg-slate-400'}`} />
                                <span className="text-xs font-medium">
                                    {isOutlookConnected ? 'Outlook Connected' : 'Outlook Not Connected'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Toggle sidebar & Navigation */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </button>

                            <button
                                onClick={() => changeView(-1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white min-w-[200px]">
                                {viewMode === 'month' && formatDate(viewDate)}
                                {viewMode === 'week' && formatWeekRange(viewDate)}
                                {viewMode === 'day' && formatDayDate(viewDate)}
                                {viewMode === 'agenda' && 'Upcoming Events'}
                                {viewMode === 'timeline' && formatDate(viewDate)}
                            </h2>

                            <button
                                onClick={() => changeView(1)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
                            >
                                Today
                            </button>
                        </div>

                        {/* Right: View selector & Actions */}
                        <div className="flex items-center gap-3">
                            {/* View Mode Selector */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                {(['month', 'week', 'day', 'agenda', 'timeline'] as ViewMode[]).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => mode === 'timeline' ? setShowTimeline(true) : setViewMode(mode)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                            (mode === 'timeline' ? showTimeline : viewMode === mode)
                                                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {viewModeIcons[mode]}
                                        <span className="hidden lg:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Sync Button */}
                            {isConnected && (
                                <button
                                    onClick={syncCalendar}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                    title={lastSync ? `Last synced: ${lastSync.toLocaleTimeString()}` : 'Sync now'}
                                >
                                    <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            )}

                            {/* Find Team Time */}
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="hidden md:inline">Find Time</span>
                            </button>

                            {/* Settings */}
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    )}
                </div>

                {/* Calendar Views */}
                <div className="flex-1 p-4 overflow-auto">
                    {/* MONTH VIEW */}
                    {viewMode === 'month' && (
                        <div className="h-full">
                            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-full">
                                {/* Day headers */}
                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                    <div key={day} className="bg-slate-50 dark:bg-slate-800 p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                                        <span className="hidden lg:inline">{day}</span>
                                        <span className="lg:hidden">{day.slice(0, 3)}</span>
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
                                            className={`bg-white dark:bg-slate-900 min-h-[100px] p-2 relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                isCurrentDay ? 'ring-2 ring-rose-500 ring-inset' : ''
                                            } ${!isCurrentMonthDay ? 'opacity-40' : ''}`}
                                            onClick={() => {
                                                setViewDate(date);
                                                setViewMode('day');
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm font-medium ${
                                                    isCurrentDay
                                                        ? 'w-7 h-7 flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full'
                                                        : isCurrentMonthDay
                                                        ? 'text-slate-900 dark:text-white'
                                                        : 'text-slate-400 dark:text-slate-600'
                                                }`}>
                                                    {date.getDate()}
                                                </span>
                                                {dayEvents.length > 3 && (
                                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        +{dayEvents.length - 3}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                                    <EnhancedCalendarEvent
                                                        key={eventIndex}
                                                        event={{
                                                            id: event.id,
                                                            title: event.title,
                                                            start: event.start,
                                                            end: event.end,
                                                            allDay: event.allDay,
                                                            description: event.description,
                                                            location: event.location,
                                                            attendees: event.attendees,
                                                            type: detectEventType(event.title, event.description)
                                                        }}
                                                        onClick={() => {
                                                            setActiveEvent(event);
                                                            setShowEventModal(true);
                                                        }}
                                                        className="mb-1"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* WEEK VIEW */}
                    {viewMode === 'week' && (
                        <div className="h-full flex flex-col">
                            <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-t-lg overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-800 p-2 text-center"></div>
                                {weekDays.map((day, idx) => {
                                    const isCurrentDay = isToday(day);
                                    return (
                                        <div key={idx} className={`bg-slate-50 dark:bg-slate-800 p-2 text-center ${isCurrentDay ? 'bg-rose-50 dark:bg-rose-900/20' : ''}`}>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className={`text-lg font-semibold ${isCurrentDay ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                                {day.getDate()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex-1 overflow-auto">
                                <div className="grid grid-cols-8 gap-px bg-slate-200 dark:bg-slate-700">
                                    {hours.slice(6, 20).map(hour => (
                                        <React.Fragment key={hour}>
                                            <div className="bg-slate-50 dark:bg-slate-800 p-2 text-xs text-slate-500 dark:text-slate-400 text-right border-r border-slate-200 dark:border-slate-700 w-16">
                                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                            </div>
                                            {weekDays.map((day, dayIdx) => {
                                                const hourEvents = getEventsForHour(day, hour);
                                                return (
                                                    <div
                                                        key={dayIdx}
                                                        className="bg-white dark:bg-slate-900 p-1 min-h-[50px] relative border-r border-slate-200 dark:border-slate-700"
                                                    >
                                                        {hourEvents.map((event, eventIdx) => (
                                                            <EnhancedCalendarEvent
                                                                key={eventIdx}
                                                                event={{
                                                                    id: event.id,
                                                                    title: event.title,
                                                                    start: event.start,
                                                                    end: event.end,
                                                                    allDay: event.allDay,
                                                                    description: event.description,
                                                                    location: event.location,
                                                                    attendees: event.attendees,
                                                                    type: detectEventType(event.title, event.description)
                                                                }}
                                                                onClick={() => {
                                                                    setActiveEvent(event);
                                                                    setShowEventModal(true);
                                                                }}
                                                                className="mb-1"
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DAY VIEW */}
                    {viewMode === 'day' && (
                        <div className="h-full">
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                {hours.slice(6, 22).map(hour => {
                                    const hourEvents = getEventsForHour(viewDate, hour);
                                    const now = new Date();
                                    const isCurrentHour = isToday(viewDate) && now.getHours() === hour;

                                    return (
                                        <div key={hour} className={`grid grid-cols-12 border-b border-slate-200 dark:border-slate-700 last:border-b-0 ${isCurrentHour ? 'bg-rose-50 dark:bg-rose-900/10' : ''}`}>
                                            <div className="col-span-1 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-500 dark:text-slate-400 text-right border-r border-slate-200 dark:border-slate-700">
                                                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                            </div>
                                            <div className="col-span-11 bg-white dark:bg-slate-900 p-2 min-h-[70px] relative">
                                                {isCurrentHour && (
                                                    <div className="absolute left-0 right-0 h-0.5 bg-rose-500" style={{ top: `${(now.getMinutes() / 60) * 100}%` }} />
                                                )}
                                                <div className="flex flex-wrap gap-2">
                                                    {hourEvents.map((event, eventIdx) => (
                                                        <EnhancedCalendarEvent
                                                            key={eventIdx}
                                                            event={{
                                                                id: event.id,
                                                                title: event.title,
                                                                start: event.start,
                                                                end: event.end,
                                                                allDay: event.allDay,
                                                                description: event.description,
                                                                location: event.location,
                                                                attendees: event.attendees,
                                                                type: detectEventType(event.title, event.description)
                                                            }}
                                                            onClick={() => {
                                                                setActiveEvent(event);
                                                                setShowEventModal(true);
                                                            }}
                                                            className="flex-1 min-w-[200px]"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* AGENDA VIEW */}
                    {viewMode === 'agenda' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            {Object.keys(groupedAgendaEvents).length === 0 ? (
                                <div className="text-center py-16">
                                    <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No upcoming events</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Your calendar is clear for the next 2 weeks</p>
                                </div>
                            ) : (
                                Object.entries(groupedAgendaEvents).map(([dateKey, dayEvents]) => {
                                    const date = new Date(dateKey);
                                    const isEventToday = isToday(date);

                                    return (
                                        <div key={dateKey} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            {/* Date Header */}
                                            <div className={`px-6 py-3 border-b border-slate-200 dark:border-slate-700 ${
                                                isEventToday ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-slate-50 dark:bg-slate-800/50'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className={`font-semibold ${isEventToday ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                            {isEventToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                        </h3>
                                                        <p className={`text-sm ${isEventToday ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                                        isEventToday
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Events */}
                                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {dayEvents.map((event, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setActiveEvent(event);
                                                            setShowEventModal(true);
                                                        }}
                                                        className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Time */}
                                                            <div className="flex-shrink-0 w-20 text-right">
                                                                {event.allDay ? (
                                                                    <span className="text-sm font-medium text-rose-600 dark:text-rose-400">All Day</span>
                                                                ) : (
                                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                        {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Event Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                                                    {event.title}
                                                                </h4>
                                                                {event.location && (
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                        </svg>
                                                                        {event.location}
                                                                    </p>
                                                                )}
                                                                {event.description && (
                                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                                        {event.description}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Source Badge */}
                                                            <div className="flex-shrink-0">
                                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                                    event.source === 'google'
                                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                        : event.source === 'outlook'
                                                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                                }`}>
                                                                    {event.source}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Loading State */}
                    {isSyncing && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-3">
                                <svg className="w-8 h-8 text-rose-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Syncing calendar...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE EVENT MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Event</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Event Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Team Meeting, Project Review, etc."
                                />
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Color
                                </label>
                                <div className="flex gap-2">
                                    {eventColors.map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => setNewEvent({ ...newEvent, color: color.value })}
                                            className={`w-8 h-8 rounded-full ${color.bg} ${
                                                newEvent.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                                            }`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* All Day Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setNewEvent({ ...newEvent, allDay: !newEvent.allDay })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        newEvent.allDay ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        newEvent.allDay ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All Day Event</span>
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={newEvent.startDate}
                                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>
                                {!newEvent.allDay && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={newEvent.startTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={newEvent.endDate}
                                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>
                                {!newEvent.allDay && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={newEvent.endTime}
                                            onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Reminder & Recurrence */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reminder</label>
                                    <select
                                        value={newEvent.reminder}
                                        onChange={(e) => setNewEvent({ ...newEvent, reminder: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    >
                                        <option value={0}>No reminder</option>
                                        <option value={5}>5 minutes before</option>
                                        <option value={15}>15 minutes before</option>
                                        <option value={30}>30 minutes before</option>
                                        <option value={60}>1 hour before</option>
                                        <option value={1440}>1 day before</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Repeat</label>
                                    <select
                                        value={newEvent.recurrence}
                                        onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    >
                                        <option value="none">Does not repeat</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Add event details..."
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="Conference Room, Zoom, etc."
                                />
                            </div>

                            {/* Attendees */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Invite Team Members</label>
                                <div className="flex flex-wrap gap-2">
                                    {teamMembers.map(member => {
                                        const isInvited = newEvent.attendees.includes(member.email);
                                        return (
                                            <button
                                                key={member.id}
                                                onClick={() => {
                                                    if (isInvited) {
                                                        setNewEvent({ ...newEvent, attendees: newEvent.attendees.filter(e => e !== member.email) });
                                                    } else {
                                                        setNewEvent({ ...newEvent, attendees: [...newEvent.attendees, member.email] });
                                                    }
                                                }}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                                    isInvited
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                            >
                                                {member.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                disabled={isCreatingEvent || !newEvent.title.trim()}
                                className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isCreatingEvent && (
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                {isCreatingEvent ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EVENT DETAILS MODAL */}
            {showEventModal && activeEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{activeEvent.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            activeEvent.source === 'google'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : activeEvent.source === 'outlook'
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                                        }`}>
                                            {activeEvent.source === 'google' ? 'Google Calendar' : activeEvent.source === 'outlook' ? 'Outlook' : 'Local'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowEventModal(false); setActiveEvent(null); }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Date and Time */}
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {new Date(activeEvent.start).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    {!activeEvent.allDay && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            {new Date(activeEvent.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(activeEvent.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {activeEvent.description && (
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{activeEvent.description}</p>
                                </div>
                            )}

                            {activeEvent.location && (
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{activeEvent.location}</p>
                                </div>
                            )}

                            {activeEvent.attendees && activeEvent.attendees.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Attendees ({activeEvent.attendees.length})</p>
                                        <div className="space-y-1">
                                            {activeEvent.attendees.slice(0, 5).map((email, idx) => (
                                                <p key={idx} className="text-sm text-slate-600 dark:text-slate-400">{email}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeEvent.meetingLink && (
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <a href={activeEvent.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                        Join video meeting
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <button
                                onClick={() => handleDeleteEvent(activeEvent.id)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                Delete Event
                            </button>
                            <button
                                onClick={() => { setShowEventModal(false); setActiveEvent(null); }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TIMELINE VIEW SLIDING PANEL */}
            {showTimeline && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={() => setShowTimeline(false)} />
                    <div className="fixed inset-y-0 right-0 w-full lg:w-4/5 bg-white dark:bg-slate-900 z-50 shadow-2xl">
                        <div className="h-full flex flex-col">
                            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowTimeline(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Living Timeline</h3>
                                </div>
                                <button onClick={() => setShowTimeline(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <LivingTimeline
                                    events={events.map(e => ({
                                        id: e.id,
                                        title: e.title,
                                        start: e.start,
                                        end: e.end,
                                        type: detectEventType(e.title, e.description),
                                        color: 'from-blue-500 to-blue-600',
                                        description: e.description,
                                        location: e.location,
                                    }))}
                                    pins={timelinePins}
                                    onAddPin={(date, title, type) => {
                                        const newPin = {
                                            id: `pin-${Date.now()}`,
                                            date,
                                            title: title || 'Planning Marker',
                                            color: 'from-pink-500 to-rose-600',
                                            userId: 'current-user',
                                            userName: 'You'
                                        };
                                        setTimelinePins([...timelinePins, newPin]);
                                    }}
                                    onRemovePin={(pinId) => setTimelinePins(pins => pins.filter(p => p.id !== pinId))}
                                    onCreateEvent={(type, date) => {
                                        setNewEvent({
                                            ...newEvent,
                                            title: getDefaultTitleForType(type),
                                            startDate: date.toISOString().split('T')[0],
                                            startTime: date.toTimeString().slice(0, 5),
                                            endDate: date.toISOString().split('T')[0],
                                            endTime: new Date(date.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5),
                                        });
                                        setShowCreateModal(true);
                                    }}
                                    onEventClick={(event) => {
                                        const fullEvent = events.find(e => e.id === event.id);
                                        if (fullEvent) {
                                            setActiveEvent(fullEvent);
                                            setShowEventModal(true);
                                        }
                                    }}
                                    onEventDrag={(eventId, newStart, newEnd) => {
                                        setEvents(prev => prev.map(e =>
                                            e.id === eventId
                                                ? { ...e, start: newStart, end: newEnd }
                                                : e
                                        ));
                                    }}
                                    viewDate={viewDate}
                                    zoom={timelineZoom}
                                    onZoomChange={setTimelineZoom}
                                    onDateChange={setViewDate}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TEAM SCHEDULING MODAL */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Find Team Availability</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Find free time slots when everyone is available</p>
                                </div>
                                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                                    <input type="date" value={scheduleStartDate} onChange={(e) => setScheduleStartDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                                    <input type="date" value={scheduleEndDate} onChange={(e) => setScheduleEndDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Meeting Duration</label>
                                <select value={scheduleDuration} onChange={(e) => setScheduleDuration(Number(e.target.value))} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </div>

                            <button onClick={findFreeTimeSlots} disabled={isFindingSlots} className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {isFindingSlots && <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                                {isFindingSlots ? 'Finding Slots...' : 'Find Available Times'}
                            </button>

                            {freeSlots.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Time Slots ({freeSlots.length})</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-auto">
                                        {freeSlots.map((slot, idx) => (
                                            <button key={idx} onClick={() => scheduleInSlot(slot)} className="w-full p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:shadow-md transition-all text-left group">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {slot.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                        </div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                            {slot.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {slot.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SETTINGS MODAL */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowSettingsModal(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calendar Settings</h2>
                            <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <CalendarSettings />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
