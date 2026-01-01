import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  DollarSign,
  Calendar,
  FileText,
  Edit2,
  Star,
  ChevronRight,
  ExternalLink,
  Plus,
  Network,
} from 'lucide-react';
import { Card, StatCard } from './ui/Card';
import { Badge } from './ui/Badge';
import { Tabs, Tab } from './ui/Tabs';
import { Button } from './ui/Button';
import { organizationService } from '../services/organizationService';
import type { Organization, OrganizationWithDetails, OrganizationContact } from '../types';
import {
  ORGANIZATION_TYPE_LABELS,
  ORGANIZATION_TYPE_COLORS,
  ORGANIZATION_RELATIONSHIP_LABELS,
} from '../types';

interface OrganizationSlideOutProps {
  organizationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (org: Organization) => void;
  onDelete?: (orgId: string) => void;
  onNavigateToContact?: (contactId: string) => void;
}

export const OrganizationSlideOut: React.FC<OrganizationSlideOutProps> = ({
  organizationId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onNavigateToContact,
}) => {
  const [organization, setOrganization] = useState<OrganizationWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadOrganization = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await organizationService.getWithDetails(organizationId);
      setOrganization(data);
    } catch (err) {
      console.error('Error loading organization:', err);
      setError('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (isOpen && organizationId) {
      loadOrganization();
      setActiveTab('overview');
    }
  }, [isOpen, organizationId, loadOrganization]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
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

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRelationshipLabel = (type: string) => {
    return ORGANIZATION_RELATIONSHIP_LABELS[type as keyof typeof ORGANIZATION_RELATIONSHIP_LABELS] || type;
  };

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Building2 className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            {organization?.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                <a
                  href={`mailto:${organization.email}`}
                  className="text-sm hover:underline"
                  style={{ color: 'var(--cmf-accent)' }}
                >
                  {organization.email}
                </a>
              </div>
            )}
            {organization?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                <a
                  href={`tel:${organization.phone}`}
                  className="text-sm hover:underline"
                  style={{ color: 'var(--cmf-accent)' }}
                >
                  {organization.phone}
                </a>
              </div>
            )}
            {(organization?.city || organization?.state) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                  {[organization.address, organization.city, organization.state, organization.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}
            {organization?.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline flex items-center gap-1"
                  style={{ color: 'var(--cmf-accent)' }}
                >
                  {organization.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            {organization?.ein && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                  EIN: {organization.ein}
                </span>
              </div>
            )}
          </div>

          {/* Mission Statement */}
          {organization?.missionStatement && (
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Mission Statement
              </h4>
              <p
                className="text-sm"
                style={{ color: 'var(--cmf-text-secondary)' }}
              >
                {organization.missionStatement}
              </p>
            </div>
          )}

          {/* Parent Organization */}
          {organization?.parentOrganization && (
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Parent Organization
              </h4>
              <Card variant="outlined" padding="sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${ORGANIZATION_TYPE_COLORS[organization.parentOrganization.orgType]}20`,
                    }}
                  >
                    <Building2
                      className="w-5 h-5"
                      style={{ color: ORGANIZATION_TYPE_COLORS[organization.parentOrganization.orgType] }}
                    />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                      {organization.parentOrganization.name}
                    </p>
                    <Badge
                      variant="neutral"
                      size="sm"
                    >
                      {ORGANIZATION_TYPE_LABELS[organization.parentOrganization.orgType]}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Notes */}
          {organization?.notes && (
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Notes
              </h4>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: 'var(--cmf-text-secondary)' }}
              >
                {organization.notes}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: <Users className="w-4 h-4" />,
      badge: organization?.contacts?.length || undefined,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              Affiliated Contacts
            </h4>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          </div>

          {organization?.contacts && organization.contacts.length > 0 ? (
            <div className="space-y-3">
              {organization.contacts.map((affiliation) => (
                <Card
                  key={affiliation.id}
                  variant="outlined"
                  padding="sm"
                  hoverable
                  onClick={() => onNavigateToContact?.(affiliation.contactId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                      >
                        <Users className="w-5 h-5" style={{ color: 'var(--cmf-text-muted)' }} />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                          {affiliation.contactName || 'Unknown Contact'}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span style={{ color: 'var(--cmf-text-muted)' }}>
                            {affiliation.roleTitle || getRelationshipLabel(affiliation.relationshipType)}
                          </span>
                          {affiliation.isPrimaryContact && (
                            <Badge variant="primary" size="sm">
                              <Star className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--cmf-text-muted)' }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-8"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No affiliated contacts</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'hierarchy',
      label: 'Hierarchy',
      icon: <Network className="w-4 h-4" />,
      badge: organization?.childOrganizations?.length || undefined,
      content: (
        <div className="space-y-6">
          {/* Parent Organization */}
          {organization?.parentOrganization && (
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Reports To
              </h4>
              <Card variant="outlined" padding="sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${ORGANIZATION_TYPE_COLORS[organization.parentOrganization.orgType]}20`,
                    }}
                  >
                    <Building2
                      className="w-5 h-5"
                      style={{ color: ORGANIZATION_TYPE_COLORS[organization.parentOrganization.orgType] }}
                    />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                      {organization.parentOrganization.name}
                    </p>
                    <Badge variant="neutral" size="sm">
                      {ORGANIZATION_TYPE_LABELS[organization.parentOrganization.orgType]}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Child Organizations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Child Organizations
              </h4>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Child
              </Button>
            </div>

            {organization?.childOrganizations && organization.childOrganizations.length > 0 ? (
              <div className="space-y-3">
                {organization.childOrganizations.map((child) => (
                  <Card
                    key={child.id}
                    variant="outlined"
                    padding="sm"
                    hoverable
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${ORGANIZATION_TYPE_COLORS[child.orgType]}20`,
                          }}
                        >
                          <Building2
                            className="w-5 h-5"
                            style={{ color: ORGANIZATION_TYPE_COLORS[child.orgType] }}
                          />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                            {child.name}
                          </p>
                          <Badge variant="neutral" size="sm">
                            {ORGANIZATION_TYPE_LABELS[child.orgType]}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5" style={{ color: 'var(--cmf-text-muted)' }} />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No child organizations</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'giving',
      label: 'Giving',
      icon: <DollarSign className="w-4 h-4" />,
      badge: organization?.donationStats?.totalAmount
        ? formatCurrency(organization.donationStats.totalAmount)
        : undefined,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Donations"
              value={formatCurrency(organization?.donationStats?.totalAmount || organization?.totalDonations || 0)}
              accentColor="var(--cmf-success)"
            />
            <StatCard
              title="Unique Donors"
              value={organization?.donationStats?.uniqueDonors || 0}
              subtitle="Affiliated contacts"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Average Donation"
              value={formatCurrency(organization?.donationStats?.averageDonation || 0)}
            />
            <StatCard
              title="Last Donation"
              value={formatDate(organization?.donationStats?.lastDonationDate)}
            />
          </div>

          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              Giving History
            </h4>
            <div
              className="text-center py-8"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Giving history will appear here</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              Notes & Documents
            </h4>
            <Button variant="ghost" size="sm">
              Add Note
            </Button>
          </div>

          {organization?.notes ? (
            <Card variant="ghost" padding="sm">
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: 'var(--cmf-text-secondary)' }}
              >
                {organization.notes}
              </p>
            </Card>
          ) : (
            <div
              className="text-center py-8"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          opacity: isOpen ? 1 : 0,
        }}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 overflow-hidden transition-transform duration-300 ease-out"
        style={{
          width: 'min(520px, 90vw)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          backgroundColor: 'var(--cmf-background)',
          borderLeft: '1px solid var(--cmf-border)',
          boxShadow: 'var(--cmf-shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--cmf-border)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--cmf-text)' }}>
            Organization Details
          </h2>
          <div className="flex items-center gap-2">
            {organization && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(organization)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-64px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--cmf-accent)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 px-6">
              <p style={{ color: 'var(--cmf-error)' }}>{error}</p>
              <Button variant="outline" size="sm" onClick={loadOrganization} className="mt-4">
                Retry
              </Button>
            </div>
          ) : organization ? (
            <div className="px-6 py-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${ORGANIZATION_TYPE_COLORS[organization.orgType]}20`,
                  }}
                >
                  <Building2
                    className="w-8 h-8"
                    style={{ color: ORGANIZATION_TYPE_COLORS[organization.orgType] }}
                  />
                </div>

                {/* Name & Badges */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate" style={{ color: 'var(--cmf-text)' }}>
                    {organization.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant={organization.orgType === 'nonprofit' ? 'success' : 'primary'}
                      size="sm"
                    >
                      {ORGANIZATION_TYPE_LABELS[organization.orgType]}
                    </Badge>
                    {organization.ein && (
                      <Badge variant="neutral" size="sm">
                        EIN: {organization.ein}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                >
                  <p className="text-lg font-bold" style={{ color: 'var(--cmf-success)' }}>
                    {formatCurrency(organization.totalDonations || 0)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    Donations
                  </p>
                </div>
                <div
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                >
                  <p className="text-lg font-bold" style={{ color: 'var(--cmf-text)' }}>
                    {organization.contacts?.length || organization.contactCount || 0}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    Contacts
                  </p>
                </div>
                <div
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                >
                  <p className="text-lg font-bold" style={{ color: 'var(--cmf-text)' }}>
                    {organization.childOrganizations?.length || 0}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    Child Orgs
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underline"
                size="sm"
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

OrganizationSlideOut.displayName = 'OrganizationSlideOut';

export default OrganizationSlideOut;
