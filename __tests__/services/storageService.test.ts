import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock supabaseClient to return null (local-only mode)
vi.mock('../../services/supabaseClient', () => ({
  supabase: null,
  getUserId: vi.fn(() => 'test-user-123')
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }
}));

// Import after mocking
import { storageService } from '../../services/storageService';
import type {
  GeneratedProgram,
  UserAssessment,
  WorkoutCheckIn,
  ExerciseLog,
  Milestone,
  MovementSession,
  CalibrationData
} from '../../types';
import { InjuryType } from '../../types';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // PROGRAM STORAGE TESTS
  // ===========================================
  describe('program storage', () => {
    const mockProgram: GeneratedProgram = {
      title: 'Test Rehabilitation Program',
      summary: 'A test program for rehabilitation',
      conditionAnalysis: 'Test condition analysis',
      patientEducation: {
        diagnosis: 'Test diagnosis',
        explanation: 'Test explanation',
        pathology: 'Test pathology',
        prognosis: 'Test prognosis',
        scienceBackground: 'Test science background',
        dailyTips: ['Tip 1', 'Tip 2'],
        sources: ['Source 1']
      },
      phases: [
        {
          phaseName: 'Phase 1',
          description: 'Initial phase',
          durationWeeks: '2-4 weeks',
          goals: ['Reduce pain', 'Improve mobility'],
          precautions: ['Avoid heavy lifting'],
          dailyRoutine: [
            {
              day: 1,
              focus: 'Mobility',
              exercises: [
                {
                  name: 'Gentle stretch',
                  category: 'mobility',
                  description: 'Gentle knee stretch',
                  sets: 3,
                  reps: '10',
                  frequency: 'Daily',
                  tips: 'Move slowly',
                  difficulty: 'Lätt',
                }
              ]
            }
          ]
        }
      ]
    };

    const mockAssessment: UserAssessment = {
      name: 'Test User',
      age: 35,
      injuryType: InjuryType.CHRONIC,
      injuryLocation: 'Knä',
      symptoms: ['Pain', 'Stiffness'],
      painLevel: 5,
      activityPainLevel: 6,
      activityLevel: 'moderate',
      goals: 'Reduce pain and return to sports',
      specificAnswers: {},
      lifestyle: {
        sleep: 'Okej',
        stress: 'Medel',
        fearAvoidance: false,
        workload: 'Stillasittande'
      }
    };

    it('should save and retrieve a program', async () => {
      await storageService.saveProgram(mockProgram);

      const retrieved = await storageService.getProgram();

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe(mockProgram.title);
      expect(retrieved?.phases).toHaveLength(1);
    });

    it('should save program with assessment', async () => {
      await storageService.saveProgram(mockProgram, mockAssessment);

      const program = await storageService.getProgram();
      const assessment = storageService.getAssessmentDraft();

      expect(program?.title).toBe(mockProgram.title);
      expect(assessment?.age).toBe(35);
      expect(assessment?.injuryLocation).toBe('Knä');
    });

    it('should return null when no program exists', async () => {
      const program = await storageService.getProgram();
      expect(program).toBeNull();
    });

    it('should clear program data', async () => {
      await storageService.saveProgram(mockProgram, mockAssessment);
      await storageService.clearProgram();

      const program = await storageService.getProgram();
      const assessment = storageService.getAssessmentDraft();

      expect(program).toBeNull();
      expect(assessment).toBeNull();
    });
  });

  // ===========================================
  // PROGRESS HISTORY TESTS
  // ===========================================
  describe('progress history', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    it('should save and retrieve daily progress', async () => {
      const exercises = { 'Stretch': true, 'Squat': false };

      await storageService.saveDailyProgress(today, exercises);
      const history = await storageService.getHistory();

      expect(history[today]).toEqual(exercises);
    });

    it('should get history synchronously', async () => {
      const exercises = { 'Stretch': true };
      await storageService.saveDailyProgress(today, exercises);

      const history = storageService.getHistorySync();

      expect(history[today]).toEqual(exercises);
    });

    it('should get daily progress sync for specific date', async () => {
      const exercises = { 'Stretch': true, 'Walk': true };
      await storageService.saveDailyProgress(today, exercises);

      const progress = storageService.getDailyProgressSync(today);

      expect(progress).toEqual(exercises);
    });

    it('should return empty object for non-existent date', () => {
      const progress = storageService.getDailyProgressSync('2099-01-01');
      expect(progress).toEqual({});
    });

    it('should accumulate history across multiple days', async () => {
      await storageService.saveDailyProgress(today, { 'Stretch': true });
      await storageService.saveDailyProgress(yesterday, { 'Walk': true });

      const history = await storageService.getHistory();

      expect(history[today]).toEqual({ 'Stretch': true });
      expect(history[yesterday]).toEqual({ 'Walk': true });
    });
  });

  // ===========================================
  // ASSESSMENT DRAFT TESTS
  // ===========================================
  describe('assessment draft', () => {
    it('should save and retrieve assessment draft', () => {
      const assessment = { age: 40, injuryType: 'shoulder' };

      storageService.saveAssessmentDraft(assessment);
      const retrieved = storageService.getAssessmentDraft();

      expect(retrieved).toEqual(assessment);
    });

    it('should return null when no draft exists', () => {
      const draft = storageService.getAssessmentDraft();
      expect(draft).toBeNull();
    });
  });

  // ===========================================
  // PAIN LOG TESTS
  // ===========================================
  describe('pain logs', () => {
    const today = new Date().toISOString().split('T')[0];

    const preCheckIn: WorkoutCheckIn = {
      type: 'pre',
      timestamp: new Date().toISOString(),
      painLevel: 4,
      energyLevel: 3,
      mood: 'okej',
      notes: 'Feeling okay today'
    };

    const postCheckIn: WorkoutCheckIn = {
      type: 'post',
      timestamp: new Date().toISOString(),
      painLevel: 3,
      workoutDifficulty: 'lagom',
      notes: 'Felt better after exercise'
    };

    it('should save pre-workout check-in', async () => {
      await storageService.savePreWorkoutCheckIn(today, preCheckIn);

      expect(storageService.hasPreWorkoutCheckIn(today)).toBe(true);
      expect(storageService.hasPostWorkoutCheckIn(today)).toBe(false);
    });

    it('should save post-workout check-in', async () => {
      await storageService.savePostWorkoutCheckIn(today, postCheckIn);

      expect(storageService.hasPostWorkoutCheckIn(today)).toBe(true);
    });

    it('should save both check-ins for same day', async () => {
      await storageService.savePreWorkoutCheckIn(today, preCheckIn);
      await storageService.savePostWorkoutCheckIn(today, postCheckIn);

      expect(storageService.hasPreWorkoutCheckIn(today)).toBe(true);
      expect(storageService.hasPostWorkoutCheckIn(today)).toBe(true);

      const log = storageService.getPainLogForDate(today);
      expect(log?.preWorkout?.painLevel).toBe(4);
      expect(log?.postWorkout?.painLevel).toBe(3);
    });

    it('should return null for non-existent pain log', () => {
      const log = storageService.getPainLogForDate('2099-01-01');
      expect(log).toBeNull();
    });

    it('should get pain history', async () => {
      await storageService.savePreWorkoutCheckIn(today, preCheckIn);

      const history = storageService.getPainHistory();

      expect(history[today]).toBeDefined();
      expect(history[today].preWorkout?.painLevel).toBe(4);
    });

    it('should calculate pain trend', async () => {
      // Save multiple days of data
      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);

        await storageService.savePreWorkoutCheckIn(dateStr, {
          ...preCheckIn,
          painLevel: 5 - i // Decreasing pain
        });
      }

      const trend = storageService.getPainTrend(7);

      expect(trend).toBeDefined();
      expect(trend.length).toBe(7);
    });
  });

  // ===========================================
  // EXERCISE LOG TESTS
  // ===========================================
  describe('exercise logs', () => {
    const today = new Date().toISOString().split('T')[0];

    const exerciseLog: ExerciseLog = {
      exerciseId: `stretch_${Date.now()}`,
      exerciseName: 'Knee Stretch',
      date: today,
      completed: true,
      actualSets: 3,
      actualReps: '10',
      duration: 300,
      painDuring: 2,
      painAfter: 1,
      difficulty: 'lagom',
      notes: 'Good form throughout'
    };

    it('should save and retrieve exercise log', async () => {
      await storageService.saveExerciseLog(exerciseLog);

      const logs = storageService.getExerciseLogsForDate(today);

      expect(logs).toHaveLength(1);
      expect(logs[0].exerciseName).toBe('Knee Stretch');
    });

    it('should save multiple exercise logs for same date', async () => {
      await storageService.saveExerciseLog(exerciseLog);
      await storageService.saveExerciseLog({
        ...exerciseLog,
        exerciseId: `squat_${Date.now()}`,
        exerciseName: 'Wall Squat'
      });

      const logs = storageService.getExerciseLogsForDate(today);

      expect(logs).toHaveLength(2);
    });

    it('should update existing log with same exerciseId', async () => {
      await storageService.saveExerciseLog(exerciseLog);
      await storageService.saveExerciseLog({
        ...exerciseLog,
        actualSets: 4 // Updated value
      });

      const logs = storageService.getExerciseLogsForDate(today);

      expect(logs).toHaveLength(1);
      expect(logs[0].actualSets).toBe(4);
    });

    it('should return empty array for date with no logs', () => {
      const logs = storageService.getExerciseLogsForDate('2099-01-01');
      expect(logs).toEqual([]);
    });

    it('should get detailed exercise history', async () => {
      await storageService.saveExerciseLog(exerciseLog);

      const history = storageService.getDetailedExerciseHistory();

      expect(history[today]).toBeDefined();
      expect(history[today]).toHaveLength(1);
    });
  });

  // ===========================================
  // MILESTONE TESTS
  // ===========================================
  describe('milestones', () => {
    const milestone: Milestone = {
      id: 'first_workout-123',
      type: 'first_workout',
      achievedAt: new Date().toISOString(),
      title: 'Första Träningen!',
      description: 'Du har påbörjat din rehabiliteringsresa!',
      icon: '🎉',
      celebrated: false
    };

    it('should add and retrieve milestone', async () => {
      await storageService.addMilestone(milestone);

      const milestones = storageService.getMilestones();

      expect(milestones).toHaveLength(1);
      expect(milestones[0].title).toBe('Första Träningen!');
    });

    it('should not add duplicate milestone of same type', async () => {
      await storageService.addMilestone(milestone);
      await storageService.addMilestone({
        ...milestone,
        id: 'first_workout-456'
      });

      const milestones = storageService.getMilestones();

      expect(milestones).toHaveLength(1);
    });

    it('should mark milestone as celebrated', async () => {
      await storageService.addMilestone(milestone);
      storageService.markMilestoneCelebrated(milestone.id);

      const milestones = storageService.getMilestones();

      expect(milestones[0].celebrated).toBe(true);
    });

    it('should get uncelebrated milestones', async () => {
      await storageService.addMilestone(milestone);
      await storageService.addMilestone({
        ...milestone,
        id: 'streak_3-123',
        type: 'streak_3',
        title: '3 Dagar i Rad!',
        celebrated: false
      });

      storageService.markMilestoneCelebrated(milestone.id);

      const uncelebrated = storageService.getUncelebratedMilestones();

      expect(uncelebrated).toHaveLength(1);
      expect(uncelebrated[0].type).toBe('streak_3');
    });

    it('should return empty array when no milestones', () => {
      const milestones = storageService.getMilestones();
      expect(milestones).toEqual([]);
    });
  });

  // ===========================================
  // MOVEMENT SESSION TESTS
  // ===========================================
  describe('movement sessions', () => {
    const mockRepScore = {
      overall: 85,
      breakdown: { rom: 90, tempo: 85, symmetry: 80, stability: 85, depth: 90 },
      issues: [],
      timestamp: new Date().toISOString()
    };

    const session: MovementSession = {
      id: `session_${Date.now()}`,
      exerciseName: 'Knee Bend',
      sessionDate: new Date().toISOString(),
      duration: 180,
      repsCompleted: 10,
      averageScore: 85,
      romAchieved: 90,
      formIssues: [{ joint: 'knee', issue: 'VALGUS', severity: 'low', message: 'Slight knee valgus' }],
      repScores: Array(10).fill(mockRepScore)
    };

    it('should save and retrieve movement session', async () => {
      await storageService.saveMovementSession(session);

      const sessions = storageService.getMovementSessions();

      expect(sessions).toHaveLength(1);
      expect(sessions[0].exerciseName).toBe('Knee Bend');
      expect(sessions[0].id).toBeDefined();
    });

    it('should generate ID if not provided', async () => {
      const sessionWithoutId = { ...session };
      delete (sessionWithoutId as any).id;

      await storageService.saveMovementSession(sessionWithoutId);

      const sessions = storageService.getMovementSessions();
      expect(sessions[0].id).toBeDefined();
    });

    it('should save multiple sessions', async () => {
      await storageService.saveMovementSession(session);
      await storageService.saveMovementSession({
        ...session,
        exerciseName: 'Wall Squat',
        averageScore: 78
      });

      const sessions = storageService.getMovementSessions();

      expect(sessions).toHaveLength(2);
    });

    it('should get movement history', async () => {
      await storageService.saveMovementSession(session);

      const history = await storageService.getMovementHistory();

      expect(history).toHaveLength(1);
    });

    it('should filter movement history by exercise name', async () => {
      await storageService.saveMovementSession(session);
      await storageService.saveMovementSession({
        ...session,
        exerciseName: 'Wall Squat'
      });

      const history = await storageService.getMovementHistory('Knee');

      expect(history).toHaveLength(1);
      expect(history[0].exerciseName).toBe('Knee Bend');
    });

    it('should get recent movement sessions', async () => {
      for (let i = 0; i < 10; i++) {
        await storageService.saveMovementSession({
          ...session,
          exerciseName: `Exercise ${i}`
        });
      }

      const recent = await storageService.getRecentMovementSessions(5);

      expect(recent).toHaveLength(5);
    });

    it('should return empty array when no sessions', () => {
      const sessions = storageService.getMovementSessions();
      expect(sessions).toEqual([]);
    });
  });

  // ===========================================
  // QUALITY TREND TESTS
  // ===========================================
  describe('quality trends', () => {
    it('should calculate quality trend for exercise', async () => {
      // Create sessions over multiple days
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        await storageService.saveMovementSession({
          id: `session_trend_${i}`,
          exerciseName: 'Knee Bend',
          sessionDate: date.toISOString(),
          duration: 180,
          repsCompleted: 10,
          averageScore: 70 + i * 5, // Improving scores
          romAchieved: 90,
          formIssues: [],
          repScores: []
        });
      }

      const trend = await storageService.getQualityTrend('Knee Bend', 2);

      expect(trend.exerciseName).toBe('Knee Bend');
      expect(trend.dataPoints.length).toBeGreaterThan(0);
    });

    it('should return empty trend for non-existent exercise', async () => {
      const trend = await storageService.getQualityTrend('NonExistent', 4);

      expect(trend.dataPoints).toHaveLength(0);
      expect(trend.improvement).toBe(0);
    });
  });

  // ===========================================
  // CALIBRATION TESTS
  // ===========================================
  describe('calibration', () => {
    const calibration: CalibrationData = {
      standingHeight: 175,
      armLength: 60,
      shoulderWidth: 45,
      legLength: 85,
      neutralJointAngles: { knee: 0, hip: 0, shoulder: 0 },
      capturedAt: new Date().toISOString()
    };

    it('should save and load calibration data', async () => {
      await storageService.saveCalibration(calibration);

      const loaded = await storageService.loadCalibration();

      expect(loaded).toBeDefined();
      expect(loaded?.armLength).toBe(60);
      expect(loaded?.capturedAt).toBe(calibration.capturedAt);
    });

    it('should return null when no calibration exists', async () => {
      const loaded = await storageService.loadCalibration();
      expect(loaded).toBeNull();
    });

    it('should overwrite existing calibration', async () => {
      await storageService.saveCalibration(calibration);
      await storageService.saveCalibration({
        ...calibration,
        armLength: 65
      });

      const loaded = await storageService.loadCalibration();

      expect(loaded?.armLength).toBe(65);
    });
  });

  // ===========================================
  // SYNC QUEUE TESTS
  // ===========================================
  describe('sync queue', () => {
    it('should report zero pending sync when queue is empty', () => {
      const count = storageService.getPendingSyncCount();
      expect(count).toBe(0);
    });

    it('should handle force sync gracefully when offline/no supabase', async () => {
      // Should not throw
      await expect(storageService.forceSync()).resolves.not.toThrow();
    });
  });

  // ===========================================
  // MILESTONE CHECKING TESTS
  // ===========================================
  describe('checkAndAwardMilestones', () => {
    it('should award first workout milestone', async () => {
      const today = new Date().toISOString().split('T')[0];
      await storageService.saveDailyProgress(today, { 'Stretch': true });

      const newMilestones = await storageService.checkAndAwardMilestones();

      const firstWorkout = newMilestones.find(m => m.type === 'first_workout');
      expect(firstWorkout).toBeDefined();
      expect(firstWorkout?.title).toBe('Första Träningen!');
    });

    it('should not award duplicate milestones', async () => {
      const today = new Date().toISOString().split('T')[0];
      await storageService.saveDailyProgress(today, { 'Stretch': true });

      await storageService.checkAndAwardMilestones();
      const secondCheck = await storageService.checkAndAwardMilestones();

      const firstWorkoutMilestones = secondCheck.filter(m => m.type === 'first_workout');
      expect(firstWorkoutMilestones).toHaveLength(0);
    });

    it('should award streak milestones', async () => {
      // Create a 3-day streak
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        await storageService.saveDailyProgress(dateStr, { 'Stretch': true });
      }

      const newMilestones = await storageService.checkAndAwardMilestones();

      const streak3 = newMilestones.find(m => m.type === 'streak_3');
      expect(streak3).toBeDefined();
    });
  });
});
