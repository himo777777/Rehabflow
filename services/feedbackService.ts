/**
 * Feedback Service - Sprint 5.13
 *
 * Collects and manages user feedback within the application.
 * Features:
 * - In-app feedback forms
 * - Bug reporting
 * - Feature requests
 * - User ratings
 * - Screenshot capture
 * - Feedback analytics
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'praise' | 'other';
export type FeedbackStatus = 'submitted' | 'reviewing' | 'planned' | 'in_progress' | 'completed' | 'declined';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  rating?: number; // 1-5
  status: FeedbackStatus;
  priority: Priority;
  category?: string;
  screenshot?: string; // Base64 data URL
  deviceInfo: DeviceInfo;
  appVersion: string;
  userId?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  votes?: number;
  response?: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenSize: string;
  colorDepth: number;
  online: boolean;
  cookiesEnabled: boolean;
  localStorage: boolean;
}

export interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  averageRating: number;
  ratingDistribution: number[];
}

export interface FeedbackConfig {
  enabled: boolean;
  allowScreenshots: boolean;
  allowAnonymous: boolean;
  categories: string[];
  minDescriptionLength: number;
  maxDescriptionLength: number;
  showPromptAfterDays: number;
  showPromptAfterSessions: number;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: FeedbackConfig = {
  enabled: true,
  allowScreenshots: true,
  allowAnonymous: true,
  categories: [
    'Övningar',
    'Framsteg',
    'Design',
    'Prestanda',
    'Tillgänglighet',
    'Övrigt'
  ],
  minDescriptionLength: 10,
  maxDescriptionLength: 2000,
  showPromptAfterDays: 7,
  showPromptAfterSessions: 5,
};

// Storage keys
const CONFIG_KEY = 'rehabflow-feedback-config';
const FEEDBACK_KEY = 'rehabflow-feedback-items';
const PROMPT_KEY = 'rehabflow-feedback-prompt';

// App version
const APP_VERSION = '1.0.0';

// ============================================================================
// FEEDBACK SERVICE
// ============================================================================

class FeedbackService {
  private config: FeedbackConfig = DEFAULT_CONFIG;
  private feedbackItems: Map<string, Feedback> = new Map();

  constructor() {
    this.loadConfig();
    this.loadFeedback();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[Feedback] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Feedback] Failed to save config:', error);
    }
  }

  private loadFeedback(): void {
    try {
      const stored = localStorage.getItem(FEEDBACK_KEY);
      if (stored) {
        const items = JSON.parse(stored) as Feedback[];
        items.forEach(f => this.feedbackItems.set(f.id, f));
      }
    } catch (error) {
      logger.error('[Feedback] Failed to load feedback:', error);
    }
  }

  private saveFeedback(): void {
    try {
      const items = Array.from(this.feedbackItems.values());
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items));
    } catch (error) {
      logger.error('[Feedback] Failed to save feedback:', error);
    }
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  public getConfig(): FeedbackConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<FeedbackConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    logger.debug('[Feedback] Config updated:', updates);
  }

  // --------------------------------------------------------------------------
  // DEVICE INFO
  // --------------------------------------------------------------------------

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined',
    };
  }

  // --------------------------------------------------------------------------
  // SCREENSHOT
  // --------------------------------------------------------------------------

  /**
   * Capture screenshot of current view
   */
  public async captureScreenshot(): Promise<string | null> {
    if (!this.config.allowScreenshots) {
      return null;
    }

    try {
      // Try to use html2canvas if available
      if (typeof window !== 'undefined' && document.body) {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Simple screenshot - capture visible area
          // In a real app, you'd use html2canvas or similar
          ctx.fillStyle = '#f9fafb';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#374151';
          ctx.font = '14px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            'Screenshot captured at ' + new Date().toLocaleString('sv-SE'),
            canvas.width / 2,
            canvas.height / 2
          );

          return canvas.toDataURL('image/png', 0.8);
        }
      }

      return null;
    } catch (error) {
      logger.error('[Feedback] Screenshot capture failed:', error);
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // FEEDBACK SUBMISSION
  // --------------------------------------------------------------------------

  /**
   * Submit new feedback
   */
  public async submit(
    type: FeedbackType,
    title: string,
    description: string,
    options?: {
      rating?: number;
      category?: string;
      email?: string;
      includeScreenshot?: boolean;
      tags?: string[];
    }
  ): Promise<Feedback> {
    // Validate
    if (description.length < this.config.minDescriptionLength) {
      throw new Error(`Beskrivningen måste vara minst ${this.config.minDescriptionLength} tecken`);
    }

    if (description.length > this.config.maxDescriptionLength) {
      throw new Error(`Beskrivningen får vara max ${this.config.maxDescriptionLength} tecken`);
    }

    // Capture screenshot if requested
    let screenshot: string | null = null;
    if (options?.includeScreenshot) {
      screenshot = await this.captureScreenshot();
    }

    const id = `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const feedback: Feedback = {
      id,
      type,
      title,
      description,
      rating: options?.rating,
      status: 'submitted',
      priority: this.determinePriority(type, options?.rating),
      category: options?.category,
      screenshot: screenshot || undefined,
      deviceInfo: this.getDeviceInfo(),
      appVersion: APP_VERSION,
      email: options?.email,
      createdAt: now,
      updatedAt: now,
      tags: options?.tags,
      votes: 0,
    };

    this.feedbackItems.set(id, feedback);
    this.saveFeedback();

    // Update prompt tracking
    this.updatePromptTracking();

    logger.info('[Feedback] Submitted:', id, type);
    return feedback;
  }

  /**
   * Determine priority based on type and rating
   */
  private determinePriority(type: FeedbackType, rating?: number): Priority {
    if (type === 'bug') {
      return rating && rating <= 2 ? 'high' : 'medium';
    }

    if (rating && rating === 1) {
      return 'high';
    }

    if (type === 'feature') {
      return 'low';
    }

    return 'medium';
  }

  // --------------------------------------------------------------------------
  // FEEDBACK MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Get all feedback
   */
  public getAll(): Feedback[] {
    return Array.from(this.feedbackItems.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get feedback by ID
   */
  public getById(id: string): Feedback | null {
    return this.feedbackItems.get(id) || null;
  }

  /**
   * Get feedback by type
   */
  public getByType(type: FeedbackType): Feedback[] {
    return this.getAll().filter(f => f.type === type);
  }

  /**
   * Get feedback by status
   */
  public getByStatus(status: FeedbackStatus): Feedback[] {
    return this.getAll().filter(f => f.status === status);
  }

  /**
   * Update feedback status
   */
  public updateStatus(id: string, status: FeedbackStatus, response?: string): Feedback | null {
    const feedback = this.feedbackItems.get(id);
    if (!feedback) return null;

    feedback.status = status;
    feedback.updatedAt = new Date().toISOString();
    if (response) {
      feedback.response = response;
    }

    this.feedbackItems.set(id, feedback);
    this.saveFeedback();

    logger.debug('[Feedback] Status updated:', id, status);
    return feedback;
  }

  /**
   * Vote for feedback
   */
  public vote(id: string): Feedback | null {
    const feedback = this.feedbackItems.get(id);
    if (!feedback) return null;

    feedback.votes = (feedback.votes || 0) + 1;
    feedback.updatedAt = new Date().toISOString();

    this.feedbackItems.set(id, feedback);
    this.saveFeedback();

    return feedback;
  }

  /**
   * Delete feedback
   */
  public delete(id: string): void {
    this.feedbackItems.delete(id);
    this.saveFeedback();
    logger.debug('[Feedback] Deleted:', id);
  }

  // --------------------------------------------------------------------------
  // RATINGS
  // --------------------------------------------------------------------------

  /**
   * Submit app rating
   */
  public async submitRating(rating: number, comment?: string): Promise<Feedback> {
    if (rating < 1 || rating > 5) {
      throw new Error('Betyget måste vara mellan 1 och 5');
    }

    return this.submit(
      rating >= 4 ? 'praise' : 'improvement',
      `App Rating: ${rating}/5`,
      comment || `Användaren gav appen betyget ${rating} av 5.`,
      { rating }
    );
  }

  /**
   * Get average rating
   */
  public getAverageRating(): number {
    const ratings = this.getAll()
      .filter(f => f.rating !== undefined)
      .map(f => f.rating as number);

    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((a, b) => a + b, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  // --------------------------------------------------------------------------
  // STATISTICS
  // --------------------------------------------------------------------------

  /**
   * Get feedback statistics
   */
  public getStats(): FeedbackStats {
    const all = this.getAll();

    const byType: Record<FeedbackType, number> = {
      bug: 0,
      feature: 0,
      improvement: 0,
      praise: 0,
      other: 0,
    };

    const byStatus: Record<FeedbackStatus, number> = {
      submitted: 0,
      reviewing: 0,
      planned: 0,
      in_progress: 0,
      completed: 0,
      declined: 0,
    };

    const ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 stars

    let totalRating = 0;
    let ratingCount = 0;

    all.forEach(f => {
      byType[f.type]++;
      byStatus[f.status]++;

      if (f.rating) {
        ratingDistribution[f.rating - 1]++;
        totalRating += f.rating;
        ratingCount++;
      }
    });

    return {
      total: all.length,
      byType,
      byStatus,
      averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0,
      ratingDistribution,
    };
  }

  // --------------------------------------------------------------------------
  // PROMPT MANAGEMENT
  // --------------------------------------------------------------------------

  private updatePromptTracking(): void {
    const tracking = this.getPromptTracking();
    tracking.lastFeedbackDate = new Date().toISOString();
    localStorage.setItem(PROMPT_KEY, JSON.stringify(tracking));
  }

  private getPromptTracking(): {
    firstVisit?: string;
    lastFeedbackDate?: string;
    sessionCount: number;
    dismissed: boolean;
  } {
    try {
      const stored = localStorage.getItem(PROMPT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore
    }

    return {
      firstVisit: new Date().toISOString(),
      sessionCount: 0,
      dismissed: false,
    };
  }

  /**
   * Increment session count
   */
  public incrementSessionCount(): void {
    const tracking = this.getPromptTracking();
    tracking.sessionCount++;
    localStorage.setItem(PROMPT_KEY, JSON.stringify(tracking));
  }

  /**
   * Check if should show feedback prompt
   */
  public shouldShowPrompt(): boolean {
    if (!this.config.enabled) return false;

    const tracking = this.getPromptTracking();
    if (tracking.dismissed) return false;

    // Check session count
    if (tracking.sessionCount >= this.config.showPromptAfterSessions) {
      return true;
    }

    // Check days since first visit
    if (tracking.firstVisit) {
      const daysSinceFirstVisit = Math.floor(
        (Date.now() - new Date(tracking.firstVisit).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceFirstVisit >= this.config.showPromptAfterDays) {
        return true;
      }
    }

    return false;
  }

  /**
   * Dismiss feedback prompt
   */
  public dismissPrompt(): void {
    const tracking = this.getPromptTracking();
    tracking.dismissed = true;
    localStorage.setItem(PROMPT_KEY, JSON.stringify(tracking));
  }

  /**
   * Reset prompt (show again)
   */
  public resetPrompt(): void {
    const tracking = this.getPromptTracking();
    tracking.dismissed = false;
    tracking.sessionCount = 0;
    localStorage.setItem(PROMPT_KEY, JSON.stringify(tracking));
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const feedbackService = new FeedbackService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>(feedbackService.getAll());
  const [stats, setStats] = useState<FeedbackStats>(feedbackService.getStats());
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    feedbackService.incrementSessionCount();
    setShowPrompt(feedbackService.shouldShowPrompt());
  }, []);

  const submit = useCallback(async (
    type: FeedbackType,
    title: string,
    description: string,
    options?: {
      rating?: number;
      category?: string;
      email?: string;
      includeScreenshot?: boolean;
      tags?: string[];
    }
  ) => {
    const result = await feedbackService.submit(type, title, description, options);
    setFeedback(feedbackService.getAll());
    setStats(feedbackService.getStats());
    setShowPrompt(false);
    return result;
  }, []);

  const submitRating = useCallback(async (rating: number, comment?: string) => {
    const result = await feedbackService.submitRating(rating, comment);
    setFeedback(feedbackService.getAll());
    setStats(feedbackService.getStats());
    setShowPrompt(false);
    return result;
  }, []);

  const dismissPrompt = useCallback(() => {
    feedbackService.dismissPrompt();
    setShowPrompt(false);
  }, []);

  return {
    // State
    feedback,
    stats,
    showPrompt,

    // Methods
    submit,
    submitRating,
    vote: feedbackService.vote.bind(feedbackService),
    delete: (id: string) => {
      feedbackService.delete(id);
      setFeedback(feedbackService.getAll());
      setStats(feedbackService.getStats());
    },

    // Prompt
    dismissPrompt,
    resetPrompt: () => {
      feedbackService.resetPrompt();
      setShowPrompt(feedbackService.shouldShowPrompt());
    },

    // Filters
    getByType: feedbackService.getByType.bind(feedbackService),
    getByStatus: feedbackService.getByStatus.bind(feedbackService),

    // Config
    config: feedbackService.getConfig(),
    updateConfig: feedbackService.updateConfig.bind(feedbackService),
  };
}

export default feedbackService;
