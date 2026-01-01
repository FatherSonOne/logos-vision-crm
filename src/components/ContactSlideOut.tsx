/**
 * ContactSlideOut - Slide-out panel for viewing contact details
 * =============================================================
 * Smooth animated slide-out panel with tabbed contact information.
 * Uses CMF design tokens and createPortal for proper layering.
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
  DollarSign,
  MessageSquare,
  FileText,
  Edit2,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Card, StatCard } from './ui/Card';
import { Badge, EngagementBadge } from './ui/Badge';
import { Button } from './ui/Button';
import { contactService } from '../services/contactService';
import type { Contact, ContactWithAffiliations } from '../types';
import { ENGAGEMENT_SCORE_COLORS, ORGANIZATION_RELATIONSHIP_LABELS } from '../types';

interface ContactSlideOutProps {
  contactId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onNavigateToOrganization?: (orgId: string) => void;
}

// Simple tab button component
const TabButton: React.FC<{
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  badge?: number | string;
  onClick: () => void;
}> = ({ id, label, icon, isActive, badge, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors"
    style={{
      borderBottom: isActive ? '2px solid var(--cmf-accent)' : '2px solid transparent',
      color: isActive ? 'var(--cmf-accent)' : 'var(--cmf-text-muted)',
    }}
  >
    {icon}
    <span>{label}</span>
    {badge !== undefined && badge !== 0 && (
      <span
        className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: isActive ? 'rgba(var(--cmf-accent-rgb), 0.2)' : 'var(--cmf-surface-3)',
          color: isActive ? 'var(--cmf-accent)' : 'var(--cmf-text-muted)',
        }}
      >
        {badge}
      </span>
    )}
  </button>
);

export const ContactSlideOut: React.FC<ContactSlideOutProps> = ({
  contactId,
  isOpen,
  onClose,
  onEdit,
  onNavigateToOrganization,
}) => {
  const [contact, setContact] = useState<ContactWithAffiliations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Animation states for smooth slide-in/out
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  // Load contact data
  const loadContact = useCallback(async () => {
    if (!contactId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await contactService.getWithAffiliations(contactId);
      setContact(data);
    } catch (err) {
      console.error('Error loading contact:', err);
      setError('Failed to load contact details');
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    if (isOpen && contactId) {
      loadContact();
      setActiveTab('overview');
    }
  }, [isOpen, contactId, loadContact]);

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

  if (!isVisible) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!contact) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--cmf-accent)' }}
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm hover:underline"
                    style={{ color: 'var(--cmf-accent)' }}
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
              {(contact.city || contact.state) && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--cmf-text-secondary)' }}>
                    {[contact.address, contact.city, contact.state, contact.zipCode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>

            {(contact.preferredContactMethod || contact.doNotEmail || contact.doNotCall) && (
              <div>
                <h4
                  className="text-xs font-semibold uppercase tracking-wide mb-2"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  Preferences
                </h4>
                <div className="flex flex-wrap gap-2">
                  {contact.preferredContactMethod && (
                    <Badge variant="info" size="sm">
                      Prefers {contact.preferredContactMethod}
                    </Badge>
                  )}
                  {contact.doNotEmail && (
                    <Badge variant="danger" size="sm">No Email</Badge>
                  )}
                  {contact.doNotCall && (
                    <Badge variant="danger" size="sm">No Call</Badge>
                  )}
                  {contact.doNotMail && (
                    <Badge variant="danger" size="sm">No Mail</Badge>
                  )}
                  {contact.newsletterSubscriber && (
                    <Badge variant="success" size="sm">Newsletter</Badge>
                  )}
                </div>
              </div>
            )}

            {contact.notes && (
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
                  {contact.notes}
                </p>
              </div>
            )}
          </div>
        );

      case 'giving':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Lifetime Giving"
                value={formatCurrency(contact.totalLifetimeGiving || 0)}
                accentColor="var(--cmf-success)"
              />
              <StatCard
                title="Last Gift"
                value={formatDate(contact.lastGiftDate)}
                subtitle={contact.lastGiftDate ? 'Most recent' : 'No gifts yet'}
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
        );

      case 'interactions':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Recent Interactions
              </h4>
              <Button variant="ghost" size="sm">Log Interaction</Button>
            </div>
            <div
              className="text-center py-8"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No interactions logged yet</p>
            </div>
          </div>
        );

      case 'organizations':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Organization Affiliations
              </h4>
              <Button variant="ghost" size="sm">Add Affiliation</Button>
            </div>

            {contact.affiliations && contact.affiliations.length > 0 ? (
              <div className="space-y-3">
                {contact.affiliations.map((affiliation) => (
                  <Card
                    key={affiliation.id}
                    variant="outlined"
                    padding="sm"
                    hoverable
                    onClick={() => onNavigateToOrganization?.(affiliation.organizationId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'var(--cmf-accent-muted)' }}
                        >
                          <Building2 className="w-5 h-5" style={{ color: 'var(--cmf-accent)' }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                            {affiliation.organization?.name || 'Unknown Organization'}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span style={{ color: 'var(--cmf-text-muted)' }}>
                              {affiliation.roleTitle || ORGANIZATION_RELATIONSHIP_LABELS[affiliation.relationshipType] || affiliation.relationshipType}
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
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No organization affiliations</p>
              </div>
            )}
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Notes & Documents
              </h4>
              <Button variant="ghost" size="sm">Add Note</Button>
            </div>

            {contact.notes ? (
              <Card variant="ghost" padding="sm">
                <p
                  className="text-sm whitespace-pre-wrap"
                  style={{ color: 'var(--cmf-text-secondary)' }}
                >
                  {contact.notes}
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
        );

      default:
        return null;
    }
  };

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
              Contact Details
            </h2>
            <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              View and manage contact information
            </p>
          </div>
          <div className="flex items-center gap-2">
            {contact && onEdit && (
              <button
                onClick={() => onEdit(contact)}
                className="p-2 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
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
              <Button variant="outline" size="sm" onClick={loadContact} className="mt-4">
                Retry
              </Button>
            </div>
          ) : contact ? (
            <div className="px-6 py-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-6">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: ENGAGEMENT_SCORE_COLORS[contact.engagementScore] || 'var(--cmf-surface-2)',
                    color: 'white',
                  }}
                >
                  {getInitials(contact.name)}
                </div>

                {/* Name & Badges */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate" style={{ color: 'var(--cmf-text)' }}>
                    {contact.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <EngagementBadge level={contact.engagementScore as 'high' | 'medium' | 'low'} size="sm" />
                    <Badge variant="neutral" size="sm">
                      {contact.donorStage}
                    </Badge>
                    {contact.type === 'organization_contact' && (
                      <Badge variant="info" size="sm">
                        <Building2 className="w-3 h-3 mr-1" />
                        Org Contact
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
                    {formatCurrency(contact.totalLifetimeGiving)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    Lifetime
                  </p>
                </div>
                <div
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                >
                  <p className="text-lg font-bold" style={{ color: 'var(--cmf-text)' }}>
                    {contact.affiliations?.length || 0}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    Organizations
                  </p>
                </div>
                <div
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--cmf-surface-2)' }}
                >
                  <p className="text-lg font-bold" style={{ color: 'var(--cmf-text)' }}>
                    {contact.lastGiftDate
                      ? Math.floor((Date.now() - new Date(contact.lastGiftDate).getTime()) / (1000 * 60 * 60 * 24))
                      : '--'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                    Days Since Gift
                  </p>
                </div>
              </div>

              {/* Tab Buttons */}
              <div
                className="flex gap-1 mb-6 overflow-x-auto"
                style={{ borderBottom: '1px solid var(--cmf-border)' }}
              >
                <TabButton
                  id="overview"
                  label="Overview"
                  icon={<User className="w-4 h-4" />}
                  isActive={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <TabButton
                  id="giving"
                  label="Giving"
                  icon={<DollarSign className="w-4 h-4" />}
                  isActive={activeTab === 'giving'}
                  onClick={() => setActiveTab('giving')}
                />
                <TabButton
                  id="interactions"
                  label="Interactions"
                  icon={<MessageSquare className="w-4 h-4" />}
                  isActive={activeTab === 'interactions'}
                  onClick={() => setActiveTab('interactions')}
                />
                <TabButton
                  id="organizations"
                  label="Orgs"
                  icon={<Building2 className="w-4 h-4" />}
                  isActive={activeTab === 'organizations'}
                  badge={contact.affiliations?.length}
                  onClick={() => setActiveTab('organizations')}
                />
                <TabButton
                  id="notes"
                  label="Notes"
                  icon={<FileText className="w-4 h-4" />}
                  isActive={activeTab === 'notes'}
                  onClick={() => setActiveTab('notes')}
                />
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          ) : null}
        </div>
      </div>
    </>,
    document.body
  );
};

ContactSlideOut.displayName = 'ContactSlideOut';

export default ContactSlideOut;
