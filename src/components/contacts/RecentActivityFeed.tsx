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
  const typeConfig: Record<string, { icon: string; label: string }> = {
    email_sent: { icon: '📧', label: 'Email Sent' },
    email_received: { icon: '📬', label: 'Email Received' },
    meeting: { icon: '🗓️', label: 'Meeting' },
    call: { icon: '📞', label: 'Call' },
    slack_message: { icon: '💬', label: 'Slack' },
    sms_sent: { icon: '💬', label: 'SMS' }
  };

  const config = typeConfig[interaction.interaction_type] || { icon: '📝', label: 'Interaction' };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl" aria-hidden="true">{config.icon}</span>
        <span className="sr-only">{config.label} interaction</span>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {interaction.subject || config.label}
            </h4>
            <div className="flex items-center gap-2">
              {interaction.sentiment_score !== undefined && (
                <SentimentBadge score={interaction.sentiment_score} />
              )}
              <span
                className="text-sm text-gray-600 dark:text-gray-400"
                title={new Date(interaction.interaction_date).toLocaleString()}
              >
                {formatTimeAgo(interaction.interaction_date)}
              </span>
            </div>
          </div>

          {/* Snippet */}
          {interaction.snippet && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{interaction.snippet}</p>
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
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-900/50 rounded">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Action Items:</p>
              <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc list-inside">
                {interaction.ai_action_items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Summary */}
          {interaction.ai_summary && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">AI Summary:</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">{interaction.ai_summary}</p>
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
