/**
 * Provider AI Service for RehabFlow
 * Generates AI-powered reports and recommendations for healthcare providers
 */

import Groq from "groq-sdk";
import {
  AIReport,
  PatientSummary,
  DailyPainLog,
  ExerciseLog,
  ReportType,
  ProgressAnalysis,
  ExerciseAnalysis,
  AIRecommendations,
  TrendDirection
} from "../types";

// --- API KEY HELPER ---
const getApiKey = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) {
    return (import.meta as any).env.VITE_GROQ_API_KEY;
  }
  console.warn('No Groq API key found');
  return '';
};

const groq = new Groq({
  apiKey: getApiKey(),
  dangerouslyAllowBrowser: true
});

const MODEL = "llama-3.3-70b-versatile";

// --- HELPER FUNCTIONS ---

const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const calculatePainTrend = (painLogs: DailyPainLog[]): TrendDirection => {
  if (painLogs.length < 3) return 'stable';

  const recentAvg = painLogs.slice(-3).reduce((sum, log) => {
    const avg = ((log.preWorkout?.painLevel || 0) + (log.postWorkout?.painLevel || 0)) / 2;
    return sum + avg;
  }, 0) / 3;

  const olderAvg = painLogs.slice(0, 3).reduce((sum, log) => {
    const avg = ((log.preWorkout?.painLevel || 0) + (log.postWorkout?.painLevel || 0)) / 2;
    return sum + avg;
  }, 0) / 3;

  const diff = olderAvg - recentAvg;
  if (diff > 1) return 'improving';
  if (diff < -1) return 'worsening';
  return 'stable';
};

// --- REPORT GENERATION ---

interface PatientDataForReport {
  patient: PatientSummary;
  painLogs: DailyPainLog[];
  exerciseLogs: ExerciseLog[];
  periodDays: number;
}

/**
 * Generate a weekly progress report for a patient
 */
export const generateWeeklyReport = async (
  data: PatientDataForReport,
  providerId: string
): Promise<AIReport> => {
  const { patient, painLogs, exerciseLogs, periodDays } = data;

  // Calculate statistics
  const completedExercises = exerciseLogs.filter(e => e.completed).length;
  const totalExercises = exerciseLogs.length;
  const adherencePercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const painTrend = calculatePainTrend(painLogs);

  const avgPain = painLogs.length > 0
    ? painLogs.reduce((sum, log) => {
        return sum + ((log.preWorkout?.painLevel || 0) + (log.postWorkout?.painLevel || 0)) / 2;
      }, 0) / painLogs.length
    : 0;

  const prompt = `Du är en erfaren fysioterapeut som skriver veckorapporter om patienter.

PATIENTDATA:
- Namn: ${patient.name}
- Diagnos: ${patient.diagnosis}
- Nuvarande fas: ${patient.currentPhase} av ${patient.totalPhases}
- Perioden: ${periodDays} dagar
- Följsamhet: ${adherencePercent}%
- Genomförda övningar: ${completedExercises} av ${totalExercises}
- Genomsnittlig smärtnivå: ${avgPain.toFixed(1)}/10
- Smärttrend: ${painTrend === 'improving' ? 'Förbättras' : painTrend === 'worsening' ? 'Försämras' : 'Stabil'}
- Senaste smärtnivå: ${patient.latestPainLevel}/10

SMÄRTLOGG (senaste dagarna):
${painLogs.slice(-7).map(log =>
  `${log.date}: Före: ${log.preWorkout?.painLevel || '-'}, Efter: ${log.postWorkout?.painLevel || '-'}, Svårighet: ${log.postWorkout?.workoutDifficulty || '-'}`
).join('\n')}

Skriv en professionell veckorapport på svenska i JSON-format med följande struktur:
{
  "summary": "2-3 meningars sammanfattning av patientens vecka",
  "progressAnalysis": {
    "adherence": <nummer 0-100>,
    "painTrend": "${painTrend}",
    "keyMilestones": ["Lista med uppnådda milstolpar"],
    "concerns": ["Lista med eventuella bekymmer"],
    "strengthsObserved": ["Lista med positiva observationer"]
  },
  "exerciseAnalysis": {
    "completed": ${completedExercises},
    "skipped": ${totalExercises - completedExercises},
    "averageDifficulty": "lagom",
    "modifications": ["Eventuella förslag på modifieringar"],
    "problemExercises": ["Övningar som verkar problematiska"]
  },
  "recommendations": {
    "immediate": ["Åtgärder att ta direkt"],
    "nextPhase": ["Rekommendationer för nästa fas"],
    "riskFactors": ["Riskfaktorer att övervaka"],
    "programAdjustments": ["Förslag på programjusteringar"]
  }
}

Svara ENDAST med JSON, ingen annan text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Du är en expert fysioterapeut som analyserar patientdata och skriver professionella rapporter. Svara alltid på svenska."
        },
        { role: "user", content: prompt }
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = cleanJson(responseText);
    const parsed = JSON.parse(cleaned);

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - periodDays);

    const report: AIReport = {
      id: crypto.randomUUID(),
      providerId,
      patientId: patient.id,
      reportType: 'weekly',
      summary: parsed.summary || 'Rapport genererad',
      progressAnalysis: parsed.progressAnalysis || {
        adherence: adherencePercent,
        painTrend,
        keyMilestones: [],
        concerns: [],
        strengthsObserved: []
      },
      exerciseAnalysis: parsed.exerciseAnalysis || {
        completed: completedExercises,
        skipped: totalExercises - completedExercises,
        averageDifficulty: 'lagom',
        modifications: [],
        problemExercises: []
      },
      recommendations: parsed.recommendations || {
        immediate: [],
        nextPhase: [],
        riskFactors: [],
        programAdjustments: []
      },
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      generatedBy: MODEL
    };

    return report;
  } catch (error) {
    console.error('Failed to generate weekly report:', error);
    throw new Error('Kunde inte generera veckorapport');
  }
};

/**
 * Generate treatment recommendations based on patient data
 */
export interface TreatmentRecommendation {
  category: 'exercise' | 'pain_management' | 'progression' | 'lifestyle' | 'referral';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  timeframe: string;
}

export const generateTreatmentRecommendations = async (
  patient: PatientSummary,
  painLogs: DailyPainLog[],
  exerciseLogs: ExerciseLog[]
): Promise<TreatmentRecommendation[]> => {
  const avgPain = painLogs.length > 0
    ? painLogs.reduce((sum, log) => {
        return sum + ((log.preWorkout?.painLevel || 0) + (log.postWorkout?.painLevel || 0)) / 2;
      }, 0) / painLogs.length
    : 0;

  const prompt = `Du är en erfaren fysioterapeut som ger behandlingsrekommendationer.

PATIENTDATA:
- Diagnos: ${patient.diagnosis}
- Nuvarande fas: ${patient.currentPhase} av ${patient.totalPhases}
- Följsamhet: ${patient.adherencePercent}%
- Genomsnittlig smärta: ${avgPain.toFixed(1)}/10
- Smärttrend: ${patient.painTrend}
- Behöver uppmärksamhet: ${patient.needsAttention ? 'Ja - ' + patient.attentionReason : 'Nej'}

Ge 3-5 konkreta behandlingsrekommendationer i JSON-format:
[
  {
    "category": "exercise|pain_management|progression|lifestyle|referral",
    "priority": "high|medium|low",
    "title": "Kort titel",
    "description": "Detaljerad beskrivning av rekommendationen",
    "rationale": "Varför denna rekommendation är viktig",
    "timeframe": "Tidsram för genomförande"
  }
]

Svara ENDAST med JSON-array, ingen annan text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Du är en expert fysioterapeut som ger evidensbaserade behandlingsrekommendationer. Svara alltid på svenska."
        },
        { role: "user", content: prompt }
      ],
      model: MODEL,
      temperature: 0.4,
      max_tokens: 1500
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = cleanJson(responseText);
    const recommendations: TreatmentRecommendation[] = JSON.parse(cleaned);

    return recommendations;
  } catch (error) {
    console.error('Failed to generate treatment recommendations:', error);
    return [];
  }
};

/**
 * Generate a discharge summary for a patient
 */
export const generateDischargeSummary = async (
  data: PatientDataForReport,
  providerId: string
): Promise<AIReport> => {
  const { patient, painLogs, exerciseLogs } = data;

  const initialPain = painLogs.length > 0 ? painLogs[0].preWorkout?.painLevel || 0 : 0;
  const finalPain = patient.latestPainLevel;
  const painReduction = initialPain - finalPain;

  const prompt = `Du är en fysioterapeut som skriver utskrivningssammanfattningar.

PATIENTDATA:
- Namn: ${patient.name}
- Diagnos: ${patient.diagnosis}
- Rehabiliteringsperiod: ${patient.startDate} till idag
- Genomförda faser: ${patient.currentPhase} av ${patient.totalPhases}
- Total följsamhet: ${patient.adherencePercent}%
- Smärtförändring: ${initialPain}/10 → ${finalPain}/10 (${painReduction > 0 ? '-' + painReduction : '+' + Math.abs(painReduction)})

Skriv en professionell utskrivningssammanfattning på svenska i JSON-format:
{
  "summary": "3-4 meningars sammanfattning av hela rehabiliteringsperioden",
  "progressAnalysis": {
    "adherence": ${patient.adherencePercent},
    "painTrend": "${patient.painTrend}",
    "keyMilestones": ["Viktiga milstolpar under rehabiliteringen"],
    "concerns": ["Kvarvarande bekymmer eller begränsningar"],
    "strengthsObserved": ["Positiva resultat och styrkor"]
  },
  "exerciseAnalysis": {
    "completed": 0,
    "skipped": 0,
    "averageDifficulty": "lagom",
    "modifications": ["Övningar som modifierades under perioden"],
    "problemExercises": []
  },
  "recommendations": {
    "immediate": ["Råd för hemmaträning efter utskrivning"],
    "nextPhase": ["Långsiktiga rekommendationer"],
    "riskFactors": ["Riskfaktorer för återfall"],
    "programAdjustments": ["Livsstilsråd"]
  }
}

Svara ENDAST med JSON, ingen annan text.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Du är en expert fysioterapeut som skriver utskrivningssammanfattningar. Svara alltid på svenska."
        },
        { role: "user", content: prompt }
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = cleanJson(responseText);
    const parsed = JSON.parse(cleaned);

    const now = new Date();

    const report: AIReport = {
      id: crypto.randomUUID(),
      providerId,
      patientId: patient.id,
      reportType: 'discharge',
      summary: parsed.summary || 'Utskrivningssammanfattning genererad',
      progressAnalysis: parsed.progressAnalysis,
      exerciseAnalysis: parsed.exerciseAnalysis,
      recommendations: parsed.recommendations,
      periodStart: patient.startDate,
      periodEnd: now.toISOString().split('T')[0],
      createdAt: now.toISOString(),
      generatedBy: MODEL
    };

    return report;
  } catch (error) {
    console.error('Failed to generate discharge summary:', error);
    throw new Error('Kunde inte generera utskrivningssammanfattning');
  }
};

/**
 * Analyze patient adherence patterns and suggest interventions
 */
export interface AdherenceInsight {
  pattern: string;
  frequency: number;
  suggestion: string;
}

export const analyzeAdherencePatterns = async (
  exerciseLogs: ExerciseLog[],
  painLogs: DailyPainLog[]
): Promise<AdherenceInsight[]> => {
  // Calculate patterns
  const dayOfWeekCounts: Record<number, { completed: number; total: number }> = {};
  exerciseLogs.forEach(log => {
    const day = new Date(log.date).getDay();
    if (!dayOfWeekCounts[day]) dayOfWeekCounts[day] = { completed: 0, total: 0 };
    dayOfWeekCounts[day].total++;
    if (log.completed) dayOfWeekCounts[day].completed++;
  });

  const dayNames = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

  const patterns: AdherenceInsight[] = [];

  // Find weakest day
  let weakestDay = -1;
  let lowestRate = 1;
  Object.entries(dayOfWeekCounts).forEach(([day, counts]) => {
    const rate = counts.total > 0 ? counts.completed / counts.total : 1;
    if (rate < lowestRate && counts.total >= 2) {
      lowestRate = rate;
      weakestDay = parseInt(day);
    }
  });

  if (weakestDay >= 0 && lowestRate < 0.6) {
    patterns.push({
      pattern: `Låg följsamhet på ${dayNames[weakestDay]}ar`,
      frequency: Math.round(lowestRate * 100),
      suggestion: `Överväg att justera övningsschemat för ${dayNames[weakestDay]}ar eller sätt påminnelser.`
    });
  }

  // Check pain correlation
  const highPainDays = painLogs.filter(log =>
    (log.preWorkout?.painLevel || 0) >= 6
  );
  if (highPainDays.length > painLogs.length * 0.3) {
    patterns.push({
      pattern: 'Hög smärta påverkar träning',
      frequency: Math.round((highPainDays.length / painLogs.length) * 100),
      suggestion: 'Överväg smärthanteringsstrategier före träning eller justera övningsintensitet.'
    });
  }

  // Check difficulty feedback
  const tooHardCount = exerciseLogs.filter(e => e.difficulty === 'för_svår').length;
  if (tooHardCount > exerciseLogs.length * 0.25) {
    patterns.push({
      pattern: 'Övningar upplevs för svåra',
      frequency: Math.round((tooHardCount / exerciseLogs.length) * 100),
      suggestion: 'Granska och möjligen förenkla övningsprogrammet eller öka progressionen gradvis.'
    });
  }

  return patterns;
};

/**
 * Generate a quick patient status summary for dashboard
 */
export const generateQuickSummary = async (
  patient: PatientSummary,
  recentPainLogs: DailyPainLog[]
): Promise<string> => {
  const prompt = `Ge en mycket kort (max 2 meningar) statussammanfattning för en patient:

- Diagnos: ${patient.diagnosis}
- Fas: ${patient.currentPhase}/${patient.totalPhases}
- Följsamhet: ${patient.adherencePercent}%
- Smärta: ${patient.latestPainLevel}/10 (${patient.painTrend})
- Senaste aktivitet: ${patient.lastActivityDate}

Svara ENDAST med 1-2 korta meningar på svenska.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Du är en fysioterapeut som ger korta statusuppdateringar. Var koncis."
        },
        { role: "user", content: prompt }
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content?.trim() || 'Status ej tillgänglig';
  } catch (error) {
    console.error('Failed to generate quick summary:', error);
    return 'Kunde inte generera sammanfattning';
  }
};
