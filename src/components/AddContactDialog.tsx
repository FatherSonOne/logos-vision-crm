import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Client } from '../types';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Client, 'id' | 'createdAt'>) => void;
}

export const AddContactDialog: React.FC<AddContactDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).every(field => typeof field === 'string' && field.trim())) {
      onSave(formData);
      handleClose();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
  };

  const handleClose = () => {
    setFormData({ name: '', contactPerson: '', email: '', phone: '', location: '' });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Contact">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Organization Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Global Health Initiative"
          required
          fullWidth
          autoComplete="organization"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Person"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="e.g., Dr. Emily Carter"
            required
            fullWidth
            autoComplete="name"
          />
          <Input
            label="Email Address"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g., ecarter@ghi.org"
            required
            fullWidth
            autoComplete="email"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 555-0101"
            required
            fullWidth
            autoComplete="tel"
          />
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
            <LocationAutocompleteInput
              id="location"
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              placeholder="e.g., New York, NY"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:focus:border-rose-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add Contact</Button>
        </div>
      </form>
    </Modal>
  );
};
