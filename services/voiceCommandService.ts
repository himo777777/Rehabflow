/**
 * Voice Command Service - Sprint 5.8
 *
 * Enables hands-free control of the application using voice commands.
 * Features:
 * - Web Speech API integration
 * - Swedish language support
 * - Custom command registration
 * - Exercise control commands
 * - Navigation commands
 * - Feedback confirmation
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface VoiceCommand {
  id: string;
  phrases: string[]; // Multiple phrases that trigger this command
  callback: () => void;
  description: string;
  category: 'exercise' | 'navigation' | 'control' | 'custom';
  confirmationMessage?: string;
}

export interface VoiceCommandConfig {
  enabled: boolean;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  autoRestart: boolean;
  confirmCommands: boolean;
  wakeWord?: string;
}

export interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  matchedCommand?: VoiceCommand;
}

export type ListeningState = 'idle' | 'listening' | 'processing' | 'error';

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const DEFAULT_CONFIG: VoiceCommandConfig = {
  enabled: true,
  language: 'sv-SE', // Swedish
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  autoRestart: true,
  confirmCommands: true,
  wakeWord: 'hey rehab',
};

// Storage key
const CONFIG_KEY = 'rehabflow-voice-config';

// ============================================================================
// VOICE COMMAND SERVICE
// ============================================================================

class VoiceCommandService {
  private config: VoiceCommandConfig = DEFAULT_CONFIG;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private commands: Map<string, VoiceCommand> = new Map();
  private state: ListeningState = 'idle';
  private isAwake: boolean = false;
  private wakeTimeout: ReturnType<typeof setTimeout> | null = null;
  private onStateChange: ((state: ListeningState) => void) | null = null;
  private onResult: ((result: RecognitionResult) => void) | null = null;
  private onCommandExecuted: ((command: VoiceCommand) => void) | null = null;

  constructor() {
    this.loadConfig();
    this.initSpeechSynthesis();
    this.registerDefaultCommands();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  /**
   * Check if speech recognition is supported
   */
  public isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  /**
   * Check if speech synthesis is supported
   */
  public isSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  private initSpeechSynthesis(): void {
    if (this.isSynthesisSupported()) {
      this.synthesis = window.speechSynthesis;
    }
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
      logger.error('[Voice] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Voice] Failed to save config:', error);
    }
  }

  public getConfig(): VoiceCommandConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<VoiceCommandConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();

    // Restart recognition if language changed
    if (updates.language && this.state === 'listening') {
      this.stop();
      this.start();
    }

    logger.debug('[Voice] Config updated:', updates);
  }

  // --------------------------------------------------------------------------
  // RECOGNITION CONTROL
  // --------------------------------------------------------------------------

  /**
   * Start voice recognition
   */
  public start(): boolean {
    if (!this.isSupported()) {
      logger.error('[Voice] Speech recognition not supported');
      return false;
    }

    if (!this.config.enabled) {
      logger.warn('[Voice] Voice commands disabled');
      return false;
    }

    if (this.state === 'listening') {
      return true;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;

      this.recognition.onstart = () => {
        this.setState('listening');
        logger.info('[Voice] Recognition started');
      };

      this.recognition.onresult = (event) => {
        this.handleResult(event);
      };

      this.recognition.onerror = (event) => {
        this.handleError(event);
      };

      this.recognition.onend = () => {
        if (this.config.autoRestart && this.state !== 'error') {
          // Auto-restart after short delay
          setTimeout(() => {
            if (this.state !== 'idle') {
              this.recognition?.start();
            }
          }, 100);
        } else {
          this.setState('idle');
        }
      };

      this.recognition.start();
      return true;
    } catch (error) {
      logger.error('[Voice] Failed to start recognition:', error);
      this.setState('error');
      return false;
    }
  }

  /**
   * Stop voice recognition
   */
  public stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }

    this.setState('idle');
    this.isAwake = false;

    if (this.wakeTimeout) {
      clearTimeout(this.wakeTimeout);
      this.wakeTimeout = null;
    }

    logger.info('[Voice] Recognition stopped');
  }

  /**
   * Get current state
   */
  public getState(): ListeningState {
    return this.state;
  }

  private setState(state: ListeningState): void {
    this.state = state;
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  // --------------------------------------------------------------------------
  // RESULT HANDLING
  // --------------------------------------------------------------------------

  private handleResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.resultIndex];
    const transcript = result[0].transcript.toLowerCase().trim();
    const confidence = result[0].confidence;
    const isFinal = result.isFinal;

    const recognitionResult: RecognitionResult = {
      transcript,
      confidence,
      isFinal,
    };

    // Check for wake word if configured
    if (this.config.wakeWord && !this.isAwake) {
      if (transcript.includes(this.config.wakeWord.toLowerCase())) {
        this.wakeUp();
        this.speak('Ja, jag lyssnar');
        return;
      }
    }

    // Only process commands if awake (or no wake word configured)
    if (this.isAwake || !this.config.wakeWord) {
      if (isFinal) {
        const matchedCommand = this.matchCommand(transcript);

        if (matchedCommand) {
          recognitionResult.matchedCommand = matchedCommand;
          this.executeCommand(matchedCommand);
        }
      }
    }

    if (this.onResult) {
      this.onResult(recognitionResult);
    }
  }

  private handleError(event: SpeechRecognitionErrorEvent): void {
    logger.error('[Voice] Recognition error:', event.error);

    if (event.error === 'not-allowed') {
      this.setState('error');
    } else if (event.error === 'no-speech') {
      // Not really an error, just no speech detected
      logger.debug('[Voice] No speech detected');
    }
  }

  private wakeUp(): void {
    this.isAwake = true;

    // Stay awake for 30 seconds, then require wake word again
    if (this.wakeTimeout) {
      clearTimeout(this.wakeTimeout);
    }

    this.wakeTimeout = setTimeout(() => {
      this.isAwake = false;
      logger.debug('[Voice] Going back to sleep');
    }, 30000);

    logger.info('[Voice] Wake word detected, listening for commands');
  }

  // --------------------------------------------------------------------------
  // COMMAND MATCHING
  // --------------------------------------------------------------------------

  private matchCommand(transcript: string): VoiceCommand | null {
    const normalizedTranscript = this.normalizeText(transcript);

    for (const command of this.commands.values()) {
      for (const phrase of command.phrases) {
        const normalizedPhrase = this.normalizeText(phrase);

        // Check for exact match or contains
        if (normalizedTranscript.includes(normalizedPhrase)) {
          return command;
        }

        // Check for fuzzy match
        if (this.fuzzyMatch(normalizedTranscript, normalizedPhrase)) {
          return command;
        }
      }
    }

    return null;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ');
  }

  private fuzzyMatch(transcript: string, phrase: string): boolean {
    // Simple fuzzy matching using Levenshtein distance
    const words = phrase.split(' ');
    let matchCount = 0;

    for (const word of words) {
      if (transcript.includes(word)) {
        matchCount++;
      }
    }

    // At least 70% of words should match
    return matchCount / words.length >= 0.7;
  }

  // --------------------------------------------------------------------------
  // COMMAND EXECUTION
  // --------------------------------------------------------------------------

  private executeCommand(command: VoiceCommand): void {
    this.setState('processing');

    try {
      // Provide confirmation feedback
      if (this.config.confirmCommands && command.confirmationMessage) {
        this.speak(command.confirmationMessage);
      }

      // Execute the command
      command.callback();

      if (this.onCommandExecuted) {
        this.onCommandExecuted(command);
      }

      logger.info('[Voice] Command executed:', command.id);
    } catch (error) {
      logger.error('[Voice] Command execution failed:', error);
      this.speak('Det gick inte att utföra kommandot');
    }

    this.setState('listening');
  }

  // --------------------------------------------------------------------------
  // SPEECH SYNTHESIS
  // --------------------------------------------------------------------------

  /**
   * Speak text using speech synthesis
   */
  public speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): void {
    if (!this.synthesis) {
      logger.warn('[Voice] Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.language;
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;

    // Try to use Swedish voice
    const voices = this.synthesis.getVoices();
    const swedishVoice = voices.find(v => v.lang.startsWith('sv'));
    if (swedishVoice) {
      utterance.voice = swedishVoice;
    }

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // --------------------------------------------------------------------------
  // COMMAND REGISTRATION
  // --------------------------------------------------------------------------

  /**
   * Register a voice command
   */
  public registerCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
    logger.debug('[Voice] Command registered:', command.id);
  }

  /**
   * Unregister a voice command
   */
  public unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
    logger.debug('[Voice] Command unregistered:', commandId);
  }

  /**
   * Get all registered commands
   */
  public getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  public getCommandsByCategory(category: VoiceCommand['category']): VoiceCommand[] {
    return this.getCommands().filter(c => c.category === category);
  }

  /**
   * Register default commands
   */
  private registerDefaultCommands(): void {
    // Exercise control commands
    this.registerCommand({
      id: 'start_exercise',
      phrases: ['starta', 'börja', 'start', 'kör igång'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:startExercise'));
      },
      description: 'Starta övningen',
      category: 'exercise',
      confirmationMessage: 'Startar övningen',
    });

    this.registerCommand({
      id: 'pause_exercise',
      phrases: ['pausa', 'paus', 'stopp', 'vänta'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:pauseExercise'));
      },
      description: 'Pausa övningen',
      category: 'exercise',
      confirmationMessage: 'Pausar övningen',
    });

    this.registerCommand({
      id: 'resume_exercise',
      phrases: ['fortsätt', 'återuppta', 'spela'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:resumeExercise'));
      },
      description: 'Återuppta övningen',
      category: 'exercise',
      confirmationMessage: 'Fortsätter övningen',
    });

    this.registerCommand({
      id: 'stop_exercise',
      phrases: ['avsluta', 'sluta', 'avbryt'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:stopExercise'));
      },
      description: 'Avsluta övningen',
      category: 'exercise',
      confirmationMessage: 'Avslutar övningen',
    });

    this.registerCommand({
      id: 'next_exercise',
      phrases: ['nästa', 'nästa övning', 'hoppa över'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:nextExercise'));
      },
      description: 'Gå till nästa övning',
      category: 'exercise',
      confirmationMessage: 'Går till nästa övning',
    });

    this.registerCommand({
      id: 'previous_exercise',
      phrases: ['föregående', 'tillbaka', 'förra'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:previousExercise'));
      },
      description: 'Gå till föregående övning',
      category: 'exercise',
      confirmationMessage: 'Går tillbaka',
    });

    this.registerCommand({
      id: 'repeat_exercise',
      phrases: ['upprepa', 'igen', 'en gång till'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:repeatExercise'));
      },
      description: 'Upprepa övningen',
      category: 'exercise',
      confirmationMessage: 'Upprepar övningen',
    });

    // Navigation commands
    this.registerCommand({
      id: 'go_home',
      phrases: ['hem', 'gå hem', 'start', 'huvudmeny'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:navigate', { detail: '/' }));
      },
      description: 'Gå till startsidan',
      category: 'navigation',
      confirmationMessage: 'Går till startsidan',
    });

    this.registerCommand({
      id: 'go_exercises',
      phrases: ['övningar', 'träning', 'visa övningar'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:navigate', { detail: '/exercises' }));
      },
      description: 'Gå till övningar',
      category: 'navigation',
      confirmationMessage: 'Visar övningar',
    });

    this.registerCommand({
      id: 'go_progress',
      phrases: ['framsteg', 'statistik', 'min progress'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:navigate', { detail: '/progress' }));
      },
      description: 'Visa framsteg',
      category: 'navigation',
      confirmationMessage: 'Visar dina framsteg',
    });

    this.registerCommand({
      id: 'go_settings',
      phrases: ['inställningar', 'settings', 'alternativ'],
      callback: () => {
        document.dispatchEvent(new CustomEvent('voice:navigate', { detail: '/settings' }));
      },
      description: 'Öppna inställningar',
      category: 'navigation',
      confirmationMessage: 'Öppnar inställningar',
    });

    // Control commands
    this.registerCommand({
      id: 'help',
      phrases: ['hjälp', 'vad kan du göra', 'kommandon'],
      callback: () => {
        const commands = this.getCommands();
        const helpText = commands.map(c => c.description).join('. ');
        this.speak(`Jag kan hjälpa dig med följande: ${helpText}`);
      },
      description: 'Visa tillgängliga kommandon',
      category: 'control',
    });

    this.registerCommand({
      id: 'stop_listening',
      phrases: ['tyst', 'sluta lyssna', 'stäng av'],
      callback: () => {
        this.stop();
      },
      description: 'Sluta lyssna',
      category: 'control',
      confirmationMessage: 'Okej, jag slutar lyssna',
    });
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS
  // --------------------------------------------------------------------------

  public setOnStateChange(callback: (state: ListeningState) => void): void {
    this.onStateChange = callback;
  }

  public setOnResult(callback: (result: RecognitionResult) => void): void {
    this.onResult = callback;
  }

  public setOnCommandExecuted(callback: (command: VoiceCommand) => void): void {
    this.onCommandExecuted = callback;
  }
}

// ============================================================================
// TYPE DECLARATIONS FOR WEB SPEECH API
// ============================================================================

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const voiceCommandService = new VoiceCommandService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useVoiceCommands() {
  const [state, setState] = useState<ListeningState>(voiceCommandService.getState());
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const navigate = useNavigate?.();

  useEffect(() => {
    voiceCommandService.setOnStateChange(setState);
    voiceCommandService.setOnResult(setLastResult);
    voiceCommandService.setOnCommandExecuted(setLastCommand);

    // Listen for navigation events
    const handleNavigate = (event: CustomEvent<string>) => {
      if (navigate) {
        navigate(event.detail);
      }
    };

    document.addEventListener('voice:navigate', handleNavigate as EventListener);

    return () => {
      voiceCommandService.setOnStateChange(() => {});
      voiceCommandService.setOnResult(() => {});
      voiceCommandService.setOnCommandExecuted(() => {});
      document.removeEventListener('voice:navigate', handleNavigate as EventListener);
    };
  }, [navigate]);

  const start = useCallback(() => {
    return voiceCommandService.start();
  }, []);

  const stop = useCallback(() => {
    voiceCommandService.stop();
  }, []);

  const speak = useCallback((text: string) => {
    voiceCommandService.speak(text);
  }, []);

  const registerCommand = useCallback((command: VoiceCommand) => {
    voiceCommandService.registerCommand(command);
  }, []);

  return {
    // State
    isSupported: voiceCommandService.isSupported(),
    state,
    isListening: state === 'listening',
    lastResult,
    lastCommand,

    // Methods
    start,
    stop,
    speak,
    stopSpeaking: voiceCommandService.stopSpeaking.bind(voiceCommandService),
    registerCommand,
    unregisterCommand: voiceCommandService.unregisterCommand.bind(voiceCommandService),

    // Data
    commands: voiceCommandService.getCommands(),
    getCommandsByCategory: voiceCommandService.getCommandsByCategory.bind(voiceCommandService),

    // Config
    config: voiceCommandService.getConfig(),
    updateConfig: voiceCommandService.updateConfig.bind(voiceCommandService),
  };
}

export default voiceCommandService;
