/**
 * Push Notifications Service for RehabFlow
 * Uses the Web Push API to send training reminders
 */

const VAPID_PUBLIC_KEY = ''; // Would be set in production

interface RehabNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription && VAPID_PUBLIC_KEY) {
      // Create new subscription
      const keyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray.buffer as ArrayBuffer
      });
    }

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

/**
 * Show a local notification (doesn't require push subscription)
 */
export async function showLocalNotification(options: RehabNotificationOptions): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const permission = await requestPermission();
    if (permission !== 'granted') {
      return false;
    }
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      tag: options.tag,
      data: options.data
    } as NotificationOptions);

    return true;
  } catch (error) {
    // Fallback to regular Notification API
    try {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        tag: options.tag,
        data: options.data
      });
      return true;
    } catch (e) {
      console.error('Failed to show notification:', e);
      return false;
    }
  }
}

/**
 * Schedule a daily training reminder
 */
export function scheduleTrainingReminder(hour: number, minute: number): void {
  // Store reminder settings
  const settings = {
    enabled: true,
    hour,
    minute,
    lastShown: null as string | null
  };

  localStorage.setItem('rehabflow_reminder_settings', JSON.stringify(settings));

  // Start checking for reminder time
  startReminderChecker();
}

/**
 * Cancel scheduled reminders
 */
export function cancelTrainingReminder(): void {
  const settings = JSON.parse(localStorage.getItem('rehabflow_reminder_settings') || '{}');
  settings.enabled = false;
  localStorage.setItem('rehabflow_reminder_settings', JSON.stringify(settings));
}

/**
 * Get current reminder settings
 */
export function getReminderSettings(): { enabled: boolean; hour: number; minute: number } | null {
  const stored = localStorage.getItem('rehabflow_reminder_settings');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Start the reminder checker interval
 */
let reminderInterval: ReturnType<typeof setInterval> | null = null;

function startReminderChecker(): void {
  // Clear existing interval
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }

  // Check every minute
  reminderInterval = setInterval(() => {
    checkAndShowReminder();
  }, 60000);

  // Also check immediately
  checkAndShowReminder();
}

async function checkAndShowReminder(): Promise<void> {
  const settings = getReminderSettings();
  if (!settings?.enabled) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Check if we already showed reminder today
  const stored = JSON.parse(localStorage.getItem('rehabflow_reminder_settings') || '{}');
  if (stored.lastShown === today) return;

  // Check if it's time
  if (now.getHours() === settings.hour && now.getMinutes() === settings.minute) {
    const shown = await showLocalNotification({
      title: 'Dags f\u00f6r tr\u00e4ning!',
      body: 'Din dagliga rehabilitering v\u00e4ntar. Ta hand om din kropp idag.',
      tag: 'training-reminder',
      data: { url: '/program' }
    });

    if (shown) {
      stored.lastShown = today;
      localStorage.setItem('rehabflow_reminder_settings', JSON.stringify(stored));
    }
  }
}

/**
 * Initialize notifications on app start
 */
export function initNotifications(): void {
  const settings = getReminderSettings();
  if (settings?.enabled) {
    startReminderChecker();
  }
}

/**
 * Helper: Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
