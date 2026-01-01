import React, { useState, useEffect } from 'react';
import type { Activity, Client, Project } from '../types';
import { ActivityType, ActivityStatus } from '../types';
import { Modal } from './Modal';
import { AiEnhancedTextarea } from './AiEnhancedTextarea';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, Checkbox } from './ui/Select';

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Omit<Activity, 'createdById'> & { id?: string }) => void;
  clients: Client[];
  projects: Project[];
  activityToEdit?: Activity | null;
}

const initialFormData = {
    type: ActivityType.Call,
    title: "",
    clientId: "",
    projectId: "",
    activityDate: new Date().toISOString().split('T')[0],
    activityTime: "",
    status: ActivityStatus.Completed,
    notes: "",
    sharedWithClient: false,
};

export const ActivityDialog: React.FC<ActivityDialogProps> = ({ isOpen, onClose, onSave, clients, projects, activityToEdit }) => {
  const [formData, setFormData] = useState<Omit<Activity, 'id' | 'createdById' | 'activityDate'> & { activityDate: string; }>(initialFormData as any);
  
  useEffect(() => {
    if (isOpen) {
      if (activityToEdit) {
        setFormData({
          ...activityToEdit,
          clientId: activityToEdit.clientId || "",
          projectId: activityToEdit.projectId || "",
          activityTime: activityToEdit.activityTime || "",
          notes: activityToEdit.notes || "",
        });
      } else {
        setFormData(initialFormData as any);
      }
    }
  }, [isOpen, activityToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
        alert("Title is required.");
        return;
    }
    onSave({
        ...formData,
        clientId: formData.clientId || null,
        projectId: formData.projectId || null,
        id: activityToEdit?.id,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({
        ...prev, 
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTextareaChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activityToEdit ? "Edit Activity" : "Log New Activity"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
                label="Activity Type *"
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => handleSelectChange('type', e.target.value)}
                options={Object.values(ActivityType).map(type => ({ value: type, label: type }))}
                fullWidth
            />
            <Select
                label="Status *"
                id="status"
                name="status"
                value={formData.status}
                onChange={(e) => handleSelectChange('status', e.target.value)}
                options={Object.values(ActivityStatus).map(status => ({ value: status, label: status }))}
                fullWidth
            />
        </div>

        <Input
            label="Title *"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            fullWidth
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
                label="Related Client"
                id="clientId"
                name="clientId"
                value={formData.clientId || ''}
                onChange={handleChange}
                options={[
                    { value: '', label: 'None' },
                    ...clients.map(client => ({ value: client.id, label: client.name }))
                ]}
                fullWidth
            />
            <Select
                label="Related Project"
                id="projectId"
                name="projectId"
                value={formData.projectId || ''}
                onChange={handleChange}
                options={[
                    { value: '', label: 'None' },
                    ...projects.map(project => ({ value: project.id, label: project.name }))
                ]}
                fullWidth
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
                label="Date"
                type="date"
                id="activityDate"
                name="activityDate"
                value={formData.activityDate}
                onChange={handleChange}
                fullWidth
            />
            <Input
                label="Time"
                type="time"
                id="activityTime"
                name="activityTime"
                value={formData.activityTime || ''}
                onChange={handleChange}
                fullWidth
            />
        </div>

        <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
            <AiEnhancedTextarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onValueChange={(value) => handleTextareaChange('notes', value)}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:border-rose-400"
            />
        </div>

        <Checkbox
            id="sharedWithClient"
            name="sharedWithClient"
            checked={formData.sharedWithClient || false}
            onChange={handleChange}
            label="Share this activity with the client portal"
        />

        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">Save Activity</Button>
        </div>
      </form>
    </Modal>
  );
};