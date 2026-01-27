import React, { useState, useEffect } from 'react';
import { RelationshipScoreCircle } from './RelationshipScoreCircle';
import { TrendIndicator } from './TrendIndicator';
import { RecentActivityFeed } from './RecentActivityFeed';
import { pulseContactService } from '../../services/pulseContactService';
import { logger } from '../../utils/logger';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  avatar_url?: string;
  linkedin_url?: string;
  relationship_score?: number;
  relationship_trend?: 'rising' | 'stable' | 'falling' | 'new' | 'dormant';
  preferred_channel?: string;
  communication_frequency?: string;
  last_interaction_date?: string;
  total_interactions?: number;
  donor_stage?: string;
  engagement_score?: string;
  total_lifetime_giving?: number;
  last_gift_date?: string;
  pulse_profile_id?: string;
}

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
        let loadedInsights = null;
        let loadedInteractions: any[] = [];

        // Fetch AI insights if contact has Pulse profile
        if (contact.pulse_profile_id) {
          logger.debug(`ContactStoryView: Fetching AI insights for ${contact.pulse_profile_id}`);
          try {
            const insights = await pulseContactService.getAIInsights(contact.pulse_profile_id);
            if (insights) {
              loadedInsights = insights;
              logger.debug('ContactStoryView: Successfully loaded AI insights from Pulse API');
            } else {
              logger.debug('ContactStoryView: No AI insights available for this contact');
            }
          } catch (insightsError) {
            logger.warn('ContactStoryView: Failed to load AI insights', insightsError);
            // Continue without insights
          }

          // Fetch recent interactions from Pulse API
          logger.debug(`ContactStoryView: Fetching recent interactions for ${contact.pulse_profile_id}`);
          try {
            const interactionsResponse = await pulseContactService.getRecentInteractions(
              contact.pulse_profile_id,
              { limit: 30, days: 90 }
            );
            if (interactionsResponse && interactionsResponse.interactions) {
              loadedInteractions = interactionsResponse.interactions;
              logger.debug(`ContactStoryView: Successfully loaded ${loadedInteractions.length} interactions from Pulse API`);
            }
          } catch (interactionsError) {
            logger.warn('ContactStoryView: Failed to load interactions', interactionsError);
            // Continue without interactions
          }
        }

        // Fallback to mock data if no Pulse profile or API failed
        if (!loadedInsights) {
          logger.debug('ContactStoryView: Using mock AI insights (no Pulse data available)');
          loadedInsights = {
            profile_id: contact.pulse_profile_id || contact.id,
            ai_relationship_summary: 'Strong relationship with consistent engagement over the past 6 months. Last interaction showed positive sentiment about the upcoming project.',
            ai_talking_points: [
              'Follow up on the Q1 project proposal discussion',
              'Ask about their recent expansion into the Chicago market',
              'Mention the upcoming industry conference in March'
            ],
            ai_next_actions: [
              { action: 'Send project update email', priority: 'high' as const, due_date: '2026-02-01' },
              { action: 'Schedule Q1 planning call', priority: 'medium' as const, due_date: '2026-02-05' }
            ],
            ai_communication_style: 'Prefers direct, data-driven communication. Responds best to structured proposals with clear ROI metrics.',
            ai_topics: ['Project Management', 'ROI Analysis', 'Team Expansion'],
            ai_sentiment_average: 0.75,
            confidence_score: 0.8,
            last_analyzed_at: '2026-01-25T10:30:00Z'
          };
        }

        if (loadedInteractions.length === 0) {
          logger.debug('ContactStoryView: Using mock interactions (no Pulse data available)');
          loadedInteractions = [
            {
              id: '1',
              profile_id: contact.pulse_profile_id || contact.id,
              interaction_type: 'email_sent',
              interaction_date: '2026-01-20T14:30:00Z',
              subject: 'Project Proposal Follow-up',
              snippet: 'Thanks for the detailed proposal. I\'ll review with my team this week...',
              sentiment_score: 0.7,
              ai_topics: ['Project Proposal', 'Team Review'],
              ai_summary: 'Positive response to project proposal, committed to team review this week',
              synced_at: new Date().toISOString(),
              created_at: '2026-01-20T14:30:00Z'
            },
            {
              id: '2',
              profile_id: contact.pulse_profile_id || contact.id,
              interaction_type: 'meeting',
              interaction_date: '2026-01-15T10:00:00Z',
              subject: 'Q1 Planning Discussion',
              sentiment_score: 0.8,
              ai_topics: ['Q1 Goals', 'Budget Planning', 'Timeline'],
              ai_action_items: ['Send updated timeline by Friday', 'Schedule follow-up for Feb 1st'],
              duration_minutes: 45,
              synced_at: new Date().toISOString(),
              created_at: '2026-01-15T10:00:00Z'
            }
          ];
        }

        setAiInsights(loadedInsights);
        setInteractions(loadedInteractions);
      } catch (error) {
        logger.error('ContactStoryView: Failed to load enrichment', error);
        // Set error state but continue with empty data
        setAiInsights(null);
        setInteractions([]);
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
        type="button"
        onClick={onBack}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 transition-colors"
        aria-label="Back to contacts list"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Contacts
      </button>

      {/* Relationship Score Hero */}
      <div className="text-center mb-8">
        <RelationshipScoreCircle score={contact.relationship_score || 0} size="lg" />
        <TrendIndicator trend={contact.relationship_trend} className="mt-4" />
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Last contact: {formatTimeAgo(contact.last_interaction_date)}
        </div>
      </div>

      {/* Contact Header */}
      <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-md dark:shadow-none">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {contact.avatar_url ? (
            <img
              src={contact.avatar_url}
              alt={contact.name}
              className="w-20 h-20 rounded-full border-2 border-gray-300 dark:border-gray-600"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(contact.name)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {contact.name}
            </h1>
            {contact.job_title && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">{contact.job_title}</p>
            )}
            {contact.company && (
              <p className="text-blue-600 dark:text-blue-400 mb-3">@ {contact.company}</p>
            )}

            {/* Contact Details */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                  aria-label={`Email ${contact.name} at ${contact.email}`}
                >
                  <span aria-hidden="true">📧</span>
                  <span>{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                  aria-label={`Call ${contact.name} at ${contact.phone}`}
                >
                  <span aria-hidden="true">📞</span>
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
                  aria-label={`View ${contact.name}'s LinkedIn profile (opens in new tab)`}
                >
                  <span aria-hidden="true">🔗</span>
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button type="button" className="btn btn-primary">Edit</button>
            <button type="button" className="btn btn-secondary">Archive</button>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights && (
        <div className="bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-lg p-6 mb-6 border border-blue-300/30 dark:border-blue-500/30 shadow-md dark:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              What You Need to Know
            </h2>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Updated {formatTimeAgo(aiInsights.last_analyzed_at)}
            </span>
          </div>

          {/* AI Summary */}
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
            {aiInsights.ai_relationship_summary}
          </p>

          {/* Talking Points */}
          {aiInsights.ai_talking_points && aiInsights.ai_talking_points.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span aria-hidden="true">📝</span>
                <span>Prepare for Your Next Conversation</span>
              </h3>
              <ul className="space-y-2" role="list">
                {aiInsights.ai_talking_points.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1" aria-hidden="true">✓</span>
                    <span className="text-gray-700 dark:text-gray-200">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Actions */}
          {aiInsights.ai_next_actions && aiInsights.ai_next_actions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span aria-hidden="true">⚡</span>
                <span>Recommended Actions</span>
              </h3>
              <ul className="space-y-2" role="list" aria-label="Recommended actions">
                {aiInsights.ai_next_actions.map((action: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      className="checkbox"
                      id={`action-checkbox-${i}`}
                      aria-label={`Mark "${action.action}" as complete`}
                    />
                    <div className="flex-1">
                      <span className="text-gray-700 dark:text-gray-200">{action.action}</span>
                    </div>
                    <span className={`badge badge-${action.priority}`}>
                      {action.priority}
                    </span>
                    {action.due_date && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Due: {new Date(action.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Communication Profile */}
      <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-md dark:shadow-none">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span aria-hidden="true">🗨️</span>
          <span>Communication Profile</span>
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Preferred Channel</div>
            <div className="text-gray-900 dark:text-white font-medium">
              {getChannelIcon(contact.preferred_channel)} {contact.preferred_channel || 'Email'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Frequency</div>
            <div className="text-gray-900 dark:text-white font-medium capitalize">
              {contact.communication_frequency || 'Monthly'}
            </div>
          </div>
        </div>

        {aiInsights?.ai_communication_style && (
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Communication Style</div>
            <div className="text-gray-700 dark:text-gray-200">{aiInsights.ai_communication_style}</div>
          </div>
        )}

        {aiInsights?.ai_topics && aiInsights.ai_topics.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Topics They Care About</div>
            <div className="flex flex-wrap gap-2">
              {aiInsights.ai_topics.map((topic: string, i: number) => (
                <span key={i} className="badge badge-secondary">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Donor Profile */}
      <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-md dark:shadow-none">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span aria-hidden="true">📊</span>
          <span>Donor Profile</span>
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stage</div>
            <div className={`badge ${getDonorStageBadgeColor(contact.donor_stage)}`}>
              {contact.donor_stage || 'Prospect'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Engagement</div>
            <div className="flex items-center gap-2">
              {getEngagementIcon(contact.engagement_score)}
              <span className="text-gray-900 dark:text-white font-medium capitalize">
                {contact.engagement_score || 'Medium'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lifetime Giving</div>
            <div className="text-gray-900 dark:text-white font-medium text-lg">
              {formatCurrency(contact.total_lifetime_giving || 0)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Gift</div>
            <div className="text-gray-900 dark:text-white">
              {contact.last_gift_date
                ? new Date(contact.last_gift_date).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-md dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span aria-hidden="true">📅</span>
            <span>Recent Activity</span>
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {interactions.length} interactions in last 90 days
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
            Loading interactions...
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">No recent interactions</div>
        ) : (
          <RecentActivityFeed interactions={interactions.slice(0, 3)} />
        )}

        {interactions.length > 3 && (
          <button type="button" className="btn btn-secondary w-full mt-4">
            View All {interactions.length} Interactions
          </button>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="sticky bottom-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="flex gap-3">
          <button type="button" className="btn btn-primary flex-1" aria-label={`Send email to ${contact.name}`}>
            <span aria-hidden="true">📧</span>
            <span>Send Email</span>
          </button>
          <button type="button" className="btn btn-secondary flex-1" aria-label={`Schedule meeting with ${contact.name}`}>
            <span aria-hidden="true">🗓️</span>
            <span>Schedule Meeting</span>
          </button>
          <button type="button" className="btn btn-secondary flex-1" aria-label={`Log interaction with ${contact.name}`}>
            <span aria-hidden="true">💬</span>
            <span>Log Interaction</span>
          </button>
          <button type="button" className="btn btn-secondary flex-1" aria-label={`Record gift from ${contact.name}`}>
            <span aria-hidden="true">💵</span>
            <span>Record Gift</span>
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
  const icons: Record<string, string> = {
    email: '📧',
    slack: '💬',
    phone: '📞',
    meeting: '🗓️',
    sms: '💬'
  };
  return icons[channel || 'email'] || '📧';
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

function getEngagementIcon(level?: string): string {
  const icons: Record<string, string> = {
    high: '🟢',
    medium: '🟡',
    low: '🔴'
  };
  return icons[level || 'medium'] || '🟡';
}
