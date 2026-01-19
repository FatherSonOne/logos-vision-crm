import React, { useState } from 'react';
import { Calendar, Clock, Users, MapPin, FileText, CheckCircle, X } from 'lucide-react';

interface QuickEventCreateProps {
  date: Date;
  hour?: number;
  onClose: () => void;
  onCreate: (event: {
    title: string;
    type: 'meeting' | 'task' | 'deadline' | 'call' | 'event';
    date: Date;
    duration: number;
    description?: string;
  }) => void;
  position?: { x: number; y: number };
}

const eventTemplates = [
  { type: 'meeting' as const, label: 'Meeting', icon: '👥', color: 'from-pink-500 to-rose-500', defaultDuration: 60, defaultTitle: 'Team Meeting' },
  { type: 'call' as const, label: 'Call', icon: '📞', color: 'from-purple-500 to-indigo-500', defaultDuration: 30, defaultTitle: 'Phone Call' },
  { type: 'task' as const, label: 'Task', icon: '✓', color: 'from-blue-500 to-cyan-500', defaultDuration: 120, defaultTitle: 'Task' },
  { type: 'deadline' as const, label: 'Deadline', icon: '⏰', color: 'from-orange-500 to-amber-500', defaultDuration: 0, defaultTitle: 'Deadline' },
  { type: 'event' as const, label: 'Event', icon: '🎯', color: 'from-emerald-500 to-teal-500', defaultDuration: 90, defaultTitle: 'Event' },
];

export const QuickEventCreate: React.FC<QuickEventCreateProps> = ({
  date,
  hour,
  onClose,
  onCreate,
  position,
}) => {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof eventTemplates[0] | null>(null);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');

  const handleTemplateSelect = (template: typeof eventTemplates[0]) => {
    setSelectedTemplate(template);
    setTitle(template.defaultTitle);
    setDuration(template.defaultDuration);
    setStep('details');
  };

  const handleCreate = () => {
    if (!selectedTemplate || !title.trim()) return;

    const eventDate = new Date(date);
    if (hour !== undefined) {
      eventDate.setHours(hour, 0, 0, 0);
    }

    onCreate({
      title: title.trim(),
      type: selectedTemplate.type,
      date: eventDate,
      duration,
      description: description.trim() || undefined,
    });

    onClose();
  };

  const getSmartTimeLabel = () => {
    if (hour === undefined) return 'All day';
    const hourLabel = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    return hourLabel;
  };

  const getSmartGreeting = () => {
    if (hour === undefined) return 'What are you planning?';
    if (hour < 12) return 'Good morning! What\'s on the agenda?';
    if (hour < 17) return 'Good afternoon! What\'s next?';
    return 'Good evening! Planning ahead?';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Quick Create Popup */}
      <div
        className="fixed z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-scale-in"
        style={{
          left: position?.x ? `${position.x}px` : '50%',
          top: position?.y ? `${position.y}px` : '50%',
          transform: position ? 'translate(-50%, -120%)' : 'translate(-50%, -50%)',
          maxWidth: '420px',
          width: 'calc(100vw - 32px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {step === 'template' ? 'Quick Create' : `New ${selectedTemplate?.label}`}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {hour !== undefined && ` • ${getSmartTimeLabel()}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Template Selection */}
        {step === 'template' && (
          <div className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {getSmartGreeting()}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {eventTemplates.map((template) => (
                <button
                  key={template.type}
                  onClick={() => handleTemplateSelect(template)}
                  className={`
                    group relative p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700
                    hover:border-rose-300 dark:hover:border-rose-600
                    transition-all duration-200
                    hover:shadow-lg hover:scale-105
                    flex flex-col items-center gap-2
                  `}
                >
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl bg-gradient-to-br ${template.color}
                    flex items-center justify-center text-2xl
                    group-hover:scale-110 transition-transform
                  `}>
                    {template.icon}
                  </div>

                  {/* Label */}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {template.label}
                  </span>

                  {/* Duration hint */}
                  {template.defaultDuration > 0 && (
                    <span className="text-xs text-slate-500">
                      {template.defaultDuration} min
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && selectedTemplate && (
          <div className="p-6 space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                  bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                  focus:ring-2 focus:ring-rose-500 focus:border-transparent
                  placeholder-slate-400"
                placeholder={`Enter ${selectedTemplate.label.toLowerCase()} title...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && title.trim()) {
                    handleCreate();
                  }
                }}
              />
            </div>

            {/* Duration */}
            {selectedTemplate.defaultDuration > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Duration
                </label>
                <div className="flex gap-2">
                  {[15, 30, 60, 90, 120].map((min) => (
                    <button
                      key={min}
                      onClick={() => setDuration(min)}
                      className={`
                        flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${duration === min
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }
                      `}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                  bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                  focus:ring-2 focus:ring-rose-500 focus:border-transparent
                  placeholder-slate-400 resize-none"
                placeholder="Add details..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('template')}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                  text-slate-700 dark:text-slate-300 font-medium
                  hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500
                  hover:from-rose-600 hover:to-pink-600
                  text-white font-medium rounded-lg transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                  shadow-md hover:shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 10px)) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};
