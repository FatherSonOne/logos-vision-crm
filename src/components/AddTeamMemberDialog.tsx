import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import type { TeamMember, CustomField, CustomFieldType, TeamMemberPermission } from '../types';
import { Button, IconButton } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { PlusIcon, TrashIcon } from './icons';
import { Camera, User, Shield, Eye, Edit3 } from 'lucide-react';

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Omit<TeamMember, 'id'>) => void;
}

// Field type categories and options
const FIELD_CATEGORIES = {
  phone: {
    label: 'Phone',
    options: [
      { value: 'mobile', label: 'Mobile' },
      { value: 'work_phone', label: 'Work Phone' },
      { value: 'home_phone', label: 'Home Phone' },
      { value: 'fax', label: 'Fax' },
      { value: 'other_phone', label: 'Other Phone' },
    ],
  },
  social: {
    label: 'Social',
    options: [
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'twitter', label: 'Twitter/X' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'website', label: 'Website' },
    ],
  },
  work: {
    label: 'Work',
    options: [
      { value: 'department', label: 'Department' },
      { value: 'title', label: 'Job Title' },
      { value: 'manager', label: 'Manager' },
      { value: 'start_date', label: 'Start Date' },
      { value: 'location', label: 'Office Location' },
      { value: 'employee_id', label: 'Employee ID' },
    ],
  },
  personal: {
    label: 'Personal',
    options: [
      { value: 'birthday', label: 'Birthday' },
      { value: 'anniversary', label: 'Work Anniversary' },
      { value: 'nickname', label: 'Nickname' },
      { value: 'notes', label: 'Notes' },
    ],
  },
};

// Permission options with descriptions (like Google Drive)
const PERMISSION_OPTIONS = [
  {
    value: 'admin' as TeamMemberPermission,
    label: 'Admin',
    description: 'Can edit, delete, and manage sharing',
    icon: Shield,
  },
  {
    value: 'editor' as TeamMemberPermission,
    label: 'Editor',
    description: 'Can edit but not delete or share',
    icon: Edit3,
  },
  {
    value: 'viewer' as TeamMemberPermission,
    label: 'Viewer',
    description: 'Can only view, cannot edit',
    icon: Eye,
  },
];

// Flatten all options for the dropdown
const ALL_FIELD_OPTIONS = Object.entries(FIELD_CATEGORIES).flatMap(([, { label, options }]) =>
  options.map(opt => ({
    value: opt.value,
    label: opt.label,
    category: label,
  }))
);

// Get placeholder text based on field type
const getPlaceholder = (type: CustomFieldType): string => {
  const placeholders: Partial<Record<CustomFieldType, string>> = {
    mobile: '+1 (555) 123-4567',
    work_phone: '+1 (555) 987-6543',
    home_phone: '+1 (555) 456-7890',
    linkedin: 'linkedin.com/in/username',
    twitter: '@username',
    instagram: '@username',
    facebook: 'facebook.com/username',
    website: 'https://example.com',
    department: 'e.g., Engineering',
    title: 'e.g., Senior Developer',
    manager: 'e.g., John Smith',
    start_date: 'YYYY-MM-DD',
    location: 'e.g., New York Office',
    employee_id: 'e.g., EMP-001',
    birthday: 'YYYY-MM-DD',
    anniversary: 'YYYY-MM-DD',
    nickname: 'e.g., Johnny',
    notes: 'Additional notes...',
  };
  return placeholders[type] || 'Enter value...';
};

// Get input type based on field type
const getInputType = (type: CustomFieldType): string => {
  if (['start_date', 'birthday', 'anniversary'].includes(type)) return 'date';
  if (['mobile', 'work_phone', 'home_phone', 'fax', 'other_phone'].includes(type)) return 'tel';
  if (['website', 'linkedin', 'facebook'].includes(type)) return 'url';
  return 'text';
};

export const AddTeamMemberDialog: React.FC<AddTeamMemberDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [permission, setPermission] = useState<TeamMemberPermission>('viewer');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && role.trim()) {
      // Filter out empty custom fields
      const validCustomFields = customFields.filter(f => f.value.trim());
      onSave({
        name,
        email,
        role,
        permission,
        profilePicture,
        customFields: validCustomFields.length > 0 ? validCustomFields : undefined,
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
    setPermission('viewer');
    setProfilePicture(null);
    setCustomFields([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'mobile', // Default to mobile
      value: '',
    };
    setCustomFields([...customFields, newField]);
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(customFields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
  };

  // Group options by category for the select
  const selectOptions = ALL_FIELD_OPTIONS.map(opt => ({
    value: opt.value,
    label: `${opt.category} - ${opt.label}`,
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center pb-4">
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group transition-transform duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--cmf-surface-2)',
              border: '2px dashed var(--cmf-border-strong)',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User
                  className="w-10 h-10"
                  style={{ color: 'var(--cmf-text-muted)' }}
                />
              </div>
            )}
            {/* Hover overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm font-medium transition-colors duration-150"
            style={{ color: 'var(--cmf-accent)' }}
          >
            {profilePicture ? 'Change Photo' : 'Add Photo'}
          </button>
          {profilePicture && (
            <button
              type="button"
              onClick={() => setProfilePicture(null)}
              className="text-xs transition-colors duration-150"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              Remove
            </button>
          )}
        </div>

        {/* Required Fields */}
        <Input
          label="Full Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Jane Doe"
          required
          fullWidth
          autoComplete="name"
        />
        <Input
          label="Email Address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., jane.doe@example.com"
          required
          fullWidth
          autoComplete="email"
        />
        <Input
          label="Role / Job Title"
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Project Manager"
          required
          fullWidth
          autoComplete="organization-title"
        />

        {/* Permission Level (like Google Drive) */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--cmf-text-secondary)' }}
          >
            Permission Level
          </label>
          <div className="space-y-2">
            {PERMISSION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = permission === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setPermission(opt.value)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer
                    transition-all duration-150 hover:scale-[1.01]
                  `}
                  style={{
                    backgroundColor: isSelected ? 'var(--cmf-accent-subtle)' : 'var(--cmf-surface)',
                    border: `1px solid ${isSelected ? 'var(--cmf-accent)' : 'var(--cmf-border)'}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? 'var(--cmf-accent)' : 'var(--cmf-surface-2)',
                      color: isSelected ? 'var(--cmf-accent-text)' : 'var(--cmf-text-muted)',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-medium text-sm"
                      style={{ color: 'var(--cmf-text)' }}
                    >
                      {opt.label}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: 'var(--cmf-text-muted)' }}
                    >
                      {opt.description}
                    </div>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? 'var(--cmf-accent)' : 'var(--cmf-border-strong)',
                    }}
                  >
                    {isSelected && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: 'var(--cmf-accent)' }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div className="space-y-3 pt-2">
            <label
              className="block text-sm font-medium"
              style={{ color: 'var(--cmf-text-secondary)' }}
            >
              Additional Fields
            </label>
            {customFields.map((field) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="w-2/5">
                  <Select
                    options={selectOptions}
                    value={field.type}
                    onChange={(e) => updateCustomField(field.id, { type: e.target.value as CustomFieldType })}
                    fullWidth
                    size="sm"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type={getInputType(field.type)}
                    value={field.value}
                    onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                    placeholder={getPlaceholder(field.type)}
                    fullWidth
                    size="sm"
                  />
                </div>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomField(field.id)}
                  icon={<TrashIcon />}
                  aria-label="Remove field"
                  className="flex-shrink-0 mt-0.5"
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Field Button */}
        <button
          type="button"
          onClick={addCustomField}
          className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            color: 'var(--cmf-accent)',
            backgroundColor: 'var(--cmf-accent-subtle)',
          }}
        >
          <PlusIcon className="w-4 h-4" />
          Add Field
        </button>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add Member</Button>
        </div>
      </form>
    </Modal>
  );
};
