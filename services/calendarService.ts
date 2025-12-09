/**
 * Calendar Service - Sprint 5.9
 *
 * Integrates with calendar systems for scheduling and reminders.
 * Features:
 * - Google Calendar integration
 * - ICS file generation
 * - Exercise scheduling
 * - Reminder management
 * - Recurring events
 * - Calendar sync
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  recurring?: RecurringPattern;
  reminders?: number[]; // Minutes before event
  color?: string;
  exerciseId?: string;
  type: 'exercise' | 'reminder' | 'milestone' | 'custom';
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endDate?: Date;
  occurrences?: number;
}

export interface ScheduledExercise {
  exerciseId: string;
  exerciseName: string;
  scheduledTime: Date;
  duration: number; // minutes
  recurring?: RecurringPattern;
  notification: boolean;
  notificationMinutes: number;
}

export interface CalendarConfig {
  enabled: boolean;
  defaultDuration: number; // minutes
  defaultReminders: number[]; // minutes before
  syncWithGoogle: boolean;
  googleCalendarId?: string;
  preferredExerciseTime: number; // hour of day (0-23)
  preferredDays: number[]; // 0-6
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: CalendarConfig = {
  enabled: true,
  defaultDuration: 30,
  defaultReminders: [15, 60], // 15 min and 1 hour before
  syncWithGoogle: false,
  preferredExerciseTime: 9, // 9 AM
  preferredDays: [1, 2, 3, 4, 5], // Monday - Friday
};

// Storage keys
const CONFIG_KEY = 'rehabflow-calendar-config';
const EVENTS_KEY = 'rehabflow-calendar-events';
const SCHEDULE_KEY = 'rehabflow-scheduled-exercises';

// ============================================================================
// CALENDAR SERVICE
// ============================================================================

class CalendarService {
  private config: CalendarConfig = DEFAULT_CONFIG;
  private events: Map<string, CalendarEvent> = new Map();
  private scheduledExercises: Map<string, ScheduledExercise> = new Map();

  constructor() {
    this.loadConfig();
    this.loadEvents();
    this.loadScheduledExercises();
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[Calendar] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Calendar] Failed to save config:', error);
    }
  }

  public getConfig(): CalendarConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<CalendarConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    logger.debug('[Calendar] Config updated:', updates);
  }

  // --------------------------------------------------------------------------
  // EVENT MANAGEMENT
  // --------------------------------------------------------------------------

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) {
        const events = JSON.parse(stored) as CalendarEvent[];
        events.forEach(e => {
          e.startTime = new Date(e.startTime);
          e.endTime = new Date(e.endTime);
          if (e.recurring?.endDate) {
            e.recurring.endDate = new Date(e.recurring.endDate);
          }
          this.events.set(e.id, e);
        });
      }
    } catch (error) {
      logger.error('[Calendar] Failed to load events:', error);
    }
  }

  private saveEvents(): void {
    try {
      const events = Array.from(this.events.values());
      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      logger.error('[Calendar] Failed to save events:', error);
    }
  }

  /**
   * Create a calendar event
   */
  public createEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const id = `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newEvent: CalendarEvent = { ...event, id };

    this.events.set(id, newEvent);
    this.saveEvents();

    logger.info('[Calendar] Event created:', id);
    return newEvent;
  }

  /**
   * Update a calendar event
   */
  public updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const event = this.events.get(id);
    if (!event) return null;

    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    this.saveEvents();

    logger.debug('[Calendar] Event updated:', id);
    return updatedEvent;
  }

  /**
   * Delete a calendar event
   */
  public deleteEvent(id: string): void {
    this.events.delete(id);
    this.saveEvents();
    logger.debug('[Calendar] Event deleted:', id);
  }

  /**
   * Get all events
   */
  public getEvents(): CalendarEvent[] {
    return Array.from(this.events.values()).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
  }

  /**
   * Get events for a specific date range
   */
  public getEventsInRange(start: Date, end: Date): CalendarEvent[] {
    return this.getEvents().filter(e => {
      return e.startTime >= start && e.startTime <= end;
    });
  }

  /**
   * Get today's events
   */
  public getTodaysEvents(): CalendarEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getEventsInRange(today, tomorrow);
  }

  /**
   * Get this week's events
   */
  public getThisWeeksEvents(): CalendarEvent[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return this.getEventsInRange(startOfWeek, endOfWeek);
  }

  // --------------------------------------------------------------------------
  // EXERCISE SCHEDULING
  // --------------------------------------------------------------------------

  private loadScheduledExercises(): void {
    try {
      const stored = localStorage.getItem(SCHEDULE_KEY);
      if (stored) {
        const exercises = JSON.parse(stored) as ScheduledExercise[];
        exercises.forEach(e => {
          e.scheduledTime = new Date(e.scheduledTime);
          this.scheduledExercises.set(e.exerciseId, e);
        });
      }
    } catch (error) {
      logger.error('[Calendar] Failed to load scheduled exercises:', error);
    }
  }

  private saveScheduledExercises(): void {
    try {
      const exercises = Array.from(this.scheduledExercises.values());
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(exercises));
    } catch (error) {
      logger.error('[Calendar] Failed to save scheduled exercises:', error);
    }
  }

  /**
   * Schedule an exercise
   */
  public scheduleExercise(exercise: ScheduledExercise): CalendarEvent {
    this.scheduledExercises.set(exercise.exerciseId, exercise);
    this.saveScheduledExercises();

    // Create calendar event
    const endTime = new Date(exercise.scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + exercise.duration);

    const event = this.createEvent({
      title: `Träning: ${exercise.exerciseName}`,
      description: `Schemalagd övning med RehabFlow`,
      startTime: exercise.scheduledTime,
      endTime,
      type: 'exercise',
      exerciseId: exercise.exerciseId,
      recurring: exercise.recurring,
      reminders: exercise.notification ? [exercise.notificationMinutes] : [],
    });

    logger.info('[Calendar] Exercise scheduled:', exercise.exerciseName);
    return event;
  }

  /**
   * Get scheduled exercises
   */
  public getScheduledExercises(): ScheduledExercise[] {
    return Array.from(this.scheduledExercises.values()).sort(
      (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()
    );
  }

  /**
   * Remove scheduled exercise
   */
  public removeScheduledExercise(exerciseId: string): void {
    this.scheduledExercises.delete(exerciseId);
    this.saveScheduledExercises();

    // Remove associated event
    const events = this.getEvents().filter(e => e.exerciseId === exerciseId);
    events.forEach(e => this.deleteEvent(e.id));

    logger.debug('[Calendar] Scheduled exercise removed:', exerciseId);
  }

  // --------------------------------------------------------------------------
  // ICS FILE GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate ICS file content for an event
   */
  public generateICS(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const escapeText = (text: string): string => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
    };

    let rrule = '';
    if (event.recurring) {
      const freq = event.recurring.frequency.toUpperCase();
      rrule = `RRULE:FREQ=${freq};INTERVAL=${event.recurring.interval}`;

      if (event.recurring.daysOfWeek) {
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byDay = event.recurring.daysOfWeek.map(d => days[d]).join(',');
        rrule += `;BYDAY=${byDay}`;
      }

      if (event.recurring.occurrences) {
        rrule += `;COUNT=${event.recurring.occurrences}`;
      } else if (event.recurring.endDate) {
        rrule += `;UNTIL=${formatDate(event.recurring.endDate)}`;
      }
    }

    let valarms = '';
    if (event.reminders) {
      event.reminders.forEach(minutes => {
        valarms += `
BEGIN:VALARM
TRIGGER:-PT${minutes}M
ACTION:DISPLAY
DESCRIPTION:Påminnelse: ${escapeText(event.title)}
END:VALARM`;
      });
    }

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RehabFlow//Calendar//SV
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@rehabflow.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${escapeText(event.title)}
DESCRIPTION:${escapeText(event.description)}
${event.location ? `LOCATION:${escapeText(event.location)}` : ''}
${rrule}
${valarms}
END:VEVENT
END:VCALENDAR`.trim();

    return ics;
  }

  /**
   * Download ICS file
   */
  public downloadICS(event: CalendarEvent): void {
    const ics = this.generateICS(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rehabflow-${event.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    logger.debug('[Calendar] ICS downloaded:', event.id);
  }

  /**
   * Add to Google Calendar
   */
  public addToGoogleCalendar(event: CalendarEvent): void {
    const formatGoogleDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, 'Z');
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
      details: event.description,
    });

    if (event.location) {
      params.append('location', event.location);
    }

    if (event.recurring) {
      const freq = event.recurring.frequency.toUpperCase();
      let rrule = `FREQ=${freq};INTERVAL=${event.recurring.interval}`;

      if (event.recurring.daysOfWeek) {
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byDay = event.recurring.daysOfWeek.map(d => days[d]).join(',');
        rrule += `;BYDAY=${byDay}`;
      }

      params.append('recur', `RRULE:${rrule}`);
    }

    const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(url, '_blank');

    logger.debug('[Calendar] Opened Google Calendar:', event.id);
  }

  // --------------------------------------------------------------------------
  // SMART SCHEDULING
  // --------------------------------------------------------------------------

  /**
   * Suggest optimal exercise times based on user preferences
   */
  public suggestExerciseTimes(
    exerciseName: string,
    duration: number,
    count: number = 3
  ): Date[] {
    const suggestions: Date[] = [];
    const now = new Date();

    // Start from tomorrow
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(this.config.preferredExerciseTime, 0, 0, 0);

    let currentDate = new Date(startDate);
    let daysChecked = 0;

    while (suggestions.length < count && daysChecked < 14) {
      const dayOfWeek = currentDate.getDay();

      // Check if this is a preferred day
      if (this.config.preferredDays.includes(dayOfWeek)) {
        // Check if there's no conflict
        const endTime = new Date(currentDate);
        endTime.setMinutes(endTime.getMinutes() + duration);

        const conflicts = this.getEventsInRange(
          new Date(currentDate.getTime() - 30 * 60000),
          new Date(endTime.getTime() + 30 * 60000)
        );

        if (conflicts.length === 0) {
          suggestions.push(new Date(currentDate));
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      daysChecked++;
    }

    return suggestions;
  }

  /**
   * Create weekly exercise schedule
   */
  public createWeeklySchedule(
    exercises: Array<{ id: string; name: string; duration: number }>,
    startDate?: Date
  ): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const start = startDate || new Date();
    start.setDate(start.getDate() + 1);

    const exercisesPerDay = Math.ceil(exercises.length / this.config.preferredDays.length);

    let exerciseIndex = 0;

    for (const dayOfWeek of this.config.preferredDays) {
      const eventDate = new Date(start);

      // Find the next occurrence of this day
      while (eventDate.getDay() !== dayOfWeek) {
        eventDate.setDate(eventDate.getDate() + 1);
      }

      eventDate.setHours(this.config.preferredExerciseTime, 0, 0, 0);

      for (let i = 0; i < exercisesPerDay && exerciseIndex < exercises.length; i++) {
        const exercise = exercises[exerciseIndex];

        const endTime = new Date(eventDate);
        endTime.setMinutes(endTime.getMinutes() + exercise.duration);

        const event = this.createEvent({
          title: `Träning: ${exercise.name}`,
          description: `Schemalagd övning med RehabFlow`,
          startTime: new Date(eventDate),
          endTime,
          type: 'exercise',
          exerciseId: exercise.id,
          recurring: {
            frequency: 'weekly',
            interval: 1,
            daysOfWeek: [dayOfWeek],
          },
          reminders: this.config.defaultReminders,
        });

        events.push(event);

        // Move time forward for next exercise
        eventDate.setMinutes(eventDate.getMinutes() + exercise.duration + 15);
        exerciseIndex++;
      }
    }

    logger.info('[Calendar] Weekly schedule created with', events.length, 'events');
    return events;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const calendarService = new CalendarService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(calendarService.getEvents());
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [scheduledExercises, setScheduledExercises] = useState<ScheduledExercise[]>([]);

  useEffect(() => {
    setEvents(calendarService.getEvents());
    setTodaysEvents(calendarService.getTodaysEvents());
    setScheduledExercises(calendarService.getScheduledExercises());
  }, []);

  const createEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = calendarService.createEvent(event);
    setEvents(calendarService.getEvents());
    setTodaysEvents(calendarService.getTodaysEvents());
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    const updated = calendarService.updateEvent(id, updates);
    setEvents(calendarService.getEvents());
    setTodaysEvents(calendarService.getTodaysEvents());
    return updated;
  }, []);

  const deleteEvent = useCallback((id: string) => {
    calendarService.deleteEvent(id);
    setEvents(calendarService.getEvents());
    setTodaysEvents(calendarService.getTodaysEvents());
  }, []);

  const scheduleExercise = useCallback((exercise: ScheduledExercise) => {
    const event = calendarService.scheduleExercise(exercise);
    setEvents(calendarService.getEvents());
    setScheduledExercises(calendarService.getScheduledExercises());
    return event;
  }, []);

  const removeScheduledExercise = useCallback((exerciseId: string) => {
    calendarService.removeScheduledExercise(exerciseId);
    setEvents(calendarService.getEvents());
    setScheduledExercises(calendarService.getScheduledExercises());
  }, []);

  return {
    // State
    events,
    todaysEvents,
    scheduledExercises,

    // Event methods
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsInRange: calendarService.getEventsInRange.bind(calendarService),
    getThisWeeksEvents: calendarService.getThisWeeksEvents.bind(calendarService),

    // Exercise scheduling
    scheduleExercise,
    removeScheduledExercise,

    // Export
    downloadICS: calendarService.downloadICS.bind(calendarService),
    addToGoogleCalendar: calendarService.addToGoogleCalendar.bind(calendarService),
    generateICS: calendarService.generateICS.bind(calendarService),

    // Smart scheduling
    suggestExerciseTimes: calendarService.suggestExerciseTimes.bind(calendarService),
    createWeeklySchedule: calendarService.createWeeklySchedule.bind(calendarService),

    // Config
    config: calendarService.getConfig(),
    updateConfig: calendarService.updateConfig.bind(calendarService),
  };
}

export default calendarService;
