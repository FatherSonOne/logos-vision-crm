import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Plus,
  Building2,
  Users,
  DollarSign,
  MapPin,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { organizationService } from '../services/organizationService';
import { OrganizationSlideOut } from './OrganizationSlideOut';
import type { Organization, OrganizationType } from '../types';
import { ORGANIZATION_TYPE_LABELS, ORGANIZATION_TYPE_COLORS } from '../types';

interface OrganizationListProps {
  onNavigateToContact?: (contactId: string) => void;
  onAddOrganization?: () => void;
}

export const OrganizationList: React.FC<OrganizationListProps> = ({
  onNavigateToContact,
  onAddOrganization,
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<OrganizationType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Slide-out panel state
  const [slideOutOrgId, setSlideOutOrgId] = useState<string | null>(null);
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false);

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationService.getAll();
      setOrganizations(data);
    } catch (err) {
      console.error('Error loading organizations:', err);
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleOpenSlideOut = (orgId: string) => {
    setSlideOutOrgId(orgId);
    setIsSlideOutOpen(true);
  };

  const handleCloseSlideOut = () => {
    setIsSlideOutOpen(false);
    setTimeout(() => setSlideOutOrgId(null), 300);
  };

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          org.name.toLowerCase().includes(query) ||
          org.email?.toLowerCase().includes(query) ||
          org.ein?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(org.orgType)) return false;
      }

      return true;
    });
  }, [organizations, searchQuery, selectedTypes]);

  const toggleTypeFilter = (type: OrganizationType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Stats by type
  const statsByType = useMemo(() => {
    const stats: Record<OrganizationType, number> = {
      nonprofit: 0,
      foundation: 0,
      corporation: 0,
      government: 0,
      other: 0,
    };
    organizations.forEach((org) => {
      stats[org.orgType] = (stats[org.orgType] || 0) + 1;
    });
    return stats;
  }, [organizations]);

  const totalDonations = useMemo(() => {
    return organizations.reduce((sum, org) => sum + (org.totalDonations || 0), 0);
  }, [organizations]);

  const totalContacts = useMemo(() => {
    return organizations.reduce((sum, org) => sum + (org.contactCount || 0), 0);
  }, [organizations]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--cmf-accent)', borderTopColor: 'transparent' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--cmf-text)' }}>
            Organizations
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cmf-text-muted)' }}>
            {filteredOrganizations.length} of {organizations.length} organizations
          </p>
        </div>

        <Button onClick={onAddOrganization}>
          <Plus className="w-5 h-5 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--cmf-accent-muted)' }}
            >
              <Building2 className="w-5 h-5" style={{ color: 'var(--cmf-accent)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                {organizations.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                Total Organizations
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--cmf-success-muted)' }}
            >
              <DollarSign className="w-5 h-5" style={{ color: 'var(--cmf-success)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                {formatCurrency(totalDonations)}
              </p>
              <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                Total Donations
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--cmf-info-muted)' }}
            >
              <Users className="w-5 h-5" style={{ color: 'var(--cmf-info)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                {totalContacts}
              </p>
              <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                Affiliated Contacts
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--cmf-warning-muted)' }}
            >
              <Building2 className="w-5 h-5" style={{ color: 'var(--cmf-warning)' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--cmf-text)' }}>
                {statsByType.nonprofit}
              </p>
              <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                Nonprofits
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(ORGANIZATION_TYPE_LABELS) as OrganizationType[]).map((type) => (
          <button
            key={type}
            onClick={() => toggleTypeFilter(type)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedTypes.includes(type)
                ? ORGANIZATION_TYPE_COLORS[type]
                : 'var(--cmf-surface-2)',
              color: selectedTypes.includes(type) ? 'white' : 'var(--cmf-text-secondary)',
              border: `1px solid ${selectedTypes.includes(type) ? ORGANIZATION_TYPE_COLORS[type] : 'var(--cmf-border)'}`,
            }}
          >
            {ORGANIZATION_TYPE_LABELS[type]}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: selectedTypes.includes(type)
                  ? 'rgba(255,255,255,0.2)'
                  : 'var(--cmf-surface-3)',
              }}
            >
              {statsByType[type]}
            </span>
          </button>
        ))}

        {selectedTypes.length > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm underline"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Search */}
      <Card variant="default" padding="md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            style={{ color: 'var(--cmf-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search organizations by name, email, or EIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--cmf-surface-2)',
              border: '1px solid var(--cmf-border)',
              color: 'var(--cmf-text)',
            }}
          />
        </div>
      </Card>

      {/* Organizations Grid */}
      {error ? (
        <Card variant="default" padding="lg">
          <div className="text-center">
            <p style={{ color: 'var(--cmf-error)' }}>{error}</p>
            <Button variant="outline" onClick={loadOrganizations} className="mt-4">
              Retry
            </Button>
          </div>
        </Card>
      ) : filteredOrganizations.length === 0 ? (
        <Card variant="default" padding="lg">
          <div className="text-center py-12">
            <Building2
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              style={{ color: 'var(--cmf-text-muted)' }}
            />
            <p className="text-lg font-medium" style={{ color: 'var(--cmf-text-secondary)' }}>
              No organizations found
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--cmf-text-muted)' }}>
              {searchQuery || selectedTypes.length > 0
                ? 'Try adjusting your search or filters'
                : 'Add your first organization to get started'}
            </p>
            {(searchQuery || selectedTypes.length > 0) && (
              <Button variant="ghost" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganizations.map((org) => (
            <Card
              key={org.id}
              variant="default"
              padding="md"
              hoverable
              onClick={() => handleOpenSlideOut(org.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${ORGANIZATION_TYPE_COLORS[org.orgType]}20`,
                    }}
                  >
                    <Building2
                      className="w-6 h-6"
                      style={{ color: ORGANIZATION_TYPE_COLORS[org.orgType] }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-semibold truncate"
                      style={{ color: 'var(--cmf-text)' }}
                    >
                      {org.name}
                    </h3>
                    <Badge
                      variant={org.orgType === 'nonprofit' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {ORGANIZATION_TYPE_LABELS[org.orgType]}
                    </Badge>
                  </div>
                </div>
                <ChevronRight
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: 'var(--cmf-text-muted)' }}
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5 mb-3">
                {org.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-3.5 h-3.5" style={{ color: 'var(--cmf-text-muted)' }} />
                    <span className="truncate" style={{ color: 'var(--cmf-text-secondary)' }}>
                      {org.email}
                    </span>
                  </div>
                )}
                {org.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-3.5 h-3.5" style={{ color: 'var(--cmf-text-muted)' }} />
                    <span style={{ color: 'var(--cmf-text-secondary)' }}>{org.phone}</span>
                  </div>
                )}
                {(org.city || org.state) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--cmf-text-muted)' }} />
                    <span style={{ color: 'var(--cmf-text-secondary)' }}>
                      {[org.city, org.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {org.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-3.5 h-3.5" style={{ color: 'var(--cmf-text-muted)' }} />
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline"
                      style={{ color: 'var(--cmf-accent)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {org.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--cmf-border)' }}
              >
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--cmf-text)' }}>
                    {org.contactCount}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    contacts
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--cmf-success)' }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--cmf-success)' }}
                  >
                    {formatCurrency(org.totalDonations)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Organization Slide-Out Panel */}
      <OrganizationSlideOut
        organizationId={slideOutOrgId}
        isOpen={isSlideOutOpen}
        onClose={handleCloseSlideOut}
        onNavigateToContact={onNavigateToContact}
        onEdit={(org) => {
          console.log('Edit organization:', org);
          // TODO: Open edit dialog
        }}
      />
    </div>
  );
};

OrganizationList.displayName = 'OrganizationList';

export default OrganizationList;
