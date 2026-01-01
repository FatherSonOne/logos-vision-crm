// Event Type Detection and Configuration System
// This handles all event classification, colors, icons, and animations

export type EventType = 
    | 'project' 
    | 'activity' 
    | 'meeting' 
    | 'call' 
    | 'task_complete' 
    | 'task_deadline' 
    | 'urgent' 
    | 'event' 
    | 'milestone' 
    | 'note' 
    | 'deadline';

export interface EventStyle {
    type: EventType;
    color: string;
    gradient: string;
    icon: string;
    animation: string;
    hoverEffect: string;
}

// Event type detection based on title, description, or metadata
export const detectEventType = (title: string, description?: string, metadata?: any): EventType => {
    const searchText = `${title} ${description || ''}`.toLowerCase();
    
    // Urgent indicators
    if (searchText.includes('urgent') || searchText.includes('emergency') || searchText.includes('critical')) {
        return 'urgent';
    }
    
    // Deadlines
    if (searchText.includes('deadline') || searchText.includes('due date')) {
        return 'deadline';
    }
    
    // Tasks
    if (metadata?.completed) {
        return 'task_complete';
    }
    if (searchText.includes('task') || searchText.includes('todo') || searchText.includes('to-do')) {
        const daysUntil = metadata?.dueDate ? Math.floor((new Date(metadata.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
        if (daysUntil <= 2) {
            return 'task_deadline';
        }
        return 'task_complete'; // Default task state
    }
    
    // Calls
    if (searchText.includes('call') || searchText.includes('phone') || searchText.includes('ring')) {
        return 'call';
    }
    
    // Meetings
    if (searchText.includes('meeting') || searchText.includes('standup') || searchText.includes('sync') || searchText.includes('1:1') || searchText.includes('one-on-one')) {
        return 'meeting';
    }
    
    // Milestones
    if (searchText.includes('milestone') || searchText.includes('launch') || searchText.includes('release')) {
        return 'milestone';
    }
    
    // Projects
    if (searchText.includes('project') || metadata?.type === 'project') {
        return 'project';
    }
    
    // Activities
    if (searchText.includes('activity') || searchText.includes('log') || searchText.includes('note')) {
        return 'activity';
    }

    // Notes
    if (searchText.includes('note') || searchText.includes('memo')) {
        return 'note';
    }

    // Default to event
    return 'event';
};

// Get event styles based on type
export const getEventStyles = (eventType: EventType): EventStyle => {
    const styles: Record<EventType, EventStyle> = {
        urgent: {
            type: 'urgent',
            color: 'text-red-600 dark:text-red-400',
            gradient: 'bg-gradient-to-r from-red-500 to-rose-500',
            icon: 'AlertTriangle',
            animation: 'animate-pulse',
            hoverEffect: 'hover:shadow-red-500/30'
        },
        deadline: {
            type: 'deadline',
            color: 'text-orange-600 dark:text-orange-400',
            gradient: 'bg-gradient-to-r from-orange-500 to-amber-500',
            icon: 'Clock',
            animation: '',
            hoverEffect: 'hover:shadow-orange-500/30'
        },
        task_complete: {
            type: 'task_complete',
            color: 'text-green-600 dark:text-green-400',
            gradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
            icon: 'CheckCircle',
            animation: '',
            hoverEffect: 'hover:shadow-green-500/30'
        },
        task_deadline: {
            type: 'task_deadline',
            color: 'text-amber-600 dark:text-amber-400',
            gradient: 'bg-gradient-to-r from-amber-500 to-yellow-500',
            icon: 'AlertCircle',
            animation: 'animate-pulse',
            hoverEffect: 'hover:shadow-amber-500/30'
        },
        meeting: {
            type: 'meeting',
            color: 'text-blue-600 dark:text-blue-400',
            gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
            icon: 'Users',
            animation: '',
            hoverEffect: 'hover:shadow-blue-500/30'
        },
        call: {
            type: 'call',
            color: 'text-cyan-600 dark:text-cyan-400',
            gradient: 'bg-gradient-to-r from-cyan-500 to-teal-500',
            icon: 'Phone',
            animation: '',
            hoverEffect: 'hover:shadow-cyan-500/30'
        },
        milestone: {
            type: 'milestone',
            color: 'text-purple-600 dark:text-purple-400',
            gradient: 'bg-gradient-to-r from-purple-500 to-violet-500',
            icon: 'Flag',
            animation: '',
            hoverEffect: 'hover:shadow-purple-500/30'
        },
        project: {
            type: 'project',
            color: 'text-indigo-600 dark:text-indigo-400',
            gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
            icon: 'Folder',
            animation: '',
            hoverEffect: 'hover:shadow-indigo-500/30'
        },
        activity: {
            type: 'activity',
            color: 'text-sky-600 dark:text-sky-400',
            gradient: 'bg-gradient-to-r from-sky-500 to-blue-500',
            icon: 'Activity',
            animation: '',
            hoverEffect: 'hover:shadow-sky-500/30'
        },
        note: {
            type: 'note',
            color: 'text-slate-600 dark:text-slate-400',
            gradient: 'bg-gradient-to-r from-slate-500 to-gray-500',
            icon: 'FileText',
            animation: '',
            hoverEffect: 'hover:shadow-slate-500/30'
        },
        event: {
            type: 'event',
            color: 'text-rose-600 dark:text-rose-400',
            gradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
            icon: 'Calendar',
            animation: '',
            hoverEffect: 'hover:shadow-rose-500/30'
        }
    };

    return styles[eventType] || styles.event;
};