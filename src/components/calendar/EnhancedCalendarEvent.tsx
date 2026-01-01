import React from 'react';
import { EventTypeIndicator, detectEventType, type EventType } from './EventTypeIndicator';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  type?: EventType;
  color?: string;
}

interface EnhancedCalendarEventProps {
  event: CalendarEvent;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const EnhancedCalendarEvent: React.FC<EnhancedCalendarEventProps> = ({ 
  event, 
  onClick, 
  style,
  className = ''
}) => {
  // Detect event type from title and description
  const eventType = event.type || detectEventType(event.title, event.description);
  
  // Get gradient colors based on event type
  const getGradientClasses = (type: EventType): string => {
    const gradients = {
      project: 'from-blue-500 to-blue-600',
      activity: 'from-orange-500 to-orange-600',
      meeting: 'from-pink-500 to-rose-600',
      call: 'from-purple-500 to-purple-600',
      'task-complete': 'from-green-500 to-green-600',
      'task-deadline': 'from-red-500 to-orange-500',
      urgent: 'from-red-600 to-red-700',
      event: 'from-teal-500 to-cyan-600',
      milestone: 'from-amber-500 to-yellow-600',
      note: 'from-gray-500 to-gray-600',
      deadline: 'from-amber-600 to-orange-600',
    };
    return gradients[type];
  };

  // Calculate if event is near deadline (within 24 hours)
  const isNearDeadline = () => {
    const now = new Date();
    const eventStart = new Date(event.start);
    const hoursDiff = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 0 && hoursDiff <= 24;
  };

  // Determine if we should show deadline warning
  const showDeadlineWarning = eventType === 'task-deadline' || isNearDeadline();

  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        group relative overflow-hidden rounded-lg cursor-pointer
        event-hover animate-pop-in
        ${className}
      `}
    >
      {/* Gradient Background */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${getGradientClasses(eventType)}
        opacity-90 group-hover:opacity-100 transition-opacity duration-200
      `} />
      
      {/* Shine overlay on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        animate-shine-sweep
      `} />

      {/* Content */}
      <div className="relative p-2 h-full flex flex-col">
        {/* Event Header with Icon */}
        <div className="flex items-start gap-2 mb-1">
          <EventTypeIndicator type={eventType} size="sm" />
          <span className="flex-1 text-xs font-semibold text-white leading-tight line-clamp-2">
            {event.title}
          </span>
        </div>

        {/* Time Display (for non-all-day events) */}
        {!event.allDay && (
          <div className="text-xs text-white/90 font-medium">
            {event.start.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        )}

        {/* Location indicator */}
        {event.location && (
          <div className="text-xs text-white/80 truncate mt-1">
            📍 {event.location}
          </div>
        )}

        {/* Deadline Warning Badge */}
        {showDeadlineWarning && (
          <div className="absolute top-1 right-1 animate-bounce-pulse">
            <div className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
              ⚠️
            </div>
          </div>
        )}

        {/* Attendees count */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="text-xs text-white/80 mt-auto">
            👥 {event.attendees.length}
          </div>
        )}
      </div>

      {/* Hover Effect Border */}
      <div className={`
        absolute inset-0 border-2 border-white/0 rounded-lg
        group-hover:border-white/30 transition-all duration-200
      `} />
    </div>
  );
};
