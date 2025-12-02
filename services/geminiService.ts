
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserAssessment, GeneratedProgram, Exercise, ExerciseAdjustmentType, WeeklyAnalysis } from "../types";
import { EXERCISE_DATABASE } from "../data/exerciseDatabase";

// --- API KEY HELPER ---
// Supports both Google AI Studio (process.env.API_KEY) and local Vite development
const getApiKey = (): string => {
  // Google AI Studio provides API_KEY via process.env
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }
  // Vite local development uses import.meta.env
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  console.warn('No API key found. Set VITE_GEMINI_API_KEY in .env.local for local development.');
  return '';
};

// --- RETRY HELPER ---
// Retries async operations with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; onRetry?: (attempt: number, error: Error) => void } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelayMs = 1000, onRetry } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      onRetry?.(attempt, lastError);
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// --- JSON SANITIZER ---
// Robustly cleans AI response to remove markdown blocks (```json ... ```) which often break parsing.
const cleanJson = (text: string): string => {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const exerciseStepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    instruction: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['start', 'execution', 'tip'] },
    animationType: { type: Type.STRING, enum: ['pulse', 'slide', 'bounce', 'shake'] },
    videoUrl: { type: Type.STRING, description: "Optional URL to an MP4/WebM video demonstrating this specific step" }
  },
  required: ["title", "instruction", "type"]
};

const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    sets: { type: Type.NUMBER },
    reps: { type: Type.STRING },
    frequency: { type: Type.STRING },
    tips: { type: Type.STRING },
    category: { type: Type.STRING, enum: ['mobility', 'strength', 'balance', 'endurance'] },
    risks: { type: Type.STRING, description: "Common mistakes or risks to avoid" },
    advancedTips: { type: Type.STRING, description: "Advanced form cues or progression advice" },
    difficulty: { type: Type.STRING, enum: ['Lätt', 'Medel', 'Svår'] },
    calories: { type: Type.STRING, description: "Estimated calories burned per session (e.g. '15 kcal')" },
    steps: { type: Type.ARRAY, items: exerciseStepSchema },
    videoUrl: { type: Type.STRING, description: "YouTube embed URL (https://www.youtube.com/embed/...) if a specific, correct video is known. Otherwise empty." }
  },
  required: ["name", "description", "sets", "reps", "category", "tips", "frequency"]
};

const dailyPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.NUMBER },
    focus: { type: Type.STRING },
    exercises: { type: Type.ARRAY, items: exerciseSchema },
  },
  required: ["focus", "exercises"]
};

const phaseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    phaseName: { type: Type.STRING },
    durationWeeks: { type: Type.STRING },
    description: { type: Type.STRING },
    goals: { type: Type.ARRAY, items: { type: Type.STRING } },
    precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
    dailyRoutine: { type: Type.ARRAY, items: dailyPlanSchema },
  },
  required: ["phaseName", "description", "dailyRoutine"]
};

const patientEducationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: { type: Type.STRING, description: "Specific medical hypothesis/diagnosis" },
    explanation: { type: Type.STRING, description: "Simple explanation for the patient" },
    pathology: { type: Type.STRING, description: "Biological explanation (tissue healing, etc.)" },
    prognosis: { type: Type.STRING, description: "Expected timeline for recovery" },
    scienceBackground: { type: Type.STRING, description: "Why exercise helps (mechanotransduction, etc.)" },
    dailyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific guidelines or studies cited" }
  },
  required: ["diagnosis", "explanation", "pathology", "prognosis", "scienceBackground", "dailyTips", "sources"]
};

const programSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    conditionAnalysis: { type: Type.STRING },
    patientEducation: patientEducationSchema,
    phases: { type: Type.ARRAY, items: phaseSchema },
  },
  required: ["title", "phases", "conditionAnalysis", "patientEducation"]
};

const exerciseListSchema: Schema = {
  type: Type.ARRAY,
  items: exerciseSchema
};

const weeklyAnalysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        decision: { type: Type.STRING, enum: ['maintain', 'progress', 'regress'] },
        reasoning: { type: Type.STRING },
        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        score: { type: Type.NUMBER },
    },
    required: ["decision", "reasoning", "tips", "score"]
};

export const generateRehabProgram = async (assessment: UserAssessment): Promise<GeneratedProgram> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const clinicalDetails = Object.entries(assessment.specificAnswers || {})
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n    ');

  // Logic logic for volume/intensity adjustment based on lifestyle
  let intensityDirective = "Standard progression.";
  if (assessment.lifestyle?.stress === 'Hög' || assessment.lifestyle?.sleep === 'Dålig') {
      intensityDirective = "Minska volymen och intensiteten. Fokusera på återhämtning och nervsystemets lugnande. Undvik komplexa plyometriska övningar i fas 1.";
  }
  if (assessment.lifestyle?.fearAvoidance) {
      intensityDirective += " VIKTIGT: Patienten har rörelserädsla. Börja extremt lätt. Använd termer som 'tryggt', 'utforska rörelse' och undvik nocebo (skrämmande språk).";
  }

  // Pain analysis
  let painDirective = "";
  if (assessment.activityPainLevel > 6) {
      painDirective = "Hög smärta vid aktivitet. Undvik belastning i ytterlägen. Fokusera på isometrisk träning och smärtfri rörelse.";
  } else if (assessment.painLevel > 5 && assessment.activityPainLevel < 4) {
      painDirective = "Hög vilosmärta men låg aktivitetssmärta. Uppmuntra cirkulation och rörelse för att lindra (Motion is Lotion).";
  }

  // Red Flag / Safety Check Prompt Injection
  let safetyDirective = "";
  if (assessment.redFlags && assessment.redFlags.length > 0) {
      safetyDirective = `VARNING: Patienten har rapporterat RÖDA FLAGGOR: ${assessment.redFlags.join(', ')}. Generera ett mycket försiktigt program, men INKLUDERA en stark uppmaning i 'patientEducation.explanation' att söka läkarvård omedelbart.`;
  }

  const prompt = `
    Agera som ett MULTI-DISCIPLINÄRT TEAM bestående av en Senior Ortopedläkare och en Specialistfysioterapeut (OMT).
    Er uppgift är att ställa en hypotetisk diagnos och skapa ett rehabprogram i världsklass.

    PATIENTPROFIL:
    - ${assessment.name}, ${assessment.age} år.
    - Skada: ${assessment.injuryLocation} (${assessment.injuryType}).
    - Smärtkaraktär: ${assessment.painCharacter || 'Okänd'} (Viktigt för diagnos: Molande=Led/Muskel, Brännande=Nerv, Huggande=Struktur).
    - Funktionella begränsningar: ${(assessment.functionalLimitations || []).join(', ')}.
    
    KLINISK ANAMNES (Viktigt för differentialdiagnostik):
    ${clinicalDetails}
    
    PATIENTENS NOTERINGAR:
    "${assessment.additionalInfo || 'Inga'}"
    
    BIOPSYKOSOCIALT:
    - Stress: ${assessment.lifestyle?.stress}, Sömn: ${assessment.lifestyle?.sleep}.
    - Rörelserädsla: ${assessment.lifestyle?.fearAvoidance ? 'JA - Använd tryggande ord' : 'Nej'}.

    DIREKTIV:
    1. ${intensityDirective}
    2. ${painDirective}
    3. ${safetyDirective}
    4. ANALYSERA SVAREN:
       - Om knäsmärta ökar vid "Uppvärmning" -> Misstänk Tendinopati.
       - Om "Låsningar" finns -> Misstänk Menisk.
       - Om "Nattlig smärta" i axel -> Misstänk Frozen Shoulder/Cuff.
       - Om "Brännande" smärta -> Misstänk Nervpåverkan.
    
    5. SKAPA 'patientEducation':
       - Sätt en specifik diagnos (t.ex. "Patellofemoralt smärtsyndrom" istället för "Ont i knät").
       - Förklara varför diagnosen stämmer baserat på svaren ovan.
       - Citera riktiga källor (Svenska Fysioterapiförbundet, FYSS, NICE).

    6. SKAPA PROGRAMMET:
       - 2-3 Faser (Akut -> Uppbyggnad -> Återgång).
       - Övningarna måste matcha diagnosen exakt (t.ex. Isometrisk för senor, Cirkulation för ryggskott).
       - Fyll i 'risks', 'advancedTips' noggrant.

    7. VIDEO:
       - Försök ange en korrekt YouTube Embed-länk om du vet en specifik, korrekt teknikvideo. Annars lämna tomt.

    Returnera JSON enligt schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: programSchema,
        temperature: 0.3, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJson(text)) as GeneratedProgram;
  } catch (error) {
    console.error("Error generating program:", error);
    throw error;
  }
};

export const searchExercises = async (query: string): Promise<Exercise[]> => {
  const normalizedQuery = query.toLowerCase();
  // Filter Local Database First (The Core Cache)
  const localMatches = EXERCISE_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(normalizedQuery) || 
    ex.description.toLowerCase().includes(normalizedQuery) ||
    ex.category.toLowerCase().includes(normalizedQuery)
  );

  // If we have enough local matches, return them for speed.
  if (localMatches.length >= 6) {
    return localMatches.slice(0, 8);
  }

  // AI FALLBACK (The Infinite Database)
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prompt = `
    Agera som en expertfysioterapeut med tillgång till en databas på 10 000+ evidensbaserade övningar.
    
    Användaren söker efter: "${query}".
    
    Vi har hittat följande lokalt: ${localMatches.map(e => e.name).join(', ')}.
    
    Uppgift:
    Generera ${8 - localMatches.length} st NYA, specifika rehabövningar som kompletterar sökningen.
    
    Krav:
    1. Detaljerade beskrivningar på Svenska.
    2. Inkludera kliniska 'risks' och 'advancedTips'.
    3. Inkludera 'calories' och 'difficulty'.
    4. Skapa 'steps' array för interaktiv guide.
    5. För 'videoUrl', försök ange en specifik YouTube Embed-länk (https://www.youtube.com/embed/...) om du vet en bra video. Annars lämna tomt.
    
    Returnera JSON lista.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: exerciseListSchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) return localMatches;

    const aiExercises = JSON.parse(cleanJson(text)) as Exercise[];
    return [...localMatches, ...aiExercises];
  } catch (error) {
    console.error("Error searching exercises", error);
    return localMatches;
  }
}

export const generateAlternativeExercise = async (
    originalExercise: Exercise,
    reason: string,
    adjustment: ExerciseAdjustmentType
): Promise<Exercise> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    let directive = "";
    if (adjustment === 'easier') {
        directive = "Användaren tycker övningen är för svår/smärtsam. Ge en REGRESSION (enklare variant, mindre belastning, mindre rörelseomfång).";
    } else if (adjustment === 'harder') {
        directive = "Användaren tycker övningen är för lätt. Ge en PROGRESSION (svårare variant, mer belastning, mer komplexitet).";
    } else {
        directive = "Användaren saknar utrustning eller gillar inte övningen. Ge ett LIKVÄRDIGT alternativ som tränar samma sak.";
    }

    const prompt = `
      Som fysioterapeut, föreslå ett ALTERNATIV till övningen "${originalExercise.name}".
      Originalbeskrivning: "${originalExercise.description}"
      
      Direktiv: ${directive}
      Specifik orsak angiven av användare: "${reason}"
      
      Krav:
      1. Måste träna samma muskelgrupp/funktion.
      2. Måste följa direktivet (Regression vs Progression) strikt.
      3. Behåll samma dataformat (JSON) inklusive steps.
      4. För 'videoUrl', försök ange en specifik YouTube Embed-länk om möjligt.
      
      Returnera ENDAST ett JSON-objekt av typen Exercise.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: exerciseSchema,
                temperature: 0.4
            }
        });

        if (!response.text) throw new Error("No alternative generated");
        return JSON.parse(cleanJson(response.text)) as Exercise;
    } catch (e) {
        console.error("Swap failed", e);
        throw e;
    }
};

export const generateWeeklyAnalysis = async (
    history: { total: number, completed: number }[],
    currentPhaseName: string
): Promise<WeeklyAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const totalAssigned = history.reduce((sum, h) => sum + h.total, 0);
    const totalDone = history.reduce((sum, h) => sum + h.completed, 0);
    const adherence = totalAssigned > 0 ? (totalDone / totalAssigned) * 100 : 0;

    const prompt = `
        Agera som en klinisk rehabiliteringscoach. Analysera patientens vecka.
        
        Data:
        - Nuvarande Fas: ${currentPhaseName}
        - Följsamhet (Adherence): ${adherence.toFixed(1)}% (${totalDone} av ${totalAssigned} övningar klara).
        
        Uppgift:
        Utvärdera om patienten ska:
        1. MAINTAIN: Stanna i nuvarande fas (om följsamhet är <80% eller ojämn).
        2. PROGRESS: Gå vidare till nästa fas/öka belastning (om följsamhet >90% och konsekvent).
        3. REGRESS: Backa/Vila (om följsamhet <30%).

        Ge feedback på Svenska. 'tips' ska vara konkreta råd för nästa vecka.
        
        Returnera JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklyAnalysisSchema,
                temperature: 0.3
            }
        });

        if (!response.text) throw new Error("Analysis failed");
        return JSON.parse(cleanJson(response.text)) as WeeklyAnalysis;
    } catch (e) {
        console.error("Analysis failed", e);
        return {
            decision: 'maintain',
            reasoning: "Kunde inte ansluta till AI-analys. Fortsätt som vanligt.",
            tips: ["Fokusera på kontinuitet."],
            score: 50
        };
    }
}

export const chatWithPT = async (history: {role: 'user' | 'model', text: string}[], userContext: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const systemPrompt = `
        Du är "RehabFlow Coach", en empatisk, extremt kunnig fysioterapeut.
        
        Användarens Kontext:
        ${userContext}

        Regler:
        1. Svara kortfattat, uppmuntrande och tydligt (max 3-4 meningar om möjligt).
        2. Om användaren beskriver "röda flaggor" (domningar i underliv, bröstsmärta, nattlig outhärdlig smärta), hänvisa OMEDELBART till sjukvård/akut.
        3. Var evidensbaserad men förklara enkelt.
        4. Svara på Svenska.
    `;

    const conversation = history.map(h => `${h.role === 'user' ? 'Patient' : 'Fysio'}: ${h.text}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nKonversation:\n${conversation}\n\nFysio (du):`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });
        return response.text || "Ursäkta, jag tappade tanken. Kan du formulera om?";
    } catch (e) {
        console.error("Chat failed", e);
        return "Något gick fel med anslutningen. Försök igen om en stund.";
    }
};
