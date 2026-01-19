import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  taskData?: any;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface MonthDateHoverPreviewProps {
  date: Date;
  events: CalendarEvent[];
  position: { x: number; y: number };
}

export const MonthDateHoverPreview: React.FC<MonthDateHoverPreviewProps> = ({
  date,
  events,
  position,
}) => {
  if (events.length === 0) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const tasks = events.filter(e => e.taskData);
  const regularEvents = events.filter(e => !e.taskData);

  // Adjust position to stay within viewport
  const adjustedPosition = React.useMemo(() => {
    const previewWidth = 320;
    const previewHeight = 400;
    let x = position.x;
    let y = position.y;

    if (x + previewWidth > window.innerWidth) {
      x = window.innerWidth - previewWidth - 10;
    }

    if (y + previewHeight > window.innerHeight) {
      y = window.innerHeight - previewHeight - 10;
    }

    return { x, y };
  }, [position]);

  return (
    <div
      className="fixed z-[100] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-80 max-h-96 overflow-hidden animate-fade-scale-in"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4" />
          <h3 className="font-bold text-sm">
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h3>
        </div>
        <p className="text-xs text-white/80">
          {events.length} item{events.length !== 1 ? 's' : ''} • {tasks.length} task{tasks.length !== 1 ? 's' : ''}, {regularEvents.length} event{regularEvents.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Events List */}
      <div className="overflow-y-auto max-h-80">
        {/* Tasks Section */}
        {tasks.length > 0 && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Tasks ({tasks.length})
            </h4>
            <div className="space-y-2">
              {tasks.map((task, idx) => {
                const priorityIcons = {
                  critical: '🟥',
                  high: '🟧',
                  medium: '🟨',
                  low: '◽',
                };
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <span className="text-sm">{priorityIcons[task.priority || 'low']}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        📋 {task.title}
                      </p>
                      {!task.allDay && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {formatTime(task.start)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events Section */}
        {regularEvents.length > 0 && (
          <div className="p-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Events ({regularEvents.length})
            </h4>
            <div className="space-y-2">
              {regularEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {!event.allDay && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {formatTime(event.start)}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                          {event.location}
                        </span>
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {event.attendees.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-scale-in {
          animation: fade-scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
