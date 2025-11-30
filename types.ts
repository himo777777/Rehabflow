
export enum InjuryType {
  ACUTE = 'Akut skada (Trauma)',
  CHRONIC = 'Kronisk smärta / Överbelastning',
  POST_OP = 'Post-operativ',
  PREHAB = 'Prehab / Förebyggande'
}

export enum PainLevel {
  NONE = 0,
  MILD = 3,
  MODERATE = 6,
  SEVERE = 8,
  EXTREME = 10
}

export interface UserAssessment {
  name: string;
  age: number;
  injuryLocation: string;
  injuryType: InjuryType;
  symptoms: string[];
  painLevel: number; // Resting pain
  activityPainLevel: number; // Pain during movement/load
  surgeryDate?: string; // Only if POST_OP
  goals: string;
  activityLevel: string;
  redFlags?: string[]; // Potential serious symptoms caught in onboarding
  symptomDuration?: string; // How long have they had pain?
  injuryMechanism?: string; // How did it happen?
  additionalInfo?: string; // Free text from patient
  // New Adaptive Fields
  specificAnswers: Record<string, string>; // Dynamic answers based on body part
  lifestyle: {
    sleep: 'Dålig' | 'Okej' | 'Bra';
    stress: 'Låg' | 'Medel' | 'Hög';
    fearAvoidance: boolean; // Are they afraid to move?
    workload: 'Stillasittande' | 'Fysiskt lätt' | 'Fysiskt tungt';
  };
}

export interface ExerciseStep {
  title: string;
  instruction: string;
  type: 'start' | 'execution' | 'tip';
  videoUrl?: string; // Optional URL to MP4/WebM
  animationType?: 'pulse' | 'slide' | 'bounce' | 'shake'; // For abstract fallback
}

export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: string;
  frequency: string;
  tips: string;
  category: 'mobility' | 'strength' | 'balance' | 'endurance';
  risks?: string; // Common mistakes or risks
  advancedTips?: string; // Advanced form cues or progression advice
  difficulty?: 'Lätt' | 'Medel' | 'Svår';
  calories?: string; // E.g. "50 kcal"
  steps?: ExerciseStep[]; // Explicit steps for interactive guide
  videoUrl?: string; // Main demonstration video (YouTube embed URL)
}

export interface DailyPlan {
  day: number;
  focus: string;
  exercises: Exercise[];
}

export interface RehabPhase {
  phaseName: string;
  durationWeeks: string;
  description: string;
  goals: string[];
  precautions: string[];
  dailyRoutine: DailyPlan[]; // Simplified to a representative routine for the phase
}

export interface PatientEducation {
  diagnosis: string; // Specific medical name (e.g., "Patellofemoralt smärtsyndrom")
  explanation: string; // Simple explanation of the condition
  pathology: string; // What is happening biologically? (Tissue healing, etc.)
  prognosis: string; // Expected timeline and outcome
  scienceBackground: string; // Why exercise helps (mechanotransduction, etc.)
  dailyTips: string[]; // Ergonomics, sleep, etc.
  sources: string[]; // List of guidelines/studies used (e.g. "Svenska Fysioterapiförbundet")
}

export interface GeneratedProgram {
  title: string;
  summary: string;
  conditionAnalysis: string;
  patientEducation: PatientEducation; // New comprehensive education module
  phases: RehabPhase[];
}

// Map 'YYYY-MM-DD' to a record of exercise names and their completion status
export type ProgressHistory = Record<string, Record<string, boolean>>;

export type ExerciseAdjustmentType = 'easier' | 'harder' | 'equivalent';

export interface WeeklyAnalysis {
  decision: 'maintain' | 'progress' | 'regress';
  reasoning: string;
  tips: string[];
  score: number; // 0-100 based on consistency
}
