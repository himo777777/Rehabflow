/**
 * Deep Linking Service - Sprint 5.18
 *
 * Handle deep links and universal links.
 * Features:
 * - URL parsing and routing
 * - Query parameter handling
 * - State restoration
 * - Share links generation
 * - QR code deep links
 * - Campaign tracking
 * - Deferred deep linking
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type DeepLinkType = 'exercise' | 'program' | 'session' | 'profile' | 'invite' | 'share' | 'custom';

export interface DeepLink {
  type: DeepLinkType;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash?: string;
  timestamp: number;
  source?: string;
  campaign?: CampaignParams;
}

export interface CampaignParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface DeepLinkRoute {
  pattern: string | RegExp;
  type: DeepLinkType;
  handler: (link: DeepLink) => void | Promise<void>;
  requiresAuth?: boolean;
  parseParams?: (matches: string[]) => Record<string, string>;
}

export interface ShareLinkConfig {
  baseUrl: string;
  includeTimestamp?: boolean;
  includeCampaign?: boolean;
  shortener?: (url: string) => Promise<string>;
}

export interface DeferredDeepLink {
  link: DeepLink;
  stored: string;
  handled: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_DEFERRED = 'rehabflow-deferred-deeplink';
const STORAGE_KEY_HISTORY = 'rehabflow-deeplink-history';
const APP_SCHEME = 'rehabflow://';
const WEB_BASE_URL = 'https://rehabflow.app';

// ============================================================================
// DEEP LINKING SERVICE
// ============================================================================

class DeepLinkingService {
  private routes: DeepLinkRoute[] = [];
  private history: DeepLink[] = [];
  private deferredLink: DeferredDeepLink | null = null;
  private isInitialized: boolean = false;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private shareConfig: ShareLinkConfig = { baseUrl: WEB_BASE_URL };

  constructor() {
    this.loadHistory();
    this.loadDeferredLink();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Initialize deep linking
   */
  public init(config?: { shareConfig?: Partial<ShareLinkConfig> }): void {
    if (this.isInitialized) return;

    if (config?.shareConfig) {
      this.shareConfig = { ...this.shareConfig, ...config.shareConfig };
    }

    this.registerDefaultRoutes();
    this.setupEventListeners();
    this.handleInitialLink();

    this.isInitialized = true;
    logger.info('[DeepLinking] Initialized');
  }

  private loadHistory(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('[DeepLinking] Failed to load history:', error);
    }
  }

  private saveHistory(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const recent = this.history.slice(-50);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(recent));
    } catch (error) {
      logger.error('[DeepLinking] Failed to save history:', error);
    }
  }

  private loadDeferredLink(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_DEFERRED);
      if (stored) {
        this.deferredLink = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('[DeepLinking] Failed to load deferred link:', error);
    }
  }

  private saveDeferredLink(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      if (this.deferredLink) {
        localStorage.setItem(STORAGE_KEY_DEFERRED, JSON.stringify(this.deferredLink));
      } else {
        localStorage.removeItem(STORAGE_KEY_DEFERRED);
      }
    } catch (error) {
      logger.error('[DeepLinking] Failed to save deferred link:', error);
    }
  }

  private registerDefaultRoutes(): void {
    // Exercise deep link
    this.registerRoute({
      pattern: /^\/exercise\/([a-zA-Z0-9-]+)$/,
      type: 'exercise',
      handler: (link) => this.emit('navigate', { path: `/exercises/${link.params.id}` }),
      parseParams: ([, id]) => ({ id }),
    });

    // Program deep link
    this.registerRoute({
      pattern: /^\/program\/([a-zA-Z0-9-]+)$/,
      type: 'program',
      handler: (link) => this.emit('navigate', { path: `/programs/${link.params.id}` }),
      parseParams: ([, id]) => ({ id }),
    });

    // Session deep link
    this.registerRoute({
      pattern: /^\/session\/([a-zA-Z0-9-]+)$/,
      type: 'session',
      handler: (link) => this.emit('navigate', { path: `/sessions/${link.params.id}` }),
      requiresAuth: true,
      parseParams: ([, id]) => ({ id }),
    });

    // Profile deep link
    this.registerRoute({
      pattern: /^\/profile\/([a-zA-Z0-9-]+)$/,
      type: 'profile',
      handler: (link) => this.emit('navigate', { path: `/profile/${link.params.id}` }),
      parseParams: ([, id]) => ({ id }),
    });

    // Invite deep link
    this.registerRoute({
      pattern: /^\/invite\/([a-zA-Z0-9-]+)$/,
      type: 'invite',
      handler: (link) => this.emit('invite', { code: link.params.code }),
      parseParams: ([, code]) => ({ code }),
    });

    // Share deep link
    this.registerRoute({
      pattern: /^\/share\/([a-zA-Z0-9-]+)$/,
      type: 'share',
      handler: (link) => this.emit('share', { id: link.params.id }),
      parseParams: ([, id]) => ({ id }),
    });
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Handle popstate for browser navigation
    window.addEventListener('popstate', () => {
      this.handleCurrentUrl();
    });

    // Handle custom protocol links (if app supports)
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'deeplink') {
        this.handleUrl(event.data.url);
      }
    });
  }

  private handleInitialLink(): void {
    if (typeof window === 'undefined') return;

    // Check URL on load
    this.handleCurrentUrl();

    // Check for deferred link
    if (this.deferredLink && !this.deferredLink.handled) {
      setTimeout(() => {
        this.handleDeferredLink();
      }, 1000);
    }
  }

  // --------------------------------------------------------------------------
  // ROUTE MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Register a deep link route
   */
  public registerRoute(route: DeepLinkRoute): void {
    this.routes.push(route);
    logger.debug('[DeepLinking] Route registered:', route.type);
  }

  /**
   * Unregister a route by type
   */
  public unregisterRoute(type: DeepLinkType): void {
    this.routes = this.routes.filter(r => r.type !== type);
  }

  /**
   * Get all registered routes
   */
  public getRoutes(): DeepLinkRoute[] {
    return [...this.routes];
  }

  // --------------------------------------------------------------------------
  // URL PARSING
  // --------------------------------------------------------------------------

  /**
   * Parse URL into DeepLink
   */
  public parseUrl(url: string): DeepLink | null {
    try {
      // Handle app scheme
      let parsedUrl: URL;
      if (url.startsWith(APP_SCHEME)) {
        const webUrl = url.replace(APP_SCHEME, `${WEB_BASE_URL}/`);
        parsedUrl = new URL(webUrl);
      } else {
        parsedUrl = new URL(url, WEB_BASE_URL);
      }

      const path = parsedUrl.pathname;
      const query = Object.fromEntries(parsedUrl.searchParams.entries());
      const hash = parsedUrl.hash.slice(1) || undefined;

      // Extract campaign params
      const campaign: CampaignParams = {};
      if (query.utm_source) campaign.source = query.utm_source;
      if (query.utm_medium) campaign.medium = query.utm_medium;
      if (query.utm_campaign) campaign.campaign = query.utm_campaign;
      if (query.utm_term) campaign.term = query.utm_term;
      if (query.utm_content) campaign.content = query.utm_content;

      // Find matching route
      let type: DeepLinkType = 'custom';
      let params: Record<string, string> = {};

      for (const route of this.routes) {
        const pattern = typeof route.pattern === 'string'
          ? new RegExp(`^${route.pattern}$`)
          : route.pattern;

        const matches = path.match(pattern);
        if (matches) {
          type = route.type;
          params = route.parseParams ? route.parseParams(matches) : {};
          break;
        }
      }

      return {
        type,
        path,
        params,
        query,
        hash,
        timestamp: Date.now(),
        source: query.source,
        campaign: Object.keys(campaign).length > 0 ? campaign : undefined,
      };
    } catch (error) {
      logger.error('[DeepLinking] Failed to parse URL:', error);
      return null;
    }
  }

  /**
   * Handle current URL
   */
  public handleCurrentUrl(): void {
    if (typeof window === 'undefined') return;
    this.handleUrl(window.location.href);
  }

  /**
   * Handle URL
   */
  public handleUrl(url: string): void {
    const link = this.parseUrl(url);
    if (!link) return;

    this.handleDeepLink(link);
  }

  /**
   * Handle deep link
   */
  public handleDeepLink(link: DeepLink): void {
    // Add to history
    this.history.push(link);
    this.saveHistory();

    // Find matching route
    const route = this.routes.find(r => r.type === link.type);
    if (!route) {
      logger.warn('[DeepLinking] No route found for type:', link.type);
      this.emit('unhandled', { link });
      return;
    }

    // Check auth requirement
    if (route.requiresAuth && !this.isAuthenticated()) {
      this.deferLink(link);
      this.emit('auth-required', { link });
      return;
    }

    // Execute handler
    try {
      route.handler(link);
      this.emit('handled', { link });
      logger.info('[DeepLinking] Link handled:', link.type, link.path);
    } catch (error) {
      logger.error('[DeepLinking] Handler error:', error);
      this.emit('error', { link, error });
    }
  }

  // --------------------------------------------------------------------------
  // DEFERRED DEEP LINKING
  // --------------------------------------------------------------------------

  /**
   * Defer link for later handling
   */
  public deferLink(link: DeepLink): void {
    this.deferredLink = {
      link,
      stored: new Date().toISOString(),
      handled: false,
    };
    this.saveDeferredLink();
    logger.info('[DeepLinking] Link deferred:', link.type);
  }

  /**
   * Handle deferred link
   */
  public handleDeferredLink(): void {
    if (!this.deferredLink || this.deferredLink.handled) return;

    const { link } = this.deferredLink;
    this.deferredLink.handled = true;
    this.saveDeferredLink();

    this.handleDeepLink(link);
  }

  /**
   * Get deferred link
   */
  public getDeferredLink(): DeferredDeepLink | null {
    return this.deferredLink;
  }

  /**
   * Clear deferred link
   */
  public clearDeferredLink(): void {
    this.deferredLink = null;
    this.saveDeferredLink();
  }

  // --------------------------------------------------------------------------
  // SHARE LINK GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate share link
   */
  public generateShareLink(
    type: DeepLinkType,
    id: string,
    options?: {
      params?: Record<string, string>;
      campaign?: CampaignParams;
      useAppScheme?: boolean;
    }
  ): string {
    const baseUrl = options?.useAppScheme ? APP_SCHEME : this.shareConfig.baseUrl;
    const path = this.getPathForType(type, id);

    const url = new URL(path, baseUrl);

    // Add params
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    // Add campaign params
    if (options?.campaign || this.shareConfig.includeCampaign) {
      const campaign = options?.campaign || {};
      if (campaign.source) url.searchParams.set('utm_source', campaign.source);
      if (campaign.medium) url.searchParams.set('utm_medium', campaign.medium);
      if (campaign.campaign) url.searchParams.set('utm_campaign', campaign.campaign);
      if (campaign.term) url.searchParams.set('utm_term', campaign.term);
      if (campaign.content) url.searchParams.set('utm_content', campaign.content);
    }

    // Add timestamp
    if (this.shareConfig.includeTimestamp) {
      url.searchParams.set('t', Date.now().toString(36));
    }

    return url.toString();
  }

  /**
   * Generate short share link
   */
  public async generateShortLink(
    type: DeepLinkType,
    id: string,
    options?: {
      params?: Record<string, string>;
      campaign?: CampaignParams;
    }
  ): Promise<string> {
    const fullUrl = this.generateShareLink(type, id, options);

    if (this.shareConfig.shortener) {
      try {
        return await this.shareConfig.shortener(fullUrl);
      } catch (error) {
        logger.error('[DeepLinking] Shortener failed:', error);
      }
    }

    return fullUrl;
  }

  private getPathForType(type: DeepLinkType, id: string): string {
    const paths: Record<DeepLinkType, string> = {
      exercise: `/exercise/${id}`,
      program: `/program/${id}`,
      session: `/session/${id}`,
      profile: `/profile/${id}`,
      invite: `/invite/${id}`,
      share: `/share/${id}`,
      custom: `/${id}`,
    };

    return paths[type] || `/${type}/${id}`;
  }

  // --------------------------------------------------------------------------
  // QR CODE GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate QR code data URL
   */
  public generateQRCode(
    type: DeepLinkType,
    id: string,
    options?: {
      size?: number;
      campaign?: CampaignParams;
    }
  ): string {
    const url = this.generateShareLink(type, id, { campaign: options?.campaign });
    const size = options?.size || 200;

    // Return a placeholder - in production, use a QR library like qrcode
    // This generates an SVG placeholder
    const encoded = encodeURIComponent(url);

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="white"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" font-family="system-ui" font-size="12">
          QR: ${type}/${id}
        </text>
        <text x="${size/2}" y="${size/2 + 20}" text-anchor="middle" font-family="system-ui" font-size="8" fill="#666">
          ${encoded.substring(0, 30)}...
        </text>
      </svg>
    `)}`;
  }

  // --------------------------------------------------------------------------
  // CAMPAIGN TRACKING
  // --------------------------------------------------------------------------

  /**
   * Track campaign conversion
   */
  public trackCampaign(link: DeepLink): void {
    if (!link.campaign) return;

    this.emit('campaign-tracked', {
      link,
      campaign: link.campaign,
      timestamp: new Date().toISOString(),
    });

    logger.info('[DeepLinking] Campaign tracked:', link.campaign.campaign);
  }

  /**
   * Get campaign stats
   */
  public getCampaignStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.history.forEach(link => {
      if (link.campaign?.campaign) {
        const key = link.campaign.campaign;
        stats[key] = (stats[key] || 0) + 1;
      }
    });

    return stats;
  }

  // --------------------------------------------------------------------------
  // HISTORY
  // --------------------------------------------------------------------------

  /**
   * Get deep link history
   */
  public getHistory(): DeepLink[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.history = [];
    this.saveHistory();
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

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('[DeepLinking] Event handler error:', error);
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------

  private isAuthenticated(): boolean {
    // Check for auth token in storage
    return !!localStorage.getItem('rehabflow-auth-token');
  }

  /**
   * Set share config
   */
  public setShareConfig(config: Partial<ShareLinkConfig>): void {
    this.shareConfig = { ...this.shareConfig, ...config };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const deepLinkingService = new DeepLinkingService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for deep linking
 */
export function useDeepLinking() {
  const [lastLink, setLastLink] = useState<DeepLink | null>(null);

  useEffect(() => {
    const unsubHandled = deepLinkingService.on('handled', ({ link }: { link: DeepLink }) => {
      setLastLink(link);
    });

    return () => {
      unsubHandled();
    };
  }, []);

  const generateShareLink = useCallback((
    type: DeepLinkType,
    id: string,
    options?: { params?: Record<string, string>; campaign?: CampaignParams }
  ) => {
    return deepLinkingService.generateShareLink(type, id, options);
  }, []);

  const handleUrl = useCallback((url: string) => {
    deepLinkingService.handleUrl(url);
  }, []);

  return {
    lastLink,
    generateShareLink,
    handleUrl,
    history: deepLinkingService.getHistory(),
    deferredLink: deepLinkingService.getDeferredLink(),
    handleDeferredLink: deepLinkingService.handleDeferredLink.bind(deepLinkingService),
    clearDeferredLink: deepLinkingService.clearDeferredLink.bind(deepLinkingService),
  };
}

/**
 * Hook for share links
 */
export function useShareLink(type: DeepLinkType, id: string, campaign?: CampaignParams) {
  const [shareUrl, setShareUrl] = useState('');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const url = deepLinkingService.generateShareLink(type, id, { campaign });
    setShareUrl(url);
    setQrCode(deepLinkingService.generateQRCode(type, id, { campaign }));
  }, [type, id, campaign]);

  const share = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'RehabFlow',
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  }, [shareUrl]);

  return {
    shareUrl,
    qrCode,
    share,
  };
}

/**
 * Hook for navigation from deep links
 */
export function useDeepLinkNavigation(navigate: (path: string) => void) {
  useEffect(() => {
    const unsubscribe = deepLinkingService.on('navigate', ({ path }: { path: string }) => {
      navigate(path);
    });

    return unsubscribe;
  }, [navigate]);
}

export default deepLinkingService;
