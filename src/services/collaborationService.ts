/**
 * Collaboration Service
 * =====================
 * Unified service for team collaboration features including:
 * - Comments (unified for tasks, projects, cases, etc.)
 * - @Mentions
 * - Notifications
 * - Activity logging
 * - Entity watching/following
 */

import { supabase } from './supabaseClient';
import { realtimeService } from './realtimeService';
import { 
  parseMentions, 
  extractMentionedUserIds, 
  renderMentionsAsHtml,
  getMentionContext 
} from '../utils/mentionUtils';
import type {
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
  TeamMember,
} from '../types';

// ============================================
// COMMENTS SERVICE
// ============================================

/**
 * Get comments for an entity
 */
export async function getComments(
  entityType: CollaborationEntityType,
  entityId: string,
  options?: {
    includeReplies?: boolean;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<Comment[]> {
  const { includeReplies = true, includeDeleted = false, limit = 50, offset = 0 } = options || {};

  let query = supabase
    .from('comments')
    .select(`
      *,
      author:team_members!author_id(id, name, email, role)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeReplies) {
    query = query.is('parent_id', null);
  }

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  // Transform snake_case to camelCase
  return (data || []).map(transformComment);
}

/**
 * Get threaded comments (with nested replies)
 */
export async function getThreadedComments(
  entityType: CollaborationEntityType,
  entityId: string
): Promise<Comment[]> {
  const allComments = await getComments(entityType, entityId, { includeReplies: true });
  
  // Build comment tree
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  allComments.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });

  allComments.forEach(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  // Sort replies by created_at ascending
  rootComments.forEach(comment => {
    if (comment.replies) {
      comment.replies.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  });

  return rootComments;
}

/**
 * Create a new comment
 */
export async function createComment(
  input: CommentInput,
  author: TeamMember,
  teamMembers?: TeamMember[]
): Promise<Comment> {
  // Render HTML with mentions
  const contentHtml = teamMembers 
    ? renderMentionsAsHtml(input.content, teamMembers)
    : input.content;

  const { data, error } = await supabase
    .from('comments')
    .insert({
      entity_type: input.entityType,
      entity_id: input.entityId,
      content: input.content,
      content_html: contentHtml,
      author_id: author.id,
      author_name: author.name,
      parent_id: input.parentId || null,
      thread_depth: input.parentId ? 1 : 0, // Simplified: 1 level of nesting
      is_internal: input.isInternal || false,
    })
    .select(`
      *,
      author:team_members!author_id(id, name, email, role)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  const comment = transformComment(data);

  // Create mentions and notifications
  if (teamMembers) {
    await processMentions(comment, author, teamMembers);
  }

  // Log activity
  await logActivity({
    entityType: input.entityType,
    entityId: input.entityId,
    action: 'commented',
    actor: author,
    description: `${author.name} added a comment`,
    commentId: comment.id,
  });

  // Notify watchers
  await notifyWatchers(input.entityType, input.entityId, {
    type: 'comment',
    actor: author,
    title: `New comment on ${input.entityType}`,
    message: input.content.substring(0, 100) + (input.content.length > 100 ? '...' : ''),
    excludeUserId: author.id,
  });

  return comment;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  content: string,
  author: TeamMember,
  teamMembers?: TeamMember[]
): Promise<Comment> {
  const contentHtml = teamMembers 
    ? renderMentionsAsHtml(content, teamMembers)
    : content;

  const { data, error } = await supabase
    .from('comments')
    .update({
      content,
      content_html: contentHtml,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('author_id', author.id) // Only author can edit
    .select(`
      *,
      author:team_members!author_id(id, name, email, role)
    `)
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  return transformComment(data);
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(
  commentId: string,
  authorId: string
): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('author_id', authorId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Pin/unpin a comment
 */
export async function toggleCommentPin(
  commentId: string,
  isPinned: boolean
): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .update({ is_pinned: isPinned })
    .eq('id', commentId);

  if (error) {
    console.error('Error toggling pin:', error);
    throw error;
  }
}

// ============================================
// MENTIONS SERVICE
// ============================================

/**
 * Process and create mentions from a comment
 */
async function processMentions(
  comment: Comment,
  author: TeamMember,
  teamMembers: TeamMember[]
): Promise<Mention[]> {
  const mentionedUserIds = extractMentionedUserIds(comment.content, teamMembers);
  
  if (mentionedUserIds.length === 0) return [];

  const mentions: Mention[] = [];

  for (const userId of mentionedUserIds) {
    // Don't create mention for self
    if (userId === author.id) continue;

    const { data, error } = await supabase
      .from('mentions')
      .insert({
        comment_id: comment.id,
        entity_type: comment.entityType,
        entity_id: comment.entityId,
        mentioned_user_id: userId,
        mentioned_by_id: author.id,
        mention_context: getMentionContext(comment.content, 0),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mention:', error);
      continue;
    }

    mentions.push(transformMention(data));

    // Create notification for mention
    await createNotification({
      userId,
      type: 'mention',
      entityType: comment.entityType,
      entityId: comment.entityId,
      commentId: comment.id,
      mentionId: data.id,
      actorId: author.id,
      actorName: author.name,
      title: `${author.name} mentioned you`,
      message: comment.content.substring(0, 100),
      priority: 'high',
    });
  }

  return mentions;
}

/**
 * Get mentions for a user
 */
export async function getMentionsForUser(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<Mention[]> {
  const { unreadOnly = false, limit = 20, offset = 0 } = options || {};

  let query = supabase
    .from('mentions')
    .select(`
      *,
      mentioned_user:team_members!mentioned_user_id(id, name, email, role),
      mentioned_by:team_members!mentioned_by_id(id, name, email, role)
    `)
    .eq('mentioned_user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching mentions:', error);
    throw error;
  }

  return (data || []).map(transformMention);
}

/**
 * Mark mention as read
 */
export async function markMentionRead(mentionId: string): Promise<void> {
  const { error } = await supabase
    .from('mentions')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', mentionId);

  if (error) {
    console.error('Error marking mention read:', error);
    throw error;
  }
}

/**
 * Mark all mentions as read for a user
 */
export async function markAllMentionsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('mentions')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('mentioned_user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all mentions read:', error);
    throw error;
  }
}

// ============================================
// NOTIFICATIONS SERVICE
// ============================================

/**
 * Create a notification
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  entityType?: CollaborationEntityType | string;
  entityId?: string;
  commentId?: string;
  mentionId?: string;
  actorId?: string;
  actorName?: string;
  title: string;
  message?: string;
  actionUrl?: string;
  priority?: NotificationPriority;
}): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type: params.type,
      entity_type: params.entityType,
      entity_id: params.entityId,
      comment_id: params.commentId,
      mention_id: params.mentionId,
      actor_id: params.actorId,
      actor_name: params.actorName,
      title: params.title,
      message: params.message,
      action_url: params.actionUrl || buildActionUrl(params.entityType, params.entityId),
      priority: params.priority || 'normal',
      is_read: false,
      is_archived: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return transformNotification(data);
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    types?: NotificationType[];
    limit?: number;
    offset?: number;
  }
): Promise<Notification[]> {
  const { unreadOnly = false, types, limit = 20, offset = 0 } = options || {};

  let query = supabase
    .from('notifications')
    .select(`
      *,
      actor:team_members!actor_id(id, name, email, role)
    `)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  if (types && types.length > 0) {
    query = query.in('type', types);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return (data || []).map(transformNotification);
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .eq('is_archived', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('mark_all_notifications_read', { p_user_id: userId });

  if (error) {
    console.error('Error marking all notifications read:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Archive a notification
 */
export async function archiveNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_archived: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error archiving notification:', error);
    throw error;
  }
}

// ============================================
// ACTIVITY LOG SERVICE
// ============================================

/**
 * Log an activity
 */
export async function logActivity(params: {
  entityType: CollaborationEntityType | string;
  entityId: string;
  action: ActivityAction;
  actor?: TeamMember;
  description?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  commentId?: string;
  isInternal?: boolean;
}): Promise<ActivityLogEntry> {
  const { data, error } = await supabase
    .from('activity_log')
    .insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      actor_id: params.actor?.id,
      actor_name: params.actor?.name,
      description: params.description,
      changes: params.changes,
      metadata: params.metadata,
      comment_id: params.commentId,
      is_internal: params.isInternal || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error logging activity:', error);
    throw error;
  }

  return transformActivityLog(data);
}

/**
 * Get activity log for an entity
 */
export async function getActivityLog(
  entityType: CollaborationEntityType | string,
  entityId: string,
  options?: {
    limit?: number;
    offset?: number;
    includeInternal?: boolean;
  }
): Promise<ActivityLogEntry[]> {
  const { limit = 50, offset = 0, includeInternal = true } = options || {};

  let query = supabase
    .from('activity_log')
    .select(`
      *,
      actor:team_members!actor_id(id, name, email, role)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeInternal) {
    query = query.eq('is_internal', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching activity log:', error);
    throw error;
  }

  return (data || []).map(transformActivityLog);
}

// ============================================
// ENTITY WATCHERS SERVICE
// ============================================

/**
 * Watch/follow an entity
 */
export async function watchEntity(
  entityType: CollaborationEntityType,
  entityId: string,
  userId: string,
  watchLevel: WatchLevel = 'all'
): Promise<EntityWatcher> {
  const { data, error } = await supabase
    .from('entity_watchers')
    .upsert({
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      watch_level: watchLevel,
    }, {
      onConflict: 'entity_type,entity_id,user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error watching entity:', error);
    throw error;
  }

  return transformEntityWatcher(data);
}

/**
 * Unwatch/unfollow an entity
 */
export async function unwatchEntity(
  entityType: CollaborationEntityType,
  entityId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('entity_watchers')
    .delete()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error unwatching entity:', error);
    throw error;
  }
}

/**
 * Get watchers for an entity
 */
export async function getEntityWatchers(
  entityType: CollaborationEntityType,
  entityId: string
): Promise<EntityWatcher[]> {
  const { data, error } = await supabase
    .from('entity_watchers')
    .select(`
      *,
      user:team_members!user_id(id, name, email, role)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) {
    console.error('Error fetching watchers:', error);
    throw error;
  }

  return (data || []).map(transformEntityWatcher);
}

/**
 * Check if user is watching an entity
 */
export async function isUserWatching(
  entityType: CollaborationEntityType,
  entityId: string,
  userId: string
): Promise<EntityWatcher | null> {
  const { data, error } = await supabase
    .from('entity_watchers')
    .select()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Not found is ok
    console.error('Error checking watch status:', error);
  }

  return data ? transformEntityWatcher(data) : null;
}

/**
 * Notify all watchers of an entity
 */
async function notifyWatchers(
  entityType: CollaborationEntityType,
  entityId: string,
  notification: {
    type: NotificationType;
    actor?: TeamMember;
    title: string;
    message?: string;
    excludeUserId?: string;
  }
): Promise<void> {
  const watchers = await getEntityWatchers(entityType, entityId);

  for (const watcher of watchers) {
    // Skip excluded user (usually the actor)
    if (notification.excludeUserId === watcher.userId) continue;

    // Skip if watch level is 'none' or if watch level is 'mentions' and this isn't a mention
    if (watcher.watchLevel === 'none') continue;
    if (watcher.watchLevel === 'mentions' && notification.type !== 'mention') continue;
    if (watcher.watchLevel === 'status_only' && notification.type !== 'status_change') continue;

    await createNotification({
      userId: watcher.userId,
      type: notification.type,
      entityType,
      entityId,
      actorId: notification.actor?.id,
      actorName: notification.actor?.name,
      title: notification.title,
      message: notification.message,
    });
  }
}

// ============================================
// COLLABORATION CONTEXT
// ============================================

/**
 * Get full collaboration context for an entity
 */
export async function getCollaborationContext(
  entityType: CollaborationEntityType,
  entityId: string,
  currentUserId?: string
): Promise<CollaborationContext> {
  const [comments, watchers, activity] = await Promise.all([
    getThreadedComments(entityType, entityId),
    getEntityWatchers(entityType, entityId),
    getActivityLog(entityType, entityId, { limit: 10 }),
  ]);

  let currentUserWatching: EntityWatcher | null = null;
  if (currentUserId) {
    currentUserWatching = watchers.find(w => w.userId === currentUserId) || null;
  }

  return {
    entityType,
    entityId,
    comments,
    commentCount: comments.length,
    watchers,
    watcherCount: watchers.length,
    recentActivity: activity,
    currentUserWatching,
  };
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select()
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching preferences:', error);
  }

  return data ? transformNotificationPreferences(data) : null;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...transformPreferencesToSnakeCase(preferences),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }

  return transformNotificationPreferences(data);
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to comments for an entity
 */
export function subscribeToComments(
  entityType: CollaborationEntityType,
  entityId: string,
  callback: (comment: Comment) => void
): () => void {
  return realtimeService.subscribeToInserts(
    'comments',
    (payload) => {
      if (payload.entity_type === entityType && payload.entity_id === entityId) {
        callback(transformComment(payload));
      }
    },
    { column: 'entity_type', value: entityType }
  );
}

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
): () => void {
  return realtimeService.subscribeToInserts(
    'notifications',
    (payload) => {
      if (payload.user_id === userId) {
        callback(transformNotification(payload));
      }
    },
    { column: 'user_id', value: userId }
  );
}

/**
 * Subscribe to mentions for a user
 */
export function subscribeToMentions(
  userId: string,
  callback: (mention: Mention) => void
): () => void {
  return realtimeService.subscribeToInserts(
    'mentions',
    (payload) => {
      if (payload.mentioned_user_id === userId) {
        callback(transformMention(payload));
      }
    },
    { column: 'mentioned_user_id', value: userId }
  );
}

// ============================================
// TRANSFORM HELPERS
// ============================================

function transformComment(data: any): Comment {
  return {
    id: data.id,
    entityType: data.entity_type,
    entityId: data.entity_id,
    content: data.content,
    contentHtml: data.content_html,
    authorId: data.author_id,
    authorName: data.author_name,
    author: data.author,
    parentId: data.parent_id,
    threadDepth: data.thread_depth,
    isInternal: data.is_internal,
    isEdited: data.is_edited,
    isPinned: data.is_pinned,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    deletedAt: data.deleted_at,
    replies: [],
  };
}

function transformMention(data: any): Mention {
  return {
    id: data.id,
    commentId: data.comment_id,
    entityType: data.entity_type,
    entityId: data.entity_id,
    mentionedUserId: data.mentioned_user_id,
    mentionedUser: data.mentioned_user,
    mentionedById: data.mentioned_by_id,
    mentionedBy: data.mentioned_by,
    mentionContext: data.mention_context,
    mentionPosition: data.mention_position,
    isRead: data.is_read,
    readAt: data.read_at,
    createdAt: data.created_at,
  };
}

function transformNotification(data: any): Notification {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    entityType: data.entity_type,
    entityId: data.entity_id,
    commentId: data.comment_id,
    mentionId: data.mention_id,
    actorId: data.actor_id,
    actorName: data.actor_name,
    actor: data.actor,
    title: data.title,
    message: data.message,
    actionUrl: data.action_url,
    isRead: data.is_read,
    readAt: data.read_at,
    isArchived: data.is_archived,
    priority: data.priority,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
  };
}

function transformActivityLog(data: any): ActivityLogEntry {
  return {
    id: data.id,
    entityType: data.entity_type,
    entityId: data.entity_id,
    action: data.action,
    actorId: data.actor_id,
    actorName: data.actor_name,
    actor: data.actor,
    description: data.description,
    changes: data.changes,
    metadata: data.metadata,
    commentId: data.comment_id,
    isInternal: data.is_internal,
    createdAt: data.created_at,
  };
}

function transformEntityWatcher(data: any): EntityWatcher {
  return {
    id: data.id,
    entityType: data.entity_type,
    entityId: data.entity_id,
    userId: data.user_id,
    user: data.user,
    watchLevel: data.watch_level,
    createdAt: data.created_at,
  };
}

function transformNotificationPreferences(data: any): NotificationPreferences {
  return {
    id: data.id,
    userId: data.user_id,
    emailMentions: data.email_mentions,
    emailComments: data.email_comments,
    emailAssignments: data.email_assignments,
    emailStatusChanges: data.email_status_changes,
    emailDueDates: data.email_due_dates,
    emailDigest: data.email_digest,
    emailDigestTime: data.email_digest_time,
    appMentions: data.app_mentions,
    appComments: data.app_comments,
    appAssignments: data.app_assignments,
    appStatusChanges: data.app_status_changes,
    appDueDates: data.app_due_dates,
    pushEnabled: data.push_enabled,
    pushMentions: data.push_mentions,
    pushAssignments: data.push_assignments,
    pushUrgentOnly: data.push_urgent_only,
    dndEnabled: data.dnd_enabled,
    dndStart: data.dnd_start,
    dndEnd: data.dnd_end,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformPreferencesToSnakeCase(prefs: Partial<NotificationPreferences>): Record<string, any> {
  const map: Record<string, string> = {
    emailMentions: 'email_mentions',
    emailComments: 'email_comments',
    emailAssignments: 'email_assignments',
    emailStatusChanges: 'email_status_changes',
    emailDueDates: 'email_due_dates',
    emailDigest: 'email_digest',
    emailDigestTime: 'email_digest_time',
    appMentions: 'app_mentions',
    appComments: 'app_comments',
    appAssignments: 'app_assignments',
    appStatusChanges: 'app_status_changes',
    appDueDates: 'app_due_dates',
    pushEnabled: 'push_enabled',
    pushMentions: 'push_mentions',
    pushAssignments: 'push_assignments',
    pushUrgentOnly: 'push_urgent_only',
    dndEnabled: 'dnd_enabled',
    dndStart: 'dnd_start',
    dndEnd: 'dnd_end',
  };

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(prefs)) {
    const snakeKey = map[key] || key;
    result[snakeKey] = value;
  }
  return result;
}

function buildActionUrl(entityType?: string, entityId?: string): string {
  if (!entityType || !entityId) return '/';
  
  const urlMap: Record<string, string> = {
    task: `/tasks?id=${entityId}`,
    project: `/projects?id=${entityId}`,
    case: `/case?id=${entityId}`,
    client: `/contacts?id=${entityId}`,
    activity: `/activities?id=${entityId}`,
  };
  
  return urlMap[entityType] || '/';
}

// Export all functions
export default {
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
};
