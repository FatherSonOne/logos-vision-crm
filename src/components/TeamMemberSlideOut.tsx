import React, { useState, useEffect, useRef } from 'react';
import type { TeamMember, CustomField, CustomFieldType, TeamMemberPermission } from '../types';
import { Button, IconButton } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { PlusIcon, TrashIcon, CloseIcon } from './icons';
import {
  User,
  Mail,
  Phone,
  Shield,
  Eye,
  Edit3,
  X,
  Camera,
  Briefcase,
  Calendar,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';

/**
 * TeamMemberSlideOut - A slide-out panel for viewing/editing team member details
 *
 * Features:
 * - View mode: Display contact details with clickable actions (call, email, message)
 * - Edit mode: Allow editing if user has admin permission
 * - Smooth slide-in animation from the left
 * - Permission-based access control (like Google Drive)
 */

interface TeamMemberSlideOutProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSave?: (member: TeamMember) => void;
  currentUserPermission: TeamMemberPermission; // The permission level of the logged-in user
  currentUserId?: string; // The ID of the logged-in user (to allow editing own card)
}

// Field type options for custom fields
const FIELD_OPTIONS = [
  { value: 'mobile', label: 'Phone - Mobile' },
  { value: 'work_phone', label: 'Phone - Work' },
  { value: 'home_phone', label: 'Phone - Home' },
  { value: 'linkedin', label: 'Social - LinkedIn' },
  { value: 'twitter', label: 'Social - Twitter/X' },
  { value: 'instagram', label: 'Social - Instagram' },
  { value: 'facebook', label: 'Social - Facebook' },
  { value: 'website', label: 'Social - Website' },
  { value: 'department', label: 'Work - Department' },
  { value: 'title', label: 'Work - Job Title' },
  { value: 'manager', label: 'Work - Manager' },
  { value: 'start_date', label: 'Work - Start Date' },
  { value: 'location', label: 'Work - Office Location' },
  { value: 'birthday', label: 'Personal - Birthday' },
  { value: 'anniversary', label: 'Personal - Anniversary' },
  { value: 'nickname', label: 'Personal - Nickname' },
  { value: 'notes', label: 'Personal - Notes' },
];

// Get icon for custom field type
const getFieldIcon = (type: CustomFieldType) => {
  const iconMap: Partial<Record<CustomFieldType, React.ReactNode>> = {
    mobile: <Phone className="w-4 h-4" />,
    work_phone: <Phone className="w-4 h-4" />,
    home_phone: <Phone className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />,
    website: <Globe className="w-4 h-4" />,
    department: <Briefcase className="w-4 h-4" />,
    title: <Briefcase className="w-4 h-4" />,
    location: <MapPin className="w-4 h-4" />,
    start_date: <Calendar className="w-4 h-4" />,
    birthday: <Calendar className="w-4 h-4" />,
    anniversary: <Calendar className="w-4 h-4" />,
  };
  return iconMap[type] || <MessageCircle className="w-4 h-4" />;
};

// Get human-readable label for field type
const getFieldLabel = (type: CustomFieldType): string => {
  const labels: Partial<Record<CustomFieldType, string>> = {
    mobile: 'Mobile',
    work_phone: 'Work Phone',
    home_phone: 'Home Phone',
    fax: 'Fax',
    other_phone: 'Other Phone',
    linkedin: 'LinkedIn',
    twitter: 'Twitter/X',
    instagram: 'Instagram',
    facebook: 'Facebook',
    website: 'Website',
    department: 'Department',
    title: 'Job Title',
    manager: 'Manager',
    start_date: 'Start Date',
    location: 'Office Location',
    employee_id: 'Employee ID',
    birthday: 'Birthday',
    anniversary: 'Work Anniversary',
    nickname: 'Nickname',
    notes: 'Notes',
  };
  return labels[type] || type;
};

// Permission badge component
const PermissionBadge: React.FC<{ permission: TeamMemberPermission }> = ({ permission }) => {
  const config = {
    admin: { icon: Shield, label: 'Admin', color: 'var(--cmf-accent)' },
    editor: { icon: Edit3, label: 'Editor', color: 'var(--cmf-warning)' },
    viewer: { icon: Eye, label: 'Viewer', color: 'var(--cmf-text-muted)' },
  };
  const { icon: Icon, label, color } = config[permission];

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
};

export const TeamMemberSlideOut: React.FC<TeamMemberSlideOutProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  currentUserPermission,
  currentUserId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<TeamMember | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Is this the current user's own card?
  const isOwnCard = currentUserId && member?.id === currentUserId;

  // Can user edit? (own card, admin, or editor with current member not admin)
  const canEdit = isOwnCard ||
    currentUserPermission === 'admin' ||
    (currentUserPermission === 'editor' && member?.permission !== 'admin');

  // Reset state when member changes or panel closes
  useEffect(() => {
    if (member) {
      setEditedMember({ ...member });
    }
    setIsEditing(false);
  }, [member, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isEditing) {
          setIsEditing(false);
          setEditedMember(member ? { ...member } : null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isEditing, member, onClose]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedMember) {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedMember({
          ...editedMember,
          profilePicture: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save
  const handleSave = () => {
    if (editedMember && onSave) {
      onSave(editedMember);
      setIsEditing(false);
    }
  };

  // Add custom field
  const addCustomField = () => {
    if (!editedMember) return;
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      type: 'mobile',
      value: '',
    };
    setEditedMember({
      ...editedMember,
      customFields: [...(editedMember.customFields || []), newField],
    });
  };

  // Update custom field
  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    if (!editedMember) return;
    setEditedMember({
      ...editedMember,
      customFields: editedMember.customFields?.map(f =>
        f.id === id ? { ...f, ...updates } : f
      ),
    });
  };

  // Remove custom field
  const removeCustomField = (id: string) => {
    if (!editedMember) return;
    setEditedMember({
      ...editedMember,
      customFields: editedMember.customFields?.filter(f => f.id !== id),
    });
  };

  const displayMember = isEditing ? editedMember : member;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={onClose}
      />

      {/* Slide-out Panel - Slides from LEFT */}
      <div
        className={`
          fixed top-0 left-0 h-full w-full max-w-md z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--cmf-bg)',
          borderRight: '1px solid var(--cmf-border)',
          boxShadow: 'var(--cmf-shadow-xl)',
        }}
      >
        {/* Only render content when we have a member */}
        {displayMember && (
          <>
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-4"
          style={{
            backgroundColor: 'var(--cmf-bg)',
            borderBottom: '1px solid var(--cmf-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--cmf-text)' }}>
              {isEditing ? 'Edit Member' : 'Member Details'}
            </h2>
            <PermissionBadge permission={displayMember.permission} />
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsEditing(false);
                  setEditedMember(member ? { ...member } : null);
                }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  icon={<X className="w-5 h-5" />}
                  aria-label="Close panel"
                />
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`relative w-28 h-28 rounded-full overflow-hidden mb-3 ${
                isEditing ? 'cursor-pointer group' : ''
              }`}
              style={{
                backgroundColor: 'var(--cmf-surface-2)',
                border: '3px solid var(--cmf-border)',
              }}
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
              {displayMember.profilePicture ? (
                <img
                  src={displayMember.profilePicture}
                  alt={displayMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12" style={{ color: 'var(--cmf-text-muted)' }} />
                </div>
              )}
              {isEditing && (
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />

            {isEditing ? (
              <Input
                value={editedMember?.name || ''}
                onChange={(e) => setEditedMember(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="text-center font-semibold text-lg"
                fullWidth
              />
            ) : (
              <h3 className="text-xl font-semibold" style={{ color: 'var(--cmf-text)' }}>
                {displayMember.name}
              </h3>
            )}

            {isEditing ? (
              <Input
                value={editedMember?.role || ''}
                onChange={(e) => setEditedMember(prev => prev ? { ...prev, role: e.target.value } : null)}
                className="text-center text-sm mt-1"
                fullWidth
                placeholder="Job title / role"
              />
            ) : (
              <p className="text-sm mt-1" style={{ color: 'var(--cmf-text-secondary)' }}>
                {displayMember.role}
              </p>
            )}
          </div>

          {/* Contact Actions (View Mode Only) */}
          {!isEditing && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              <a
                href={`mailto:${displayMember.email}`}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-150 hover:scale-105"
                style={{ backgroundColor: 'var(--cmf-surface)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--cmf-accent-subtle)', color: 'var(--cmf-accent)' }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--cmf-text-secondary)' }}>
                  Email
                </span>
              </a>
              {displayMember.phone && (
                <a
                  href={`tel:${displayMember.phone}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-150 hover:scale-105"
                  style={{ backgroundColor: 'var(--cmf-surface)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--cmf-success-muted)', color: 'var(--cmf-success)' }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--cmf-text-secondary)' }}>
                    Call
                  </span>
                </a>
              )}
              {displayMember.phone && (
                <a
                  href={`sms:${displayMember.phone}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-150 hover:scale-105"
                  style={{ backgroundColor: 'var(--cmf-surface)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--cmf-info-muted)', color: 'var(--cmf-info)' }}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--cmf-text-secondary)' }}>
                    Message
                  </span>
                </a>
              )}
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-4">
            {/* Email */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: 'var(--cmf-surface)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedMember?.email || ''}
                      onChange={(e) => setEditedMember(prev => prev ? { ...prev, email: e.target.value } : null)}
                      size="sm"
                      fullWidth
                    />
                  ) : (
                    <div>
                      <div className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>Email</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--cmf-text)' }}>
                        {displayMember.email}
                      </div>
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => copyToClipboard(displayMember.email, 'email')}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: 'var(--cmf-text-muted)' }}
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4" style={{ color: 'var(--cmf-success)' }} />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Phone */}
            {(displayMember.phone || isEditing) && (
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--cmf-surface)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editedMember?.phone || ''}
                        onChange={(e) => setEditedMember(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        size="sm"
                        fullWidth
                        placeholder="Phone number"
                      />
                    ) : (
                      <div>
                        <div className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>Phone</div>
                        <div className="text-sm font-medium" style={{ color: 'var(--cmf-text)' }}>
                          {displayMember.phone}
                        </div>
                      </div>
                    )}
                  </div>
                  {!isEditing && displayMember.phone && (
                    <button
                      onClick={() => copyToClipboard(displayMember.phone!, 'phone')}
                      className="p-1.5 rounded transition-colors"
                      style={{ color: 'var(--cmf-text-muted)' }}
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-4 h-4" style={{ color: 'var(--cmf-success)' }} />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {displayMember.customFields && displayMember.customFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium" style={{ color: 'var(--cmf-text-secondary)' }}>
                  Additional Information
                </h4>
                {displayMember.customFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--cmf-surface)' }}
                  >
                    {isEditing ? (
                      <div className="flex gap-2 items-center">
                        <Select
                          options={FIELD_OPTIONS}
                          value={field.type}
                          onChange={(e) => updateCustomField(field.id, { type: e.target.value as CustomFieldType })}
                          size="sm"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                          size="sm"
                          fullWidth
                        />
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomField(field.id)}
                          icon={<TrashIcon />}
                          aria-label="Remove field"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span style={{ color: 'var(--cmf-text-muted)' }}>
                            {getFieldIcon(field.type)}
                          </span>
                          <div>
                            <div className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                              {getFieldLabel(field.type)}
                            </div>
                            <div className="text-sm font-medium" style={{ color: 'var(--cmf-text)' }}>
                              {field.value}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(field.value, field.id)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: 'var(--cmf-text-muted)' }}
                        >
                          {copiedField === field.id ? (
                            <Check className="w-4 h-4" style={{ color: 'var(--cmf-success)' }} />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Field Button (Edit Mode) */}
            {isEditing && (
              <button
                type="button"
                onClick={addCustomField}
                className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg w-full justify-center transition-all duration-150 hover:scale-[1.02]"
                style={{
                  color: 'var(--cmf-accent)',
                  backgroundColor: 'var(--cmf-accent-subtle)',
                }}
              >
                <PlusIcon className="w-4 h-4" />
                Add Field
              </button>
            )}

            {/* Permission Editor (Admin Only) */}
            {isEditing && currentUserPermission === 'admin' && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--cmf-border)' }}>
                <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--cmf-text-secondary)' }}>
                  Permission Level
                </h4>
                <Select
                  options={[
                    { value: 'admin', label: 'Admin - Can edit, delete, and manage sharing' },
                    { value: 'editor', label: 'Editor - Can edit but not delete or share' },
                    { value: 'viewer', label: 'Viewer - Can only view, cannot edit' },
                  ]}
                  value={editedMember?.permission || 'viewer'}
                  onChange={(e) => setEditedMember(prev =>
                    prev ? { ...prev, permission: e.target.value as TeamMemberPermission } : null
                  )}
                  fullWidth
                />
              </div>
            )}
          </div>

          {/* Viewer Notice */}
          {!canEdit && !isEditing && (
            <div
              className="mt-6 p-3 rounded-lg flex items-center gap-2"
              style={{
                backgroundColor: 'var(--cmf-info-muted)',
                color: 'var(--cmf-info)',
              }}
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">You have view-only access to this member's details.</span>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </>
  );
};
