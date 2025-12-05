/**
 * Report Generator Service - AI-Powered Clinical Reports
 *
 * Genererar professionella kliniska rapporter med:
 * - Patientsammanfattning
 * - Assessment scores med MCID-analys
 * - Grafer och trender
 * - AI-genererade rekommendationer
 * - Röda flaggor
 * - PDF export
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { storageService } from './storageService';
import { collectWeeklyData } from './reportService';
import { getUserPoints, getUserLevel } from './gamificationService';
import { UserAssessment } from '../types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// ============================================
// TYPES
// ============================================

export interface AssessmentScore {
  name: string;
  baseline: number | null;
  current: number | null;
  change: number | null;
  mcid: number;
  isSignificant: boolean;
  interpretation: string;
}

export interface PainTrend {
  date: string;
  pain: number;
}

export interface ExerciseSummary {
  totalSessions: number;
  completionRate: number;
  mostFrequent: { name: string; count: number }[];
  avgDifficulty: 'lätt' | 'lagom' | 'svårt';
}

export interface ClinicalReport {
  // Header
  reportId: string;
  generatedAt: string;
  reportPeriod: {
    start: string;
    end: string;
    weeks: number;
  };

  // Patient Info
  patient: {
    name: string;
    age: number;
    injuryType: string;
    bodyPart: string;
    injuryDate: string;
    surgeryType?: string;
    surgeryDate?: string;
  };

  // Current Status
  currentPhase: {
    phase: number;
    phaseName: string;
    daysInPhase: number;
    progressionReady: boolean;
  };

  // Assessments
  assessments: AssessmentScore[];

  // Pain Analysis
  painAnalysis: {
    currentPain: number;
    avgPain: number;
    painTrend: 'improving' | 'stable' | 'worsening';
    trafficLight: 'green' | 'yellow' | 'red';
    painHistory: PainTrend[];
  };

  // Exercise Summary
  exerciseSummary: ExerciseSummary;

  // Milestones & Achievements
  achievements: {
    milestones: string[];
    level: number;
    levelName: string;
    totalPoints: number;
    streak: number;
  };

  // Risks & Red Flags
  redFlags: string[];
  risks: string[];

  // AI Recommendations
  aiSummary: string;
  recommendations: string[];

  // Goals
  goals: {
    shortTerm: string[];
    longTerm: string[];
    progress: number;
  };
}

// ============================================
// ASSESSMENT MCID VALUES
// ============================================

const MCID_VALUES: Record<string, { mcid: number; direction: 'lower' | 'higher' }> = {
  'VAS': { mcid: 2, direction: 'lower' },
  'NRS': { mcid: 2, direction: 'lower' },
  'ODI': { mcid: 10, direction: 'lower' },
  'NDI': { mcid: 7, direction: 'lower' },
  'TSK-11': { mcid: 4, direction: 'lower' },
  'KOOS': { mcid: 10, direction: 'higher' },
  'DASH': { mcid: 10, direction: 'lower' },
  'PSFS': { mcid: 2, direction: 'higher' },
  'LEFS': { mcid: 9, direction: 'higher' },
  'FABQ': { mcid: 4, direction: 'lower' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPhaseNameSwedish(phase: number): string {
  const phases: Record<number, string> = {
    1: 'Akut/Skyddande',
    2: 'Tidig Rehabilitering',
    3: 'Mellanfas',
    4: 'Sen Rehabilitering',
    5: 'Återgång till Aktivitet'
  };
  return phases[phase] || `Fas ${phase}`;
}

function interpretAssessmentChange(
  name: string,
  change: number | null,
  mcidInfo: { mcid: number; direction: 'lower' | 'higher' }
): { isSignificant: boolean; interpretation: string } {
  if (change === null) {
    return { isSignificant: false, interpretation: 'Ingen data' };
  }

  const { mcid, direction } = mcidInfo;
  const isImprovement = direction === 'lower' ? change < 0 : change > 0;
  const isSignificant = Math.abs(change) >= mcid;

  if (isSignificant && isImprovement) {
    return {
      isSignificant: true,
      interpretation: `Kliniskt signifikant förbättring (${change > 0 ? '+' : ''}${change})`
    };
  } else if (isSignificant && !isImprovement) {
    return {
      isSignificant: true,
      interpretation: `Kliniskt signifikant försämring (${change > 0 ? '+' : ''}${change})`
    };
  } else if (isImprovement) {
    return {
      isSignificant: false,
      interpretation: `Liten förbättring (${change > 0 ? '+' : ''}${change})`
    };
  } else {
    return {
      isSignificant: false,
      interpretation: `Stabil/minimal förändring (${change > 0 ? '+' : ''}${change})`
    };
  }
}

// ============================================
// MAIN REPORT GENERATION
// ============================================

/**
 * Generate a comprehensive clinical report
 */
export async function generateClinicalReport(weeksBack: number = 4): Promise<ClinicalReport> {
  // Get all stored data
  const assessment = storageService.getAssessmentDraft() as UserAssessment | null;
  const painHistory = storageService.getPainHistory();
  const progressHistory = storageService.getHistorySync();
  const exerciseHistory = storageService.getDetailedExerciseHistory();
  const milestones = storageService.getMilestones();
  const program = await storageService.getProgram();
  const userPoints = getUserPoints();
  const userLevel = getUserLevel();

  // Calculate report period
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeksBack * 7));

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  // Get weekly data
  const weeklyData = await collectWeeklyData(0);

  // Generate report ID
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

  // ============================================
  // PATIENT INFO
  // ============================================

  const patient = {
    name: assessment?.name || 'Patient',
    age: assessment?.age || 0,
    injuryType: assessment?.injuryType || 'Okänd',
    bodyPart: assessment?.injuryLocation || 'Okänt',
    injuryDate: assessment?.surgeryDate || '',
    surgeryType: assessment?.surgicalDetails?.procedure,
    surgeryDate: assessment?.surgeryDate
  };

  // ============================================
  // CURRENT PHASE
  // ============================================

  // Get current phase from program phases (use index + 1 for phase number)
  const programPhase = program?.phases?.length ? 1 : 1; // Default to phase 1

  const currentPhase = {
    phase: programPhase,
    phaseName: getPhaseNameSwedish(programPhase),
    daysInPhase: weeklyData.phase.daysInPhase,
    progressionReady: weeklyData.phase.progressReady
  };

  // ============================================
  // ASSESSMENTS
  // ============================================

  const assessments: AssessmentScore[] = [];
  const baselineAssessments = assessment?.baselineAssessments || {};
  // Current assessments would need to be stored separately - using baseline as fallback
  const currentAssessments: Record<string, { score: number }> = {};

  // VAS/NRS Pain
  if (assessment?.painLevel !== undefined) {
    const baseline = assessment.painLevel;
    const current = weeklyData.pain.avgPain;
    const change = current - baseline;
    const mcidInfo = MCID_VALUES['VAS'];
    const { isSignificant, interpretation } = interpretAssessmentChange('VAS', change, mcidInfo);

    assessments.push({
      name: 'VAS Smärta',
      baseline,
      current,
      change,
      mcid: mcidInfo.mcid,
      isSignificant,
      interpretation
    });
  }

  // TSK-11
  if (baselineAssessments.tsk11) {
    const baseline = baselineAssessments.tsk11.score;
    const current = currentAssessments.tsk11?.score || baseline;
    const change = current - baseline;
    const mcidInfo = MCID_VALUES['TSK-11'];
    const { isSignificant, interpretation } = interpretAssessmentChange('TSK-11', change, mcidInfo);

    assessments.push({
      name: 'TSK-11 (Rörelserädsla)',
      baseline,
      current,
      change,
      mcid: mcidInfo.mcid,
      isSignificant,
      interpretation
    });
  }

  // ODI (if low back)
  if (baselineAssessments.odi) {
    const baseline = baselineAssessments.odi.score;
    const current = currentAssessments.odi?.score || baseline;
    const change = current - baseline;
    const mcidInfo = MCID_VALUES['ODI'];
    const { isSignificant, interpretation } = interpretAssessmentChange('ODI', change, mcidInfo);

    assessments.push({
      name: 'ODI (Funktionsnedsättning)',
      baseline,
      current,
      change,
      mcid: mcidInfo.mcid,
      isSignificant,
      interpretation
    });
  }

  // KOOS (if knee)
  if (baselineAssessments.koos) {
    const baseline = baselineAssessments.koos.score;
    const current = currentAssessments.koos?.score || baseline;
    const change = current - baseline;
    const mcidInfo = MCID_VALUES['KOOS'];
    const { isSignificant, interpretation } = interpretAssessmentChange('KOOS', change, mcidInfo);

    assessments.push({
      name: 'KOOS (Knäfunktion)',
      baseline,
      current,
      change,
      mcid: mcidInfo.mcid,
      isSignificant,
      interpretation
    });
  }

  // QuickDASH (if upper extremity)
  if (baselineAssessments.quickdash) {
    const baseline = baselineAssessments.quickdash.score;
    const current = currentAssessments.quickdash?.score || baseline;
    const change = current - baseline;
    const mcidInfo = MCID_VALUES['DASH'];
    const { isSignificant, interpretation } = interpretAssessmentChange('DASH', change, mcidInfo);

    assessments.push({
      name: 'DASH (Övre extremitet)',
      baseline,
      current,
      change,
      mcid: mcidInfo.mcid,
      isSignificant,
      interpretation
    });
  }

  // HOOS (if hip)
  if (baselineAssessments.hoos) {
    const baseline = baselineAssessments.hoos.score;
    const current = currentAssessments.hoos?.score || baseline;
    const change = current - baseline;
    const mcidInfo = MCID_VALUES['KOOS']; // Use same MCID as KOOS
    const { isSignificant, interpretation } = interpretAssessmentChange('HOOS', change, mcidInfo);

    assessments.push({
      name: 'HOOS (Höftfunktion)',
      baseline,
      current,
      change,
      mcid: mcidInfo.mcid,
      isSignificant,
      interpretation
    });
  }

  // ============================================
  // PAIN ANALYSIS
  // ============================================

  const painTrendData: PainTrend[] = [];
  const sortedPainDates = Object.keys(painHistory).sort();

  sortedPainDates.forEach(date => {
    if (date >= startStr && date <= endStr) {
      const log = painHistory[date];
      if (log.postWorkout?.painLevel !== undefined) {
        painTrendData.push({
          date,
          pain: log.postWorkout.painLevel
        });
      }
    }
  });

  const painAnalysis = {
    currentPain: painTrendData.length > 0
      ? painTrendData[painTrendData.length - 1].pain
      : assessment?.painLevel || 0,
    avgPain: weeklyData.pain.avgPain,
    painTrend: weeklyData.pain.trend,
    trafficLight: weeklyData.pain.trafficLight,
    painHistory: painTrendData
  };

  // ============================================
  // EXERCISE SUMMARY
  // ============================================

  let totalSessions = 0;
  let completedSessions = 0;
  const exerciseCount: Record<string, number> = {};
  let totalDifficulty = 0;
  let exerciseLogCount = 0;

  Object.entries(progressHistory).forEach(([date, progress]) => {
    if (date >= startStr && date <= endStr) {
      const dayCompleted = Object.values(progress).filter(v => v === true).length;
      const dayTotal = Object.keys(progress).length;
      totalSessions += dayTotal;
      completedSessions += dayCompleted;
    }
  });

  Object.entries(exerciseHistory).forEach(([date, logs]) => {
    if (date >= startStr && date <= endStr) {
      logs.forEach(log => {
        exerciseCount[log.exerciseName] = (exerciseCount[log.exerciseName] || 0) + 1;
        const diffScore = log.difficulty === 'för_lätt' ? 1 : log.difficulty === 'lagom' ? 2 : 3;
        totalDifficulty += diffScore;
        exerciseLogCount++;
      });
    }
  });

  const mostFrequent = Object.entries(exerciseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const avgDifficultyScore = exerciseLogCount > 0 ? totalDifficulty / exerciseLogCount : 2;
  const avgDifficulty: 'lätt' | 'lagom' | 'svårt' =
    avgDifficultyScore < 1.5 ? 'lätt' : avgDifficultyScore < 2.5 ? 'lagom' : 'svårt';

  const exerciseSummary: ExerciseSummary = {
    totalSessions,
    completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    mostFrequent,
    avgDifficulty
  };

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  const periodMilestones = milestones
    .filter(m => m.achievedAt >= startStr && m.achievedAt <= endStr)
    .map(m => m.title);

  const achievements = {
    milestones: periodMilestones,
    level: userLevel.level,
    levelName: userLevel.name,
    totalPoints: userPoints.total,
    streak: weeklyData.adherence.streak
  };

  // ============================================
  // RED FLAGS & RISKS
  // ============================================

  const redFlags: string[] = [];
  const risks: string[] = [];

  // Check for red flags from onboarding
  if (assessment?.redFlags?.length) {
    redFlags.push('Röda flaggor identifierade vid onboarding - remiss rekommenderas');
  }

  // Pain-based flags
  if (painAnalysis.avgPain >= 8) {
    redFlags.push('Genomgående hög smärta (8+) - överväg medicinskt samråd');
  }

  if (painAnalysis.painTrend === 'worsening' && weeklyData.adherence.completionRate > 70) {
    redFlags.push('Ökande smärta trots god följsamhet - ompröva programmet');
  }

  // TSK-11 flag
  const tskScore = baselineAssessments.tsk11?.score || 0;
  if (tskScore >= 35) {
    risks.push('Hög rörelserädsla (TSK-11 ≥35) - graded exposure rekommenderas');
  }

  // Adherence risks
  if (exerciseSummary.completionRate < 50) {
    risks.push('Låg följsamhet (<50%) - risk för sämre behandlingsresultat');
  }

  if (weeklyData.adherence.streak === 0) {
    risks.push('Bruten träningsstreak - risk för tappad motivation');
  }

  // Exercise difficulty mismatch
  if (avgDifficulty === 'svårt' && painAnalysis.avgPain > 5) {
    risks.push('Övningar upplevs svåra + högre smärta - överväg regresssion');
  }

  // ============================================
  // AI RECOMMENDATIONS
  // ============================================

  let aiSummary = '';
  let recommendations: string[] = [];

  try {
    const aiResponse = await generateAIRecommendations({
      patient,
      currentPhase,
      assessments,
      painAnalysis,
      exerciseSummary,
      achievements,
      redFlags,
      risks,
      weeksBack
    });

    aiSummary = aiResponse.summary;
    recommendations = aiResponse.recommendations;
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    aiSummary = generateFallbackAISummary({
      painAnalysis,
      exerciseSummary,
      currentPhase,
      assessments
    });
    recommendations = generateFallbackRecommendations({
      painAnalysis,
      exerciseSummary,
      currentPhase,
      redFlags,
      risks
    });
  }

  // ============================================
  // GOALS
  // ============================================

  // SMART goal from assessment (singular)
  const smartGoal = assessment?.smartGoal;
  const shortTerm = smartGoal?.specific ? [smartGoal.specific] : [];
  const longTerm = smartGoal?.primaryGoal ? [smartGoal.primaryGoal] : [];

  // Calculate goal progress (simplified)
  const goalProgress = Math.min(
    100,
    Math.round(
      (exerciseSummary.completionRate * 0.4) +
      ((10 - painAnalysis.avgPain) / 10 * 100 * 0.3) +
      (currentPhase.phase / 5 * 100 * 0.3)
    )
  );

  const goals = {
    shortTerm,
    longTerm,
    progress: goalProgress
  };

  // ============================================
  // COMPILE REPORT
  // ============================================

  return {
    reportId,
    generatedAt: new Date().toISOString(),
    reportPeriod: {
      start: startStr,
      end: endStr,
      weeks: weeksBack
    },
    patient,
    currentPhase,
    assessments,
    painAnalysis,
    exerciseSummary,
    achievements,
    redFlags,
    risks,
    aiSummary,
    recommendations,
    goals
  };
}

// ============================================
// AI GENERATION
// ============================================

interface AIRecommendationInput {
  patient: ClinicalReport['patient'];
  currentPhase: ClinicalReport['currentPhase'];
  assessments: AssessmentScore[];
  painAnalysis: ClinicalReport['painAnalysis'];
  exerciseSummary: ExerciseSummary;
  achievements: ClinicalReport['achievements'];
  redFlags: string[];
  risks: string[];
  weeksBack: number;
}

async function generateAIRecommendations(input: AIRecommendationInput): Promise<{
  summary: string;
  recommendations: string[];
}> {
  const prompt = `Du är en erfaren rehabiliteringsspecialist som skriver kliniska rapporter på svenska.

PATIENTDATA:
- Namn: ${input.patient.name}, Ålder: ${input.patient.age}
- Skadetyp: ${input.patient.injuryType}, Kroppsdel: ${input.patient.bodyPart}
- Nuvarande fas: ${input.currentPhase.phase} (${input.currentPhase.phaseName})
- Dagar i fas: ${input.currentPhase.daysInPhase}
- Redo för progression: ${input.currentPhase.progressionReady ? 'Ja' : 'Nej'}

ASSESSMENTS:
${input.assessments.map(a =>
  `- ${a.name}: Baseline ${a.baseline} → Nuvarande ${a.current} (${a.interpretation})`
).join('\n')}

SMÄRTANALYS:
- Nuvarande smärta: ${input.painAnalysis.currentPain}/10
- Genomsnittlig smärta: ${input.painAnalysis.avgPain}/10
- Trend: ${input.painAnalysis.painTrend}
- Trafikljus: ${input.painAnalysis.trafficLight}

TRÄNINGSSAMMANFATTNING:
- Följsamhet: ${input.exerciseSummary.completionRate}%
- Totala pass: ${input.exerciseSummary.totalSessions}
- Upplevd svårighet: ${input.exerciseSummary.avgDifficulty}
- Streak: ${input.achievements.streak} dagar

RÖDA FLAGGOR: ${input.redFlags.length > 0 ? input.redFlags.join(', ') : 'Inga'}
RISKER: ${input.risks.length > 0 ? input.risks.join(', ') : 'Inga identifierade'}

Skriv:
1. En professionell klinisk sammanfattning (3-4 meningar) för journalföring
2. 4-5 konkreta, evidensbaserade rekommendationer för fortsatt behandling

Svara i JSON-format:
{
  "summary": "Klinisk sammanfattning...",
  "recommendations": ["Rekommendation 1", "Rekommendation 2", ...]
}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  return JSON.parse(jsonMatch[0]);
}

// ============================================
// FALLBACK FUNCTIONS
// ============================================

function generateFallbackAISummary(input: {
  painAnalysis: ClinicalReport['painAnalysis'];
  exerciseSummary: ExerciseSummary;
  currentPhase: ClinicalReport['currentPhase'];
  assessments: AssessmentScore[];
}): string {
  const parts: string[] = [];

  parts.push(`Patienten befinner sig i ${input.currentPhase.phaseName} (Fas ${input.currentPhase.phase}).`);

  if (input.exerciseSummary.completionRate >= 70) {
    parts.push(`God följsamhet med ${input.exerciseSummary.completionRate}% genomförda pass.`);
  } else {
    parts.push(`Suboptimal följsamhet med ${input.exerciseSummary.completionRate}% genomförda pass.`);
  }

  if (input.painAnalysis.painTrend === 'improving') {
    parts.push('Smärtan visar en positiv nedåtgående trend.');
  } else if (input.painAnalysis.painTrend === 'worsening') {
    parts.push('Smärtan har ökat under perioden, vilket bör utvärderas närmare.');
  } else {
    parts.push('Smärtnivån har varit stabil under perioden.');
  }

  const significantImprove = input.assessments.filter(
    a => a.isSignificant && a.interpretation.includes('förbättring')
  );

  if (significantImprove.length > 0) {
    parts.push(`Kliniskt signifikant förbättring noteras i ${significantImprove.map(a => a.name).join(', ')}.`);
  }

  return parts.join(' ');
}

function generateFallbackRecommendations(input: {
  painAnalysis: ClinicalReport['painAnalysis'];
  exerciseSummary: ExerciseSummary;
  currentPhase: ClinicalReport['currentPhase'];
  redFlags: string[];
  risks: string[];
}): string[] {
  const recs: string[] = [];

  // Red flags take priority
  if (input.redFlags.length > 0) {
    recs.push('Prioritera uppföljning av identifierade röda flaggor');
  }

  // Adherence recommendations
  if (input.exerciseSummary.completionRate < 50) {
    recs.push('Fokusera på att öka följsamheten genom motiverande samtal och anpassning av programmet');
  } else if (input.exerciseSummary.completionRate >= 80) {
    recs.push('Behåll nuvarande träningsrutin som fungerar väl');
  }

  // Pain-based recommendations
  if (input.painAnalysis.avgPain > 6) {
    recs.push('Överväg smärtmodulerande strategier och eventuell intensitetssänkning');
  }

  if (input.painAnalysis.painTrend === 'improving') {
    recs.push('Fortsätt nuvarande behandlingsstrategi som ger positiva resultat');
  }

  // Phase-based recommendations
  if (input.currentPhase.progressionReady) {
    recs.push('Överväg progression till nästa rehabiliteringsfas');
  }

  // Difficulty adjustment
  if (input.exerciseSummary.avgDifficulty === 'svårt') {
    recs.push('Utvärdera övningsval - överväg enklare varianter eller längre vila');
  } else if (input.exerciseSummary.avgDifficulty === 'lätt' && input.painAnalysis.avgPain < 4) {
    recs.push('Övningarna upplevs lätta med låg smärta - överväg gradvis progression');
  }

  return recs.slice(0, 5);
}

// ============================================
// PDF EXPORT (Preparation)
// ============================================

/**
 * Format report for PDF export
 * Returns HTML-formatted content ready for PDF generation
 */
export function formatReportForPDF(report: ClinicalReport): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('sv-SE');
  };

  return `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <title>Klinisk Rapport - ${report.patient.name}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .header-info { font-size: 0.9em; color: #6b7280; }
    .section { margin-bottom: 25px; padding: 15px; background: #f9fafb; border-radius: 8px; }
    .metric { display: inline-block; margin-right: 30px; margin-bottom: 10px; }
    .metric-label { font-size: 0.8em; color: #6b7280; }
    .metric-value { font-size: 1.4em; font-weight: bold; color: #1f2937; }
    .assessment-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .assessment-table th, .assessment-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .assessment-table th { background: #f3f4f6; font-weight: 600; }
    .significant { color: #059669; font-weight: 600; }
    .warning { color: #dc2626; font-weight: 600; }
    .recommendation { padding: 10px; margin: 5px 0; background: #eff6ff; border-left: 4px solid #3b82f6; }
    .red-flag { padding: 10px; margin: 5px 0; background: #fef2f2; border-left: 4px solid #ef4444; }
    .traffic-light { display: inline-block; width: 20px; height: 20px; border-radius: 50%; margin-right: 10px; }
    .green { background: #22c55e; }
    .yellow { background: #eab308; }
    .red { background: #ef4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.8em; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Klinisk Progressionsrapport</h1>
      <p><strong>${report.patient.name}</strong> | ${report.patient.age} år</p>
    </div>
    <div class="header-info">
      <p>Rapport-ID: ${report.reportId}</p>
      <p>Period: ${formatDate(report.reportPeriod.start)} - ${formatDate(report.reportPeriod.end)}</p>
      <p>Genererad: ${formatDate(report.generatedAt)}</p>
    </div>
  </div>

  <div class="section">
    <h2>Patientinformation</h2>
    <div class="metric">
      <div class="metric-label">Skadetyp</div>
      <div class="metric-value">${report.patient.injuryType}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Kroppsdel</div>
      <div class="metric-value">${report.patient.bodyPart}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Nuvarande Fas</div>
      <div class="metric-value">${report.currentPhase.phase} - ${report.currentPhase.phaseName}</div>
    </div>
    ${report.patient.surgeryType ? `
    <div class="metric">
      <div class="metric-label">Kirurgi</div>
      <div class="metric-value">${report.patient.surgeryType}</div>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <h2>Sammanfattning</h2>
    <p>${report.aiSummary}</p>
  </div>

  <div class="section">
    <h2>Nyckeltal</h2>
    <div class="metric">
      <div class="metric-label">Följsamhet</div>
      <div class="metric-value">${report.exerciseSummary.completionRate}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Genomsnittlig Smärta</div>
      <div class="metric-value">
        <span class="traffic-light ${report.painAnalysis.trafficLight}"></span>
        ${report.painAnalysis.avgPain}/10
      </div>
    </div>
    <div class="metric">
      <div class="metric-label">Streak</div>
      <div class="metric-value">${report.achievements.streak} dagar</div>
    </div>
    <div class="metric">
      <div class="metric-label">Level</div>
      <div class="metric-value">${report.achievements.level} - ${report.achievements.levelName}</div>
    </div>
  </div>

  <div class="section">
    <h2>Bedömningar (Assessments)</h2>
    <table class="assessment-table">
      <tr>
        <th>Bedömning</th>
        <th>Baseline</th>
        <th>Nuvarande</th>
        <th>Förändring</th>
        <th>Tolkning</th>
      </tr>
      ${report.assessments.map(a => `
      <tr>
        <td>${a.name}</td>
        <td>${a.baseline ?? '-'}</td>
        <td>${a.current ?? '-'}</td>
        <td class="${a.isSignificant ? 'significant' : ''}">${a.change !== null ? (a.change > 0 ? '+' : '') + a.change : '-'}</td>
        <td>${a.interpretation}</td>
      </tr>
      `).join('')}
    </table>
  </div>

  ${report.redFlags.length > 0 ? `
  <div class="section">
    <h2>Röda Flaggor</h2>
    ${report.redFlags.map(flag => `<div class="red-flag">${flag}</div>`).join('')}
  </div>
  ` : ''}

  ${report.risks.length > 0 ? `
  <div class="section">
    <h2>Identifierade Risker</h2>
    ${report.risks.map(risk => `<div class="recommendation" style="background: #fef3c7; border-color: #f59e0b;">${risk}</div>`).join('')}
  </div>
  ` : ''}

  <div class="section">
    <h2>Rekommendationer</h2>
    ${report.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
  </div>

  <div class="section">
    <h2>Vanligaste Övningar</h2>
    <ul>
      ${report.exerciseSummary.mostFrequent.map(ex => `<li>${ex.name} (${ex.count} gånger)</li>`).join('')}
    </ul>
  </div>

  ${report.achievements.milestones.length > 0 ? `
  <div class="section">
    <h2>Uppnådda Milstolpar</h2>
    <ul>
      ${report.achievements.milestones.map(m => `<li>${m}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>Denna rapport är genererad av RehabFlow AI-system. Alla kliniska beslut bör fattas av legitimerad vårdpersonal.</p>
    <p>© RehabFlow ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Export report data as JSON for external processing
 */
export function exportReportJSON(report: ClinicalReport): string {
  return JSON.stringify(report, null, 2);
}
