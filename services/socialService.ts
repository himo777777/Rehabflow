/**
 * Social Service - Sprint 5.8
 *
 * Handles social sharing and community features.
 * Features:
 * - Web Share API integration
 * - Social media sharing
 * - Achievement sharing cards
 * - Community challenges
 * - Friend progress comparison
 * - Leaderboard integration
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
  image?: Blob;
  hashtags?: string[];
}

export interface ShareResult {
  success: boolean;
  platform?: string;
  error?: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'exercise' | 'streak' | 'pain_reduction' | 'custom';
  target: number;
  unit: string;
  participants: number;
  progress: number;
  rank?: number;
  rewards: {
    points: number;
    badge?: string;
  };
}

export interface ShareableAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar?: string;
  points: number;
  level: number;
  streak: number;
  isCurrentUser: boolean;
  change: number; // Position change from last period
}

export interface SocialProfile {
  userId: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isPublic: boolean;
  achievements: number;
  totalPoints: number;
  currentStreak: number;
  joinedDate: string;
}

export interface SocialConfig {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnLeaderboard: boolean;
  allowFriendRequests: boolean;
  shareAchievements: boolean;
  enableCommunityChalllenges: boolean;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: SocialConfig = {
  profileVisibility: 'friends',
  showOnLeaderboard: true,
  allowFriendRequests: true,
  shareAchievements: true,
  enableCommunityChalllenges: true,
};

// Storage keys
const CONFIG_KEY = 'rehabflow-social-config';
const PROFILE_KEY = 'rehabflow-social-profile';

// ============================================================================
// SOCIAL SERVICE
// ============================================================================

class SocialService {
  private config: SocialConfig = DEFAULT_CONFIG;
  private profile: SocialProfile | null = null;

  constructor() {
    this.loadConfig();
    this.loadProfile();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Check if Web Share API is supported
   */
  public isShareSupported(): boolean {
    return 'share' in navigator;
  }

  /**
   * Check if sharing files is supported
   */
  public isFileShareSupported(): boolean {
    return 'canShare' in navigator;
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
      logger.error('[Social] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Social] Failed to save config:', error);
    }
  }

  public getConfig(): SocialConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SocialConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    logger.debug('[Social] Config updated:', updates);
  }

  // --------------------------------------------------------------------------
  // PROFILE
  // --------------------------------------------------------------------------

  private loadProfile(): void {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) {
        this.profile = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('[Social] Failed to load profile:', error);
    }
  }

  private saveProfile(): void {
    try {
      if (this.profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile));
      }
    } catch (error) {
      logger.error('[Social] Failed to save profile:', error);
    }
  }

  public getProfile(): SocialProfile | null {
    return this.profile ? { ...this.profile } : null;
  }

  public updateProfile(updates: Partial<SocialProfile>): void {
    if (!this.profile) {
      this.profile = {
        userId: `user_${Date.now()}`,
        displayName: 'Användare',
        isPublic: false,
        achievements: 0,
        totalPoints: 0,
        currentStreak: 0,
        joinedDate: new Date().toISOString(),
        ...updates,
      };
    } else {
      this.profile = { ...this.profile, ...updates };
    }

    this.saveProfile();
    logger.debug('[Social] Profile updated:', updates);
  }

  // --------------------------------------------------------------------------
  // SHARING
  // --------------------------------------------------------------------------

  /**
   * Share content using Web Share API
   */
  public async share(content: ShareContent): Promise<ShareResult> {
    if (!this.isShareSupported()) {
      return this.fallbackShare(content);
    }

    try {
      const shareData: ShareData = {
        title: content.title,
        text: content.text,
        url: content.url,
      };

      // Check if we can share files
      if (content.image && this.isFileShareSupported()) {
        const file = new File([content.image], 'achievement.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }

      await navigator.share(shareData);

      logger.info('[Social] Content shared successfully');
      return { success: true };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        logger.debug('[Social] Share cancelled by user');
        return { success: false, error: 'Delning avbruten' };
      }

      logger.error('[Social] Share failed:', error);
      return this.fallbackShare(content);
    }
  }

  /**
   * Fallback sharing for unsupported browsers
   */
  private fallbackShare(content: ShareContent): ShareResult {
    const shareText = `${content.title}\n\n${content.text}`;
    const url = content.url || window.location.href;

    // Try to copy to clipboard
    try {
      navigator.clipboard.writeText(`${shareText}\n${url}`);
      return { success: true, platform: 'clipboard' };
    } catch {
      return { success: false, error: 'Kunde inte dela innehållet' };
    }
  }

  /**
   * Share to specific platform
   */
  public async shareToPlattform(
    platform: 'twitter' | 'facebook' | 'linkedin' | 'email',
    content: ShareContent
  ): Promise<ShareResult> {
    const text = encodeURIComponent(`${content.title} - ${content.text}`);
    const url = encodeURIComponent(content.url || window.location.href);
    const hashtags = content.hashtags?.join(',') || 'rehabflow,träning';

    let shareUrl: string;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
        break;

      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;

      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;

      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(content.title)}&body=${text}%0A%0A${url}`;
        break;

      default:
        return { success: false, error: 'Okänd plattform' };
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    return { success: true, platform };
  }

  // --------------------------------------------------------------------------
  // ACHIEVEMENT SHARING
  // --------------------------------------------------------------------------

  /**
   * Generate shareable achievement card
   */
  public async generateAchievementCard(
    achievement: ShareableAchievement
  ): Promise<Blob | null> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      if (!ctx) return null;

      // Background gradient based on rarity
      const colors = {
        common: ['#94a3b8', '#64748b'],
        rare: ['#3b82f6', '#1d4ed8'],
        epic: ['#8b5cf6', '#6d28d9'],
        legendary: ['#f59e0b', '#d97706'],
      };

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, colors[achievement.rarity][0]);
      gradient.addColorStop(1, colors[achievement.rarity][1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add card border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Icon
      ctx.font = '80px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(achievement.icon, 120, 220);

      // Title
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(achievement.title, 200, 160);

      // Description
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(achievement.description, 200, 200);

      // Rarity badge
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      const rarityText = {
        common: 'VANLIG',
        rare: 'SÄLLSYNT',
        epic: 'EPISK',
        legendary: 'LEGENDÄR',
      };
      ctx.fillText(rarityText[achievement.rarity], 200, 240);

      // Date
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText(
        `Uppnådd: ${new Date(achievement.earnedAt).toLocaleDateString('sv-SE')}`,
        200,
        270
      );

      // RehabFlow branding
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('RehabFlow', canvas.width - 40, canvas.height - 40);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (error) {
      logger.error('[Social] Failed to generate achievement card:', error);
      return null;
    }
  }

  /**
   * Share an achievement
   */
  public async shareAchievement(achievement: ShareableAchievement): Promise<ShareResult> {
    const image = await this.generateAchievementCard(achievement);

    const content: ShareContent = {
      title: `Jag låste upp "${achievement.title}"!`,
      text: achievement.description,
      url: window.location.origin,
      image: image || undefined,
      hashtags: ['rehabflow', 'träning', 'prestation'],
    };

    return this.share(content);
  }

  // --------------------------------------------------------------------------
  // COMMUNITY CHALLENGES
  // --------------------------------------------------------------------------

  /**
   * Get active community challenges
   */
  public getActiveChallenges(): CommunityChallenge[] {
    // In a real app, this would fetch from a server
    // For now, return mock data
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));

    return [
      {
        id: 'weekly_movement',
        title: 'Veckans rörelseresa',
        description: 'Genomför 30 övningar denna vecka tillsammans med samhället',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString(),
        endDate: weekEnd.toISOString(),
        type: 'exercise',
        target: 30,
        unit: 'övningar',
        participants: 1247,
        progress: 12,
        rank: 156,
        rewards: {
          points: 500,
          badge: '🏃',
        },
      },
      {
        id: 'streak_challenge',
        title: 'Konsistens är nyckeln',
        description: 'Träna varje dag i 7 dagar',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'streak',
        target: 7,
        unit: 'dagar',
        participants: 892,
        progress: 3,
        rewards: {
          points: 350,
          badge: '🔥',
        },
      },
      {
        id: 'pain_reduction',
        title: 'Smärtfri framtid',
        description: 'Sänk din smärtnivå med 10% denna månad',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
        type: 'pain_reduction',
        target: 10,
        unit: '%',
        participants: 634,
        progress: 5,
        rewards: {
          points: 1000,
          badge: '💪',
        },
      },
    ];
  }

  /**
   * Join a community challenge
   */
  public async joinChallenge(challengeId: string): Promise<boolean> {
    // In a real app, this would call the server
    logger.info('[Social] Joined challenge:', challengeId);
    return true;
  }

  /**
   * Leave a community challenge
   */
  public async leaveChallenge(challengeId: string): Promise<boolean> {
    // In a real app, this would call the server
    logger.info('[Social] Left challenge:', challengeId);
    return true;
  }

  // --------------------------------------------------------------------------
  // LEADERBOARD
  // --------------------------------------------------------------------------

  /**
   * Get leaderboard data
   */
  public getLeaderboard(
    type: 'global' | 'friends' | 'weekly' = 'global',
    limit: number = 10
  ): LeaderboardEntry[] {
    // In a real app, this would fetch from a server
    // For now, return mock data

    const mockEntries: LeaderboardEntry[] = [
      { rank: 1, userId: 'user1', displayName: 'MästarRehab', points: 12450, level: 10, streak: 45, isCurrentUser: false, change: 0 },
      { rank: 2, userId: 'user2', displayName: 'FitnessGuru', points: 11230, level: 9, streak: 38, isCurrentUser: false, change: 1 },
      { rank: 3, userId: 'user3', displayName: 'Träningshjälten', points: 10890, level: 9, streak: 32, isCurrentUser: false, change: -1 },
      { rank: 4, userId: 'user4', displayName: 'RehabPro', points: 9870, level: 8, streak: 28, isCurrentUser: false, change: 2 },
      { rank: 5, userId: 'user5', displayName: 'MotionMästare', points: 8950, level: 8, streak: 25, isCurrentUser: false, change: 0 },
      { rank: 6, userId: 'user6', displayName: 'StretchKing', points: 7890, level: 7, streak: 21, isCurrentUser: false, change: -2 },
      { rank: 7, userId: 'user7', displayName: 'SmärtFri', points: 7230, level: 7, streak: 19, isCurrentUser: false, change: 1 },
      { rank: 8, userId: 'user8', displayName: 'ÖvningsVän', points: 6540, level: 6, streak: 15, isCurrentUser: false, change: 3 },
      { rank: 9, userId: 'current', displayName: 'Du', points: 5890, level: 6, streak: 12, isCurrentUser: true, change: 2 },
      { rank: 10, userId: 'user10', displayName: 'NybörjarPro', points: 5230, level: 5, streak: 8, isCurrentUser: false, change: -1 },
    ];

    return mockEntries.slice(0, limit);
  }

  /**
   * Get user's rank
   */
  public getUserRank(): { rank: number; totalUsers: number; percentile: number } {
    // Mock data
    return {
      rank: 9,
      totalUsers: 5420,
      percentile: Math.round((1 - 9 / 5420) * 100),
    };
  }

  // --------------------------------------------------------------------------
  // PROGRESS SHARING
  // --------------------------------------------------------------------------

  /**
   * Share weekly progress summary
   */
  public async shareWeeklyProgress(stats: {
    exercisesCompleted: number;
    totalMinutes: number;
    streak: number;
    painReduction?: number;
  }): Promise<ShareResult> {
    const content: ShareContent = {
      title: 'Min vecka med RehabFlow',
      text: `Denna vecka har jag:
- Genomfört ${stats.exercisesCompleted} övningar
- Tränat i ${stats.totalMinutes} minuter
- ${stats.streak} dagars streak! 🔥
${stats.painReduction ? `- Minskat smärtan med ${stats.painReduction}%` : ''}`,
      url: window.location.origin,
      hashtags: ['rehabflow', 'träning', 'rehabilitering'],
    };

    return this.share(content);
  }

  /**
   * Share milestone
   */
  public async shareMilestone(milestone: {
    title: string;
    description: string;
    icon: string;
  }): Promise<ShareResult> {
    const content: ShareContent = {
      title: `${milestone.icon} Ny milstolpe uppnådd!`,
      text: `${milestone.title}\n${milestone.description}`,
      url: window.location.origin,
      hashtags: ['rehabflow', 'milstolpe'],
    };

    return this.share(content);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const socialService = new SocialService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useSocial() {
  const [config, setConfig] = useState<SocialConfig>(socialService.getConfig());
  const [profile, setProfile] = useState<SocialProfile | null>(socialService.getProfile());
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);

  useEffect(() => {
    setChallenges(socialService.getActiveChallenges());
  }, []);

  const updateConfig = useCallback((updates: Partial<SocialConfig>) => {
    socialService.updateConfig(updates);
    setConfig(socialService.getConfig());
  }, []);

  const updateProfile = useCallback((updates: Partial<SocialProfile>) => {
    socialService.updateProfile(updates);
    setProfile(socialService.getProfile());
  }, []);

  const share = useCallback(async (content: ShareContent) => {
    return socialService.share(content);
  }, []);

  const shareAchievement = useCallback(async (achievement: ShareableAchievement) => {
    return socialService.shareAchievement(achievement);
  }, []);

  const shareWeeklyProgress = useCallback(async (stats: {
    exercisesCompleted: number;
    totalMinutes: number;
    streak: number;
    painReduction?: number;
  }) => {
    return socialService.shareWeeklyProgress(stats);
  }, []);

  return {
    // State
    isShareSupported: socialService.isShareSupported(),
    config,
    profile,
    challenges,

    // Methods
    share,
    shareToPlattform: socialService.shareToPlattform.bind(socialService),
    shareAchievement,
    shareWeeklyProgress,
    shareMilestone: socialService.shareMilestone.bind(socialService),

    // Config
    updateConfig,
    updateProfile,

    // Challenges
    joinChallenge: socialService.joinChallenge.bind(socialService),
    leaveChallenge: socialService.leaveChallenge.bind(socialService),
    refreshChallenges: () => setChallenges(socialService.getActiveChallenges()),

    // Leaderboard
    getLeaderboard: socialService.getLeaderboard.bind(socialService),
    getUserRank: socialService.getUserRank.bind(socialService),
  };
}

export default socialService;
