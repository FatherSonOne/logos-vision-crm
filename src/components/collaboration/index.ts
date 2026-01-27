/**
 * Collaboration Components - Barrel Export
 * =========================================
 * Team collaboration features including comments, mentions,
 * notifications, and activity feeds.
 */

// Main Components
export { CommentThread } from './CommentThread';
export { NotificationCenter, NotificationBell } from './NotificationCenter';
export { ActivityFeed } from './ActivityFeed';
export { WatchEntityButton } from './WatchEntityButton';
export { CollaborationErrorBoundary } from './CollaborationErrorBoundary';

// Re-export collaboration service functions for convenience
export {
  // Comments
  getComments,
  getThreadedComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentPin,
  // Mentions
  getMentionsForUser,
  markMentionRead,
  markAllMentionsRead,
  // Notifications
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  // Activity
  logActivity,
  getActivityLog,
  // Watchers
  watchEntity,
  unwatchEntity,
  getEntityWatchers,
  isUserWatching,
  // Context
  getCollaborationContext,
  // Preferences
  getNotificationPreferences,
  updateNotificationPreferences,
  // Real-time
  subscribeToComments,
  subscribeToNotifications,
  subscribeToMentions,
} from '../../services/collaborationService';

// Re-export mention utilities
export {
  parseMentions,
  findTeamMemberByMention,
  renderMentionsAsHtml,
  extractMentionedUserIds,
  getMentionSuggestions,
  insertMention,
  findMentionTriggerPosition,
  stripMentions,
  countMentions,
  getMentionContext,
  formatMentionDisplay,
  MENTION_REGEX,
  MENTION_STYLES,
} from '../../utils/mentionUtils';

// Re-export types
export type {
  Comment,
  CommentInput,
  Mention,
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
  ActivityLogEntry,
  ActivityAction,
  EntityWatcher,
  WatchLevel,
  CollaborationEntityType,
  CollaborationContext,
  ParsedMention,
} from '../../types';
