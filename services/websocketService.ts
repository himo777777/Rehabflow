/**
 * WebSocket Service - Sprint 5.17
 *
 * Real-time bidirectional communication.
 * Features:
 * - Automatic reconnection
 * - Heartbeat/ping-pong
 * - Message queuing
 * - Channel subscriptions
 * - Binary message support
 * - Connection state management
 * - Event-based messaging
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';
export type MessageType = 'subscribe' | 'unsubscribe' | 'publish' | 'request' | 'response' | 'broadcast' | 'heartbeat';

export interface WebSocketMessage<T = unknown> {
  id: string;
  type: MessageType;
  channel?: string;
  event?: string;
  payload: T;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number; // ms
  reconnectDelayMax: number; // ms
  heartbeatInterval: number; // ms
  heartbeatTimeout: number; // ms
  messageQueueSize: number;
  binaryType: 'blob' | 'arraybuffer';
}

export interface Channel {
  name: string;
  subscribers: Set<Function>;
  lastMessage?: WebSocketMessage;
  joined: boolean;
}

export interface PendingRequest {
  id: string;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: WebSocketConfig = {
  url: '',
  reconnect: true,
  reconnectAttempts: 10,
  reconnectDelay: 1000,
  reconnectDelayMax: 30000,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  messageQueueSize: 100,
  binaryType: 'arraybuffer',
};

// ============================================================================
// WEBSOCKET SERVICE
// ============================================================================

class WebSocketService {
  private config: WebSocketConfig = DEFAULT_CONFIG;
  private socket: WebSocket | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempt: number = 0;
  private reconnectTimeout: number | null = null;

  // Channels
  private channels: Map<string, Channel> = new Map();

  // Message handling
  private messageQueue: WebSocketMessage[] = [];
  private pendingRequests: Map<string, PendingRequest> = new Map();

  // Heartbeat
  private heartbeatInterval: number | null = null;
  private heartbeatTimeout: number | null = null;
  private lastHeartbeat: number = 0;

  // Event handlers
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    // Setup visibility change handler for reconnection
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.state === 'disconnected' && this.config.url) {
          this.connect(this.config.url);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // CONNECTION
  // --------------------------------------------------------------------------

  /**
   * Connect to WebSocket server
   */
  public connect(url: string, config?: Partial<WebSocketConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.config = { ...DEFAULT_CONFIG, ...config, url };
      this.state = 'connecting';
      this.emit('connecting', { url });

      try {
        this.socket = new WebSocket(url, this.config.protocols);
        this.socket.binaryType = this.config.binaryType;

        this.socket.onopen = () => {
          this.handleOpen();
          resolve();
        };

        this.socket.onclose = (event) => {
          this.handleClose(event);
          if (this.state === 'connecting') {
            reject(new Error('Connection failed'));
          }
        };

        this.socket.onerror = (event) => {
          this.handleError(event);
          if (this.state === 'connecting') {
            reject(new Error('Connection error'));
          }
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

      } catch (error) {
        this.state = 'error';
        this.emit('error', { error });
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    this.state = 'disconnected';
    this.emit('disconnected', {});
    logger.info('[WebSocket] Disconnected');
  }

  /**
   * Get connection state
   */
  public getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === 'connected' && this.socket?.readyState === WebSocket.OPEN;
  }

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  private handleOpen(): void {
    this.state = 'connected';
    this.reconnectAttempt = 0;

    // Start heartbeat
    this.startHeartbeat();

    // Rejoin channels
    this.rejoinChannels();

    // Flush message queue
    this.flushMessageQueue();

    this.emit('connected', {});
    logger.info('[WebSocket] Connected');
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();
    this.socket = null;

    if (event.code === 1000) {
      this.state = 'disconnected';
      this.emit('disconnected', { code: event.code, reason: event.reason });
    } else if (this.config.reconnect && this.reconnectAttempt < this.config.reconnectAttempts) {
      this.state = 'reconnecting';
      this.scheduleReconnect();
    } else {
      this.state = 'disconnected';
      this.emit('disconnected', { code: event.code, reason: event.reason });
    }

    logger.info('[WebSocket] Closed:', event.code, event.reason);
  }

  private handleError(event: Event): void {
    logger.error('[WebSocket] Error:', event);
    this.emit('error', { event });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      let message: WebSocketMessage;

      if (event.data instanceof ArrayBuffer) {
        // Binary message
        const decoder = new TextDecoder();
        message = JSON.parse(decoder.decode(event.data));
      } else {
        message = JSON.parse(event.data);
      }

      // Handle heartbeat response
      if (message.type === 'heartbeat') {
        this.handleHeartbeatResponse();
        return;
      }

      // Handle request response
      if (message.type === 'response') {
        this.handleResponse(message);
        return;
      }

      // Dispatch to channel subscribers
      if (message.channel) {
        this.dispatchToChannel(message);
      }

      // Emit general message event
      this.emit('message', { message });

      // Emit event-specific handlers
      if (message.event) {
        this.emit(message.event, message.payload);
      }

    } catch (error) {
      logger.error('[WebSocket] Message parse error:', error);
    }
  }

  // --------------------------------------------------------------------------
  // MESSAGING
  // --------------------------------------------------------------------------

  /**
   * Send message
   */
  public send<T>(type: MessageType, payload: T, channel?: string, event?: string): string {
    const message: WebSocketMessage<T> = {
      id: this.generateId(),
      type,
      channel,
      event,
      payload,
      timestamp: Date.now(),
    };

    if (this.isConnected()) {
      this.sendRaw(message);
    } else {
      this.queueMessage(message);
    }

    return message.id;
  }

  /**
   * Send and wait for response
   */
  public request<T, R>(payload: T, timeout: number = 10000): Promise<R> {
    return new Promise((resolve, reject) => {
      const id = this.send('request', payload);

      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, timeout);

      this.pendingRequests.set(id, {
        id,
        resolve: (value) => {
          clearTimeout(timeoutId);
          resolve(value as R);
        },
        reject: (reason) => {
          clearTimeout(timeoutId);
          reject(reason);
        },
        timeout: timeoutId,
      });
    });
  }

  /**
   * Publish to channel
   */
  public publish<T>(channel: string, event: string, payload: T): void {
    this.send('publish', payload, channel, event);
  }

  /**
   * Broadcast to all
   */
  public broadcast<T>(event: string, payload: T): void {
    this.send('broadcast', payload, undefined, event);
  }

  private sendRaw(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      logger.error('[WebSocket] Send error:', error);
      this.queueMessage(message);
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message);

    // Trim queue if needed
    while (this.messageQueue.length > this.config.messageQueueSize) {
      this.messageQueue.shift();
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendRaw(message);
      }
    }
  }

  private handleResponse(message: WebSocketMessage): void {
    const pending = this.pendingRequests.get(message.id);
    if (pending) {
      this.pendingRequests.delete(message.id);
      pending.resolve(message.payload);
    }
  }

  // --------------------------------------------------------------------------
  // CHANNELS
  // --------------------------------------------------------------------------

  /**
   * Subscribe to channel
   */
  public subscribe(channel: string, handler: (message: WebSocketMessage) => void): () => void {
    let ch = this.channels.get(channel);

    if (!ch) {
      ch = {
        name: channel,
        subscribers: new Set(),
        joined: false,
      };
      this.channels.set(channel, ch);
    }

    ch.subscribers.add(handler);

    // Join channel if not already
    if (!ch.joined && this.isConnected()) {
      this.joinChannel(channel);
    }

    // Return unsubscribe function
    return () => {
      ch?.subscribers.delete(handler);
      if (ch?.subscribers.size === 0) {
        this.leaveChannel(channel);
      }
    };
  }

  /**
   * Get channel
   */
  public getChannel(channel: string): Channel | undefined {
    return this.channels.get(channel);
  }

  private joinChannel(channel: string): void {
    const ch = this.channels.get(channel);
    if (!ch || ch.joined) return;

    this.send('subscribe', { channel });
    ch.joined = true;

    logger.debug('[WebSocket] Joined channel:', channel);
  }

  private leaveChannel(channel: string): void {
    const ch = this.channels.get(channel);
    if (!ch || !ch.joined) return;

    this.send('unsubscribe', { channel });
    ch.joined = false;
    this.channels.delete(channel);

    logger.debug('[WebSocket] Left channel:', channel);
  }

  private rejoinChannels(): void {
    this.channels.forEach((ch, name) => {
      if (ch.subscribers.size > 0) {
        ch.joined = false;
        this.joinChannel(name);
      }
    });
  }

  private dispatchToChannel(message: WebSocketMessage): void {
    const ch = this.channels.get(message.channel!);
    if (!ch) return;

    ch.lastMessage = message;
    ch.subscribers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        logger.error('[WebSocket] Channel handler error:', error);
      }
    });
  }

  // --------------------------------------------------------------------------
  // HEARTBEAT
  // --------------------------------------------------------------------------

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private sendHeartbeat(): void {
    if (!this.isConnected()) return;

    this.lastHeartbeat = Date.now();
    this.send('heartbeat', { timestamp: this.lastHeartbeat });

    // Set timeout for response
    this.heartbeatTimeout = window.setTimeout(() => {
      logger.warn('[WebSocket] Heartbeat timeout');
      this.socket?.close(4000, 'Heartbeat timeout');
    }, this.config.heartbeatTimeout);
  }

  private handleHeartbeatResponse(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // --------------------------------------------------------------------------
  // RECONNECTION
  // --------------------------------------------------------------------------

  private scheduleReconnect(): void {
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempt),
      this.config.reconnectDelayMax
    );

    this.emit('reconnecting', { attempt: this.reconnectAttempt + 1, delay });

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempt++;
      logger.info('[WebSocket] Reconnecting, attempt:', this.reconnectAttempt);

      this.connect(this.config.url).catch(() => {
        // Reconnection handled in handleClose
      });
    }, delay);
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

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  /**
   * Subscribe once
   */
  public once(event: string, handler: Function): () => void {
    const wrapper = (...args: unknown[]) => {
      handler(...args);
      this.eventHandlers.get(event)?.delete(wrapper);
    };
    return this.on(event, wrapper);
  }

  /**
   * Remove event handler
   */
  public off(event: string, handler?: Function): void {
    if (handler) {
      this.eventHandlers.get(event)?.delete(handler);
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('[WebSocket] Event handler error:', event, error);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const websocketService = new WebSocketService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for WebSocket connection
 */
export function useWebSocket(url?: string, config?: Partial<WebSocketConfig>) {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) return;

    const unsubConnected = websocketService.on('connected', () => {
      setState('connected');
      setError(null);
    });

    const unsubDisconnected = websocketService.on('disconnected', () => {
      setState('disconnected');
    });

    const unsubReconnecting = websocketService.on('reconnecting', () => {
      setState('reconnecting');
    });

    const unsubError = websocketService.on('error', ({ error }: { error: Error }) => {
      setState('error');
      setError(error);
    });

    websocketService.connect(url, config).catch(setError);

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubReconnecting();
      unsubError();
    };
  }, [url, config]);

  const send = useCallback(<T>(payload: T, event?: string) => {
    return websocketService.send('publish', payload, undefined, event);
  }, []);

  const request = useCallback(<T, R>(payload: T, timeout?: number) => {
    return websocketService.request<T, R>(payload, timeout);
  }, []);

  return {
    state,
    isConnected: state === 'connected',
    error,
    send,
    request,
    disconnect: websocketService.disconnect.bind(websocketService),
  };
}

/**
 * Hook for channel subscription
 */
export function useChannel<T>(channel: string) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage<T> | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage<T>[]>([]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe(channel, (message) => {
      setLastMessage(message as WebSocketMessage<T>);
      setMessages(prev => [...prev.slice(-99), message as WebSocketMessage<T>]);
    });

    return unsubscribe;
  }, [channel]);

  const publish = useCallback(<P>(event: string, payload: P) => {
    websocketService.publish(channel, event, payload);
  }, [channel]);

  return {
    lastMessage,
    messages,
    publish,
    clear: () => setMessages([]),
  };
}

/**
 * Hook for WebSocket events
 */
export function useWebSocketEvent<T>(event: string, handler: (data: T) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = websocketService.on(event, (data: unknown) => {
      handlerRef.current(data as T);
    });

    return unsubscribe;
  }, [event]);
}

/**
 * Hook for connection status
 */
export function useConnectionStatus() {
  const [status, setStatus] = useState({
    state: websocketService.getState(),
    isConnected: websocketService.isConnected(),
    reconnectAttempt: 0,
  });

  useEffect(() => {
    const handlers = [
      websocketService.on('connected', () => {
        setStatus({ state: 'connected', isConnected: true, reconnectAttempt: 0 });
      }),
      websocketService.on('disconnected', () => {
        setStatus({ state: 'disconnected', isConnected: false, reconnectAttempt: 0 });
      }),
      websocketService.on('reconnecting', ({ attempt }: { attempt: number }) => {
        setStatus({ state: 'reconnecting', isConnected: false, reconnectAttempt: attempt });
      }),
      websocketService.on('error', () => {
        setStatus(s => ({ ...s, state: 'error', isConnected: false }));
      }),
    ];

    return () => handlers.forEach(unsub => unsub());
  }, []);

  return status;
}

export default websocketService;
