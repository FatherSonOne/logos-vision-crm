import React, { useState, useEffect } from 'react';
import { ContactCardGallery } from './ContactCardGallery';
import { ContactStoryView } from './ContactStoryView';
import { ContactFilters } from './ContactFilters';
import { ContactSearch } from './ContactSearch';
import { PrioritiesFeedView } from './PrioritiesFeedView';
import { PulseSyncButton } from './PulseSyncButton';
import { AutoSyncSettings } from './AutoSyncSettings';
import { entityService, type EntityType, type ContactWithEntityType } from '../../services/entityService';
import { contactService } from '../../services/contactService';
import { pulseContactService } from '../../services/pulseContactService';
import { logger } from '../../utils/logger';
import { getComments, getActivityLog } from '../../services/collaborationService';
import type { Contact } from '../../types';

type ViewMode = 'priorities' | 'all' | 'recent';

export function ContactsPage() {
  const [contacts, setContacts] = useState<ContactWithEntityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactWithEntityType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prioritiesCount, setPrioritiesCount] = useState(0);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [entityType, setEntityType] = useState<EntityType>('client'); // Default to clients (513 rows)
  const [filters, setFilters] = useState({
    relationshipScore: 'all',
    trend: 'all',
    donorStage: 'all',
    tags: []
  });
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});

  // Load priorities count on mount
  useEffect(() => {
    async function loadPriorities() {
      try {
        const count = await pulseContactService.getPendingActionsCount();
        setPrioritiesCount(count);
      } catch (error) {
        logger.error('Failed to load priorities count:', error);
        setPrioritiesCount(0);
      }
    }
    loadPriorities();
  }, []);

  // Load contacts on mount and when entity type changes
  useEffect(() => {
    async function loadContacts() {
      setLoading(true);
      setError(null);
      try {
        // Load contacts from multi-entity service (clients, organizations, etc.)
        logger.info(`ContactsPage: Loading contacts with entity type: ${entityType}`);
        const contacts = await entityService.getByType(entityType);

        logger.info(`ContactsPage: Loaded ${contacts.length} contacts from ${entityType} entities`);
        setContacts(contacts);

        logger.info(`ContactsPage: Successfully set ${contacts.length} contacts in state`);
      } catch (err) {
        logger.error('ContactsPage: Error loading contacts from entity service', err);
        setError('Failed to load contacts. Please try again.');

        // Optionally fallback to Pulse mock data if entity service fails
        try {
          logger.warn('ContactsPage: Attempting fallback to Pulse mock data');
          const profiles = await pulseContactService.fetchRelationshipProfiles({
            limit: 1000,
            includeAnnotations: true,
          });

          // Transform Pulse profiles to Contact format
          const transformedContacts: ContactWithEntityType[] = profiles.map(profile => ({
            id: profile.id,
            name: profile.display_name,
            firstName: profile.display_name.split(' ')[0],
            lastName: profile.display_name.split(' ').slice(1).join(' '),
            email: profile.canonical_email,
            phone: profile.phone_number,
            company: profile.company,
            job_title: profile.title,
            avatar_url: profile.avatar_url,
            linkedin_url: profile.linkedin_url,
            type: 'individual' as const,
            engagementScore: profile.relationship_score >= 70 ? 'high' : profile.relationship_score < 40 ? 'low' : 'medium',
            donorStage: profile.tags?.includes('major-donor') ? 'Major Donor' : profile.tags?.includes('donor') ? 'Repeat Donor' : 'Prospect',
            totalLifetimeGiving: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relationship_score: profile.relationship_score,
            relationship_trend: profile.relationship_score >= 80 ? 'rising' : profile.relationship_score < 50 ? 'falling' : 'stable',
            preferred_channel: profile.preferred_channel,
            communication_frequency: profile.communication_frequency,
            last_interaction_date: profile.last_interaction_date,
            total_interactions: profile.total_interactions,
            pulse_profile_id: profile.id,
            pulse_tags: profile.tags,
            entity_type: 'contact',
          }));

          setContacts(transformedContacts);
          setError(null); // Clear error if fallback succeeds
          logger.info(`ContactsPage: Successfully loaded ${transformedContacts.length} contacts from Pulse fallback`);
        } catch (fallbackErr) {
          logger.error('ContactsPage: Pulse fallback also failed', fallbackErr);
          // Keep the original error message
        }
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, [entityType]);

  // Retry function for error recovery
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Reload contacts
    window.location.reload();
  };

  // Filter contacts based on search and filters
  const filteredContacts = contacts.filter(contact => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Relationship score filter
    if (filters.relationshipScore !== 'all') {
      const score = contact.relationship_score || 0;
      if (filters.relationshipScore === '0-25' && (score < 0 || score > 25)) return false;
      if (filters.relationshipScore === '26-50' && (score < 26 || score > 50)) return false;
      if (filters.relationshipScore === '51-75' && (score < 51 || score > 75)) return false;
      if (filters.relationshipScore === '76-100' && (score < 76 || score > 100)) return false;
    }

    // Trend filter
    if (filters.trend !== 'all') {
      if (contact.relationship_trend !== filters.trend) return false;
    }

    // Donor stage filter
    if (filters.donorStage !== 'all') {
      if (contact.donorStage !== filters.donorStage) return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const contactTags = contact.pulse_tags || [];
      const hasMatchingTag = filters.tags.some(tag => contactTags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  // Load collaboration counts for visible contacts
  useEffect(() => {
    const loadCollaborationCounts = async () => {
      if (filteredContacts.length === 0) return;

      // Load counts for up to 50 contacts at a time to avoid performance issues
      const contactsToLoad = filteredContacts.slice(0, 50);

      for (const contact of contactsToLoad) {
        try {
          // Load comments
          const comments = await getComments('client', contact.id, { limit: 100 });
          setCommentCounts(prev => ({ ...prev, [contact.id]: comments.length }));

          // Load activities and count recent ones (last 7 days)
          const activities = await getActivityLog('client', contact.id, { limit: 100 });
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const recentActivities = activities.filter(a =>
            new Date(a.createdAt) > sevenDaysAgo
          );
          setActivityCounts(prev => ({ ...prev, [contact.id]: recentActivities.length }));
        } catch (error) {
          logger.error(`Failed to load collaboration data for contact ${contact.id}:`, error);
        }
      }
    };

    // Only load if we have contacts and haven't loaded yet
    if (filteredContacts.length > 0 && Object.keys(commentCounts).length === 0) {
      loadCollaborationCounts();
    }
  }, [filteredContacts.length]); // Only re-run when the number of filtered contacts changes

  return (
    <main className="contacts-page min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6" role="main" aria-label="Contacts Management">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ContactSearch value={searchQuery} onChange={setSearchQuery} />
            <div className="flex items-center gap-3">
              {/* Entity Type Filter */}
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label="Filter by entity type"
              >
                <option value="client">Clients</option>
                <option value="contact">CRM Contacts</option>
                <option value="organization">Organizations</option>
                <option value="volunteer">Volunteers</option>
                <option value="team">Team</option>
                <option value="all">All Entities</option>
              </select>
              <ContactFilters filters={filters} onChange={setFilters} />
              <PulseSyncButton />
              <button
                type="button"
                className="btn btn-primary whitespace-nowrap"
                onClick={() => setShowAddContactModal(true)}
                aria-label="Add new contact"
              >
                + Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Sync Settings */}
        <div className="mb-4">
          <AutoSyncSettings />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Contact views">
          <TabButton
            active={viewMode === 'priorities'}
            onClick={() => setViewMode('priorities')}
            icon="🎯"
            label="Priorities"
            count={prioritiesCount}
            id="tab-priorities"
            ariaControls="panel-priorities"
          />
          <TabButton
            active={viewMode === 'all'}
            onClick={() => setViewMode('all')}
            icon="👥"
            label="All Contacts"
            count={filteredContacts.length}
            id="tab-all"
            ariaControls="panel-all"
          />
          <TabButton
            active={viewMode === 'recent'}
            onClick={() => setViewMode('recent')}
            icon="📅"
            label="Recent Activity"
            id="tab-recent"
            ariaControls="panel-recent"
          />
        </div>

        {/* Filter Results Announcement (Screen Reader Only) */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {viewMode === 'all' && `${filteredContacts.length} ${filteredContacts.length === 1 ? 'contact' : 'contacts'} found`}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {viewMode === 'all' && (
          <div role="tabpanel" id="panel-all" aria-labelledby="tab-all">
            {error ? (
              <ErrorState message={error} onRetry={handleRetry} />
            ) : loading ? (
              <LoadingState />
            ) : selectedContact ? (
              <ContactStoryView
                contact={selectedContact}
                onBack={() => setSelectedContact(null)}
              />
            ) : (
              <ContactCardGallery
                contacts={filteredContacts}
                onSelectContact={setSelectedContact}
                commentCounts={commentCounts}
                activityCounts={activityCounts}
              />
            )}
          </div>
        )}

        {viewMode === 'priorities' && (
          <div role="tabpanel" id="panel-priorities" aria-labelledby="tab-priorities">
            <PrioritiesFeedView
              contacts={contacts}
              onViewProfile={setSelectedContact}
            />
          </div>
        )}

        {viewMode === 'recent' && (
          <div role="tabpanel" id="panel-recent" aria-labelledby="tab-recent" className="text-center text-gray-900 dark:text-white py-12">
            <div className="bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-lg p-12 max-w-2xl mx-auto border border-blue-300/30 dark:border-blue-500/30 shadow-lg dark:shadow-none">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <span aria-hidden="true">📅</span>
                <span>Recent Activity Feed</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Chronological timeline of all contact interactions coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddContactModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Contact</h2>
              <button
                type="button"
                onClick={() => setShowAddContactModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close dialog"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <p className="text-lg mb-4 text-gray-900 dark:text-white font-medium">Contact Management Coming Soon</p>
              <p className="text-sm mb-2">This feature is currently in development and will allow you to:</p>
              <ul className="text-sm mt-3 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Add and edit contacts manually</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Sync with Google Contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Import from Pulse Communication App</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Manage relationship data and AI insights</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setShowAddContactModal(false)}
                className="mt-6 btn btn-primary"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count?: number;
  id: string;
  ariaControls: string;
}

function TabButton({ active, onClick, icon, label, count, id, ariaControls }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 min-h-[44px] border-b-2 transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${active
          ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-medium'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }
      `}
      role="tab"
      id={id}
      aria-controls={ariaControls}
      aria-selected={active}
      aria-label={`View ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="text-sm sm:text-base whitespace-nowrap">{label}</span>
      {count !== undefined && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs
          ${active ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 p-6 page-transition" role="status" aria-live="polite">
      <span className="sr-only">Loading contacts, please wait...</span>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="skeleton-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="skeleton-circle w-16 h-16 mx-auto mb-3"></div>
            <div className="skeleton-text w-3/4 h-5 mx-auto mb-2"></div>
            <div className="skeleton-text w-1/2 h-4 mx-auto mb-4"></div>
            <div className="skeleton-text w-full h-3 mb-2"></div>
            <div className="skeleton-text w-4/5 h-3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert" aria-live="assertive">
      <div className="error-state-card page-transition">
        <div className="error-state-icon" aria-hidden="true">
          ⚠️
        </div>
        <h3 className="error-state-title">
          Unable to Load Contacts
        </h3>
        <p className="error-state-description">
          {message}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="btn btn-primary"
            aria-label="Retry loading contacts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="btn btn-secondary"
            aria-label="Go to dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
