// ProjectCollaboration.tsx - Project Notes, Activity & Team Collaboration
import React, { useState } from 'react';
import type { TeamMember } from '../../types';
import { CollaborateIcon, SendIcon, TrashIcon, PencilIcon, CloseIcon, UsersIcon, ClockIcon } from '../icons';

export interface ProjectNote {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt?: string;
  isPinned?: boolean;
}

export interface ProjectActivityItem {
  id: string;
  type: 'note_added' | 'status_changed' | 'task_completed' | 'member_added' | 'member_removed';
  description: string;
  userId: string;
  timestamp: string;
}

interface ProjectCollaborationProps {
  projectId: string;
  projectName: string;
  notes: ProjectNote[];
  activityLog: ProjectActivityItem[];
  teamMembers: TeamMember[];
  assignedMemberIds: string[];
  currentUserId: string;
  onAddNote: (content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onEditNote: (noteId: string, content: string) => void;
  onPinNote: (noteId: string) => void;
  onAssignMember: (memberId: string) => void;
  onRemoveMember: (memberId: string) => void;
  onClose?: () => void;
}

const NoteItem: React.FC<{
  note: ProjectNote;
  author: TeamMember | undefined;
  currentUserId: string;
  onDelete: () => void;
  onEdit: (content: string) => void;
  onPin: () => void;
}> = ({ note, author, currentUserId, onDelete, onEdit, onPin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`p-3 rounded-lg border ${note.isPinned 
      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50' 
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
            {author?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {author?.name || 'Unknown'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {timeAgo(note.createdAt)}
              {note.updatedAt && ' (edited)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPin}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned 
                ? 'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            📌
          </button>
          {note.authorId === currentUserId && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600"
                title="Edit note"
              >
                <PencilIcon />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500"
                title="Delete note"
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsEditing(false); setEditContent(note.content); }}
              className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {note.content}
        </p>
      )}
    </div>
  );
};


const ActivityLog: React.FC<{
  activities: ProjectActivityItem[];
  teamMembers: TeamMember[];
}> = ({ activities, teamMembers }) => {
  const getUser = (id: string) => teamMembers.find(m => m.id === id);

  const getActivityIcon = (type: ProjectActivityItem['type']) => {
    switch (type) {
      case 'note_added': return '📝';
      case 'status_changed': return '🔄';
      case 'task_completed': return '✅';
      case 'member_added': return '👤';
      case 'member_removed': return '👋';
      default: return '📌';
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <ClockIcon />
        <p className="mt-2 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 10).map(activity => {
        const user = getUser(activity.userId);
        return (
          <div key={activity.id} className="flex items-start gap-3">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="font-semibold">{user?.name || 'Someone'}</span>{' '}
                {activity.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {timeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TeamPanel: React.FC<{
  teamMembers: TeamMember[];
  assignedMemberIds: string[];
  onAssign: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ teamMembers, assignedMemberIds, onAssign, onRemove }) => {
  const assignedMembers = teamMembers.filter(m => assignedMemberIds.includes(m.id));
  const availableMembers = teamMembers.filter(m => !assignedMemberIds.includes(m.id));

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        Assigned Team ({assignedMembers.length})
      </h4>
      
      <div className="space-y-2 mb-4">
        {assignedMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
              </div>
            </div>
            <button
              onClick={() => onRemove(member.id)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500"
              title="Remove from project"
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>

      {availableMembers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Add Team Member
          </h4>
          <select
            onChange={(e) => { if (e.target.value) { onAssign(e.target.value); e.target.value = ''; } }}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
            defaultValue=""
          >
            <option value="" disabled>Select a team member...</option>
            {availableMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} - {member.role}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export const ProjectCollaboration: React.FC<ProjectCollaborationProps> = ({
  projectId,
  projectName,
  notes,
  activityLog,
  teamMembers,
  assignedMemberIds,
  currentUserId,
  onAddNote,
  onDeleteNote,
  onEditNote,
  onPinNote,
  onAssignMember,
  onRemoveMember,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(true); // Start open when component is mounted
  const [activeTab, setActiveTab] = useState<'notes' | 'activity' | 'team'>('notes');
  const [newNote, setNewNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);
  const sortedNotes = [...pinnedNotes, ...unpinnedNotes];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all relative"
      >
        <CollaborateIcon />
        Collaborate
        {notes.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
                <CollaborateIcon />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Collaboration</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">{projectName}</p>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); onClose?.(); }}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            {(['notes', 'activity', 'team'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'notes' && `Notes (${notes.length})`}
                {tab === 'activity' && 'Activity'}
                {tab === 'team' && `Team (${assignedMemberIds.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'notes' && (
            <div className="space-y-3">
              {sortedNotes.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  author={teamMembers.find(m => m.id === note.authorId)}
                  currentUserId={currentUserId}
                  onDelete={() => onDeleteNote(note.id)}
                  onEdit={(content) => onEditNote(note.id, content)}
                  onPin={() => onPinNote(note.id)}
                />
              ))}
              {notes.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No notes yet. Add one below!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <ActivityLog activities={activityLog} teamMembers={teamMembers} />
          )}

          {activeTab === 'team' && (
            <TeamPanel
              teamMembers={teamMembers}
              assignedMemberIds={assignedMemberIds}
              onAssign={onAssignMember}
              onRemove={onRemoveMember}
            />
          )}
        </div>

        {/* Footer - Note Input */}
        {activeTab === 'notes' && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAddNote();
                  }
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all self-end"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Press Ctrl+Enter to send
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCollaboration;
