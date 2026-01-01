import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Volunteer, Client, Project } from '../types';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddVolunteerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: Omit<Volunteer, 'id'>) => void;
  clients: Client[];
  projects: Project[];
}

const initialFormData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    skills: '',
    availability: '',
    assignedProjectIds: [],
    assignedClientIds: [],
};

export const AddVolunteerDialog: React.FC<AddVolunteerDialogProps> = ({ isOpen, onClose, onSave, clients, projects }) => {
  const [formData, setFormData] = useState<Omit<Volunteer, 'id' | 'skills'> & { skills: string }>(initialFormData as any);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some(field => typeof field === 'string' && !field.trim())) {
        alert("Please fill out all required fields.");
        return;
    }
    onSave({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
    });
    handleClose();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({...prev, location: value}));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: 'assignedProjectIds' | 'assignedClientIds') => {
    const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    setFormData(prev => ({ ...prev, [field]: options }));
  };

  const handleClose = () => {
    setFormData(initialFormData as any);
    onClose();
  }

  const selectStyles = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:border-rose-400";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Volunteer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" name="name" value={formData.name} onChange={handleChange} required fullWidth autoComplete="name" />
          <Input label="Email *" type="email" name="email" value={formData.email} onChange={handleChange} required fullWidth autoComplete="email" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone *" type="tel" name="phone" value={formData.phone} onChange={handleChange} required fullWidth autoComplete="tel" />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location *</label>
            <LocationAutocompleteInput name="location" value={formData.location} onChange={handleLocationChange} required className={selectStyles} />
          </div>
        </div>
        <Input label="Skills (comma-separated)" name="skills" value={formData.skills} onChange={handleChange} fullWidth />
        <Input label="Availability *" name="availability" value={formData.availability} onChange={handleChange} required fullWidth placeholder="e.g., Weekends, Mon/Wed evenings" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign to Projects</label>
            <select multiple name="assignedProjectIds" value={formData.assignedProjectIds} onChange={(e) => handleMultiSelectChange(e, 'assignedProjectIds')} className={`${selectStyles} h-24`}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign to Clients</label>
            <select multiple name="assignedClientIds" value={formData.assignedClientIds} onChange={(e) => handleMultiSelectChange(e, 'assignedClientIds')} className={`${selectStyles} h-24`}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add Volunteer</Button>
        </div>
      </form>
    </Modal>
  );
};
