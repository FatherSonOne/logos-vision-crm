/**
 * AddContactSlideOut - Slide-out panel for adding/editing contacts
 * =================================================================
 * Clean, animated slide-out panel with form fields for contact creation.
 * Uses CMF design tokens for consistent styling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Save,
  ChevronDown,
} from 'lucide-react';
import { contactService } from '../services/contactService';
import type { Contact } from '../types';

interface AddContactSlideOutProps {
  isOpen: boolean;
  contact?: Contact | null; // If provided, we're editing
  onClose: () => void;
  onSuccess: (contact: Contact) => void;
}

const DONOR_STAGES = [
  { value: 'Prospect', label: 'Prospect' },
  { value: 'First-time Donor', label: 'First-time Donor' },
  { value: 'Repeat Donor', label: 'Repeat Donor' },
  { value: 'Major Donor', label: 'Major Donor' },
  { value: 'Lapsed', label: 'Lapsed' },
];

const ENGAGEMENT_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const CONTACT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'organization_contact', label: 'Organization Contact' },
];

const PREFERRED_CONTACT_METHODS = [
  { value: '', label: 'No preference' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'text', label: 'Text' },
  { value: 'mail', label: 'Mail' },
];

// Custom styled select component
const StyledSelect: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label
      className="block text-sm font-medium mb-1.5"
      style={{ color: 'var(--cmf-text-secondary)' }}
    >
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2.5 pr-10 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border-strong)',
          color: 'var(--cmf-text)',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--cmf-text-muted)' }}
      />
    </div>
  </div>
);

// Custom styled input component
const StyledInput: React.FC<{
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}> = ({ label, value, type = 'text', placeholder, onChange }) => (
  <div>
    <label
      className="block text-sm font-medium mb-1.5"
      style={{ color: 'var(--cmf-text-secondary)' }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
      style={{
        backgroundColor: 'var(--cmf-surface)',
        border: '1px solid var(--cmf-border-strong)',
        color: 'var(--cmf-text)',
      }}
    />
  </div>
);

// Custom styled checkbox
const StyledCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
    <div
      className="w-4 h-4 rounded flex items-center justify-center transition-all"
      style={{
        backgroundColor: checked ? 'var(--cmf-accent)' : 'var(--cmf-surface)',
        border: `1.5px solid ${checked ? 'var(--cmf-accent)' : 'var(--cmf-border-strong)'}`,
      }}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only"
    />
    <span
      className="group-hover:opacity-80 transition-opacity"
      style={{ color: 'var(--cmf-text-secondary)' }}
    >
      {label}
    </span>
  </label>
);

export const AddContactSlideOut: React.FC<AddContactSlideOutProps> = ({
  isOpen,
  contact,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!contact;
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'individual' as 'individual' | 'organization_contact',
    engagementScore: 'low' as 'low' | 'medium' | 'high',
    donorStage: 'Prospect',
    notes: '',
    preferredContactMethod: '' as '' | 'email' | 'phone' | 'text' | 'mail',
    doNotEmail: false,
    doNotCall: false,
    doNotMail: false,
    doNotText: false,
    emailOptIn: true,
    newsletterSubscriber: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        zipCode: contact.zipCode || '',
        type: contact.type,
        engagementScore: contact.engagementScore,
        donorStage: contact.donorStage,
        notes: contact.notes || '',
        preferredContactMethod: (contact.preferredContactMethod as any) || '',
        doNotEmail: contact.doNotEmail || false,
        doNotCall: contact.doNotCall || false,
        doNotMail: contact.doNotMail || false,
        doNotText: contact.doNotText || false,
        emailOptIn: contact.emailOptIn ?? true,
        newsletterSubscriber: contact.newsletterSubscriber || false,
      });
    } else {
      // Reset form for new contact
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        type: 'individual',
        engagementScore: 'low',
        donorStage: 'Prospect',
        notes: '',
        preferredContactMethod: '',
        doNotEmail: false,
        doNotCall: false,
        doNotMail: false,
        doNotText: false,
        emailOptIn: true,
        newsletterSubscriber: false,
      });
    }
    setError(null);
  }, [contact, isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName && !formData.lastName) {
      setError('Please enter at least a first or last name');
      return;
    }

    setSaving(true);

    try {
      const name = [formData.firstName, formData.lastName].filter(Boolean).join(' ');

      const contactData = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        type: formData.type,
        engagementScore: formData.engagementScore,
        donorStage: formData.donorStage,
        notes: formData.notes || null,
        preferredContactMethod: formData.preferredContactMethod || null,
        doNotEmail: formData.doNotEmail,
        doNotCall: formData.doNotCall,
        doNotMail: formData.doNotMail,
        doNotText: formData.doNotText,
        emailOptIn: formData.emailOptIn,
        newsletterSubscriber: formData.newsletterSubscriber,
        isActive: true,
        totalLifetimeGiving: contact?.totalLifetimeGiving || 0,
        lastGiftDate: contact?.lastGiftDate || null,
      };

      let result: Contact;

      if (isEditing && contact) {
        result = await contactService.update(contact.id, contactData);
      } else {
        result = await contactService.create(contactData);
      }

      onSuccess(result);
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          opacity: isAnimating ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 'min(500px, 90vw)',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          backgroundColor: 'var(--cmf-bg)',
          borderLeft: '1px solid var(--cmf-border)',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--cmf-border)' }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--cmf-text)' }}>
              {isEditing ? 'Edit Contact' : 'Add New Contact'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              {isEditing ? 'Update contact information' : 'Create a new contact record'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-black/5"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div
                className="p-3 rounded-lg text-sm flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--cmf-error-muted)',
                  color: 'var(--cmf-error)',
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Personal Information */}
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StyledInput
                  label="First Name"
                  value={formData.firstName}
                  placeholder="John"
                  onChange={(v) => handleChange('firstName', v)}
                />
                <StyledInput
                  label="Last Name"
                  value={formData.lastName}
                  placeholder="Doe"
                  onChange={(v) => handleChange('lastName', v)}
                />
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <Mail className="w-4 h-4" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <StyledInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  placeholder="john@example.com"
                  onChange={(v) => handleChange('email', v)}
                />
                <StyledInput
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  placeholder="(555) 123-4567"
                  onChange={(v) => handleChange('phone', v)}
                />
              </div>
            </section>

            {/* Address */}
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <MapPin className="w-4 h-4" />
                Address
              </h3>
              <div className="space-y-4">
                <StyledInput
                  label="Street Address"
                  value={formData.address}
                  placeholder="123 Main St"
                  onChange={(v) => handleChange('address', v)}
                />
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <StyledInput
                      label="City"
                      value={formData.city}
                      placeholder="Charleston"
                      onChange={(v) => handleChange('city', v)}
                    />
                  </div>
                  <div className="col-span-1">
                    <StyledInput
                      label="State"
                      value={formData.state}
                      placeholder="SC"
                      onChange={(v) => handleChange('state', v)}
                    />
                  </div>
                  <div className="col-span-2">
                    <StyledInput
                      label="ZIP"
                      value={formData.zipCode}
                      placeholder="29401"
                      onChange={(v) => handleChange('zipCode', v)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* CRM Information */}
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <Building2 className="w-4 h-4" />
                CRM Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <StyledSelect
                  label="Contact Type"
                  value={formData.type}
                  options={CONTACT_TYPES}
                  onChange={(v) => handleChange('type', v)}
                />
                <StyledSelect
                  label="Engagement Score"
                  value={formData.engagementScore}
                  options={ENGAGEMENT_LEVELS}
                  onChange={(v) => handleChange('engagementScore', v)}
                />
                <StyledSelect
                  label="Donor Stage"
                  value={formData.donorStage}
                  options={DONOR_STAGES}
                  onChange={(v) => handleChange('donorStage', v)}
                />
                <StyledSelect
                  label="Preferred Contact"
                  value={formData.preferredContactMethod}
                  options={PREFERRED_CONTACT_METHODS}
                  onChange={(v) => handleChange('preferredContactMethod', v)}
                />
              </div>
            </section>

            {/* Communication Preferences */}
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Communication Preferences
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <StyledCheckbox
                  label="Email opt-in"
                  checked={formData.emailOptIn}
                  onChange={(v) => handleChange('emailOptIn', v)}
                />
                <StyledCheckbox
                  label="Newsletter"
                  checked={formData.newsletterSubscriber}
                  onChange={(v) => handleChange('newsletterSubscriber', v)}
                />
                <StyledCheckbox
                  label="Do not email"
                  checked={formData.doNotEmail}
                  onChange={(v) => handleChange('doNotEmail', v)}
                />
                <StyledCheckbox
                  label="Do not call"
                  checked={formData.doNotCall}
                  onChange={(v) => handleChange('doNotCall', v)}
                />
                <StyledCheckbox
                  label="Do not mail"
                  checked={formData.doNotMail}
                  onChange={(v) => handleChange('doNotMail', v)}
                />
                <StyledCheckbox
                  label="Do not text"
                  checked={formData.doNotText}
                  onChange={(v) => handleChange('doNotText', v)}
                />
              </div>
            </section>

            {/* Notes */}
            <section>
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <FileText className="w-4 h-4" />
                Notes
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any notes about this contact..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg resize-none text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--cmf-surface)',
                  border: '1px solid var(--cmf-border-strong)',
                  color: 'var(--cmf-text)',
                }}
              />
            </section>
          </form>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{
            borderTop: '1px solid var(--cmf-border)',
            backgroundColor: 'var(--cmf-surface)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-black/5 disabled:opacity-50"
            style={{ color: 'var(--cmf-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--cmf-accent)' }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Add Contact'}
              </>
            )}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AddContactSlideOut;
