import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Phone, Mail, Users, Calendar } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { Button } from '../ui/Button';

interface InteractionDialogProps {
  contactId: string;
  contactName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const INTERACTION_TYPES = [
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'note', label: 'Note', icon: MessageSquare }
];

export const InteractionDialog: React.FC<InteractionDialogProps> = ({
  contactId,
  contactName,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    type: 'call',
    subject: '',
    notes: '',
    interaction_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prevent body scroll when dialog is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('activities')
        .insert({
          client_id: contactId,                 // matches your schema
          type: formData.type,                  // existing column
          title: formData.subject,              // subject → title
          description: formData.notes,          // notes → description
          activity_date: formData.interaction_date
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error logging interaction:', err);
      setError(err.message || 'Failed to log interaction');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Log Interaction</h2>
              <p className="text-sm text-gray-600">{contactName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Interaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Interaction Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {INTERACTION_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all font-medium ${
                      formData.type === type.value
                        ? 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
                        : 'border-slate-300 hover:border-slate-400 text-slate-800 bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.interaction_date}
              onChange={(e) => setFormData({ ...formData, interaction_date: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="e.g., Follow-up call about donation"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes *
            </label>
            <textarea
              required
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
              placeholder="What was discussed? Any follow-up needed?"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Log Interaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
