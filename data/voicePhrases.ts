/**
 * Voice Phrases - Sprint 5: Utökad frasbank för röstfeedback
 * 500+ fraser med prosodi-stöd för naturlig röstfeedback
 */

// ============================================
// TYPES
// ============================================

export type PhaseType = 'eccentric' | 'concentric' | 'isometric' | 'hold' | 'rest' | 'transition';
export type PhasePosition = 'start' | 'midway' | 'end';
export type EncouragementContext = 'milestone' | 'struggle' | 'success' | 'general' | 'firstRep' | 'lastRep' | 'personalBest' | 'comeback' | 'consistency';
export type CorrectionSeverity = 'gentle' | 'moderate' | 'urgent';
export type ExerciseCategory = 'legs' | 'core' | 'push' | 'pull' | 'balance' | 'stretch' | 'lunge' | 'press' | 'shoulder';
export type EmotionalTone = 'encouraging' | 'calm' | 'urgent' | 'celebratory' | 'neutral';
export type PitchContour = 'rising' | 'falling' | 'flat' | 'rise-fall';

// Prosodi-information för naturligare TTS
export interface ProsodyMarking {
  stress?: number[];         // Index för betonade ord
  pitchContour?: PitchContour;
  pauseAfter?: number;       // ms paus efter frasen
  emotionalTone?: EmotionalTone;
  speakingRate?: number;     // 0.5-2.0 (1.0 = normal)
}

export interface VoicePhrase {
  text: string;
  shortText?: string;        // Kortare version för snabbt tempo
  priority?: number;         // Högre = viktigare (1-10)
  prosody?: ProsodyMarking;  // Prosodi-information
}

export interface ExerciseSpecificPhrases {
  preparation: VoicePhrase[];
  execution: VoicePhrase[];
  formTips: VoicePhrase[];
  commonMistakes: VoicePhrase[];
}

export interface VoicePhraseBank {
  phases: Record<PhaseType, Record<PhasePosition, VoicePhrase[]>>;
  encouragement: Record<EncouragementContext, VoicePhrase[]>;
  corrections: Record<CorrectionSeverity, VoicePhrase[]>;
  counting: {
    numbers: Record<number, string>;
    repAnnouncements: VoicePhrase[];
    setAnnouncements: VoicePhrase[];
  };
  transitions: {
    exerciseStart: VoicePhrase[];
    exerciseEnd: VoicePhrase[];
    breakStart: VoicePhrase[];
    breakEnd: VoicePhrase[];
    sessionStart: VoicePhrase[];
    sessionEnd: VoicePhrase[];
  };
  exerciseSpecific: Record<ExerciseCategory, ExerciseSpecificPhrases>;
  breathing: {
    inhale: VoicePhrase[];
    exhale: VoicePhrase[];
    hold: VoicePhrase[];
  };
  tempo: {
    tooFast: VoicePhrase[];
    tooSlow: VoicePhrase[];
    perfect: VoicePhrase[];
  };
}

// ============================================
// PHRASE BANK - SVENSKA
// ============================================

export const VOICE_PHRASES: VoicePhraseBank = {
  phases: {
    eccentric: {
      start: [
        { text: 'Sänk kontrollerat', shortText: 'Ner', priority: 8, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Långsamt ner nu', shortText: 'Ner', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Känn töjningen', shortText: 'Töj', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Bromsa rörelsen', shortText: 'Bromsa', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Mjukt neråt', shortText: 'Ner', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Kontrollera nedfasen', shortText: 'Kontroll', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Låt tyngden sjunka', shortText: 'Sjunk', priority: 6, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Sakta och stadigt', shortText: 'Sakta', priority: 7, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Mot motståndet', shortText: 'Motstånd', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Sänk med precision', shortText: 'Sänk', priority: 7, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Ner med kontroll', shortText: 'Ner', priority: 7, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Arbeta mot gravitationen', shortText: 'Mot grav', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Mjukt och stabilt', shortText: 'Mjukt', priority: 6, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Kontrollerad sänkning', shortText: 'Sänk', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Följ med ner', shortText: 'Ner', priority: 6, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
      ],
      midway: [
        { text: 'Bra tempo', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Fortsätt så', shortText: 'Fortsätt', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Halvvägs ner', shortText: 'Halvvägs', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Behåll kontrollen', shortText: 'Kontroll', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Jämn hastighet', shortText: 'Jämnt', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Perfekt tempo', shortText: 'Perfekt', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Precis så där', shortText: 'Så där', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Du har full kontroll', shortText: 'Kontroll', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Känn muskelarbetet', shortText: 'Känn', priority: 5, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stadigt neråt', shortText: 'Stadigt', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Fint jobbat', shortText: 'Fint', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Rätt hastighet', shortText: 'Rätt', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Lite till', shortText: 'Till', priority: 4, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Nästan i botten', shortText: 'Nästan', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Håll tempot', shortText: 'Tempo', priority: 5, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
      ],
      end: [
        { text: 'Fint', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nästan där', shortText: 'Snart', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Bra kontroll', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nu vänder vi', shortText: 'Vänd', priority: 7, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
        { text: 'Bottenpositionen', shortText: 'Botten', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Sista biten', shortText: 'Sista', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Dags att vända', shortText: 'Vänd', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Strålande nedfas', shortText: 'Strålande', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Botten nådd', shortText: 'Botten', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Redo för uppfasen', shortText: 'Redo', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Perfekt djup', shortText: 'Perfekt', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Maximalt djup', shortText: 'Max', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Full excentrisk fas', shortText: 'Full', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Vänd nu', shortText: 'Vänd', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Bra djup', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
    },
    concentric: {
      start: [
        { text: 'Nu uppåt', shortText: 'Upp', priority: 8, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Tryck ifrån', shortText: 'Tryck', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Kraft nu', shortText: 'Kraft', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Pressa uppåt', shortText: 'Pressa', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Aktivera musklerna', shortText: 'Aktivera', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Explosivt uppåt', shortText: 'Upp', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Full kraft', shortText: 'Kraft', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Driv uppåt', shortText: 'Driv', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Pressa från hälarna', shortText: 'Hälar', priority: 6, prosody: { stress: [0, 2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Kontrahera', shortText: 'Kontr', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm' } },
        { text: 'Power upp', shortText: 'Power', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Res dig', shortText: 'Res', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Lyft nu', shortText: 'Lyft', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Spänn och tryck', shortText: 'Spänn', priority: 7, prosody: { stress: [0, 2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Accelerera uppåt', shortText: 'Acceler', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
      midway: [
        { text: 'Starka tag', shortText: 'Stark', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Du klarar det', shortText: 'Klara', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Halvvägs upp', shortText: 'Halvvägs', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Fortsätt trycka', shortText: 'Tryck', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nästan där', shortText: 'Snart', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Fortsätt driva', shortText: 'Driv', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Bra kraft', shortText: 'Kraft', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Stark rörelse', shortText: 'Stark', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Känn styrkan', shortText: 'Styrka', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Du har det', shortText: 'Har det', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Pressa igenom', shortText: 'Pressa', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Stark och stadig', shortText: 'Stark', priority: 5, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Nästan i topp', shortText: 'Topp', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Kraftfullt', shortText: 'Kraft', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Du gör det', shortText: 'Gör det', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
      end: [
        { text: 'Utmärkt', shortText: 'Bra', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
        { text: 'En till', shortText: 'Till', priority: 4, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Stark', shortText: 'Stark', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Bra repetition', shortText: 'Bra rep', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
        { text: 'Sträck ut helt', shortText: 'Sträck', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Topposition', shortText: 'Topp', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Full utsträckning', shortText: 'Full', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Fantastisk rep', shortText: 'Fant', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
        { text: 'Lås positionen', shortText: 'Lås', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Perfekt avslut', shortText: 'Perfekt', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
        { text: 'Helt uppe', shortText: 'Uppe', priority: 5, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Stark avslutning', shortText: 'Stark', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
        { text: 'Rep klar', shortText: 'Klar', priority: 5, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'neutral' } },
        { text: 'Bra jobbat', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
        { text: 'Helt igenom', shortText: 'Igenom', priority: 5, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'neutral' } },
      ],
    },
    isometric: {
      start: [
        { text: 'Håll positionen', shortText: 'Håll', priority: 8, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stanna här', shortText: 'Stanna', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Statiskt grepp', shortText: 'Håll', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Behåll spänningen', shortText: 'Spänning', priority: 7, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Aktivt stopp', shortText: 'Stopp', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Spänn och håll', shortText: 'Spänn', priority: 7, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Lås rörelsen', shortText: 'Lås', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Frys positionen', shortText: 'Frys', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stilla nu', shortText: 'Stilla', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Isometriskt grepp', shortText: 'Isom', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Håll här', shortText: 'Håll', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Konstant spänning', shortText: 'Konstant', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stanna kvar', shortText: 'Stanna', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stabilisera', shortText: 'Stabil', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Håll den', shortText: 'Håll', priority: 7, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      ],
      midway: [
        { text: 'Fortsätt hålla', shortText: 'Håll', priority: 6, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Andas lugnt', shortText: 'Andas', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stabil position', shortText: 'Stabil', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Halvtid kvar', shortText: 'Halvtid', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Bra uthållighet', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Du klarar det', shortText: 'Klarar', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Stark mentalt', shortText: 'Stark', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Känn musklerna jobba', shortText: 'Känn', priority: 5, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Behåll fokus', shortText: 'Fokus', priority: 6, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stabil och stark', shortText: 'Stabil', priority: 5, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Håll kvar', shortText: 'Håll', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Lite till', shortText: 'Lite', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Perfekt position', shortText: 'Perfekt', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Fortsätt andas', shortText: 'Andas', priority: 5, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Du är stark', shortText: 'Stark', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
      end: [
        { text: 'Snart klar', shortText: 'Snart', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Sista sekunderna', shortText: 'Sista', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Bra uthållighet', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
        { text: 'Nästan klart', shortText: 'Nästan', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Tre sekunder', shortText: 'Tre', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Håll lite till', shortText: 'Lite', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Sista pushen', shortText: 'Sista', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Avsluta starkt', shortText: 'Stark', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Du har klarat det', shortText: 'Klarat', priority: 6, prosody: { stress: [2], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
        { text: 'Fantastiskt hållet', shortText: 'Fant', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
        { text: 'Redo att släppa', shortText: 'Redo', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Strax klar', shortText: 'Strax', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Bra motstånd', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Utmärkt styrka', shortText: 'Utmärkt', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
        { text: 'Slut på hold', shortText: 'Slut', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral' } },
      ],
    },
    hold: {
      start: [
        { text: 'Kort paus', shortText: 'Paus', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Vänta', shortText: 'Vänta', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stanna', shortText: 'Stanna', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Pausera här', shortText: 'Paus', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Kort stopp', shortText: 'Stopp', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stanna upp', shortText: 'Stanna', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Hold', shortText: 'Hold', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Mellanpaus', shortText: 'Paus', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Paus i rörelsen', shortText: 'Paus', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Vänta lite', shortText: 'Vänta', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Håll kvar kort', shortText: 'Håll', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Kort vila', shortText: 'Vila', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Andningspaus', shortText: 'Andas', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stopp i övergång', shortText: 'Stopp', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Mellanposition', shortText: 'Mellan', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      ],
      midway: [
        { text: 'Känn positionen', shortText: 'Känn', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Håll kvar', shortText: 'Håll', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Stabil', shortText: 'Stabil', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Bra', shortText: 'Bra', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Andas', shortText: 'Andas', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Håll det', shortText: 'Håll', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Fortsätt', shortText: 'Forts', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
        { text: 'Lite till', shortText: 'Till', priority: 5, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'encouraging' } },
        { text: 'Snart', shortText: 'Snart', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Du klarar det', shortText: 'Klara', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
      end: [
        { text: 'Fortsätt', shortText: 'Vidare', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nu går vi vidare', shortText: 'Vidare', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Dags att röra på sig', shortText: 'Rör', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nästa fas', shortText: 'Nästa', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'neutral' } },
        { text: 'Vidare nu', shortText: 'Vidare', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Släpp', shortText: 'Släpp', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
        { text: 'Redo för nästa', shortText: 'Redo', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Vi fortsätter', shortText: 'Forts', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nu igen', shortText: 'Nu', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Tillbaka till rörelsen', shortText: 'Tillbaka', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
    },
    rest: {
      start: [
        { text: 'Vila nu', shortText: 'Vila', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Ta en paus', shortText: 'Paus', priority: 5, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Återhämta dig', shortText: 'Återhämta', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Slappna av', shortText: 'Slappna', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Vilopaus', shortText: 'Vila', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Samla krafterna', shortText: 'Samla', priority: 5, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Låt musklerna vila', shortText: 'Vila', priority: 5, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Andas ut', shortText: 'Ut', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Återhämtningsfas', shortText: 'Återhämta', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Skaka av dig', shortText: 'Skaka', priority: 4, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Välförtjänt paus', shortText: 'Paus', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Ladda om', shortText: 'Ladda', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Pausera och andas', shortText: 'Andas', priority: 5, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Fyll på energin', shortText: 'Energi', priority: 5, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Ta det lugnt', shortText: 'Lugnt', priority: 5, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      ],
      midway: [
        { text: 'Andas djupt', shortText: 'Andas', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Återhämta musklerna', shortText: 'Återhämta', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Förbered nästa set', shortText: 'Förbered', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Känn hur musklerna slappnar av', shortText: 'Slappna', priority: 4, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Bra jobbat hittills', shortText: 'Bra', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging', speakingRate: 0.9 } },
        { text: 'Snart dags igen', shortText: 'Snart', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral', speakingRate: 0.9 } },
        { text: 'Fokusera på andningen', shortText: 'Andas', priority: 4, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Låt hjärtat lugna sig', shortText: 'Lugna', priority: 4, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Halvtid på vilan', shortText: 'Halvtid', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral', speakingRate: 0.9 } },
        { text: 'Mentalt förbered dig', shortText: 'Mental', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Tänk på tekniken', shortText: 'Teknik', priority: 5, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Du gör framsteg', shortText: 'Framsteg', priority: 4, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging', speakingRate: 0.9 } },
        { text: 'Njut av pausen', shortText: 'Njut', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Samla tankarna', shortText: 'Samla', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
        { text: 'Återhämtning pågår', shortText: 'Återhämta', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral', speakingRate: 0.9 } },
      ],
      end: [
        { text: 'Gör dig redo', shortText: 'Redo', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nästa set snart', shortText: 'Snart', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'neutral' } },
        { text: 'Fem sekunder kvar', shortText: 'Fem sek', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'neutral' } },
        { text: 'Snart dags', shortText: 'Snart', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'neutral' } },
        { text: 'Förbered dig', shortText: 'Förbered', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Ställ dig i position', shortText: 'Position', priority: 7, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Tre sekunder', shortText: 'Tre', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'neutral' } },
        { text: 'Nu kör vi', shortText: 'Kör', priority: 8, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Redo för action', shortText: 'Action', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'På med igen', shortText: 'Igen', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Pausen är slut', shortText: 'Slut', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'neutral' } },
        { text: 'Dags att köra', shortText: 'Kör', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nästa omgång', shortText: 'Nästa', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Vi kör igen', shortText: 'Igen', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Fokus på', shortText: 'Fokus', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
    },
    transition: {
      start: [
        { text: 'Övergång nu', shortText: 'Övergång', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Byt position', shortText: 'Byt', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Justera ställningen', shortText: 'Justera', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Förbered nästa rörelse', shortText: 'Förbered', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Ändra position', shortText: 'Ändra', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Reset', shortText: 'Reset', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Ny startposition', shortText: 'Start', priority: 6, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Flytta dig', shortText: 'Flytta', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
      ],
      midway: [
        { text: 'Fortsätt justera', shortText: 'Justera', priority: 4, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Snart på plats', shortText: 'Snart', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
        { text: 'Bra tempo', shortText: 'Bra', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nästan klar', shortText: 'Nästan', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
      ],
      end: [
        { text: 'Position klar', shortText: 'Klar', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Redo för nästa', shortText: 'Redo', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Perfekt position', shortText: 'Perfekt', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Nu kör vi', shortText: 'Kör', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Allt klart', shortText: 'Klart', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
        { text: 'Bra justering', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      ],
    },
  },

  encouragement: {
    milestone: [
      { text: 'Halvvägs!', shortText: 'Halv!', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Fem repetitioner kvar', shortText: 'Fem kvar', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Tre kvar', shortText: 'Tre', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sista setet', shortText: 'Sista', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Kvarts väg kvar', shortText: 'Kvart', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'neutral' } },
      { text: 'Nästan framme', shortText: 'Nästan', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Snart i mål', shortText: 'Snart', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Två repetitioner kvar', shortText: 'Två kvar', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'En kvar!', shortText: 'En!', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Tio stycken klara', shortText: 'Tio klara', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Fantastisk milestone', shortText: 'Milestone', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du är på upploppet', shortText: 'Upplopp', priority: 7, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sista reps inför dig', shortText: 'Sista reps', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Så nära nu', shortText: 'Nära', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Slutspurten börjar', shortText: 'Slutspurt', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Mållinjen i sikte', shortText: 'Mål', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Nedräkning påbörjad', shortText: 'Nedräkn', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Set snart avklarat', shortText: 'Snart klart', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du har kommit långt', shortText: 'Långt', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sista etappen', shortText: 'Sista', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    struggle: [
      { text: 'Du klarar det', shortText: 'Klara', priority: 8, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Bara lite till', shortText: 'Lite till', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Ge inte upp', shortText: 'Fortsätt', priority: 8, prosody: { stress: [1, 2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Kämpa på', shortText: 'Kämpa', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du är starkare', shortText: 'Stark', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fokusera', shortText: 'Fokus', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'En i taget', shortText: 'En åt gången', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Tänk på andningen', shortText: 'Andas', priority: 5, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Dig starkare än smärtan', shortText: 'Stark', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Bryt igenom barriären', shortText: 'Bryt', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Mental styrka nu', shortText: 'Mental', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du har tränat för det här', shortText: 'Tränat', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Kroppen klarar mer', shortText: 'Mer', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Tänk på målet', shortText: 'Mål', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Press through', shortText: 'Press', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Andas och fokusera', shortText: 'Andas', priority: 6, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Stäng av tankarna', shortText: 'Stäng', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Visualisera framgång', shortText: 'Visual', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du är tuffare än så', shortText: 'Tuff', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Push it', shortText: 'Push', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    success: [
      { text: 'Perfekt form', shortText: 'Perfekt', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Fantastiskt', shortText: 'Fint', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Ny rekord', shortText: 'Rekord', priority: 8, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Imponerande', shortText: 'Impon', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Strålande teknik', shortText: 'Strålande', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Otroligt bra', shortText: 'Otroligt', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du överträffade dig själv', shortText: 'Toppen', priority: 7, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Mästarklass', shortText: 'Mästar', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Exceptionellt', shortText: 'Except', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Världsklass', shortText: 'Världs', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Professionell nivå', shortText: 'Proffs', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Perfekt utförande', shortText: 'Perfekt', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du är en maskin', shortText: 'Maskin', priority: 7, prosody: { stress: [3], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Läroboksexempel', shortText: 'Lärobok', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Felfri teknik', shortText: 'Felfri', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Champion-material', shortText: 'Champ', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Suveränt', shortText: 'Suverän', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Helt outstanding', shortText: 'Outstand', priority: 7, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Elitprestation', shortText: 'Elit', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Toppnotering', shortText: 'Topp', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
    ],
    general: [
      { text: 'Bra jobbat', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Fortsätt så', shortText: 'Fortsätt', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'encouraging' } },
      { text: 'Du gör det bra', shortText: 'Bra', priority: 5, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fint', shortText: 'Fint', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Snyggt', shortText: 'Snyggt', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Bra arbete', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Helt rätt', shortText: 'Rätt', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Nice', shortText: 'Nice', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Keep going', shortText: 'Keep', priority: 4, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sådär ja', shortText: 'Sådär', priority: 4, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Det där var bra', shortText: 'Bra', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Bra gjort', shortText: 'Bra', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Stabilt', shortText: 'Stabil', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'encouraging' } },
      { text: 'Bra tempo', shortText: 'Tempo', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Starkt', shortText: 'Starkt', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du är på rätt väg', shortText: 'Rätt väg', priority: 5, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Snygg rörelse', shortText: 'Snygg', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Såja', shortText: 'Såja', priority: 4, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Yes', shortText: 'Yes', priority: 4, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Utmärkt', shortText: 'Utmärkt', priority: 5, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
    ],
    firstRep: [
      { text: 'Bra start', shortText: 'Start', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Första avklarad', shortText: 'En klar', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Så börjar vi', shortText: 'Börjar', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Nu är vi igång', shortText: 'Igång', priority: 5, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Stark öppning', shortText: 'Stark', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fin första', shortText: 'Fin', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Bra första rep', shortText: 'Bra första', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Nu rullar det på', shortText: 'Rullar', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Första i hamn', shortText: 'I hamn', priority: 5, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Perfekt start', shortText: 'Perfekt', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Sätter tonen', shortText: 'Ton', priority: 5, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Stark inledning', shortText: 'Stark', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    lastRep: [
      { text: 'Sista repetitionen', shortText: 'Sista', priority: 8, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Nu den sista', shortText: 'Sista', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Ge allt nu', shortText: 'Allt', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Avsluta starkt', shortText: 'Stark', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sista pushen', shortText: 'Push', priority: 8, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Full kraft nu', shortText: 'Full', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Allt du har kvar', shortText: 'Allt', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sista för idag', shortText: 'Sista', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Kröna prestationen', shortText: 'Krön', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'En sista gång', shortText: 'En gång', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Grand finale', shortText: 'Finale', priority: 8, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Sista chansen att imponera', shortText: 'Imponera', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    personalBest: [
      { text: 'Nytt personbästa!', shortText: 'PB!', priority: 9, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du slog ditt rekord', shortText: 'Rekord', priority: 9, prosody: { stress: [2], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Historiskt bästa', shortText: 'Bästa', priority: 9, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Otrolig framgång', shortText: 'Framgång', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Ny toppnotering', shortText: 'Topp', priority: 9, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du har överträffat dig själv', shortText: 'Överträff', priority: 8, prosody: { stress: [2], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Bättre än någonsin', shortText: 'Bättre', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'All-time high', shortText: 'High', priority: 9, prosody: { stress: [2], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Rekordbrytning', shortText: 'Rekord', priority: 9, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du flyttade gränsen', shortText: 'Gräns', priority: 8, prosody: { stress: [2], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
    ],
    comeback: [
      { text: 'Välkommen tillbaka', shortText: 'Tillbaka', priority: 7, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Skönt att se dig igen', shortText: 'Igen', priority: 6, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Stark comeback', shortText: 'Comeback', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du är tillbaka på banan', shortText: 'Banan', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Bra att ha dig tillbaka', shortText: 'Tillbaka', priority: 6, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Return of the champion', shortText: 'Champ', priority: 7, prosody: { stress: [2], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Fortsätt där du slutade', shortText: 'Fortsätt', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Kroppen minns', shortText: 'Minns', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Muskelminnet kickar in', shortText: 'Minne', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du har det i dig', shortText: 'I dig', priority: 6, prosody: { stress: [3], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    consistency: [
      { text: 'Imponerande kontinuitet', shortText: 'Kontin', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Dag efter dag', shortText: 'Dag', priority: 6, prosody: { stress: [0, 2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Konsekvent träning ger resultat', shortText: 'Resultat', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Du håller i', shortText: 'Håller', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Regelbunden träning lönar sig', shortText: 'Lönar', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Tredje dagen i rad', shortText: 'Tredje', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'En vecka utan avbrott', shortText: 'Vecka', priority: 7, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Du bygger vanan', shortText: 'Vana', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Disciplin betalar sig', shortText: 'Disciplin', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Stark rutinbyggare', shortText: 'Rutin', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
  },

  corrections: {
    gentle: [
      { text: 'Prova att justera lite', shortText: 'Justera', priority: 5, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Tänk på hållningen', shortText: 'Hållning', priority: 5, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Lite långsammare kanske', shortText: 'Långsamt', priority: 4, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Kontrollera formen', shortText: 'Form', priority: 5, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Känn efter positionen', shortText: 'Känn', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Mjukare rörelse', shortText: 'Mjukt', priority: 4, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Tänk på andningen', shortText: 'Andas', priority: 4, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Justera höjden lite', shortText: 'Höjd', priority: 4, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Finjustera vinkeln', shortText: 'Vinkel', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Prova att slappna av lite', shortText: 'Slappna', priority: 4, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm' } },
    ],
    moderate: [
      { text: 'Räta på ryggen', shortText: 'Rygg', priority: 7, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Sakta ner tempot', shortText: 'Sakta', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Håll knäna i linje', shortText: 'Knän', priority: 7, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Mer kontroll behövs', shortText: 'Kontroll', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Aktivera core', shortText: 'Core', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Spänn magen', shortText: 'Mage', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Axlarna tillbaka', shortText: 'Axlar', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Håll ryggen neutral', shortText: 'Neutral', priority: 7, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Fötterna parallellt', shortText: 'Fötter', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Knäna över tårna', shortText: 'Knän', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Sänk höfterna mer', shortText: 'Höfter', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Armbågarna in', shortText: 'Armbågar', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Full rörelseomfång', shortText: 'Full ROM', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Balansen åt höger', shortText: 'Höger', priority: 6, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Balansen åt vänster', shortText: 'Vänster', priority: 6, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
    ],
    urgent: [
      { text: 'Pausa och justera', shortText: 'Pausa', priority: 9, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Stopp, felaktig form', shortText: 'Stopp', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Risk för skada', shortText: 'Risk', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Börja om med bättre form', shortText: 'Om', priority: 9, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Omedelbar korrigering krävs', shortText: 'Korrig', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Lägg av vikten', shortText: 'Lägg av', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Stanna direkt', shortText: 'Stanna', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Farlig position', shortText: 'Farlig', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Avbryt övningen', shortText: 'Avbryt', priority: 10, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'urgent' } },
      { text: 'Inte säkert att fortsätta', shortText: 'Osäkert', priority: 9, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'urgent' } },
    ],
  },

  counting: {
    numbers: {
      1: 'ett',
      2: 'två',
      3: 'tre',
      4: 'fyra',
      5: 'fem',
      6: 'sex',
      7: 'sju',
      8: 'åtta',
      9: 'nio',
      10: 'tio',
      11: 'elva',
      12: 'tolv',
      13: 'tretton',
      14: 'fjorton',
      15: 'femton',
      16: 'sexton',
      17: 'sjutton',
      18: 'arton',
      19: 'nitton',
      20: 'tjugo',
    },
    repAnnouncements: [
      { text: 'Repetition {n}', shortText: '{n}', priority: 6 },
      { text: 'Nummer {n}', shortText: '{n}', priority: 5 },
      { text: '{n} av {total}', shortText: '{n}/{total}', priority: 6 },
    ],
    setAnnouncements: [
      { text: 'Set {n} av {total}', shortText: 'Set {n}', priority: 7 },
      { text: 'Nu börjar set {n}', shortText: 'Set {n}', priority: 7 },
      { text: 'Sista setet', shortText: 'Sista set', priority: 8 },
    ],
  },

  transitions: {
    exerciseStart: [
      { text: 'Nu börjar vi med {exercise}', shortText: '{exercise}', priority: 8, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Dags för {exercise}', shortText: '{exercise}', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Nästa övning: {exercise}', shortText: '{exercise}', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'neutral' } },
      { text: 'Gör dig redo för {exercise}', shortText: 'Redo', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Vi kör {exercise}', shortText: '{exercise}', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: '{exercise} väntar', shortText: '{exercise}', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'neutral' } },
      { text: 'Ställ dig för {exercise}', shortText: 'Ställ', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Ny övning: {exercise}', shortText: 'Ny', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Intar position för {exercise}', shortText: 'Position', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'neutral' } },
      { text: 'Fokus på {exercise}', shortText: 'Fokus', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm' } },
    ],
    exerciseEnd: [
      { text: 'Bra jobbat med {exercise}', shortText: 'Klart', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: '{exercise} avklarat', shortText: 'Klart', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'encouraging' } },
      { text: 'Utmärkt, {exercise} är klart', shortText: 'Klart', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: '{exercise} klart', shortText: 'Klart', priority: 5, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'neutral' } },
      { text: 'Fantastisk {exercise}', shortText: 'Fant', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Du klarade {exercise}', shortText: 'Klarade', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Check på {exercise}', shortText: 'Check', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: '{exercise} i hamn', shortText: 'Hamn', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    breakStart: [
      { text: 'Ta en kort paus', shortText: 'Paus', priority: 6, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      { text: 'Vila i {seconds} sekunder', shortText: 'Vila', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      { text: 'Återhämtning', shortText: 'Återhämta', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      { text: 'Pausläge', shortText: 'Paus', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      { text: 'Vilopaus aktiverad', shortText: 'Vila', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      { text: 'Andas och vila', shortText: 'Andas', priority: 5, prosody: { stress: [0, 2], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.9 } },
      { text: '{seconds} sekunder paus', shortText: '{seconds} sek', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'neutral', speakingRate: 0.9 } },
      { text: 'Drick vatten om du behöver', shortText: 'Vatten', priority: 4, prosody: { stress: [1], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.9 } },
    ],
    breakEnd: [
      { text: 'Pausen är slut', shortText: 'Slut', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'neutral' } },
      { text: 'Gör dig redo igen', shortText: 'Redo', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Vi fortsätter', shortText: 'Fortsätt', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Tillbaka till action', shortText: 'Action', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Dags att köra igen', shortText: 'Kör', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Vila över', shortText: 'Över', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'neutral' } },
      { text: 'På med igen', shortText: 'Igen', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fokus tillbaka', shortText: 'Fokus', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm' } },
    ],
    sessionStart: [
      { text: 'Välkommen till dagens träning', shortText: 'Välkommen', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Redo att träna?', shortText: 'Redo?', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Vi börjar nu', shortText: 'Börjar', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Dags att aktivera kroppen', shortText: 'Aktivera', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Dagens pass börjar', shortText: 'Pass', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Ge allt du har', shortText: 'Ge allt', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fokusera och andas', shortText: 'Fokus', priority: 6, prosody: { stress: [0, 2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Let\'s do this', shortText: 'Let\'s go', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Sätt igång och kör', shortText: 'Kör', priority: 7, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du klarar det här', shortText: 'Klarar', priority: 7, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    sessionEnd: [
      { text: 'Fantastiskt jobbat idag', shortText: 'Fant', priority: 8, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Träningen är klar', shortText: 'Klar', priority: 7, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'encouraging' } },
      { text: 'Du gjorde det', shortText: 'Gjorde', priority: 7, prosody: { stress: [1], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Bra jobbat, vi ses nästa gång', shortText: 'Ses', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Session avslutad', shortText: 'Slut', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'neutral' } },
      { text: 'Glöm inte att stretcha', shortText: 'Stretch', priority: 6, prosody: { stress: [2], pitchContour: 'flat', emotionalTone: 'calm' } },
      { text: 'Återhämta dig nu', shortText: 'Återhämta', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Stolt över dig', shortText: 'Stolt', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Du har gjort ett fantastiskt jobb', shortText: 'Fant', priority: 8, prosody: { stress: [4], pitchContour: 'rise-fall', emotionalTone: 'celebratory' } },
      { text: 'Tack för idag', shortText: 'Tack', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'encouraging' } },
    ],
  },

  exerciseSpecific: {
    legs: {
      preparation: [
        { text: 'Fötterna höftbrett', shortText: 'Höftbrett', priority: 7 },
        { text: 'Tårna pekandes framåt', shortText: 'Tår fram', priority: 6 },
        { text: 'Aktivera quadriceps', shortText: 'Quads', priority: 6 },
        { text: 'Känn marken under fötterna', shortText: 'Marken', priority: 5 },
      ],
      execution: [
        { text: 'Tryck från hälarna', shortText: 'Hälar', priority: 7 },
        { text: 'Knäna i linje med tårna', shortText: 'Knän linje', priority: 7 },
        { text: 'Höfterna tillbaka', shortText: 'Höft bak', priority: 7 },
        { text: 'Neutralt knäläge', shortText: 'Neutral', priority: 6 },
      ],
      formTips: [
        { text: 'Undvik att knäna faller inåt', shortText: 'Knän in', priority: 7 },
        { text: 'Håll vikten på hälarna', shortText: 'Hälar', priority: 6 },
        { text: 'Bröst upp, blick framåt', shortText: 'Bröst upp', priority: 6 },
        { text: 'Spänn rumpa i toppen', shortText: 'Rumpa', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Knäna faller inåt', shortText: 'Valgus', priority: 8 },
        { text: 'Hälar lyfter', shortText: 'Hälar', priority: 7 },
        { text: 'Ryggen rundar', shortText: 'Rygg', priority: 8 },
        { text: 'För kort djup', shortText: 'Djup', priority: 6 },
      ],
    },
    core: {
      preparation: [
        { text: 'Aktivera bålmuskulaturen', shortText: 'Bål', priority: 7 },
        { text: 'Neutral ryggposition', shortText: 'Neutral', priority: 7 },
        { text: 'Andas in, spänn magen', shortText: 'Spänn', priority: 6 },
        { text: 'Hitta din neutrala position', shortText: 'Neutral', priority: 6 },
      ],
      execution: [
        { text: 'Spänn från navel till rygg', shortText: 'Navel', priority: 7 },
        { text: 'Andas ut vid ansträngning', shortText: 'Ut', priority: 6 },
        { text: 'Håll korsryggen i mattan', shortText: 'Korsrygg', priority: 7 },
        { text: 'Kontrollerad rörelse', shortText: 'Kontroll', priority: 6 },
      ],
      formTips: [
        { text: 'Undvik att svälja rygg', shortText: 'Svälja', priority: 7 },
        { text: 'Nacken i linje med ryggraden', shortText: 'Nacke', priority: 6 },
        { text: 'Slappna av i axlarna', shortText: 'Axlar', priority: 5 },
        { text: 'Andas kontinuerligt', shortText: 'Andas', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Svanker ryggen', shortText: 'Svank', priority: 8 },
        { text: 'Håller andan', shortText: 'Andas', priority: 7 },
        { text: 'Spänner nacken', shortText: 'Nacke', priority: 7 },
        { text: 'För snabba rörelser', shortText: 'Snabb', priority: 6 },
      ],
    },
    push: {
      preparation: [
        { text: 'Händerna axelbrett', shortText: 'Axelbrett', priority: 7 },
        { text: 'Aktivera bröstmusklerna', shortText: 'Bröst', priority: 6 },
        { text: 'Spänn core', shortText: 'Core', priority: 7 },
        { text: 'Kroppen rak som en planka', shortText: 'Planka', priority: 6 },
      ],
      execution: [
        { text: 'Armbågarna 45 grader', shortText: '45 grad', priority: 7 },
        { text: 'Full utsträckning i toppen', shortText: 'Full', priority: 6 },
        { text: 'Kontrollerad nedsänkning', shortText: 'Ner', priority: 6 },
        { text: 'Press genom handflatorna', shortText: 'Press', priority: 7 },
      ],
      formTips: [
        { text: 'Undvik att sänka höfterna', shortText: 'Höfter', priority: 7 },
        { text: 'Håll nacken neutral', shortText: 'Nacke', priority: 6 },
        { text: 'Blicken i golvet', shortText: 'Blick', priority: 5 },
        { text: 'Spänn gluteala', shortText: 'Glutes', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Armbågarna fladdrar ut', shortText: 'Armbågar', priority: 8 },
        { text: 'Höfterna hänger', shortText: 'Höfter', priority: 7 },
        { text: 'Halvhjärtade reps', shortText: 'Halv', priority: 6 },
        { text: 'Nacken böjs upp', shortText: 'Nacke', priority: 7 },
      ],
    },
    pull: {
      preparation: [
        { text: 'Grepp axelbrett eller bredare', shortText: 'Grepp', priority: 7 },
        { text: 'Aktivera latissimus', shortText: 'Lats', priority: 6 },
        { text: 'Axlarna ner och bak', shortText: 'Axlar', priority: 7 },
        { text: 'Spänn core', shortText: 'Core', priority: 6 },
      ],
      execution: [
        { text: 'Dra armbågarna ner och bak', shortText: 'Armbågar', priority: 7 },
        { text: 'Kläm ihop skulderbladen', shortText: 'Skulder', priority: 7 },
        { text: 'Kontrollerad nedsläpp', shortText: 'Kontroll', priority: 6 },
        { text: 'Full rörelse hela vägen', shortText: 'Full', priority: 6 },
      ],
      formTips: [
        { text: 'Undvik att svinga', shortText: 'Sving', priority: 7 },
        { text: 'Fokusera på ryggmusklerna', shortText: 'Rygg', priority: 6 },
        { text: 'Minimera biceps-aktivering', shortText: 'Biceps', priority: 5 },
        { text: 'Haka över stången vid topp', shortText: 'Haka', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Svingar för mycket', shortText: 'Sving', priority: 8 },
        { text: 'Använder för mycket armar', shortText: 'Armar', priority: 7 },
        { text: 'Halvhjärtad rörelse', shortText: 'Halv', priority: 6 },
        { text: 'Axlarna höjs', shortText: 'Axlar', priority: 7 },
      ],
    },
    balance: {
      preparation: [
        { text: 'Hitta din mittpunkt', shortText: 'Mitt', priority: 7 },
        { text: 'Fokusera blicken på en punkt', shortText: 'Fokus', priority: 7 },
        { text: 'Aktivera foten', shortText: 'Fot', priority: 6 },
        { text: 'Mjuka knän', shortText: 'Knän', priority: 6 },
      ],
      execution: [
        { text: 'Små justeringar hela tiden', shortText: 'Justera', priority: 6 },
        { text: 'Andas lugnt', shortText: 'Andas', priority: 6 },
        { text: 'Spänn core för stabilitet', shortText: 'Core', priority: 7 },
        { text: 'Tryck genom hela foten', shortText: 'Fot', priority: 6 },
      ],
      formTips: [
        { text: 'Slappna av i överkroppen', shortText: 'Slappna', priority: 5 },
        { text: 'Använd armarna för balans', shortText: 'Armar', priority: 6 },
        { text: 'Fokusera mentalt', shortText: 'Mental', priority: 6 },
        { text: 'Andas jämnt', shortText: 'Andas', priority: 5 },
      ],
      commonMistakes: [
        { text: 'Stirrar ner på fötterna', shortText: 'Fötter', priority: 7 },
        { text: 'Håller andan', shortText: 'Andas', priority: 7 },
        { text: 'Stel kropp', shortText: 'Stel', priority: 6 },
        { text: 'Snabba justeringar', shortText: 'Snabb', priority: 6 },
      ],
    },
    stretch: {
      preparation: [
        { text: 'Hitta en bekväm position', shortText: 'Bekväm', priority: 6 },
        { text: 'Andas djupt', shortText: 'Andas', priority: 6 },
        { text: 'Slappna av musklerna', shortText: 'Slappna', priority: 6 },
        { text: 'Ta det lugnt', shortText: 'Lugnt', priority: 5 },
      ],
      execution: [
        { text: 'Håll positionen stadigt', shortText: 'Håll', priority: 6 },
        { text: 'Andas ut i stretchen', shortText: 'Ut', priority: 6 },
        { text: 'Känn töjningen utan smärta', shortText: 'Känn', priority: 7 },
        { text: 'Öka gradvis', shortText: 'Gradvis', priority: 6 },
      ],
      formTips: [
        { text: 'Aldrig till smärta', shortText: 'Smärta', priority: 8 },
        { text: 'Håll ryggen rak', shortText: 'Rygg', priority: 6 },
        { text: 'Slappna av ansiktet', shortText: 'Ansikte', priority: 5 },
        { text: 'Fokusera på andningen', shortText: 'Andas', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Studsar i stretchen', shortText: 'Studsa', priority: 8 },
        { text: 'Håller andan', shortText: 'Andas', priority: 7 },
        { text: 'Pressar för hårt', shortText: 'Press', priority: 7 },
        { text: 'För korta håll', shortText: 'Kort', priority: 6 },
      ],
    },
    lunge: {
      preparation: [
        { text: 'Stå upprätt', shortText: 'Upprätt', priority: 6 },
        { text: 'Fötterna höftbrett', shortText: 'Höftbrett', priority: 6 },
        { text: 'Core aktiverad', shortText: 'Core', priority: 7 },
        { text: 'Blick framåt', shortText: 'Blick', priority: 5 },
      ],
      execution: [
        { text: 'Kliv långt framåt', shortText: 'Kliv', priority: 7 },
        { text: 'Bakre knä mot golvet', shortText: 'Knä ner', priority: 7 },
        { text: 'Främre knä 90 grader', shortText: '90 grad', priority: 7 },
        { text: 'Tryck tillbaka till start', shortText: 'Tillbaka', priority: 6 },
      ],
      formTips: [
        { text: 'Knä aldrig framför tån', shortText: 'Knä-tå', priority: 8 },
        { text: 'Höft rak framåt', shortText: 'Höft', priority: 6 },
        { text: 'Tryck genom främre hälen', shortText: 'Häl', priority: 6 },
        { text: 'Upprätt överkropp', shortText: 'Upprätt', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Knä går över tån', shortText: 'Över tå', priority: 8 },
        { text: 'Lutar framåt', shortText: 'Lutar', priority: 7 },
        { text: 'Kort steg', shortText: 'Kort', priority: 6 },
        { text: 'Tappar balansen', shortText: 'Balans', priority: 7 },
      ],
    },
    press: {
      preparation: [
        { text: 'Grepp strax utanför axelbredd', shortText: 'Grepp', priority: 7 },
        { text: 'Fötterna i golvet', shortText: 'Fötter', priority: 6 },
        { text: 'Skulderbladen ihop', shortText: 'Skulder', priority: 7 },
        { text: 'Lätt båge i ryggen', shortText: 'Båge', priority: 6 },
      ],
      execution: [
        { text: 'Sänk kontrollerat till bröstet', shortText: 'Ner', priority: 7 },
        { text: 'Press rakt upp', shortText: 'Upp', priority: 7 },
        { text: 'Lås inte armbågarna helt', shortText: 'Lås ej', priority: 6 },
        { text: 'Andas ut vid press', shortText: 'Ut', priority: 6 },
      ],
      formTips: [
        { text: 'Armbågarna 45 grader', shortText: '45 grad', priority: 7 },
        { text: 'Rör stången vid bröstbenet', shortText: 'Bröstben', priority: 6 },
        { text: 'Spänn rumpa och core', shortText: 'Spänn', priority: 6 },
        { text: 'Fokusera på bröstet', shortText: 'Bröst', priority: 6 },
      ],
      commonMistakes: [
        { text: 'Studsar på bröstet', shortText: 'Studsa', priority: 8 },
        { text: 'Rumpa lyfter', shortText: 'Rumpa', priority: 7 },
        { text: 'Armbågarna fladdrar', shortText: 'Armbågar', priority: 7 },
        { text: 'Asymmetrisk press', shortText: 'Asym', priority: 7 },
      ],
    },
    shoulder: {
      preparation: [
        { text: 'Hantelarna i axelhöjd', shortText: 'Axelhöjd', priority: 7 },
        { text: 'Core aktiverad', shortText: 'Core', priority: 7 },
        { text: 'Neutral rygg', shortText: 'Neutral', priority: 6 },
        { text: 'Fötterna stadigt', shortText: 'Fötter', priority: 6 },
      ],
      execution: [
        { text: 'Press rakt upp', shortText: 'Upp', priority: 7 },
        { text: 'Full utsträckning', shortText: 'Full', priority: 6 },
        { text: 'Sänk kontrollerat', shortText: 'Ner', priority: 6 },
        { text: 'Andas ut vid press', shortText: 'Ut', priority: 6 },
      ],
      formTips: [
        { text: 'Undvik att sväja', shortText: 'Sväja', priority: 7 },
        { text: 'Axlarna ner från öronen', shortText: 'Axlar', priority: 6 },
        { text: 'Håll nacken neutral', shortText: 'Nacke', priority: 6 },
        { text: 'Spänn gluteala', shortText: 'Glutes', priority: 5 },
      ],
      commonMistakes: [
        { text: 'Sväjar i ryggen', shortText: 'Sväj', priority: 8 },
        { text: 'Rycker vikten', shortText: 'Ryck', priority: 7 },
        { text: 'Pressar framåt', shortText: 'Framåt', priority: 7 },
        { text: 'Höjer axlarna', shortText: 'Höjer', priority: 6 },
      ],
    },
  },

  breathing: {
    inhale: [
      { text: 'Andas in', shortText: 'In', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'In', shortText: 'In', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Djupt andetag in', shortText: 'Djupt in', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Fyll lungorna', shortText: 'Fyll', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Andas in genom näsan', shortText: 'Näsan', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Expandera bröstkorgen', shortText: 'Expand', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Inandning', shortText: 'In', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Lugn inandning', shortText: 'Lugn in', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'calm', speakingRate: 0.85 } },
    ],
    exhale: [
      { text: 'Andas ut', shortText: 'Ut', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Ut', shortText: 'Ut', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Töm lungorna', shortText: 'Töm', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Släpp ut luften', shortText: 'Släpp', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Andas ut genom munnen', shortText: 'Munnen', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Långsam utandning', shortText: 'Långsam', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Utandning', shortText: 'Ut', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Blås ut', shortText: 'Blås', priority: 5, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm', speakingRate: 0.85 } },
    ],
    hold: [
      { text: 'Håll andan', shortText: 'Håll', priority: 6, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Håll', shortText: 'Håll', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Kort paus', shortText: 'Paus', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Vänta', shortText: 'Vänta', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Spänning i bröstkorgen', shortText: 'Spänning', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.85 } },
      { text: 'Behåll luften', shortText: 'Behåll', priority: 5, prosody: { stress: [0], pitchContour: 'flat', emotionalTone: 'calm', speakingRate: 0.85 } },
    ],
  },

  tempo: {
    tooFast: [
      { text: 'Sakta ner lite', shortText: 'Sakta', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Lite långsammare', shortText: 'Långsam', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Du rusar', shortText: 'Rusar', priority: 7, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Mer kontroll i tempot', shortText: 'Tempo', priority: 6, prosody: { stress: [1], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Ta det lugnare', shortText: 'Lugnt', priority: 6, prosody: { stress: [2], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Bromsa lite', shortText: 'Bromsa', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Långsammare reps', shortText: 'Långsam', priority: 6, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
      { text: 'Kvalitet före hastighet', shortText: 'Kvalitet', priority: 7, prosody: { stress: [0], pitchContour: 'falling', emotionalTone: 'calm' } },
    ],
    tooSlow: [
      { text: 'Lite snabbare', shortText: 'Snabbare', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Öka tempot', shortText: 'Tempo', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Mer fart', shortText: 'Fart', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Accelerera lite', shortText: 'Acceler', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Pick up the pace', shortText: 'Pace', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Mer energi', shortText: 'Energi', priority: 6, prosody: { stress: [1], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Flyt i rörelsen', shortText: 'Flyt', priority: 5, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Du kan snabbare', shortText: 'Snabbare', priority: 6, prosody: { stress: [2], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
    perfect: [
      { text: 'Perfekt tempo', shortText: 'Perfekt', priority: 7, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Exakt rätt hastighet', shortText: 'Rätt', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Bra rytm', shortText: 'Rytm', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Håll det tempot', shortText: 'Håll', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fint flyt', shortText: 'Flyt', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Optimal hastighet', shortText: 'Optimal', priority: 6, prosody: { stress: [0], pitchContour: 'rise-fall', emotionalTone: 'encouraging' } },
      { text: 'Precis så', shortText: 'Precis', priority: 6, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
      { text: 'Fortsätt i det tempot', shortText: 'Fortsätt', priority: 7, prosody: { stress: [0], pitchContour: 'rising', emotionalTone: 'encouraging' } },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Håll koll på nyligen använda fraser för att undvika upprepning
const recentPhrases = new Map<string, number[]>();
const MAX_RECENT_PHRASES = 3;

/**
 * Välj en slumpmässig fras utan att upprepa nyligen använda
 */
export function getRandomPhrase(
  phrases: VoicePhrase[],
  category: string,
  preferShort: boolean = false
): string {
  if (phrases.length === 0) {
    return '';
  }

  // Hämta nyligen använda index för denna kategori
  let recentIndices = recentPhrases.get(category) || [];

  // Filtrera bort nyligen använda
  const availableIndices = phrases
    .map((_, i) => i)
    .filter((i) => !recentIndices.includes(i));

  // Om alla är nyligen använda, rensa och använd alla
  const indexPool = availableIndices.length > 0 ? availableIndices : phrases.map((_, i) => i);

  // Välj slumpmässigt
  const randomIndex = indexPool[Math.floor(Math.random() * indexPool.length)];
  const phrase = phrases[randomIndex];

  // Uppdatera nyligen använda
  recentIndices = [randomIndex, ...recentIndices].slice(0, MAX_RECENT_PHRASES);
  recentPhrases.set(category, recentIndices);

  // Returnera kort eller lång version
  return preferShort && phrase.shortText ? phrase.shortText : phrase.text;
}

/**
 * Hämta fasfras baserat på fas och position
 */
export function getPhasePhrase(
  phase: PhaseType,
  position: PhasePosition,
  preferShort: boolean = false
): string {
  const phrases = VOICE_PHRASES.phases[phase]?.[position];
  if (!phrases) {
    return '';
  }
  return getRandomPhrase(phrases, `phase_${phase}_${position}`, preferShort);
}

/**
 * Hämta uppmuntringsfras baserat på kontext
 */
export function getEncouragementPhrase(
  context: EncouragementContext,
  preferShort: boolean = false
): string {
  const phrases = VOICE_PHRASES.encouragement[context];
  if (!phrases) {
    return '';
  }
  return getRandomPhrase(phrases, `encouragement_${context}`, preferShort);
}

/**
 * Hämta korrigeringsfras baserat på allvarlighetsgrad
 */
export function getCorrectionPhrase(
  severity: CorrectionSeverity,
  preferShort: boolean = false
): string {
  const phrases = VOICE_PHRASES.corrections[severity];
  if (!phrases) {
    return '';
  }
  return getRandomPhrase(phrases, `correction_${severity}`, preferShort);
}

/**
 * Hämta övergångsfras med variabelsubstitution
 */
export function getTransitionPhrase(
  type: keyof VoicePhraseBank['transitions'],
  variables: Record<string, string | number>,
  preferShort: boolean = false
): string {
  const phrases = VOICE_PHRASES.transitions[type];
  if (!phrases) {
    return '';
  }

  let phrase = getRandomPhrase(phrases, `transition_${type}`, preferShort);

  // Substituera variabler
  for (const [key, value] of Object.entries(variables)) {
    phrase = phrase.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }

  return phrase;
}

/**
 * Hämta svenskt nummer som text
 */
export function getNumberAsText(num: number): string {
  if (num >= 1 && num <= 20) {
    return VOICE_PHRASES.counting.numbers[num] || String(num);
  }
  return String(num);
}

/**
 * Formatera repetitionsmeddelande
 */
export function getRepAnnouncement(
  current: number,
  total: number,
  preferShort: boolean = false
): string {
  const phrases = VOICE_PHRASES.counting.repAnnouncements;
  let phrase = getRandomPhrase(phrases, 'rep_announcement', preferShort);

  phrase = phrase.replace('{n}', String(current));
  phrase = phrase.replace('{total}', String(total));

  return phrase;
}

/**
 * Formatera setmeddelande
 */
export function getSetAnnouncement(
  current: number,
  total: number,
  preferShort: boolean = false
): string {
  if (current === total) {
    return preferShort ? 'Sista set' : 'Sista setet';
  }

  const phrases = VOICE_PHRASES.counting.setAnnouncements.filter(
    (p) => !p.text.includes('Sista')
  );
  let phrase = getRandomPhrase(phrases, 'set_announcement', preferShort);

  phrase = phrase.replace('{n}', String(current));
  phrase = phrase.replace('{total}', String(total));

  return phrase;
}

/**
 * Hämta en fras med prosodi-information
 * Returnerar både text och prosodi för avancerad TTS-kontroll
 */
export function getPhraseWithProsody(
  phrases: VoicePhrase[],
  preferShort: boolean = false
): { text: string; prosody: ProsodyMarking | undefined } {
  if (phrases.length === 0) {
    return { text: '', prosody: undefined };
  }

  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  const text = preferShort && phrase.shortText ? phrase.shortText : phrase.text;

  return {
    text,
    prosody: phrase.prosody,
  };
}

/**
 * Hämta fasfras med prosodi-information
 */
export function getPhasePhraseWithProsody(
  phase: PhaseType,
  position: PhasePosition,
  preferShort: boolean = false
): { text: string; prosody: ProsodyMarking | undefined } {
  const phrases = VOICE_PHRASES.phases[phase]?.[position] || [];
  return getPhraseWithProsody(phrases, preferShort);
}

/**
 * Hämta uppmuntransfras med prosodi-information
 */
export function getEncouragementPhraseWithProsody(
  context: EncouragementContext,
  preferShort: boolean = false
): { text: string; prosody: ProsodyMarking | undefined } {
  const phrases = VOICE_PHRASES.encouragement[context] || VOICE_PHRASES.encouragement.general;
  return getPhraseWithProsody(phrases, preferShort);
}

/**
 * Hämta korrigeringsfras med prosodi-information
 */
export function getCorrectionPhraseWithProsody(
  severity: CorrectionSeverity,
  preferShort: boolean = false
): { text: string; prosody: ProsodyMarking | undefined } {
  const phrases = VOICE_PHRASES.corrections[severity] || VOICE_PHRASES.corrections.gentle;
  return getPhraseWithProsody(phrases, preferShort);
}

/**
 * Rensa cache av nyligen använda fraser
 */
export function resetPhraseCache(): void {
  recentPhrases.clear();
}

export default VOICE_PHRASES;
