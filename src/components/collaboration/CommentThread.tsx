/**
 * CommentThread Component
 * =======================
 * A comprehensive comment thread component with @mention support,
 * threaded replies, and real-time updates.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { 
  MessageSquare, 
  Send, 
  Reply, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Pin, 
  PinOff,
  AtSign,
  X,
  Clock,
  Check
} from 'lucide-react';
import {
  getThreadedComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentPin,
  subscribeToComments,
} from '../../services/collaborationService';
import {
  getMentionSuggestions,
  findMentionTriggerPosition,
  insertMention,
  renderMentionsAsHtml,
} from '../../utils/mentionUtils';
import type { Comment, CommentInput, CollaborationEntityType, TeamMember } from '../../types';

interface CommentThreadProps {
  entityType: CollaborationEntityType;
  entityId: string;
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  title?: string;
  placeholder?: string;
  maxDepth?: number;
  className?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  entityType,
  entityId,
  currentUser,
  teamMembers,
  title = 'Comments',
  placeholder = 'Write a comment... Use @ to mention someone',
  maxDepth = 2,
  className = '',
}) => {
  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<TeamMember[]>([]);
  const [mentionTrigger, setMentionTrigger] = useState<{ start: number; query: string } | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const data = await getThreadedComments(entityType, entityId);
        setComments(data);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToComments(entityType, entityId, (newComment) => {
      setComments(prev => {
        // Check if comment already exists
        if (prev.some(c => c.id === newComment.id)) return prev;
        
        if (newComment.parentId) {
          // Add as reply
          return prev.map(c => {
            if (c.id === newComment.parentId) {
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            return c;
          });
        } else {
          // Add as new top-level comment
          return [newComment, ...prev];
        }
      });
    });

    return () => unsubscribe();
  }, [entityType, entityId]);

  // Handle mention suggestions
  const handleTextChange = useCallback((text: string, cursorPosition: number) => {
    setNewComment(text);

    const trigger = findMentionTriggerPosition(text, cursorPosition);
    setMentionTrigger(trigger);

    if (trigger && trigger.query.length > 0) {
      const suggestions = getMentionSuggestions(trigger.query, teamMembers, 5, [currentUser.id]);
      setMentionSuggestions(suggestions);
      setSelectedSuggestionIndex(0);
    } else {
      setMentionSuggestions([]);
    }
  }, [teamMembers, currentUser.id]);

  // Insert mention
  const insertMentionAtCursor = useCallback((member: TeamMember) => {
    if (!mentionTrigger || !textareaRef.current) return;

    const { newText, newCursorPosition } = insertMention(
      newComment,
      textareaRef.current.selectionStart,
      member,
      mentionTrigger.start
    );

    setNewComment(newText);
    setMentionSuggestions([]);
    setMentionTrigger(null);

    // Set cursor position after insert
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [mentionTrigger, newComment]);

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (mentionSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        if (mentionSuggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          insertMentionAtCursor(mentionSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setMentionSuggestions([]);
        setMentionTrigger(null);
        break;
    }
  }, [mentionSuggestions, selectedSuggestionIndex, insertMentionAtCursor]);

  // Submit comment
  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const input: CommentInput = {
        entityType,
        entityId,
        content: newComment.trim(),
        parentId: replyTo?.id,
      };

      const created = await createComment(input, currentUser, teamMembers);

      // Add to state (optimistic, will also come via subscription)
      if (replyTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyTo.id) {
            return { ...c, replies: [...(c.replies || []), created] };
          }
          return c;
        }));
      } else {
        setComments(prev => [created, ...prev]);
      }

      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update comment
  const handleUpdate = async () => {
    if (!editingComment || !editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await updateComment(
        editingComment.id,
        editContent.trim(),
        currentUser,
        teamMembers
      );

      setComments(prev => updateCommentInTree(prev, updated));
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (comment: Comment) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(comment.id, currentUser.id);
      setComments(prev => removeCommentFromTree(prev, comment.id));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Toggle pin
  const handleTogglePin = async (comment: Comment) => {
    try {
      await toggleCommentPin(comment.id, !comment.isPinned);
      setComments(prev => updateCommentInTree(prev, { ...comment, isPinned: !comment.isPinned }));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  // Start editing
  const startEditing = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  return (
    <Card variant="elevated" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {title}
            {comments.length > 0 && (
              <span 
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ backgroundColor: 'var(--cmf-surface-2)', color: 'var(--cmf-text-muted)' }}
              >
                {comments.length}
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Comment Input */}
        <div className="relative">
          {replyTo && (
            <div 
              className="flex items-center gap-2 mb-2 p-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--cmf-surface-2)' }}
            >
              <Reply className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
              <span style={{ color: 'var(--cmf-text-muted)' }}>Replying to</span>
              <span style={{ color: 'var(--aurora-teal)' }}>{replyTo.authorName || 'Unknown'}</span>
              <button
                onClick={() => setReplyTo(null)}
                className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => handleTextChange(e.target.value, e.target.selectionStart || 0)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={3}
              fullWidth
              className="pr-12"
            />
            
            <Button
              variant="aurora"
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              isLoading={isSubmitting}
              className="absolute bottom-2 right-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Mention Suggestions */}
          {mentionSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-1 w-64 py-1 rounded-lg shadow-lg"
              style={{ 
                backgroundColor: 'var(--cmf-surface)',
                border: '1px solid var(--cmf-border)'
              }}
            >
              {mentionSuggestions.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => insertMentionAtCursor(member)}
                  className={`
                    w-full px-3 py-2 flex items-center gap-3 text-left transition-colors
                    ${index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  `}
                  style={{ color: 'var(--cmf-text)' }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: 'var(--aurora-teal)', color: '#0f172a' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--cmf-text-muted)' }}>
                      {member.role || member.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full" 
                   style={{ color: 'var(--aurora-teal)' }} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--cmf-text-muted)' }}>
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                teamMembers={teamMembers}
                depth={0}
                maxDepth={maxDepth}
                editingComment={editingComment}
                editContent={editContent}
                onReply={setReplyTo}
                onEdit={startEditing}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onEditContentChange={setEditContent}
                onUpdateSubmit={handleUpdate}
                onCancelEdit={cancelEditing}
                isSubmitting={isSubmitting}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Comment Item Component
interface CommentItemProps {
  comment: Comment;
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  depth: number;
  maxDepth: number;
  editingComment: Comment | null;
  editContent: string;
  onReply: (comment: Comment) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
  onTogglePin: (comment: Comment) => void;
  onEditContentChange: (content: string) => void;
  onUpdateSubmit: () => void;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  teamMembers,
  depth,
  maxDepth,
  editingComment,
  editContent,
  onReply,
  onEdit,
  onDelete,
  onTogglePin,
  onEditContentChange,
  onUpdateSubmit,
  onCancelEdit,
  isSubmitting,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = comment.authorId === currentUser.id;
  const isEditing = editingComment?.id === comment.id;

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className={`${depth > 0 ? 'ml-8 pl-4' : ''}`}
      style={{ borderLeft: depth > 0 ? '2px solid var(--cmf-border)' : 'none' }}
    >
      <div 
        className={`p-4 rounded-lg ${comment.isPinned ? 'ring-2 ring-amber-400' : ''}`}
        style={{ backgroundColor: 'var(--cmf-surface-2)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ 
                backgroundColor: isAuthor ? 'var(--aurora-pink)' : 'var(--aurora-teal)', 
                color: '#0f172a' 
              }}
            >
              {(comment.authorName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                  {comment.authorName || 'Unknown'}
                </span>
                {comment.isPinned && (
                  <Pin className="w-3 h-3" style={{ color: 'var(--aurora-amber)' }} />
                )}
                {comment.isEdited && (
                  <span className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>(edited)</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                <Clock className="w-3 h-3" />
                {formatDate(comment.createdAt)}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="w-4 h-4" style={{ color: 'var(--cmf-text-muted)' }} />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 mt-1 py-1 rounded-lg shadow-lg min-w-[150px] z-10"
                style={{ backgroundColor: 'var(--cmf-surface)', border: '1px solid var(--cmf-border)' }}
              >
                {depth < maxDepth && (
                  <button
                    onClick={() => { onReply(comment); setShowMenu(false); }}
                    className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{ color: 'var(--cmf-text)' }}
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </button>
                )}
                {isAuthor && (
                  <>
                    <button
                      onClick={() => { onEdit(comment); setShowMenu(false); }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{ color: 'var(--cmf-text)' }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => { onDelete(comment); setShowMenu(false); }}
                      className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => { onTogglePin(comment); setShowMenu(false); }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ color: 'var(--cmf-text)' }}
                >
                  {comment.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              rows={3}
              fullWidth
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={onUpdateSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            style={{ color: 'var(--cmf-text)' }}
            dangerouslySetInnerHTML={{ 
              __html: comment.contentHtml || renderMentionsAsHtml(comment.content, teamMembers) 
            }}
          />
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              teamMembers={teamMembers}
              depth={depth + 1}
              maxDepth={maxDepth}
              editingComment={editingComment}
              editContent={editContent}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onEditContentChange={onEditContentChange}
              onUpdateSubmit={onUpdateSubmit}
              onCancelEdit={onCancelEdit}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
function updateCommentInTree(comments: Comment[], updated: Comment): Comment[] {
  return comments.map(c => {
    if (c.id === updated.id) {
      return { ...c, ...updated };
    }
    if (c.replies) {
      return { ...c, replies: updateCommentInTree(c.replies, updated) };
    }
    return c;
  });
}

function removeCommentFromTree(comments: Comment[], id: string): Comment[] {
  return comments
    .filter(c => c.id !== id)
    .map(c => {
      if (c.replies) {
        return { ...c, replies: removeCommentFromTree(c.replies, id) };
      }
      return c;
    });
}

export default CommentThread;
