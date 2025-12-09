/**
 * Notification Service - Sprint 5.6
 *
 * Handles push notifications and local notifications.
 * Features:
 * - Push notification subscription
 * - Local notification scheduling
 * - Notification preferences
 * - Exercise reminders
 * - Achievement notifications
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType =
  | 'exercise_reminder'
  | 'daily_goal'
  | 'achievement'
  | 'streak'
  | 'progress_update'
  | 'rest_reminder'
  | 'weekly_summary'
  | 'general';

export interface NotificationPreferences {
  enabled: boolean;
  exerciseReminders: boolean;
  dailyGoalReminders: boolean;
  achievementAlerts: boolean;
  streakReminders: boolean;
  progressUpdates: boolean;
  restReminders: boolean;
  weeklySummary: boolean;
  quietHoursStart: number; // Hour (0-23)
  quietHoursEnd: number;   // Hour (0-23)
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  scheduledTime: Date;
  data?: Record<string, unknown>;
  recurring?: {
    interval: 'daily' | 'weekly';
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

// ============================================================================
// DEFAULT PREFERENCES
// ============================================================================

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  exerciseReminders: true,
  dailyGoalReminders: true,
  achievementAlerts: true,
  streakReminders: true,
  progressUpdates: false,
  restReminders: true,
  weeklySummary: true,
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 8,    // 8 AM
};

const STORAGE_KEY = 'rehabflow-notification-preferences';
const SCHEDULED_KEY = 'rehabflow-scheduled-notifications';

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor() {
    this.loadPreferences();
    this.loadScheduledNotifications();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Check if notifications are supported
   */
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Check notification permission
   */
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      logger.warn('[Notifications] Not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    logger.info('[Notifications] Permission:', permission);
    return permission;
  }

  // --------------------------------------------------------------------------
  // PREFERENCES
  // --------------------------------------------------------------------------

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[Notifications] Failed to load preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      logger.error('[Notifications] Failed to save preferences:', error);
    }
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    logger.debug('[Notifications] Preferences updated:', updates);
  }

  // --------------------------------------------------------------------------
  // SCHEDULED NOTIFICATIONS
  // --------------------------------------------------------------------------

  private loadScheduledNotifications(): void {
    try {
      const stored = localStorage.getItem(SCHEDULED_KEY);
      if (stored) {
        const notifications = JSON.parse(stored) as ScheduledNotification[];
        notifications.forEach((n) => {
          n.scheduledTime = new Date(n.scheduledTime);
          this.scheduledNotifications.set(n.id, n);
          this.scheduleTimer(n);
        });
      }
    } catch (error) {
      logger.error('[Notifications] Failed to load scheduled:', error);
    }
  }

  private saveScheduledNotifications(): void {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      localStorage.setItem(SCHEDULED_KEY, JSON.stringify(notifications));
    } catch (error) {
      logger.error('[Notifications] Failed to save scheduled:', error);
    }
  }

  private scheduleTimer(notification: ScheduledNotification): void {
    const now = Date.now();
    const scheduledTime = notification.scheduledTime.getTime();
    const delay = scheduledTime - now;

    if (delay <= 0) {
      // Already past, trigger immediately or skip
      if (notification.recurring) {
        this.rescheduleRecurring(notification);
      } else {
        this.scheduledNotifications.delete(notification.id);
      }
      return;
    }

    // Clear existing timer
    const existingTimer = this.timers.get(notification.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      await this.triggerNotification(notification);

      if (notification.recurring) {
        this.rescheduleRecurring(notification);
      } else {
        this.scheduledNotifications.delete(notification.id);
        this.timers.delete(notification.id);
        this.saveScheduledNotifications();
      }
    }, delay);

    this.timers.set(notification.id, timer);
  }

  private rescheduleRecurring(notification: ScheduledNotification): void {
    if (!notification.recurring) return;

    const { interval, daysOfWeek } = notification.recurring;
    let nextTime = new Date(notification.scheduledTime);

    if (interval === 'daily') {
      nextTime.setDate(nextTime.getDate() + 1);
    } else if (interval === 'weekly') {
      nextTime.setDate(nextTime.getDate() + 7);
    }

    // If specific days, find next valid day
    if (daysOfWeek && daysOfWeek.length > 0) {
      while (!daysOfWeek.includes(nextTime.getDay())) {
        nextTime.setDate(nextTime.getDate() + 1);
      }
    }

    notification.scheduledTime = nextTime;
    this.scheduledNotifications.set(notification.id, notification);
    this.scheduleTimer(notification);
    this.saveScheduledNotifications();
  }

  // --------------------------------------------------------------------------
  // SHOW NOTIFICATIONS
  // --------------------------------------------------------------------------

  private isInQuietHours(): boolean {
    const now = new Date().getHours();
    const { quietHoursStart, quietHoursEnd } = this.preferences;

    if (quietHoursStart < quietHoursEnd) {
      return now >= quietHoursStart && now < quietHoursEnd;
    } else {
      // Quiet hours span midnight
      return now >= quietHoursStart || now < quietHoursEnd;
    }
  }

  private shouldShowNotification(type: NotificationType): boolean {
    if (!this.preferences.enabled) return false;
    if (this.isInQuietHours()) return false;

    switch (type) {
      case 'exercise_reminder':
        return this.preferences.exerciseReminders;
      case 'daily_goal':
        return this.preferences.dailyGoalReminders;
      case 'achievement':
        return this.preferences.achievementAlerts;
      case 'streak':
        return this.preferences.streakReminders;
      case 'progress_update':
        return this.preferences.progressUpdates;
      case 'rest_reminder':
        return this.preferences.restReminders;
      case 'weekly_summary':
        return this.preferences.weeklySummary;
      default:
        return true;
    }
  }

  private async triggerNotification(scheduled: ScheduledNotification): Promise<void> {
    if (!this.shouldShowNotification(scheduled.type)) {
      logger.debug('[Notifications] Skipped (preferences):', scheduled.id);
      return;
    }

    await this.show({
      title: scheduled.title,
      body: scheduled.body,
      data: scheduled.data,
      tag: scheduled.type,
    });
  }

  /**
   * Show a notification
   */
  public async show(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      logger.warn('[Notifications] Not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      logger.warn('[Notifications] Permission not granted');
      return;
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      vibrate: payload.vibrate || [100, 50, 100],
    };

    // Try to use service worker for persistent notifications
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, options);

    logger.debug('[Notifications] Shown:', payload.title);
  }

  // --------------------------------------------------------------------------
  // PUBLIC SCHEDULING API
  // --------------------------------------------------------------------------

  /**
   * Schedule a notification
   */
  public schedule(notification: Omit<ScheduledNotification, 'id'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const scheduled: ScheduledNotification = { ...notification, id };

    this.scheduledNotifications.set(id, scheduled);
    this.scheduleTimer(scheduled);
    this.saveScheduledNotifications();

    logger.debug('[Notifications] Scheduled:', id, 'at', notification.scheduledTime);
    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  public cancel(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.scheduledNotifications.delete(id);
    this.saveScheduledNotifications();

    logger.debug('[Notifications] Cancelled:', id);
  }

  /**
   * Cancel all scheduled notifications
   */
  public cancelAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.scheduledNotifications.clear();
    this.saveScheduledNotifications();

    logger.debug('[Notifications] All cancelled');
  }

  /**
   * Get all scheduled notifications
   */
  public getScheduled(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  // --------------------------------------------------------------------------
  // CONVENIENCE METHODS
  // --------------------------------------------------------------------------

  /**
   * Schedule daily exercise reminder
   */
  public scheduleExerciseReminder(hour: number, minute: number = 0): string {
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return this.schedule({
      title: 'Dags att träna!',
      body: 'Glöm inte din dagliga träning. Bara några minuter gör skillnad!',
      type: 'exercise_reminder',
      scheduledTime,
      recurring: { interval: 'daily' },
    });
  }

  /**
   * Schedule streak reminder
   */
  public scheduleStreakReminder(hour: number = 18): string {
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, 0, 0, 0);

    if (scheduledTime <= new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return this.schedule({
      title: 'Behåll din streak!',
      body: 'Du har inte tränat idag ännu. Fortsätt din serie!',
      type: 'streak',
      scheduledTime,
      recurring: { interval: 'daily' },
    });
  }

  /**
   * Show achievement notification
   */
  public async notifyAchievement(achievementName: string, description?: string): Promise<void> {
    await this.show({
      title: `🏆 ${achievementName}`,
      body: description || 'Du har låst upp en ny prestation!',
      tag: 'achievement',
      requireInteraction: true,
    });
  }

  /**
   * Show rest reminder
   */
  public async notifyRestReminder(): Promise<void> {
    await this.show({
      title: 'Vila är viktig',
      body: 'Du har tränat mycket! Tänk på att ta en vilodag.',
      tag: 'rest_reminder',
    });
  }

  /**
   * Show weekly summary
   */
  public async notifyWeeklySummary(stats: {
    sessions: number;
    totalMinutes: number;
    improvement: number;
  }): Promise<void> {
    await this.show({
      title: '📊 Veckans sammanfattning',
      body: `${stats.sessions} sessioner, ${stats.totalMinutes} min träning. ${stats.improvement > 0 ? `+${stats.improvement}% förbättring!` : ''}`,
      tag: 'weekly_summary',
      requireInteraction: true,
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const notificationService = new NotificationService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );

  useEffect(() => {
    setPermission(notificationService.getPermission());
    setPreferences(notificationService.getPreferences());
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    notificationService.updatePreferences(updates);
    setPreferences(notificationService.getPreferences());
  }, []);

  return {
    isSupported: notificationService.isSupported(),
    permission,
    preferences,
    requestPermission,
    updatePreferences,
    show: notificationService.show.bind(notificationService),
    schedule: notificationService.schedule.bind(notificationService),
    cancel: notificationService.cancel.bind(notificationService),
    cancelAll: notificationService.cancelAll.bind(notificationService),
    getScheduled: notificationService.getScheduled.bind(notificationService),
    scheduleExerciseReminder: notificationService.scheduleExerciseReminder.bind(notificationService),
    scheduleStreakReminder: notificationService.scheduleStreakReminder.bind(notificationService),
    notifyAchievement: notificationService.notifyAchievement.bind(notificationService),
    notifyWeeklySummary: notificationService.notifyWeeklySummary.bind(notificationService),
  };
}

export default notificationService;
