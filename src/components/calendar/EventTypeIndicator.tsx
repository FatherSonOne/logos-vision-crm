import React from 'react';
import { 
  FolderOpen, 
  ClipboardList, 
  Target, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  PartyPopper, 
  Trophy, 
  FileText, 
  Clock 
} from 'lucide-react';

export type EventType = 
  | 'project' 
  | 'activity' 
  | 'meeting' 
  | 'call' 
  | 'task-complete' 
  | 'task-deadline' 
  | 'urgent' 
  | 'event' 
  | 'milestone' 
  | 'note' 
  | 'deadline';

export interface EventTypeConfig {
  type: EventType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: React.ComponentType<{ className?: string }>;
  animation: string;
}

export const EVENT_TYPE_CONFIGS: Record<EventType, EventTypeConfig> = {
  project: {
    type: 'project',
    color: 'blue',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    icon: FolderOpen,
    animation: 'animate-pulse-gentle',
  },
  activity: {
    type: 'activity',
    color: 'orange',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    icon: ClipboardList,
    animation: 'animate-bounce-subtle',
  },
  meeting: {
    type: 'meeting',
    color: 'pink',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-600',
    icon: Target,
    animation: 'animate-scale-hover',
  },
  call: {
    type: 'call',
    color: 'purple',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600',
    icon: Phone,
    animation: 'animate-ring',
  },
  'task-complete': {
    type: 'task-complete',
    color: 'green',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-green-600',
    icon: CheckCircle,
    animation: 'animate-check-draw',
  },
  'task-deadline': {
    type: 'task-deadline',
    color: 'red',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-orange-500',
    icon: AlertTriangle,
    animation: 'animate-bounce-pulse',
  },
  urgent: {
    type: 'urgent',
    color: 'red',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-red-700',
    icon: AlertCircle,
    animation: 'animate-flash-vibrate',
  },
  event: {
    type: 'event',
    color: 'teal',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-cyan-600',
    icon: PartyPopper,
    animation: 'animate-sparkle',
  },
  milestone: {
    type: 'milestone',
    color: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-600',
    icon: Trophy,
    animation: 'animate-shine-sweep',
  },
  note: {
    type: 'note',
    color: 'gray',
    gradientFrom: 'from-gray-500',
    gradientTo: 'to-gray-600',
    icon: FileText,
    animation: 'animate-fold-corner',
  },
  deadline: {
    type: 'deadline',
    color: 'amber',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-orange-600',
    icon: Clock,
    animation: 'animate-tick',
  },
};

interface EventTypeIndicatorProps {
  type: EventType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const EventTypeIndicator: React.FC<EventTypeIndicatorProps> = ({ 
  type, 
  size = 'md', 
  showLabel = false,
  className = ''
}) => {
  const config = EVENT_TYPE_CONFIGS[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className={`${config.animation}`}>
        <Icon className={`${sizeClasses[size]} text-${config.color}-600 dark:text-${config.color}-400`} />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium text-${config.color}-700 dark:text-${config.color}-300 capitalize`}>
          {type.replace('-', ' ')}
        </span>
      )}
    </div>
  );
};

// Helper function to detect event type from title/description
export const detectEventType = (title: string, description?: string): EventType => {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  if (text.includes('urgent') || text.includes('emergency') || text.includes('asap')) {
    return 'urgent';
  }
  if (text.includes('call') || text.includes('phone')) {
    return 'call';
  }
  if (text.includes('meeting') || text.includes('meet') || text.includes('standup') || text.includes('sync')) {
    return 'meeting';
  }
  if (text.includes('deadline') || text.includes('due')) {
    return 'deadline';
  }
  if (text.includes('milestone') || text.includes('launch') || text.includes('release')) {
    return 'milestone';
  }
  if (text.includes('task') || text.includes('todo')) {
    // Check if it's near deadline (you can expand this logic)
    return 'task-deadline';
  }
  if (text.includes('project')) {
    return 'project';
  }
  if (text.includes('activity') || text.includes('workshop') || text.includes('training')) {
    return 'activity';
  }
  if (text.includes('party') || text.includes('celebration') || text.includes('event')) {
    return 'event';
  }
  if (text.includes('note') || text.includes('reminder')) {
    return 'note';
  }
  
  // Default
  return 'activity';
};
