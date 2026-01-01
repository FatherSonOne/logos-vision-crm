import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, GripVertical, Trash2, Edit3 } from 'lucide-react';
import { TimelineContextMenu } from './TimelineContextMenu';
import { EventType } from './EventTypeIndicator';

export type TimelineZoom = 'year' | 'month' | 'week' | 'day' | 'hour';

interface TimelinePin {
  id: string;
  date: Date;
  title: string;
  color: string;
  userId: string;
  userName: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  color: string;
  description?: string;
  location?: string;
}

interface LivingTimelineProps {
  events: TimelineEvent[];
  pins: TimelinePin[];
  onAddPin: (date: Date, title?: string, type?: EventType) => void;
  onRemovePin: (pinId: string) => void;
  viewDate: Date;
  zoom: TimelineZoom;
  onZoomChange: (zoom: TimelineZoom) => void;
  onDateChange: (date: Date) => void;
  onCreateEvent?: (type: EventType, date: Date) => void;
  onEventClick?: (event: TimelineEvent) => void;
  onEventDrag?: (eventId: string, newStart: Date, newEnd: Date) => void;
}

export const LivingTimeline: React.FC<LivingTimelineProps> = ({
  events,
  pins,
  onAddPin,
  onRemovePin,
  viewDate,
  zoom,
  onZoomChange,
  onDateChange,
  onCreateEvent,
  onEventClick,
  onEventDrag,
}) => {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: Date } | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<{ event: TimelineEvent; startX: number; originalStart: Date } | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate time columns based on zoom level
  const timeColumns = useMemo(() => {
    const columns: Date[] = [];
    const start = new Date(viewDate);
    
    switch (zoom) {
      case 'year':
        start.setMonth(0, 1);
        for (let i = 0; i < 12; i++) {
          const month = new Date(start);
          month.setMonth(i);
          columns.push(month);
        }
        break;
      case 'month':
        start.setDate(1);
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
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          columns.push(day);
        }
        break;
      case 'day':
        for (let i = 0; i < 24; i++) {
          const hour = new Date(start);
          hour.setHours(i);
          columns.push(hour);
        }
        break;
      case 'hour':
        for (let i = 0; i < 60; i += 5) {
          const minute = new Date(start);
          minute.setMinutes(i);
          columns.push(minute);
        }
        break;
    }
    return columns;
  }, [viewDate, zoom]);

  // Handle mouse move to track cursor position and show orb
  // Fixed positioning to account for scroll offsets and container bounds
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || draggingEvent) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate which date column we're over
    const columnWidth = rect.width / timeColumns.length;
    const columnIndex = Math.floor(x / columnWidth);

    if (columnIndex >= 0 && columnIndex < timeColumns.length) {
      setHoveredDate(timeColumns[columnIndex]);

      // Use requestAnimationFrame for smooth, immediate updates
      // Use pageX/pageY for absolute position, accounting for scroll
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        // Use clientX/clientY for fixed positioning (viewport-relative)
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    }
  }, [timeColumns.length, draggingEvent]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (!draggingEvent) {
      setHoveredDate(null);
      setMousePosition(null);
    }
  }, [draggingEvent]);

  // Handle event drag start
  const handleEventDragStart = useCallback((e: React.MouseEvent, event: TimelineEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingEvent({
      event,
      startX: e.clientX,
      originalStart: new Date(event.start),
    });
    setHoveredDate(null);
    setMousePosition(null);
  }, []);

  // Handle event drag
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!draggingEvent || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - draggingEvent.startX;
    const columnWidth = rect.width / timeColumns.length;
    const columnsDelta = Math.round(deltaX / columnWidth);

    if (columnsDelta !== 0) {
      const columnDuration = getColumnDuration(zoom);
      const newStart = new Date(draggingEvent.originalStart.getTime() + columnsDelta * columnDuration);
      const duration = draggingEvent.event.end.getTime() - draggingEvent.event.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      // Update visually during drag
      setHoveredDate(newStart);
    }
  }, [draggingEvent, timeColumns.length, zoom]);

  // Handle event drag end
  const handleDragEnd = useCallback((e: MouseEvent) => {
    if (!draggingEvent || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const deltaX = e.clientX - draggingEvent.startX;
    const columnWidth = rect.width / timeColumns.length;
    const columnsDelta = Math.round(deltaX / columnWidth);

    if (columnsDelta !== 0 && onEventDrag) {
      const columnDuration = getColumnDuration(zoom);
      const newStart = new Date(draggingEvent.originalStart.getTime() + columnsDelta * columnDuration);
      const duration = draggingEvent.event.end.getTime() - draggingEvent.event.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      onEventDrag(draggingEvent.event.id, newStart, newEnd);
    }

    setDraggingEvent(null);
    setHoveredDate(null);
  }, [draggingEvent, timeColumns.length, zoom, onEventDrag]);

  // Global mouse listeners for drag
  useEffect(() => {
    if (draggingEvent) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggingEvent, handleDrag, handleDragEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Handle right-click to show context menu
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!timelineRef.current || !hoveredDate) {
      return;
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      date: hoveredDate,
    });
  };

  // Format column header
  const formatColumnHeader = (date: Date): string => {
    switch (zoom) {
      case 'year': return date.toLocaleDateString('en-US', { month: 'short' });
      case 'month': return date.getDate().toString();
      case 'week': return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      case 'day': return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
      case 'hour': return date.toLocaleTimeString('en-US', { minute: '2-digit' });
      default: return '';
    }
  };

  // Navigate timeline
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    const amount = direction === 'next' ? 1 : -1;
    
    switch (zoom) {
      case 'year': newDate.setFullYear(newDate.getFullYear() + amount); break;
      case 'month': newDate.setMonth(newDate.getMonth() + amount); break;
      case 'week': newDate.setDate(newDate.getDate() + (7 * amount)); break;
      case 'day': newDate.setDate(newDate.getDate() + amount); break;
      case 'hour': newDate.setHours(newDate.getHours() + amount); break;
    }
    onDateChange(newDate);
  };

  // Zoom controls
  const zoomLevels: TimelineZoom[] = ['year', 'month', 'week', 'day', 'hour'];
  const currentZoomIndex = zoomLevels.indexOf(zoom);
  
  const zoomIn = () => {
    if (currentZoomIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentZoomIndex + 1]);
    }
  };
  
  const zoomOut = () => {
    if (currentZoomIndex > 0) {
      onZoomChange(zoomLevels[currentZoomIndex - 1]);
    }
  };

  // Go to today
  const goToToday = () => {
    onDateChange(new Date());
  };

  // Check if viewing today
  const isViewingToday = useMemo(() => {
    const today = new Date();
    return viewDate.getDate() === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear();
  }, [viewDate]);

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 relative">

      {/* Timeline Header */}
      <div className="flex-none bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 preserve-3d">
        <div className="p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Navigation Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => navigateTimeline('prev')}
                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              <div className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg font-semibold text-sm md:text-base">
                {viewDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </div>

              <button
                onClick={() => navigateTimeline('next')}
                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Next"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Today Button */}
              <button
                onClick={goToToday}
                disabled={isViewingToday}
                className={`px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ml-1 ${
                  isViewingToday
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
                }`}
              >
                Today
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={zoomOut}
                disabled={currentZoomIndex === 0}
                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Zoom Level Buttons */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {zoomLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => onZoomChange(level)}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors capitalize ${
                      zoom === level
                        ? 'bg-white dark:bg-gray-600 text-rose-600 dark:text-rose-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>

              {/* Mobile zoom indicator */}
              <span className="md:hidden px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium capitalize">
                {zoom}
              </span>

              <button
                onClick={zoomIn}
                disabled={currentZoomIndex === zoomLevels.length - 1}
                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Helper Text */}
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden lg:block">
              <span>Right-click to create • </span>
              <span className="font-medium text-pink-600 dark:text-pink-400">Drag events to reschedule</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full inline-block">
          {/* Time Column Headers */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md preserve-3d">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {timeColumns.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-[80px] p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {formatColumnHeader(date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Track with Orb Cursor */}
          <div 
            ref={timelineRef}
            className="relative preserve-3d cursor-crosshair" 
            style={{ minHeight: '400px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onContextMenu={handleContextMenu}
          >
            {/* Time Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {timeColumns.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 min-w-[80px] border-r border-gray-200/50 dark:border-gray-700/50 last:border-r-0"
                />
              ))}
            </div>

            {/* Now Indicator Line */}
            <div className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-rose-500 to-pink-600 animate-glow-pulse z-20 pointer-events-none" style={{ left: '50%' }}>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full animate-marker-pulse" />
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold text-rose-600 dark:text-rose-400">
                NOW
              </div>
            </div>

            {/* Living Timeline Path */}
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-pink-400/30 via-rose-500/30 to-pink-400/30 -translate-y-1/2 animate-glow-pulse pointer-events-none" />

            {/* Events Layer */}
            <div className="absolute inset-0 pt-8 pointer-events-none">
              {events.map((event, index) => {
                const eventWidth = calculateEventWidth(event, timeColumns, zoom);
                const eventLeft = calculateEventPosition(event.start, timeColumns, zoom);
                const isHovered = hoveredEvent?.id === event.id;
                const isDragging = draggingEvent?.event.id === event.id;

                // Determine event color based on type
                const eventColors: Record<string, string> = {
                  project: 'from-blue-500 to-blue-600',
                  activity: 'from-orange-500 to-orange-600',
                  meeting: 'from-pink-500 to-rose-600',
                  call: 'from-purple-500 to-purple-600',
                  event: 'from-teal-500 to-teal-600',
                  milestone: 'from-amber-500 to-amber-600',
                  deadline: 'from-red-500 to-red-600',
                  task: 'from-green-500 to-green-600',
                  note: 'from-gray-500 to-gray-600',
                };
                const gradientClass = eventColors[event.type] || 'from-blue-500 to-blue-600';

                // Stagger events vertically to prevent overlap
                const topOffset = 30 + (index % 4) * 15;

                return (
                  <div
                    key={event.id}
                    className={`absolute pointer-events-auto transition-all duration-200 ${
                      isDragging ? 'opacity-50 scale-105 z-50' : isHovered ? 'z-40 scale-102' : 'z-10'
                    }`}
                    style={{
                      left: `${eventLeft}%`,
                      width: `${Math.max(eventWidth, 5)}%`,
                      top: `${topOffset}%`,
                      cursor: onEventDrag ? 'grab' : 'pointer',
                    }}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    onMouseDown={(e) => onEventDrag && handleEventDragStart(e, event)}
                  >
                    <div className={`
                      bg-gradient-to-br ${gradientClass} text-white rounded-lg p-2 md:p-3 shadow-xl
                      transition-all duration-200 border-2 border-transparent
                      ${isHovered ? 'shadow-2xl border-white/30 ring-2 ring-white/20' : ''}
                      ${isDragging ? 'cursor-grabbing' : ''}
                    `}>
                      <div className="flex items-start gap-2">
                        {onEventDrag && (
                          <GripVertical className="w-4 h-4 opacity-60 flex-shrink-0 hidden md:block" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs md:text-sm font-semibold truncate">{event.title}</div>
                          <div className="text-xs opacity-90 mt-0.5 hidden md:block">
                            {event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {event.location && ` • ${event.location}`}
                          </div>
                        </div>
                      </div>

                      {/* Hover tooltip with more details */}
                      {isHovered && event.description && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-90 line-clamp-2">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pins Layer */}
            <div className="absolute inset-0 pointer-events-none">
              {pins.map((pin) => {
                const pinPosition = calculateEventPosition(pin.date, timeColumns, zoom);
                
                return (
                  <div
                    key={pin.id}
                    className="absolute animate-pin-drop pointer-events-auto"
                    style={{
                      left: `${pinPosition}%`,
                      top: '20%',
                    }}
                  >
                    <div className="relative group">
                      {/* Pin Icon */}
                      <div className={`
                        w-8 h-8 rounded-full bg-gradient-to-br ${pin.color}
                        shadow-lg cursor-pointer depth-lift
                        flex items-center justify-center
                      `}>
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Pin Label (shows on hover) */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                          <div className="font-semibold">{pin.title}</div>
                          <div className="opacity-75">{pin.userName}</div>
                          <div className="opacity-75">{pin.date.toLocaleDateString()}</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                      
                      {/* Remove Pin Button */}
                      <button
                        onClick={() => onRemovePin(pin.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pulsing Orb Cursor */}
            {mousePosition && hoveredDate && (
              <div
                className="fixed z-[9999] pointer-events-none"
                style={{
                  left: `${mousePosition.x}px`,
                  top: `${mousePosition.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Outer pulse ring */}
                <div className="absolute w-12 h-12 -left-6 -top-6">
                  <div className="absolute inset-0 bg-pink-500/30 rounded-full animate-ping" />
                </div>

                {/* Middle glow */}
                <div className="absolute w-8 h-8 -left-4 -top-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full opacity-60 blur-sm animate-glow-pulse" />
                </div>

                {/* Inner orb */}
                <div className="absolute w-6 h-6 -left-3 -top-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full shadow-lg animate-marker-pulse" />
                  <div className="absolute inset-0 bg-white/40 rounded-full animate-pulse" />
                </div>

                {/* Date tooltip */}
                <div className="absolute left-0 mt-4 whitespace-nowrap" style={{ top: '24px' }}>
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl -translate-x-1/2">
                    <div className="font-semibold">
                      {hoveredDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: zoom === 'day' || zoom === 'hour' ? 'numeric' : undefined,
                        minute: zoom === 'day' || zoom === 'hour' ? '2-digit' : undefined,
                      })}
                    </div>
                    <div className="text-xs opacity-75 mt-1">Right-click to create</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <TimelineContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          date={contextMenu.date}
          onClose={() => setContextMenu(null)}
          onCreatePin={(date) => onAddPin(date)}
          onCreateEvent={(type, date) => {
            if (onCreateEvent) {
              onCreateEvent(type, date);
            }
          }}
        />
      )}
    </div>
  );
};

// Helper functions
function calculateEventWidth(
  event: TimelineEvent,
  columns: Date[],
  zoom: TimelineZoom
): number {
  const duration = event.end.getTime() - event.start.getTime();
  const columnDuration = getColumnDuration(zoom);
  const columnsSpanned = duration / columnDuration;
  const widthPerColumn = 100 / columns.length;
  return Math.max(columnsSpanned * widthPerColumn, widthPerColumn * 0.5);
}

function calculateEventPosition(
  date: Date,
  columns: Date[],
  zoom: TimelineZoom
): number {
  const firstColumn = columns[0];
  const timeDiff = date.getTime() - firstColumn.getTime();
  const columnDuration = getColumnDuration(zoom);
  const columnsFromStart = timeDiff / columnDuration;
  const widthPerColumn = 100 / columns.length;
  return columnsFromStart * widthPerColumn;
}

function getColumnDuration(zoom: TimelineZoom): number {
  switch (zoom) {
    case 'year': return 30 * 24 * 60 * 60 * 1000; // ~1 month
    case 'month': return 24 * 60 * 60 * 1000; // 1 day
    case 'week': return 24 * 60 * 60 * 1000; // 1 day
    case 'day': return 60 * 60 * 1000; // 1 hour
    case 'hour': return 5 * 60 * 1000; // 5 minutes
    default: return 24 * 60 * 60 * 1000;
  }
}
