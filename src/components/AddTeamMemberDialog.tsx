import React, { useState } from 'react';
import { Modal } from './Modal';
import type { TeamMember } from '../types';
import { teamMemberSchema } from '../utils/validations';
import { z } from 'zod';

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<TeamMember, 'id'>) => void;
}

export const AddTeamMemberDialog: React.FC<AddTeamMemberDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validData = teamMemberSchema.parse({
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        phone: phone.trim() || undefined,
      });

      onSave(validData);

      // Reset form
      setName('');
      setEmail('');
      setRole('');
      setPhone('');
      setErrors({});
      onClose();
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

  const handleClose = () => {
    setName('');
    setEmail('');
    setRole('');
    setPhone('');
    setErrors({});
    onClose();
  }

  const inputStyles = "w-full p-2 bg-slate-100 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400 dark:bg-slate-700/50 dark:border-slate-600 dark:text-white dark:placeholder-slate-400";
  const errorInputStyles = "w-full p-2 bg-slate-100 border border-red-500 rounded-md focus:ring-red-500 focus:border-red-500 text-slate-900 placeholder-slate-400 dark:bg-slate-700/50 dark:border-red-500 dark:text-white dark:placeholder-slate-400";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe"
            className={errors.name ? errorInputStyles : inputStyles}
            autoComplete="name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., jane.doe@example.com"
            className={errors.email ? errorInputStyles : inputStyles}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Project Manager"
            className={errors.role ? errorInputStyles : inputStyles}
            autoComplete="organization-title"
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., (555) 123-4567"
            className={errors.phone ? errorInputStyles : inputStyles}
            autoComplete="tel"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-md text-sm font-semibold hover:from-teal-700 hover:to-cyan-700"
          >
            Add Member
          </button>
        </div>
      </form>
    </Modal>
  );
};