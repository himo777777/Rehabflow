/**
 * Schedule Service - Workout Planning
 *
 * Hanterar schemalagda träningspass:
 * - Skapa och redigera scheman
 * - Återkommande träning
 * - Påminnelser
 * - Synk med DailyCheckIn
 */

import { storageService } from './storageService';

// ============================================
// TYPES
// ============================================

export interface ScheduledWorkout {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  exercises: string[];
  duration: number; // minutes
  recurring: RecurringType;
  recurringDays?: number[]; // 0-6 for Sunday-Saturday
  reminder: boolean;
  reminderMinutes: number; // minutes before
  completed: boolean;
  completedAt?: string;
  notes?: string;
  color?: WorkoutColor;
}

export type RecurringType = 'none' | 'daily' | 'weekly' | 'custom';
export type WorkoutColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';

export interface DateRange {
  start: string; // ISO date
  end: string;   // ISO date
}

export interface WorkoutStats {
  totalScheduled: number;
  completed: number;
  upcoming: number;
  completionRate: number;
  streakDays: number;
}

// ============================================
// CONSTANTS
// ============================================

const SCHEDULE_KEY = 'rehabflow_scheduled_workouts';
const REMINDER_SETTINGS_KEY = 'rehabflow_reminder_settings';

export const WORKOUT_COLORS: { value: WorkoutColor; label: string; class: string }[] = [
  { value: 'blue', label: 'Blå', class: 'bg-blue-500' },
  { value: 'green', label: 'Grön', class: 'bg-green-500' },
  { value: 'purple', label: 'Lila', class: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Röd', class: 'bg-red-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' }
];

export const DEFAULT_REMINDER_MINUTES = 30;

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return `workout_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getStoredWorkouts(): ScheduledWorkout[] {
  try {
    const stored = localStorage.getItem(SCHEDULE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts: ScheduledWorkout[]): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(workouts));
}

function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getDayOfWeek(date: string): number {
  return new Date(date).getDay();
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Schedule a new workout
 */
export function scheduleWorkout(workout: Omit<ScheduledWorkout, 'id' | 'completed'>): ScheduledWorkout {
  const newWorkout: ScheduledWorkout = {
    ...workout,
    id: generateId(),
    completed: false
  };

  const workouts = getStoredWorkouts();
  workouts.push(newWorkout);
  saveWorkouts(workouts);

  return newWorkout;
}

/**
 * Update an existing workout
 */
export function updateWorkout(id: string, updates: Partial<ScheduledWorkout>): ScheduledWorkout | null {
  const workouts = getStoredWorkouts();
  const index = workouts.findIndex(w => w.id === id);

  if (index === -1) return null;

  workouts[index] = { ...workouts[index], ...updates };
  saveWorkouts(workouts);

  return workouts[index];
}

/**
 * Delete a workout
 */
export function deleteWorkout(id: string): boolean {
  const workouts = getStoredWorkouts();
  const filtered = workouts.filter(w => w.id !== id);

  if (filtered.length === workouts.length) return false;

  saveWorkouts(filtered);
  return true;
}

/**
 * Mark workout as completed
 */
export function completeWorkout(id: string): ScheduledWorkout | null {
  return updateWorkout(id, {
    completed: true,
    completedAt: new Date().toISOString()
  });
}

/**
 * Get scheduled workouts for a date range
 */
export function getScheduledWorkouts(range?: DateRange): ScheduledWorkout[] {
  const workouts = getStoredWorkouts();

  if (!range) return workouts;

  return workouts.filter(w => isDateInRange(w.date, range.start, range.end));
}

/**
 * Get workouts for a specific date
 */
export function getWorkoutsForDate(date: string): ScheduledWorkout[] {
  const workouts = getStoredWorkouts();

  // Get direct matches
  const direct = workouts.filter(w => w.date === date);

  // Get recurring workouts that apply to this date
  const recurring = workouts.filter(w => {
    if (w.recurring === 'none' || w.date > date) return false;

    if (w.recurring === 'daily') return true;

    if (w.recurring === 'weekly') {
      const originalDay = getDayOfWeek(w.date);
      const targetDay = getDayOfWeek(date);
      return originalDay === targetDay;
    }

    if (w.recurring === 'custom' && w.recurringDays) {
      const targetDay = getDayOfWeek(date);
      return w.recurringDays.includes(targetDay);
    }

    return false;
  });

  // Combine, avoiding duplicates
  const combined = [...direct];
  for (const rec of recurring) {
    if (!combined.some(w => w.id === rec.id)) {
      // Create instance for this date
      combined.push({
        ...rec,
        date,
        id: `${rec.id}_${date}` // Instance ID
      });
    }
  }

  return combined.sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Get upcoming workouts
 */
export function getUpcomingWorkouts(limit: number = 5): ScheduledWorkout[] {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = addDays(today, 7);

  const upcoming: ScheduledWorkout[] = [];
  let currentDate = today;

  while (currentDate <= nextWeek && upcoming.length < limit) {
    const dayWorkouts = getWorkoutsForDate(currentDate).filter(w => !w.completed);
    upcoming.push(...dayWorkouts);
    currentDate = addDays(currentDate, 1);
  }

  return upcoming.slice(0, limit);
}

/**
 * Get workout statistics
 */
export function getWorkoutStats(days: number = 30): WorkoutStats {
  const today = new Date().toISOString().split('T')[0];
  const startDate = addDays(today, -days);

  const workouts = getScheduledWorkouts({
    start: startDate,
    end: today
  });

  const completed = workouts.filter(w => w.completed).length;
  const totalScheduled = workouts.length;
  const upcoming = getUpcomingWorkouts(100).length;

  // Calculate streak
  let streakDays = 0;
  let checkDate = today;
  while (true) {
    const dayWorkouts = getWorkoutsForDate(checkDate);
    const hasCompleted = dayWorkouts.some(w => w.completed);
    const hasScheduled = dayWorkouts.length > 0;

    if (hasScheduled && !hasCompleted && checkDate < today) break;
    if (hasCompleted) streakDays++;
    if (checkDate <= startDate) break;

    checkDate = addDays(checkDate, -1);
  }

  return {
    totalScheduled,
    completed,
    upcoming,
    completionRate: totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0,
    streakDays
  };
}

/**
 * Create quick workout from program exercises
 */
export async function createQuickWorkout(
  date: string,
  time: string = '09:00'
): Promise<ScheduledWorkout | null> {
  const program = await storageService.getProgram();

  if (!program || !program.phases || program.phases.length === 0) {
    return null;
  }

  // Get exercises from first phase's daily routine
  const phase = program.phases[0];
  const firstDay = phase.dailyRoutine?.[0];
  const exercises = firstDay?.exercises?.map(e => e.name) || [];

  return scheduleWorkout({
    date,
    time,
    title: 'Träningspass',
    exercises: exercises.slice(0, 5),
    duration: 30,
    recurring: 'none',
    reminder: true,
    reminderMinutes: DEFAULT_REMINDER_MINUTES,
    color: 'blue'
  });
}

/**
 * Create weekly recurring schedule
 */
export function createWeeklySchedule(
  days: number[], // 0-6 for Sunday-Saturday
  time: string,
  exercises: string[]
): ScheduledWorkout {
  const today = new Date().toISOString().split('T')[0];

  return scheduleWorkout({
    date: today,
    time,
    title: 'Återkommande träning',
    exercises,
    duration: 30,
    recurring: 'custom',
    recurringDays: days,
    reminder: true,
    reminderMinutes: DEFAULT_REMINDER_MINUTES,
    color: 'green'
  });
}

/**
 * Get calendar data for a month
 */
export function getMonthCalendarData(year: number, month: number): Map<string, ScheduledWorkout[]> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = lastDay.toISOString().split('T')[0];

  const calendar = new Map<string, ScheduledWorkout[]>();
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const workouts = getWorkoutsForDate(currentDate);
    if (workouts.length > 0) {
      calendar.set(currentDate, workouts);
    }
    currentDate = addDays(currentDate, 1);
  }

  return calendar;
}

/**
 * Check for workouts that need reminders
 */
export function checkReminders(): ScheduledWorkout[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayWorkouts = getWorkoutsForDate(today);

  return todayWorkouts.filter(workout => {
    if (!workout.reminder || workout.completed) return false;

    const [hours, minutes] = workout.time.split(':').map(Number);
    const workoutMinutes = hours * 60 + minutes;
    const reminderTime = workoutMinutes - workout.reminderMinutes;

    // Check if we're within 5 minutes of reminder time
    return Math.abs(currentMinutes - reminderTime) < 5;
  });
}

/**
 * Clear all scheduled workouts
 */
export function clearAllWorkouts(): void {
  localStorage.removeItem(SCHEDULE_KEY);
}

/**
 * Export schedule data
 */
export function exportSchedule(): string {
  const workouts = getStoredWorkouts();
  return JSON.stringify(workouts, null, 2);
}

/**
 * Import schedule data
 */
export function importSchedule(data: string): boolean {
  try {
    const workouts = JSON.parse(data) as ScheduledWorkout[];
    saveWorkouts(workouts);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// EXPORT SERVICE OBJECT
// ============================================

export const scheduleService = {
  scheduleWorkout,
  updateWorkout,
  deleteWorkout,
  completeWorkout,
  getScheduledWorkouts,
  getWorkoutsForDate,
  getUpcomingWorkouts,
  getWorkoutStats,
  createQuickWorkout,
  createWeeklySchedule,
  getMonthCalendarData,
  checkReminders,
  clearAllWorkouts,
  exportSchedule,
  importSchedule
};

export default scheduleService;
