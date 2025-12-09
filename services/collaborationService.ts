/**
 * Real-time Collaboration Service - Sprint 5.17
 *
 * Enables real-time collaboration features.
 * Features:
 * - Live cursors and presence
 * - Shared exercise sessions
 * - Real-time comments
 * - Collaborative editing
 * - Activity feed
 * - User presence indicators
 * - Conflict resolution
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type ActivityType = 'join' | 'leave' | 'edit' | 'comment' | 'complete' | 'start' | 'pause';

export interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  role: CollaboratorRole;
  status: PresenceStatus;
  cursor?: CursorPosition;
  lastActive: string;
  sessionId?: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  timestamp: number;
}

export interface Presence {
  collaborators: Map<string, Collaborator>;
  room: string;
  lastUpdate: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  timestamp: string;
  data?: Record<string, unknown>;
  room: string;
}

export interface SharedSession {
  id: string;
  room: string;
  exerciseId: string;
  hostId: string;
  participants: string[];
  status: 'waiting' | 'active' | 'paused' | 'completed';
  startTime?: string;
  progress: Record<string, number>;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  targetId?: string;
  targetType?: 'exercise' | 'session' | 'progress';
  replies?: Comment[];
  reactions?: Record<string, string[]>; // emoji -> userIds
}

export interface CollaborationConfig {
  enabled: boolean;
  cursorSharing: boolean;
  presenceTimeout: number; // ms
  maxCollaborators: number;
  syncInterval: number; // ms
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_CONFIG = 'rehabflow-collab-config';
const STORAGE_KEY_ACTIVITIES = 'rehabflow-collab-activities';
const PRESENCE_TIMEOUT = 30000; // 30 seconds

const DEFAULT_CONFIG: CollaborationConfig = {
  enabled: true,
  cursorSharing: true,
  presenceTimeout: PRESENCE_TIMEOUT,
  maxCollaborators: 10,
  syncInterval: 1000,
};

// User colors for presence
const USER_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // amber
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#60a5fa', // blue
  '#a78bfa', // violet
  '#f472b6', // pink
  '#94a3b8', // slate
];

// ============================================================================
// COLLABORATION SERVICE
// ============================================================================

class CollaborationService {
  private config: CollaborationConfig = DEFAULT_CONFIG;
  private currentUser: Collaborator | null = null;
  private presence: Presence | null = null;
  private activities: Activity[] = [];
  private sharedSessions: Map<string, SharedSession> = new Map();
  private comments: Map<string, Comment[]> = new Map();

  // Event handlers
  private eventHandlers: Map<string, Set<Function>> = new Map();

  // Intervals
  private presenceInterval: number | null = null;
  private syncInterval: number | null = null;

  constructor() {
    this.loadConfig();
    this.loadActivities();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[Collaboration] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Collaboration] Failed to save config:', error);
    }
  }

  private loadActivities(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('[Collaboration] Failed to load activities:', error);
    }
  }

  private saveActivities(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const recent = this.activities.slice(-100);
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(recent));
    } catch (error) {
      logger.error('[Collaboration] Failed to save activities:', error);
    }
  }

  /**
   * Initialize collaboration service
   */
  public init(userId: string, userName: string, config?: Partial<CollaborationConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    // Create current user
    this.currentUser = {
      id: userId,
      name: userName,
      color: this.getColorForUser(userId),
      role: 'editor',
      status: 'online',
      lastActive: new Date().toISOString(),
    };

    logger.info('[Collaboration] Initialized for user:', userId);
  }

  /**
   * Join a collaboration room
   */
  public joinRoom(room: string): Presence {
    if (!this.currentUser) {
      throw new Error('User not initialized');
    }

    // Create or join presence
    this.presence = {
      collaborators: new Map(),
      room,
      lastUpdate: Date.now(),
    };

    // Add self
    this.presence.collaborators.set(this.currentUser.id, this.currentUser);

    // Start presence heartbeat
    this.startPresenceHeartbeat();

    // Log activity
    this.logActivity('join', room);

    // Emit event
    this.emit('room-joined', { room, user: this.currentUser });

    logger.info('[Collaboration] Joined room:', room);
    return this.presence;
  }

  /**
   * Leave current room
   */
  public leaveRoom(): void {
    if (!this.presence || !this.currentUser) return;

    const room = this.presence.room;

    // Log activity
    this.logActivity('leave', room);

    // Emit event
    this.emit('room-left', { room, user: this.currentUser });

    // Stop heartbeat
    this.stopPresenceHeartbeat();

    this.presence = null;
    logger.info('[Collaboration] Left room:', room);
  }

  // --------------------------------------------------------------------------
  // PRESENCE
  // --------------------------------------------------------------------------

  /**
   * Update user status
   */
  public updateStatus(status: PresenceStatus): void {
    if (!this.currentUser) return;

    this.currentUser.status = status;
    this.currentUser.lastActive = new Date().toISOString();

    if (this.presence) {
      this.presence.collaborators.set(this.currentUser.id, this.currentUser);
      this.emit('presence-updated', { user: this.currentUser });
    }
  }

  /**
   * Update cursor position
   */
  public updateCursor(position: Omit<CursorPosition, 'timestamp'>): void {
    if (!this.currentUser || !this.config.cursorSharing) return;

    this.currentUser.cursor = {
      ...position,
      timestamp: Date.now(),
    };

    if (this.presence) {
      this.presence.collaborators.set(this.currentUser.id, this.currentUser);
      this.emit('cursor-moved', { userId: this.currentUser.id, cursor: this.currentUser.cursor });
    }
  }

  /**
   * Get all collaborators
   */
  public getCollaborators(): Collaborator[] {
    if (!this.presence) return [];
    return Array.from(this.presence.collaborators.values());
  }

  /**
   * Get collaborator by ID
   */
  public getCollaborator(userId: string): Collaborator | null {
    return this.presence?.collaborators.get(userId) || null;
  }

  private startPresenceHeartbeat(): void {
    if (this.presenceInterval) return;

    this.presenceInterval = window.setInterval(() => {
      this.sendPresenceHeartbeat();
      this.cleanupStalePresence();
    }, this.config.syncInterval);
  }

  private stopPresenceHeartbeat(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
  }

  private sendPresenceHeartbeat(): void {
    if (!this.currentUser) return;

    this.currentUser.lastActive = new Date().toISOString();
    this.emit('presence-heartbeat', { user: this.currentUser });
  }

  private cleanupStalePresence(): void {
    if (!this.presence) return;

    const now = Date.now();
    const stale: string[] = [];

    this.presence.collaborators.forEach((collaborator, id) => {
      const lastActive = new Date(collaborator.lastActive).getTime();
      if (now - lastActive > this.config.presenceTimeout) {
        stale.push(id);
      }
    });

    stale.forEach(id => {
      this.presence?.collaborators.delete(id);
      this.emit('user-offline', { userId: id });
    });
  }

  private getColorForUser(userId: string): string {
    // Deterministic color based on user ID
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }

  // --------------------------------------------------------------------------
  // SHARED SESSIONS
  // --------------------------------------------------------------------------

  /**
   * Create shared exercise session
   */
  public createSharedSession(exerciseId: string): SharedSession {
    if (!this.currentUser || !this.presence) {
      throw new Error('Must be in a room to create a session');
    }

    const session: SharedSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      room: this.presence.room,
      exerciseId,
      hostId: this.currentUser.id,
      participants: [this.currentUser.id],
      status: 'waiting',
      progress: { [this.currentUser.id]: 0 },
      createdAt: new Date().toISOString(),
    };

    this.sharedSessions.set(session.id, session);
    this.currentUser.sessionId = session.id;

    this.emit('session-created', { session });
    this.logActivity('start', this.presence.room, { sessionId: session.id, exerciseId });

    logger.info('[Collaboration] Session created:', session.id);
    return session;
  }

  /**
   * Join shared session
   */
  public joinSharedSession(sessionId: string): SharedSession | null {
    const session = this.sharedSessions.get(sessionId);
    if (!session || !this.currentUser) return null;

    if (session.participants.length >= this.config.maxCollaborators) {
      logger.warn('[Collaboration] Session full');
      return null;
    }

    session.participants.push(this.currentUser.id);
    session.progress[this.currentUser.id] = 0;
    this.currentUser.sessionId = sessionId;

    this.emit('session-joined', { session, userId: this.currentUser.id });
    return session;
  }

  /**
   * Leave shared session
   */
  public leaveSharedSession(): void {
    if (!this.currentUser?.sessionId) return;

    const session = this.sharedSessions.get(this.currentUser.sessionId);
    if (session) {
      session.participants = session.participants.filter(id => id !== this.currentUser?.id);
      delete session.progress[this.currentUser.id];

      if (session.participants.length === 0) {
        this.sharedSessions.delete(session.id);
        this.emit('session-ended', { sessionId: session.id });
      } else {
        this.emit('session-left', { session, userId: this.currentUser.id });
      }
    }

    this.currentUser.sessionId = undefined;
  }

  /**
   * Update session progress
   */
  public updateSessionProgress(progress: number): void {
    if (!this.currentUser?.sessionId) return;

    const session = this.sharedSessions.get(this.currentUser.sessionId);
    if (session) {
      session.progress[this.currentUser.id] = progress;
      this.emit('progress-updated', {
        sessionId: session.id,
        userId: this.currentUser.id,
        progress,
      });
    }
  }

  /**
   * Start shared session
   */
  public startSharedSession(sessionId: string): void {
    const session = this.sharedSessions.get(sessionId);
    if (!session || session.hostId !== this.currentUser?.id) return;

    session.status = 'active';
    session.startTime = new Date().toISOString();
    this.emit('session-started', { session });
  }

  /**
   * Pause shared session
   */
  public pauseSharedSession(sessionId: string): void {
    const session = this.sharedSessions.get(sessionId);
    if (!session) return;

    session.status = 'paused';
    this.emit('session-paused', { session });
    this.logActivity('pause', session.room, { sessionId });
  }

  /**
   * Complete shared session
   */
  public completeSharedSession(sessionId: string): void {
    const session = this.sharedSessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    this.emit('session-completed', { session });
    this.logActivity('complete', session.room, { sessionId });
  }

  /**
   * Get active session
   */
  public getActiveSession(): SharedSession | null {
    if (!this.currentUser?.sessionId) return null;
    return this.sharedSessions.get(this.currentUser.sessionId) || null;
  }

  // --------------------------------------------------------------------------
  // COMMENTS
  // --------------------------------------------------------------------------

  /**
   * Add comment
   */
  public addComment(
    content: string,
    targetId?: string,
    targetType?: 'exercise' | 'session' | 'progress'
  ): Comment | null {
    if (!this.currentUser || !this.presence) return null;

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      content,
      timestamp: new Date().toISOString(),
      targetId,
      targetType,
      replies: [],
      reactions: {},
    };

    const key = targetId || this.presence.room;
    const comments = this.comments.get(key) || [];
    comments.push(comment);
    this.comments.set(key, comments);

    this.emit('comment-added', { comment });
    this.logActivity('comment', this.presence.room, { commentId: comment.id, targetId });

    return comment;
  }

  /**
   * Reply to comment
   */
  public replyToComment(parentId: string, content: string): Comment | null {
    if (!this.currentUser) return null;

    const reply: Comment = {
      id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      content,
      timestamp: new Date().toISOString(),
    };

    // Find parent comment
    for (const comments of this.comments.values()) {
      const parent = comments.find(c => c.id === parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(reply);
        this.emit('reply-added', { parentId, reply });
        return reply;
      }
    }

    return null;
  }

  /**
   * Add reaction to comment
   */
  public addReaction(commentId: string, emoji: string): void {
    if (!this.currentUser) return;

    for (const comments of this.comments.values()) {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        comment.reactions = comment.reactions || {};
        comment.reactions[emoji] = comment.reactions[emoji] || [];

        if (!comment.reactions[emoji].includes(this.currentUser.id)) {
          comment.reactions[emoji].push(this.currentUser.id);
          this.emit('reaction-added', { commentId, emoji, userId: this.currentUser.id });
        }
        return;
      }
    }
  }

  /**
   * Get comments for target
   */
  public getComments(targetId?: string): Comment[] {
    const key = targetId || this.presence?.room;
    if (!key) return [];
    return this.comments.get(key) || [];
  }

  // --------------------------------------------------------------------------
  // ACTIVITY FEED
  // --------------------------------------------------------------------------

  private logActivity(type: ActivityType, room: string, data?: Record<string, unknown>): void {
    if (!this.currentUser) return;

    const activity: Activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      timestamp: new Date().toISOString(),
      data,
      room,
    };

    this.activities.push(activity);
    this.saveActivities();
    this.emit('activity', { activity });
  }

  /**
   * Get activity feed
   */
  public getActivityFeed(room?: string, limit: number = 50): Activity[] {
    let activities = [...this.activities];

    if (room) {
      activities = activities.filter(a => a.room === room);
    }

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // --------------------------------------------------------------------------
  // EVENT SYSTEM
  // --------------------------------------------------------------------------

  /**
   * Subscribe to events
   */
  public on(event: string, handler: Function): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Emit event
   */
  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('[Collaboration] Event handler error:', event, error);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------------

  /**
   * Destroy service
   */
  public destroy(): void {
    this.leaveRoom();
    this.stopPresenceHeartbeat();
    this.eventHandlers.clear();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const collaborationService = new CollaborationService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for collaboration
 */
export function useCollaboration(room: string) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Join room
    try {
      collaborationService.joinRoom(room);
      setIsConnected(true);
      setCollaborators(collaborationService.getCollaborators());
      setActivities(collaborationService.getActivityFeed(room));
    } catch (error) {
      logger.error('[Collaboration] Failed to join room:', error);
    }

    // Subscribe to events
    const unsubPresence = collaborationService.on('presence-updated', () => {
      setCollaborators(collaborationService.getCollaborators());
    });

    const unsubActivity = collaborationService.on('activity', () => {
      setActivities(collaborationService.getActivityFeed(room));
    });

    const unsubOffline = collaborationService.on('user-offline', () => {
      setCollaborators(collaborationService.getCollaborators());
    });

    return () => {
      unsubPresence();
      unsubActivity();
      unsubOffline();
      collaborationService.leaveRoom();
      setIsConnected(false);
    };
  }, [room]);

  const updateCursor = useCallback((x: number, y: number, elementId?: string) => {
    collaborationService.updateCursor({ x, y, elementId });
  }, []);

  const updateStatus = useCallback((status: PresenceStatus) => {
    collaborationService.updateStatus(status);
  }, []);

  return {
    collaborators,
    activities,
    isConnected,
    updateCursor,
    updateStatus,
  };
}

/**
 * Hook for shared sessions
 */
export function useSharedSession() {
  const [session, setSession] = useState<SharedSession | null>(null);

  useEffect(() => {
    const unsubCreated = collaborationService.on('session-created', ({ session }: { session: SharedSession }) => {
      setSession(session);
    });

    const unsubProgress = collaborationService.on('progress-updated', () => {
      setSession(collaborationService.getActiveSession());
    });

    const unsubEnded = collaborationService.on('session-ended', () => {
      setSession(null);
    });

    return () => {
      unsubCreated();
      unsubProgress();
      unsubEnded();
    };
  }, []);

  const createSession = useCallback((exerciseId: string) => {
    const newSession = collaborationService.createSharedSession(exerciseId);
    setSession(newSession);
    return newSession;
  }, []);

  const joinSession = useCallback((sessionId: string) => {
    const joined = collaborationService.joinSharedSession(sessionId);
    setSession(joined);
    return joined;
  }, []);

  const leaveSession = useCallback(() => {
    collaborationService.leaveSharedSession();
    setSession(null);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    collaborationService.updateSessionProgress(progress);
  }, []);

  return {
    session,
    createSession,
    joinSession,
    leaveSession,
    updateProgress,
    startSession: collaborationService.startSharedSession.bind(collaborationService),
    pauseSession: collaborationService.pauseSharedSession.bind(collaborationService),
    completeSession: collaborationService.completeSharedSession.bind(collaborationService),
  };
}

/**
 * Hook for comments
 */
export function useComments(targetId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    setComments(collaborationService.getComments(targetId));

    const unsubAdd = collaborationService.on('comment-added', () => {
      setComments(collaborationService.getComments(targetId));
    });

    const unsubReply = collaborationService.on('reply-added', () => {
      setComments(collaborationService.getComments(targetId));
    });

    return () => {
      unsubAdd();
      unsubReply();
    };
  }, [targetId]);

  const addComment = useCallback((content: string, targetType?: 'exercise' | 'session' | 'progress') => {
    return collaborationService.addComment(content, targetId, targetType);
  }, [targetId]);

  const replyToComment = useCallback((parentId: string, content: string) => {
    return collaborationService.replyToComment(parentId, content);
  }, []);

  const addReaction = useCallback((commentId: string, emoji: string) => {
    collaborationService.addReaction(commentId, emoji);
  }, []);

  return {
    comments,
    addComment,
    replyToComment,
    addReaction,
  };
}

export default collaborationService;
