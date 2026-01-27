import React from 'react';
import { ContactCard } from './ContactCard';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  avatar_url?: string;
  relationship_score?: number;
  relationship_trend?: 'rising' | 'stable' | 'falling' | 'new' | 'dormant';
  preferred_channel?: string;
  last_interaction_date?: string;
  total_interactions?: number;
  donor_stage?: string;
  total_lifetime_giving?: number;
}

interface ContactCardGalleryProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  commentCounts?: Record<string, number>;
  activityCounts?: Record<string, number>;
}

export function ContactCardGallery({ contacts, onSelectContact, commentCounts = {}, activityCounts = {} }: ContactCardGalleryProps) {
  if (contacts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-card">
          <div className="empty-state-icon" aria-hidden="true">
            🔍
          </div>
          <h3 className="empty-state-title">
            No Contacts Found
          </h3>
          <p className="empty-state-description">
            We couldn't find any contacts matching your search criteria.
            Try adjusting your filters, clearing your search, or add a new contact to get started.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
              aria-label="Clear all filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
            <button
              type="button"
              className="btn btn-primary"
              aria-label="Add new contact"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-gallery w-full page-transition">
      {/* Responsive CSS Grid with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="card-stagger"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ContactCard
              contact={contact}
              onClick={() => onSelectContact(contact)}
              commentCount={commentCounts[contact.id] || 0}
              recentActivityCount={activityCounts[contact.id] || 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
