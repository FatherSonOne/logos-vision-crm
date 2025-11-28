import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Volunteer, Client, Project } from '../types';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import { volunteerSchema } from '../utils/validations';
import { z } from 'zod';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validData = volunteerSchema.parse({
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      });

      onSave(validData);
      handleClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
    }
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
    setErrors({});
    onClose();
  }

  const getInputStyles = (fieldName: string) => {
    const baseStyles = "w-full p-2 bg-slate-100 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400";
    const errorStyles = errors[fieldName]
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-300";
    return `${baseStyles} ${errorStyles}`;
  };

  const labelStyles = "block text-sm font-medium text-slate-700 mb-1";
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Volunteer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelStyles}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputStyles('name')}
                  autoComplete="name"
                  placeholder="e.g., John Smith"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>
            <div>
                <label className={labelStyles}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputStyles('email')}
                  autoComplete="email"
                  placeholder="e.g., john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label className={labelStyles}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={getInputStyles('phone')}
                  autoComplete="tel"
                  placeholder="e.g., (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
            </div>
             <div>
                <label className={labelStyles}>
                  Location <span className="text-red-500">*</span>
                </label>
                <LocationAutocompleteInput
                  name="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  className={getInputStyles('location')}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
            </div>
        </div>
        <div>
            <label className={labelStyles}>
              Skills (comma-separated) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className={getInputStyles('skills')}
              placeholder="e.g., Marketing, Graphic Design, Writing"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
            )}
        </div>
         <div>
            <label className={labelStyles}>
              Availability <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className={getInputStyles('availability')}
              placeholder="e.g., Weekends, Mon/Wed evenings"
            />
            {errors.availability && (
              <p className="mt-1 text-sm text-red-600">{errors.availability}</p>
            )}
        </div>
        
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className={labelStyles}>Assign to Projects</label>
                <select
                  multiple
                  name="assignedProjectIds"
                  value={formData.assignedProjectIds}
                  onChange={(e) => handleMultiSelectChange(e, 'assignedProjectIds')}
                  className={`${getInputStyles('assignedProjectIds')} h-24`}
                >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
             <div>
                <label className={labelStyles}>Assign to Clients</label>
                <select
                  multiple
                  name="assignedClientIds"
                  value={formData.assignedClientIds}
                  onChange={(e) => handleMultiSelectChange(e, 'assignedClientIds')}
                  className={`${getInputStyles('assignedClientIds')} h-24`}
                >
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-md text-sm font-semibold hover:from-indigo-700 hover:to-violet-700">Add Volunteer</button>
        </div>
      </form>
    </Modal>
  );
};
