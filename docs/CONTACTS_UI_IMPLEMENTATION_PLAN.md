# Contacts UI Implementation Plan - Hybrid B + D

**Status:** Ready for Implementation
**Date:** 2026-01-25
**Design Approach:** Hybrid (Relationship-First Cards + Actionable Feed)
**Estimated Timeline:** 5-6 weeks (Phased)

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Card Gallery (Option B)](#phase-1-card-gallery-option-b)
3. [Phase 2: Priorities Feed (Option D)](#phase-2-priorities-feed-option-d)
4. [Component Architecture](#component-architecture)
5. [Styling Guidelines](#styling-guidelines)
6. [User Flows](#user-flows)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Plan](#deployment-plan)

---

## Overview

### Design Philosophy

**Main View (Option B):** Visual card gallery with color-coded relationship health for browsing and exploration
**Priorities View (Option D):** AI-driven action feed for daily outreach planning

### Key Features

✅ **Relationship-first design** - Pulse intelligence prominently displayed
✅ **Color-coded health indicators** - Green (strong) → Red (dormant)
✅ **AI-powered action feed** - Daily priority queue with recommendations
✅ **Progressive disclosure** - Story-format detail views reduce cognitive load
✅ **Mobile-responsive** - Cards stack vertically, feed works on phones
✅ **Performance optimized** - Virtual scrolling for 10K+ contacts

### Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Contacts                         [Search] [Filters] [+Add]          │
├─────────────────────────────────────────────────────────────────────┤
│ [🎯 Priorities (12)] [👥 All Contacts (523)] [📅 Recent Activity] │
│  ━━━━━━━━━━━━━━━━                                                  │
│                                                                     │
│ Tab Content Area:                                                   │
│ - Priorities → Actionable feed (Option D)                          │
│ - All Contacts → Card gallery (Option B)                           │
│ - Recent Activity → Chronological interaction timeline             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Card Gallery (Option B)

**Timeline:** Weeks 1-4
**Goal:** Replace current table view with visual card gallery

### 1.1 Main Contacts Page Component

**File:** `src/pages/ContactsPage.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { ContactCardGallery } from '../components/contacts/ContactCardGallery';
import { ContactStoryView } from '../components/contacts/ContactStoryView';
import { ContactFilters } from '../components/contacts/ContactFilters';
import { ContactSearch } from '../components/contacts/ContactSearch';
import { contactService } from '../services/contactService';
import type { Contact } from '../types';

type ViewMode = 'priorities' | 'all' | 'recent';

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    relationshipScore: 'all',
    trend: 'all',
    donorStage: 'all',
    tags: []
  });

  // Load contacts on mount
  useEffect(() => {
    async function loadContacts() {
      setLoading(true);
      try {
        const data = await contactService.getAll();
        setContacts(data);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, []);

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
      if (contact.donor_stage !== filters.donorStage) return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const contactTags = contact.pulse_tags || [];
      const hasMatchingTag = filters.tags.some(tag => contactTags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  // Count for priorities tab (will implement in Phase 2)
  const prioritiesCount = 12; // Placeholder

  return (
    <div className="contacts-page min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <div className="flex items-center gap-3">
            <ContactSearch value={searchQuery} onChange={setSearchQuery} />
            <ContactFilters filters={filters} onChange={setFilters} />
            <button className="btn btn-primary">
              + Add Contact
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-700">
          <TabButton
            active={viewMode === 'priorities'}
            onClick={() => setViewMode('priorities')}
            icon="🎯"
            label="Priorities"
            count={prioritiesCount}
          />
          <TabButton
            active={viewMode === 'all'}
            onClick={() => setViewMode('all')}
            icon="👥"
            label="All Contacts"
            count={filteredContacts.length}
          />
          <TabButton
            active={viewMode === 'recent'}
            onClick={() => setViewMode('recent')}
            icon="📅"
            label="Recent Activity"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {viewMode === 'all' && (
          <>
            {loading ? (
              <LoadingSpinner />
            ) : selectedContact ? (
              <ContactStoryView
                contact={selectedContact}
                onBack={() => setSelectedContact(null)}
              />
            ) : (
              <ContactCardGallery
                contacts={filteredContacts}
                onSelectContact={setSelectedContact}
              />
            )}
          </>
        )}

        {viewMode === 'priorities' && (
          <div className="text-center text-white py-12">
            <p className="text-xl">Priorities feed coming in Phase 2...</p>
          </div>
        )}

        {viewMode === 'recent' && (
          <div className="text-center text-white py-12">
            <p className="text-xl">Recent activity feed coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 border-b-2 transition-all
        ${active
          ? 'border-blue-400 text-blue-400 font-medium'
          : 'border-transparent text-gray-400 hover:text-gray-200'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {count !== undefined && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs
          ${active ? 'bg-blue-400/20 text-blue-300' : 'bg-gray-700 text-gray-300'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
    </div>
  );
}
```

### 1.2 Contact Card Gallery Component

**File:** `src/components/contacts/ContactCardGallery.tsx`

```typescript
import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { ContactCard } from './ContactCard';
import type { Contact } from '../../types';

interface ContactCardGalleryProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export function ContactCardGallery({ contacts, onSelectContact }: ContactCardGalleryProps) {
  // Calculate grid dimensions
  const columnCount = useMemo(() => {
    if (window.innerWidth >= 1536) return 4; // 2xl screens
    if (window.innerWidth >= 1280) return 3; // xl screens
    if (window.innerWidth >= 1024) return 3; // lg screens
    if (window.innerWidth >= 768) return 2; // md screens
    return 1; // sm screens
  }, []);

  const columnWidth = useMemo(() => {
    return Math.floor((window.innerWidth - 64) / columnCount); // 64px for padding
  }, [columnCount]);

  const rowCount = Math.ceil(contacts.length / columnCount);
  const rowHeight = 380; // Card height + gap

  // Cell renderer for react-window
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const contactIndex = rowIndex * columnCount + columnIndex;
    const contact = contacts[contactIndex];

    if (!contact) return null;

    return (
      <div style={style}>
        <div className="p-3">
          <ContactCard
            contact={contact}
            onClick={() => onSelectContact(contact)}
          />
        </div>
      </div>
    );
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-gray-400 text-lg">
          <p>No contacts found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-gallery">
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={window.innerHeight - 250}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={window.innerWidth - 48}
      >
        {Cell}
      </Grid>
    </div>
  );
}
```

### 1.3 Contact Card Component

**File:** `src/components/contacts/ContactCard.tsx`

```typescript
import React from 'react';
import { RelationshipScoreCircle } from './RelationshipScoreCircle';
import { TrendIndicator } from './TrendIndicator';
import { formatTimeAgo, formatCurrency } from '../../utils/formatters';
import type { Contact } from '../../types';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  // Determine card border color based on relationship score
  const borderColor = getRelationshipColor(contact.relationship_score || 0);

  // Get interaction channel icon
  const channelIcon = getChannelIcon(contact.preferred_channel);

  return (
    <div
      onClick={onClick}
      className={`
        contact-card
        bg-gray-800/50 backdrop-blur-sm rounded-lg
        border-2 ${borderColor}
        hover:shadow-xl hover:scale-105
        transition-all duration-200 cursor-pointer
        p-4
      `}
    >
      {/* Relationship Score Header */}
      <div className="flex flex-col items-center mb-4">
        <RelationshipScoreCircle score={contact.relationship_score || 0} />
        <TrendIndicator trend={contact.relationship_trend} className="mt-2" />
      </div>

      {/* Contact Info */}
      <div className="text-center mb-4">
        {/* Avatar or Initials */}
        {contact.avatar_url ? (
          <img
            src={contact.avatar_url}
            alt={contact.name}
            className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
            {getInitials(contact.name)}
          </div>
        )}

        {/* Name */}
        <h3 className="text-lg font-semibold text-white mb-1 truncate">
          {contact.name}
        </h3>

        {/* Title & Company */}
        {contact.job_title && (
          <p className="text-sm text-gray-400 truncate">{contact.job_title}</p>
        )}
        {contact.company && (
          <p className="text-sm text-blue-400 truncate hover:underline">
            @ {contact.company} →
          </p>
        )}
      </div>

      {/* Communication Stats */}
      <div className="border-t border-gray-700 pt-3 mb-3">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-1">
          <span>{channelIcon}</span>
          <span>{formatTimeAgo(contact.last_interaction_date)}</span>
        </div>
        <div className="text-center text-xs text-gray-500">
          💬 {contact.total_interactions || 0} total interactions
        </div>
      </div>

      {/* Donor Info */}
      <div className="border-t border-gray-700 pt-3 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Stage:</span>
          <span className={`badge ${getDonorStageBadgeColor(contact.donor_stage)}`}>
            {contact.donor_stage}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Lifetime:</span>
          <span className="text-white font-medium">
            {formatCurrency(contact.total_lifetime_giving || 0)}
          </span>
        </div>
      </div>

      {/* Quick Actions (show on hover) */}
      <div className="card-actions opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle email action
          }}
          className="btn-sm btn-secondary flex-1"
        >
          Email
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle call action
          }}
          className="btn-sm btn-secondary flex-1"
        >
          Call
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getRelationshipColor(score: number): string {
  if (score >= 85) return 'border-green-500';
  if (score >= 70) return 'border-blue-500';
  if (score >= 50) return 'border-amber-500';
  if (score >= 30) return 'border-orange-500';
  return 'border-red-500';
}

function getChannelIcon(channel?: string): string {
  const icons = {
    email: '📧',
    slack: '💬',
    phone: '📞',
    meeting: '🗓️',
    sms: '💬'
  };
  return icons[channel || 'email'] || '📧';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getDonorStageBadgeColor(stage?: string): string {
  const colors = {
    'Major Donor': 'badge-success',
    'Repeat Donor': 'badge-info',
    'First-time Donor': 'badge-primary',
    'Prospect': 'badge-secondary'
  };
  return colors[stage || 'Prospect'] || 'badge-secondary';
}
```

### 1.4 Relationship Score Circle Component

**File:** `src/components/contacts/RelationshipScoreCircle.tsx`

```typescript
import React from 'react';

interface RelationshipScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RelationshipScoreCircle({ score, size = 'md' }: RelationshipScoreCircleProps) {
  // Dimensions based on size
  const dimensions = {
    sm: { width: 60, height: 60, strokeWidth: 4, fontSize: 'text-lg' },
    md: { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-2xl' },
    lg: { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-4xl' }
  };

  const { width, height, strokeWidth, fontSize } = dimensions[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={width} height={height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${color} transition-all duration-500`}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`${fontSize} font-bold text-white`}>
          ⭐ {score}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-amber-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-500';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Moderate';
  if (score >= 30) return 'At-risk';
  return 'Dormant';
}
```

### 1.5 Trend Indicator Component

**File:** `src/components/contacts/TrendIndicator.tsx`

```typescript
import React from 'react';

interface TrendIndicatorProps {
  trend?: 'rising' | 'stable' | 'falling' | 'new' | 'dormant';
  className?: string;
}

export function TrendIndicator({ trend, className = '' }: TrendIndicatorProps) {
  if (!trend) return null;

  const config = {
    rising: {
      icon: '↗',
      label: 'Rising',
      color: 'text-green-400',
      bg: 'bg-green-400/20'
    },
    stable: {
      icon: '━',
      label: 'Stable',
      color: 'text-blue-400',
      bg: 'bg-blue-400/20'
    },
    falling: {
      icon: '↘',
      label: 'Falling',
      color: 'text-orange-400',
      bg: 'bg-orange-400/20'
    },
    new: {
      icon: '✨',
      label: 'New',
      color: 'text-purple-400',
      bg: 'bg-purple-400/20'
    },
    dormant: {
      icon: '💤',
      label: 'Dormant',
      color: 'text-gray-400',
      bg: 'bg-gray-400/20'
    }
  };

  const { icon, label, color, bg } = config[trend];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${bg} ${className}`}>
      <span className={`text-lg ${color}`}>{icon}</span>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
```

### 1.6 Contact Story View (Detail Page)

**File:** `src/components/contacts/ContactStoryView.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { RelationshipScoreCircle } from './RelationshipScoreCircle';
import { TrendIndicator } from './TrendIndicator';
import { RecentActivityFeed } from './RecentActivityFeed';
import { pulseContactService } from '../../services/pulseContactService';
import { contactService } from '../../services/contactService';
import type { Contact } from '../../types';

interface ContactStoryViewProps {
  contact: Contact;
  onBack: () => void;
}

export function ContactStoryView({ contact, onBack }: ContactStoryViewProps) {
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEnrichment() {
      setLoading(true);
      try {
        // Fetch AI insights if contact has Pulse profile
        if (contact.pulse_profile_id) {
          const insights = await pulseContactService.getAIInsights(
            contact.pulse_profile_id
          );
          setAiInsights(insights);
        }

        // Fetch recent interactions from local DB
        const recentInteractions = await contactService.getRecentInteractions(
          contact.id,
          { limit: 30, days: 90 }
        );
        setInteractions(recentInteractions);
      } catch (error) {
        console.error('Failed to load enrichment:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEnrichment();
  }, [contact.id, contact.pulse_profile_id]);

  return (
    <div className="contact-story-view max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2"
      >
        ← Back to Contacts
      </button>

      {/* Relationship Score Hero */}
      <div className="text-center mb-8">
        <RelationshipScoreCircle score={contact.relationship_score || 0} size="lg" />
        <TrendIndicator trend={contact.relationship_trend} className="mt-4" />
        <div className="text-sm text-gray-400 mt-2">
          Last contact: {formatTimeAgo(contact.last_interaction_date)}
        </div>
      </div>

      {/* Contact Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-20 h-20 rounded-full border-2 border-gray-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(contact.name)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{contact.name}</h1>
            {contact.job_title && (
              <p className="text-lg text-gray-300 mb-1">{contact.job_title}</p>
            )}
            {contact.company && (
              <p className="text-blue-400 mb-3">@ {contact.company}</p>
            )}

            {/* Contact Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="hover:text-blue-400">
                  📧 {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="hover:text-blue-400">
                  📞 {contact.phone}
                </a>
              )}
              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400"
                >
                  🔗 LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary">Edit</button>
            <button className="btn btn-secondary">Archive</button>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg p-6 mb-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              💡 What You Need to Know
            </h2>
            <span className="text-xs text-gray-400">
              Updated {formatTimeAgo(aiInsights.last_analyzed_at)}
            </span>
          </div>

          {/* AI Summary */}
          <p className="text-gray-200 leading-relaxed mb-6">
            {aiInsights.ai_relationship_summary}
          </p>

          {/* Talking Points */}
          {aiInsights.ai_talking_points && aiInsights.ai_talking_points.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">
                📝 Prepare for Your Next Conversation
              </h3>
              <ul className="space-y-2">
                {aiInsights.ai_talking_points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-200">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Actions */}
          {aiInsights.ai_next_actions && aiInsights.ai_next_actions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-white mb-3">
                ⚡ Recommended Actions
              </h3>
              <div className="space-y-2">
                {aiInsights.ai_next_actions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    <input type="checkbox" className="checkbox" />
                    <div className="flex-1">
                      <span className="text-gray-200">{action.action}</span>
                    </div>
                    <span className={`badge badge-${action.priority}`}>
                      {action.priority}
                    </span>
                    {action.due_date && (
                      <span className="text-xs text-gray-400">
                        Due: {new Date(action.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Communication Profile */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          🗨️ Communication Profile
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Preferred Channel</div>
            <div className="text-white font-medium">
              {getChannelIcon(contact.preferred_channel)} {contact.preferred_channel || 'Email'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Frequency</div>
            <div className="text-white font-medium capitalize">
              {contact.communication_frequency || 'Monthly'}
            </div>
          </div>
        </div>

        {aiInsights?.ai_communication_style && (
          <div>
            <div className="text-sm text-gray-400 mb-1">Communication Style</div>
            <div className="text-gray-200">{aiInsights.ai_communication_style}</div>
          </div>
        )}

        {aiInsights?.ai_topics && aiInsights.ai_topics.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Topics They Care About</div>
            <div className="flex flex-wrap gap-2">
              {aiInsights.ai_topics.map((topic, i) => (
                <span key={i} className="badge badge-secondary">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Donor Profile */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          📊 Donor Profile
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Stage</div>
            <div className={`badge ${getDonorStageBadgeColor(contact.donor_stage)}`}>
              {contact.donor_stage}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Engagement</div>
            <div className="flex items-center gap-2">
              {getEngagementIcon(contact.engagement_score)}
              <span className="text-white font-medium capitalize">
                {contact.engagement_score}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Lifetime Giving</div>
            <div className="text-white font-medium text-lg">
              {formatCurrency(contact.total_lifetime_giving || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Last Gift</div>
            <div className="text-white">
              {contact.last_gift_date
                ? new Date(contact.last_gift_date).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            📅 Recent Activity
          </h2>
          <span className="text-sm text-gray-400">
            {interactions.length} interactions in last 90 days
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading interactions...</div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No recent interactions</div>
        ) : (
          <RecentActivityFeed interactions={interactions.slice(0, 3)} />
        )}

        {interactions.length > 3 && (
          <button className="btn btn-secondary w-full mt-4">
            View All {interactions.length} Interactions →
          </button>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="sticky bottom-6 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-xl">
        <div className="flex gap-3">
          <button className="btn btn-primary flex-1">
            📧 Send Email
          </button>
          <button className="btn btn-secondary flex-1">
            🗓️ Schedule Meeting
          </button>
          <button className="btn btn-secondary flex-1">
            💬 Log Interaction
          </button>
          <button className="btn btn-secondary flex-1">
            💵 Record Gift
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTimeAgo(date?: string): string {
  if (!date) return 'Never';
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return then.toLocaleDateString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}

function getChannelIcon(channel?: string): string {
  const icons = {
    email: '📧',
    slack: '💬',
    phone: '📞',
    meeting: '🗓️',
    sms: '💬'
  };
  return icons[channel || 'email'] || '📧';
}

function getDonorStageBadgeColor(stage?: string): string {
  const colors = {
    'Major Donor': 'badge-success',
    'Repeat Donor': 'badge-info',
    'First-time Donor': 'badge-primary',
    'Prospect': 'badge-secondary'
  };
  return colors[stage || 'Prospect'] || 'badge-secondary';
}

function getEngagementIcon(level?: string): string {
  const icons = {
    high: '🟢',
    medium: '🟡',
    low: '🔴'
  };
  return icons[level || 'low'] || '🔴';
}
```

### 1.7 Recent Activity Feed Component

**File:** `src/components/contacts/RecentActivityFeed.tsx`

```typescript
import React from 'react';
import { SentimentBadge } from './SentimentBadge';

interface Interaction {
  id: string;
  interaction_type: string;
  interaction_date: string;
  subject?: string;
  snippet?: string;
  sentiment_score?: number;
  ai_topics?: string[];
  ai_action_items?: string[];
  ai_summary?: string;
  duration_minutes?: number;
}

interface RecentActivityFeedProps {
  interactions: Interaction[];
}

export function RecentActivityFeed({ interactions }: RecentActivityFeedProps) {
  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <InteractionCard key={interaction.id} interaction={interaction} />
      ))}
    </div>
  );
}

function InteractionCard({ interaction }: { interaction: Interaction }) {
  const typeConfig = {
    email_sent: { icon: '📧', label: 'Email Sent' },
    email_received: { icon: '📬', label: 'Email Received' },
    meeting: { icon: '🗓️', label: 'Meeting' },
    call: { icon: '📞', label: 'Call' },
    slack_message: { icon: '💬', label: 'Slack' },
    sms_sent: { icon: '💬', label: 'SMS' }
  };

  const config = typeConfig[interaction.interaction_type] || { icon: '📝', label: 'Interaction' };

  return (
    <div className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800/30 transition-all">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl">{config.icon}</span>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-white">
              {interaction.subject || config.label}
            </h4>
            <div className="flex items-center gap-2">
              {interaction.sentiment_score !== undefined && (
                <SentimentBadge score={interaction.sentiment_score} />
              )}
              <span className="text-sm text-gray-400">
                {formatTimeAgo(interaction.interaction_date)}
              </span>
            </div>
          </div>

          {/* Snippet */}
          {interaction.snippet && (
            <p className="text-sm text-gray-300 mb-2">{interaction.snippet}</p>
          )}

          {/* Topics */}
          {interaction.ai_topics && interaction.ai_topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {interaction.ai_topics.map((topic, i) => (
                <span key={i} className="badge badge-sm badge-secondary">
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Action Items */}
          {interaction.ai_action_items && interaction.ai_action_items.length > 0 && (
            <div className="mt-2 p-2 bg-gray-900/50 rounded">
              <p className="text-xs font-medium text-gray-400 mb-1">Action Items:</p>
              <ul className="text-xs text-gray-300 list-disc list-inside">
                {interaction.ai_action_items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Summary */}
          {interaction.ai_summary && (
            <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
              <p className="text-xs text-gray-400 mb-1">💬 AI Summary:</p>
              <p className="text-sm text-gray-200">{interaction.ai_summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return then.toLocaleDateString();
}
```

### 1.8 Sentiment Badge Component

**File:** `src/components/contacts/SentimentBadge.tsx`

```typescript
import React from 'react';

interface SentimentBadgeProps {
  score: number; // -1 to +1
}

export function SentimentBadge({ score }: SentimentBadgeProps) {
  // Determine sentiment category
  let emoji = '😐';
  let label = 'Neutral';
  let color = 'bg-gray-600 text-gray-200';

  if (score >= 0.6) {
    emoji = '😊';
    label = 'Positive';
    color = 'bg-green-500/20 text-green-300 border border-green-500/30';
  } else if (score >= 0.2) {
    emoji = '🙂';
    label = 'Somewhat Positive';
    color = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  } else if (score <= -0.6) {
    emoji = '😟';
    label = 'Negative';
    color = 'bg-red-500/20 text-red-300 border border-red-500/30';
  } else if (score <= -0.2) {
    emoji = '😕';
    label = 'Somewhat Negative';
    color = 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}`}>
      <span>{emoji}</span>
      <span>{score >= 0 ? '+' : ''}{score.toFixed(2)}</span>
    </span>
  );
}
```

---

## Phase 2: Priorities Feed (Option D)

**Timeline:** Weeks 5-6
**Goal:** Add AI-driven action queue as "Priorities" tab

### 2.1 Priorities Feed View

**File:** `src/components/contacts/PrioritiesFeedView.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { ActionCard } from './ActionCard';
import { pulseContactService } from '../../services/pulseContactService';

interface Action {
  id: string;
  contactId: string;
  contactName: string;
  contactScore: number;
  contactTrend: string;
  contactCompany: string;
  donorStage: string;
  lifetimeGiving: number;
  priority: 'high' | 'medium' | 'low' | 'opportunity';
  reason: string;
  suggestedActions: string[];
  dueDate?: string;
  valueIndicator: string;
  lastInteractionDate: string;
  sentiment: number;
}

export function PrioritiesFeedView() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'week' | 'high-value'>('all');
  const [completedToday, setCompletedToday] = useState<Action[]>([]);

  useEffect(() => {
    async function loadActions() {
      setLoading(true);
      try {
        const data = await pulseContactService.getRecommendedActions();
        setActions(data);
      } catch (error) {
        console.error('Failed to load recommended actions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadActions();
  }, []);

  // Filter actions
  const filteredActions = actions.filter(action => {
    if (filter === 'overdue') {
      return action.dueDate && new Date(action.dueDate) < new Date();
    }
    if (filter === 'today') {
      const today = new Date().toDateString();
      return action.dueDate && new Date(action.dueDate).toDateString() === today;
    }
    if (filter === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return action.dueDate && new Date(action.dueDate) <= weekFromNow;
    }
    if (filter === 'high-value') {
      return action.priority === 'high' || action.priority === 'opportunity';
    }
    return true;
  });

  // Sort by priority
  const sortedActions = filteredActions.sort((a, b) => {
    const priorityOrder = { high: 0, opportunity: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  async function handleCompleteAction(actionId: string) {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      setCompletedToday([...completedToday, action]);
      setActions(actions.filter(a => a.id !== actionId));

      // TODO: Mark as complete in backend
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="priorities-feed-view max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Outreach Priorities</h2>
        <p className="text-gray-400">
          AI-recommended actions to strengthen relationships and drive engagement
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
          count={actions.length}
        />
        <FilterChip
          active={filter === 'overdue'}
          onClick={() => setFilter('overdue')}
          label="⏱️ Overdue"
          count={actions.filter(a => a.dueDate && new Date(a.dueDate) < new Date()).length}
        />
        <FilterChip
          active={filter === 'today'}
          onClick={() => setFilter('today')}
          label="📅 Today"
          count={actions.filter(a => {
            const today = new Date().toDateString();
            return a.dueDate && new Date(a.dueDate).toDateString() === today;
          }).length}
        />
        <FilterChip
          active={filter === 'week'}
          onClick={() => setFilter('week')}
          label="📅 This Week"
          count={actions.filter(a => {
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return a.dueDate && new Date(a.dueDate) <= weekFromNow;
          }).length}
        />
        <FilterChip
          active={filter === 'high-value'}
          onClick={() => setFilter('high-value')}
          label="🔥 High Value"
          count={actions.filter(a => a.priority === 'high' || a.priority === 'opportunity').length}
        />
      </div>

      {/* Actions Feed */}
      <div className="space-y-4 mb-8">
        {sortedActions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl mb-2">🎉 All caught up!</p>
            <p>No outstanding actions in this category.</p>
          </div>
        ) : (
          sortedActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onComplete={() => handleCompleteAction(action.id)}
            />
          ))
        )}
      </div>

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            ✅ Completed Today ({completedToday.length})
          </h3>
          <div className="space-y-2">
            {completedToday.map(action => (
              <div key={action.id} className="text-sm text-gray-300 flex items-center gap-2">
                <span>✓</span>
                <span>{action.reason} - {action.contactName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all
        ${active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
        }
      `}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 ${active ? 'text-blue-200' : 'text-gray-500'}`}>
          ({count})
        </span>
      )}
    </button>
  );
}
```

### 2.2 Action Card Component

**File:** `src/components/contacts/ActionCard.tsx`

```typescript
import React, { useState } from 'react';
import { RelationshipScoreCircle } from './RelationshipScoreCircle';
import { TrendIndicator } from './TrendIndicator';
import { formatTimeAgo, formatCurrency } from '../../utils/formatters';

interface ActionCardProps {
  action: {
    id: string;
    contactId: string;
    contactName: string;
    contactScore: number;
    contactTrend: string;
    contactCompany: string;
    donorStage: string;
    lifetimeGiving: number;
    priority: 'high' | 'medium' | 'low' | 'opportunity';
    reason: string;
    suggestedActions: string[];
    dueDate?: string;
    valueIndicator: string;
    lastInteractionDate: string;
    sentiment: number;
  };
  onComplete: () => void;
}

export function ActionCard({ action, onComplete }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const priorityConfig = {
    high: {
      badge: 'bg-red-500/20 text-red-300 border-red-500/50',
      icon: '🔴',
      label: 'HIGH PRIORITY'
    },
    medium: {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      icon: '🟡',
      label: 'MEDIUM PRIORITY'
    },
    low: {
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      icon: '🔵',
      label: 'LOW PRIORITY'
    },
    opportunity: {
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      icon: '🔵',
      label: 'OPPORTUNITY'
    }
  };

  const config = priorityConfig[action.priority];

  function handleCheckItem(index: number) {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  }

  return (
    <div className="action-card bg-gray-800/50 backdrop-blur-sm border-2 border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all">
      {/* Priority Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.badge} font-medium text-sm`}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
          {action.dueDate && (
            <span className="ml-2">
              · Due {getDueDateLabel(action.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-shrink-0">
            <RelationshipScoreCircle score={action.contactScore} size="sm" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">
              {action.reason}
            </h3>
            <p className="text-gray-400">
              {action.contactName} · {action.donorStage} ({formatCurrency(action.lifetimeGiving)} lifetime)
            </p>
            {action.contactCompany && (
              <p className="text-sm text-blue-400">@ {action.contactCompany}</p>
            )}
          </div>
          <TrendIndicator trend={action.contactTrend as any} />
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">AI Recommendation:</p>
            <p className="text-gray-200">{action.reason}</p>
          </div>
        </div>
      </div>

      {/* Suggested Actions Checklist */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-400 mb-2">Suggested Actions:</p>
        <div className="space-y-2">
          {action.suggestedActions.map((item, i) => (
            <label
              key={i}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-700/30 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={checkedItems.has(i)}
                onChange={() => handleCheckItem(i)}
                className="checkbox"
              />
              <span className={`text-sm ${checkedItems.has(i) ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>📧 Last contact: {formatTimeAgo(action.lastInteractionDate)}</span>
        {action.sentiment !== undefined && (
          <span>
            {action.sentiment > 0 ? '😊' : action.sentiment < 0 ? '😟' : '😐'}
            {' '}{action.sentiment >= 0 ? '+' : ''}{action.sentiment.toFixed(2)} sentiment
          </span>
        )}
        <span>🎯 Value: {action.valueIndicator}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onComplete}
          className="btn btn-success flex-1"
          disabled={checkedItems.size === 0}
        >
          ✓ Mark Complete
        </button>
        <button className="btn btn-primary flex-1">
          ✉️ Draft Email
        </button>
        <button className="btn btn-secondary flex-1">
          🗓️ Schedule
        </button>
        <button
          onClick={() => {
            // Navigate to contact detail
            window.location.href = `/contacts/${action.contactId}`;
          }}
          className="btn btn-secondary"
        >
          View Profile →
        </button>
      </div>
    </div>
  );
}

function getDueDateLabel(dueDate: string): string {
  const due = new Date(dueDate);
  const today = new Date();
  const diff = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return 'Overdue';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 7) return `in ${diff} days`;
  return due.toLocaleDateString();
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return then.toLocaleDateString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
}
```

---

## Component Architecture

### Component Tree

```
ContactsPage
├── ContactSearch
├── ContactFilters
├── TabButton (x3)
└── Content Area
    ├── [Tab: All Contacts]
    │   ├── ContactCardGallery
    │   │   └── ContactCard (virtualized grid)
    │   │       ├── RelationshipScoreCircle
    │   │       └── TrendIndicator
    │   └── ContactStoryView
    │       ├── RelationshipScoreCircle
    │       ├── TrendIndicator
    │       ├── RecentActivityFeed
    │       │   └── InteractionCard
    │       │       └── SentimentBadge
    │       └── Quick Actions Bar
    │
    ├── [Tab: Priorities]
    │   └── PrioritiesFeedView
    │       └── ActionCard (x N)
    │           ├── RelationshipScoreCircle
    │           ├── TrendIndicator
    │           └── Action Checklist
    │
    └── [Tab: Recent Activity]
        └── (Coming soon)
```

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-window": "^1.8.10",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-window": "^1.8.8",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0"
  }
}
```

---

## Styling Guidelines

### TailwindCSS Configuration

**File:** `tailwind.config.js`

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Relationship health colors
        'relationship': {
          strong: '#10b981', // green-500
          good: '#3b82f6', // blue-500
          moderate: '#f59e0b', // amber-500
          atrisk: '#f97316', // orange-500
          dormant: '#ef4444' // red-500
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 50%, #581c87 100%)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: []
};
```

### Global CSS Classes

**File:** `src/styles/contacts.css`

```css
/* Contact Card Hover Effects */
.contact-card {
  @apply transition-all duration-200;
}

.contact-card:hover {
  @apply scale-105 shadow-2xl;
}

.contact-card:hover .card-actions {
  @apply opacity-100;
}

/* Badge Styles */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge-primary {
  @apply bg-blue-500/20 text-blue-300 border border-blue-500/30;
}

.badge-secondary {
  @apply bg-gray-600/20 text-gray-300 border border-gray-600/30;
}

.badge-success {
  @apply bg-green-500/20 text-green-300 border border-green-500/30;
}

.badge-info {
  @apply bg-blue-400/20 text-blue-300 border border-blue-400/30;
}

.badge-warning {
  @apply bg-amber-500/20 text-amber-300 border border-amber-500/30;
}

.badge-danger {
  @apply bg-red-500/20 text-red-300 border border-red-500/30;
}

/* Button Styles */
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all;
}

.btn-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-700 text-gray-200 hover:bg-gray-600 active:bg-gray-500;
}

.btn-success {
  @apply bg-green-500 text-white hover:bg-green-600 active:bg-green-700;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

/* Checkbox Styles */
.checkbox {
  @apply w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900;
}

/* Loading States */
.skeleton {
  @apply bg-gray-700 animate-pulse rounded;
}

/* Card Actions (hidden until hover) */
.card-actions {
  @apply opacity-0 transition-opacity duration-200;
}
```

---

## User Flows

### Flow 1: Browse Contacts → View Detail → Take Action

```
1. User lands on Contacts page
   ↓
2. Sees card gallery with relationship scores (color-coded)
   ↓
3. Clicks on a contact card
   ↓
4. Story view opens with:
   - Relationship score hero
   - AI meeting prep insights
   - Communication profile
   - Donor history
   - Recent activity feed
   ↓
5. Reviews AI talking points
   ↓
6. Clicks "Send Email" in quick actions bar
   ↓
7. Email composer opens with pre-filled content
   ↓
8. Sends email and returns to contacts list
```

### Flow 2: Check Daily Priorities → Complete Actions

```
1. User opens Contacts page
   ↓
2. Clicks "Priorities" tab (sees badge: "12 actions")
   ↓
3. Sees AI-recommended action feed
   ↓
4. Reviews top action (high priority, due today)
   ↓
5. Reads AI recommendation and suggested checklist
   ↓
6. Clicks "Draft Email" button
   ↓
7. Reviews pre-filled email draft
   ↓
8. Sends email
   ↓
9. Returns to priorities feed
   ↓
10. Checks off action items
    ↓
11. Clicks "Mark Complete"
    ↓
12. Action moves to "Completed Today" section
    ↓
13. Progress indicator updates: "1 of 12 actions completed"
    ↓
14. Moves to next action
```

### Flow 3: Search & Filter Contacts

```
1. User needs to find contacts tagged "investor"
   ↓
2. Clicks "Filters" button
   ↓
3. Selects "Tags" filter → checks "investor"
   ↓
4. Card gallery updates to show only matching contacts
   ↓
5. Further refines with relationship score filter (76-100)
   ↓
6. Sees 8 high-scoring investor contacts
   ↓
7. Sorts by "Last Interaction" (oldest first)
   ↓
8. Identifies contacts who haven't been contacted recently
   ↓
9. Clicks contact to review relationship history
```

---

## Performance Optimization

### 1. Virtual Scrolling

Use `react-window` for contact card gallery:

```typescript
import { FixedSizeGrid as Grid } from 'react-window';

// In ContactCardGallery.tsx
<Grid
  columnCount={columnCount}
  columnWidth={columnWidth}
  height={window.innerHeight - 250}
  rowCount={rowCount}
  rowHeight={rowHeight}
  width={window.innerWidth - 48}
>
  {Cell}
</Grid>
```

**Benefits:**
- Only renders visible cards (30-40 at a time)
- Smooth scrolling with 10,000+ contacts
- Reduced memory footprint

### 2. API Response Caching

Use React Query for intelligent caching:

```typescript
import { useQuery } from '@tanstack/react-query';

function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => contactService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
}
```

### 3. Lazy Loading AI Insights

Only fetch AI insights when detail view is opened:

```typescript
useEffect(() => {
  async function loadAI() {
    if (!contact.pulse_profile_id) return;

    const insights = await pulseContactService.getAIInsights(
      contact.pulse_profile_id
    );
    setAiInsights(insights);
  }

  loadAI();
}, [contact.pulse_profile_id]);
```

### 4. Image Optimization

Lazy load avatars with placeholder:

```typescript
<img
  src={contact.avatar_url}
  alt={contact.name}
  loading="lazy"
  className="w-16 h-16 rounded-full"
  onError={(e) => {
    e.currentTarget.src = '/default-avatar.png';
  }}
/>
```

### 5. Debounced Search

Prevent excessive filtering on every keystroke:

```typescript
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

function ContactSearch({ value, onChange }) {
  const debouncedValue = useDebouncedValue(value, 300);

  useEffect(() => {
    // Trigger search with debounced value
    performSearch(debouncedValue);
  }, [debouncedValue]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search contacts..."
    />
  );
}
```

---

## Testing Strategy

### Unit Tests

**Test Coverage Goals:** 80%+

```typescript
// ContactCard.test.tsx
describe('ContactCard', () => {
  test('renders relationship score', () => {
    const contact = { name: 'John Smith', relationship_score: 85 };
    render(<ContactCard contact={contact} onClick={() => {}} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  test('applies correct border color for score', () => {
    const contact = { name: 'John Smith', relationship_score: 85 };
    const { container } = render(<ContactCard contact={contact} onClick={() => {}} />);
    expect(container.querySelector('.border-green-500')).toBeInTheDocument();
  });

  test('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    const contact = { name: 'John Smith' };
    render(<ContactCard contact={contact} onClick={handleClick} />);
    fireEvent.click(screen.getByText('John Smith'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
// ContactsPage.test.tsx
describe('ContactsPage', () => {
  test('loads and displays contacts', async () => {
    vi.spyOn(contactService, 'getAll').mockResolvedValue([
      { id: '1', name: 'John Smith', relationship_score: 85 },
      { id: '2', name: 'Sarah Johnson', relationship_score: 72 }
    ]);

    render(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });
  });

  test('filters contacts by search query', async () => {
    // ... test implementation
  });

  test('switches between tabs', () => {
    render(<ContactsPage />);
    fireEvent.click(screen.getByText('Priorities'));
    expect(screen.getByText('Your Outreach Priorities')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/contacts.spec.ts
test('browse contacts and view detail', async ({ page }) => {
  await page.goto('/contacts');

  // Wait for contacts to load
  await page.waitForSelector('.contact-card');

  // Click first contact
  await page.click('.contact-card:first-child');

  // Verify detail view opened
  await expect(page.locator('text=Back to Contacts')).toBeVisible();
  await expect(page.locator('.relationship-score-circle')).toBeVisible();

  // Check AI insights loaded
  await expect(page.locator('text=What You Need to Know')).toBeVisible();
});
```

### Visual Regression Tests

Use Percy or Chromatic for visual diffs:

```typescript
// visual.test.tsx
test('contact card visual snapshot', () => {
  const contact = {
    name: 'John Smith',
    relationship_score: 85,
    company: 'Acme Corp',
    donor_stage: 'Major Donor'
  };

  const { container } = render(<ContactCard contact={contact} onClick={() => {}} />);
  expect(container).toMatchSnapshot();
});
```

---

## Deployment Plan

### Phase 1: MVP (Weeks 1-4)

**Deliverables:**
- ✅ Contact card gallery with relationship scores
- ✅ Story-format detail view
- ✅ AI insights panel
- ✅ Recent activity feed
- ✅ Search and filtering

**Deployment:**
1. Merge PR to `develop` branch
2. Deploy to staging environment
3. QA testing (2 days)
4. Gradual rollout to 10% of users (A/B test)
5. Monitor metrics (load time, engagement, errors)
6. Full rollout to 100% of users

### Phase 2: Priorities Feed (Weeks 5-6)

**Deliverables:**
- ✅ Actionable feed with AI recommendations
- ✅ Priority filtering and sorting
- ✅ Action completion tracking
- ✅ Gamification (progress indicator)

**Deployment:**
1. Merge PR to `develop` branch
2. Deploy to staging environment
3. QA testing (1 day)
4. Beta release to 20% of users
5. Gather feedback (1 week)
6. Full rollout with improvements

### Rollback Plan

If critical issues arise:

```bash
# Revert to previous version
git revert <commit-hash>
npm run build
npm run deploy

# Or toggle feature flag
VITE_FEATURE_PRIORITIES_FEED=false
```

---

## Success Metrics

### Performance KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial page load | <2s | Lighthouse |
| Card gallery render (1000 contacts) | <500ms | React Profiler |
| Detail view load | <300ms | API response time |
| AI insights fetch | <200ms | API response time |
| Virtual scroll FPS | 60 FPS | Chrome DevTools |

### User Engagement KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users | +30% | Analytics |
| Avg time on Contacts page | +50% | Analytics |
| Contact detail views per session | +40% | Analytics |
| Actions completed from Priorities feed | 5+ per day per user | Backend logs |
| Search usage | 60% of sessions | Analytics |

### Business KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Outreach emails sent | +25% | Email logs |
| Donor engagement rate | +15% | Donor activity |
| Relationship score improvements | 10% of contacts | Pulse data |
| User satisfaction (NPS) | 8.5+/10 | In-app survey |

---

## Next Steps

1. **Review this implementation plan** with development team
2. **Set up project structure** (components, services, types)
3. **Create design tokens** (colors, spacing, typography in Tailwind config)
4. **Start Phase 1 development** (Week 1: Card Gallery)
5. **Weekly demos** to stakeholders for feedback

**Questions?** Open an issue or reach out to the design team.

---

**Plan Version:** 1.0
**Last Updated:** 2026-01-25
**Status:** ✅ Ready for Implementation
