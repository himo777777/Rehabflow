/**
 * Service Worker Registration
 * Handles PWA installation and updates
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export function registerServiceWorker(config: ServiceWorkerConfig = {}): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('[SW] Registration successful:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Every hour

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  console.log('[SW] New content available, refresh to update');
                  config.onUpdate?.(registration);
                } else {
                  // Content is cached for offline use
                  console.log('[SW] Content cached for offline use');
                  config.onSuccess?.(registration);
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('[SW] Registration failed:', error);
        });

      // Handle online/offline events
      window.addEventListener('online', () => {
        console.log('[SW] Back online');
        config.onOnline?.();
      });

      window.addEventListener('offline', () => {
        console.log('[SW] Gone offline');
        config.onOffline?.();
      });
    });
  }
}

export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW] Unregister error:', error);
      });
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[SW] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if app is installed as PWA
 */
export function isInstalledPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-ignore - iOS Safari specific
    window.navigator.standalone === true
  );
}

/**
 * Prompt user to install PWA (if supported)
 */
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function setupInstallPrompt(
  onCanInstall?: () => void,
  onInstalled?: () => void
): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[SW] Install prompt available');
    onCanInstall?.();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('[SW] App installed');
    onInstalled?.();
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn('[SW] Install prompt not available');
    return false;
  }

  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('[SW] User accepted install prompt');
    deferredPrompt = null;
    return true;
  }

  console.log('[SW] User dismissed install prompt');
  return false;
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}
