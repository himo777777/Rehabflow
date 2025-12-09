/**
 * ServiceWorkerService - Sprint 5.20
 *
 * Avancerad service worker-hantering för RehabFlow med:
 * - Dynamisk cache-strategi
 * - Background sync
 * - Push notifications
 * - Precaching och runtime caching
 * - Update management
 * - Offline fallbacks
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CacheStrategy =
  | 'cache-first'
  | 'network-first'
  | 'stale-while-revalidate'
  | 'network-only'
  | 'cache-only';

export interface CacheRoute {
  pattern: RegExp | string;
  strategy: CacheStrategy;
  cacheName?: string;
  maxAge?: number;
  maxEntries?: number;
  networkTimeoutSeconds?: number;
  plugins?: CachePlugin[];
}

export interface CachePlugin {
  name: string;
  cacheWillUpdate?: (response: Response) => Promise<Response | null>;
  cachedResponseWillBeUsed?: (response: Response | null) => Promise<Response | null>;
  requestWillFetch?: (request: Request) => Promise<Request>;
  fetchDidFail?: (request: Request, error: Error) => Promise<void>;
  fetchDidSucceed?: (request: Request, response: Response) => Promise<Response>;
}

export interface PrecacheEntry {
  url: string;
  revision?: string;
  integrity?: string;
}

export interface BackgroundSyncConfig {
  tag: string;
  maxRetentionTime?: number;
  minInterval?: number;
}

export interface PushSubscriptionConfig {
  applicationServerKey: string;
  userVisibleOnly?: boolean;
}

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  vibrate?: number[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface SyncTask {
  id: string;
  tag: string;
  data: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
  updateAvailable: boolean;
  lastUpdate: Date | null;
  cacheSize: number;
  offlineReady: boolean;
}

export interface CacheManifest {
  version: string;
  precache: PrecacheEntry[];
  routes: CacheRoute[];
  offlineFallback: string;
}

export interface MessagePayload {
  type: string;
  data?: unknown;
}

// ============================================================================
// SERVICE WORKER SERVICE
// ============================================================================

class ServiceWorkerService {
  private static instance: ServiceWorkerService;

  private registration: ServiceWorkerRegistration | null = null;
  private messageHandlers: Map<string, Set<(data: unknown) => void>> = new Map();
  private syncTasks: Map<string, SyncTask> = new Map();
  private updateListeners: Set<() => void> = new Set();
  private statusListeners: Set<(status: ServiceWorkerStatus) => void> = new Set();
  private cacheRoutes: CacheRoute[] = [];
  private precacheManifest: PrecacheEntry[] = [];
  private offlineFallbackUrl: string = '/offline.html';
  private swUrl: string = '/sw.js';
  private swScope: string = '/';

  private constructor() {
    this.loadSyncTasks();
  }

  public static getInstance(): ServiceWorkerService {
    if (!ServiceWorkerService.instance) {
      ServiceWorkerService.instance = new ServiceWorkerService();
    }
    return ServiceWorkerService.instance;
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  /**
   * Registrera service worker
   */
  public async register(swUrl?: string, scope?: string): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Service Workers stöds inte i denna webbläsare');
      return null;
    }

    if (swUrl) this.swUrl = swUrl;
    if (scope) this.swScope = scope;

    try {
      this.registration = await navigator.serviceWorker.register(this.swUrl, {
        scope: this.swScope
      });

      console.log('Service Worker registrerad:', this.registration.scope);

      // Lyssna på uppdateringar
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Lyssna på meddelanden
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleMessage(event.data);
      });

      // Kontrollera efter uppdatering direkt
      await this.checkForUpdate();

      // Skicka cache-konfiguration till SW
      await this.sendCacheConfig();

      this.notifyStatusChange();

      return this.registration;
    } catch (error) {
      console.error('Service Worker registrering misslyckades:', error);
      return null;
    }
  }

  /**
   * Avregistrera service worker
   */
  public async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        this.notifyStatusChange();
      }
      return success;
    } catch (error) {
      console.error('Avregistrering misslyckades:', error);
      return false;
    }
  }

  /**
   * Kontrollera om SW stöds
   */
  public isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  // ============================================================================
  // UPDATE MANAGEMENT
  // ============================================================================

  /**
   * Kontrollera efter uppdatering
   */
  public async checkForUpdate(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return this.registration.waiting !== null;
    } catch (error) {
      console.error('Uppdateringskontroll misslyckades:', error);
      return false;
    }
  }

  /**
   * Applicera väntande uppdatering
   */
  public async applyUpdate(): Promise<void> {
    if (!this.registration?.waiting) return;

    // Skicka meddelande till väntande SW att ta över
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Vänta på att den nya SW tar över
    return new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve();
        // Ladda om sidan för att använda nya SW
        window.location.reload();
      }, { once: true });
    });
  }

  /**
   * Lyssna på uppdateringar
   */
  public onUpdateAvailable(callback: () => void): () => void {
    this.updateListeners.add(callback);
    return () => this.updateListeners.delete(callback);
  }

  private handleUpdateFound(): void {
    const installingWorker = this.registration?.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // Ny version tillgänglig
        this.updateListeners.forEach(callback => callback());
        this.notifyStatusChange();
      }
    });
  }

  // ============================================================================
  // CACHING STRATEGIES
  // ============================================================================

  /**
   * Lägg till cache-route
   */
  public addCacheRoute(route: CacheRoute): void {
    this.cacheRoutes.push(route);
    this.sendCacheConfig();
  }

  /**
   * Ta bort cache-route
   */
  public removeCacheRoute(pattern: RegExp | string): void {
    const patternStr = pattern.toString();
    this.cacheRoutes = this.cacheRoutes.filter(
      r => r.pattern.toString() !== patternStr
    );
    this.sendCacheConfig();
  }

  /**
   * Sätt precache-manifest
   */
  public setPrecacheManifest(entries: PrecacheEntry[]): void {
    this.precacheManifest = entries;
    this.sendCacheConfig();
  }

  /**
   * Sätt offline fallback URL
   */
  public setOfflineFallback(url: string): void {
    this.offlineFallbackUrl = url;
    this.sendCacheConfig();
  }

  private async sendCacheConfig(): Promise<void> {
    if (!this.registration?.active) return;

    const manifest: CacheManifest = {
      version: this.generateVersion(),
      precache: this.precacheManifest,
      routes: this.cacheRoutes.map(r => ({
        ...r,
        pattern: r.pattern.toString()
      })),
      offlineFallback: this.offlineFallbackUrl
    };

    this.postMessage({
      type: 'CACHE_CONFIG',
      data: manifest
    });
  }

  private generateVersion(): string {
    const hash = this.precacheManifest
      .map(e => `${e.url}:${e.revision || ''}`)
      .join('|');

    let hashNum = 0;
    for (let i = 0; i < hash.length; i++) {
      hashNum = ((hashNum << 5) - hashNum) + hash.charCodeAt(i);
      hashNum |= 0;
    }

    return Math.abs(hashNum).toString(36);
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Hämta cache-storlek
   */
  public async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch {
      return 0;
    }
  }

  /**
   * Rensa specifik cache
   */
  public async clearCache(cacheName?: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
      if (cacheName) {
        return await caches.delete(cacheName);
      }

      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lista alla cachar
   */
  public async listCaches(): Promise<string[]> {
    if (!('caches' in window)) return [];
    return await caches.keys();
  }

  /**
   * Hämta cachade URLs för en specifik cache
   */
  public async getCachedUrls(cacheName: string): Promise<string[]> {
    if (!('caches' in window)) return [];

    try {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      return requests.map(r => r.url);
    } catch {
      return [];
    }
  }

  /**
   * Lägg till URL i cache
   */
  public async addToCache(cacheName: string, urls: string[]): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open(cacheName);
    await cache.addAll(urls);
  }

  /**
   * Ta bort URL från cache
   */
  public async removeFromCache(cacheName: string, url: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    const cache = await caches.open(cacheName);
    return await cache.delete(url);
  }

  // ============================================================================
  // BACKGROUND SYNC
  // ============================================================================

  /**
   * Registrera background sync
   */
  public async registerBackgroundSync(config: BackgroundSyncConfig): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      console.warn('Background Sync stöds inte');
      return false;
    }

    try {
      // @ts-expect-error - sync API
      await this.registration.sync.register(config.tag);
      return true;
    } catch (error) {
      console.error('Background sync registrering misslyckades:', error);
      return false;
    }
  }

  /**
   * Lägg till sync-uppgift
   */
  public addSyncTask(tag: string, data: unknown, maxRetries: number = 3): string {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const task: SyncTask = {
      id,
      tag,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
      status: 'pending'
    };

    this.syncTasks.set(id, task);
    this.saveSyncTasks();

    // Försök registrera background sync
    this.registerBackgroundSync({ tag });

    return id;
  }

  /**
   * Hämta sync-uppgifter
   */
  public getSyncTasks(tag?: string): SyncTask[] {
    const tasks = Array.from(this.syncTasks.values());
    if (tag) {
      return tasks.filter(t => t.tag === tag);
    }
    return tasks;
  }

  /**
   * Ta bort sync-uppgift
   */
  public removeSyncTask(id: string): void {
    this.syncTasks.delete(id);
    this.saveSyncTasks();
  }

  /**
   * Markera sync-uppgift som slutförd
   */
  public completeSyncTask(id: string): void {
    const task = this.syncTasks.get(id);
    if (task) {
      task.status = 'completed';
      this.syncTasks.set(id, task);
      this.saveSyncTasks();
    }
  }

  private saveSyncTasks(): void {
    const tasks = Array.from(this.syncTasks.entries());
    localStorage.setItem('rehabflow_sync_tasks', JSON.stringify(tasks));
  }

  private loadSyncTasks(): void {
    try {
      const stored = localStorage.getItem('rehabflow_sync_tasks');
      if (stored) {
        const tasks = JSON.parse(stored) as [string, SyncTask][];
        this.syncTasks = new Map(tasks);
      }
    } catch {
      // Ignorera fel
    }
  }

  // ============================================================================
  // PUSH NOTIFICATIONS
  // ============================================================================

  /**
   * Prenumerera på push-notiser
   */
  public async subscribeToPush(config: PushSubscriptionConfig): Promise<PushSubscription | null> {
    if (!this.registration || !('pushManager' in this.registration)) {
      console.warn('Push notifications stöds inte');
      return null;
    }

    try {
      // Kontrollera behörighet
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push-behörighet nekad');
        return null;
      }

      // Konvertera applicationServerKey till Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(config.applicationServerKey);

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: config.userVisibleOnly ?? true,
        applicationServerKey
      });

      return subscription;
    } catch (error) {
      console.error('Push-prenumeration misslyckades:', error);
      return null;
    }
  }

  /**
   * Avprenumerera från push
   */
  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        return await subscription.unsubscribe();
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Hämta aktuell push-prenumeration
   */
  public async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      return await this.registration.pushManager.getSubscription();
    } catch {
      return null;
    }
  }

  /**
   * Visa lokal notifikation
   */
  public async showNotification(config: NotificationConfig): Promise<void> {
    if (!this.registration) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    await this.registration.showNotification(config.title, {
      body: config.body,
      icon: config.icon || '/icons/icon-192x192.png',
      badge: config.badge || '/icons/badge-72x72.png',
      tag: config.tag,
      data: config.data,
      actions: config.actions,
      requireInteraction: config.requireInteraction,
      vibrate: config.vibrate
    });
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // ============================================================================
  // MESSAGING
  // ============================================================================

  /**
   * Skicka meddelande till service worker
   */
  public postMessage(message: MessagePayload): void {
    if (!this.registration?.active) return;
    this.registration.active.postMessage(message);
  }

  /**
   * Skicka meddelande och vänta på svar
   */
  public async sendMessage<T>(message: MessagePayload): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.registration?.active) {
        reject(new Error('Service Worker inte aktiv'));
        return;
      }

      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data as T);
        }
      };

      this.registration.active.postMessage(message, [messageChannel.port2]);
    });
  }

  /**
   * Lyssna på meddelanden från service worker
   */
  public onMessage(type: string, handler: (data: unknown) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  private handleMessage(message: MessagePayload): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message.data));
    }
  }

  // ============================================================================
  // STATUS
  // ============================================================================

  /**
   * Hämta service worker status
   */
  public async getStatus(): Promise<ServiceWorkerStatus> {
    const cacheSize = await this.getCacheSize();

    return {
      registered: this.registration !== null,
      active: this.registration?.active !== null,
      waiting: this.registration?.waiting !== null,
      installing: this.registration?.installing !== null,
      updateAvailable: this.registration?.waiting !== null,
      lastUpdate: this.getLastUpdateTime(),
      cacheSize,
      offlineReady: await this.isOfflineReady()
    };
  }

  /**
   * Lyssna på statusändringar
   */
  public onStatusChange(callback: (status: ServiceWorkerStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private async notifyStatusChange(): Promise<void> {
    const status = await this.getStatus();
    this.statusListeners.forEach(callback => callback(status));
  }

  private getLastUpdateTime(): Date | null {
    const stored = localStorage.getItem('rehabflow_sw_last_update');
    if (stored) {
      return new Date(stored);
    }
    return null;
  }

  private async isOfflineReady(): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
      const cacheNames = await caches.keys();
      return cacheNames.length > 0;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // NETWORK STATUS
  // ============================================================================

  /**
   * Kontrollera online-status
   */
  public isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Lyssna på nätverksändringar
   */
  public onNetworkChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  // ============================================================================
  // WORKBOX HELPERS
  // ============================================================================

  /**
   * Generera service worker kod
   */
  public generateServiceWorkerCode(): string {
    return `
// RehabFlow Service Worker
// Genererad automatiskt

const CACHE_VERSION = '${this.generateVersion()}';
const PRECACHE_NAME = 'precache-v' + CACHE_VERSION;
const RUNTIME_CACHE = 'runtime-cache';

// Precache-lista
const PRECACHE_URLS = ${JSON.stringify(this.precacheManifest.map(e => e.url), null, 2)};

// Cache-strategier
const CACHE_ROUTES = ${JSON.stringify(this.cacheRoutes.map(r => ({
  ...r,
  pattern: r.pattern.toString()
})), null, 2)};

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('precache-') && name !== PRECACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hitta matchande route
  const route = CACHE_ROUTES.find(r => {
    const pattern = new RegExp(r.pattern.slice(1, -1));
    return pattern.test(url.pathname);
  });

  if (route) {
    event.respondWith(handleStrategy(request, route));
  }
});

async function handleStrategy(request, route) {
  const cache = await caches.open(route.cacheName || RUNTIME_CACHE);

  switch (route.strategy) {
    case 'cache-first':
      return cacheFirst(request, cache, route);
    case 'network-first':
      return networkFirst(request, cache, route);
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, cache, route);
    case 'network-only':
      return fetch(request);
    case 'cache-only':
      return cache.match(request);
    default:
      return fetch(request);
  }
}

async function cacheFirst(request, cache, route) {
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cache, route) {
  try {
    const response = await fetchWithTimeout(request, route.networkTimeoutSeconds * 1000);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cache.match(request) || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cache, route) {
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

async function fetchWithTimeout(request, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout || 10000);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Message handler
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_CONFIG') {
    // Uppdatera cache-konfiguration dynamiskt
    const config = event.data.data;
    // Implementera dynamisk konfigurationsuppdatering
  }
});

// Push event
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'RehabFlow', {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data.data
    })
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('sync-')) {
    event.waitUntil(handleBackgroundSync(event.tag));
  }
});

async function handleBackgroundSync(tag) {
  // Implementera specifik sync-logik baserat på tag
  console.log('Background sync:', tag);
}
    `.trim();
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook för service worker status
 */
export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const service = ServiceWorkerService.getInstance();

  useEffect(() => {
    // Hämta initial status
    service.getStatus().then(setStatus);

    // Lyssna på statusändringar
    const unsubscribeStatus = service.onStatusChange(setStatus);

    // Lyssna på uppdateringar
    const unsubscribeUpdate = service.onUpdateAvailable(() => {
      setUpdateAvailable(true);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeUpdate();
    };
  }, []);

  const register = useCallback(async (swUrl?: string) => {
    return await service.register(swUrl);
  }, []);

  const applyUpdate = useCallback(async () => {
    await service.applyUpdate();
    setUpdateAvailable(false);
  }, []);

  const checkForUpdate = useCallback(async () => {
    const hasUpdate = await service.checkForUpdate();
    setUpdateAvailable(hasUpdate);
    return hasUpdate;
  }, []);

  return {
    status,
    updateAvailable,
    register,
    applyUpdate,
    checkForUpdate,
    isSupported: service.isSupported()
  };
}

/**
 * Hook för offline-status
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const service = ServiceWorkerService.getInstance();

  useEffect(() => {
    const unsubscribe = service.onNetworkChange(setIsOnline);
    return unsubscribe;
  }, []);

  return isOnline;
}

/**
 * Hook för push-notiser
 */
export function usePushNotifications(applicationServerKey: string) {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const service = ServiceWorkerService.getInstance();

  useEffect(() => {
    // Kontrollera aktuell behörighet
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Hämta aktuell prenumeration
    service.getPushSubscription().then(setSubscription);
  }, []);

  const subscribe = useCallback(async () => {
    const sub = await service.subscribeToPush({ applicationServerKey });
    setSubscription(sub);
    if (sub) setPermission('granted');
    return sub;
  }, [applicationServerKey]);

  const unsubscribe = useCallback(async () => {
    const success = await service.unsubscribeFromPush();
    if (success) setSubscription(null);
    return success;
  }, []);

  const showNotification = useCallback(async (config: NotificationConfig) => {
    await service.showNotification(config);
  }, []);

  return {
    subscription,
    permission,
    isSubscribed: subscription !== null,
    subscribe,
    unsubscribe,
    showNotification
  };
}

/**
 * Hook för background sync
 */
export function useBackgroundSync(tag: string) {
  const [tasks, setTasks] = useState<SyncTask[]>([]);
  const service = ServiceWorkerService.getInstance();

  useEffect(() => {
    // Hämta befintliga uppgifter
    setTasks(service.getSyncTasks(tag));
  }, [tag]);

  const addTask = useCallback((data: unknown, maxRetries?: number) => {
    const id = service.addSyncTask(tag, data, maxRetries);
    setTasks(service.getSyncTasks(tag));
    return id;
  }, [tag]);

  const completeTask = useCallback((id: string) => {
    service.completeSyncTask(id);
    setTasks(service.getSyncTasks(tag));
  }, [tag]);

  const removeTask = useCallback((id: string) => {
    service.removeSyncTask(id);
    setTasks(service.getSyncTasks(tag));
  }, [tag]);

  return {
    tasks,
    pendingCount: tasks.filter(t => t.status === 'pending').length,
    addTask,
    completeTask,
    removeTask
  };
}

/**
 * Hook för cache-hantering
 */
export function useCacheManagement() {
  const [caches, setCaches] = useState<string[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const service = ServiceWorkerService.getInstance();

  const refresh = useCallback(async () => {
    const [cacheList, size] = await Promise.all([
      service.listCaches(),
      service.getCacheSize()
    ]);
    setCaches(cacheList);
    setTotalSize(size);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearCache = useCallback(async (cacheName?: string) => {
    await service.clearCache(cacheName);
    await refresh();
  }, [refresh]);

  const addToCache = useCallback(async (cacheName: string, urls: string[]) => {
    await service.addToCache(cacheName, urls);
    await refresh();
  }, [refresh]);

  return {
    caches,
    totalSize,
    formattedSize: formatBytes(totalSize),
    clearCache,
    addToCache,
    refresh
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ============================================================================
// EXPORT
// ============================================================================

export const serviceWorkerService = ServiceWorkerService.getInstance();
export default serviceWorkerService;
