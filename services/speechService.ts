
/**
 * Speech Service - Text-to-Speech for Exercise Instructions
 * Uses the Web Speech API with Swedish language support
 */

export interface SpeechOptions {
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
  voiceName?: string; // Specific voice name
}

interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentUtterance: SpeechSynthesisUtterance | null;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

const state: SpeechState = {
  isSpeaking: false,
  isPaused: false,
  currentUtterance: null,
  availableVoices: [],
  selectedVoice: null
};

// Initialize voices when they become available
const initVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const loadVoices = () => {
      state.availableVoices = window.speechSynthesis.getVoices();

      // Try to find a Swedish voice
      const swedishVoice = state.availableVoices.find(
        (v) => v.lang.startsWith('sv') || v.lang === 'sv-SE'
      );

      // Fallback to any Scandinavian or English voice
      const fallbackVoice = state.availableVoices.find(
        (v) => v.lang.startsWith('nb') || v.lang.startsWith('da') || v.lang.startsWith('en')
      );

      state.selectedVoice = swedishVoice || fallbackVoice || state.availableVoices[0] || null;

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

// Speak text
const speak = (text: string, options: SpeechOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject(new Error('Speech synthesis is not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set options
    utterance.rate = options.rate ?? 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch ?? 1;
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
      // Don't reject on 'interrupted' as it's expected when stopping
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

// Speak multiple sentences with pauses
const speakSequence = async (
  texts: string[],
  options: SpeechOptions = {},
  pauseMs: number = 500
): Promise<void> => {
  for (const text of texts) {
    await speak(text, options);
    // Small pause between sentences
    await new Promise((r) => setTimeout(r, pauseMs));
  }
};

// Speak exercise instructions step by step
const speakExerciseSteps = async (
  exerciseName: string,
  steps: { title: string; content: string }[],
  options: SpeechOptions = {}
): Promise<void> => {
  // Announce exercise name
  await speak(`Nu ska vi göra ${exerciseName}`, options);
  await new Promise((r) => setTimeout(r, 800));

  // Speak each step
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
  if (state.isSpeaking && !state.isPaused) {
    window.speechSynthesis.pause();
    state.isPaused = true;
  }
};

// Resume speech
const resume = (): void => {
  if (state.isPaused) {
    window.speechSynthesis.resume();
    state.isPaused = false;
  }
};

// Stop speech
const stop = (): void => {
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

// Get current state
const getState = (): Readonly<SpeechState> => {
  return { ...state };
};

// Initialize on import
if (typeof window !== 'undefined' && isSupported()) {
  initVoices();
}

export const speechService = {
  isSupported,
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
  getState,
  initVoices
};

export default speechService;
