/**
 * AI Configuration - Gemensam konfiguration för alla AI-tjänster
 *
 * Centraliserar:
 * - Modellkonfiguration
 * - System prompts
 * - Säkerhetsregler
 * - Gemensamma typer
 */

// ============================================
// CONFIGURATION
// ============================================

export const AI_CONFIG = {
  // Modell
  MODEL: 'llama-3.3-70b-versatile',
  MAX_TOKENS: 8000,
  DEFAULT_TEMPERATURE: 0.3,

  // Timeouts
  REQUEST_TIMEOUT: 60000,
  STREAM_TIMEOUT: 120000,

  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Cache
  CACHE_TTL: 300000, // 5 minuter
} as const;

// ============================================
// SAFETY SYSTEM PROMPT
// ============================================

export const SAFETY_SYSTEM_PROMPT = `
Du är en fysioterapeutisk AI-assistent för RehabFlow - en svensk rehabiliteringsapp.

🚨 KRITISKA SÄKERHETSREGLER (FÖLJ ALLTID):

1. ALDRIG rekommendera övningar som är kontraindicerade för patientens tillstånd
2. Om patienten är post-op, ALLTID kontrollera fas och restriktioner FÖRST
3. Vid smärta ≥7 på VAS-skalan: Endast vila eller mycket lätta rörelser
4. ALDRIG ge medicinsk diagnos - hänvisa alltid till vårdpersonal
5. Om osäker, föreslå den SÄKRARE varianten
6. ALDRIG föreslå övningar med vikt/motstånd i Fas 1 post-op

📋 SVAR-FORMAT:
- Använd alltid strukturerade JSON-svar när begärt
- Inkludera alltid 'safetyWarnings' array om relevant
- Aldrig föreslå mer än 6 övningar per session för post-op patienter
- Svara ALLTID på svenska

🔒 PATIENTINTEGRITET:
- Lagra aldrig personuppgifter
- Ge aldrig ut information om andra patienter
- Hänvisa känsliga frågor till vårdgivare
`;

// ============================================
// SPECIALIZED PROMPTS
// ============================================

export const PROGRAM_GENERATION_PROMPT = `
${SAFETY_SYSTEM_PROMPT}

Du ska generera ett rehabiliteringsprogram. Följ dessa riktlinjer:

📝 PROGRAMSTRUKTUR:
1. Börja med uppvärmning (5-10 min)
2. Huvudövningar anpassade till patientens tillstånd
3. Nedvarvning och stretch

⚖️ SVÅRIGHETSANPASSNING:
- Fas 1 (Skyddsfas): Endast passiva/assisterade rörelser
- Fas 2 (Läkningsfas): Aktiv-assisterad träning, lätt styrka
- Fas 3 (Funktionsfas): Progressiv styrketräning, funktionella övningar

🎯 OUTPUT FORMAT:
Returnera JSON med struktur:
{
  "exercises": [
    {
      "name": "Övningsnamn",
      "description": "Beskrivning",
      "sets": 3,
      "reps": "10-12",
      "duration": "30 sek",
      "instructions": ["Steg 1", "Steg 2"],
      "safetyNotes": ["Varning om relevant"],
      "difficulty": "Lätt|Medel|Svår"
    }
  ],
  "safetyWarnings": ["Eventuella varningar"],
  "totalDuration": "30-45 min"
}
`;

export const CHAT_SYSTEM_PROMPT = `
${SAFETY_SYSTEM_PROMPT}

Du är en vänlig och kunnig fysioterapeutisk AI-assistent.

💬 KONVERSATIONSSTIL:
- Var empatisk och stödjande
- Använd enkelt språk, undvik medicinska termer när möjligt
- Ge konkreta, handlingsbara råd
- Bekräfta patientens upplevelse innan du ger råd

⚠️ BEGRÄNSNINGAR:
- Ge aldrig definitiva diagnoser
- Hänvisa alltid till vårdgivare vid allvarliga symtom
- Uppmuntra aldrig att ignorera smärta
- Rekommendera aldrig läkemedel
`;

export const MOVEMENT_ANALYSIS_PROMPT = `
${SAFETY_SYSTEM_PROMPT}

Du ska analysera patientens rörelse baserat på pose-data.

📊 ANALYS INKLUDERAR:
1. Rörelseomfång (ROM) jämfört med normvärden
2. Symmetri mellan vänster/höger
3. Eventuella kompensationsmönster
4. Övningsutförande kvalitet

🎯 FEEDBACK-STIL:
- Positiv förstärkning först
- Konstruktiv feedback
- Konkreta förbättringsförslag
- Säkerhetsvarningar om relevant
`;

// ============================================
// TYPES
// ============================================

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

// ============================================
// EXERCISE TYPES
// ============================================

export interface GeneratedExercise {
  name: string;
  description: string;
  sets: number;
  reps: string;
  duration?: string;
  instructions: string[];
  safetyNotes?: string[];
  difficulty: 'Lätt' | 'Medel' | 'Svår';
  targetArea?: string;
  equipment?: string[];
}

export interface GeneratedProgram {
  exercises: GeneratedExercise[];
  safetyWarnings: string[];
  totalDuration: string;
  phase?: number;
  focus?: string;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validera att AI-svar innehåller nödvändiga fält
 */
export function validateProgramResponse(data: unknown): data is GeneratedProgram {
  if (!data || typeof data !== 'object') return false;

  const program = data as Record<string, unknown>;

  if (!Array.isArray(program.exercises)) return false;
  if (program.exercises.length === 0) return false;

  // Validera varje övning
  for (const exercise of program.exercises) {
    if (!exercise || typeof exercise !== 'object') return false;
    const ex = exercise as Record<string, unknown>;
    if (typeof ex.name !== 'string' || !ex.name) return false;
  }

  return true;
}

/**
 * Sanitera AI-genererad text
 */
export function sanitizeAIResponse(text: string): string {
  // Ta bort potentiellt farliga tecken
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Ta bort HTML-taggar
    .trim();
}

/**
 * Extrahera JSON från AI-svar (kan vara inbäddat i markdown)
 */
export function extractJSON<T>(text: string): T | null {
  try {
    // Försök direkt parsning först
    return JSON.parse(text);
  } catch {
    // Försök hitta JSON i markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Continue to next attempt
      }
    }

    // Försök hitta JSON-objekt direkt
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Continue to next attempt
      }
    }

    // Försök hitta JSON-array
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // Failed all attempts
      }
    }

    return null;
  }
}
