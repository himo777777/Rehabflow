import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }
}));

// Mock navigator and Notification API
const mockNotification = vi.fn();
const mockServiceWorker = {
  ready: Promise.resolve({
    showNotification: vi.fn()
  })
};

Object.defineProperty(globalThis, 'Notification', {
  value: mockNotification,
  writable: true,
  configurable: true
});

Object.defineProperty(mockNotification, 'permission', {
  value: 'granted',
  writable: true,
  configurable: true
});

Object.defineProperty(mockNotification, 'requestPermission', {
  value: vi.fn(async () => 'granted'),
  writable: true,
  configurable: true
});

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
  configurable: true
});

// Now import after mocks
import notificationService, {
  useNotifications,
  type NotificationPreferences,
  type ScheduledNotification,
  type NotificationType
} from '../../services/notificationService';

describe('notificationService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Cancel all notifications to start fresh
    notificationService.cancelAll();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  // ===========================================
  // INITIALIZATION TESTS
  // ===========================================
  describe('initialization', () => {
    it('should check if notifications are supported', () => {
      const supported = notificationService.isSupported();
      // In test environment, we've mocked Notification and serviceWorker
      expect(typeof supported).toBe('boolean');
    });

    it('should get current permission', () => {
      const permission = notificationService.getPermission();
      expect(['granted', 'denied', 'default']).toContain(permission);
    });
  });

  // ===========================================
  // PREFERENCES TESTS
  // ===========================================
  describe('preferences', () => {
    it('should return default preferences when none saved', () => {
      const prefs = notificationService.getPreferences();

      expect(prefs.enabled).toBe(true);
      expect(prefs.exerciseReminders).toBe(true);
      expect(prefs.dailyGoalReminders).toBe(true);
      expect(prefs.achievementAlerts).toBe(true);
      expect(prefs.quietHoursStart).toBe(22);
      expect(prefs.quietHoursEnd).toBe(8);
    });

    it('should update preferences', () => {
      notificationService.updatePreferences({
        exerciseReminders: false,
        quietHoursStart: 21
      });

      const prefs = notificationService.getPreferences();

      expect(prefs.exerciseReminders).toBe(false);
      expect(prefs.quietHoursStart).toBe(21);
      expect(prefs.dailyGoalReminders).toBe(true); // Unchanged
    });

    it('should persist preferences to localStorage', () => {
      notificationService.updatePreferences({ enabled: false });

      const stored = localStorage.getItem('rehabflow-notification-preferences');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.enabled).toBe(false);
    });

    it('should disable all notifications when enabled is false', () => {
      notificationService.updatePreferences({ enabled: false });

      const prefs = notificationService.getPreferences();
      expect(prefs.enabled).toBe(false);
    });
  });

  // ===========================================
  // SCHEDULING TESTS
  // ===========================================
  describe('scheduling', () => {
    it('should schedule a notification', () => {
      const scheduledTime = new Date(Date.now() + 60000); // 1 minute from now

      const id = notificationService.schedule({
        title: 'Test Notification',
        body: 'Test body',
        type: 'exercise_reminder' as NotificationType,
        scheduledTime
      });

      expect(id).toBeDefined();
      expect(id).toContain('notif_');
    });

    it('should return all scheduled notifications', () => {
      const time1 = new Date(Date.now() + 60000);
      const time2 = new Date(Date.now() + 120000);

      notificationService.schedule({
        title: 'Notification 1',
        body: 'Body 1',
        type: 'exercise_reminder' as NotificationType,
        scheduledTime: time1
      });

      notificationService.schedule({
        title: 'Notification 2',
        body: 'Body 2',
        type: 'daily_goal' as NotificationType,
        scheduledTime: time2
      });

      const scheduled = notificationService.getScheduled();

      expect(scheduled).toHaveLength(2);
      expect(scheduled[0].title).toBe('Notification 1');
      expect(scheduled[1].title).toBe('Notification 2');
    });

    it('should cancel a specific notification', () => {
      const time = new Date(Date.now() + 60000);

      const id = notificationService.schedule({
        title: 'To Cancel',
        body: 'Will be cancelled',
        type: 'general' as NotificationType,
        scheduledTime: time
      });

      notificationService.cancel(id);

      const scheduled = notificationService.getScheduled();
      expect(scheduled).toHaveLength(0);
    });

    it('should cancel all notifications', () => {
      const time1 = new Date(Date.now() + 60000);
      const time2 = new Date(Date.now() + 120000);

      notificationService.schedule({
        title: 'Notification 1',
        body: 'Body 1',
        type: 'exercise_reminder' as NotificationType,
        scheduledTime: time1
      });

      notificationService.schedule({
        title: 'Notification 2',
        body: 'Body 2',
        type: 'daily_goal' as NotificationType,
        scheduledTime: time2
      });

      notificationService.cancelAll();

      const scheduled = notificationService.getScheduled();
      expect(scheduled).toHaveLength(0);
    });
  });

  // ===========================================
  // CONVENIENCE METHODS TESTS
  // ===========================================
  describe('convenience methods', () => {
    it('should schedule exercise reminder', () => {
      const id = notificationService.scheduleExerciseReminder(9, 0);

      expect(id).toBeDefined();

      const scheduled = notificationService.getScheduled();
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0].type).toBe('exercise_reminder');
      expect(scheduled[0].recurring?.interval).toBe('daily');
    });

    it('should schedule streak reminder', () => {
      const id = notificationService.scheduleStreakReminder(18);

      expect(id).toBeDefined();

      const scheduled = notificationService.getScheduled();
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0].type).toBe('streak');
    });

    it('should schedule for next day if time has passed', () => {
      // Set current time to 10:00 AM
      vi.setSystemTime(new Date(2024, 0, 15, 10, 0, 0));

      // Schedule for 9:00 AM (already passed)
      notificationService.scheduleExerciseReminder(9, 0);

      const scheduled = notificationService.getScheduled();
      const scheduledDate = new Date(scheduled[0].scheduledTime);

      // Should be scheduled for tomorrow (Jan 16)
      expect(scheduledDate.getDate()).toBe(16);
    });
  });

  // ===========================================
  // RECURRING NOTIFICATION TESTS
  // ===========================================
  describe('recurring notifications', () => {
    it('should create recurring daily notification', () => {
      const time = new Date(Date.now() + 60000);

      notificationService.schedule({
        title: 'Daily Reminder',
        body: 'Your daily reminder',
        type: 'exercise_reminder' as NotificationType,
        scheduledTime: time,
        recurring: { interval: 'daily' }
      });

      const scheduled = notificationService.getScheduled();

      expect(scheduled[0].recurring?.interval).toBe('daily');
    });

    it('should create weekly notification with specific days', () => {
      const time = new Date(Date.now() + 60000);

      notificationService.schedule({
        title: 'Weekly Reminder',
        body: 'Your weekly reminder',
        type: 'weekly_summary' as NotificationType,
        scheduledTime: time,
        recurring: {
          interval: 'weekly',
          daysOfWeek: [1, 3, 5] // Mon, Wed, Fri
        }
      });

      const scheduled = notificationService.getScheduled();

      expect(scheduled[0].recurring?.interval).toBe('weekly');
      expect(scheduled[0].recurring?.daysOfWeek).toEqual([1, 3, 5]);
    });
  });

  // ===========================================
  // NOTIFICATION TYPES TESTS
  // ===========================================
  describe('notification types', () => {
    const notificationTypes: NotificationType[] = [
      'exercise_reminder',
      'daily_goal',
      'achievement',
      'streak',
      'progress_update',
      'rest_reminder',
      'weekly_summary',
      'general'
    ];

    it('should support all notification types', () => {
      const time = new Date(Date.now() + 60000);

      notificationTypes.forEach(type => {
        const id = notificationService.schedule({
          title: `Test ${type}`,
          body: 'Test body',
          type,
          scheduledTime: time
        });

        expect(id).toBeDefined();
      });
    });
  });

  // ===========================================
  // PERSISTENCE TESTS
  // ===========================================
  describe('persistence', () => {
    it('should persist scheduled notifications', () => {
      const time = new Date(Date.now() + 60000);

      notificationService.schedule({
        title: 'Persistent',
        body: 'Should persist',
        type: 'exercise_reminder' as NotificationType,
        scheduledTime: time
      });

      const stored = localStorage.getItem('rehabflow-scheduled-notifications');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe('Persistent');
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('edge cases', () => {
    it('should handle canceling non-existent notification', () => {
      // Should not throw
      expect(() => {
        notificationService.cancel('non_existent_id');
      }).not.toThrow();
    });

    it('should handle empty scheduled list', () => {
      const scheduled = notificationService.getScheduled();
      expect(scheduled).toEqual([]);
    });

    it('should generate unique IDs for notifications', () => {
      const time = new Date(Date.now() + 60000);

      const id1 = notificationService.schedule({
        title: 'Notification 1',
        body: 'Body',
        type: 'general' as NotificationType,
        scheduledTime: time
      });

      const id2 = notificationService.schedule({
        title: 'Notification 2',
        body: 'Body',
        type: 'general' as NotificationType,
        scheduledTime: time
      });

      expect(id1).not.toBe(id2);
    });
  });

  // ===========================================
  // QUIET HOURS TESTS
  // ===========================================
  describe('quiet hours', () => {
    it('should support quiet hours configuration', () => {
      notificationService.updatePreferences({
        quietHoursStart: 23,
        quietHoursEnd: 7
      });

      const prefs = notificationService.getPreferences();

      expect(prefs.quietHoursStart).toBe(23);
      expect(prefs.quietHoursEnd).toBe(7);
    });

    it('should support quiet hours spanning midnight', () => {
      notificationService.updatePreferences({
        quietHoursStart: 22,
        quietHoursEnd: 6
      });

      const prefs = notificationService.getPreferences();

      // Should handle hours that span midnight
      expect(prefs.quietHoursStart).toBeGreaterThan(prefs.quietHoursEnd);
    });
  });
});
