
/**
 * Speech Service - Text-to-Speech for Exercise Instructions
 *
 * Stöder:
 * 1. ElevenLabs (naturlig röst) - om API-nyckel finns
 * 2. Web Speech API (fallback) - alltid tillgänglig
 *
 * Sprint 4 Förbättringar:
 * - Förbered-Paus-Utför mönster (speak before action)
 * - Tempo-synkroniserad röst
 * - Integration med voicePhrases.ts
 *
 * Sprint 5 Förbättringar:
 * - Prosodi-system för naturligare röstfeedback
 * - EventBus-integration för synkronisering
 * - Intelligent pausering baserad på frasstruktur
 * - Viseme-synkronisering för munrörelser
 */

import {
  getPhasePhrase,
  getEncouragementPhrase,
  getCorrectionPhrase,
  getTransitionPhrase,
  getNumberAsText,
  getRepAnnouncement,
  getSetAnnouncement,
  getPhraseWithProsody,
  type PhaseType,
  type PhasePosition,
  type EncouragementContext,
  type CorrectionSeverity,
  type ProsodyMarking,
  type EmotionalTone,
  type PitchContour,
  type VoicePhrase,
} from '../data/voicePhrases';

import {
  eventBus,
  emitSpeechStart,
  emitSpeechEnd,
  emitVisemeUpdate,
  type Viseme,
} from './eventBus';

export interface SpeechOptions {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  voiceName?: string; // Specific voice name
  forceWebSpeech?: boolean; // Force Web Speech API even if ElevenLabs is available
}

// ============================================
// VOICE TIMING CONFIG - Förbered-Paus-Utför
// ============================================

export interface VoiceTimingConfig {
  preAnnounceMs: number;      // ms före fasbyte att tala
  duringPhaseOnly: 'corrections' | 'encouragement' | 'both' | 'none';
  postPhaseDelayMs: number;   // ms efter fas för feedback
  minSilenceBetweenMs: number; // Minsta tystnad mellan fraser
}

export interface TempoSyncConfig {
  baseSpeechRate: number;     // 0.85 default
  tempoMultiplier: number;    // Synka med animation tempo
  maxRate: number;            // 1.3 för tydlighet
  minRate: number;            // 0.6 för långsamt tal
  useShortPhrases: boolean;   // Kort fraser vid snabbt tempo
}

export const DEFAULT_VOICE_TIMING: VoiceTimingConfig = {
  preAnnounceMs: 800,         // Tala 0.8s före fasbyte
  duringPhaseOnly: 'corrections',
  postPhaseDelayMs: 300,
  minSilenceBetweenMs: 400,
};

export const DEFAULT_TEMPO_SYNC: TempoSyncConfig = {
  baseSpeechRate: 0.85,
  tempoMultiplier: 1.0,
  maxRate: 1.3,
  minRate: 0.6,
  useShortPhrases: false,
};

// ============================================
// SPRINT 5: PROSODI & PAUSERING CONFIG
// ============================================

export interface PauseConfig {
  microPause: number;         // Inom fras (ms)
  phraseBoundary: number;     // Mellan fraser (ms)
  breathingPause: number;     // För andning (ms)
  thinkingPause: number;      // För användaren att processa (ms)
  commaDelay: number;         // Paus vid komma (ms)
  periodDelay: number;        // Paus vid punkt (ms)
}

export const DEFAULT_PAUSE_CONFIG: PauseConfig = {
  microPause: 100,
  phraseBoundary: 400,
  breathingPause: 800,
  thinkingPause: 600,
  commaDelay: 200,
  periodDelay: 350,
};

// Pitch-konturer för olika emotionella toner
const PITCH_SETTINGS: Record<EmotionalTone, { pitch: number; rate: number }> = {
  encouraging: { pitch: 1.1, rate: 0.95 },
  calm: { pitch: 0.95, rate: 0.85 },
  urgent: { pitch: 1.15, rate: 1.1 },
  celebratory: { pitch: 1.2, rate: 1.0 },
  neutral: { pitch: 1.0, rate: 0.9 },
};

// Viseme-mappning för svenska bokstäver
const SWEDISH_VISEME_MAP: Record<string, Viseme> = {
  'a': 'A', 'å': 'A', 'ä': 'A',
  'e': 'E',
  'i': 'I', 'y': 'I',
  'o': 'O', 'ö': 'O',
  'u': 'U',
  ' ': 'rest', '.': 'rest', ',': 'rest',
};

interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentUtterance: SpeechSynthesisUtterance | null;
  currentAudio: HTMLAudioElement | null;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  useElevenLabs: boolean;
  // Sprint 4: Timing state
  lastSpeakTime: number;
  voiceTiming: VoiceTimingConfig;
  tempoSync: TempoSyncConfig;
  currentPhase: PhaseType | null;
  queuedPhrase: string | null;
  // Sprint 5: Prosody state
  pauseConfig: PauseConfig;
  currentProsody: ProsodyMarking | null;
  visemeIntervalId: number | null;
}

// ElevenLabs Swedish voices - naturliga röster
const ELEVENLABS_VOICES = {
  // Svenska röster som finns på ElevenLabs
  'Maja': 'pFZP5JQG7iQjIQuC4Bku', // Svensk kvinna, naturlig
  'Erik': 'yoZ06aMxZJJ28mfd3POQ', // Svensk man, naturlig
  // Fallback till multilingvala röster som stöder svenska
  'Rachel': 'EXAVITQu4vr4xnSDxMaL', // Bra på svenska
  'Adam': 'pNInz6obpgDQGcFmaJgB', // Multilingual
} as const;

const state: SpeechState = {
  isSpeaking: false,
  isPaused: false,
  currentUtterance: null,
  currentAudio: null,
  availableVoices: [],
  selectedVoice: null,
  useElevenLabs: false,
  // Sprint 4: Timing state
  lastSpeakTime: 0,
  voiceTiming: { ...DEFAULT_VOICE_TIMING },
  tempoSync: { ...DEFAULT_TEMPO_SYNC },
  currentPhase: null,
  queuedPhrase: null,
  // Sprint 5: Prosody state
  pauseConfig: { ...DEFAULT_PAUSE_CONFIG },
  currentProsody: null,
  visemeIntervalId: null,
};

// Audio cache för att spara API-anrop
const audioCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

// Hämta ElevenLabs API-nyckel
const getElevenLabsApiKey = (): string | null => {
  return import.meta.env.VITE_ELEVENLABS_API_KEY || null;
};

// Kontrollera om ElevenLabs är tillgängligt
const isElevenLabsAvailable = (): boolean => {
  const apiKey = getElevenLabsApiKey();
  return apiKey !== null && apiKey !== 'your_elevenlabs_api_key_here' && apiKey.length > 10;
};

// Generera ljud via ElevenLabs API
const generateElevenLabsAudio = async (text: string): Promise<string | null> => {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) return null;

  // Kolla cache först
  const cacheKey = text.toLowerCase().trim();
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  try {
    // Använd Rachel (multilingual) som default - bra på svenska
    const voiceId = ELEVENLABS_VOICES.Rachel;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Bäst för svenska
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3, // Lite mindre dramatiskt
            use_speaker_boost: true
          }
        })
      }
    );

    if (!response.ok) {
      console.warn(`[SpeechService] ElevenLabs API error: ${response.status}`);
      return null;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Spara i cache
    if (audioCache.size >= MAX_CACHE_SIZE) {
      // Ta bort äldsta
      const firstKey = audioCache.keys().next().value;
      if (firstKey) {
        const oldUrl = audioCache.get(firstKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        audioCache.delete(firstKey);
      }
    }
    audioCache.set(cacheKey, audioUrl);

    return audioUrl;
  } catch (error) {
    console.warn('[SpeechService] ElevenLabs error:', error);
    return null;
  }
};

// Spela upp ljud via ElevenLabs
const playElevenLabsAudio = async (text: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const audioUrl = await generateElevenLabsAudio(text);

    if (!audioUrl) {
      reject(new Error('Could not generate audio'));
      return;
    }

    const audio = new Audio(audioUrl);
    state.currentAudio = audio;
    state.isSpeaking = true;

    audio.onended = () => {
      state.isSpeaking = false;
      state.currentAudio = null;
      resolve();
    };

    audio.onerror = (e) => {
      state.isSpeaking = false;
      state.currentAudio = null;
      reject(e);
    };

    await audio.play();
  });
};

// Initialize voices when they become available
const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const loadVoices = () => {
      state.availableVoices = window.speechSynthesis.getVoices();

      // Prioritera svenska röster, med neural/enhanced/premium först
      const swedishVoices = state.availableVoices.filter(
        (v) => v.lang.startsWith('sv') || v.lang === 'sv-SE'
      );

      // Leta efter premium/neural/enhanced röster (mer naturliga)
      const premiumSwedish = swedishVoices.find((v) =>
        v.name.toLowerCase().includes('neural') ||
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('wavenet')
      );

      // Fallback till vanlig svensk röst
      const standardSwedish = swedishVoices[0];

      // Fallback to any Scandinavian or English voice
      const fallbackVoice = state.availableVoices.find(
        (v) => v.lang.startsWith('nb') || v.lang.startsWith('da') || v.lang.startsWith('en')
      );

      state.selectedVoice = premiumSwedish || standardSwedish || fallbackVoice || state.availableVoices[0] || null;

      // Kolla om ElevenLabs är tillgängligt
      state.useElevenLabs = isElevenLabsAvailable();

      // Logga vilken röst som valdes
      if (state.useElevenLabs) {
        console.log('[SpeechService] Använder ElevenLabs (naturlig röst)');
      } else if (state.selectedVoice) {
        console.log(`[SpeechService] Använder Web Speech: ${state.selectedVoice.name} (${state.selectedVoice.lang})`);
      }

      resolve(state.availableVoices);
    };

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      // Timeout fallback
      setTimeout(loadVoices, 1000);
    }
  });
};

// Check if speech synthesis is supported
const isSupported = (): boolean => {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

// Web Speech API speak
const speakWebSpeech = (text: string, options: SpeechOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject(new Error('Speech synthesis is not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set options - optimerat för mer naturligt tal
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 0.95;
    utterance.volume = options.volume ?? 1;
    utterance.lang = 'sv-SE';

    // Use selected voice or find by name
    if (options.voiceName) {
      const voice = state.availableVoices.find((v) => v.name === options.voiceName);
      if (voice) utterance.voice = voice;
    } else if (state.selectedVoice) {
      utterance.voice = state.selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      state.isSpeaking = true;
      state.isPaused = false;
    };

    utterance.onend = () => {
      state.isSpeaking = false;
      state.isPaused = false;
      state.currentUtterance = null;
      resolve();
    };

    utterance.onerror = (event) => {
      state.isSpeaking = false;
      state.isPaused = false;
      state.currentUtterance = null;
      if (event.error !== 'interrupted') {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      } else {
        resolve();
      }
    };

    state.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
};

// Main speak function - väljer ElevenLabs eller Web Speech
const speak = async (text: string, options: SpeechOptions = {}): Promise<void> => {
  // Stoppa pågående tal
  stop();

  // Använd ElevenLabs om tillgängligt (och inte tvingat Web Speech)
  if (state.useElevenLabs && !options.forceWebSpeech) {
    try {
      await playElevenLabsAudio(text);
      return;
    } catch (error) {
      console.warn('[SpeechService] ElevenLabs failed, falling back to Web Speech');
      // Fallback to Web Speech
    }
  }

  // Web Speech API
  return speakWebSpeech(text, options);
};

// Speak multiple sentences with pauses
const speakSequence = async (
  texts: string[],
  options: SpeechOptions = {},
  pauseMs: number = 500
): Promise<void> => {
  for (const text of texts) {
    await speak(text, options);
    await new Promise((r) => setTimeout(r, pauseMs));
  }
};

// Speak exercise instructions step by step
const speakExerciseSteps = async (
  exerciseName: string,
  steps: { title: string; content: string }[],
  options: SpeechOptions = {}
): Promise<void> => {
  await speak(`Nu ska vi göra ${exerciseName}`, options);
  await new Promise((r) => setTimeout(r, 800));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await speak(`Steg ${i + 1}: ${step.title}`, options);
    await new Promise((r) => setTimeout(r, 400));
    await speak(step.content, options);
    await new Promise((r) => setTimeout(r, 1000));
  }

  await speak('Bra jobbat! Nu kan du börja.', options);
};

// Speak countdown for exercises
const speakCountdown = async (
  seconds: number,
  options: SpeechOptions = {}
): Promise<void> => {
  const fastOptions = { ...options, rate: 1.1 };

  if (seconds >= 10) {
    await speak(`${seconds} sekunder`, fastOptions);
    await new Promise((r) => setTimeout(r, Math.max(0, seconds * 1000 - 5000)));
    await speak('5', fastOptions);
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (seconds >= 5) {
    for (let i = Math.min(seconds, 4); i >= 1; i--) {
      await speak(`${i}`, fastOptions);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  await speak('Klart!', options);
};

// Speak encouragement messages
const speakEncouragement = (completed: number, total: number): Promise<void> => {
  const messages: string[] = [];

  if (completed === 1) {
    messages.push('Bra start! Första övningen avklarad.');
  } else if (completed === total) {
    messages.push('Fantastiskt! Du har slutfört alla övningar för idag!');
  } else if (completed === Math.floor(total / 2)) {
    messages.push('Halvvägs där! Fortsätt så!');
  } else {
    const encouragements = [
      'Bra jobbat!',
      'Fortsätt så!',
      'Du gör det bra!',
      'En övning till avklarad!',
      'Stark insats!'
    ];
    messages.push(encouragements[Math.floor(Math.random() * encouragements.length)]);
  }

  return speak(messages[0]);
};

// Pause speech
const pause = (): void => {
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.isPaused = true;
  } else if (state.isSpeaking && !state.isPaused) {
    window.speechSynthesis.pause();
    state.isPaused = true;
  }
};

// Resume speech
const resume = (): void => {
  if (state.currentAudio && state.isPaused) {
    state.currentAudio.play();
    state.isPaused = false;
  } else if (state.isPaused) {
    window.speechSynthesis.resume();
    state.isPaused = false;
  }
};

// Stop speech
const stop = (): void => {
  // Stoppa ElevenLabs audio
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio.currentTime = 0;
    state.currentAudio = null;
  }

  // Stoppa Web Speech
  window.speechSynthesis.cancel();

  state.isSpeaking = false;
  state.isPaused = false;
  state.currentUtterance = null;
};

// Get available voices
const getVoices = (): SpeechSynthesisVoice[] => {
  return state.availableVoices;
};

// Get Swedish voices
const getSwedishVoices = (): SpeechSynthesisVoice[] => {
  return state.availableVoices.filter((v) => v.lang.startsWith('sv'));
};

// Set preferred voice
const setVoice = (voiceName: string): boolean => {
  const voice = state.availableVoices.find((v) => v.name === voiceName);
  if (voice) {
    state.selectedVoice = voice;
    return true;
  }
  return false;
};

// Toggle ElevenLabs on/off
const setUseElevenLabs = (use: boolean): void => {
  if (use && !isElevenLabsAvailable()) {
    console.warn('[SpeechService] ElevenLabs API key not configured');
    return;
  }
  state.useElevenLabs = use;
};

// Get current state
const getState = (): Readonly<SpeechState> => {
  return { ...state };
};

// Clear audio cache
const clearCache = (): void => {
  for (const url of audioCache.values()) {
    URL.revokeObjectURL(url);
  }
  audioCache.clear();
};

// ============================================
// SPRINT 4: FÖRBERED-PAUS-UTFÖR FUNKTIONER
// ============================================

/**
 * Beräkna talhastighet baserat på tempo
 */
const calculateSpeechRate = (tempo: number = 1.0): number => {
  const { baseSpeechRate, tempoMultiplier, maxRate, minRate } = state.tempoSync;
  const rate = baseSpeechRate * tempo * tempoMultiplier;
  return Math.max(minRate, Math.min(maxRate, rate));
};

/**
 * Bestäm om korta fraser ska användas baserat på tempo
 */
const shouldUseShortPhrases = (tempo: number = 1.0): boolean => {
  // Använd korta fraser om tempo > 1.2 eller om explicit konfigurerat
  return state.tempoSync.useShortPhrases || tempo > 1.2;
};

/**
 * Kontrollera om tillräcklig tystnad har passerat sedan senaste talet
 */
const canSpeakNow = (): boolean => {
  const now = Date.now();
  const timeSinceLastSpeak = now - state.lastSpeakTime;
  return timeSinceLastSpeak >= state.voiceTiming.minSilenceBetweenMs && !state.isSpeaking;
};

/**
 * Tala med tempo-synkroniserad hastighet
 */
const speakWithTempo = async (
  text: string,
  tempo: number = 1.0,
  options: SpeechOptions = {}
): Promise<void> => {
  if (!canSpeakNow()) {
    state.queuedPhrase = text;
    return;
  }

  const rate = calculateSpeechRate(tempo);
  const syncedOptions: SpeechOptions = {
    ...options,
    rate: rate,
  };

  state.lastSpeakTime = Date.now();
  await speak(text, syncedOptions);
};

/**
 * Förannonsera nästa fas (Förbered-mönster)
 * Talar INNAN fasbytet sker
 */
const preAnnouncePhase = async (
  nextPhase: PhaseType,
  tempo: number = 1.0
): Promise<void> => {
  const useShort = shouldUseShortPhrases(tempo);
  const phrase = getPhasePhrase(nextPhase, 'start', useShort);

  if (phrase && canSpeakNow()) {
    state.currentPhase = nextPhase;
    await speakWithTempo(phrase, tempo);
  }
};

/**
 * Ge feedback under pågående fas (endast korrigeringar eller uppmuntran)
 */
const speakDuringPhase = async (
  type: 'correction' | 'encouragement',
  context?: CorrectionSeverity | EncouragementContext,
  tempo: number = 1.0
): Promise<void> => {
  // Respektera konfiguration för vad som talas under fas
  const { duringPhaseOnly } = state.voiceTiming;
  if (duringPhaseOnly === 'none') return;
  if (duringPhaseOnly === 'corrections' && type !== 'correction') return;
  if (duringPhaseOnly === 'encouragement' && type !== 'encouragement') return;

  const useShort = shouldUseShortPhrases(tempo);
  let phrase: string;

  if (type === 'correction') {
    phrase = getCorrectionPhrase((context as CorrectionSeverity) || 'gentle', useShort);
  } else {
    phrase = getEncouragementPhrase((context as EncouragementContext) || 'general', useShort);
  }

  if (phrase && canSpeakNow()) {
    await speakWithTempo(phrase, tempo);
  }
};

/**
 * Ge feedback efter en fas (Utför-mönster)
 */
const speakAfterPhase = async (
  phase: PhaseType,
  tempo: number = 1.0
): Promise<void> => {
  // Vänta postPhaseDelay innan vi talar
  await new Promise((r) => setTimeout(r, state.voiceTiming.postPhaseDelayMs));

  const useShort = shouldUseShortPhrases(tempo);
  const phrase = getPhasePhrase(phase, 'end', useShort);

  if (phrase && canSpeakNow()) {
    await speakWithTempo(phrase, tempo);
  }
};

/**
 * Annonsera repetition med tempo-synkroniserad räkning
 */
const speakRepCount = async (
  current: number,
  total: number,
  tempo: number = 1.0
): Promise<void> => {
  const useShort = shouldUseShortPhrases(tempo);

  // Vid snabbt tempo, säg bara numret
  if (useShort || tempo > 1.3) {
    await speakWithTempo(getNumberAsText(current), tempo);
  } else {
    const phrase = getRepAnnouncement(current, total, false);
    await speakWithTempo(phrase, tempo);
  }
};

/**
 * Annonsera set
 */
const speakSetAnnouncement = async (
  current: number,
  total: number,
  tempo: number = 1.0
): Promise<void> => {
  const useShort = shouldUseShortPhrases(tempo);
  const phrase = getSetAnnouncement(current, total, useShort);
  await speakWithTempo(phrase, tempo);
};

/**
 * Annonsera övningsstart
 */
const speakExerciseStart = async (
  exerciseName: string,
  tempo: number = 1.0
): Promise<void> => {
  const useShort = shouldUseShortPhrases(tempo);
  const phrase = getTransitionPhrase('exerciseStart', { exercise: exerciseName }, useShort);
  await speakWithTempo(phrase, tempo);
};

/**
 * Annonsera övningsslut
 */
const speakExerciseEnd = async (
  exerciseName: string,
  tempo: number = 1.0
): Promise<void> => {
  const useShort = shouldUseShortPhrases(tempo);
  const phrase = getTransitionPhrase('exerciseEnd', { exercise: exerciseName }, useShort);
  await speakWithTempo(phrase, tempo);
};

/**
 * Konfigurera voice timing
 */
const setVoiceTiming = (config: Partial<VoiceTimingConfig>): void => {
  state.voiceTiming = { ...state.voiceTiming, ...config };
};

/**
 * Konfigurera tempo-synkronisering
 */
const setTempoSync = (config: Partial<TempoSyncConfig>): void => {
  state.tempoSync = { ...state.tempoSync, ...config };
};

/**
 * Uppdatera animation-tempo (anropas från Avatar3D)
 */
const updateTempo = (tempo: number): void => {
  state.tempoSync.tempoMultiplier = tempo;
  state.tempoSync.useShortPhrases = tempo > 1.2;
};

/**
 * Synkroniserad räkning med animation
 * Räknar med tempo: "ett... två... tre..."
 */
const speakSyncedCount = async (
  count: number,
  tempo: number = 1.0
): Promise<void> => {
  const beatDuration = 60000 / (tempo * 60); // ms per beat vid normalt tempo

  for (let i = 1; i <= count; i++) {
    const numberText = getNumberAsText(i);
    await speakWithTempo(numberText, tempo * 1.2); // Lite snabbare för tydlighet

    if (i < count) {
      await new Promise((r) => setTimeout(r, beatDuration));
    }
  }
};

// ============================================
// SPRINT 5: PROSODI-FUNKTIONER
// ============================================

/**
 * Applicera prosodi-inställningar på SpeechOptions
 */
const applyProsodyToOptions = (
  options: SpeechOptions,
  prosody: ProsodyMarking | undefined
): SpeechOptions => {
  if (!prosody) return options;

  const result = { ...options };

  // Applicera emotionell ton om definierad
  if (prosody.emotionalTone && PITCH_SETTINGS[prosody.emotionalTone]) {
    const settings = PITCH_SETTINGS[prosody.emotionalTone];
    result.pitch = result.pitch ?? settings.pitch;
    result.rate = result.rate ?? settings.rate;
  }

  // Applicera speakingRate om definierad
  if (prosody.speakingRate) {
    result.rate = (result.rate ?? 1) * prosody.speakingRate;
  }

  return result;
};

/**
 * Infoga intelligenta pauser baserat på textinnehåll
 */
const insertIntelligentPauses = (text: string): string => {
  const { commaDelay, periodDelay } = state.pauseConfig;

  // Lägg till SSML-liknande pauser för Web Speech
  // Web Speech API tolkar inte SSML, men vi kan justera texten
  // för att skapa naturliga pauser
  let processedText = text;

  // Ersätt kommatecken med längre paus
  processedText = processedText.replace(/,/g, ', ');

  // Ersätt punkter (utom sista) med längre paus
  processedText = processedText.replace(/\.(?=\s)/g, '. ');

  return processedText;
};

/**
 * Simulera viseme-uppdateringar baserat på text
 * Skickar viseme-events synkroniserat med tal
 */
const startVisemeSimulation = (text: string, durationMs: number): void => {
  // Stoppa tidigare viseme-simulation
  stopVisemeSimulation();

  const cleanText = text.toLowerCase();
  const vowels = cleanText.match(/[aeiouyåäö]/g) || [];
  const totalVowels = vowels.length;

  if (totalVowels === 0) {
    emitVisemeUpdate('rest', 0.5);
    return;
  }

  const msPerVowel = durationMs / totalVowels;
  let vowelIndex = 0;

  state.visemeIntervalId = window.setInterval(() => {
    if (vowelIndex < totalVowels) {
      const vowel = vowels[vowelIndex];
      const viseme = SWEDISH_VISEME_MAP[vowel] || 'rest';
      const intensity = 0.7 + Math.random() * 0.3; // 0.7-1.0
      emitVisemeUpdate(viseme, intensity);
      vowelIndex++;
    } else {
      stopVisemeSimulation();
    }
  }, msPerVowel);
};

/**
 * Stoppa viseme-simulation
 */
const stopVisemeSimulation = (): void => {
  if (state.visemeIntervalId !== null) {
    clearInterval(state.visemeIntervalId);
    state.visemeIntervalId = null;
    emitVisemeUpdate('rest', 0);
  }
};

/**
 * Tala med prosodi-stöd och EventBus-integration
 */
const speakWithProsody = async (
  text: string,
  prosody?: ProsodyMarking,
  baseOptions: SpeechOptions = {}
): Promise<void> => {
  if (!text || text.trim() === '') return;

  // Stoppa pågående tal
  stop();

  // Applicera prosodi på options
  const options = applyProsodyToOptions(baseOptions, prosody);

  // Beräkna ungefärlig talduration (ca 150ms per ord)
  const wordCount = text.split(/\s+/).length;
  const baseRate = options.rate ?? 0.9;
  const estimatedDuration = (wordCount * 200) / baseRate;

  // Emittera speech start event
  emitSpeechStart(text, estimatedDuration);

  // Starta viseme-simulation
  startVisemeSimulation(text, estimatedDuration);

  // Spara aktuell prosodi
  state.currentProsody = prosody || null;

  try {
    // Använd ElevenLabs om tillgängligt
    if (state.useElevenLabs && !options.forceWebSpeech) {
      await playElevenLabsAudio(text);
    } else {
      await speakWebSpeech(text, options);
    }
  } finally {
    // Emittera speech end event
    stopVisemeSimulation();
    emitSpeechEnd(text);
    state.currentProsody = null;
  }

  // Applicera pauseAfter om definierad
  if (prosody?.pauseAfter) {
    await new Promise((r) => setTimeout(r, prosody.pauseAfter));
  }
};

/**
 * Tala en sekvens av fraser med intelligenta pauser
 */
const speakSequenceWithProsody = async (
  phrases: Array<{ text: string; prosody?: ProsodyMarking }>,
  baseOptions: SpeechOptions = {}
): Promise<void> => {
  for (const phrase of phrases) {
    await speakWithProsody(phrase.text, phrase.prosody, baseOptions);
    // Standard paus mellan fraser
    await new Promise((r) => setTimeout(r, state.pauseConfig.phraseBoundary));
  }
};

/**
 * Konfigurera pausering
 */
const setPauseConfig = (config: Partial<PauseConfig>): void => {
  state.pauseConfig = { ...state.pauseConfig, ...config };
};

/**
 * Hämta aktuell prosodi
 */
const getCurrentProsody = (): ProsodyMarking | null => {
  return state.currentProsody;
};

/**
 * Tala fas med prosodi-stöd
 */
const speakPhaseWithProsody = async (
  phase: PhaseType,
  position: PhasePosition,
  tempo: number = 1.0
): Promise<void> => {
  // Dynamisk import för att undvika cirkulär import
  const { getPhasePhraseWithProsody } = await import('../data/voicePhrases');

  const useShort = shouldUseShortPhrases(tempo);
  const { text, prosody } = getPhasePhraseWithProsody(phase, position, useShort);

  if (text && canSpeakNow()) {
    const rate = calculateSpeechRate(tempo);
    await speakWithProsody(text, prosody, { rate });
  }
};

/**
 * Tala uppmuntran med prosodi-stöd
 */
const speakEncouragementWithProsody = async (
  context: EncouragementContext,
  tempo: number = 1.0
): Promise<void> => {
  const { getEncouragementPhraseWithProsody } = await import('../data/voicePhrases');

  const useShort = shouldUseShortPhrases(tempo);
  const { text, prosody } = getEncouragementPhraseWithProsody(context, useShort);

  if (text && canSpeakNow()) {
    const rate = calculateSpeechRate(tempo);
    await speakWithProsody(text, prosody, { rate });
  }
};

/**
 * Tala korrigering med prosodi-stöd
 */
const speakCorrectionWithProsody = async (
  severity: CorrectionSeverity,
  tempo: number = 1.0
): Promise<void> => {
  const { getCorrectionPhraseWithProsody } = await import('../data/voicePhrases');

  const useShort = shouldUseShortPhrases(tempo);
  const { text, prosody } = getCorrectionPhraseWithProsody(severity, useShort);

  if (text && canSpeakNow()) {
    const rate = calculateSpeechRate(tempo);
    await speakWithProsody(text, prosody, { rate });
  }
};

// Initialize on import
if (typeof window !== 'undefined' && isSupported()) {
  initVoices();
}

export const speechService = {
  // Grundläggande funktioner
  isSupported,
  isElevenLabsAvailable,
  speak,
  speakSequence,
  speakExerciseSteps,
  speakCountdown,
  speakEncouragement,
  pause,
  resume,
  stop,
  getVoices,
  getSwedishVoices,
  setVoice,
  setUseElevenLabs,
  getState,
  initVoices,
  clearCache,

  // Sprint 4: Förbered-Paus-Utför funktioner
  speakWithTempo,
  preAnnouncePhase,
  speakDuringPhase,
  speakAfterPhase,
  speakRepCount,
  speakSetAnnouncement,
  speakExerciseStart,
  speakExerciseEnd,
  speakSyncedCount,

  // Sprint 4: Konfiguration
  setVoiceTiming,
  setTempoSync,
  updateTempo,
  canSpeakNow,
  calculateSpeechRate,

  // Sprint 4: Konstanter
  DEFAULT_VOICE_TIMING,
  DEFAULT_TEMPO_SYNC,

  // Sprint 5: Prosodi-funktioner
  speakWithProsody,
  speakSequenceWithProsody,
  speakPhaseWithProsody,
  speakEncouragementWithProsody,
  speakCorrectionWithProsody,
  setPauseConfig,
  getCurrentProsody,
  startVisemeSimulation,
  stopVisemeSimulation,

  // Sprint 5: Konstanter
  DEFAULT_PAUSE_CONFIG,
};

// Re-export types för enkel import
export type { PhaseType, PhasePosition, EncouragementContext, CorrectionSeverity, ProsodyMarking, EmotionalTone, PitchContour };

export default speechService;
