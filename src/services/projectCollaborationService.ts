/**
 * Project Collaboration Service
 * ==============================
 * Handles real-time collaboration features for project planning:
 * - Real-time plan editing with team members
 * - Comments/notes on individual tasks
 * - Approval workflows for phase completion
 * - Version history of plan changes
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CollaborationSession {
  id: string;
  projectId: string;
  projectName: string;
  participants: SessionParticipant[];
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'idle' | 'closed';
}

export interface SessionParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  lastActiveAt: Date;
  isOnline: boolean;
  currentlyEditing?: string; // task/phase ID they're editing
  cursorPosition?: { x: number; y: number };
}

export interface TaskComment {
  id: string;
  taskId: string;
  phaseId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isResolved: boolean;
  replies: TaskCommentReply[];
  mentions: string[]; // User IDs
}

export interface TaskCommentReply {
  id: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface ApprovalWorkflow {
  id: string;
  projectId: string;
  phaseId: string;
  phaseName: string;
  type: 'phase_completion' | 'budget_approval' | 'resource_allocation' | 'scope_change';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedBy: {
    id: string;
    name: string;
  };
  requestedAt: Date;
  approvers: ApprovalStep[];
  comments: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalStep {
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt?: Date;
  comments?: string;
  required: boolean;
}

export interface PlanVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
  };
  changeDescription: string;
  changes: PlanChange[];
  snapshot: unknown; // Full plan snapshot
  tags?: string[];
}

export interface PlanChange {
  type: 'add' | 'update' | 'delete' | 'reorder';
  target: 'phase' | 'task' | 'assignment' | 'deadline' | 'budget';
  targetId: string;
  targetName: string;
  previousValue?: unknown;
  newValue?: unknown;
}

export interface CollaborationEvent {
  id: string;
  sessionId: string;
  type: CollaborationEventType;
  participantId: string;
  participantName: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export type CollaborationEventType =
  | 'participant_joined'
  | 'participant_left'
  | 'task_edit_started'
  | 'task_edit_completed'
  | 'comment_added'
  | 'approval_requested'
  | 'approval_decided'
  | 'version_created'
  | 'cursor_moved';

// ============================================================================
// COLLABORATION SERVICE
// ============================================================================

class ProjectCollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private comments: Map<string, TaskComment[]> = new Map(); // projectId -> comments
  private approvals: Map<string, ApprovalWorkflow[]> = new Map(); // projectId -> approvals
  private versions: Map<string, PlanVersion[]> = new Map(); // projectId -> versions
  private eventListeners: Map<string, Set<(event: CollaborationEvent) => void>> = new Map();

  // ---- Session Management ----

  createSession(projectId: string, projectName: string, creator: SessionParticipant): CollaborationSession {
    const session: CollaborationSession = {
      id: this.generateId('session'),
      projectId,
      projectName,
      participants: [{ ...creator, role: 'owner', isOnline: true, lastActiveAt: new Date() }],
      startedAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
    };

    this.sessions.set(session.id, session);
    this.emitEvent(session.id, {
      type: 'participant_joined',
      participantId: creator.id,
      participantName: creator.name,
      data: { role: 'owner' },
    });

    return session;
  }

  joinSession(sessionId: string, participant: Omit<SessionParticipant, 'role' | 'joinedAt' | 'lastActiveAt' | 'isOnline'>): SessionParticipant | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'closed') return null;

    const existingParticipant = session.participants.find(p => p.id === participant.id);
    if (existingParticipant) {
      existingParticipant.isOnline = true;
      existingParticipant.lastActiveAt = new Date();
      return existingParticipant;
    }

    const newParticipant: SessionParticipant = {
      ...participant,
      role: 'editor',
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      isOnline: true,
    };

    session.participants.push(newParticipant);
    session.lastActivity = new Date();

    this.emitEvent(sessionId, {
      type: 'participant_joined',
      participantId: participant.id,
      participantName: participant.name,
      data: { role: 'editor' },
    });

    return newParticipant;
  }

  leaveSession(sessionId: string, participantId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.isOnline = false;
      participant.currentlyEditing = undefined;

      this.emitEvent(sessionId, {
        type: 'participant_left',
        participantId: participant.id,
        participantName: participant.name,
        data: {},
      });
    }

    // Close session if no online participants
    const onlineCount = session.participants.filter(p => p.isOnline).length;
    if (onlineCount === 0) {
      session.status = 'idle';
    }
  }

  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionForProject(projectId: string): CollaborationSession | undefined {
    return Array.from(this.sessions.values()).find(
      s => s.projectId === projectId && s.status !== 'closed'
    );
  }

  // ---- Task Editing ----

  startEditingTask(sessionId: string, participantId: string, taskId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if anyone else is editing this task
    const isLocked = session.participants.some(
      p => p.id !== participantId && p.currentlyEditing === taskId
    );
    if (isLocked) return false;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant) {
      participant.currentlyEditing = taskId;
      participant.lastActiveAt = new Date();
      session.lastActivity = new Date();

      this.emitEvent(sessionId, {
        type: 'task_edit_started',
        participantId,
        participantName: participant.name,
        data: { taskId },
      });
    }

    return true;
  }

  finishEditingTask(sessionId: string, participantId: string, taskId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.id === participantId);
    if (participant && participant.currentlyEditing === taskId) {
      participant.currentlyEditing = undefined;
      participant.lastActiveAt = new Date();
      session.lastActivity = new Date();

      this.emitEvent(sessionId, {
        type: 'task_edit_completed',
        participantId,
        participantName: participant.name,
        data: { taskId },
      });
    }
  }

  // ---- Comments ----

  addComment(comment: Omit<TaskComment, 'id' | 'createdAt' | 'isResolved' | 'replies'>): TaskComment {
    const newComment: TaskComment = {
      ...comment,
      id: this.generateId('comment'),
      createdAt: new Date(),
      isResolved: false,
      replies: [],
    };

    const projectComments = this.comments.get(comment.projectId) || [];
    projectComments.push(newComment);
    this.comments.set(comment.projectId, projectComments);

    // Emit event if there's an active session
    const session = this.getSessionForProject(comment.projectId);
    if (session) {
      this.emitEvent(session.id, {
        type: 'comment_added',
        participantId: comment.authorId,
        participantName: comment.authorName,
        data: {
          commentId: newComment.id,
          taskId: comment.taskId,
          preview: comment.content.substring(0, 100),
        },
      });
    }

    return newComment;
  }

  addReply(projectId: string, commentId: string, reply: Omit<TaskCommentReply, 'id' | 'createdAt' | 'commentId'>): TaskCommentReply | null {
    const projectComments = this.comments.get(projectId);
    if (!projectComments) return null;

    const comment = projectComments.find(c => c.id === commentId);
    if (!comment) return null;

    const newReply: TaskCommentReply = {
      ...reply,
      id: this.generateId('reply'),
      commentId,
      createdAt: new Date(),
    };

    comment.replies.push(newReply);
    return newReply;
  }

  resolveComment(projectId: string, commentId: string): boolean {
    const projectComments = this.comments.get(projectId);
    if (!projectComments) return false;

    const comment = projectComments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.isResolved = true;
    return true;
  }

  getCommentsForTask(projectId: string, taskId: string): TaskComment[] {
    const projectComments = this.comments.get(projectId) || [];
    return projectComments.filter(c => c.taskId === taskId);
  }

  getCommentsForProject(projectId: string): TaskComment[] {
    return this.comments.get(projectId) || [];
  }

  // ---- Approval Workflows ----

  requestApproval(approval: Omit<ApprovalWorkflow, 'id' | 'requestedAt' | 'status'>): ApprovalWorkflow {
    const newApproval: ApprovalWorkflow = {
      ...approval,
      id: this.generateId('approval'),
      requestedAt: new Date(),
      status: 'pending',
    };

    const projectApprovals = this.approvals.get(approval.projectId) || [];
    projectApprovals.push(newApproval);
    this.approvals.set(approval.projectId, projectApprovals);

    // Emit event
    const session = this.getSessionForProject(approval.projectId);
    if (session) {
      this.emitEvent(session.id, {
        type: 'approval_requested',
        participantId: approval.requestedBy.id,
        participantName: approval.requestedBy.name,
        data: {
          approvalId: newApproval.id,
          type: approval.type,
          phaseName: approval.phaseName,
        },
      });
    }

    return newApproval;
  }

  decideApproval(
    projectId: string,
    approvalId: string,
    approverId: string,
    decision: 'approved' | 'rejected',
    comments?: string
  ): boolean {
    const projectApprovals = this.approvals.get(projectId);
    if (!projectApprovals) return false;

    const approval = projectApprovals.find(a => a.id === approvalId);
    if (!approval || approval.status !== 'pending') return false;

    const step = approval.approvers.find(a => a.approverId === approverId);
    if (!step || step.status !== 'pending') return false;

    step.status = decision;
    step.decidedAt = new Date();
    step.comments = comments;

    // Check if all required approvers have decided
    const requiredApprovers = approval.approvers.filter(a => a.required);
    const allApproved = requiredApprovers.every(a => a.status === 'approved');
    const anyRejected = approval.approvers.some(a => a.status === 'rejected');

    if (anyRejected) {
      approval.status = 'rejected';
    } else if (allApproved) {
      approval.status = 'approved';
    }

    // Emit event
    const session = this.getSessionForProject(projectId);
    if (session) {
      this.emitEvent(session.id, {
        type: 'approval_decided',
        participantId: approverId,
        participantName: step.approverName,
        data: {
          approvalId,
          decision,
          overallStatus: approval.status,
        },
      });
    }

    return true;
  }

  getApprovalsForProject(projectId: string): ApprovalWorkflow[] {
    return this.approvals.get(projectId) || [];
  }

  getPendingApprovals(projectId: string, approverId?: string): ApprovalWorkflow[] {
    const projectApprovals = this.approvals.get(projectId) || [];
    return projectApprovals.filter(a => {
      if (a.status !== 'pending') return false;
      if (approverId) {
        return a.approvers.some(s => s.approverId === approverId && s.status === 'pending');
      }
      return true;
    });
  }

  // ---- Version History ----

  createVersion(
    projectId: string,
    createdBy: { id: string; name: string },
    changeDescription: string,
    changes: PlanChange[],
    snapshot: unknown,
    tags?: string[]
  ): PlanVersion {
    const projectVersions = this.versions.get(projectId) || [];
    const versionNumber = projectVersions.length + 1;

    const newVersion: PlanVersion = {
      id: this.generateId('version'),
      projectId,
      versionNumber,
      createdAt: new Date(),
      createdBy,
      changeDescription,
      changes,
      snapshot,
      tags,
    };

    projectVersions.push(newVersion);
    this.versions.set(projectId, projectVersions);

    // Emit event
    const session = this.getSessionForProject(projectId);
    if (session) {
      this.emitEvent(session.id, {
        type: 'version_created',
        participantId: createdBy.id,
        participantName: createdBy.name,
        data: {
          versionId: newVersion.id,
          versionNumber,
          changeDescription,
        },
      });
    }

    return newVersion;
  }

  getVersionHistory(projectId: string): PlanVersion[] {
    return this.versions.get(projectId) || [];
  }

  getVersion(projectId: string, versionId: string): PlanVersion | undefined {
    const projectVersions = this.versions.get(projectId) || [];
    return projectVersions.find(v => v.id === versionId);
  }

  compareVersions(projectId: string, versionId1: string, versionId2: string): PlanChange[] {
    const v1 = this.getVersion(projectId, versionId1);
    const v2 = this.getVersion(projectId, versionId2);

    if (!v1 || !v2) return [];

    // Return all changes between the two versions
    const allVersions = this.getVersionHistory(projectId);
    const idx1 = allVersions.findIndex(v => v.id === versionId1);
    const idx2 = allVersions.findIndex(v => v.id === versionId2);

    if (idx1 === -1 || idx2 === -1) return [];

    const [start, end] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
    const changesBetween: PlanChange[] = [];

    for (let i = start + 1; i <= end; i++) {
      changesBetween.push(...allVersions[i].changes);
    }

    return changesBetween;
  }

  // ---- Event System ----

  subscribe(sessionId: string, callback: (event: CollaborationEvent) => void): () => void {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, new Set());
    }
    this.eventListeners.get(sessionId)!.add(callback);

    return () => {
      this.eventListeners.get(sessionId)?.delete(callback);
    };
  }

  private emitEvent(sessionId: string, event: Omit<CollaborationEvent, 'id' | 'sessionId' | 'timestamp'>): void {
    const fullEvent: CollaborationEvent = {
      ...event,
      id: this.generateId('event'),
      sessionId,
      timestamp: new Date(),
    };

    const listeners = this.eventListeners.get(sessionId);
    if (listeners) {
      listeners.forEach(callback => callback(fullEvent));
    }
  }

  // ---- Helper Methods ----

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const projectCollaborationService = new ProjectCollaborationService();

export default projectCollaborationService;
