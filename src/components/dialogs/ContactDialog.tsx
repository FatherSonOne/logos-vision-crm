import React, { useState, useEffect } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, FileText, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { contactService } from '../../services/contactService';
import type { Contact } from '../../types';

interface ContactDialogProps {
  contact?: Contact | null; // If provided, we're editing; otherwise creating
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contact: Contact) => void;
}

const DONOR_STAGES = [
  'Prospect',
  'First-time Donor',
  'Repeat Donor',
  'Major Donor',
  'Lapsed',
];

const ENGAGEMENT_LEVELS = ['low', 'medium', 'high'] as const;

export const ContactDialog: React.FC<ContactDialogProps> = ({
  contact,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!contact;

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

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
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
  }, [contact]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
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
      onClose();
    } catch (err) {
      console.error('Error saving contact:', err);
      setError('Failed to save contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-xl"
        style={{
          backgroundColor: 'var(--cmf-background)',
          border: '1px solid var(--cmf-border)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 z-10"
          style={{
            backgroundColor: 'var(--cmf-background)',
            borderBottom: '1px solid var(--cmf-border)',
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cmf-text)' }}>
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--cmf-error-muted)',
                color: 'var(--cmf-error)',
              }}
            >
              {error}
            </div>
          )}

          {/* Name Section */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Contact Info Section */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <Mail className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <MapPin className="w-4 h-4" />
              Address
            </h3>
            <div className="space-y-4">
              <Input
                label="Street Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St"
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Charleston"
                />
                <Input
                  label="State"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="SC"
                />
                <Input
                  label="ZIP"
                  value={formData.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  placeholder="29401"
                />
              </div>
            </div>
          </div>

          {/* CRM Info Section */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <Building2 className="w-4 h-4" />
              CRM Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Contact Type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="individual">Individual</option>
                <option value="organization_contact">Organization Contact</option>
              </Select>
              <Select
                label="Engagement Score"
                value={formData.engagementScore}
                onChange={(e) => handleChange('engagementScore', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <Select
                label="Donor Stage"
                value={formData.donorStage}
                onChange={(e) => handleChange('donorStage', e.target.value)}
              >
                {DONOR_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </Select>
              <Select
                label="Preferred Contact"
                value={formData.preferredContactMethod}
                onChange={(e) => handleChange('preferredContactMethod', e.target.value)}
              >
                <option value="">No preference</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text</option>
                <option value="mail">Mail</option>
              </Select>
            </div>
          </div>

          {/* Communication Preferences */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--cmf-text)' }}
            >
              Communication Preferences
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emailOptIn}
                  onChange={(e) => handleChange('emailOptIn', e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: 'var(--cmf-text-secondary)' }}>Email opt-in</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletterSubscriber}
                  onChange={(e) => handleChange('newsletterSubscriber', e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: 'var(--cmf-text-secondary)' }}>Newsletter</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.doNotEmail}
                  onChange={(e) => handleChange('doNotEmail', e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: 'var(--cmf-text-secondary)' }}>Do not email</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.doNotCall}
                  onChange={(e) => handleChange('doNotCall', e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: 'var(--cmf-text-secondary)' }}>Do not call</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.doNotMail}
                  onChange={(e) => handleChange('doNotMail', e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: 'var(--cmf-text-secondary)' }}>Do not mail</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.doNotText}
                  onChange={(e) => handleChange('doNotText', e.target.checked)}
                  className="rounded"
                />
                <span style={{ color: 'var(--cmf-text-secondary)' }}>Do not text</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <FileText className="w-4 h-4" />
              Notes
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any notes about this contact..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--cmf-surface-2)',
                border: '1px solid var(--cmf-border)',
                color: 'var(--cmf-text)',
              }}
            />
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--cmf-border)' }}
          >
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2"
                    style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Add Contact'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

ContactDialog.displayName = 'ContactDialog';

export default ContactDialog;
