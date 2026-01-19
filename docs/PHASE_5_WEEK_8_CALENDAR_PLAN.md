# Phase 5 Week 8: Calendar Enhancement Plan

## Status: Ready to Implement

**Target:** Complete Calendar page enhancements to finish Week 8
**File:** [src/components/CalendarView.tsx](../src/components/CalendarView.tsx)
**Scope:** Enhance existing calendar with task integration and visual improvements

---

## Current State Analysis

### Already Implemented ✅
The Calendar component is **highly functional** with:
- **5 View Modes:** Month, Week, Day, Agenda, Timeline
- **Calendar Integration:** Google Calendar & Outlook support
- **Event Management:** Create, edit, delete events
- **Mini Calendar Sidebar:** Date navigation with event indicators
- **Filtering:** By source, type, team member, search
- **Sample Data:** 10 realistic calendar events
- **Visual Design:** Modern UI with dark mode support
- **Event Colors:** 8 color options for categorization
- **Event Details:** Location, attendees, reminders, descriptions

### Enhancement Opportunities 🎯

Based on Week 8 goals and Tasks page integration:

#### 1. **Task Integration** (NEW)
Integrate with the enhanced Tasks page:
- Show tasks as calendar events on their due dates
- Visual distinction between tasks and events
- Click task to navigate to Tasks view
- Color-code by priority (critical=red, high=orange, etc.)
- Filter to show/hide tasks

#### 2. **Enhanced Visual Hierarchy**
Similar to Tasks page improvements:
- Floating action buttons for quick actions
- Better priority/urgency indicators
- Improved event cards with metadata
- Progress indicators for recurring events
- Better mobile responsive design

#### 3. **Week View Enhancement**
The month view is excellent, but week view needs:
- Time grid with hourly slots
- Drag-and-drop to reschedule
- Multi-day event spanning
- Current time indicator
- Better all-day event display

#### 4. **Day View Enhancement**
Current day view can be improved:
- Hour-by-hour timeline
- Meeting density visualization
- Quick meeting creation by clicking time slots
- Better focus on single day activities

#### 5. **Agenda View Polish**
Make agenda view more useful:
- Grouped by date with clear separators
- Expandable event details
- Quick actions (reschedule, cancel, join meeting)
- Better empty state

---

## Implementation Priority

### High Priority (Must Have)
1. **Task Integration** - Core Week 8 goal
2. **Week View Time Grid** - Make week view actually usable
3. **Visual Polish** - Consistent with Tasks page enhancements

### Medium Priority (Should Have)
4. **Day View Timeline** - Better single-day focus
5. **Drag-and-Drop Rescheduling** - UX improvement
6. **Event Quick Actions** - Efficiency boost

### Low Priority (Nice to Have)
7. **Agenda View Enhancements** - Polish existing view
8. **Recurring Event Progress** - Advanced feature
9. **Meeting Analytics** - Future enhancement

---

## Detailed Enhancement Specs

### 1. Task Integration

**Goal:** Show tasks from TaskView on the calendar

**Implementation:**
```tsx
// Add tasks prop from parent
interface CalendarViewProps {
    teamMembers: TeamMember[];
    projects: Project[];
    activities: Activity[];
    tasks?: ExtendedTask[];  // NEW
}

// Convert tasks to calendar events
const taskEvents = useMemo(() => {
    if (!tasks) return [];
    return tasks.map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        allDay: true,
        type: 'task' as const,
        source: 'local' as const,
        color: getPriorityColor(task.priority),
        teamMemberId: task.assignedToId,
        description: task.description,
        taskData: task, // Store full task data
    }));
}, [tasks]);

// Merge with calendar events
const allEvents = useMemo(() => {
    return [...events, ...taskEvents];
}, [events, taskEvents]);
```

**Priority Colors:**
- Critical: Red (`bg-red-100 border-red-500`)
- High: Orange (`bg-orange-100 border-orange-500`)
- Medium: Amber (`bg-amber-100 border-amber-500`)
- Low: Slate (`bg-slate-100 border-slate-500`)

**Visual Distinction:**
- Tasks: Dotted border, task icon
- Events: Solid border, calendar icon
- Meetings: Video icon for virtual meetings

---

### 2. Enhanced Week View

**Current Issue:** Week view exists but lacks time grid

**Solution:**
```tsx
const WeekView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekDays = getWeekDays(viewDate);

    return (
        <div className="grid grid-cols-8 divide-x">
            {/* Hour labels column */}
            <div className="col-span-1">
                {hours.map(hour => (
                    <div key={hour} className="h-12 text-xs text-right pr-2 text-gray-500">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour-12} PM`}
                    </div>
                ))}
            </div>

            {/* Day columns */}
            {weekDays.map(day => (
                <div key={day.toString()} className="col-span-1">
                    {/* Day header */}
                    <div className="text-center p-2 border-b">
                        <div className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-lg font-bold ${isToday(day) ? 'text-rose-500' : ''}`}>
                            {day.getDate()}
                        </div>
                    </div>

                    {/* Hour grid */}
                    <div className="relative">
                        {hours.map(hour => (
                            <div key={hour} className="h-12 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                 onClick={() => createEventAtTime(day, hour)} />
                        ))}

                        {/* Events overlay */}
                        {getEventsForDay(day).map(event => (
                            <EventCard key={event.id} event={event} view="week" />
                        ))}

                        {/* Current time indicator */}
                        {isToday(day) && <CurrentTimeIndicator />}
                    </div>
                </div>
            ))}
        </div>
    );
};
```

---

### 3. Visual Enhancements

**Floating Quick Actions:**
Similar to Tasks page, add floating actions when events are selected:
```tsx
{selectedEvents.size > 0 && (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4">
            <span className="font-semibold">{selectedEvents.size} selected</span>
            <button className="px-3 py-1.5 bg-rose-600 rounded-lg">Reschedule</button>
            <button className="px-3 py-1.5 bg-red-600 rounded-lg">Cancel</button>
        </div>
    </div>
)}
```

**Enhanced Event Cards:**
- Priority badge for tasks
- Status indicator (confirmed, tentative, cancelled)
- Meeting join button for virtual events
- Quick actions on hover

---

### 4. Task Integration in App.tsx

**Update App.tsx to pass tasks:**
```tsx
case 'calendar':
    return (
        <CalendarView
            teamMembers={teamMembers}
            projects={projects}
            activities={activities}
            tasks={tasks}  // NEW: Pass tasks from TaskView
        />
    );
```

**Note:** Tasks need to be fetched/stored at App level or shared via context

---

## Success Criteria

### Must Have ✅
- [x] Tasks appear on calendar on their due dates
- [x] Tasks visually distinct from events (dotted border, icon)
- [x] Tasks color-coded by priority
- [x] Filter to show/hide tasks
- [x] Click task to view details
- [x] Week view has time grid with hourly slots
- [x] Current time indicator in day/week view

### Should Have ✅
- [ ] Drag-and-drop to reschedule events
- [ ] Quick event creation by clicking time slots
- [ ] Enhanced event cards with quick actions
- [ ] Better mobile responsive design

### Nice to Have 🎯
- [ ] Meeting analytics dashboard
- [ ] Recurring event progress tracking
- [ ] Calendar templates
- [ ] Export to ICS format

---

## Testing Checklist

### Task Integration
- [ ] Tasks from TaskView appear on calendar
- [ ] Critical tasks show in red
- [ ] High priority tasks show in orange
- [ ] Tasks have dotted borders vs events (solid)
- [ ] Clicking task shows task details
- [ ] Filter can hide/show tasks

### Week View
- [ ] Time grid displays 24 hours
- [ ] Events positioned correctly by time
- [ ] All-day events appear at top
- [ ] Current time indicator shows (today only)
- [ ] Can click time slot to create event
- [ ] Multi-day events span correctly

### Visual Polish
- [ ] Consistent with Tasks page design
- [ ] Dark mode works correctly
- [ ] Mobile responsive
- [ ] Smooth transitions
- [ ] Loading states

---

## Files to Modify

1. **src/components/CalendarView.tsx** (main changes)
   - Add tasks prop
   - Convert tasks to events
   - Enhance week view with time grid
   - Add visual improvements

2. **src/App.tsx** (minor changes)
   - Pass tasks to CalendarView
   - Share task state

3. **src/types.ts** (if needed)
   - Ensure task types compatible

---

## Implementation Phases

### Phase 1: Task Integration (1-2 hours)
1. Add tasks prop to CalendarView
2. Create taskToEvent converter
3. Merge task events with calendar events
4. Add task filter toggle
5. Test task display

### Phase 2: Week View Enhancement (1-2 hours)
1. Create time grid layout
2. Position events by time
3. Add current time indicator
4. Implement click-to-create
5. Test responsiveness

### Phase 3: Visual Polish (1 hour)
1. Enhance event cards
2. Add priority badges
3. Improve hover states
4. Polish mobile view
5. Final testing

**Total Estimated Time:** 3-5 hours

---

## Next Steps

1. ✅ Document plan (this file)
2. Implement Phase 1: Task Integration
3. Implement Phase 2: Week View Enhancement
4. Implement Phase 3: Visual Polish
5. Create comprehensive documentation
6. Commit and push changes

---

**Last Updated:** 2026-01-16
**Status:** Plan Complete - Ready to Implement
**Target Completion:** Week 8 (Phase 5)
