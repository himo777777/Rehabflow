/**
 * Report Service - Weekly AI Summary
 *
 * Genererar personaliserade veckosammanfattningar med AI:
 * - Adherence och följsamhet
 * - Smärttrend
 * - Milestones uppnådda
 * - Risker och varningar
 * - Rekommendationer för nästa vecka
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { storageService } from './storageService';
import { evaluatePainResponse } from './progressionService';
import { logger } from '../lib/logger';

// SECURITY FIX: Validate API key before use
function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_GOOGLE_AI_API_KEY : undefined);

  if (!apiKey) {
    logger.warn('Gemini API key not configured - AI report generation will be disabled');
    return null;
  }

  return new GoogleGenerativeAI(apiKey);
}

// Initialize Gemini - may be null if API key not configured
const genAI = getGeminiClient();

export interface WeeklySummaryData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  adherence: {
    completionRate: number;
    totalSessions: number;
    completedSessions: number;
    streak: number;
  };
  pain: {
    avgPain: number;
    minPain: number;
    maxPain: number;
    trend: 'improving' | 'stable' | 'worsening';
    trafficLight: 'green' | 'yellow' | 'red';
  };
  exercises: {
    totalExercises: number;
    mostFrequent: string[];
    avgDifficulty: string;
    improvements: string[];
  };
  milestones: {
    newMilestones: string[];
    totalMilestones: number;
  };
  risks: string[];
  phase: {
    current: number;
    daysInPhase: number;
    progressReady: boolean;
  };
}

export interface WeeklySummary {
  data: WeeklySummaryData;
  summary: string;
  recommendations: string[];
  motivationalMessage: string;
  generatedAt: string;
}

/**
 * Collect data for the weekly summary
 */
export async function collectWeeklyData(weekOffset: number = 0): Promise<WeeklySummaryData> {
  const painHistory = storageService.getPainHistory();
  const progressHistory = storageService.getHistorySync();
  const exerciseHistory = storageService.getDetailedExerciseHistory();
  const milestones = storageService.getMilestones();

  // Calculate week boundaries
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() - (weekOffset * 7));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // Get week number
  const weekNumber = Math.ceil(
    (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
  ) - weekOffset;

  // Calculate adherence
  let totalSessions = 0;
  let completedSessions = 0;
  let streak = 0;

  const sortedDates = Object.keys(progressHistory).sort().reverse();
  for (const date of sortedDates) {
    if (date >= startStr && date <= endStr) {
      const dayProgress = progressHistory[date];
      const dayCompleted = Object.values(dayProgress).filter(v => v === true).length;
      const dayTotal = Object.keys(dayProgress).length;
      totalSessions += dayTotal;
      completedSessions += dayCompleted;
    }

    // Calculate streak
    const hasCompleted = Object.values(progressHistory[date] || {}).some(v => v === true);
    if (hasCompleted) {
      streak++;
    } else if (date < endStr) {
      break;
    }
  }

  const completionRate = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  // Calculate pain metrics
  const weekPainLogs = Object.entries(painHistory)
    .filter(([date]) => date >= startStr && date <= endStr)
    .map(([, log]) => log);

  let totalPain = 0;
  let painCount = 0;
  let minPain = 10;
  let maxPain = 0;

  weekPainLogs.forEach(log => {
    if (log.postWorkout?.painLevel !== undefined) {
      totalPain += log.postWorkout.painLevel;
      painCount++;
      minPain = Math.min(minPain, log.postWorkout.painLevel);
      maxPain = Math.max(maxPain, log.postWorkout.painLevel);
    }
  });

  const avgPain = painCount > 0 ? Math.round((totalPain / painCount) * 10) / 10 : 0;
  if (painCount === 0) {
    minPain = 0;
    maxPain = 0;
  }

  // Calculate pain trend (compare with previous week)
  const prevWeekStart = new Date(startDate);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0];

  const prevWeekPainLogs = Object.entries(painHistory)
    .filter(([date]) => date >= prevWeekStartStr && date < startStr)
    .map(([, log]) => log);

  let prevTotalPain = 0;
  let prevPainCount = 0;
  prevWeekPainLogs.forEach(log => {
    if (log.postWorkout?.painLevel !== undefined) {
      prevTotalPain += log.postWorkout.painLevel;
      prevPainCount++;
    }
  });
  const prevAvgPain = prevPainCount > 0 ? prevTotalPain / prevPainCount : avgPain;

  let painTrend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (avgPain < prevAvgPain - 1) painTrend = 'improving';
  else if (avgPain > prevAvgPain + 1) painTrend = 'worsening';

  const trafficLight = evaluatePainResponse(avgPain, avgPain, avgPain);

  // Calculate exercise metrics
  const weekExercises = Object.entries(exerciseHistory)
    .filter(([date]) => date >= startStr && date <= endStr)
    .flatMap(([, logs]) => logs);

  const exerciseCount: Record<string, number> = {};
  let totalDifficulty = 0;
  const improvements: string[] = [];

  weekExercises.forEach(log => {
    exerciseCount[log.exerciseName] = (exerciseCount[log.exerciseName] || 0) + 1;

    const diffScore = log.difficulty === 'för_lätt' ? 1 : log.difficulty === 'lagom' ? 2 : 3;
    totalDifficulty += diffScore;

    if (log.difficulty === 'för_lätt') {
      improvements.push(`${log.exerciseName} känns lättare`);
    }
  });

  const mostFrequent = Object.entries(exerciseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const avgDifficultyScore = weekExercises.length > 0 ? totalDifficulty / weekExercises.length : 2;
  const avgDifficulty = avgDifficultyScore < 1.5 ? 'lätt' : avgDifficultyScore < 2.5 ? 'lagom' : 'svårt';

  // Get new milestones this week
  const newMilestones = milestones
    .filter(m => m.achievedAt >= startStr && m.achievedAt <= endStr)
    .map(m => m.title);

  // Identify risks
  const risks: string[] = [];
  if (completionRate < 50) risks.push('Låg följsamhet - risk för sämre resultat');
  if (painTrend === 'worsening') risks.push('Ökande smärttrend - överväg vila');
  if (maxPain >= 7) risks.push('Höga smärttoppar noterade');
  if (streak === 0) risks.push('Bruten streak - försök återuppta rutinen');

  // Get current phase (use index + 1 for phase number, default to 1)
  const program = await storageService.getProgram();
  const currentPhase = program?.phases?.length ? 1 : 1; // Default to phase 1
  // Calculate days based on progress history
  const daysInPhase = sortedDates.length > 0 ? 7 : 0; // Simplified
  const progressReady = completionRate >= 70 && avgPain <= 4 && daysInPhase >= 7;

  return {
    weekNumber,
    startDate: startStr,
    endDate: endStr,
    adherence: {
      completionRate,
      totalSessions,
      completedSessions,
      streak
    },
    pain: {
      avgPain,
      minPain,
      maxPain,
      trend: painTrend,
      trafficLight
    },
    exercises: {
      totalExercises: weekExercises.length,
      mostFrequent,
      avgDifficulty,
      improvements: [...new Set(improvements)].slice(0, 3)
    },
    milestones: {
      newMilestones,
      totalMilestones: milestones.length
    },
    risks,
    phase: {
      current: currentPhase,
      daysInPhase,
      progressReady
    }
  };
}

/**
 * Generate AI-powered weekly summary
 */
export async function generateWeeklySummary(weekOffset: number = 0): Promise<WeeklySummary> {
  const data = await collectWeeklyData(weekOffset);

  const prompt = `Du är en rehabiliteringsexpert som ger personlig feedback på svenska.
Analysera följande veckodata för en rehabiliteringspatient och skapa en personlig sammanfattning.

VECKODATA:
- Vecka ${data.weekNumber} (${data.startDate} - ${data.endDate})
- Följsamhet: ${data.adherence.completionRate}% (${data.adherence.completedSessions}/${data.adherence.totalSessions} pass)
- Streak: ${data.adherence.streak} dagar
- Genomsnittlig smärta: ${data.pain.avgPain}/10 (min: ${data.pain.minPain}, max: ${data.pain.maxPain})
- Smärttrend: ${data.pain.trend}
- Trafikljus: ${data.pain.trafficLight}
- Totalt övningar: ${data.exercises.totalExercises}
- Vanligaste övningar: ${data.exercises.mostFrequent.join(', ') || 'inga'}
- Upplevd svårighet: ${data.exercises.avgDifficulty}
- Förbättringar: ${data.exercises.improvements.join(', ') || 'inga specifika'}
- Nya milstolpar: ${data.milestones.newMilestones.join(', ') || 'inga'}
- Risker: ${data.risks.join(', ') || 'inga identifierade'}
- Fas ${data.phase.current}, dag ${data.phase.daysInPhase}

Ge svar i JSON-format:
{
  "summary": "2-3 meningar som sammanfattar veckans progress",
  "recommendations": ["3-4 konkreta rekommendationer för nästa vecka"],
  "motivationalMessage": "Ett kort motiverande meddelande"
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      data,
      summary: parsed.summary || 'Ingen sammanfattning tillgänglig.',
      recommendations: parsed.recommendations || ['Fortsätt med ditt nuvarande program'],
      motivationalMessage: parsed.motivationalMessage || 'Bra jobbat denna vecka!',
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to generate AI summary:', error);

    // Fallback to rule-based summary
    return {
      data,
      summary: generateFallbackSummary(data),
      recommendations: generateFallbackRecommendations(data),
      motivationalMessage: generateFallbackMotivation(data),
      generatedAt: new Date().toISOString()
    };
  }
}

// Fallback functions for when AI is unavailable
function generateFallbackSummary(data: WeeklySummaryData): string {
  const parts: string[] = [];

  if (data.adherence.completionRate >= 80) {
    parts.push('Utmärkt följsamhet denna vecka!');
  } else if (data.adherence.completionRate >= 60) {
    parts.push('Bra följsamhet, men det finns utrymme för förbättring.');
  } else {
    parts.push('Följsamheten var låg denna vecka.');
  }

  if (data.pain.trend === 'improving') {
    parts.push('Smärtan minskar, vilket är ett gott tecken.');
  } else if (data.pain.trend === 'worsening') {
    parts.push('Smärtan har ökat något, överväg att justera intensiteten.');
  }

  if (data.milestones.newMilestones.length > 0) {
    parts.push(`Du uppnådde ${data.milestones.newMilestones.length} nya milstolpar!`);
  }

  return parts.join(' ');
}

function generateFallbackRecommendations(data: WeeklySummaryData): string[] {
  const recs: string[] = [];

  if (data.adherence.completionRate < 70) {
    recs.push('Försök att genomföra minst 70% av planerade pass nästa vecka');
  }

  if (data.pain.avgPain > 5) {
    recs.push('Minska intensiteten och fokusera på kontrollerade rörelser');
  }

  if (data.exercises.avgDifficulty === 'svårt') {
    recs.push('Övningarna verkar utmanande - överväg enklare varianter');
  } else if (data.exercises.avgDifficulty === 'lätt') {
    recs.push('Du kan överväga att öka utmaningen något');
  }

  if (data.adherence.streak > 0) {
    recs.push(`Behåll din ${data.adherence.streak}-dagars streak!`);
  } else {
    recs.push('Försök starta en ny träningsstreak');
  }

  if (data.phase.progressReady) {
    recs.push('Du verkar redo att överväga progression till nästa fas');
  }

  return recs.slice(0, 4);
}

function generateFallbackMotivation(data: WeeklySummaryData): string {
  if (data.adherence.completionRate >= 90) {
    return 'Fantastiskt engagemang! Du gör verklig skillnad för din återhämtning.';
  }
  if (data.adherence.streak >= 7) {
    return `${data.adherence.streak} dagar i rad - din disciplin är imponerande!`;
  }
  if (data.pain.trend === 'improving') {
    return 'Smärtan minskar - ditt hårda arbete ger resultat!';
  }
  if (data.milestones.newMilestones.length > 0) {
    return 'Grattis till dina nya milstolpar! Varje steg framåt räknas.';
  }
  return 'Varje träningspass tar dig närmare ditt mål. Fortsätt kämpa!';
}

/**
 * Get cached summary or generate new one
 */
export async function getOrGenerateWeeklySummary(): Promise<WeeklySummary> {
  const CACHE_KEY = 'rehabflow_weekly_summary';
  const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as WeeklySummary;
      const generatedAt = new Date(parsed.generatedAt).getTime();
      if (Date.now() - generatedAt < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch {
    // Ignore cache errors
  }

  const summary = await generateWeeklySummary();

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(summary));
  } catch {
    // Ignore cache save errors
  }

  return summary;
}
