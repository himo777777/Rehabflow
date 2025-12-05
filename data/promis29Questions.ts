/**
 * PROMIS-29 Profile v2.1 Questions
 *
 * Patient-Reported Outcomes Measurement Information System
 * Comprehensive health assessment across 7 domains + global health
 *
 * Domains:
 * - Physical Function (4 items)
 * - Anxiety (4 items)
 * - Depression (4 items)
 * - Fatigue (4 items)
 * - Sleep Disturbance (4 items)
 * - Social Roles & Activities (4 items)
 * - Pain Interference (4 items)
 * - Pain Intensity (1 item)
 *
 * Total: 29 items
 *
 * @module promis29Questions
 */

export interface PROMIS29Question {
  id: string;
  domain: string;
  question: string;
  options: Array<{
    value: number;
    label: string;
  }>;
  reverse?: boolean; // True if higher score = worse outcome
}

export const PROMIS29_DOMAINS = [
  'Physical Function',
  'Anxiety',
  'Depression',
  'Fatigue',
  'Sleep Disturbance',
  'Social Roles',
  'Pain Interference',
  'Pain Intensity'
] as const;

export type PROMIS29Domain = typeof PROMIS29_DOMAINS[number];

// Response scales
const DIFFICULTY_SCALE = [
  { value: 5, label: 'Utan svårighet' }, // Without any difficulty
  { value: 4, label: 'Med lite svårighet' }, // With little difficulty
  { value: 3, label: 'Med viss svårighet' }, // With some difficulty
  { value: 2, label: 'Med mycket svårighet' }, // With much difficulty
  { value: 1, label: 'Kan inte göra' } // Unable to do
];

const FREQUENCY_SCALE_NEVER_ALWAYS = [
  { value: 1, label: 'Aldrig' }, // Never
  { value: 2, label: 'Sällan' }, // Rarely
  { value: 3, label: 'Ibland' }, // Sometimes
  { value: 4, label: 'Ofta' }, // Often
  { value: 5, label: 'Alltid' } // Always
];

const INTENSITY_SCALE = [
  { value: 1, label: 'Inte alls' }, // Not at all
  { value: 2, label: 'Lite' }, // A little bit
  { value: 3, label: 'Måttligt' }, // Moderately
  { value: 4, label: 'Ganska mycket' }, // Quite a bit
  { value: 5, label: 'Mycket' } // Very much
];

const PAIN_SCALE = [
  { value: 0, label: '0 - Ingen smärta' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10 - Värsta tänkbara smärta' }
];

// PROMIS-29 Questions
export const PROMIS29_QUESTIONS: PROMIS29Question[] = [
  // PHYSICAL FUNCTION (4 items)
  {
    id: 'PF1',
    domain: 'Physical Function',
    question: 'Kan du gå mer än en mil (ca 1.6 km)?',
    options: DIFFICULTY_SCALE,
    reverse: true
  },
  {
    id: 'PF2',
    domain: 'Physical Function',
    question: 'Kan du gå upp för en trappa?',
    options: DIFFICULTY_SCALE,
    reverse: true
  },
  {
    id: 'PF3',
    domain: 'Physical Function',
    question: 'Kan du göra sysslor i hemmet?',
    options: DIFFICULTY_SCALE,
    reverse: true
  },
  {
    id: 'PF4',
    domain: 'Physical Function',
    question: 'Kan du springa ärenden och handla?',
    options: DIFFICULTY_SCALE,
    reverse: true
  },

  // ANXIETY (4 items)
  {
    id: 'ANX1',
    domain: 'Anxiety',
    question: 'Under den senaste veckan: Jag kände mig rädd',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },
  {
    id: 'ANX2',
    domain: 'Anxiety',
    question: 'Under den senaste veckan: Jag hade svårt att koncentrera mig på annat än min oro',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },
  {
    id: 'ANX3',
    domain: 'Anxiety',
    question: 'Under den senaste veckan: Jag kände mig nervös',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },
  {
    id: 'ANX4',
    domain: 'Anxiety',
    question: 'Under den senaste veckan: Jag kände mig orolig',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },

  // DEPRESSION (4 items)
  {
    id: 'DEP1',
    domain: 'Depression',
    question: 'Under den senaste veckan: Jag kände mig värdelös',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },
  {
    id: 'DEP2',
    domain: 'Depression',
    question: 'Under den senaste veckan: Jag kände mig hjälplös',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },
  {
    id: 'DEP3',
    domain: 'Depression',
    question: 'Under den senaste veckan: Jag kände mig deprimerad',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },
  {
    id: 'DEP4',
    domain: 'Depression',
    question: 'Under den senaste veckan: Jag kände mig hopplös',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },

  // FATIGUE (4 items)
  {
    id: 'FAT1',
    domain: 'Fatigue',
    question: 'Under den senaste veckan: Hur uttröttad kände du dig i genomsnitt?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'FAT2',
    domain: 'Fatigue',
    question: 'Under den senaste veckan: Hur mycket begränsade trötthet dina vanliga aktiviteter?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'FAT3',
    domain: 'Fatigue',
    question: 'Under den senaste veckan: Hur svårt var det att påbörja saker på grund av trötthet?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'FAT4',
    domain: 'Fatigue',
    question: 'Under den senaste veckan: Var du för trött för att göra dina vanliga aktiviteter?',
    options: FREQUENCY_SCALE_NEVER_ALWAYS,
    reverse: false
  },

  // SLEEP DISTURBANCE (4 items)
  {
    id: 'SLP1',
    domain: 'Sleep Disturbance',
    question: 'Under den senaste veckan: Hur var din sömnkvalitet?',
    options: [
      { value: 5, label: 'Mycket dålig' },
      { value: 4, label: 'Dålig' },
      { value: 3, label: 'Någorlunda' },
      { value: 2, label: 'Bra' },
      { value: 1, label: 'Mycket bra' }
    ],
    reverse: false
  },
  {
    id: 'SLP2',
    domain: 'Sleep Disturbance',
    question: 'Under den senaste veckan: Hade du svårt att somna?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'SLP3',
    domain: 'Sleep Disturbance',
    question: 'Under den senaste veckan: Mitt sömn var orolig',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'SLP4',
    domain: 'Sleep Disturbance',
    question: 'Under den senaste veckan: Hade du problem med att fortsätta sova?',
    options: INTENSITY_SCALE,
    reverse: false
  },

  // SOCIAL ROLES & ACTIVITIES (4 items)
  {
    id: 'SOC1',
    domain: 'Social Roles',
    question: 'Jag är nöjd med min förmåga att utföra mina vanliga roller och aktiviteter',
    options: [
      { value: 1, label: 'Inte alls' },
      { value: 2, label: 'Lite' },
      { value: 3, label: 'Måttligt' },
      { value: 4, label: 'Ganska mycket' },
      { value: 5, label: 'Mycket' }
    ],
    reverse: true
  },
  {
    id: 'SOC2',
    domain: 'Social Roles',
    question: 'Jag är nöjd med min förmåga att arbeta (inklusive hemarbete)',
    options: [
      { value: 1, label: 'Inte alls' },
      { value: 2, label: 'Lite' },
      { value: 3, label: 'Måttligt' },
      { value: 4, label: 'Ganska mycket' },
      { value: 5, label: 'Mycket' }
    ],
    reverse: true
  },
  {
    id: 'SOC3',
    domain: 'Social Roles',
    question: 'Jag har svårt att utföra mina vanliga sociala aktiviteter med familj, vänner, grannar eller grupper',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'SOC4',
    domain: 'Social Roles',
    question: 'Har du haft problem att utföra dina vanliga aktiviteter med familjen?',
    options: INTENSITY_SCALE,
    reverse: false
  },

  // PAIN INTERFERENCE (4 items)
  {
    id: 'PAIN1',
    domain: 'Pain Interference',
    question: 'Under den senaste veckan: Hur mycket hindrade smärta ditt arbete runt hemmet?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'PAIN2',
    domain: 'Pain Interference',
    question: 'Under den senaste veckan: Hur mycket hindrade smärta din förmåga att delta i sociala aktiviteter?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'PAIN3',
    domain: 'Pain Interference',
    question: 'Under den senaste veckan: Hur mycket hindrade smärta ditt arbete (inklusive hemarbete)?',
    options: INTENSITY_SCALE,
    reverse: false
  },
  {
    id: 'PAIN4',
    domain: 'Pain Interference',
    question: 'Under den senaste veckan: Hur mycket hindrade smärta dina fritidsaktiviteter?',
    options: INTENSITY_SCALE,
    reverse: false
  },

  // PAIN INTENSITY (1 item)
  {
    id: 'PAININT',
    domain: 'Pain Intensity',
    question: 'Hur graderar du din smärta i genomsnitt under den senaste veckan?',
    options: PAIN_SCALE,
    reverse: false
  }
];

// Domain groupings for display
export const PROMIS29_BY_DOMAIN: Record<PROMIS29Domain, PROMIS29Question[]> = {
  'Physical Function': PROMIS29_QUESTIONS.filter(q => q.domain === 'Physical Function'),
  'Anxiety': PROMIS29_QUESTIONS.filter(q => q.domain === 'Anxiety'),
  'Depression': PROMIS29_QUESTIONS.filter(q => q.domain === 'Depression'),
  'Fatigue': PROMIS29_QUESTIONS.filter(q => q.domain === 'Fatigue'),
  'Sleep Disturbance': PROMIS29_QUESTIONS.filter(q => q.domain === 'Sleep Disturbance'),
  'Social Roles': PROMIS29_QUESTIONS.filter(q => q.domain === 'Social Roles'),
  'Pain Interference': PROMIS29_QUESTIONS.filter(q => q.domain === 'Pain Interference'),
  'Pain Intensity': PROMIS29_QUESTIONS.filter(q => q.domain === 'Pain Intensity')
};

// Scoring lookup tables (T-scores with mean=50, SD=10)
export const PROMIS29_SCORING = {
  'Physical Function': {
    rawToTScore: {
      4: 26.6, 5: 29.0, 6: 31.0, 7: 32.7, 8: 34.3, 9: 35.7, 10: 37.1, 11: 38.4, 12: 39.7,
      13: 40.9, 14: 42.1, 15: 43.4, 16: 44.6, 17: 45.9, 18: 47.3, 19: 48.8, 20: 50.5
    }
  },
  'Anxiety': {
    rawToTScore: {
      4: 37.1, 5: 40.3, 6: 43.0, 7: 45.3, 8: 47.5, 9: 49.6, 10: 51.7, 11: 53.7, 12: 55.8,
      13: 57.9, 14: 60.1, 15: 62.5, 16: 65.1, 17: 68.1, 18: 71.5, 19: 75.5, 20: 81.6
    }
  },
  'Depression': {
    rawToTScore: {
      4: 38.2, 5: 41.0, 6: 43.2, 7: 45.1, 8: 46.9, 9: 48.6, 10: 50.3, 11: 52.0, 12: 53.8,
      13: 55.7, 14: 57.6, 15: 59.8, 16: 62.1, 17: 64.9, 18: 68.0, 19: 71.9, 20: 79.4
    }
  },
  'Fatigue': {
    rawToTScore: {
      4: 33.7, 5: 38.4, 6: 41.4, 7: 43.7, 8: 45.8, 9: 47.8, 10: 49.7, 11: 51.6, 12: 53.5,
      13: 55.5, 14: 57.5, 15: 59.7, 16: 62.0, 17: 64.6, 18: 67.5, 19: 70.9, 20: 75.8
    }
  },
  'Sleep Disturbance': {
    rawToTScore: {
      4: 28.0, 5: 32.0, 6: 35.0, 7: 37.3, 8: 39.4, 9: 41.3, 10: 43.1, 11: 44.9, 12: 46.7,
      13: 48.5, 14: 50.4, 15: 52.4, 16: 54.5, 17: 56.8, 18: 59.4, 19: 62.5, 20: 72.8
    }
  },
  'Social Roles': {
    rawToTScore: {
      4: 26.2, 5: 29.3, 6: 31.5, 7: 33.3, 8: 34.9, 9: 36.4, 10: 37.9, 11: 39.3, 12: 40.7,
      13: 42.2, 14: 43.7, 15: 45.2, 16: 46.9, 17: 48.7, 18: 50.7, 19: 53.0, 20: 55.8
    }
  },
  'Pain Interference': {
    rawToTScore: {
      4: 38.4, 5: 41.6, 6: 44.1, 7: 46.3, 8: 48.3, 9: 50.1, 10: 51.9, 11: 53.7, 12: 55.5,
      13: 57.3, 14: 59.2, 15: 61.3, 16: 63.5, 17: 66.1, 18: 69.1, 19: 72.9, 20: 77.7
    }
  }
};

// Clinical severity interpretation
export interface SeverityInterpretation {
  level: 'None' | 'Mild' | 'Moderate' | 'Severe';
  color: string;
  description: string;
}

export function interpretTScore(domain: string, tScore: number): SeverityInterpretation {
  // For negative domains (higher = worse): Anxiety, Depression, Fatigue, Sleep, Pain
  const isNegativeDomain = ['Anxiety', 'Depression', 'Fatigue', 'Sleep Disturbance', 'Pain Interference'].includes(domain);

  if (isNegativeDomain) {
    if (tScore < 55) {
      return { level: 'None', color: 'green', description: 'Within normal limits' };
    } else if (tScore < 60) {
      return { level: 'Mild', color: 'yellow', description: 'Mild symptoms' };
    } else if (tScore < 70) {
      return { level: 'Moderate', color: 'orange', description: 'Moderate symptoms' };
    } else {
      return { level: 'Severe', color: 'red', description: 'Severe symptoms' };
    }
  } else {
    // For positive domains (higher = better): Physical Function, Social Roles
    if (tScore >= 55) {
      return { level: 'None', color: 'green', description: 'Within normal limits' };
    } else if (tScore >= 45) {
      return { level: 'Mild', color: 'yellow', description: 'Mild impairment' };
    } else if (tScore >= 35) {
      return { level: 'Moderate', color: 'orange', description: 'Moderate impairment' };
    } else {
      return { level: 'Severe', color: 'red', description: 'Severe impairment' };
    }
  }
}
