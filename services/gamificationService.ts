/**
 * Gamification Service - Points & Level System
 *
 * Implementerar ett motiverande poäng- och levelsystem:
 * - Poäng för övningar, streaks, progression
 * - Level 1-10 baserat på fas + achievements
 * - Weekly challenges
 * - Leaderboard (anonymiserad)
 */

import { storageService } from './storageService';
import { logger } from '../utils/logger';

// ============================================
// TYPES
// ============================================

export interface UserPoints {
  total: number;
  weekly: number;
  breakdown: {
    exercises: number;
    streaks: number;
    milestones: number;
    challenges: number;
    consistency: number;
  };
  lastUpdated: string;
}

export interface UserLevel {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
  maxPoints: number;
  progress: number; // 0-100
  perks: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  target: number;
  current: number;
  reward: number;
  expiresAt: string;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  points: number;
  isCurrentUser: boolean;
}

// Unified reward system - merges milestones + achievements
export interface UnifiedReward {
  id: string;
  type: 'milestone' | 'achievement' | 'challenge' | 'streak';
  points: number;
  title: string;
  description: string;
  icon: string;
  achievedAt: string;
  category: keyof UserPoints['breakdown'];
}

export interface RewardNotification {
  reward: UnifiedReward;
  levelUp: boolean;
  newLevel?: UserLevel;
  newTotal: number;
}

// ============================================
// CONSTANTS
// ============================================

// Point values for different actions
export const POINT_VALUES = {
  // Exercises
  exerciseComplete: 10,
  exercisePerfect: 5, // Bonus for 'lagom' difficulty
  exerciseFirstTime: 20, // First time doing an exercise

  // Streaks
  streak3Days: 50,
  streak7Days: 150,
  streak14Days: 350,
  streak30Days: 1000,

  // Pain reduction
  painReduction10: 100,
  painReduction25: 250,
  painReduction50: 500,

  // Milestones
  milestoneAchieved: 200,
  phaseComplete: 500,

  // Challenges
  dailyChallengeComplete: 30,
  weeklyChallengeComplete: 200,
  specialChallengeComplete: 500,

  // Consistency
  weeklyAdherence70: 50,
  weeklyAdherence90: 150,
  weeklyAdherence100: 300
};

// Level definitions
export const LEVELS: Omit<UserLevel, 'progress'>[] = [
  {
    level: 1,
    name: 'Nybörjare',
    icon: '🌱',
    minPoints: 0,
    maxPoints: 100,
    perks: ['Tillgång till grundövningar']
  },
  {
    level: 2,
    name: 'Aktiv',
    icon: '🏃',
    minPoints: 100,
    maxPoints: 300,
    perks: ['Låst upp: Dagliga utmaningar']
  },
  {
    level: 3,
    name: 'Engagerad',
    icon: '💪',
    minPoints: 300,
    maxPoints: 600,
    perks: ['Låst upp: Smärtanalys-panelen']
  },
  {
    level: 4,
    name: 'Dedikerad',
    icon: '🎯',
    minPoints: 600,
    maxPoints: 1000,
    perks: ['Låst upp: Avancerade övningar']
  },
  {
    level: 5,
    name: 'Veteran',
    icon: '⭐',
    minPoints: 1000,
    maxPoints: 1500,
    perks: ['Låst upp: Weekly challenges']
  },
  {
    level: 6,
    name: 'Expert',
    icon: '🏆',
    minPoints: 1500,
    maxPoints: 2200,
    perks: ['Låst upp: Progress reports']
  },
  {
    level: 7,
    name: 'Mästare',
    icon: '👑',
    minPoints: 2200,
    maxPoints: 3000,
    perks: ['Låst upp: Special challenges']
  },
  {
    level: 8,
    name: 'Champion',
    icon: '🥇',
    minPoints: 3000,
    maxPoints: 4000,
    perks: ['Badge: Champion']
  },
  {
    level: 9,
    name: 'Legend',
    icon: '🌟',
    minPoints: 4000,
    maxPoints: 5500,
    perks: ['Badge: Legend']
  },
  {
    level: 10,
    name: 'Rehabmästare',
    icon: '💎',
    minPoints: 5500,
    maxPoints: Infinity,
    perks: ['Alla perks upplåsta', 'Badge: Rehabmästare']
  }
];

// Storage keys
const POINTS_KEY = 'rehabflow_user_points';
const CHALLENGES_KEY = 'rehabflow_challenges';

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get current user points
 */
export function getUserPoints(): UserPoints {
  try {
    const stored = localStorage.getItem(POINTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }

  return {
    total: 0,
    weekly: 0,
    breakdown: {
      exercises: 0,
      streaks: 0,
      milestones: 0,
      challenges: 0,
      consistency: 0
    },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Save user points
 */
function saveUserPoints(points: UserPoints): void {
  points.lastUpdated = new Date().toISOString();
  localStorage.setItem(POINTS_KEY, JSON.stringify(points));
}

/**
 * Award points to user
 */
export function awardPoints(
  amount: number,
  category: keyof UserPoints['breakdown'],
  reason?: string
): { newTotal: number; levelUp: boolean; newLevel?: UserLevel } {
  const points = getUserPoints();
  const oldLevel = getUserLevel(points.total);

  points.total += amount;
  points.weekly += amount;
  points.breakdown[category] += amount;

  saveUserPoints(points);

  const newLevel = getUserLevel(points.total);
  const levelUp = newLevel.level > oldLevel.level;

  if (reason) {
    logger.debug(`[Gamification] +${amount} poäng: ${reason}`);
  }

  return {
    newTotal: points.total,
    levelUp,
    newLevel: levelUp ? newLevel : undefined
  };
}

/**
 * Get user's current level based on points
 */
export function getUserLevel(points?: number): UserLevel {
  const userPoints = points ?? getUserPoints().total;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (userPoints >= LEVELS[i].minPoints) {
      const level = LEVELS[i];
      const progress = level.maxPoints === Infinity
        ? 100
        : Math.round(((userPoints - level.minPoints) / (level.maxPoints - level.minPoints)) * 100);

      return { ...level, progress: Math.min(progress, 100) };
    }
  }

  return { ...LEVELS[0], progress: 0 };
}

/**
 * Check for point rewards based on recent activity
 */
export async function checkAndAwardActivityPoints(): Promise<{
  pointsAwarded: number;
  reasons: string[];
}> {
  const points = getUserPoints();
  let totalAwarded = 0;
  const reasons: string[] = [];

  // Check today's exercises
  const today = new Date().toISOString().split('T')[0];
  const exerciseLogs = storageService.getExerciseLogsForDate(today);

  // Award for each completed exercise
  const uniqueExercises = new Set<string>();
  exerciseLogs.forEach(log => {
    if (log.completed && !uniqueExercises.has(log.exerciseName)) {
      uniqueExercises.add(log.exerciseName);

      // Base points
      let exercisePoints = POINT_VALUES.exerciseComplete;

      // Bonus for perfect difficulty
      if (log.difficulty === 'lagom') {
        exercisePoints += POINT_VALUES.exercisePerfect;
      }

      awardPoints(exercisePoints, 'exercises');
      totalAwarded += exercisePoints;
    }
  });

  if (uniqueExercises.size > 0) {
    reasons.push(`${uniqueExercises.size} övningar genomförda`);
  }

  // Check streak milestones
  const progressHistory = storageService.getHistorySync();
  const sortedDates = Object.keys(progressHistory).sort().reverse();
  let streak = 0;

  for (const date of sortedDates) {
    const hasCompleted = Object.values(progressHistory[date]).some(v => v === true);
    if (hasCompleted) streak++;
    else break;
  }

  // Award streak bonuses (only once per streak level)
  const streakRewards = [
    { threshold: 30, points: POINT_VALUES.streak30Days, key: 'streak_30_awarded' },
    { threshold: 14, points: POINT_VALUES.streak14Days, key: 'streak_14_awarded' },
    { threshold: 7, points: POINT_VALUES.streak7Days, key: 'streak_7_awarded' },
    { threshold: 3, points: POINT_VALUES.streak3Days, key: 'streak_3_awarded' }
  ];

  for (const reward of streakRewards) {
    if (streak >= reward.threshold) {
      const awarded = localStorage.getItem(reward.key);
      if (!awarded) {
        awardPoints(reward.points, 'streaks', `${reward.threshold}-dagars streak`);
        localStorage.setItem(reward.key, 'true');
        totalAwarded += reward.points;
        reasons.push(`${reward.threshold}-dagars streak bonus`);
      }
      break;
    }
  }

  // Check milestones
  const milestones = storageService.getMilestones();
  const milestonesRewarded = JSON.parse(localStorage.getItem('milestones_rewarded') || '[]');

  for (const milestone of milestones) {
    if (!milestonesRewarded.includes(milestone.id)) {
      awardPoints(POINT_VALUES.milestoneAchieved, 'milestones', `Milstolpe: ${milestone.title}`);
      milestonesRewarded.push(milestone.id);
      totalAwarded += POINT_VALUES.milestoneAchieved;
      reasons.push(`Milstolpe: ${milestone.title}`);
    }
  }
  localStorage.setItem('milestones_rewarded', JSON.stringify(milestonesRewarded));

  return { pointsAwarded: totalAwarded, reasons };
}

// ============================================
// UNIFIED REWARD SYSTEM
// ============================================

/**
 * Check and award all rewards (milestones, achievements, challenges)
 * Single entry point for the reward system
 */
export async function checkAndAwardAllRewards(): Promise<RewardNotification[]> {
  const notifications: RewardNotification[] = [];

  // 1. Check milestones from storageService and award points
  const newMilestones = await storageService.checkAndAwardMilestones();

  for (const milestone of newMilestones) {
    const reward: UnifiedReward = {
      id: milestone.id,
      type: 'milestone',
      points: POINT_VALUES.milestoneAchieved,
      title: milestone.title,
      description: milestone.description,
      icon: milestone.icon,
      achievedAt: milestone.achievedAt,
      category: 'milestones'
    };

    // Award points and track in milestones_rewarded
    const milestonesRewarded = JSON.parse(localStorage.getItem('milestones_rewarded') || '[]');
    if (!milestonesRewarded.includes(milestone.id)) {
      const result = awardPoints(POINT_VALUES.milestoneAchieved, 'milestones', `Milstolpe: ${milestone.title}`);
      milestonesRewarded.push(milestone.id);
      localStorage.setItem('milestones_rewarded', JSON.stringify(milestonesRewarded));

      notifications.push({
        reward,
        levelUp: result.levelUp,
        newLevel: result.newLevel,
        newTotal: result.newTotal
      });
    }
  }

  // 2. Check challenge completions
  const challenges = getActiveChallenges();
  for (const challenge of challenges) {
    if (challenge.completed) {
      const challengeRewarded = localStorage.getItem(`challenge_rewarded_${challenge.id}`);
      if (!challengeRewarded) {
        const reward: UnifiedReward = {
          id: challenge.id,
          type: 'challenge',
          points: challenge.reward,
          title: challenge.title,
          description: challenge.description,
          icon: challenge.type === 'daily' ? '📋' : challenge.type === 'weekly' ? '📅' : '🌟',
          achievedAt: new Date().toISOString(),
          category: 'challenges'
        };

        localStorage.setItem(`challenge_rewarded_${challenge.id}`, 'true');
        const result = awardPoints(challenge.reward, 'challenges', `Challenge: ${challenge.title}`);

        notifications.push({
          reward,
          levelUp: result.levelUp,
          newLevel: result.newLevel,
          newTotal: result.newTotal
        });
      }
    }
  }

  return notifications;
}

/**
 * Get all earned rewards (unified view)
 */
export function getAllRewards(): UnifiedReward[] {
  const rewards: UnifiedReward[] = [];

  // Get milestones from storageService
  const milestones = storageService.getMilestones();
  for (const milestone of milestones) {
    rewards.push({
      id: milestone.id,
      type: 'milestone',
      points: POINT_VALUES.milestoneAchieved,
      title: milestone.title,
      description: milestone.description,
      icon: milestone.icon,
      achievedAt: milestone.achievedAt,
      category: 'milestones'
    });
  }

  // Get completed challenges
  const challenges = getActiveChallenges();
  for (const challenge of challenges) {
    if (challenge.completed) {
      rewards.push({
        id: challenge.id,
        type: 'challenge',
        points: challenge.reward,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.type === 'daily' ? '📋' : challenge.type === 'weekly' ? '📅' : '🌟',
        achievedAt: new Date().toISOString(),
        category: 'challenges'
      });
    }
  }

  // Get streak achievements
  const streakRewards = [
    { key: 'streak_3_awarded', days: 3, points: POINT_VALUES.streak3Days },
    { key: 'streak_7_awarded', days: 7, points: POINT_VALUES.streak7Days },
    { key: 'streak_14_awarded', days: 14, points: POINT_VALUES.streak14Days },
    { key: 'streak_30_awarded', days: 30, points: POINT_VALUES.streak30Days }
  ];

  for (const sr of streakRewards) {
    if (localStorage.getItem(sr.key)) {
      rewards.push({
        id: sr.key,
        type: 'streak',
        points: sr.points,
        title: `${sr.days}-dagars streak`,
        description: `Tränat ${sr.days} dagar i rad`,
        icon: sr.days >= 30 ? '👑' : sr.days >= 14 ? '🏆' : sr.days >= 7 ? '⭐' : '🔥',
        achievedAt: '', // Unknown exact date
        category: 'streaks'
      });
    }
  }

  return rewards.sort((a, b) =>
    new Date(b.achievedAt || 0).getTime() - new Date(a.achievedAt || 0).getTime()
  );
}

/**
 * Get reward statistics
 */
export function getRewardStats(): {
  totalRewards: number;
  milestones: number;
  challenges: number;
  streaks: number;
  totalPointsFromRewards: number;
} {
  const rewards = getAllRewards();

  return {
    totalRewards: rewards.length,
    milestones: rewards.filter(r => r.type === 'milestone').length,
    challenges: rewards.filter(r => r.type === 'challenge').length,
    streaks: rewards.filter(r => r.type === 'streak').length,
    totalPointsFromRewards: rewards.reduce((sum, r) => sum + r.points, 0)
  };
}

// ============================================
// CHALLENGES
// ============================================

/**
 * Get active challenges
 */
export function getActiveChallenges(): Challenge[] {
  try {
    const stored = localStorage.getItem(CHALLENGES_KEY);
    if (stored) {
      const challenges = JSON.parse(stored) as Challenge[];

      // Filter out expired challenges
      const now = new Date().toISOString();
      return challenges.filter(c => c.expiresAt > now);
    }
  } catch {
    // Ignore errors
  }

  return [];
}

/**
 * Generate new challenges
 */
export function generateChallenges(): Challenge[] {
  const now = new Date();
  const challenges: Challenge[] = [];

  // Daily challenge
  const dailyEnd = new Date(now);
  dailyEnd.setHours(23, 59, 59, 999);

  challenges.push({
    id: `daily_${now.toISOString().split('T')[0]}`,
    title: 'Dagens utmaning',
    description: 'Genomför 3 övningar idag',
    type: 'daily',
    target: 3,
    current: 0,
    reward: POINT_VALUES.dailyChallengeComplete,
    expiresAt: dailyEnd.toISOString(),
    completed: false
  });

  // Weekly challenge
  const weeklyEnd = new Date(now);
  weeklyEnd.setDate(weeklyEnd.getDate() + (7 - weeklyEnd.getDay()));
  weeklyEnd.setHours(23, 59, 59, 999);

  challenges.push({
    id: `weekly_${Math.ceil(now.getDate() / 7)}`,
    title: 'Veckans utmaning',
    description: 'Träna minst 5 dagar denna vecka',
    type: 'weekly',
    target: 5,
    current: 0,
    reward: POINT_VALUES.weeklyChallengeComplete,
    expiresAt: weeklyEnd.toISOString(),
    completed: false
  });

  // Special challenge (pain reduction)
  const monthEnd = new Date(now);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  challenges.push({
    id: `special_pain_${now.getMonth()}`,
    title: 'Smärtreduktion',
    description: 'Sänk din genomsnittliga smärta med 2 poäng',
    type: 'special',
    target: 2,
    current: 0,
    reward: POINT_VALUES.specialChallengeComplete,
    expiresAt: monthEnd.toISOString(),
    completed: false
  });

  saveChallenges(challenges);
  return challenges;
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(challengeId: string, progress: number): Challenge | null {
  const challenges = getActiveChallenges();
  const index = challenges.findIndex(c => c.id === challengeId);

  if (index === -1) return null;

  challenges[index].current = progress;

  if (progress >= challenges[index].target && !challenges[index].completed) {
    challenges[index].completed = true;
    awardPoints(challenges[index].reward, 'challenges', `Challenge: ${challenges[index].title}`);
  }

  saveChallenges(challenges);
  return challenges[index];
}

/**
 * Save challenges
 */
function saveChallenges(challenges: Challenge[]): void {
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
}

// ============================================
// LEADERBOARD (Mock)
// ============================================

/**
 * Get leaderboard (mock data for demo)
 */
export function getLeaderboard(): LeaderboardEntry[] {
  const userPoints = getUserPoints();
  const userLevel = getUserLevel();

  // Generate mock entries
  const mockEntries: LeaderboardEntry[] = [
    { rank: 1, name: 'RehabKing', level: 8, points: 3500, isCurrentUser: false },
    { rank: 2, name: 'FitnessQueen', level: 7, points: 2800, isCurrentUser: false },
    { rank: 3, name: 'PainSlayer', level: 7, points: 2650, isCurrentUser: false },
    { rank: 4, name: 'StrengthBuilder', level: 6, points: 2100, isCurrentUser: false },
    { rank: 5, name: 'RecoveryPro', level: 6, points: 1900, isCurrentUser: false },
    { rank: 6, name: 'MobilityMaster', level: 5, points: 1500, isCurrentUser: false },
    { rank: 7, name: 'WellnessWarrior', level: 5, points: 1350, isCurrentUser: false },
    { rank: 8, name: 'HealingHero', level: 4, points: 950, isCurrentUser: false },
    { rank: 9, name: 'FlexChamp', level: 4, points: 800, isCurrentUser: false },
    { rank: 10, name: 'RehabRookie', level: 3, points: 450, isCurrentUser: false }
  ];

  // Insert current user
  const userEntry: LeaderboardEntry = {
    rank: 0,
    name: 'Du',
    level: userLevel.level,
    points: userPoints.total,
    isCurrentUser: true
  };

  // Find position
  let inserted = false;
  const result: LeaderboardEntry[] = [];

  for (let i = 0; i < mockEntries.length; i++) {
    if (!inserted && userPoints.total > mockEntries[i].points) {
      userEntry.rank = i + 1;
      result.push(userEntry);
      inserted = true;
    }
    mockEntries[i].rank = result.length + 1;
    result.push(mockEntries[i]);
  }

  if (!inserted) {
    userEntry.rank = result.length + 1;
    result.push(userEntry);
  }

  return result.slice(0, 10);
}

// ============================================
// RESET (for testing)
// ============================================

export function resetGamificationData(): void {
  localStorage.removeItem(POINTS_KEY);
  localStorage.removeItem(CHALLENGES_KEY);
  localStorage.removeItem('milestones_rewarded');
  localStorage.removeItem('streak_3_awarded');
  localStorage.removeItem('streak_7_awarded');
  localStorage.removeItem('streak_14_awarded');
  localStorage.removeItem('streak_30_awarded');
}
