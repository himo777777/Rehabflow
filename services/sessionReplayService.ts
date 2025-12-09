/**
 * Session Replay Service - Sprint 5.14
 *
 * Records user sessions for debugging and UX analysis.
 * Features:
 * - DOM mutation recording
 * - User interaction capture
 * - Network request logging
 * - Console output capture
 * - Session playback
 * - Privacy-aware masking
 * - Compression for storage
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type EventType =
  | 'dom_mutation'
  | 'mouse_move'
  | 'mouse_click'
  | 'scroll'
  | 'input'
  | 'resize'
  | 'network'
  | 'console'
  | 'error'
  | 'custom';

export interface RecordedEvent {
  id: string;
  timestamp: number;
  type: EventType;
  data: unknown;
}

export interface DomMutationEvent {
  type: 'add' | 'remove' | 'attribute' | 'text';
  target: string; // CSS selector path
  value?: unknown;
}

export interface MouseEvent {
  x: number;
  y: number;
  target?: string;
}

export interface ClickEvent extends MouseEvent {
  button: number;
  text?: string;
}

export interface ScrollEvent {
  x: number;
  y: number;
  target?: string;
}

export interface InputEvent {
  target: string;
  value: string;
  masked: boolean;
}

export interface NetworkEvent {
  url: string;
  method: string;
  status: number;
  duration: number;
  size?: number;
}

export interface ConsoleEvent {
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  args?: unknown[];
}

export interface Session {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  userId?: string;
  deviceType: string;
  viewport: { width: number; height: number };
  url: string;
  events: RecordedEvent[];
  metadata: Record<string, unknown>;
}

export interface SessionReplayConfig {
  enabled: boolean;
  sampleRate: number;
  maxSessionDuration: number; // ms
  maxEvents: number;
  captureMouseMove: boolean;
  captureScroll: boolean;
  captureNetwork: boolean;
  captureConsole: boolean;
  maskInputs: boolean;
  maskSelectors: string[];
  ignoreSelectors: string[];
  compressionEnabled: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  eventIndex: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_SESSIONS = 'rehabflow-replay-sessions';
const STORAGE_KEY_CURRENT = 'rehabflow-replay-current';
const MAX_STORED_SESSIONS = 10;

const DEFAULT_CONFIG: SessionReplayConfig = {
  enabled: true,
  sampleRate: 0.1, // 10% of sessions
  maxSessionDuration: 30 * 60 * 1000, // 30 minutes
  maxEvents: 10000,
  captureMouseMove: true,
  captureScroll: true,
  captureNetwork: true,
  captureConsole: true,
  maskInputs: true,
  maskSelectors: [
    'input[type="password"]',
    'input[type="email"]',
    '[data-sensitive]',
    '.sensitive',
  ],
  ignoreSelectors: [
    '.replay-ignore',
    '[data-replay-ignore]',
  ],
  compressionEnabled: true,
};

// ============================================================================
// SESSION REPLAY SERVICE
// ============================================================================

class SessionReplayService {
  private config: SessionReplayConfig = DEFAULT_CONFIG;
  private currentSession: Session | null = null;
  private sessions: Map<string, Session> = new Map();
  private isRecording: boolean = false;
  private eventBuffer: RecordedEvent[] = [];
  private flushInterval: number | null = null;

  // Observers
  private mutationObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Throttling
  private lastMouseMove: number = 0;
  private lastScroll: number = 0;
  private mouseThrottle: number = 50; // ms
  private scrollThrottle: number = 100; // ms

  constructor() {
    this.loadSessions();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize session replay
   */
  public init(config?: Partial<SessionReplayConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (!this.config.enabled) {
      logger.info('[SessionReplay] Disabled');
      return;
    }

    // Check sample rate
    if (Math.random() > this.config.sampleRate) {
      logger.debug('[SessionReplay] Session not sampled');
      return;
    }

    this.startRecording();
  }

  private loadSessions(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (stored) {
        const parsed = JSON.parse(stored) as Session[];
        parsed.forEach(s => this.sessions.set(s.id, s));
      }
    } catch (error) {
      logger.error('[SessionReplay] Failed to load sessions:', error);
    }
  }

  private saveSessions(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const sessions = Array.from(this.sessions.values())
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, MAX_STORED_SESSIONS);

      // Compress if enabled
      const data = this.config.compressionEnabled
        ? this.compress(sessions)
        : JSON.stringify(sessions);

      localStorage.setItem(STORAGE_KEY_SESSIONS, data);
    } catch (error) {
      logger.error('[SessionReplay] Failed to save sessions:', error);
    }
  }

  // --------------------------------------------------------------------------
  // RECORDING
  // --------------------------------------------------------------------------

  /**
   * Start recording session
   */
  public startRecording(): void {
    if (this.isRecording || typeof window === 'undefined') return;

    this.currentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      startTime: new Date().toISOString(),
      duration: 0,
      deviceType: this.getDeviceType(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      url: window.location.href,
      events: [],
      metadata: {},
    };

    this.setupEventListeners();
    this.setupObservers();
    this.startFlushInterval();

    this.isRecording = true;
    logger.info('[SessionReplay] Recording started:', this.currentSession.id);
  }

  /**
   * Stop recording session
   */
  public stopRecording(): Session | null {
    if (!this.isRecording || !this.currentSession) return null;

    this.flushEvents();
    this.teardownEventListeners();
    this.teardownObservers();
    this.stopFlushInterval();

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = Date.now() - new Date(this.currentSession.startTime).getTime();

    // Save session
    this.sessions.set(this.currentSession.id, this.currentSession);
    this.saveSessions();

    const session = this.currentSession;
    this.currentSession = null;
    this.isRecording = false;

    logger.info('[SessionReplay] Recording stopped:', session.id);
    return session;
  }

  /**
   * Check if recording
   */
  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS
  // --------------------------------------------------------------------------

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Mouse move
    if (this.config.captureMouseMove) {
      window.addEventListener('mousemove', this.handleMouseMove);
    }

    // Click
    window.addEventListener('click', this.handleClick, true);

    // Scroll
    if (this.config.captureScroll) {
      window.addEventListener('scroll', this.handleScroll, true);
    }

    // Input
    window.addEventListener('input', this.handleInput, true);

    // Resize
    window.addEventListener('resize', this.handleResize);

    // Network (already intercepted in errorTrackingService)
    if (this.config.captureNetwork) {
      this.interceptNetwork();
    }

    // Console
    if (this.config.captureConsole) {
      this.interceptConsole();
    }

    // Visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Before unload
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  private teardownEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick, true);
    window.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('input', this.handleInput, true);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  private handleMouseMove = (event: globalThis.MouseEvent): void => {
    const now = Date.now();
    if (now - this.lastMouseMove < this.mouseThrottle) return;
    this.lastMouseMove = now;

    this.addEvent('mouse_move', {
      x: event.clientX,
      y: event.clientY,
    } as MouseEvent);
  };

  private handleClick = (event: globalThis.MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (this.shouldIgnoreElement(target)) return;

    this.addEvent('mouse_click', {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      target: this.getSelector(target),
      text: this.getElementText(target),
    } as ClickEvent);
  };

  private handleScroll = (event: Event): void => {
    const now = Date.now();
    if (now - this.lastScroll < this.scrollThrottle) return;
    this.lastScroll = now;

    const target = event.target as HTMLElement;
    const isWindow = target === document || target === document.documentElement;

    this.addEvent('scroll', {
      x: isWindow ? window.scrollX : target.scrollLeft,
      y: isWindow ? window.scrollY : target.scrollTop,
      target: isWindow ? 'window' : this.getSelector(target),
    } as ScrollEvent);
  };

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (this.shouldIgnoreElement(target)) return;

    const shouldMask = this.config.maskInputs && this.shouldMaskElement(target);
    const value = shouldMask ? '*'.repeat(target.value.length) : target.value;

    this.addEvent('input', {
      target: this.getSelector(target),
      value,
      masked: shouldMask,
    } as InputEvent);
  };

  private handleResize = (): void => {
    this.addEvent('resize', {
      width: window.innerWidth,
      height: window.innerHeight,
    });

    if (this.currentSession) {
      this.currentSession.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
  };

  private handleVisibilityChange = (): void => {
    this.addEvent('custom', {
      type: 'visibility',
      visible: !document.hidden,
    });

    if (document.hidden) {
      this.flushEvents();
    }
  };

  private handleBeforeUnload = (): void => {
    this.stopRecording();
  };

  // --------------------------------------------------------------------------
  // MUTATION OBSERVER
  // --------------------------------------------------------------------------

  private setupObservers(): void {
    if (typeof window === 'undefined') return;

    // DOM mutations
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (this.shouldIgnoreElement(mutation.target as HTMLElement)) continue;

        switch (mutation.type) {
          case 'childList':
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.addEvent('dom_mutation', {
                  type: 'add',
                  target: this.getSelector(node as HTMLElement),
                  value: (node as HTMLElement).outerHTML?.substring(0, 500),
                } as DomMutationEvent);
              }
            });

            mutation.removedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.addEvent('dom_mutation', {
                  type: 'remove',
                  target: this.getSelector(node as HTMLElement),
                } as DomMutationEvent);
              }
            });
            break;

          case 'attributes':
            this.addEvent('dom_mutation', {
              type: 'attribute',
              target: this.getSelector(mutation.target as HTMLElement),
              value: {
                name: mutation.attributeName,
                value: (mutation.target as HTMLElement).getAttribute(mutation.attributeName || ''),
              },
            } as DomMutationEvent);
            break;

          case 'characterData':
            this.addEvent('dom_mutation', {
              type: 'text',
              target: this.getSelector(mutation.target.parentElement as HTMLElement),
              value: mutation.target.textContent?.substring(0, 200),
            } as DomMutationEvent);
            break;
        }
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: true,
    });
  }

  private teardownObservers(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  // --------------------------------------------------------------------------
  // NETWORK & CONSOLE INTERCEPTION
  // --------------------------------------------------------------------------

  private interceptNetwork(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = (args[1]?.method || 'GET').toUpperCase();
      const startTime = Date.now();

      try {
        const response = await originalFetch.apply(this, args);
        const duration = Date.now() - startTime;

        self.addEvent('network', {
          url: self.sanitizeUrl(url),
          method,
          status: response.status,
          duration,
        } as NetworkEvent);

        return response;
      } catch (error) {
        self.addEvent('network', {
          url: self.sanitizeUrl(url),
          method,
          status: 0,
          duration: Date.now() - startTime,
        } as NetworkEvent);
        throw error;
      }
    };
  }

  private interceptConsole(): void {
    if (typeof console === 'undefined') return;

    const levels: Array<'log' | 'info' | 'warn' | 'error'> = ['log', 'info', 'warn', 'error'];
    const self = this;

    for (const level of levels) {
      const original = console[level];
      console[level] = function(...args) {
        self.addEvent('console', {
          level,
          message: args.map(a => String(a)).join(' ').substring(0, 500),
        } as ConsoleEvent);
        original.apply(console, args);
      };
    }
  }

  // --------------------------------------------------------------------------
  // EVENT BUFFERING
  // --------------------------------------------------------------------------

  private addEvent(type: EventType, data: unknown): void {
    if (!this.isRecording || !this.currentSession) return;

    // Check limits
    if (this.currentSession.events.length >= this.config.maxEvents) {
      return;
    }

    const sessionDuration = Date.now() - new Date(this.currentSession.startTime).getTime();
    if (sessionDuration > this.config.maxSessionDuration) {
      this.stopRecording();
      return;
    }

    const event: RecordedEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type,
      data,
    };

    this.eventBuffer.push(event);
  }

  private flushEvents(): void {
    if (!this.currentSession || this.eventBuffer.length === 0) return;

    this.currentSession.events.push(...this.eventBuffer);
    this.eventBuffer = [];
  }

  private startFlushInterval(): void {
    this.flushInterval = window.setInterval(() => {
      this.flushEvents();
    }, 1000);
  }

  private stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private getSelector(element: HTMLElement): string {
    if (!element || !element.tagName) return '';

    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break;
      }

      if (current.className) {
        const classes = current.className.split(' ')
          .filter(c => c && !c.startsWith('_'))
          .slice(0, 2)
          .join('.');
        if (classes) {
          selector += `.${classes}`;
        }
      }

      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ').substring(0, 200);
  }

  private getElementText(element: HTMLElement): string {
    const text = element.textContent || element.innerText || '';
    return text.trim().substring(0, 50);
  }

  private shouldIgnoreElement(element: HTMLElement): boolean {
    if (!element || !element.matches) return true;

    for (const selector of this.config.ignoreSelectors) {
      try {
        if (element.matches(selector)) return true;
      } catch {
        // Invalid selector
      }
    }

    return false;
  }

  private shouldMaskElement(element: HTMLElement): boolean {
    for (const selector of this.config.maskSelectors) {
      try {
        if (element.matches(selector)) return true;
      } catch {
        // Invalid selector
      }
    }

    return false;
  }

  private sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url, window.location.origin);
      // Remove sensitive query params
      const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth'];
      sensitiveParams.forEach(param => {
        if (parsed.searchParams.has(param)) {
          parsed.searchParams.set(param, '[REDACTED]');
        }
      });
      return parsed.pathname + parsed.search;
    } catch {
      return url.substring(0, 100);
    }
  }

  private getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const ua = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
      return /tablet|ipad/.test(ua) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  }

  // --------------------------------------------------------------------------
  // COMPRESSION
  // --------------------------------------------------------------------------

  private compress(data: Session[]): string {
    // Simple LZ-based compression simulation
    // In production, use actual compression library
    const json = JSON.stringify(data);
    return btoa(json);
  }

  private decompress(data: string): Session[] {
    try {
      const json = atob(data);
      return JSON.parse(json);
    } catch {
      return JSON.parse(data);
    }
  }

  // --------------------------------------------------------------------------
  // SESSION MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Get all sessions
   */
  public getSessions(): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  /**
   * Get session by ID
   */
  public getSession(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  /**
   * Delete session
   */
  public deleteSession(id: string): void {
    this.sessions.delete(id);
    this.saveSessions();
  }

  /**
   * Clear all sessions
   */
  public clearSessions(): void {
    this.sessions.clear();
    this.saveSessions();
  }

  /**
   * Get current session
   */
  public getCurrentSession(): Session | null {
    return this.currentSession;
  }

  /**
   * Set user ID for current session
   */
  public setUserId(userId: string): void {
    if (this.currentSession) {
      this.currentSession.userId = userId;
    }
  }

  /**
   * Add custom metadata
   */
  public setMetadata(key: string, value: unknown): void {
    if (this.currentSession) {
      this.currentSession.metadata[key] = value;
    }
  }

  /**
   * Add custom event
   */
  public trackEvent(name: string, data?: Record<string, unknown>): void {
    this.addEvent('custom', { name, ...data });
  }
}

// ============================================================================
// PLAYBACK SERVICE
// ============================================================================

export class SessionPlayer {
  private session: Session;
  private state: PlaybackState;
  private frameId: number | null = null;
  private onUpdate?: (state: PlaybackState, event?: RecordedEvent) => void;

  constructor(session: Session) {
    this.session = session;
    this.state = {
      isPlaying: false,
      currentTime: 0,
      playbackSpeed: 1,
      eventIndex: 0,
    };
  }

  public play(onUpdate: (state: PlaybackState, event?: RecordedEvent) => void): void {
    this.onUpdate = onUpdate;
    this.state.isPlaying = true;
    this.tick();
  }

  public pause(): void {
    this.state.isPlaying = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public seek(time: number): void {
    this.state.currentTime = time;
    this.state.eventIndex = this.findEventIndex(time);
    this.onUpdate?.(this.state);
  }

  public setSpeed(speed: number): void {
    this.state.playbackSpeed = speed;
  }

  public getState(): PlaybackState {
    return { ...this.state };
  }

  private tick = (): void => {
    if (!this.state.isPlaying) return;

    const startTime = new Date(this.session.startTime).getTime();
    const event = this.session.events[this.state.eventIndex];

    if (event) {
      const eventTime = event.timestamp - startTime;

      if (eventTime <= this.state.currentTime) {
        this.onUpdate?.(this.state, event);
        this.state.eventIndex++;
      }
    }

    this.state.currentTime += 16 * this.state.playbackSpeed; // ~60fps

    if (this.state.eventIndex >= this.session.events.length) {
      this.pause();
      return;
    }

    this.frameId = requestAnimationFrame(this.tick);
  };

  private findEventIndex(time: number): number {
    const startTime = new Date(this.session.startTime).getTime();

    for (let i = 0; i < this.session.events.length; i++) {
      const eventTime = this.session.events[i].timestamp - startTime;
      if (eventTime > time) {
        return Math.max(0, i - 1);
      }
    }

    return this.session.events.length - 1;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const sessionReplayService = new SessionReplayService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for session replay
 */
export function useSessionReplay() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  useEffect(() => {
    setSessions(sessionReplayService.getSessions());
    setIsRecording(sessionReplayService.isCurrentlyRecording());
    setCurrentSession(sessionReplayService.getCurrentSession());

    const interval = setInterval(() => {
      setIsRecording(sessionReplayService.isCurrentlyRecording());
      setCurrentSession(sessionReplayService.getCurrentSession());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startRecording = useCallback(() => {
    sessionReplayService.startRecording();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    const session = sessionReplayService.stopRecording();
    setIsRecording(false);
    setSessions(sessionReplayService.getSessions());
    return session;
  }, []);

  const trackEvent = useCallback((name: string, data?: Record<string, unknown>) => {
    sessionReplayService.trackEvent(name, data);
  }, []);

  return {
    sessions,
    isRecording,
    currentSession,
    startRecording,
    stopRecording,
    trackEvent,
    getSession: sessionReplayService.getSession.bind(sessionReplayService),
    deleteSession: (id: string) => {
      sessionReplayService.deleteSession(id);
      setSessions(sessionReplayService.getSessions());
    },
    clearSessions: () => {
      sessionReplayService.clearSessions();
      setSessions([]);
    },
    setUserId: sessionReplayService.setUserId.bind(sessionReplayService),
    setMetadata: sessionReplayService.setMetadata.bind(sessionReplayService),
  };
}

/**
 * Hook for session playback
 */
export function useSessionPlayer(session: Session) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    eventIndex: 0,
  });
  const [currentEvent, setCurrentEvent] = useState<RecordedEvent | null>(null);
  const playerRef = useRef<SessionPlayer | null>(null);

  useEffect(() => {
    playerRef.current = new SessionPlayer(session);
    return () => {
      playerRef.current?.pause();
    };
  }, [session]);

  const play = useCallback(() => {
    playerRef.current?.play((newState, event) => {
      setState(newState);
      if (event) setCurrentEvent(event);
    });
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pause();
    setState(s => ({ ...s, isPlaying: false }));
  }, []);

  const seek = useCallback((time: number) => {
    playerRef.current?.seek(time);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    playerRef.current?.setSpeed(speed);
    setState(s => ({ ...s, playbackSpeed: speed }));
  }, []);

  return {
    state,
    currentEvent,
    play,
    pause,
    seek,
    setSpeed,
    duration: session.duration,
    eventCount: session.events.length,
  };
}

export default sessionReplayService;
