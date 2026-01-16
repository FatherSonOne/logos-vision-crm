# Complete TimelineView Component Code

## Full File: src/components/TimelineView.tsx

```typescript
// COMPLETE TIMELINE VIEW COMPONENT
// Copy this entire file to: src/components/TimelineView.tsx

import React, { useMemo } from 'react';
import type { TeamMember, Project, Activity, CalendarEvent } from '../types';

interface ExtendedCalendarEvent extends CalendarEvent {
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
