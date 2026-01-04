import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, MapPin, Globe, FileText, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { organizationService } from '../../services/organizationService';
import type { Organization, OrganizationType } from '../../types';
import { ORGANIZATION_TYPE_LABELS } from '../../types';

interface OrganizationDialogProps {
  organization?: Organization | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (organization: Organization) => void;
}

const ORG_TYPES: OrganizationType[] = ['nonprofit', 'foundation', 'corporation', 'government', 'other'];

export const OrganizationDialog: React.FC<OrganizationDialogProps> = ({
  organization,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!organization;

  const [formData, setFormData] = useState({
    name: '',
    orgType: 'nonprofit' as OrganizationType,
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ein: '',
    missionStatement: '',
    notes: '',
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
    if (organization) {
      setFormData({
        name: organization.name || '',
        orgType: organization.orgType,
        email: organization.email || '',
        phone: organization.phone || '',
        website: organization.website || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        zipCode: organization.zipCode || '',
        ein: organization.ein || '',
        missionStatement: organization.missionStatement || '',
        notes: organization.notes || '',
      });
    } else {
      // Reset form for new organization
      setFormData({
        name: '',
        orgType: 'nonprofit',
        email: '',
        phone: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        ein: '',
        missionStatement: '',
        notes: '',
      });
    }
  }, [organization]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Organization name is required');
      return;
    }

    setSaving(true);

    try {
      const orgData = {
        name: formData.name.trim(),
        orgType: formData.orgType,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zipCode: formData.zipCode || null,
        ein: formData.ein || null,
        missionStatement: formData.missionStatement || null,
        notes: formData.notes || null,
        isActive: true,
        primaryContactId: organization?.primaryContactId || null,
        parentOrgId: organization?.parentOrgId || null,
      };

      let result: Organization;

      if (isEditing && organization) {
        result = await organizationService.update(organization.id, orgData);
      } else {
        result = await organizationService.create(orgData);
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      console.error('Error saving organization:', err);
      setError('Failed to save organization. Please try again.');
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
            {isEditing ? 'Edit Organization' : 'Add New Organization'}
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

          {/* Basic Info Section */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <Building2 className="w-4 h-4" />
              Organization Information
            </h3>
            <div className="space-y-4">
              <Input
                label="Organization Name *"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Hope Harbor Foundation"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Organization Type"
                  value={formData.orgType}
                  onChange={(e) => handleChange('orgType', e.target.value)}
                >
                  {ORG_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {ORGANIZATION_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Select>
                <Input
                  label="EIN / Tax ID"
                  value={formData.ein}
                  onChange={(e) => handleChange('ein', e.target.value)}
                  placeholder="12-3456789"
                />
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="info@organization.org"
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                <Input
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.organization.org"
                  className="flex-1"
                />
              </div>
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
                placeholder="123 Main St, Suite 100"
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

          {/* Mission Statement */}
          <div>
            <h3
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--cmf-text)' }}
            >
              <FileText className="w-4 h-4" />
              Mission Statement
            </h3>
            <textarea
              value={formData.missionStatement}
              onChange={(e) => handleChange('missionStatement', e.target.value)}
              placeholder="Describe the organization's mission..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg resize-none focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--cmf-surface-2)',
                border: '1px solid var(--cmf-border)',
                color: 'var(--cmf-text)',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--cmf-text)' }}
            >
              Notes
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any notes about this organization..."
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
                  {isEditing ? 'Save Changes' : 'Add Organization'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

OrganizationDialog.displayName = 'OrganizationDialog';

export default OrganizationDialog;
