/**
 * Video Recording Service
 * Handles recording of exercise sessions with landmark data overlay
 * Enables playback with skeleton visualization
 */

import { supabase } from './supabaseClient';
import {
  TimestampedLandmarks,
  RepScore,
  MovementSession,
  CalibrationData,
} from '../types';
import { logger } from '../utils/logger';

/**
 * Recording session data
 */
export interface RecordingSession {
  id: string;
  exerciseName: string;
  startTime: number;
  endTime?: number;
  duration: number;
  videoBlob?: Blob;
  landmarks: TimestampedLandmarks[];
  repScores: RepScore[];
  calibration?: CalibrationData;
}

/**
 * Recording state
 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

/**
 * Recording options
 */
export interface RecordingOptions {
  includeVideo: boolean;
  videoQuality: 'low' | 'medium' | 'high';
  maxDuration?: number; // Max recording duration in seconds
  landmarkInterval?: number; // How often to capture landmarks (ms)
}

const DEFAULT_OPTIONS: RecordingOptions = {
  includeVideo: true,
  videoQuality: 'medium',
  maxDuration: 300, // 5 minutes
  landmarkInterval: 100, // 10 fps for landmarks
};

/**
 * Get video MIME type based on browser support
 */
function getSupportedMimeType(): string {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'video/webm'; // Fallback
}

/**
 * Get video bitrate based on quality setting
 */
function getBitrate(quality: 'low' | 'medium' | 'high'): number {
  switch (quality) {
    case 'low':
      return 500000; // 500 Kbps
    case 'medium':
      return 1500000; // 1.5 Mbps
    case 'high':
      return 4000000; // 4 Mbps
    default:
      return 1500000;
  }
}

/**
 * Video Recording Service
 * Captures video from canvas and stores landmark data for playback
 */
export class VideoRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private landmarkBuffer: TimestampedLandmarks[] = [];
  private repScoreBuffer: RepScore[] = [];
  private stream: MediaStream | null = null;
  private state: RecordingState = 'idle';
  private sessionId: string = '';
  private exerciseName: string = '';
  private startTime: number = 0;
  private options: RecordingOptions = DEFAULT_OPTIONS;
  private calibration?: CalibrationData;
  private maxDurationTimer?: NodeJS.Timeout;
  private onStateChange?: (state: RecordingState) => void;
  private onDurationUpdate?: (duration: number) => void;
  private durationInterval?: NodeJS.Timeout;

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState {
    return this.state;
  }

  /**
   * Set state change callback
   */
  setOnStateChange(callback: (state: RecordingState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Set duration update callback
   */
  setOnDurationUpdate(callback: (duration: number) => void): void {
    this.onDurationUpdate = callback;
  }

  /**
   * Update state and notify listeners
   */
  private setState(newState: RecordingState): void {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  /**
   * Start recording session
   */
  startRecording(
    canvas: HTMLCanvasElement,
    exerciseName: string,
    options: Partial<RecordingOptions> = {},
    calibration?: CalibrationData
  ): void {
    if (this.state === 'recording') {
      console.warn('Already recording');
      return;
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.sessionId = this.generateSessionId();
    this.exerciseName = exerciseName;
    this.startTime = Date.now();
    this.chunks = [];
    this.landmarkBuffer = [];
    this.repScoreBuffer = [];
    this.calibration = calibration;

    if (this.options.includeVideo) {
      try {
        // Capture stream from canvas
        this.stream = canvas.captureStream(30); // 30 FPS

        const mimeType = getSupportedMimeType();
        const bitrate = getBitrate(this.options.videoQuality);

        this.mediaRecorder = new MediaRecorder(this.stream, {
          mimeType,
          videoBitsPerSecond: bitrate,
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.chunks.push(event.data);
          }
        };

        this.mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          this.stopRecording();
        };

        this.mediaRecorder.start(1000); // Collect data every second
      } catch (error) {
        console.error('Failed to start video recording:', error);
        // Continue without video
        this.options.includeVideo = false;
      }
    }

    // Set max duration timer
    if (this.options.maxDuration) {
      this.maxDurationTimer = setTimeout(() => {
        logger.debug('Max recording duration reached');
        this.stopRecording();
      }, this.options.maxDuration * 1000);
    }

    // Start duration updates
    this.durationInterval = setInterval(() => {
      if (this.onDurationUpdate) {
        const duration = (Date.now() - this.startTime) / 1000;
        this.onDurationUpdate(duration);
      }
    }, 1000);

    this.setState('recording');
    logger.debug(`Started recording session: ${this.sessionId}`);
  }

  /**
   * Add landmark data to buffer
   */
  addLandmarks(
    landmarks: Array<{ x: number; y: number; z: number; visibility: number }>,
    jointAngles?: Record<string, number>
  ): void {
    if (this.state !== 'recording') return;

    const timestamp = Date.now() - this.startTime;

    this.landmarkBuffer.push({
      timestamp,
      landmarks,
      jointAngles,
    });
  }

  /**
   * Add rep score to buffer
   */
  addRepScore(repScore: RepScore): void {
    if (this.state !== 'recording') return;
    this.repScoreBuffer.push(repScore);
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.state !== 'recording') return;

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }

    this.setState('paused');
    logger.debug('Recording paused');
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.state !== 'paused') return;

    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }

    this.setState('recording');
    logger.debug('Recording resumed');
  }

  /**
   * Stop recording and return session data
   */
  async stopRecording(): Promise<RecordingSession | null> {
    if (this.state === 'idle' || this.state === 'stopped') {
      return null;
    }

    // Clear timers
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
    }
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }

    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;

    let videoBlob: Blob | undefined;

    if (this.mediaRecorder && this.options.includeVideo) {
      // Wait for final data
      await new Promise<void>((resolve) => {
        if (!this.mediaRecorder) {
          resolve();
          return;
        }

        this.mediaRecorder.onstop = () => {
          resolve();
        };

        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        } else {
          resolve();
        }
      });

      if (this.chunks.length > 0) {
        videoBlob = new Blob(this.chunks, { type: getSupportedMimeType() });
      }
    }

    // Clean up stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    const session: RecordingSession = {
      id: this.sessionId,
      exerciseName: this.exerciseName,
      startTime: this.startTime,
      endTime,
      duration,
      videoBlob,
      landmarks: this.landmarkBuffer,
      repScores: this.repScoreBuffer,
      calibration: this.calibration,
    };

    this.setState('stopped');
    logger.debug(`Stopped recording session: ${this.sessionId}, Duration: ${duration.toFixed(1)}s`);

    return session;
  }

  /**
   * Cancel recording without saving
   */
  cancelRecording(): void {
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
    }
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.chunks = [];
    this.landmarkBuffer = [];
    this.repScoreBuffer = [];
    this.setState('idle');

    logger.debug('Recording cancelled');
  }

  /**
   * Get current recording duration in seconds
   */
  getCurrentDuration(): number {
    if (this.state === 'idle') return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Get landmark count
   */
  getLandmarkCount(): number {
    return this.landmarkBuffer.length;
  }

  /**
   * Get rep count
   */
  getRepCount(): number {
    return this.repScoreBuffer.length;
  }

  /**
   * Save recording session to Supabase
   */
  async saveToSupabase(
    session: RecordingSession,
    userId?: string
  ): Promise<{ videoUrl?: string; sessionId: string } | null> {
    try {
      let videoUrl: string | undefined;

      // Upload video blob if exists
      if (session.videoBlob) {
        const fileName = `movements/${userId || 'anonymous'}/${session.id}.webm`;

        const { error: uploadError } = await supabase.storage
          .from('recordings')
          .upload(fileName, session.videoBlob, {
            contentType: 'video/webm',
            upsert: true,
          });

        if (uploadError) {
          console.error('Failed to upload video:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('recordings')
            .getPublicUrl(fileName);

          videoUrl = urlData.publicUrl;
        }
      }

      // Create movement session record
      const movementSession: Omit<MovementSession, 'id'> & { id: string } = {
        id: session.id,
        exerciseName: session.exerciseName,
        userId,
        sessionDate: new Date(session.startTime).toISOString(),
        duration: session.duration,
        repsCompleted: session.repScores.length,
        repScores: session.repScores,
        averageScore: session.repScores.length > 0
          ? Math.round(
              session.repScores.reduce((sum, r) => sum + r.overall, 0) /
                session.repScores.length
            )
          : 0,
        romAchieved: session.repScores.length > 0
          ? Math.round(
              session.repScores.reduce((sum, r) => sum + r.breakdown.rom, 0) /
                session.repScores.length
            )
          : 0,
        formIssues: session.repScores.flatMap(r => r.issues),
        landmarks: session.landmarks,
        videoUrl,
        calibration: session.calibration,
      };

      // Insert into database
      const { error: insertError } = await supabase
        .from('movement_sessions')
        .insert({
          id: movementSession.id,
          user_id: userId,
          exercise_name: movementSession.exerciseName,
          session_date: movementSession.sessionDate,
          reps_completed: movementSession.repsCompleted,
          average_score: movementSession.averageScore,
          rom_achieved: movementSession.romAchieved,
          form_issues: movementSession.formIssues,
          video_url: videoUrl,
          duration: movementSession.duration,
          rep_scores: movementSession.repScores,
          landmarks: movementSession.landmarks,
          calibration: movementSession.calibration,
        });

      if (insertError) {
        console.error('Failed to save session to database:', insertError);
        // Try local storage fallback
        this.saveToLocalStorage(movementSession);
      }

      return { videoUrl, sessionId: session.id };
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      return null;
    }
  }

  /**
   * Save to local storage as fallback
   */
  private saveToLocalStorage(session: MovementSession): void {
    try {
      const key = 'rehabflow_pending_sessions';
      const existing = localStorage.getItem(key);
      const sessions: MovementSession[] = existing ? JSON.parse(existing) : [];
      sessions.push(session);
      localStorage.setItem(key, JSON.stringify(sessions));
      logger.debug('Session saved to local storage for later sync');
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  /**
   * Create a downloadable video file
   */
  createDownloadableVideo(session: RecordingSession): string | null {
    if (!session.videoBlob) return null;
    return URL.createObjectURL(session.videoBlob);
  }

  /**
   * Revoke a download URL
   */
  revokeDownloadUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
let videoRecordingServiceInstance: VideoRecordingService | null = null;

/**
 * Get singleton VideoRecordingService instance
 */
export function getVideoRecordingService(): VideoRecordingService {
  if (!videoRecordingServiceInstance) {
    videoRecordingServiceInstance = new VideoRecordingService();
  }
  return videoRecordingServiceInstance;
}

/**
 * Export recording session to JSON for backup
 */
export function exportSessionToJSON(session: RecordingSession): string {
  // Exclude video blob from JSON export
  const exportData = {
    id: session.id,
    exerciseName: session.exerciseName,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.duration,
    landmarks: session.landmarks,
    repScores: session.repScores,
    calibration: session.calibration,
    hasVideo: !!session.videoBlob,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import session from JSON (without video)
 */
export function importSessionFromJSON(json: string): Omit<RecordingSession, 'videoBlob'> {
  return JSON.parse(json);
}
