import React, { useState } from 'react';
import { RelationshipTimeline } from './relationship/RelationshipTimeline';
import { relationshipTimelineService } from '../services/relationshipTimelineService';
import type { UnifiedTimelineEvent } from '../types';

export const TimelineDemo: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<UnifiedTimelineEvent | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    eventType: 'Call',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    projectId: '',
  });

  // Sample team members
  const sampleTeamMembers = [
    { id: '1', name: 'Sarah Johnson' },
    { id: '2', name: 'Michael Chen' },
    { id: '3', name: 'Emily Davis' },
  ];

  // Sample projects
  const sampleProjects = [
    { id: '1', name: 'Hope Harbor Foundation' },
    { id: '2', name: 'United Way Campaign' },
    { id: '3', name: 'Community Center' },
  ];

  const handleEventClick = (event: UnifiedTimelineEvent) => {
    setSelectedEvent(event);
    console.log('Event clicked:', event);
  };

  const handleAddEvent = () => {
    setShowAddEventModal(true);
    // Reset form data
    setFormData({
      eventType: 'Call',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      projectId: '',
    });
  };

  const handleSaveEvent = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    setIsSaving(true);
    try {
      await relationshipTimelineService.createActivity({
        type: formData.eventType,
        title: formData.title,
        description: formData.description,
        activityDate: formData.date,
        activityTime: formData.time || undefined,
        projectId: formData.projectId || undefined,
        // clientId is optional - if not provided, activity won't be linked to a specific contact
      });

      setShowAddEventModal(false);
      alert('Event created successfully!');
      // Reload the page to show the new event
      window.location.reload();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Demo Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Relationship Timeline Demo
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              This is a demonstration of the new vertical timeline component. Connect it to real data by providing an entity ID and type.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Component */}
      <div className="flex-1 overflow-hidden">
        <RelationshipTimeline
          entityId="demo-contact-1"
          entityName="John Smith (Demo)"
          entityType="contact"
          teamMembers={sampleTeamMembers}
          projects={sampleProjects}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
        />
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddEventModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Add Timeline Event
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Create a new activity, task, or interaction
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="event-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    id="event-type"
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option>Call</option>
                    <option>Email</option>
                    <option>Meeting</option>
                    <option>Note</option>
                    <option>Task</option>
                    <option>Donation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="event-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title
                  </label>
                  <input
                    id="event-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Follow-up call with donor"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="event-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="event-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Add details about this event..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="event-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Time
                    </label>
                    <input
                      id="event-time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event-project" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Project (Optional)
                  </label>
                  <select
                    id="event-project"
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">None</option>
                    {sampleProjects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal (if event selected) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedEvent.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedEvent.source.replace('_', ' ')} • {selectedEvent.timestamp.toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedEvent.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h3>
                  <p className="text-slate-600 dark:text-slate-400">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedEvent.status && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</h3>
                    <p className="text-slate-600 dark:text-slate-400">{selectedEvent.status}</p>
                  </div>
                )}
                {selectedEvent.priority && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</h3>
                    <p className="text-slate-600 dark:text-slate-400 capitalize">{selectedEvent.priority}</p>
                  </div>
                )}
                {selectedEvent.createdByName && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Created By</h3>
                    <p className="text-slate-600 dark:text-slate-400">{selectedEvent.createdByName}</p>
                  </div>
                )}
                {selectedEvent.amount && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount</h3>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      ${selectedEvent.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
