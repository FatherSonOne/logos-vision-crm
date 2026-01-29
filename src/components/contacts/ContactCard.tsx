import React from 'react';
import { RelationshipScoreCircle } from './RelationshipScoreCircle';
import { TrendIndicator } from './TrendIndicator';
import { MessageSquare } from 'lucide-react';

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

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  commentCount?: number;
  recentActivityCount?: number;
}

export function ContactCard({ contact, onClick, commentCount = 0, recentActivityCount = 0 }: ContactCardProps) {
  // Determine card border color based on relationship score
  const borderColor = getRelationshipColor(contact.relationship_score || 0);

  // Get interaction channel icon
  const channelIcon = getChannelIcon(contact.preferred_channel);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger if clicking the card itself, not child interactive elements
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.card-clickable')) {
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`
        contact-card group
        bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg
        border-2 ${borderColor}
        hover:shadow-xl hover:scale-105
        transition-all duration-200 cursor-pointer
        p-4 shadow-md dark:shadow-none
        focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2
        text-left w-full
      `}
      aria-label={`View profile for ${contact.name}, relationship score ${contact.relationship_score || 0}`}
    >
      {/* Relationship Score Header */}
      <div className="flex flex-col items-center mb-4 card-clickable">
        <RelationshipScoreCircle score={contact.relationship_score || 0} />
        <TrendIndicator trend={contact.relationship_trend} className="mt-2" />
      </div>

      {/* Contact Info */}
      <div className="text-center mb-4 card-clickable">
        {/* Avatar or Initials */}
        {contact.avatar_url ? (
          <img
            src={contact.avatar_url}
            alt={contact.name}
            className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-300 dark:border-gray-600"
          />
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
            {getInitials(contact.name)}
          </div>
        )}

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {contact.name}
        </h3>

        {/* Title & Company */}
        {contact.job_title && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{contact.job_title}</p>
        )}
        {contact.company && (
          <p className="text-sm text-blue-600 dark:text-blue-400 truncate hover:underline">
            @ {contact.company}
          </p>
        )}
      </div>

      {/* Communication Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3 card-clickable">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span aria-hidden="true">{channelIcon}</span>
          <span>{formatTimeAgo(contact.last_interaction_date)}</span>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-500">
          {contact.total_interactions || 0} total interactions
        </div>
      </div>

      {/* Donor Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1 card-clickable">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Stage:</span>
          <span className={`badge ${getDonorStageBadgeColor(contact.donor_stage)}`}>
            {contact.donor_stage || 'Prospect'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Lifetime:</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatCurrency(contact.total_lifetime_giving || 0)}
          </span>
        </div>
      </div>

      {/* Collaboration Indicators */}
      {(commentCount > 0 || recentActivityCount > 0) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 card-clickable">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {commentCount > 0 && (
              <div className="flex items-center gap-1" title={`${commentCount} team ${commentCount === 1 ? 'note' : 'notes'}`}>
                <MessageSquare className="w-3 h-3" />
                <span>{commentCount} {commentCount === 1 ? 'note' : 'notes'}</span>
              </div>
            )}
            {recentActivityCount > 0 && (
              <div className="flex items-center gap-1" title={`${recentActivityCount} recent ${recentActivityCount === 1 ? 'activity' : 'activities'}`}>
                <Activity className="w-3 h-3" />
                <span>{recentActivityCount} recent</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions (show on hover) */}
      <div className="card-actions opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 mt-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Handle email action
            window.location.href = `mailto:${contact.email || ''}`;
          }}
          className="btn-sm btn-secondary flex-1"
          aria-label={`Send email to ${contact.name}${!contact.email ? ' (no email address available)' : ''}`}
          disabled={!contact.email}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="sr-only md:not-sr-only">Email</span>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Handle call action
            if (contact.phone) {
              window.location.href = `tel:${contact.phone}`;
            }
          }}
          className="btn-sm btn-secondary flex-1"
          aria-label={`Call ${contact.name}${!contact.phone ? ' (no phone number available)' : ''}`}
          disabled={!contact.phone}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="sr-only md:not-sr-only">Call</span>
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
  const icons: Record<string, string> = {
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
  const colors: Record<string, string> = {
    'Major Donor': 'badge-success',
    'Repeat Donor': 'badge-info',
    'First-time Donor': 'badge-primary',
    'Prospect': 'badge-secondary'
  };
  return colors[stage || 'Prospect'] || 'badge-secondary';
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
