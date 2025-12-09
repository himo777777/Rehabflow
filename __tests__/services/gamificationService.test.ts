import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock storageService
vi.mock('../../services/storageService', () => ({
  storageService: {
    getExerciseLogsForDate: vi.fn(() => []),
    getHistorySync: vi.fn(() => ({})),
    getMilestones: vi.fn(() => []),
    checkAndAwardMilestones: vi.fn(async () => [])
  }
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
import {
  getUserPoints,
  getUserLevel,
  awardPoints,
  checkAndAwardActivityPoints,
  checkAndAwardAllRewards,
  getAllRewards,
  getRewardStats,
  getActiveChallenges,
  generateChallenges,
  updateChallengeProgress,
  getLeaderboard,
  resetGamificationData,
  POINT_VALUES,
  LEVELS,
  type UserPoints,
  type UserLevel,
  type Challenge
} from '../../services/gamificationService';
import { storageService } from '../../services/storageService';

describe('gamificationService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    resetGamificationData();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // USER POINTS TESTS
  // ===========================================
  describe('getUserPoints', () => {
    it('should return default points when no data exists', () => {
      const points = getUserPoints();

      expect(points.total).toBe(0);
      expect(points.weekly).toBe(0);
      expect(points.breakdown.exercises).toBe(0);
      expect(points.breakdown.streaks).toBe(0);
      expect(points.breakdown.milestones).toBe(0);
      expect(points.breakdown.challenges).toBe(0);
      expect(points.breakdown.consistency).toBe(0);
    });

    it('should return saved points', () => {
      const savedPoints: UserPoints = {
        total: 500,
        weekly: 100,
        breakdown: {
          exercises: 200,
          streaks: 150,
          milestones: 100,
          challenges: 50,
          consistency: 0
        },
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem('rehabflow_user_points', JSON.stringify(savedPoints));

      const points = getUserPoints();

      expect(points.total).toBe(500);
      expect(points.weekly).toBe(100);
      expect(points.breakdown.exercises).toBe(200);
    });
  });

  // ===========================================
  // AWARD POINTS TESTS
  // ===========================================
  describe('awardPoints', () => {
    it('should award points to total and category', () => {
      const result = awardPoints(100, 'exercises', 'Test award');

      expect(result.newTotal).toBe(100);
      expect(result.levelUp).toBe(true); // Level 1 -> 2 at 100 points
      expect(result.newLevel?.level).toBe(2);

      const points = getUserPoints();
      expect(points.total).toBe(100);
      expect(points.breakdown.exercises).toBe(100);
    });

    it('should accumulate points across multiple awards', () => {
      awardPoints(50, 'exercises');
      awardPoints(30, 'streaks');
      awardPoints(20, 'milestones');

      const points = getUserPoints();

      expect(points.total).toBe(100);
      expect(points.breakdown.exercises).toBe(50);
      expect(points.breakdown.streaks).toBe(30);
      expect(points.breakdown.milestones).toBe(20);
    });

    it('should track weekly points', () => {
      awardPoints(100, 'exercises');
      awardPoints(50, 'challenges');

      const points = getUserPoints();

      expect(points.weekly).toBe(150);
    });

    it('should detect level up', () => {
      // Start at 0 points (level 1)
      const result1 = awardPoints(99, 'exercises');
      expect(result1.levelUp).toBe(false);

      // Award 1 more point to reach 100 (level 2)
      const result2 = awardPoints(1, 'exercises');
      expect(result2.levelUp).toBe(true);
      expect(result2.newLevel?.level).toBe(2);
      expect(result2.newLevel?.name).toBe('Aktiv');
    });
  });

  // ===========================================
  // USER LEVEL TESTS
  // ===========================================
  describe('getUserLevel', () => {
    it('should return level 1 for 0 points', () => {
      const level = getUserLevel(0);

      expect(level.level).toBe(1);
      expect(level.name).toBe('Nybörjare');
      expect(level.icon).toBe('🌱');
      expect(level.progress).toBe(0);
    });

    it('should return level 2 for 100+ points', () => {
      const level = getUserLevel(100);

      expect(level.level).toBe(2);
      expect(level.name).toBe('Aktiv');
      expect(level.icon).toBe('🏃');
    });

    it('should calculate progress within level', () => {
      // Level 2 is 100-300 points (200 point range)
      // At 200 points, we're 50% through
      const level = getUserLevel(200);

      expect(level.level).toBe(2);
      expect(level.progress).toBe(50);
    });

    it('should return level 10 for very high points', () => {
      const level = getUserLevel(10000);

      expect(level.level).toBe(10);
      expect(level.name).toBe('Rehabmästare');
      expect(level.icon).toBe('💎');
      expect(level.progress).toBe(100);
    });

    it('should use stored points when no argument provided', () => {
      awardPoints(300, 'exercises');

      const level = getUserLevel();

      expect(level.level).toBe(3);
      expect(level.name).toBe('Engagerad');
    });
  });

  // ===========================================
  // LEVELS CONSTANTS
  // ===========================================
  describe('LEVELS', () => {
    it('should have 10 levels', () => {
      expect(LEVELS).toHaveLength(10);
    });

    it('should have increasing point thresholds', () => {
      for (let i = 1; i < LEVELS.length; i++) {
        expect(LEVELS[i].minPoints).toBeGreaterThan(LEVELS[i - 1].minPoints);
      }
    });

    it('should have continuous point ranges', () => {
      for (let i = 0; i < LEVELS.length - 1; i++) {
        expect(LEVELS[i].maxPoints).toBe(LEVELS[i + 1].minPoints);
      }
    });

    it('should have level 10 with infinite max points', () => {
      expect(LEVELS[9].maxPoints).toBe(Infinity);
    });
  });

  // ===========================================
  // POINT VALUES CONSTANTS
  // ===========================================
  describe('POINT_VALUES', () => {
    it('should have positive values for all actions', () => {
      Object.values(POINT_VALUES).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });
    });

    it('should have increasing streak rewards', () => {
      expect(POINT_VALUES.streak7Days).toBeGreaterThan(POINT_VALUES.streak3Days);
      expect(POINT_VALUES.streak14Days).toBeGreaterThan(POINT_VALUES.streak7Days);
      expect(POINT_VALUES.streak30Days).toBeGreaterThan(POINT_VALUES.streak14Days);
    });

    it('should have increasing pain reduction rewards', () => {
      expect(POINT_VALUES.painReduction25).toBeGreaterThan(POINT_VALUES.painReduction10);
      expect(POINT_VALUES.painReduction50).toBeGreaterThan(POINT_VALUES.painReduction25);
    });
  });

  // ===========================================
  // CHALLENGES TESTS
  // ===========================================
  describe('challenges', () => {
    describe('generateChallenges', () => {
      it('should generate daily, weekly, and special challenges', () => {
        const challenges = generateChallenges();

        expect(challenges).toHaveLength(3);

        const daily = challenges.find(c => c.type === 'daily');
        const weekly = challenges.find(c => c.type === 'weekly');
        const special = challenges.find(c => c.type === 'special');

        expect(daily).toBeDefined();
        expect(weekly).toBeDefined();
        expect(special).toBeDefined();
      });

      it('should set correct expiration times', () => {
        const challenges = generateChallenges();
        const now = new Date();

        const daily = challenges.find(c => c.type === 'daily')!;
        const dailyExpiry = new Date(daily.expiresAt);

        // Daily should expire today at 23:59:59
        expect(dailyExpiry.getDate()).toBe(now.getDate());
        expect(dailyExpiry.getHours()).toBe(23);
      });

      it('should initialize challenges as not completed', () => {
        const challenges = generateChallenges();

        challenges.forEach(c => {
          expect(c.completed).toBe(false);
          expect(c.current).toBe(0);
        });
      });

      it('should set reward points for each challenge type', () => {
        const challenges = generateChallenges();

        const daily = challenges.find(c => c.type === 'daily')!;
        const weekly = challenges.find(c => c.type === 'weekly')!;
        const special = challenges.find(c => c.type === 'special')!;

        expect(daily.reward).toBe(POINT_VALUES.dailyChallengeComplete);
        expect(weekly.reward).toBe(POINT_VALUES.weeklyChallengeComplete);
        expect(special.reward).toBe(POINT_VALUES.specialChallengeComplete);
      });
    });

    describe('getActiveChallenges', () => {
      it('should return empty array when no challenges exist', () => {
        const challenges = getActiveChallenges();
        expect(challenges).toEqual([]);
      });

      it('should return generated challenges', () => {
        generateChallenges();

        const challenges = getActiveChallenges();

        expect(challenges.length).toBeGreaterThan(0);
      });

      it('should filter out expired challenges', () => {
        // Generate challenges
        generateChallenges();

        // Manually expire a challenge
        const challenges = getActiveChallenges();
        challenges[0].expiresAt = new Date(Date.now() - 86400000).toISOString();
        localStorage.setItem('rehabflow_challenges', JSON.stringify(challenges));

        const active = getActiveChallenges();

        // Should have one less challenge
        expect(active.length).toBe(challenges.length - 1);
      });
    });

    describe('updateChallengeProgress', () => {
      it('should update challenge progress', () => {
        generateChallenges();
        const challenges = getActiveChallenges();
        const dailyChallenge = challenges.find(c => c.type === 'daily')!;

        const updated = updateChallengeProgress(dailyChallenge.id, 2);

        expect(updated?.current).toBe(2);
        expect(updated?.completed).toBe(false);
      });

      it('should mark challenge as completed when target reached', () => {
        generateChallenges();
        const challenges = getActiveChallenges();
        const dailyChallenge = challenges.find(c => c.type === 'daily')!;

        const updated = updateChallengeProgress(dailyChallenge.id, dailyChallenge.target);

        expect(updated?.completed).toBe(true);
      });

      it('should return null for non-existent challenge', () => {
        const result = updateChallengeProgress('non_existent', 1);
        expect(result).toBeNull();
      });

      it('should award points when challenge completed', () => {
        generateChallenges();
        const challenges = getActiveChallenges();
        const dailyChallenge = challenges.find(c => c.type === 'daily')!;

        const initialPoints = getUserPoints().total;
        updateChallengeProgress(dailyChallenge.id, dailyChallenge.target);
        const newPoints = getUserPoints().total;

        expect(newPoints).toBe(initialPoints + dailyChallenge.reward);
      });
    });
  });

  // ===========================================
  // LEADERBOARD TESTS
  // ===========================================
  describe('getLeaderboard', () => {
    it('should return up to 10 entries', () => {
      const leaderboard = getLeaderboard();
      expect(leaderboard.length).toBeLessThanOrEqual(10);
      expect(leaderboard.length).toBeGreaterThan(0);
    });

    it('should include current user entry', () => {
      const leaderboard = getLeaderboard();
      // User might be at the end with 0 points
      const currentUser = leaderboard.find(e => e.isCurrentUser);

      // If user has 0 points, they may be ranked at the end or not included in top 10
      // The implementation inserts user based on points comparison
      // With 0 points, user would be at rank 11+ which may be cut off
      // Let's award some points first to ensure user is included
      awardPoints(500, 'exercises');
      const leaderboard2 = getLeaderboard();
      const currentUser2 = leaderboard2.find(e => e.isCurrentUser);

      expect(currentUser2).toBeDefined();
      expect(currentUser2?.name).toBe('Du');
    });

    it('should rank user based on points', () => {
      // Award points to current user
      awardPoints(3000, 'exercises');

      const leaderboard = getLeaderboard();
      const currentUser = leaderboard.find(e => e.isCurrentUser)!;

      // With 3000 points, user should be ranked high
      expect(currentUser.rank).toBeLessThanOrEqual(5);
    });

    it('should have entries sorted by rank', () => {
      const leaderboard = getLeaderboard();

      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].rank).toBeLessThan(leaderboard[i + 1].rank);
      }
    });
  });

  // ===========================================
  // UNIFIED REWARDS TESTS
  // ===========================================
  describe('unified rewards', () => {
    describe('getAllRewards', () => {
      it('should return empty array when no rewards earned', () => {
        const rewards = getAllRewards();
        expect(rewards).toEqual([]);
      });

      it('should include streak rewards when awarded', () => {
        localStorage.setItem('streak_3_awarded', 'true');

        const rewards = getAllRewards();
        const streakReward = rewards.find(r => r.type === 'streak');

        expect(streakReward).toBeDefined();
        expect(streakReward?.title).toBe('3-dagars streak');
      });

      it('should include milestones from storageService', () => {
        vi.mocked(storageService.getMilestones).mockReturnValue([
          {
            id: 'test-milestone',
            type: 'first_workout',
            achievedAt: new Date().toISOString(),
            title: 'Test Milestone',
            description: 'Test description',
            icon: '🎉',
            celebrated: false
          }
        ]);

        const rewards = getAllRewards();
        const milestone = rewards.find(r => r.type === 'milestone');

        expect(milestone).toBeDefined();
        expect(milestone?.title).toBe('Test Milestone');
      });
    });

    describe('getRewardStats', () => {
      it('should return zero stats when no rewards', () => {
        // Reset mocks to ensure clean state
        vi.mocked(storageService.getMilestones).mockReturnValue([]);

        const stats = getRewardStats();

        expect(stats.milestones).toBe(0);
        expect(stats.challenges).toBe(0);
        expect(stats.streaks).toBe(0);
      });

      it('should count rewards by type', () => {
        localStorage.setItem('streak_3_awarded', 'true');
        localStorage.setItem('streak_7_awarded', 'true');

        vi.mocked(storageService.getMilestones).mockReturnValue([
          {
            id: 'test',
            type: 'first_workout',
            achievedAt: '',
            title: 'Test',
            description: '',
            icon: '',
            celebrated: false
          }
        ]);

        const stats = getRewardStats();

        expect(stats.streaks).toBe(2);
        expect(stats.milestones).toBe(1);
        expect(stats.totalRewards).toBe(3);
      });
    });
  });

  // ===========================================
  // ACTIVITY POINTS TESTS
  // ===========================================
  describe('checkAndAwardActivityPoints', () => {
    it('should return zero points when no activity', async () => {
      // Ensure clean mocks
      vi.mocked(storageService.getExerciseLogsForDate).mockReturnValue([]);
      vi.mocked(storageService.getHistorySync).mockReturnValue({});
      vi.mocked(storageService.getMilestones).mockReturnValue([]);

      const result = await checkAndAwardActivityPoints();

      expect(result.pointsAwarded).toBe(0);
      expect(result.reasons).toHaveLength(0);
    });

    it('should award points for completed exercises', async () => {
      vi.mocked(storageService.getExerciseLogsForDate).mockReturnValue([
        {
          exerciseId: 'test-1',
          exerciseName: 'Stretch',
          date: new Date().toISOString().split('T')[0],
          setsCompleted: 3,
          repsPerSet: [10, 10, 10],
          duration: 300,
          completed: true,
          difficulty: 'lagom',
          painDuring: 0,
          painAfter: 0
        }
      ]);

      const result = await checkAndAwardActivityPoints();

      expect(result.pointsAwarded).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // RESET TESTS
  // ===========================================
  describe('resetGamificationData', () => {
    it('should clear all gamification data', () => {
      // Set up some data
      awardPoints(500, 'exercises');
      generateChallenges();
      localStorage.setItem('streak_3_awarded', 'true');

      // Reset
      resetGamificationData();

      // Verify cleared
      const points = getUserPoints();
      const challenges = getActiveChallenges();

      expect(points.total).toBe(0);
      expect(challenges).toHaveLength(0);
      expect(localStorage.getItem('streak_3_awarded')).toBeNull();
    });
  });
});
