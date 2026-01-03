import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Collaboration Features Component
 *
 * Features:
 * - @mentions in notes and comments
 * - Activity feed ("Sarah commented on...", "New donation recorded...")
 * - Team member presence indicators
 * - Rich text comments with mentions
 */

// ============================================
// TYPES
// ============================================

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastActive?: string;
}

interface ActivityItem {
  id: string;
  type: 'comment' | 'mention' | 'update' | 'create' | 'delete' | 'assign' | 'donation' | 'milestone';
  actor: TeamMember;
  action: string;
  target?: string;
  targetType?: 'contact' | 'project' | 'donation' | 'task' | 'document';
  targetId?: string;
  content?: string;
  mentions?: string[];
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Comment {
  id: string;
  author: TeamMember;
  content: string;
  mentions: string[];
  timestamp: string;
  isEdited?: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

// ============================================
// SAMPLE DATA
// ============================================

const sampleTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Mitchell', email: 'sarah@org.com', role: 'Development Director', isOnline: true },
  { id: '2', name: 'James Chen', email: 'james@org.com', role: 'Program Manager', isOnline: true },
  { id: '3', name: 'Emily Rodriguez', email: 'emily@org.com', role: 'Volunteer Coordinator', isOnline: false, lastActive: '10 minutes ago' },
  { id: '4', name: 'Michael Thompson', email: 'michael@org.com', role: 'Executive Director', isOnline: true },
  { id: '5', name: 'Amanda Foster', email: 'amanda@org.com', role: 'Communications Lead', isOnline: false, lastActive: '1 hour ago' },
  { id: '6', name: 'David Park', email: 'david@org.com', role: 'Finance Manager', isOnline: false, lastActive: '3 hours ago' },
];

const sampleActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'donation',
    actor: sampleTeamMembers[0],
    action: 'recorded a new donation',
    target: 'John Smith - $5,000',
    targetType: 'donation',
    targetId: 'd1',
    timestamp: '2 minutes ago',
    metadata: { amount: 5000, campaign: 'Annual Fund' }
  },
  {
    id: '2',
    type: 'mention',
    actor: sampleTeamMembers[1],
    action: 'mentioned you in a comment on',
    target: 'Q4 Fundraising Campaign',
    targetType: 'project',
    targetId: 'p1',
    content: '@Michael can you review the budget projections?',
    mentions: ['4'],
    timestamp: '15 minutes ago'
  },
  {
    id: '3',
    type: 'update',
    actor: sampleTeamMembers[2],
    action: 'updated the status of',
    target: 'Spring Volunteer Training',
    targetType: 'task',
    targetId: 't1',
    timestamp: '1 hour ago',
    metadata: { oldStatus: 'In Progress', newStatus: 'Completed' }
  },
  {
    id: '4',
    type: 'comment',
    actor: sampleTeamMembers[3],
    action: 'commented on',
    target: 'Board Meeting Notes',
    targetType: 'document',
    targetId: 'doc1',
    content: 'Great progress on all initiatives. Let\'s discuss the timeline at our next sync.',
    timestamp: '2 hours ago'
  },
  {
    id: '5',
    type: 'assign',
    actor: sampleTeamMembers[0],
    action: 'assigned',
    target: 'Follow up with major donors',
    targetType: 'task',
    targetId: 't2',
    timestamp: '3 hours ago',
    metadata: { assignee: 'James Chen' }
  },
  {
    id: '6',
    type: 'milestone',
    actor: sampleTeamMembers[4],
    action: 'marked milestone complete',
    target: 'Website Redesign Phase 1',
    targetType: 'project',
    targetId: 'p2',
    timestamp: '5 hours ago'
  },
  {
    id: '7',
    type: 'create',
    actor: sampleTeamMembers[5],
    action: 'created a new contact',
    target: 'ABC Foundation',
    targetType: 'contact',
    targetId: 'c1',
    timestamp: 'Yesterday'
  },
];

// ============================================
// ICONS
// ============================================

const activityIcons: Record<ActivityItem['type'], string> = {
  comment: '💬',
  mention: '@',
  update: '✏️',
  create: '➕',
  delete: '🗑️',
  assign: '👤',
  donation: '💰',
  milestone: '🎯'
};

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// ============================================
// PRESENCE INDICATOR COMPONENT
// ============================================

interface PresenceIndicatorProps {
  members: TeamMember[];
  maxVisible?: number;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  members,
  maxVisible = 5
}) => {
  const onlineMembers = members.filter(m => m.isOnline);
  const visibleMembers = onlineMembers.slice(0, maxVisible);
  const remainingCount = onlineMembers.length - maxVisible;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {visibleMembers.map(member => (
          <div
            key={member.id}
            className="relative"
            title={`${member.name} (Online)`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white dark:ring-slate-900">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400 ring-2 ring-white dark:ring-slate-900">
            +{remainingCount}
          </div>
        )}
      </div>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {onlineMembers.length} online
      </span>
    </div>
  );
};

// ============================================
// MENTION INPUT COMPONENT
// ============================================

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, mentions: string[]) => void;
  teamMembers: TeamMember[];
  placeholder?: string;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  teamMembers,
  placeholder = 'Write a comment... Use @ to mention'
}) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Filter team members based on search
  const filteredMembers = useMemo(() => {
    if (!mentionSearch) return teamMembers;
    const search = mentionSearch.toLowerCase();
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search)
    );
  }, [teamMembers, mentionSearch]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursor = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPosition(newCursor);

    // Check for @ mention trigger
    const textBeforeCursor = newValue.slice(0, newCursor);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      // Only show mentions if @ is at start or after space, and no space after @
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || charBeforeAt === '\n' || atIndex === 0) && !textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentions(false);
  }, [onChange]);

  // Handle keyboard navigation in mention list
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showMentions) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const mentions = extractMentions(value, teamMembers);
        onSubmit(value, mentions);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setMentionIndex(i => Math.min(i + 1, filteredMembers.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setMentionIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredMembers[mentionIndex]) {
          insertMention(filteredMembers[mentionIndex]);
        }
        break;
      case 'Escape':
        setShowMentions(false);
        break;
    }
  }, [showMentions, filteredMembers, mentionIndex, value, teamMembers, onSubmit]);

  // Insert mention at cursor position
  const insertMention = useCallback((member: TeamMember) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    const newValue =
      textBeforeCursor.slice(0, atIndex) +
      `@${member.name} ` +
      textAfterCursor;

    onChange(newValue);
    setShowMentions(false);

    // Focus and set cursor after mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = atIndex + member.name.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, cursorPosition, onChange]);

  // Extract mentioned user IDs from text
  const extractMentions = (text: string, members: TeamMember[]): string[] => {
    const mentions: string[] = [];
    members.forEach(member => {
      if (text.includes(`@${member.name}`)) {
        mentions.push(member.id);
      }
    });
    return mentions;
  };

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />

      {/* Mention Dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
          <div className="p-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            Team Members
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => insertMention(member)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === mentionIndex
                    ? 'bg-cyan-50 dark:bg-cyan-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {member.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-1 ring-white dark:ring-slate-800" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {member.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={() => {
          const mentions = extractMentions(value, teamMembers);
          onSubmit(value, mentions);
        }}
        disabled={!value.trim()}
        className="absolute bottom-3 right-3 p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SendIcon />
      </button>
    </div>
  );
};

// ============================================
// ACTIVITY FEED COMPONENT
// ============================================

interface ActivityFeedProps {
  activities?: ActivityItem[];
  onActivityClick?: (activity: ActivityItem) => void;
  maxItems?: number;
  showHeader?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = sampleActivities,
  onActivityClick,
  maxItems = 10,
  showHeader = true
}) => {
  const displayedActivities = activities.slice(0, maxItems);

  // Render content with highlighted mentions
  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+(?:\s+\w+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="text-cyan-600 dark:text-cyan-400 font-medium bg-cyan-50 dark:bg-cyan-900/20 px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {showHeader && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Activity Feed</h3>
          <button className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
            View all
          </button>
        </div>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {displayedActivities.map(activity => (
          <div
            key={activity.id}
            onClick={() => onActivityClick?.(activity)}
            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
          >
            <div className="flex gap-3">
              {/* Actor Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {activity.actor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xs shadow-sm border border-slate-200 dark:border-slate-600">
                  {activityIcons[activity.type]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {activity.actor.name}
                  </span>{' '}
                  {activity.action}{' '}
                  {activity.target && (
                    <span className="font-medium text-cyan-600 dark:text-cyan-400">
                      {activity.target}
                    </span>
                  )}
                  {activity.metadata?.assignee && (
                    <span className="text-slate-500 dark:text-slate-400">
                      {' '}to <span className="font-medium">{activity.metadata.assignee}</span>
                    </span>
                  )}
                </p>

                {activity.content && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {renderContent(activity.content)}
                  </p>
                )}

                {activity.metadata?.oldStatus && activity.metadata?.newStatus && (
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {activity.metadata.oldStatus}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      {activity.metadata.newStatus}
                    </span>
                  </div>
                )}

                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
          No recent activity
        </div>
      )}
    </div>
  );
};

// ============================================
// COMMENTS SECTION COMPONENT
// ============================================

interface CommentsSectionProps {
  comments?: Comment[];
  teamMembers?: TeamMember[];
  onAddComment?: (content: string, mentions: string[]) => void;
  onEditComment?: (commentId: string, content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments = [],
  teamMembers = sampleTeamMembers,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReaction
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = useCallback((content: string, mentions: string[]) => {
    if (content.trim()) {
      onAddComment?.(content, mentions);
      setNewComment('');
    }
  }, [onAddComment]);

  // Render comment content with highlighted mentions
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\w+(?:\s+\w+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="text-cyan-600 dark:text-cyan-400 font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {comment.author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900 dark:text-white text-sm">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {comment.timestamp}
                    {comment.isEdited && ' (edited)'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {renderCommentContent(comment.content)}
                </p>
              </div>

              {/* Reactions */}
              {comment.reactions && comment.reactions.length > 0 && (
                <div className="flex items-center gap-1 mt-1 ml-2">
                  {comment.reactions.map((reaction, index) => (
                    <button
                      key={index}
                      onClick={() => onReaction?.(comment.id, reaction.emoji)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-slate-600 dark:text-slate-400">{reaction.users.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <MentionInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmit}
        teamMembers={teamMembers}
        placeholder="Add a comment... Use @ to mention team members"
      />
    </div>
  );
};

// ============================================
// TEAM PRESENCE BAR COMPONENT
// ============================================

interface TeamPresenceBarProps {
  teamMembers?: TeamMember[];
}

export const TeamPresenceBar: React.FC<TeamPresenceBarProps> = ({
  teamMembers = sampleTeamMembers
}) => {
  const onlineMembers = teamMembers.filter(m => m.isOnline);
  const offlineMembers = teamMembers.filter(m => !m.isOnline);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Team</h3>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {onlineMembers.length}/{teamMembers.length} online
        </span>
      </div>

      {/* Online Members */}
      {onlineMembers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-2 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Online now
          </p>
          <div className="space-y-2">
            {onlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Members */}
      {offlineMembers.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-2">
            Offline
          </p>
          <div className="space-y-2">
            {offlineMembers.map(member => (
              <div key={member.id} className="flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                    {member.lastActive || 'Offline'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// EXPORT ALL COMPONENTS
// ============================================

export {
  sampleTeamMembers,
  sampleActivities
};
