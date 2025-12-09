
import React, { useEffect, useRef, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { X, RefreshCw, AlertTriangle, Activity, BrainCircuit, Layers, Zap, Trophy, Timer, ScanLine, Target, Loader2, Pause, Play, FlipHorizontal } from 'lucide-react';
// Lazy load MediaPipe modules for better initial bundle size
import { loadMediaPipeModules, MediaPipeModules } from '../services/lazyMediaPipe';

// Import movement analysis services
import { PoseReconstructor, getPoseReconstructor, JointAngle3D } from '../services/poseReconstruction';
import { RepScoringService, getRepScoringService } from '../services/repScoringService';
import { CalibrationService, getCalibrationService, getDefaultCalibration, PoseLandmark } from '../services/calibrationService';
import { storageService } from '../services/storageService';
import MovementFeedbackOverlay from './MovementFeedbackOverlay';
import ExerciseSummary from './ExerciseSummary';
import { RepScore, FormIssue, RepPhase, MovementSession } from '../types';
import { getAnimationMapping } from '../data/exerciseAnimationMap';
import { logger } from '../utils/logger';
import { speechService } from '../services/speechService';
import SectionErrorBoundary from './SectionErrorBoundary';
import { getDeviceCapability, getCameraConstraints, getMediaPipeConfig, PerformanceMonitor } from '../services/adaptiveCameraService';
import { FrameThrottler, getExerciseSpeed } from '../services/frameThrottler';
// FAS 10: Emotionell AI-Coach - Affektiv Computing
import {
  emotionalIntelligenceService,
  EmotionalAnalysis,
  EmotionalState,
  getEmotionalStateEmoji,
  getEmotionalStateDescription,
  getEmotionalStateColor
} from '../services/emotionalIntelligenceService';
// FAS 9: Kompensationsdetektion
import {
  detectCompensations,
  getTopCompensations,
  getExerciseCategory,
  CompensationPattern
} from '../services/compensationDetectionService';

// Lazy load the 3D Avatar - RealisticAvatar3D with GLB model support
// Falls back to simple humanoid if model not found
const RealisticAvatar3D = lazy(() => import('./RealisticAvatar3D'));

interface AIMovementCoachProps {
  exerciseName: string;
  videoUrl?: string; 
  onClose: () => void;
}

type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'CORE' | 'STRETCH' | 'BALANCE' | 'PUSH' | 'SHOULDER' | 'GENERAL';

// FAS 9: Differentierad feedback-prioritet
type FeedbackPriority = 'critical' | 'corrective' | 'encouragement';

// FAS 9: Debounce-tider per prioritet (ms)
const DEBOUNCE_BY_PRIORITY: Record<FeedbackPriority, number> = {
  critical: 2000,      // Kritiska fel (knävalgus, smärta): 2 sek
  corrective: 4000,    // Korrigeringar (tempo, form): 4 sek
  encouragement: 8000  // Uppmuntran: 8 sek
};

// FAS 9: Ideal tempo för rehab (ms)
const IDEAL_TEMPO = {
  eccentricMin: 2000,  // 2 sek ner (minimum)
  eccentricMax: 4000,  // 4 sek ner (max)
  concentricMin: 1000, // 1 sek upp (minimum)
  concentricMax: 2000  // 2 sek upp (max)
};

// Exercise-specific encouragement messages
const ENCOURAGEMENT_MESSAGES: Record<string, string[]> = {
  GOOD_REP: [
    "Bra!",
    "Perfekt!",
    "Utmärkt!",
    "Snyggt!",
    "Stark!",
    "Fortsätt så!",
    "Bra jobbat!"
  ],
  GREAT_REP: [
    "Fantastiskt!",
    "Suveränt!",
    "Helt rätt!",
    "Mästerklass!",
    "Otroligt bra!"
  ],
  KEEP_GOING: [
    "Fortsätt!",
    "Du klarar det!",
    "Lite till!",
    "Ge inte upp!"
  ],
  TEMPO_SLOW: [
    "Sakta ner lite.",
    "Kontrollera rörelsen.",
    "Ta det lugnare."
  ],
  TEMPO_GOOD: [
    "Bra tempo!",
    "Perfekt hastighet!"
  ]
};

// Get random encouragement message
const getEncouragement = (type: keyof typeof ENCOURAGEMENT_MESSAGES): string => {
  const messages = ENCOURAGEMENT_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Exercise-specific target ROM ranges (in degrees)
const EXERCISE_ROM_TARGETS: Record<ExerciseMode, { min: number; max: number; optimal: number }> = {
  LEGS: { min: 70, max: 100, optimal: 85 },    // Knäböj - knävinkel
  LUNGE: { min: 80, max: 100, optimal: 90 },   // Utfall
  PRESS: { min: 70, max: 130, optimal: 100 },  // Press - armbågsvinkel
  PULL: { min: 60, max: 120, optimal: 90 },    // Rodd
  PUSH: { min: 80, max: 120, optimal: 100 },   // Armhävning
  CORE: { min: 0, max: 45, optimal: 30 },      // Core - bålvinkel
  STRETCH: { min: 0, max: 180, optimal: 120 }, // Stretch
  BALANCE: { min: 0, max: 30, optimal: 15 },   // Balans - stabilitet
  SHOULDER: { min: 30, max: 160, optimal: 120 }, // Axelrörlighet - flexion/abduktion
  GENERAL: { min: 60, max: 120, optimal: 90 }  // Generellt
};

// Exercise-specific pose validation rules
interface ValidationRule {
  check: (angles: Record<string, number>, landmarks: any) => { valid: boolean; issue?: string; severity?: 'warning' | 'critical' };
  description: string;
  enabled: boolean;
}

const EXERCISE_VALIDATION_RULES: Record<ExerciseMode, ValidationRule[]> = {
  LEGS: [
    {
      check: (_angles, lm) => {
        // Knee valgus check - knän går inåt
        if (!lm.lHip || !lm.rHip || !lm.lKnee || !lm.rKnee) return { valid: true };
        const hipWidth = Math.abs(lm.lHip.x - lm.rHip.x);
        const kneeWidth = Math.abs(lm.lKnee.x - lm.rKnee.x);
        if (kneeWidth < hipWidth * 0.7) {
          return { valid: false, issue: 'Knäna kollapsar inåt', severity: 'critical' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar knävalgus (inåtvridning)',
      enabled: true
    },
    {
      check: (_angles, lm) => {
        // Forward lean check - för mycket framåtlutning
        if (!lm.lShldr || !lm.lHip || !lm.lKnee) return { valid: true };
        const shoulderX = lm.lShldr.x;
        const kneeX = lm.lKnee.x;
        const lean = Math.abs(shoulderX - kneeX);
        if (lean > 0.15) {
          return { valid: false, issue: 'Luta dig inte för långt fram', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar överdriven framåtlutning',
      enabled: true
    },
    {
      check: (_angles, lm) => {
        // Heel lift check - hälarna lyfter
        if (!lm.lAnkle || !lm.lHeel || !lm.lKnee) return { valid: true };
        const ankleY = lm.lAnkle.y;
        const heelY = lm.lHeel?.y || ankleY;
        if (heelY < ankleY - 0.03) {
          return { valid: false, issue: 'Håll hälarna i golvet', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar att hälarna är i golvet',
      enabled: true
    }
  ],
  LUNGE: [
    {
      check: (_angles, lm) => {
        // Front knee over toe check
        if (!lm.lKnee || !lm.lAnkle) return { valid: true };
        const kneeX = lm.lKnee.x;
        const ankleX = lm.lAnkle.x;
        if (Math.abs(kneeX - ankleX) > 0.08) {
          return { valid: false, issue: 'Knät går för långt fram', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar knäposition i utfall',
      enabled: true
    },
    {
      check: (_angles, lm) => {
        // Torso upright check
        if (!lm.lShldr || !lm.lHip) return { valid: true };
        const shoulderX = lm.lShldr.x;
        const hipX = lm.lHip.x;
        if (Math.abs(shoulderX - hipX) > 0.12) {
          return { valid: false, issue: 'Håll ryggen upprätt', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar rak rygg i utfall',
      enabled: true
    }
  ],
  PRESS: [
    {
      check: (_angles, lm) => {
        // Elbow flare check - armbågar går för brett ut
        if (!lm.lShldr || !lm.lElbow || !lm.rShldr || !lm.rElbow) return { valid: true };
        const shoulderWidth = Math.abs(lm.lShldr.x - lm.rShldr.x);
        const elbowWidth = Math.abs(lm.lElbow.x - lm.rElbow.x);
        if (elbowWidth > shoulderWidth * 1.4) {
          return { valid: false, issue: 'För brett grepp', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar armbågsposition vid press',
      enabled: true
    },
    {
      check: (_angles, lm) => {
        // Lower back arch check
        if (!lm.lShldr || !lm.lHip) return { valid: true };
        const shoulderY = lm.lShldr.y;
        const hipY = lm.lHip.y;
        const verticalDiff = Math.abs(shoulderY - hipY);
        if (verticalDiff < 0.2) {
          return { valid: false, issue: 'Håll neutral rygg', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar ryggposition vid press',
      enabled: true
    }
  ],
  PULL: [
    {
      check: (_angles, lm) => {
        // Scapular retraction check
        if (!lm.lShldr || !lm.rShldr) return { valid: true };
        const shoulderWidth = Math.abs(lm.lShldr.x - lm.rShldr.x);
        if (shoulderWidth < 0.15) {
          return { valid: false, issue: 'Dra ihop skulderbladen', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar skulderbladsrörelse vid rodd',
      enabled: true
    }
  ],
  PUSH: [
    {
      check: (_angles, lm) => {
        // Body alignment in push-up
        if (!lm.lShldr || !lm.lHip || !lm.lAnkle) return { valid: true };
        const shoulderY = lm.lShldr.y;
        const hipY = lm.lHip.y;
        const ankleY = lm.lAnkle.y;
        const hipDeviation = Math.abs(hipY - ((shoulderY + ankleY) / 2));
        if (hipDeviation > 0.08) {
          return { valid: false, issue: hipY > shoulderY ? 'Höfterna hänger' : 'Höfterna för högt', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar kroppslinjen vid armhävning',
      enabled: true
    }
  ],
  CORE: [
    {
      check: (_angles, lm) => {
        // Plank alignment check
        if (!lm.lShldr || !lm.lHip || !lm.lAnkle) return { valid: true };
        const shoulderY = lm.lShldr.y;
        const hipY = lm.lHip.y;
        if (Math.abs(hipY - shoulderY) > 0.1) {
          return { valid: false, issue: hipY > shoulderY ? 'Lyft höfterna' : 'Sänk höfterna', severity: 'critical' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar plankposition',
      enabled: true
    }
  ],
  STRETCH: [
    {
      check: (angles, _lm) => {
        // Gentle stretch check - don't overstretch
        const leftKnee = angles.leftKnee || 180;
        if (leftKnee < 30) {
          return { valid: false, issue: 'Töj försiktigt, inte för djupt', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Varnar för övertöjning',
      enabled: true
    }
  ],
  BALANCE: [
    {
      check: (_angles, lm) => {
        // Standing leg alignment
        if (!lm.lKnee || !lm.lAnkle) return { valid: true };
        const kneeX = lm.lKnee.x;
        const ankleX = lm.lAnkle.x;
        if (Math.abs(kneeX - ankleX) > 0.05) {
          return { valid: false, issue: 'Håll knät över foten', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar stående bens alignment',
      enabled: true
    }
  ],
  SHOULDER: [
    {
      check: (_angles, lm) => {
        // Check shoulder elevation - shoulder shouldn't shrug up
        if (!lm.lShldr || !lm.rShldr || !lm.lHip || !lm.rHip) return { valid: true };
        const leftShoulderY = lm.lShldr.y;
        const rightShoulderY = lm.rShldr.y;
        const avgHipY = (lm.lHip.y + lm.rHip.y) / 2;
        const leftDist = avgHipY - leftShoulderY;
        const rightDist = avgHipY - rightShoulderY;
        // If shoulder is too close to hip (shrugged), warn
        if (leftDist < 0.15 || rightDist < 0.15) {
          return { valid: false, issue: 'Sänk axlarna', severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar att axlarna inte höjs',
      enabled: true
    },
    {
      check: (_angles, lm) => {
        // Check for asymmetry in shoulder movement
        if (!lm.lShldr || !lm.rShldr || !lm.lElbow || !lm.rElbow) return { valid: true };
        const leftArmAngle = Math.abs(lm.lElbow.y - lm.lShldr.y);
        const rightArmAngle = Math.abs(lm.rElbow.y - lm.rShldr.y);
        const diff = Math.abs(leftArmAngle - rightArmAngle);
        if (diff > 0.1) {
          const side = leftArmAngle > rightArmAngle ? 'Vänster' : 'Höger';
          return { valid: false, issue: `${side} arm rör sig mer`, severity: 'warning' as const };
        }
        return { valid: true };
      },
      description: 'Kontrollerar symmetrisk axelrörelse',
      enabled: true
    }
  ],
  GENERAL: []
};

// --- 3D MATH HELPERS ---
interface Point3D { x: number; y: number; z: number; }
interface Point2D { x: number; y: number; scale: number; }

const project = (p: Point3D, width: number, height: number, scale: number): Point2D => {
    const fov = 300;
    const cameraZ = 400;
    const factor = fov / (cameraZ + p.z);
    const x2d = p.x * factor * scale + width / 2;
    const y2d = p.y * factor * scale + height / 2;
    return { x: x2d, y: y2d, scale: factor * scale };
};

const rotateY = (p: Point3D, angle: number): Point3D => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: p.x * cos - p.z * sin,
        y: p.y,
        z: p.x * sin + p.z * cos
    };
};

// --- PROCEDURAL 3D AVATAR (THE DEMONSTRATOR) ---
const ProceduralAvatar = ({ mode }: { mode: ExerciseMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const startTime = Date.now();

        // REHAB TEMPO: 3s down, 1s hold, 1s up
        const getProgress = (time: number) => {
            const cycle = time % 5;
            if (cycle < 3) return { val: (1 - Math.cos((cycle / 3) * Math.PI)) / 2, phase: 'ECCENTRIC' };
            else if (cycle < 4) return { val: 1, phase: 'HOLD' };
            else {
                const t = cycle - 4;
                return { val: 1 - ((1 - Math.cos(t * Math.PI)) / 2), phase: 'CONCENTRIC' };
            }
        };

        const drawCylinder = (p1: Point2D, p2: Point2D, color: string, thickness: number, glow: boolean = false, isReflection = false, pulseOffset: number = 0) => {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);

            ctx.save();
            ctx.translate(p1.x, p1.y);
            ctx.rotate(angle);

            // Glow effect for active muscles
            if (glow && !isReflection) {
                ctx.shadowBlur = 25;
                ctx.shadowColor = color;
                ctx.globalAlpha = 1;
            } else if (isReflection) {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.15; // Faint reflection
                ctx.scale(1, -1);
            } else {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.9;
            }

            // Draw "Bone/Muscle" as a gradient cylinder with metallic look
            const grad = ctx.createLinearGradient(0, -thickness/2, 0, thickness/2);
            if (isReflection) {
                grad.addColorStop(0, color);
                grad.addColorStop(1, 'transparent');
            } else {
                grad.addColorStop(0, '#020617'); // Deep shadow
                grad.addColorStop(0.2, color);   // Base color
                grad.addColorStop(0.4, '#f8fafc'); // Specular highlight (Shininess)
                grad.addColorStop(0.6, color); 
                grad.addColorStop(1, '#020617');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Rounded caps
            ctx.roundRect(0, -thickness/2, len, thickness, thickness/2);
            ctx.fill();
            
            // --- NEW: MUSCLE FIBERS & BONE CORE ---
            if (!isReflection) {
                // 1. Bone Core (X-Ray look)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.roundRect(5, -thickness/6, len-10, thickness/3, thickness/6);
                ctx.fill();

                // 2. Muscle Striations (Fibers)
                if (thickness > 10) {
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                    ctx.lineWidth = 1;
                    for(let i=-thickness/2 + 3; i<thickness/2; i+=4) {
                        if (Math.abs(i) < thickness/6) continue; // Skip bone core area
                        ctx.beginPath();
                        ctx.moveTo(0, i);
                        ctx.lineTo(len, i);
                        ctx.stroke();
                    }
                    
                    // 3. Synaptic Pulse (Energy Wave)
                    if (glow) {
                        const pulseX = (pulseOffset % 1) * len;
                        const pulseGrad = ctx.createLinearGradient(pulseX-20, 0, pulseX+20, 0);
                        pulseGrad.addColorStop(0, 'transparent');
                        pulseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
                        pulseGrad.addColorStop(1, 'transparent');
                        ctx.fillStyle = pulseGrad;
                        ctx.fillRect(0, -thickness/2, len, thickness);
                    }
                    ctx.globalCompositeOperation = 'source-over';
                }

                // Joint Nodes (Mechanical look)
                ctx.beginPath();
                ctx.arc(0, 0, thickness/1.6, 0, Math.PI*2);
                const nodeGrad = ctx.createRadialGradient(0,0, 0, 0,0, thickness/1.6);
                nodeGrad.addColorStop(0, '#e2e8f0');
                nodeGrad.addColorStop(0.5, '#475569');
                nodeGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = nodeGrad;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#94a3b8'; // Outer rim
                ctx.stroke();
            }

            ctx.restore();
        };

        const renderSkeleton = (p2d: Record<string, Point2D>, width: number, height: number, time: number, progress: number, phase: string, isReflection: boolean) => {
             // MUSCLE ACTIVATION COLORS
            let legColor = isReflection ? '#475569' : '#0ea5e9'; 
            let armColor = isReflection ? '#475569' : '#0ea5e9';
            let torsoColor = isReflection ? '#64748b' : '#64748b';
            
            const activeColor = '#f59e0b'; // Magma Orange/Amber for heat
            const pulse = (Date.now() / 1000);

            if (mode === 'LEGS' || mode === 'LUNGE' || mode === 'BALANCE') {
                if (phase === 'CONCENTRIC') legColor = activeColor;
            }
            else if (mode === 'PRESS' || mode === 'PUSH') {
                if (phase === 'CONCENTRIC') armColor = activeColor;
            }
            else if (mode === 'PULL') {
                if (phase === 'CONCENTRIC') torsoColor = activeColor;
            }
            else if (mode === 'CORE') {
                // Core aktiverar båda ben och bål
                if (phase === 'HOLD') {
                    torsoColor = activeColor;
                    legColor = '#22c55e'; // Green for engaged stabilizers
                }
            }
            else if (mode === 'STRETCH') {
                // Stretch visar cyan för aktiva muskler
                legColor = '#06b6d4';
                armColor = '#06b6d4';
            }

            if (isReflection) {
                // Dim colors for reflection
                legColor = legColor === activeColor ? '#7f1d1d' : '#334155';
                armColor = armColor === activeColor ? '#7f1d1d' : '#334155';
                torsoColor = torsoColor === activeColor ? '#7f1d1d' : '#334155';
            }

            // Draw Limbs
            // Spine
            drawCylinder(p2d.neck, {x: (p2d.lHip.x+p2d.rHip.x)/2, y: (p2d.lHip.y+p2d.rHip.y)/2, scale: 1}, torsoColor, 35 * p2d.lHip.scale, mode==='PULL' && phase==='CONCENTRIC', isReflection, pulse);

            // Legs
            drawCylinder(p2d.lHip, p2d.lKnee, legColor, 28 * p2d.lKnee.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.lKnee, p2d.lAnkle, legColor, 22 * p2d.lAnkle.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rHip, p2d.rKnee, legColor, 28 * p2d.rKnee.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rKnee, p2d.rAnkle, legColor, 22 * p2d.rAnkle.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);

            // Arms
            drawCylinder(p2d.lShldr, p2d.lElbow, armColor, 20 * p2d.lElbow.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.lElbow, p2d.lHand, armColor, 16 * p2d.lHand.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rShldr, p2d.rElbow, armColor, 20 * p2d.rElbow.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rElbow, p2d.rHand, armColor, 16 * p2d.rHand.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);

            if (!isReflection) {
                // Head (Visor Style)
                ctx.beginPath();
                ctx.arc(p2d.head.x, p2d.head.y, 30 * p2d.head.scale, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                // Visor
                ctx.beginPath();
                ctx.ellipse(p2d.head.x, p2d.head.y, 25 * p2d.head.scale, 15 * p2d.head.scale, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
                ctx.fill();
            }
        };

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const time = (Date.now() - startTime) / 1000;
            const { val: progress, phase } = getProgress(time); // 0 (start) to 1 (end range)
            
            // "Living" Breath Animation (Idle movement)
            const breath = Math.sin(time * 2) * 2; 

            // Camera Rotation (Dynamic view)
            const rotAngle = Math.sin(time * 0.2) * 0.3; 

            // --- 3D SKELETON RIG ---
            const hipY = 50;
            const shoulderY = -150 + breath; // Breathing effect
            const kneeY = 250;
            const ankleY = 400;
            
            const hipW = 40;
            const shoulderW = 60;

            // Default T-Pose / Standing
            let joints: Record<string, Point3D> = {
                head: { x: 0, y: -220 + breath, z: 0 },
                neck: { x: 0, y: shoulderY, z: 0 },
                lShldr: { x: -shoulderW, y: shoulderY, z: 0 },
                rShldr: { x: shoulderW, y: shoulderY, z: 0 },
                lHip: { x: -hipW, y: hipY, z: 0 },
                rHip: { x: hipW, y: hipY, z: 0 },
                lKnee: { x: -hipW, y: kneeY, z: 0 },
                rKnee: { x: hipW, y: kneeY, z: 0 },
                lAnkle: { x: -hipW, y: ankleY, z: 0 },
                rAnkle: { x: hipW, y: ankleY, z: 0 },
                lElbow: { x: -shoulderW - 10, y: shoulderY + 100, z: 0 },
                rElbow: { x: shoulderW + 10, y: shoulderY + 100, z: 0 },
                lHand: { x: -shoulderW - 10, y: shoulderY + 200, z: 0 },
                rHand: { x: shoulderW + 10, y: shoulderY + 200, z: 0 },
            };

            // --- BIO-MECHANICAL ANIMATION LOGIC ---
            
            if (mode === 'LEGS') {
                // SQUAT MECHANICS
                const squatDepth = progress * 150;
                const hipZ = progress * 100;
                
                joints.lHip.y += squatDepth; joints.rHip.y += squatDepth;
                joints.lHip.z += hipZ; joints.rHip.z += hipZ;
                
                const kneeZ = progress * -50; 
                joints.lKnee.y += squatDepth * 0.5; joints.rKnee.y += squatDepth * 0.5;
                joints.lKnee.z += kneeZ; joints.rKnee.z += kneeZ;
                joints.lKnee.x -= progress * 15; joints.rKnee.x += progress * 15; 

                const lean = progress * 80;
                joints.neck.z += lean; joints.head.z += lean;
                joints.lShldr.z += lean; joints.rShldr.z += lean;
                joints.neck.y += squatDepth; joints.head.y += squatDepth;
                joints.lShldr.y += squatDepth; joints.rShldr.y += squatDepth;

                joints.lElbow.z -= 100 * progress; joints.rElbow.z -= 100 * progress;
                joints.lElbow.y = joints.lShldr.y + 50; joints.rElbow.y = joints.rShldr.y + 50;
                joints.lHand.z -= 180 * progress; joints.rHand.z -= 180 * progress;
                joints.lHand.y = joints.lShldr.y; joints.rHand.y = joints.rShldr.y;
            } 
            
            else if (mode === 'LUNGE') {
                // SPLIT SQUAT MECHANICS
                const depth = progress * 120;
                joints.lHip.z -= 100; joints.lKnee.z -= 100; joints.lAnkle.z -= 100;
                joints.rHip.z += 100; joints.rKnee.z += 100; joints.rAnkle.z += 180;
                joints.lHip.y += depth; joints.rHip.y += depth;
                joints.lKnee.y += depth * 0.6; joints.lKnee.z += progress * 40;
                joints.rKnee.y += depth * 0.8; joints.rKnee.z += progress * 20;
                joints.neck.y += depth; joints.head.y += depth;
                joints.lShldr.y += depth; joints.rShldr.y += depth;
            }

            else if (mode === 'PRESS') {
                // SHOULDER PRESS
                const pressHeight = progress * 180;
                const startY = shoulderY - 20;
                joints.lHand.y = startY - pressHeight;
                joints.rHand.y = startY - pressHeight;
                joints.lHand.x = joints.lShldr.x; joints.rHand.x = joints.rShldr.x; 
                joints.lElbow.y = (joints.lShldr.y + joints.lHand.y) / 2;
                joints.rElbow.y = (joints.rShldr.y + joints.rHand.y) / 2;
                joints.lElbow.x = joints.lShldr.x - 40 * (1-progress); 
                joints.rElbow.x = joints.rShldr.x + 40 * (1-progress);
            }

            else if (mode === 'PULL') {
                // BENT OVER ROW
                const hinge = 45 * (Math.PI/180);
                const pull = progress * 100;
                const torsoLength = 200;
                const zLean = Math.sin(hinge) * torsoLength;
                const yDrop = (1 - Math.cos(hinge)) * torsoLength;
                joints.neck.z += zLean; joints.head.z += zLean + 20;
                joints.neck.y += yDrop; joints.head.y += yDrop;
                joints.lShldr.z += zLean; joints.rShldr.z += zLean;
                joints.lShldr.y += yDrop; joints.rShldr.y += yDrop;
                joints.lHand.x = joints.lShldr.x; joints.rHand.x = joints.rShldr.x;
                joints.lHand.y = joints.lShldr.y + 150 - (pull * 0.8); joints.rHand.y = joints.rShldr.y + 150 - (pull * 0.8);
                joints.lElbow.z = joints.lShldr.z + pull * 1.5; joints.rElbow.z = joints.rShldr.z + pull * 1.5;
                joints.lElbow.y = joints.lShldr.y + 20; joints.rElbow.y = joints.rShldr.y + 20;
            }

            else if (mode === 'PUSH') {
                // PUSH-UP MECHANICS (Armhävning)
                const pushDepth = progress * 80;

                // Kroppen roteras horisontellt (liggande position)
                const bodyRotation = 90 * (Math.PI / 180);

                // Hela kroppen sänks och höjs
                joints.head.y = -50 + pushDepth * 0.3;
                joints.head.z = -250;
                joints.neck.y = 0 + pushDepth * 0.3;
                joints.neck.z = -200;

                // Axlarna i push-up position
                joints.lShldr = { x: -shoulderW, y: 20 + pushDepth * 0.5, z: -180 };
                joints.rShldr = { x: shoulderW, y: 20 + pushDepth * 0.5, z: -180 };

                // Armbågar böjs utåt
                joints.lElbow = { x: -shoulderW - 40, y: 80 + pushDepth, z: -100 };
                joints.rElbow = { x: shoulderW + 40, y: 80 + pushDepth, z: -100 };

                // Händer på marken
                joints.lHand = { x: -shoulderW - 20, y: 150, z: 0 };
                joints.rHand = { x: shoulderW + 20, y: 150, z: 0 };

                // Höfter och ben raka bakåt
                joints.lHip = { x: -hipW, y: 50 + pushDepth * 0.3, z: 100 };
                joints.rHip = { x: hipW, y: 50 + pushDepth * 0.3, z: 100 };
                joints.lKnee = { x: -hipW, y: 80, z: 280 };
                joints.rKnee = { x: hipW, y: 80, z: 280 };
                joints.lAnkle = { x: -hipW, y: 100, z: 450 };
                joints.rAnkle = { x: hipW, y: 100, z: 450 };
            }

            else if (mode === 'CORE') {
                // PLANK MECHANICS (Planka)
                // Horisontell position med rak kropp

                joints.head = { x: 0, y: -30, z: -280 };
                joints.neck = { x: 0, y: 0, z: -220 };

                joints.lShldr = { x: -shoulderW, y: 20, z: -180 };
                joints.rShldr = { x: shoulderW, y: 20, z: -180 };

                // Armbågar under axlar (underarmsstöd)
                joints.lElbow = { x: -shoulderW, y: 80, z: -80 };
                joints.rElbow = { x: shoulderW, y: 80, z: -80 };
                joints.lHand = { x: -shoulderW, y: 120, z: 20 };
                joints.rHand = { x: shoulderW, y: 120, z: 20 };

                // Rak linje från axlar till fötter
                const wobble = Math.sin(time * 3) * 5 * (1 - progress); // Svaj som minskar vid bra form
                joints.lHip = { x: -hipW, y: 30 + wobble, z: 80 };
                joints.rHip = { x: hipW, y: 30 + wobble, z: 80 };
                joints.lKnee = { x: -hipW, y: 50, z: 250 };
                joints.rKnee = { x: hipW, y: 50, z: 250 };
                joints.lAnkle = { x: -hipW, y: 70, z: 420 };
                joints.rAnkle = { x: hipW, y: 70, z: 420 };
            }

            else if (mode === 'BALANCE') {
                // SINGLE LEG STAND (Enbensbalans)
                const wobble = Math.sin(time * 4) * 8;
                const armBalance = Math.sin(time * 2) * 20;

                // Stående på höger ben
                joints.rHip.y = hipY;
                joints.rKnee.y = kneeY;
                joints.rAnkle.y = ankleY;

                // Vänster ben lyft
                joints.lHip.y = hipY - 30;
                joints.lHip.z = -50;
                joints.lKnee = { x: -hipW - 10, y: hipY + 50, z: -80 };
                joints.lAnkle = { x: -hipW - 20, y: hipY + 120, z: -60 };

                // Kroppen svajar lite
                joints.neck.x = wobble * 0.3;
                joints.head.x = wobble * 0.5;

                // Armarna balanserar
                joints.lElbow = { x: -shoulderW - 30, y: shoulderY + 30 + armBalance, z: 20 };
                joints.rElbow = { x: shoulderW + 30, y: shoulderY + 30 - armBalance, z: 20 };
                joints.lHand = { x: -shoulderW - 60, y: shoulderY + armBalance * 1.5, z: 40 };
                joints.rHand = { x: shoulderW + 60, y: shoulderY - armBalance * 1.5, z: 40 };
            }

            else if (mode === 'STRETCH') {
                // FORWARD FOLD STRETCH (Framåtböjning)
                const stretchDepth = progress * 150;

                // Överkroppen böjs framåt
                const bendAngle = progress * 90 * (Math.PI / 180);
                const torsoLen = 200;

                joints.neck.z = Math.sin(bendAngle) * torsoLen;
                joints.neck.y = shoulderY + (1 - Math.cos(bendAngle)) * torsoLen;
                joints.head.z = joints.neck.z + 40;
                joints.head.y = joints.neck.y + 20;

                joints.lShldr.z = joints.neck.z - 20;
                joints.rShldr.z = joints.neck.z - 20;
                joints.lShldr.y = joints.neck.y;
                joints.rShldr.y = joints.neck.y;

                // Armarna hänger ner mot golvet
                joints.lElbow = { x: -shoulderW, y: joints.lShldr.y + 100, z: joints.lShldr.z + 50 };
                joints.rElbow = { x: shoulderW, y: joints.rShldr.y + 100, z: joints.rShldr.z + 50 };
                joints.lHand = { x: -shoulderW + 10, y: joints.lElbow.y + 80, z: joints.lElbow.z + 30 };
                joints.rHand = { x: shoulderW - 10, y: joints.rElbow.y + 80, z: joints.rElbow.z + 30 };

                // Benen raka
                joints.lKnee.y = kneeY - progress * 20;
                joints.rKnee.y = kneeY - progress * 20;
            }

            // --- RENDERING PIPELINE ---
            ctx.clearRect(0, 0, width, height);
            
            // 1. Draw Background Grid (Floor)
            const gridZOffset = (time * 50) % 200;
            
            // Horizon/Floor Fade
            const gradient = ctx.createLinearGradient(0, height/2, 0, height);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, height/2, width, height/2);

            // Moving Floor Lines
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
            ctx.beginPath();
            for(let z = -200; z < 1000; z+=200) {
                const zPos = z - gridZOffset;
                if (zPos < -300) continue; 
                const p1 = project(rotateY({x: -800, y: 500, z: zPos}, rotAngle), width, height, 1);
                const p2 = project(rotateY({x: 800, y: 500, z: zPos}, rotAngle), width, height, 1);
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            }
            // Vertical Grid Lines
            for(let x = -600; x <= 600; x+=200) {
                const p1 = project(rotateY({x: x, y: 500, z: -200}, rotAngle), width, height, 1);
                const p2 = project(rotateY({x: x, y: 500, z: 800}, rotAngle), width, height, 1);
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            }
            ctx.stroke();
            
            // Floor Ripples (Impact)
            if (phase === 'CONCENTRIC') {
                const rippleSize = (progress * 100) % 100;
                const p = project(rotateY({x: 0, y: 500, z: 0}, rotAngle), width, height, 1);
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, rippleSize*3, rippleSize, 0, 0, Math.PI*2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${1-progress})`;
                ctx.stroke();
            }

            // 2. Project and Sort Joints
            const p2d: Record<string, Point2D> = {};
            // Reflection joints
            const p2dReflect: Record<string, Point2D> = {};
            
            for (const [key, p3d] of Object.entries(joints)) {
                p2d[key] = project(rotateY(p3d, rotAngle), width, height, 1);
                // Reflection points (inverted Y relative to floor)
                const floorY = 500;
                const dy = floorY - p3d.y;
                p2dReflect[key] = project(rotateY({ ...p3d, y: floorY + dy }, rotAngle), width, height, 1);
            }

            // 3. Draw Reflection (First, so it's behind)
            renderSkeleton(p2dReflect, width, height, time, progress, phase, true);

            // 4. Draw Main Body
            renderSkeleton(p2d, width, height, time, progress, phase, false);

            // Phase Text
            ctx.font = "bold 14px monospace";
            ctx.fillStyle = phase === 'CONCENTRIC' ? '#f59e0b' : phase === 'HOLD' ? '#22c55e' : '#3b82f6';
            ctx.fillText(phase, 20, height - 20);

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mode]);

    return <canvas ref={canvasRef} width={600} height={800} className="w-full h-full object-cover" />;
};

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string;
}

const AIMovementCoach: React.FC<AIMovementCoachProps> = ({ exerciseName, videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaPipeModulesRef = useRef<MediaPipeModules | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoadingML, setIsLoadingML] = useState(true);

  // Calibration State
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationCounter, setCalibrationCounter] = useState(0);
  const [targetMetrics, setTargetMetrics] = useState<{shoulderY: number, hipY: number}>({shoulderY: 0, hipY: 0});

  // NEW: Countdown and Control States
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true); // Default mirrored for natural feel

  // HUD State
  const [feedback, setFeedback] = useState("Väntar på kamera...");
  const [reps, setReps] = useState(0);
  const [activeIssues, setActiveIssues] = useState<string[]>([]);
  const [formScore, setFormScore] = useState(100);
  const [velocity, setVelocity] = useState(0); // For velocity bar

  const [motionState, setMotionState] = useState<'START' | 'ECCENTRIC' | 'TURN' | 'CONCENTRIC'>('START');
  const [isMuted, setIsMuted] = useState(false);

  // Avatar Gender Selection (persisted to localStorage)
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('avatarGender') as 'male' | 'female') || 'male';
    }
    return 'male';
  });

  // Save gender preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avatarGender', avatarGender);
    }
  }, [avatarGender]);

  // NEW: Integrated Services State
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [currentRepScore, setCurrentRepScore] = useState<RepScore | null>(null);
  const [sessionScores, setSessionScores] = useState<RepScore[]>([]);
  const [currentPhase, setCurrentPhase] = useState<RepPhase | null>(null);
  const [repProgress, setRepProgress] = useState(0);
  const [formIssues, setFormIssues] = useState<FormIssue[]>([]);
  const [symmetryScore, setSymmetryScore] = useState(100);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  // Initialize services (memoized to prevent recreating on each render)
  const poseReconstructor = useMemo(() => getPoseReconstructor(), []);
  const repScoringService = useMemo(() => {
    const service = new RepScoringService(exerciseName);
    return service;
  }, [exerciseName]);
  const calibrationService = useMemo(() => getCalibrationService(), []);

  // Bilateral Asymmetry Detection
  const [asymmetry, setAsymmetry] = useState<{detected: boolean, side: 'left' | 'right' | null, percentage: number}>({
    detected: false, side: null, percentage: 0
  });

  // ROM (Range of Motion) Tracking
  const [romData, setRomData] = useState<{minAngle: number, maxAngle: number, currentROM: number}>({
    minAngle: 180, maxAngle: 0, currentROM: 0
  });
  const sessionRomHistory = useRef<number[]>([]);

  // Session Analytics & Performance Tracking
  const [sessionAnalytics, setSessionAnalytics] = useState({
    repQualityTrend: [] as number[],  // Track quality score for each rep
    avgRepDuration: 0,
    totalActiveTime: 0,
    peakFormScore: 0,
    consistencyScore: 100,
    improvementRate: 0
  });
  const repTimestamps = useRef<number[]>([]);
  const qualityHistory = useRef<number[]>([]);

  // FAS 10: Emotionell AI-Coach State
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('NEUTRAL');
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [showEmotionalIndicator, setShowEmotionalIndicator] = useState(true);
  const lastBreakSuggestionTime = useRef(0);

  const lastSpoke = useRef(0);
  const lastMessage = useRef('');
  const lastPrioritySpoke = useRef(0);
  const lastRepTime = useRef(Date.now());
  const landmarkHistory = useRef<any[]>([]); // Store history for trails
  const particles = useRef<Particle[]>([]); // Store particles for rewards
  const torqueRotation = useRef(0); // For spinning rings

  const exerciseMode: ExerciseMode = useMemo(() => {
      const name = exerciseName.toLowerCase();
      // Prioritera specifika matchningar först - mer specifika mönster först

      // LUNGE - utfall och varianter
      if (name.match(/utfall|lunge|split.?squat|bulgarian|step.?up/)) return 'LUNGE';

      // CORE - mage, rygg, bål
      if (name.match(/planka|plank|core|mage|bål|crunch|sit.?up|dead.?bug|bird.?dog|cat.?cow|kattko/)) return 'CORE';

      // STRETCH - töjning, rörlighet
      if (name.match(/stretch|töj|mjukgör|böj.*fram|nacke.*stretch|hip.*flexor|piriformis|hamstring.*stretch/)) return 'STRETCH';

      // PUSH - tryckövningar
      if (name.match(/armhävning|push.?up|dipp|chest.*press|bänkpress/)) return 'PUSH';

      // BALANCE - balansövningar
      if (name.match(/balans|balance|enben|stå.*på.*ett|tandem|single.*leg.*stand/)) return 'BALANCE';

      // SHOULDER - axelövningar och rörlighet
      if (name.match(/axel|shoulder|skulder|rotator|rotations?cuff|abduktion|abduction|elevation|flexion.*axel|pendel|codman/)) return 'SHOULDER';

      // LEGS - benövningar (efter shoulder för att undvika falska positiver)
      if (name.match(/knäböj|squat|knä.*extension|leg.*press|hopp|wadlyft|calf|häl|hip.*thrust|glute.*bridge|höft.*lyft|höftbrygga/)) return 'LEGS';

      // PRESS - övriga tryckövningar för överkropp
      if (name.match(/press|lyft.*hantel|overhead|military|triceps.*ext/)) return 'PRESS';

      // PULL - dragövningar
      if (name.match(/rodd|row|curl|biceps|drag|pulldown|pull.?up|lat|latissimus/)) return 'PULL';

      // GENERAL som fallback
      return 'GENERAL';
  }, [exerciseName]);
  
  // FAS 9: Refs för att spåra senaste tal per prioritet
  const lastSpokeByPriority = useRef<Record<FeedbackPriority, number>>({
    critical: 0,
    corrective: 0,
    encouragement: 0
  });

  // FAS 9: Förbättrad speak-funktion med tre prioritetsnivåer
  // critical: 2s debounce (knävalgus, smärta)
  // corrective: 4s debounce (tempo, formfel)
  // encouragement: 8s debounce (uppmuntran)
  // FAS 10: Nu med emotionell anpassning
  const speak = useCallback((
    text: string,
    priority: FeedbackPriority | boolean = 'encouragement',
    context?: { isCorrection?: boolean; isEncouragement?: boolean; isMilestone?: boolean }
  ) => {
      if (isMuted) return;
      const now = Date.now();

      // Konvertera gammal boolean-API till ny prioritet för bakåtkompatibilitet
      const actualPriority: FeedbackPriority =
        priority === true ? 'critical' :
        priority === false ? 'encouragement' :
        priority;

      // FAS 10: Anpassa meddelande baserat på emotionellt tillstånd
      let adaptedText = text;
      if (context) {
        adaptedText = emotionalIntelligenceService.getAdaptedMessage(text, context);
      }

      // Normalisera text för jämförelse (ta bort siffror för rep-räkning)
      const normalizedText = adaptedText.replace(/^\d+\.\s*/, '').trim().toLowerCase();

      // Förhindra upprepning av samma meddelande baserat på prioritet
      const debounceTime = DEBOUNCE_BY_PRIORITY[actualPriority];
      if (normalizedText === lastMessage.current && now - lastSpoke.current < debounceTime) {
        return;
      }

      // Debounce baserat på prioritet
      const lastTime = lastSpokeByPriority.current[actualPriority];
      if (now - lastTime < debounceTime) return;

      // Använd speechService (stöder ElevenLabs om konfigurerat)
      speechService.speak(adaptedText).catch(err => {
        console.warn('[AIMovementCoach] Speech error:', err);
      });

      // Uppdatera timestamps
      lastSpoke.current = now;
      lastMessage.current = normalizedText;
      lastSpokeByPriority.current[actualPriority] = now;

      // Också uppdatera legacy refs för bakåtkompatibilitet
      if (actualPriority === 'critical') {
        lastPrioritySpoke.current = now;
      }
  }, [isMuted]);

  // Countdown timer effect - handles 3-2-1 countdown after calibration
  useEffect(() => {
    if (!countdownActive) return;

    if (countdownValue > 0) {
      speak(countdownValue.toString(), true);
      const timer = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start tracking
      setCountdownActive(false);
      setIsCalibrated(true);
      speak("Kör!", true);
    }
  }, [countdownActive, countdownValue, speak]);

  // Toggle pause/resume functionality
  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      if (prev) {
        speak("Fortsätt!", true);
      } else {
        speak("Pausad", true);
      }
      return !prev;
    });
  }, [speak]);

  // Helper to get angle from 3D joint angles (provided by PoseReconstructor)
  // Falls back to 0 if angle not available
  const getAngle3D = (jointAngles: Record<string, JointAngle3D>, jointName: string): number => {
    return jointAngles[jointName]?.angle ?? 0;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
      for(let i=0; i<20; i++) {
          particles.current.push({
              x, y,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              life: 1.0,
              color
          });
      }
  };

  // --- BILATERAL ASYMMETRY DETECTION ---
  // Uses 3D angles from PoseReconstructor instead of 2D calculations
  const checkAsymmetry = (jointAngles: Record<string, JointAngle3D>) => {
      let leftAngle = 0, rightAngle = 0;

      if (exerciseMode === 'LEGS' || exerciseMode === 'LUNGE') {
          leftAngle = getAngle3D(jointAngles, 'leftKnee');
          rightAngle = getAngle3D(jointAngles, 'rightKnee');
      } else if (exerciseMode === 'PRESS' || exerciseMode === 'PULL' || exerciseMode === 'PUSH') {
          leftAngle = getAngle3D(jointAngles, 'leftElbow');
          rightAngle = getAngle3D(jointAngles, 'rightElbow');
      }

      const diff = Math.abs(leftAngle - rightAngle);
      const avgAngle = (leftAngle + rightAngle) / 2;
      const asymmetryPercent = avgAngle > 0 ? (diff / avgAngle) * 100 : 0;

      // Detektera asymmetri om skillnaden är > 15%
      if (asymmetryPercent > 15 && avgAngle > 20) {
          const dominantSide = leftAngle > rightAngle ? 'left' : 'right';
          setAsymmetry({ detected: true, side: dominantSide, percentage: Math.round(asymmetryPercent) });
          return {
              detected: true,
              side: dominantSide,
              message: dominantSide === 'left'
                  ? `Vänster sida kompenserar (${Math.round(asymmetryPercent)}%)`
                  : `Höger sida kompenserar (${Math.round(asymmetryPercent)}%)`
          };
      } else {
          setAsymmetry({ detected: false, side: null, percentage: 0 });
          return { detected: false, side: null, message: null };
      }
  };

  // --- ROM (RANGE OF MOTION) TRACKING ---
  const updateROM = (currentAngle: number) => {
      if (currentAngle <= 0 || currentAngle > 180) return;

      setRomData(prev => {
          const newMin = Math.min(prev.minAngle, currentAngle);
          const newMax = Math.max(prev.maxAngle, currentAngle);
          const newROM = newMax - newMin;

          return {
              minAngle: newMin,
              maxAngle: newMax,
              currentROM: newROM
          };
      });
  };

  const saveRepROM = () => {
      // Spara ROM för varje rep
      if (romData.currentROM > 10) {
          sessionRomHistory.current.push(romData.currentROM);
      }
      // Återställ för nästa rep
      setRomData({ minAngle: 180, maxAngle: 0, currentROM: 0 });
  };

  const getAverageROM = () => {
      if (sessionRomHistory.current.length === 0) return 0;
      const sum = sessionRomHistory.current.reduce((a, b) => a + b, 0);
      return Math.round(sum / sessionRomHistory.current.length);
  };

  // --- AR EXOSUIT RENDERER ---
  const drawExosuitLimb = (ctx: CanvasRenderingContext2D, start: any, end: any, width: number, height: number, color: string, thickness: number = 20) => {
      if (!start || !end) return;
      const x1 = start.x * width; const y1 = start.y * height;
      const x2 = end.x * width; const y2 = end.y * height;
      
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const len = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
      
      ctx.save();
      ctx.translate(x1, y1);
      ctx.rotate(angle);
      
      // Draw Tech Bracket (Armor Plate)
      const pad = 10;
      const w = thickness;
      
      // Heatmap Color Transition (Blue -> Orange based on motion state)
      const isHot = color.includes('245'); // Check if Amber/Orange
      const fillStyle = isHot 
        ? 'rgba(245, 158, 11, 0.2)' 
        : 'rgba(6, 182, 212, 0.15)';

      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.rect(pad, -w/2, len - pad*2, w);
      ctx.fill();
      
      // Tech Mesh Pattern
      ctx.strokeStyle = isHot ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=pad; i<len-pad; i+=15) {
          ctx.moveTo(i, -w/2); ctx.lineTo(i+5, w/2);
      }
      ctx.stroke();

      // Borders (Brackets)
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      // Top bracket
      ctx.beginPath();
      ctx.moveTo(pad, -w/2 + 5); ctx.lineTo(pad, -w/2); ctx.lineTo(len-pad, -w/2); ctx.lineTo(len-pad, -w/2 + 5);
      ctx.stroke();
      
      // Bottom bracket
      ctx.beginPath();
      ctx.moveTo(pad, w/2 - 5); ctx.lineTo(pad, w/2); ctx.lineTo(len-pad, w/2); ctx.lineTo(len-pad, w/2 - 5);
      ctx.stroke();
      
      // Center Glow Line
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(pad, 0); ctx.lineTo(len-pad, 0); ctx.stroke();

      ctx.restore();
  };

  // --- NEW: AR JOINT TURBINE ---
  const drawJointTurbine = (ctx: CanvasRenderingContext2D, point: any, width: number, height: number, speed: number, color: string) => {
      const cx = point.x * width;
      const cy = point.y * height;
      const r = 25;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(torqueRotation.current * speed); // Spin based on global time * local speed
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Draw 3 blades
      for(let i=0; i<3; i++) {
          ctx.rotate(Math.PI * 2 / 3);
          ctx.moveTo(10, 0);
          ctx.arc(0, 0, r, -0.2, 0.2);
          ctx.lineTo(10, 0);
      }
      ctx.stroke();
      
      // Center hub
      ctx.beginPath(); ctx.arc(0,0, 5, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill();
      
      // Outer Ring
      ctx.beginPath(); ctx.arc(0,0, r + 5, 0, Math.PI*2); 
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();

      ctx.restore();
  };

  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current || !results.poseLandmarks) return;

    // Skip processing if paused (still render video but don't track)
    if (isPaused && isCalibrated) {
      // Still draw video feed when paused
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasCtx.restore();
      }
      return;
    }

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // Draw user video with sci-fi filter
    canvasCtx.drawImage(results.image, 0, 0, width, height);
    canvasCtx.fillStyle = 'rgba(2, 6, 23, 0.4)'; 
    canvasCtx.fillRect(0, 0, width, height);

    // Apply "Scan Lines"
    canvasCtx.fillStyle = 'rgba(34, 211, 238, 0.03)';
    for(let i=0; i<height; i+=3) canvasCtx.fillRect(0, i, width, 1);

    const lm = results.poseLandmarks;

    // Helper function to check landmark visibility
    const isLandmarkVisible = (landmark: any, threshold = 0.5): boolean => {
      return landmark && (landmark.visibility === undefined || landmark.visibility > threshold);
    };

    // UPDATE HISTORY BUFFER (For Motion Trails & Velocity)
    if (landmarkHistory.current.length > 15) landmarkHistory.current.shift();
    landmarkHistory.current.push(lm);

    const lShldr = lm[11]; const rShldr = lm[12];
    const lHip = lm[23]; const rHip = lm[24];
    const lKnee = lm[25]; const rKnee = lm[26];
    const lAnkle = lm[27]; const rAnkle = lm[28];
    const lElbow = lm[13]; const rElbow = lm[14];
    const lWrist = lm[15]; const rWrist = lm[16];

    // Validate essential landmarks visibility before processing
    const essentialLandmarksVisible =
      isLandmarkVisible(lShldr) && isLandmarkVisible(rShldr) &&
      isLandmarkVisible(lHip) && isLandmarkVisible(rHip);

    // For leg exercises, also check lower body visibility
    const lowerBodyVisible =
      isLandmarkVisible(lKnee) && isLandmarkVisible(rKnee) &&
      isLandmarkVisible(lAnkle) && isLandmarkVisible(rAnkle);

    let skeletonColor = 'rgba(6, 182, 212, 1)'; // Cyan default
    let feedbackMsg = feedback;
    let issues: string[] = [];
    let jointHighlights: {x: number, y: number, color: string}[] = [];
    let angleGauges: {center: any, angle: number, targetStart: number, targetEnd: number, optimal?: number}[] = [];
    let stabilityShake = 0;

    // CALCULATE VERTICAL VELOCITY (for AR Gauge & Torque)
    let currentVel = 0;
    if (landmarkHistory.current.length > 2 && lHip) {
        const prevY = landmarkHistory.current[landmarkHistory.current.length - 2][23].y;
        currentVel = (lHip.y - prevY) * 100; // Scaled velocity
    }
    setVelocity(currentVel);
    torqueRotation.current += 0.05 + Math.abs(currentVel) * 0.2; // Spin faster when moving

    // --- CALIBRATION PHASE (Using CalibrationService) ---
    if (!isCalibrated) {
        // Convert landmarks to PoseLandmark format for CalibrationService
        const poseLandmarksForCalib: PoseLandmark[] = lm.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z || 0,
          visibility: landmark.visibility || 0,
        }));

        // Start calibration if not already started
        if (!calibrationService.isCalibrationInProgress()) {
          calibrationService.startCalibration();
        }

        // Add frame to calibration
        const progress = calibrationService.addFrame(poseLandmarksForCalib);

        if (progress !== null) {
          setCalibrationProgress(progress);
          setCalibrationCounter(Math.round(progress * 100));

          if (progress < 1) {
            feedbackMsg = "Stå stilla...";
            // Draw calibration overlay
            canvasCtx.beginPath();
            canvasCtx.rect(width * 0.2, height * 0.1, width * 0.6, height * 0.8);
            canvasCtx.strokeStyle = `rgba(34, 211, 238, ${progress})`;
            canvasCtx.lineWidth = 4;
            canvasCtx.stroke();

            // Draw body outline guide
            canvasCtx.setLineDash([5, 5]);
            canvasCtx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
            canvasCtx.beginPath();
            // Head
            canvasCtx.ellipse(width * 0.5, height * 0.15, width * 0.06, height * 0.08, 0, 0, Math.PI * 2);
            canvasCtx.stroke();
            // Body
            canvasCtx.beginPath();
            canvasCtx.moveTo(width * 0.42, height * 0.23);
            canvasCtx.lineTo(width * 0.58, height * 0.23);
            canvasCtx.lineTo(width * 0.55, height * 0.55);
            canvasCtx.lineTo(width * 0.45, height * 0.55);
            canvasCtx.closePath();
            canvasCtx.stroke();
            canvasCtx.setLineDash([]);
          } else {
            // Calibration complete!
            const calibData = calibrationService.getCalibrationData();
            if (calibData) {
              setTargetMetrics({
                shoulderY: (lShldr.y + rShldr.y) / 2,
                hipY: (lHip.y + rHip.y) / 2
              });
              // Save calibration for future sessions
              storageService.saveCalibration(calibData);
            }
            setCalibrationProgress(1);
            // Start countdown instead of immediately calibrating
            setCountdownActive(true);
            setCountdownValue(3);
            speak("Kalibrering klar. Gör dig redo!");
          }
        } else {
          feedbackMsg = "Se till att hela kroppen syns";
          // Reset if calibration was interrupted
          if (calibrationService.isCalibrationInProgress()) {
            calibrationService.reset();
          }
          setCalibrationCounter(0);
          setCalibrationProgress(0);
        }
    } else {
        // === VISIBILITY VALIDATION ===
        // Check if essential landmarks are visible before analysis
        let skipAnalysis = false;

        if (!essentialLandmarksVisible) {
          feedbackMsg = "Se till att överkroppen är synlig";
          skeletonColor = 'rgba(239, 68, 68, 0.7)'; // Red warning
          skipAnalysis = true;
        }

        // For leg exercises, validate lower body visibility
        const isLegExercise = exerciseMode === 'LEGS' || exerciseMode === 'LUNGE' || exerciseMode === 'BALANCE';
        if (!skipAnalysis && isLegExercise && !lowerBodyVisible) {
          feedbackMsg = "Se till att benen syns i bild";
          skeletonColor = 'rgba(249, 115, 22, 0.7)'; // Orange warning
          skipAnalysis = true;
        }

        // Only run analysis if landmarks are properly visible
        if (!skipAnalysis) {
        // === INTEGRATED SERVICES: 3D Pose Analysis ===
        // Convert landmarks to PoseLandmark format for services
        const poseLandmarks: PoseLandmark[] = lm.map((landmark: any) => ({
          x: landmark.x,
          y: landmark.y,
          z: landmark.z || 0,
          visibility: landmark.visibility || 0,
        }));

        // Calculate 3D joint angles using PoseReconstructor
        const jointAngles3D = poseReconstructor.calculateJointAngles(poseLandmarks);

        // Calculate symmetry score
        const currentSymmetry = poseReconstructor.calculateSymmetry(jointAngles3D);
        setSymmetryScore(Math.round(currentSymmetry));

        // FAS 9: Detect compensation patterns
        const exerciseCat = getExerciseCategory(exerciseName);
        const compensations = detectCompensations(poseLandmarks, jointAngles3D, exerciseCat);

        // If severe compensations detected, give immediate feedback
        if (compensations.length > 0) {
          const topCompensations = getTopCompensations(compensations, 1);
          const severeComp = topCompensations.find(c => c.severity === 'severe');
          if (severeComp) {
            speak(severeComp.correction, 'critical', { isCorrection: true });
          }
        }

        // FAS 10: Update Emotional Intelligence with pose data
        emotionalIntelligenceService.updatePose(poseLandmarks);

        // FAS 10: Periodically analyze emotional state and check for break suggestions
        const emotionalResult = emotionalIntelligenceService.analyzeEmotionalState();
        if (emotionalResult.primaryState !== emotionalState) {
          setEmotionalState(emotionalResult.primaryState);
          setEmotionalAnalysis(emotionalResult);
        }

        // FAS 10: Check if break should be suggested (max once per 2 minutes)
        const now = Date.now();
        if (now - lastBreakSuggestionTime.current > 120000) {
          const breakCheck = emotionalIntelligenceService.shouldSuggestBreak();
          if (breakCheck.suggest) {
            speak(breakCheck.reason, 'corrective', { isEncouragement: true });
            lastBreakSuggestionTime.current = now;
          }
        }

        // Process frame through RepScoringService
        const scoringFeedback = repScoringService.processFrame(jointAngles3D, currentSymmetry, Date.now());

        // Update rep-related state from service
        const completedReps = repScoringService.getCompletedReps();
        const servicePhase = repScoringService.getCurrentPhase();
        const serviceProgress = repScoringService.getRepProgress();

        if (completedReps.length > sessionScores.length) {
          // New rep completed!
          const newScore = completedReps[completedReps.length - 1];
          setSessionScores([...completedReps]);
          setCurrentRepScore(newScore);
          setReps(completedReps.length);

          // FAS 10: Record rep completion for emotional tracking
          const repSuccess = newScore.overall >= 60;
          emotionalIntelligenceService.recordRep(repSuccess);

          // Speak rep count with encouragement based on score
          // FAS 10: Now with emotional context
          const repNum = completedReps.length;
          if (newScore.overall >= 90) {
            speak(`${repNum}. ${getEncouragement('GREAT_REP')}`, true, { isEncouragement: true });
            // Extra celebration for great reps
            if (lHip) {
              spawnParticles(lHip.x * width, lHip.y * height, '#22c55e');
              spawnParticles(lHip.x * width - 50, lHip.y * height, '#fbbf24');
              spawnParticles(lHip.x * width + 50, lHip.y * height, '#22c55e');
            }
          } else if (newScore.overall >= 70) {
            speak(`${repNum}. ${getEncouragement('GOOD_REP')}`, true, { isEncouragement: true });
            if (lHip) {
              spawnParticles(lHip.x * width, lHip.y * height, '#22c55e');
            }
          } else {
            speak(repNum.toString(), true);
          }

          // Milestone encouragement at specific rep counts
          // FAS 10: With milestone context for emotional adaptation
          if (repNum === 5 || repNum === 10 || repNum === 15 || repNum === 20) {
            setTimeout(() => speak(getEncouragement('KEEP_GOING'), false, { isMilestone: true }), 1500);
          }

          // Update Session Analytics
          const currentTime = Date.now();
          repTimestamps.current.push(currentTime);
          qualityHistory.current.push(newScore.overall);

          // Calculate average rep duration (time between reps)
          let avgDuration = 0;
          if (repTimestamps.current.length > 1) {
            const durations = repTimestamps.current.slice(1).map((time, idx) =>
              time - repTimestamps.current[idx]
            );
            avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length / 1000; // in seconds
          }

          // Calculate consistency score (lower variance = higher consistency)
          let consistency = 100;
          if (qualityHistory.current.length >= 3) {
            const recentScores = qualityHistory.current.slice(-5);
            const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
            const variance = recentScores.reduce((sum, score) =>
              sum + Math.pow(score - avg, 2), 0) / recentScores.length;
            const stdDev = Math.sqrt(variance);
            consistency = Math.max(0, Math.min(100, 100 - stdDev * 2));
          }

          // Calculate improvement rate (comparing first half to second half)
          let improvementRate = 0;
          if (qualityHistory.current.length >= 6) {
            const midpoint = Math.floor(qualityHistory.current.length / 2);
            const firstHalf = qualityHistory.current.slice(0, midpoint);
            const secondHalf = qualityHistory.current.slice(midpoint);
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            improvementRate = ((secondAvg - firstAvg) / firstAvg) * 100;
          }

          // Update peak form score
          const peakScore = Math.max(formScore, sessionAnalytics.peakFormScore);

          setSessionAnalytics({
            repQualityTrend: [...qualityHistory.current],
            avgRepDuration: avgDuration,
            totalActiveTime: (currentTime - sessionStartTime) / 1000,
            peakFormScore: peakScore,
            consistencyScore: Math.round(consistency),
            improvementRate: Math.round(improvementRate)
          });
        }

        // Update phase and progress
        if (servicePhase) {
          setCurrentPhase(servicePhase);
          setMotionState(servicePhase === 'COMPENSATING' ? 'START' : servicePhase);
        }
        setRepProgress(serviceProgress);

        // Get real-time form feedback
        const realtimeFeedback = repScoringService.getRealtimeFeedback(jointAngles3D, currentSymmetry);
        if (realtimeFeedback) {
          setFormIssues(repScoringService.getCompletedReps().flatMap(r => r.issues).slice(-5));
          if (realtimeFeedback.priority === 'critical') {
            speak(realtimeFeedback.text, true);
          }
        }

        // === END INTEGRATED SERVICES ===
        // --- CLINICAL ANALYSIS ENGINE ---
        // Now uses 3D angles from jointAngles3D instead of 2D calculateAngle
        let mainAngle = 0;

        if ((exerciseMode === 'LEGS' || exerciseMode === 'LUNGE') && lHip && lKnee && lAnkle) {
            // Use 3D knee angle from PoseReconstructor
            mainAngle = getAngle3D(jointAngles3D, 'leftKnee');

            // ROM TRACKING: Uppdatera min/max vinkel
            updateROM(mainAngle);

            // ASYMMETRY CHECK: Kontrollera bilateral obalans (using 3D angles)
            const asymmetryResult = checkAsymmetry(jointAngles3D);
            if (asymmetryResult.detected && asymmetryResult.message) {
                issues.push(asymmetryResult.message);
                // Highlighta den kompenserande sidan
                if (asymmetryResult.side === 'left') {
                    jointHighlights.push({ x: lKnee.x, y: lKnee.y, color: '#f97316' }); // Orange
                } else {
                    jointHighlights.push({ x: rKnee.x, y: rKnee.y, color: '#f97316' });
                }
            }

            // EXERCISE-SPECIFIC VALIDATION: Kör övningsspecifika valideringsregler
            const validationRules = EXERCISE_VALIDATION_RULES[exerciseMode] || [];
            const landmarkMap = { lHip, rHip, lKnee, rKnee, lAnkle, rAnkle, lShldr, rShldr, lElbow, rElbow, lWrist, rWrist, lHeel: results.poseLandmarks?.[29], rHeel: results.poseLandmarks?.[30] };
            const angleMap: Record<string, number> = {};
            Object.entries(jointAngles3D).forEach(([key, val]) => { angleMap[key] = val.angle; });

            for (const rule of validationRules) {
              if (!rule.enabled) continue;
              const result = rule.check(angleMap, landmarkMap);
              if (!result.valid && result.issue) {
                issues.push(result.issue);
                // Highlight based on severity
                const color = result.severity === 'critical' ? '#ef4444' : '#f59e0b';
                if (lKnee && result.issue.toLowerCase().includes('knä')) {
                  jointHighlights.push({ x: lKnee.x, y: lKnee.y, color });
                  jointHighlights.push({ x: rKnee.x, y: rKnee.y, color });
                }
                if (result.severity === 'critical') {
                  speak(result.issue, true);
                }
              }
            }

            // 1. ANGLE GAUGE WITH TARGET ZONE (using exercise-specific ROM targets)
            const romTarget = EXERCISE_ROM_TARGETS[exerciseMode] || EXERCISE_ROM_TARGETS.GENERAL;
            angleGauges.push({
              center: lKnee,
              angle: mainAngle,
              targetStart: romTarget.min,
              targetEnd: romTarget.max,
              optimal: romTarget.optimal
            });

            // 2. HOLOGRAPHIC TARGET LINE
            const targetY = lKnee.y * height;
            const currentHipY = lHip.y * height;

            canvasCtx.beginPath();
            canvasCtx.moveTo(width * 0.2, targetY);
            canvasCtx.lineTo(width * 0.8, targetY);
            canvasCtx.lineWidth = 4;
            canvasCtx.strokeStyle = currentHipY > targetY ? '#22c55e' : 'rgba(255,255,255,0.3)'; // Green if passed
            canvasCtx.setLineDash([10, 10]);
            canvasCtx.stroke();
            canvasCtx.setLineDash([]);

            // Label
            canvasCtx.fillStyle = '#fff';
            canvasCtx.font = "bold 14px monospace";
            canvasCtx.fillText("MÅLDJUP", width * 0.82, targetY);

            // VALGUS CHECK - FAS 9: Använder 'critical' prioritet för säkerhet
            if (mainAngle < 140) {
                const hipWidth = Math.abs(lHip.x - rHip.x);
                const kneeWidth = Math.abs(lKnee.x - rKnee.x);
                if (kneeWidth < hipWidth * 0.75) {
                    issues.push("Inåtvinkling");
                    jointHighlights.push({ x: lKnee.x, y: lKnee.y, color: '#ef4444' });
                    jointHighlights.push({ x: rKnee.x, y: rKnee.y, color: '#ef4444' });
                    speak("Pressa ut knäna!", 'critical');
                    setFormScore(s => Math.max(0, s - 0.5));
                }
            }

            // STATE MACHINE & SPEED CHECK
            if (motionState === 'START') {
                if (mainAngle < 160) {
                    setMotionState('ECCENTRIC');
                    lastRepTime.current = Date.now();
                    feedbackMsg = "Bromsa...";
                } else feedbackMsg = "Stå upprätt";
            } else if (motionState === 'ECCENTRIC') {
                // FAS 9: REALTIDS-TEMPO FEEDBACK under nedgång
                // Beräkna progress: 0% = start (160°), 100% = botten (100°)
                const eccentricProgress = Math.min(100, Math.max(0,
                  ((160 - mainAngle) / (160 - 100)) * 100
                ));
                const elapsedTime = Date.now() - lastRepTime.current;

                // Ideal tid för nuvarande progress (2-4 sekunder total)
                const idealTimeForProgress = (eccentricProgress / 100) * IDEAL_TEMPO.eccentricMin;
                const maxTimeForProgress = (eccentricProgress / 100) * IDEAL_TEMPO.eccentricMax;

                // Realtidsfeedback om för snabbt (vid 50% progress)
                if (eccentricProgress > 50 && eccentricProgress < 80) {
                  if (elapsedTime < idealTimeForProgress * 0.6) {
                    // >40% snabbare än ideal = för snabbt
                    feedbackMsg = "Sakta ner!";
                    speak("Sakta ner", 'corrective');
                  } else if (elapsedTime > maxTimeForProgress) {
                    // Lite snabbare ok om > 4 sek
                    feedbackMsg = "Bra kontroll";
                  }
                }

                if (mainAngle < 100) {
                    const descentTime = Date.now() - lastRepTime.current;
                    if (descentTime < IDEAL_TEMPO.eccentricMin) {
                        // Too fast - use varied tempo feedback
                        issues.push("För snabbt!");
                        speak(getEncouragement('TEMPO_SLOW'), 'corrective');
                        setFormScore(s => Math.max(0, s - 2));
                    } else if (descentTime >= IDEAL_TEMPO.eccentricMin && descentTime <= IDEAL_TEMPO.eccentricMax) {
                        // Good tempo - occasional positive feedback
                        if (Math.random() > 0.7) {
                          speak(getEncouragement('TEMPO_GOOD'), 'encouragement');
                        }
                    }
                    setMotionState('TURN');
                    speak("Bra djup! Håll.", 'encouragement');
                    feedbackMsg = "Perfekt djup!";
                    skeletonColor = 'rgba(34, 197, 94, 1)'; // Green
                    setFormScore(s => Math.min(100, s + 1));
                }
            } else if (motionState === 'TURN') {
                // Stability check: if horizontal wobble detected
                const wobble = Math.abs(lKnee.x - landmarkHistory.current[landmarkHistory.current.length-5]?.[25]?.x || 0);
                if (wobble > 0.02) {
                    stabilityShake = 5; // Trigger visual glitch
                    issues.push("Balansera!");
                }
                if (mainAngle > 110) setMotionState('CONCENTRIC');
            } else if (motionState === 'CONCENTRIC') {
                skeletonColor = 'rgba(245, 158, 11, 1)'; // Amber / Magma
                if (mainAngle > 165) {
                    setMotionState('START');
                    // Rep counting handled by RepScoringService (line 1015)
                    feedbackMsg = "Snyggt!";
                    setFormScore(s => Math.min(100, s + 2));
                    // Spara ROM för denna rep
                    saveRepROM();
                }
            }
        }
        // PRESS & PULL LOGIC
        else if ((exerciseMode === 'PRESS' || exerciseMode === 'PULL' || exerciseMode === 'PUSH') && lShldr && lElbow && lWrist) {
            // Use 3D elbow angle from PoseReconstructor
            mainAngle = getAngle3D(jointAngles3D, 'leftElbow');

            // ROM TRACKING
            updateROM(mainAngle);

            // ASYMMETRY CHECK (using 3D angles)
            const asymmetryResult = checkAsymmetry(jointAngles3D);
            if (asymmetryResult.detected && asymmetryResult.message) {
                issues.push(asymmetryResult.message);
                if (asymmetryResult.side === 'left') {
                    jointHighlights.push({ x: lElbow.x, y: lElbow.y, color: '#f97316' });
                } else {
                    jointHighlights.push({ x: rElbow.x, y: rElbow.y, color: '#f97316' });
                }
            }

            // EXERCISE-SPECIFIC VALIDATION for upper body
            const validationRules = EXERCISE_VALIDATION_RULES[exerciseMode] || [];
            const landmarkMap = { lHip, rHip, lKnee, rKnee, lAnkle, rAnkle, lShldr, rShldr, lElbow, rElbow, lWrist, rWrist };
            const angleMap: Record<string, number> = {};
            Object.entries(jointAngles3D).forEach(([key, val]) => { angleMap[key] = val.angle; });

            for (const rule of validationRules) {
              if (!rule.enabled) continue;
              const result = rule.check(angleMap, landmarkMap);
              if (!result.valid && result.issue) {
                issues.push(result.issue);
                const color = result.severity === 'critical' ? '#ef4444' : '#f59e0b';
                if (lElbow && result.issue.toLowerCase().includes('grepp')) {
                  jointHighlights.push({ x: lElbow.x, y: lElbow.y, color });
                  jointHighlights.push({ x: rElbow.x, y: rElbow.y, color });
                }
                if (result.severity === 'critical') {
                  speak(result.issue, true);
                }
              }
            }

            // Use exercise-specific ROM targets for PRESS mode
            const pressRomTarget = EXERCISE_ROM_TARGETS.PRESS;
            angleGauges.push({
              center: lElbow,
              angle: mainAngle,
              targetStart: pressRomTarget.min,
              targetEnd: pressRomTarget.max,
              optimal: pressRomTarget.optimal
            });

            if (motionState === 'START') {
                if (mainAngle > 100) { setMotionState('CONCENTRIC'); feedbackMsg = "Jobba!"; }
            } else if (motionState === 'CONCENTRIC') {
                skeletonColor = 'rgba(245, 158, 11, 1)';
                if (mainAngle > 160) {
                    setMotionState('TURN');
                    skeletonColor = 'rgba(34, 197, 94, 1)';
                    feedbackMsg = "Toppläge!";
                }
            } else if (motionState === 'TURN') {
                if (mainAngle < 150) setMotionState('ECCENTRIC');
            } else if (motionState === 'ECCENTRIC') {
                if (mainAngle < 70) {
                    setMotionState('START');
                    // Rep counting handled by RepScoringService (line 1015)
                    saveRepROM();
                }
            }
        }
        // CORE/PLANKA LOGIC
        else if (exerciseMode === 'CORE' && lShldr && lHip && lAnkle) {
            // Kontrollera rak linje från axel till fotled (planka-position)
            // Use 3D hip angle from PoseReconstructor
            const bodyAngle = getAngle3D(jointAngles3D, 'leftHip');
            mainAngle = bodyAngle;
            updateROM(mainAngle);

            // Perfekt planka = 170-180°
            const isGoodForm = bodyAngle >= 160 && bodyAngle <= 180;

            if (isGoodForm) {
                skeletonColor = 'rgba(34, 197, 94, 1)'; // Green
                feedbackMsg = "Bra form! Håll kvar.";
                setFormScore(s => Math.min(100, s + 0.1));
            } else if (bodyAngle < 160) {
                issues.push("Höfterna sjunker");
                jointHighlights.push({ x: lHip.x, y: lHip.y, color: '#ef4444' });
                speak("Lyft höfterna!", false);
                setFormScore(s => Math.max(0, s - 0.3));
            }

            // Use CORE ROM targets (modified for plank position)
            angleGauges.push({
              center: lHip,
              angle: bodyAngle,
              targetStart: 165,
              targetEnd: 180,
              optimal: 175 // Perfect plank alignment
            });
        }
        // BALANCE LOGIC
        else if (exerciseMode === 'BALANCE' && lHip && lKnee && lAnkle) {
            // Enbensstående - kontrollera stabilitet
            // Use 3D knee angle from PoseReconstructor
            const standingAngle = getAngle3D(jointAngles3D, 'leftKnee');
            mainAngle = standingAngle;

            // Kontrollera horisontell rörelse (wobble)
            if (landmarkHistory.current.length > 5) {
                const prevHipX = landmarkHistory.current[landmarkHistory.current.length - 5]?.[23]?.x || lHip.x;
                const wobble = Math.abs(lHip.x - prevHipX);

                if (wobble > 0.015) {
                    issues.push("Balansera!");
                    stabilityShake = 3;
                    setFormScore(s => Math.max(0, s - 0.5));
                } else {
                    feedbackMsg = "Bra balans!";
                    setFormScore(s => Math.min(100, s + 0.1));
                    skeletonColor = 'rgba(34, 197, 94, 1)';
                }
            }
        }
        // STRETCH LOGIC
        else if (exerciseMode === 'STRETCH') {
            // Töjningsläge - spåra ROM utan rep-räkning
            if (lHip && lKnee && lAnkle) {
                // Use 3D knee angle from PoseReconstructor
                mainAngle = getAngle3D(jointAngles3D, 'leftKnee');
                updateROM(mainAngle);

                feedbackMsg = `ROM: ${romData.currentROM}° | Håll töjningen...`;
                skeletonColor = 'rgba(6, 182, 212, 1)'; // Cyan

                // Use STRETCH ROM targets
                const stretchRomTarget = EXERCISE_ROM_TARGETS.STRETCH;
                angleGauges.push({
                  center: lKnee,
                  angle: mainAngle,
                  targetStart: stretchRomTarget.min,
                  targetEnd: stretchRomTarget.max,
                  optimal: stretchRomTarget.optimal
                });
            }
        }
        // SHOULDER MOBILITY LOGIC
        else if (exerciseMode === 'SHOULDER' && lShldr && lElbow && lWrist) {
            // Use shoulder flexion angle from PoseReconstructor
            const leftShoulderAngle = getAngle3D(jointAngles3D, 'leftShoulderFlexion');
            const rightShoulderAngle = getAngle3D(jointAngles3D, 'rightShoulderFlexion');
            mainAngle = Math.max(leftShoulderAngle, rightShoulderAngle); // Use highest arm angle

            updateROM(mainAngle);

            // ASYMMETRY CHECK: Kontrollera bilateral obalans för axlar
            const shoulderDiff = Math.abs(leftShoulderAngle - rightShoulderAngle);
            const avgShoulderAngle = (leftShoulderAngle + rightShoulderAngle) / 2;
            const asymmetryPercent = avgShoulderAngle > 0 ? (shoulderDiff / avgShoulderAngle) * 100 : 0;

            if (asymmetryPercent > 20 && avgShoulderAngle > 30) {
                const dominantSide = leftShoulderAngle > rightShoulderAngle ? 'left' : 'right';
                setAsymmetry({ detected: true, side: dominantSide, percentage: Math.round(asymmetryPercent) });
                issues.push(dominantSide === 'left'
                    ? `Vänster axel lyfts mer (${Math.round(asymmetryPercent)}%)`
                    : `Höger axel lyfts mer (${Math.round(asymmetryPercent)}%)`);
                jointHighlights.push({
                    x: dominantSide === 'left' ? lShldr.x : rShldr.x,
                    y: dominantSide === 'left' ? lShldr.y : rShldr.y,
                    color: '#f97316'
                });
            } else {
                setAsymmetry({ detected: false, side: null, percentage: 0 });
            }

            // EXERCISE-SPECIFIC VALIDATION for shoulder
            const validationRules = EXERCISE_VALIDATION_RULES[exerciseMode] || [];
            const landmarkMap = { lHip, rHip, lKnee, rKnee, lAnkle, rAnkle, lShldr, rShldr, lElbow, rElbow, lWrist, rWrist };
            const angleMap: Record<string, number> = {};
            Object.entries(jointAngles3D).forEach(([key, val]) => { angleMap[key] = val.angle; });

            for (const rule of validationRules) {
              if (!rule.enabled) continue;
              const result = rule.check(angleMap, landmarkMap);
              if (!result.valid && result.issue) {
                issues.push(result.issue);
                const color = result.severity === 'critical' ? '#ef4444' : '#f59e0b';
                if (lShldr && result.issue.toLowerCase().includes('axl')) {
                  jointHighlights.push({ x: lShldr.x, y: lShldr.y, color });
                  jointHighlights.push({ x: rShldr.x, y: rShldr.y, color });
                }
                if (result.severity === 'critical') {
                  speak(result.issue, true);
                }
              }
            }

            // Shoulder angle gauge - show on both shoulders
            const shoulderRomTarget = EXERCISE_ROM_TARGETS.SHOULDER;

            // Left shoulder gauge
            angleGauges.push({
              center: lShldr,
              angle: leftShoulderAngle,
              targetStart: shoulderRomTarget.min,
              targetEnd: shoulderRomTarget.max,
              optimal: shoulderRomTarget.optimal
            });

            // Right shoulder gauge
            angleGauges.push({
              center: rShldr,
              angle: rightShoulderAngle,
              targetStart: shoulderRomTarget.min,
              targetEnd: shoulderRomTarget.max,
              optimal: shoulderRomTarget.optimal
            });

            // Feedback based on ROM
            if (mainAngle > 120) {
                feedbackMsg = "Bra rörlighet!";
                skeletonColor = 'rgba(34, 197, 94, 1)'; // Green
                setFormScore(s => Math.min(100, s + 0.2));
            } else if (mainAngle > 60) {
                feedbackMsg = `Axelvinkel: ${Math.round(mainAngle)}° - Fortsätt uppåt`;
                skeletonColor = 'rgba(245, 158, 11, 1)'; // Amber
            } else {
                feedbackMsg = `Axelvinkel: ${Math.round(mainAngle)}°`;
                skeletonColor = 'rgba(6, 182, 212, 1)'; // Cyan
            }
        }
        } // End of if (!skipAnalysis)
    }

    setActiveIssues(issues);
    if (issues.length === 0) setFeedback(feedbackMsg);

    // --- RENDER LAYERS ---

    // 0. Stability Glitch Effect
    if (stabilityShake > 0) {
        canvasCtx.save();
        canvasCtx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
        // Chromatic aberration sort of effect
        canvasCtx.globalCompositeOperation = 'difference';
        canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        canvasCtx.fillRect(0,0,width,height);
        canvasCtx.restore();
        canvasCtx.globalCompositeOperation = 'source-over';
    }

    // 1. MOTION TRAILS (Ghosting)
    if (isCalibrated && landmarkHistory.current.length > 2) {
        const trackIdx = (exerciseMode === 'LEGS' || exerciseMode === 'LUNGE') ? 26 : 16; 
        
        canvasCtx.beginPath();
        landmarkHistory.current.forEach((frameLm, i) => {
            if (!frameLm[trackIdx]) return;
            const x = frameLm[trackIdx].x * width;
            const y = frameLm[trackIdx].y * height;
            if (i === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);
        });
        canvasCtx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        canvasCtx.lineWidth = 8;
        canvasCtx.lineCap = 'round';
        canvasCtx.stroke();
    }

    // 2. VELOCITY GAUGE (AR Tempo Bar)
    if (isCalibrated) {
        const barX = width - 40;
        const barH = 300;
        const barY = height / 2 - barH / 2;
        canvasCtx.fillStyle = 'rgba(15, 23, 42, 0.6)'; canvasCtx.fillRect(barX, barY, 20, barH);
        canvasCtx.strokeStyle = '#fff'; canvasCtx.beginPath(); canvasCtx.moveTo(barX, height/2); canvasCtx.lineTo(barX+20, height/2); canvasCtx.stroke();
        
        const velHeight = Math.min(Math.abs(velocity * 50), barH/2);
        const isTooFast = Math.abs(velocity) > 2.0; 
        const barColor = isTooFast ? '#ef4444' : '#22c55e';
        
        canvasCtx.fillStyle = barColor;
        if (velocity > 0) canvasCtx.fillRect(barX + 2, height/2, 16, velHeight);
        else canvasCtx.fillRect(barX + 2, height/2 - velHeight, 16, velHeight);
        
        canvasCtx.fillStyle = '#fff'; canvasCtx.font = "10px monospace"; canvasCtx.fillText("TEMPO", barX - 10, barY - 5);
    }

    // 3. AR EXOSUIT (REPLACES STICK FIGURE)
    const modules = mediaPipeModulesRef.current;
    const drawLandmarks = modules?.drawingUtils
      ? ((modules.drawingUtils as any).drawLandmarks || (modules.drawingUtils as any).default?.drawLandmarks)
      : null;

    // Muskelgrupps-highlighting baserat på övningsläge
    const getMuscleColor = (limbType: 'quad' | 'ham' | 'glute' | 'calf' | 'chest' | 'back' | 'shoulder' | 'arm' | 'core') => {
        const activeColor = '#f59e0b'; // Amber/Orange för aktiva muskler
        const secondaryColor = '#22c55e'; // Grön för sekundärt aktiva
        const inactiveColor = '#06b6d4'; // Cyan för inaktiva
        const isActive = motionState === 'CONCENTRIC' || motionState === 'ECCENTRIC';

        if (exerciseMode === 'LEGS') {
            if (limbType === 'quad' || limbType === 'glute') return isActive ? activeColor : inactiveColor;
            if (limbType === 'ham' || limbType === 'calf') return isActive ? secondaryColor : inactiveColor;
        } else if (exerciseMode === 'LUNGE') {
            if (limbType === 'quad' || limbType === 'glute') return isActive ? activeColor : inactiveColor;
        } else if (exerciseMode === 'PUSH') {
            if (limbType === 'chest' || limbType === 'arm') return isActive ? activeColor : inactiveColor;
            if (limbType === 'shoulder') return isActive ? secondaryColor : inactiveColor;
        } else if (exerciseMode === 'PRESS') {
            if (limbType === 'shoulder') return isActive ? activeColor : inactiveColor;
            if (limbType === 'arm') return isActive ? secondaryColor : inactiveColor;
        } else if (exerciseMode === 'PULL') {
            if (limbType === 'back') return isActive ? activeColor : inactiveColor;
            if (limbType === 'arm') return isActive ? secondaryColor : inactiveColor;
        } else if (exerciseMode === 'CORE') {
            if (limbType === 'core') return activeColor; // Alltid aktiv för core
            if (limbType === 'glute' || limbType === 'shoulder') return secondaryColor;
        } else if (exerciseMode === 'BALANCE') {
            if (limbType === 'calf' || limbType === 'glute') return isActive ? activeColor : inactiveColor;
            if (limbType === 'core') return secondaryColor;
        } else if (exerciseMode === 'STRETCH') {
            // Visa vilken muskel som töjs
            if (limbType === 'ham') return '#8b5cf6'; // Lila för töjda muskler
            if (limbType === 'calf' || limbType === 'back') return '#a78bfa';
        } else if (exerciseMode === 'SHOULDER') {
            // Axelrörlighet - markera axel och arm
            if (limbType === 'shoulder') return isActive ? activeColor : '#06b6d4';
            if (limbType === 'arm') return isActive ? secondaryColor : inactiveColor;
        }
        return inactiveColor;
    };

    if (isCalibrated) {
        // LEGS & BALANCE: Fokus på ben
        if (exerciseMode === 'LEGS' || exerciseMode === 'LUNGE' || exerciseMode === 'BALANCE') {
            // Lår (Quadriceps)
            drawExosuitLimb(canvasCtx, lHip, lKnee, width, height, getMuscleColor('quad'), 40);
            drawExosuitLimb(canvasCtx, rHip, rKnee, width, height, getMuscleColor('quad'), 40);
            // Underben (Calf)
            drawExosuitLimb(canvasCtx, lKnee, lAnkle, width, height, getMuscleColor('calf'), 30);
            drawExosuitLimb(canvasCtx, rKnee, rAnkle, width, height, getMuscleColor('calf'), 30);

            // Torque Rings på knän
            drawJointTurbine(canvasCtx, lKnee, width, height, 1, getMuscleColor('quad'));
            drawJointTurbine(canvasCtx, rKnee, width, height, -1, getMuscleColor('quad'));
        }
        // PRESS, PULL, PUSH: Fokus på armar
        else if (exerciseMode === 'PRESS' || exerciseMode === 'PULL' || exerciseMode === 'PUSH') {
            // Överarm (Shoulder to Elbow)
            drawExosuitLimb(canvasCtx, lShldr, lElbow, width, height, getMuscleColor('shoulder'), 30);
            drawExosuitLimb(canvasCtx, rShldr, rElbow, width, height, getMuscleColor('shoulder'), 30);
            // Underarm (Elbow to Wrist)
            drawExosuitLimb(canvasCtx, lElbow, lWrist, width, height, getMuscleColor('arm'), 25);
            drawExosuitLimb(canvasCtx, rElbow, rWrist, width, height, getMuscleColor('arm'), 25);

            // Torque Rings på armbågar
            drawJointTurbine(canvasCtx, lElbow, width, height, 1, getMuscleColor('arm'));
            drawJointTurbine(canvasCtx, rElbow, width, height, -1, getMuscleColor('arm'));
        }
        // SHOULDER: Fokus på axelrörlighet med tydliga axelmarkeringar
        else if (exerciseMode === 'SHOULDER') {
            // Överarm (Shoulder to Elbow) - highlight
            drawExosuitLimb(canvasCtx, lShldr, lElbow, width, height, getMuscleColor('shoulder'), 35);
            drawExosuitLimb(canvasCtx, rShldr, rElbow, width, height, getMuscleColor('shoulder'), 35);
            // Underarm (Elbow to Wrist)
            drawExosuitLimb(canvasCtx, lElbow, lWrist, width, height, getMuscleColor('arm'), 25);
            drawExosuitLimb(canvasCtx, rElbow, rWrist, width, height, getMuscleColor('arm'), 25);

            // Torque Rings på AXLARNA (inte armbågar)
            drawJointTurbine(canvasCtx, lShldr, width, height, 1, getMuscleColor('shoulder'));
            drawJointTurbine(canvasCtx, rShldr, width, height, -1, getMuscleColor('shoulder'));

            // Extra highlight på axellederna
            if (lShldr && rShldr) {
                canvasCtx.save();
                canvasCtx.shadowBlur = 15;
                canvasCtx.shadowColor = getMuscleColor('shoulder');
                canvasCtx.beginPath();
                canvasCtx.arc(lShldr.x * width, lShldr.y * height, 12, 0, Math.PI * 2);
                canvasCtx.fillStyle = getMuscleColor('shoulder');
                canvasCtx.fill();
                canvasCtx.beginPath();
                canvasCtx.arc(rShldr.x * width, rShldr.y * height, 12, 0, Math.PI * 2);
                canvasCtx.fill();
                canvasCtx.restore();
            }
        }
        // CORE: Fokus på bål + ben
        else if (exerciseMode === 'CORE') {
            // Rita ben
            drawExosuitLimb(canvasCtx, lHip, lKnee, width, height, getMuscleColor('glute'), 35);
            drawExosuitLimb(canvasCtx, rHip, rKnee, width, height, getMuscleColor('glute'), 35);
            drawExosuitLimb(canvasCtx, lKnee, lAnkle, width, height, getMuscleColor('calf'), 28);
            drawExosuitLimb(canvasCtx, rKnee, rAnkle, width, height, getMuscleColor('calf'), 28);
            // Rita armar
            drawExosuitLimb(canvasCtx, lShldr, lElbow, width, height, getMuscleColor('shoulder'), 28);
            drawExosuitLimb(canvasCtx, rShldr, rElbow, width, height, getMuscleColor('shoulder'), 28);

            // Core-specifik highlighting: Rita bål med glow
            if (lShldr && rShldr && lHip && rHip) {
                const coreColor = getMuscleColor('core');
                canvasCtx.save();
                canvasCtx.shadowBlur = 20;
                canvasCtx.shadowColor = coreColor;
                canvasCtx.beginPath();
                canvasCtx.moveTo(lShldr.x * width, lShldr.y * height);
                canvasCtx.lineTo(rShldr.x * width, rShldr.y * height);
                canvasCtx.lineTo(rHip.x * width, rHip.y * height);
                canvasCtx.lineTo(lHip.x * width, lHip.y * height);
                canvasCtx.closePath();
                canvasCtx.fillStyle = `${coreColor}40`; // Transparent fill
                canvasCtx.fill();
                canvasCtx.strokeStyle = coreColor;
                canvasCtx.lineWidth = 3;
                canvasCtx.stroke();
                canvasCtx.restore();
            }
        }
        // STRETCH: Visa hela kroppen
        else if (exerciseMode === 'STRETCH') {
            // Ben med töjningsfärger
            drawExosuitLimb(canvasCtx, lHip, lKnee, width, height, getMuscleColor('ham'), 35);
            drawExosuitLimb(canvasCtx, rHip, rKnee, width, height, getMuscleColor('ham'), 35);
            drawExosuitLimb(canvasCtx, lKnee, lAnkle, width, height, getMuscleColor('calf'), 28);
            drawExosuitLimb(canvasCtx, rKnee, rAnkle, width, height, getMuscleColor('calf'), 28);
            // Armar
            drawExosuitLimb(canvasCtx, lShldr, lElbow, width, height, getMuscleColor('shoulder'), 25);
            drawExosuitLimb(canvasCtx, rShldr, rElbow, width, height, getMuscleColor('shoulder'), 25);
            drawExosuitLimb(canvasCtx, lElbow, lWrist, width, height, getMuscleColor('arm'), 20);
            drawExosuitLimb(canvasCtx, rElbow, rWrist, width, height, getMuscleColor('arm'), 20);
        }
        // GENERAL: Visa hela kroppen
        else {
            // Ben
            drawExosuitLimb(canvasCtx, lHip, lKnee, width, height, skeletonColor, 35);
            drawExosuitLimb(canvasCtx, rHip, rKnee, width, height, skeletonColor, 35);
            drawExosuitLimb(canvasCtx, lKnee, lAnkle, width, height, skeletonColor, 28);
            drawExosuitLimb(canvasCtx, rKnee, rAnkle, width, height, skeletonColor, 28);
            // Armar
            drawExosuitLimb(canvasCtx, lShldr, lElbow, width, height, skeletonColor, 25);
            drawExosuitLimb(canvasCtx, rShldr, rElbow, width, height, skeletonColor, 25);
            drawExosuitLimb(canvasCtx, lElbow, lWrist, width, height, skeletonColor, 20);
            drawExosuitLimb(canvasCtx, rElbow, rWrist, width, height, skeletonColor, 20);
        }

        // Torso Box (alltid synlig)
        if (lShldr && rShldr && lHip && rHip && exerciseMode !== 'CORE') {
            canvasCtx.beginPath();
            canvasCtx.moveTo(lShldr.x * width, lShldr.y * height);
            canvasCtx.lineTo(rShldr.x * width, rShldr.y * height);
            canvasCtx.lineTo(rHip.x * width, rHip.y * height);
            canvasCtx.lineTo(lHip.x * width, lHip.y * height);
            canvasCtx.closePath();
            canvasCtx.strokeStyle = 'rgba(255,255,255,0.3)';
            canvasCtx.lineWidth = 1;
            canvasCtx.stroke();
        }
    } else {
        // Fallback to simple landmarks during calibration
        if (drawLandmarks) drawLandmarks(canvasCtx, lm, { color: '#0ea5e9', lineWidth: 2, radius: 4 });
    }

    // 4. PARTICLES (Success Burst)
    for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.life -= 0.05;
        
        canvasCtx.globalAlpha = p.life;
        canvasCtx.fillStyle = p.color;
        canvasCtx.beginPath();
        canvasCtx.arc(p.x, p.y, 4, 0, Math.PI*2);
        canvasCtx.fill();
        canvasCtx.globalAlpha = 1;

        if (p.life <= 0) particles.current.splice(i, 1);
    }

    // 5. ENHANCED ANGLE GAUGES (AR HUD) with optimal zone visualization
    angleGauges.forEach(gauge => {
        const cx = gauge.center.x * width;
        const cy = gauge.center.y * height;
        const radius = 45;

        // Target zone (green area)
        canvasCtx.beginPath(); canvasCtx.moveTo(cx, cy);
        const startRad = -Math.PI / 2 + (gauge.targetStart / 360) * Math.PI * 2;
        const endRad = -Math.PI / 2 + (gauge.targetEnd / 360) * Math.PI * 2;
        canvasCtx.arc(cx, cy, radius + 10, startRad, endRad);
        canvasCtx.fillStyle = 'rgba(34, 197, 94, 0.2)'; canvasCtx.fill();

        // Optimal marker (golden line) if optimal angle is defined
        if (gauge.optimal !== undefined) {
          const optimalRad = -Math.PI / 2 + (gauge.optimal / 360) * Math.PI * 2;
          canvasCtx.beginPath();
          canvasCtx.moveTo(cx + Math.cos(optimalRad) * (radius - 5), cy + Math.sin(optimalRad) * (radius - 5));
          canvasCtx.lineTo(cx + Math.cos(optimalRad) * (radius + 15), cy + Math.sin(optimalRad) * (radius + 15));
          canvasCtx.strokeStyle = '#fbbf24'; // Gold color for optimal
          canvasCtx.lineWidth = 3;
          canvasCtx.stroke();

          // Small diamond at optimal point
          canvasCtx.beginPath();
          const optX = cx + Math.cos(optimalRad) * (radius + 18);
          const optY = cy + Math.sin(optimalRad) * (radius + 18);
          canvasCtx.moveTo(optX, optY - 4);
          canvasCtx.lineTo(optX + 4, optY);
          canvasCtx.lineTo(optX, optY + 4);
          canvasCtx.lineTo(optX - 4, optY);
          canvasCtx.closePath();
          canvasCtx.fillStyle = '#fbbf24';
          canvasCtx.fill();
        }

        // Background circle
        canvasCtx.beginPath(); canvasCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        canvasCtx.strokeStyle = 'rgba(255,255,255,0.1)'; canvasCtx.lineWidth = 4; canvasCtx.stroke();

        // Current angle arc
        canvasCtx.beginPath();
        const start = -Math.PI / 2;
        const end = start + (gauge.angle / 360) * Math.PI * 2;
        canvasCtx.arc(cx, cy, radius, start, end);
        const inZone = gauge.angle >= gauge.targetStart && gauge.angle <= gauge.targetEnd;

        // Color coding: green in zone, gold near optimal, cyan outside
        let arcColor = '#06b6d4'; // Default cyan
        if (inZone) {
          if (gauge.optimal !== undefined) {
            const distFromOptimal = Math.abs(gauge.angle - gauge.optimal);
            if (distFromOptimal < 5) {
              arcColor = '#fbbf24'; // Gold - very close to optimal
            } else if (distFromOptimal < 15) {
              arcColor = '#22c55e'; // Green - in good range
            } else {
              arcColor = '#84cc16'; // Lime - in zone but not optimal
            }
          } else {
            arcColor = '#22c55e'; // Green
          }
        }
        canvasCtx.strokeStyle = arcColor;
        canvasCtx.lineWidth = 6; canvasCtx.stroke();

        // Angle display box
        canvasCtx.fillStyle = '#0f172a';
        canvasCtx.fillRect(cx + radius + 5, cy - 12, 48, 24);
        canvasCtx.strokeStyle = arcColor;
        canvasCtx.lineWidth = 1;
        canvasCtx.strokeRect(cx + radius + 5, cy - 12, 48, 24);

        canvasCtx.fillStyle = arcColor;
        canvasCtx.font = "bold 12px monospace";
        canvasCtx.fillText(Math.round(gauge.angle) + "°", cx + radius + 10, cy + 4);
    });

    // Highlight issues
    jointHighlights.forEach(h => {
        canvasCtx.beginPath();
        canvasCtx.arc(h.x * width, h.y * height, 30, 0, Math.PI * 2);
        canvasCtx.strokeStyle = h.color;
        canvasCtx.lineWidth = 4;
        canvasCtx.stroke();
    });

    canvasCtx.restore();
  };

  useEffect(() => {
    setTimeout(() => speak(`System redo. Ställ dig så hela kroppen syns.`), 1000);

    let isMounted = true;
    let pose: any = null;
    let camera: any = null;
    let animationFrameId: number | null = null;
    let stream: MediaStream | null = null;

    const initMediaPipeAndCamera = async () => {
      try {
        setIsLoadingML(true);
        logger.debug('[AIMovementCoach] Loading MediaPipe modules...');

        // Dynamically load MediaPipe modules (~1.6MB only when needed)
        const modules = await loadMediaPipeModules();
        mediaPipeModulesRef.current = modules;

        if (!isMounted) return;

        const { poseLib } = modules;
        const Pose = (poseLib as any).Pose || (poseLib as any).default?.Pose;

        if (!Pose) {
          console.error('[AIMovementCoach] MediaPipe Pose not found');
          setPermissionDenied(true);
          setIsLoadingML(false);
          return;
        }

        // FAS 8: Get adaptive device capability for optimal performance
        const deviceCapability = getDeviceCapability();
        const mediaPipeConfig = getMediaPipeConfig(deviceCapability);
        const cameraConstraints = getCameraConstraints(deviceCapability);

        logger.debug(`[AIMovementCoach] Device tier: ${deviceCapability.tier}, resolution: ${deviceCapability.resolution.width}x${deviceCapability.resolution.height}, FPS: ${deviceCapability.targetFPS}`);
        logger.debug('[AIMovementCoach] Initializing MediaPipe Pose with ADAPTIVE precision...');
        pose = new Pose({locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});

        // Adaptive settings based on device capability:
        // modelComplexity: 0-2, based on device tier (0=fastest, 2=most accurate)
        // smoothLandmarks: true = Temporal smoothing
        // enableSegmentation: false = Focus on pose only, better performance
        // minDetectionConfidence: Lower on weaker devices for smoother tracking
        // minTrackingConfidence: Lower on weaker devices for smoother tracking
        pose.setOptions({
          modelComplexity: mediaPipeConfig.modelComplexity,
          smoothLandmarks: mediaPipeConfig.smoothLandmarks,
          enableSegmentation: mediaPipeConfig.enableSegmentation,
          minDetectionConfidence: mediaPipeConfig.minDetectionConfidence,
          minTrackingConfidence: mediaPipeConfig.minTrackingConfidence,
          smoothSegmentation: mediaPipeConfig.smoothSegmentation
        });
        pose.onResults(onResults);

        setIsLoadingML(false);

        // Now initialize camera with adaptive settings
        if (!videoRef.current || !isMounted) return;

        logger.debug('[AIMovementCoach] Starting camera initialization with adaptive settings...');
        logger.debug(`[AIMovementCoach] Requesting camera: ${deviceCapability.resolution.width}x${deviceCapability.resolution.height} @ ${deviceCapability.targetFPS}fps`);

        stream = await navigator.mediaDevices.getUserMedia(cameraConstraints);

        if (!isMounted || !videoRef.current) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        videoRef.current.srcObject = stream;

        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject('No video element');
          videoRef.current.onloadedmetadata = () => resolve();
          videoRef.current.onerror = () => reject('Video error');
          setTimeout(() => reject('Video load timeout'), 5000);
        });

        await videoRef.current.play();
        logger.debug('[AIMovementCoach] Camera stream active');

        if (!isMounted) return;
        setIsCameraActive(true);

        // Initialize pose model with first frame
        logger.debug('[AIMovementCoach] Initializing pose model...');
        if (pose.initialize) {
          await pose.initialize();
        }

        // FAS 8: Initialize frame throttler and performance monitor
        const frameThrottler = new FrameThrottler({ targetFPS: deviceCapability.targetFPS });
        const performanceMonitor = new PerformanceMonitor();

        // Adapt throttler to exercise type
        const exerciseSpeed = getExerciseSpeed(exerciseName);
        frameThrottler.setExercise(exerciseName);
        logger.debug(`[AIMovementCoach] Exercise "${exerciseName}" speed: ${exerciseSpeed}`);

        // Process frames with throttling
        let frameCount = 0;
        const processFrame = async () => {
          if (!isMounted) return;

          // FAS 8: Only process frame if throttler allows
          if (!frameThrottler.shouldProcessFrame()) {
            if (isMounted) {
              animationFrameId = requestAnimationFrame(processFrame);
            }
            return;
          }

          if (videoRef.current && videoRef.current.readyState >= 2) {
            const startTime = performance.now();
            try {
              await pose.send({ image: videoRef.current });
              if (frameCount === 0) {
                logger.debug('[AIMovementCoach] First frame sent to pose model');
              }
              frameCount++;

              // FAS 8: Report processing time for adaptive FPS adjustment
              const processingTime = performance.now() - startTime;
              frameThrottler.reportProcessingTime(processingTime);
              performanceMonitor.recordFrame(processingTime);

              // Log performance metrics every 100 frames
              if (frameCount % 100 === 0) {
                const metrics = performanceMonitor.getMetrics();
                logger.debug(`[AIMovementCoach] Performance: ${metrics.averageFPS.toFixed(1)} FPS, ${metrics.averageLatency.toFixed(1)}ms latency, CPU: ${metrics.cpuPressure}`);
              }
            } catch (err) {
              if (frameCount === 0) {
                console.error('[AIMovementCoach] Error sending frame:', err);
              }
              performanceMonitor.recordDroppedFrame();
            }
          }
          if (isMounted) {
            animationFrameId = requestAnimationFrame(processFrame);
          }
        };
        processFrame();

      } catch (err: any) {
        console.error('[AIMovementCoach] Initialization failed:', err);
        setIsLoadingML(false);
        if (isMounted) {
          setPermissionDenied(true);
        }
      }
    };

    initMediaPipeAndCamera();

    return () => {
      isMounted = false;
      if (camera) try { camera.stop(); } catch(e) { }
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      try { if (pose) pose.close(); } catch(e) { }
      speechService.stop();
    };
  }, [exerciseMode, isCalibrated]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col md:flex-row overflow-hidden font-mono"
      role="dialog"
      aria-modal="true"
      aria-label={`AI Movement Coach - ${exerciseName}`}
    >
      {/* LEFT: 3D HOLOGRAPHIC DEMONSTRATOR */}
      <div className="h-1/2 md:h-full md:w-1/2 bg-slate-950 relative border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950"></div>
          
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-800 flex items-center gap-2">
                  <Layers size={12} /> BIO-DIGITAL TWIN v2.2
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                  MODE: {exerciseMode}
              </span>
          </div>

          {/* Gender Selection */}
          <div className="absolute top-12 right-3 z-10 flex gap-1">
            <button
              onClick={() => setAvatarGender('male')}
              className={`px-2 py-1 text-[10px] font-semibold rounded transition-all ${
                avatarGender === 'male'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-700/80 text-slate-400 hover:bg-slate-600/80'
              }`}
              title="Manlig avatar"
            >
              Man
            </button>
            <button
              onClick={() => setAvatarGender('female')}
              className={`px-2 py-1 text-[10px] font-semibold rounded transition-all ${
                avatarGender === 'female'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-slate-700/80 text-slate-400 hover:bg-slate-600/80'
              }`}
              title="Kvinnlig avatar"
            >
              Kvinna
            </button>
          </div>

          <SectionErrorBoundary sectionName="3D Avatar" fallbackHeight="h-full">
            <Suspense fallback={
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-400" size={48} />
              </div>
            }>
              <div className="w-full h-full">
                <RealisticAvatar3D
                  mode={exerciseMode}
                  gender={avatarGender}
                  exerciseName={exerciseName}
                />
              </div>
            </Suspense>
          </SectionErrorBoundary>
          
          <div className="absolute bottom-8 left-8 right-8 text-center pointer-events-none">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <Timer size={10} /> Clinical Tempo Match
              </p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 w-1/3 animate-[pulse_5s_infinite]"></div>
              </div>
          </div>
      </div>

      {/* RIGHT: REAL-TIME ANALYSIS */}
      <div className="h-1/2 md:h-full md:w-1/2 relative bg-black flex flex-col">
          <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent">
             <div>
                <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                    <BrainCircuit size={18} className="text-emerald-400" />
                    {exerciseName}
                </h3>
                <div aria-live="polite" aria-atomic="true" role="status">
                 {activeIssues.length > 0 ? (
                    <span className="text-red-400 text-xs font-bold flex items-center gap-1 mt-1 animate-pulse" role="alert">
                        <AlertTriangle size={10} aria-hidden="true" /> {activeIssues[0]}
                    </span>
                ) : (
                    <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 mt-1">
                        <Activity size={10} aria-hidden="true" /> FORM OPTIMAL
                    </span>
                )}
               </div>
             </div>
             <div className="flex items-center gap-2">
               {/* Show Summary Button - only show if we have reps */}
               {reps > 0 && (
                 <button
                   onClick={() => setShowSummary(true)}
                   className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium transition-colors border border-emerald-500/30"
                   aria-label={`Avsluta och visa sammanfattning för ${reps} repetitioner`}
                 >
                   <Trophy size={16} className="inline mr-1" aria-hidden="true" />
                   Avsluta
                 </button>
               )}
               <button
                 onClick={onClose}
                 className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                 aria-label="Stäng AI Movement Coach"
               >
                 <X size={20} aria-hidden="true" />
               </button>
             </div>
          </div>

          <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-slate-900">
             {/* Video element must always be rendered for camera initialization */}
             <video ref={videoRef} className="hidden" playsInline muted autoPlay></video>

             {!isCameraActive ? (
                 <div className="flex flex-col items-center text-slate-500 animate-pulse gap-4">
                     <RefreshCw className="animate-spin" size={32} />
                     <p>Calibrating Neural Vision...</p>
                 </div>
             ) : (
                 <>
                     <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${isMirrored ? 'scale-x-[-1]' : ''}`} width={1280} height={720}></canvas>

                     {/* INTEGRATED: Movement Feedback Overlay */}
                     <MovementFeedbackOverlay
                       repCount={reps}
                       currentScore={currentRepScore}
                       sessionScores={sessionScores}
                       currentPhase={currentPhase}
                       repProgress={repProgress}
                       activeIssues={formIssues}
                       symmetry={symmetryScore}
                       romAchieved={romData.currentROM > 0 ? Math.round((romData.currentROM / 90) * 100) : 0}
                       isCalibrating={!isCalibrated}
                       calibrationProgress={calibrationProgress}
                     />

                     {/* CALIBRATION OVERLAY */}
                     {!isCalibrated && !countdownActive && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-40 backdrop-blur-md">
                             <div className="relative mb-6">
                               <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                               <div className="relative bg-slate-900/80 p-6 rounded-full border-2 border-cyan-500/50">
                                 <ScanLine size={56} className="text-cyan-400 animate-pulse" />
                               </div>
                             </div>
                             <h4 className="text-white font-bold text-2xl mb-2">System Kalibrering</h4>
                             <p className="text-cyan-200 text-sm mb-2">Stå stilla så hela kroppen syns</p>
                             <p className="text-slate-400 text-xs mb-6 max-w-xs text-center">
                               Positionera dig mitt i bilden med lite utrymme runt dig
                             </p>
                             <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                 <div
                                   className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                                   style={{ width: `${calibrationCounter}%` }}
                                 ></div>
                             </div>
                             <p className="text-slate-500 text-xs mt-2">{Math.round(calibrationCounter)}% klar</p>
                         </div>
                     )}

                     {/* COUNTDOWN OVERLAY */}
                     {countdownActive && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 backdrop-blur-md">
                             <div className="text-center">
                               <div className="relative">
                                 <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-ping scale-150"></div>
                                 <div className="relative w-40 h-40 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full shadow-2xl shadow-cyan-500/50">
                                   <span className="text-white text-8xl font-black animate-pulse">
                                     {countdownValue > 0 ? countdownValue : '🚀'}
                                   </span>
                                 </div>
                               </div>
                               <p className="text-cyan-300 text-xl font-bold mt-6 animate-pulse">
                                 {countdownValue > 0 ? 'Gör dig redo...' : 'KÖR!'}
                               </p>
                             </div>
                         </div>
                     )}

                     {/* PAUSE OVERLAY */}
                     {isPaused && isCalibrated && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-40 backdrop-blur-sm">
                             <div className="text-center">
                               <Pause size={64} className="text-amber-400 mx-auto mb-4" />
                               <p className="text-white text-2xl font-bold mb-2">Pausad</p>
                               <p className="text-slate-400 text-sm">Tryck på play för att fortsätta</p>
                             </div>
                         </div>
                     )}

                     <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col items-center z-30 pointer-events-none gap-4">
                        {/* REPS */}
                        <div className="text-center">
                            <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{reps}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Reps</div>
                        </div>

                        {/* FORM SCORE with pulse animation */}
                        <div className="flex flex-col items-center gap-1 relative group">
                            <div className={`relative w-14 h-14 rounded-full border-4 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300 ${formScore > 80 ? 'border-emerald-500 text-emerald-400' : formScore > 50 ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400'} ${formScore > 90 ? 'animate-pulse' : ''}`}>
                                <span className="font-bold text-sm">{Math.round(formScore)}%</span>
                                {/* Outer glow ring */}
                                {formScore > 90 && (
                                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-20"></div>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teknik</span>

                            {/* Tooltip on hover showing validation status */}
                            {activeIssues.length > 0 && (
                              <div className="absolute left-full ml-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/95 border border-slate-700 rounded-lg p-2 min-w-[200px] z-50 backdrop-blur-md">
                                <div className="text-xs font-bold text-amber-400 mb-1">Teknikproblem:</div>
                                {activeIssues.slice(0, 3).map((issue, idx) => (
                                  <div key={idx} className="text-[10px] text-slate-300 flex items-start gap-1 mb-1">
                                    <span className="text-red-400">•</span>
                                    <span>{issue}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* ROM DISPLAY */}
                        {romData.currentROM > 0 && (
                            <div className="flex flex-col items-center gap-1">
                                <div className="relative w-14 h-14 rounded-full border-4 border-cyan-500 flex items-center justify-center bg-black/50 backdrop-blur-md text-cyan-400">
                                    <span className="font-bold text-sm">{Math.round(romData.currentROM)}°</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ROM</span>
                            </div>
                        )}

                        {/* ASYMMETRY WARNING */}
                        {asymmetry.detected && (
                            <div className="flex flex-col items-center gap-1">
                                <div className="relative w-14 h-14 rounded-full border-4 border-orange-500 flex items-center justify-center bg-black/50 backdrop-blur-md text-orange-400 animate-pulse">
                                    <span className="font-bold text-xs">{asymmetry.percentage}%</span>
                                </div>
                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                                    {asymmetry.side === 'left' ? 'V' : 'H'} Obalans
                                </span>
                            </div>
                        )}

                        {/* REP QUALITY PROGRESSION - Mini Sparkline */}
                        {sessionAnalytics.repQualityTrend.length >= 3 && (
                            <div className="flex flex-col items-center gap-1 relative group">
                                <div className="relative w-14 h-14 rounded-lg border-2 border-purple-500/50 flex items-center justify-center bg-black/50 backdrop-blur-md overflow-hidden">
                                    {/* Mini sparkline showing last 10 reps */}
                                    <svg width="48" height="48" className="absolute inset-0">
                                        <polyline
                                          points={sessionAnalytics.repQualityTrend.slice(-10).map((score, idx, arr) => {
                                            const x = (idx / (arr.length - 1)) * 48;
                                            const y = 48 - (score / 100) * 48;
                                            return `${x},${y}`;
                                          }).join(' ')}
                                          fill="none"
                                          stroke={sessionAnalytics.improvementRate > 0 ? '#10b981' : sessionAnalytics.improvementRate < -5 ? '#ef4444' : '#8b5cf6'}
                                          strokeWidth="2"
                                          className="drop-shadow-[0_0_4px_rgba(139,92,246,0.5)]"
                                        />
                                      {/* Dots for each rep */}
                                      {sessionAnalytics.repQualityTrend.slice(-10).map((score, idx, arr) => {
                                        const x = (idx / (arr.length - 1)) * 48;
                                        const y = 48 - (score / 100) * 48;
                                        return (
                                          <circle
                                            key={idx}
                                            cx={x}
                                            cy={y}
                                            r="2"
                                            fill={score >= 90 ? '#10b981' : score >= 70 ? '#fbbf24' : '#ef4444'}
                                          />
                                        );
                                      })}
                                    </svg>
                                    {/* Trend arrow */}
                                    <div className={`absolute top-1 right-1 text-[8px] font-bold ${sessionAnalytics.improvementRate > 0 ? 'text-green-400' : sessionAnalytics.improvementRate < -5 ? 'text-red-400' : 'text-purple-400'}`}>
                                      {sessionAnalytics.improvementRate > 0 ? '↗' : sessionAnalytics.improvementRate < -5 ? '↘' : '→'}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Trend</span>

                                {/* Hover tooltip with insights */}
                                <div className="absolute left-full ml-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/95 border border-purple-700 rounded-lg p-2 min-w-[180px] z-50 backdrop-blur-md">
                                  <div className="text-xs font-bold text-purple-400 mb-2">Session Insights</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-slate-400">Konsistens:</span>
                                      <span className={`font-bold ${sessionAnalytics.consistencyScore >= 80 ? 'text-green-400' : sessionAnalytics.consistencyScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                        {sessionAnalytics.consistencyScore}%
                                      </span>
                                    </div>
                                    {sessionAnalytics.avgRepDuration > 0 && (
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-400">Tempo:</span>
                                        <span className="text-cyan-400 font-bold">{sessionAnalytics.avgRepDuration.toFixed(1)}s</span>
                                      </div>
                                    )}
                                    {sessionAnalytics.improvementRate !== 0 && (
                                      <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-400">Förbättring:</span>
                                        <span className={`font-bold ${sessionAnalytics.improvementRate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {sessionAnalytics.improvementRate > 0 ? '+' : ''}{sessionAnalytics.improvementRate}%
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-slate-400">Topp:</span>
                                      <span className="text-amber-400 font-bold">{sessionAnalytics.peakFormScore}%</span>
                                    </div>
                                  </div>
                                </div>
                            </div>
                        )}

                        {/* FAS 10: EMOTIONAL STATE INDICATOR */}
                        {showEmotionalIndicator && emotionalState !== 'NEUTRAL' && (
                            <div className="flex flex-col items-center gap-1 relative group">
                                <div
                                  className={`relative w-14 h-14 rounded-full border-4 flex items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-500 ${getEmotionalStateColor(emotionalState)}`}
                                  style={{ borderColor: getEmotionalStateColor(emotionalState).includes('emerald') ? '#10b981' :
                                           getEmotionalStateColor(emotionalState).includes('amber') ? '#f59e0b' :
                                           getEmotionalStateColor(emotionalState).includes('red') ? '#ef4444' :
                                           getEmotionalStateColor(emotionalState).includes('blue') ? '#3b82f6' :
                                           getEmotionalStateColor(emotionalState).includes('purple') ? '#8b5cf6' : '#64748b' }}
                                >
                                    <span className="text-2xl">{getEmotionalStateEmoji(emotionalState)}</span>
                                    {/* Pulse effect for strong emotions */}
                                    {(emotionalState === 'FRUSTRATED' || emotionalState === 'MOTIVATED' || emotionalState === 'CONFIDENT') && (
                                      <div className="absolute inset-0 rounded-full border-2 animate-ping opacity-30"
                                           style={{ borderColor: emotionalState === 'FRUSTRATED' ? '#ef4444' :
                                                    emotionalState === 'MOTIVATED' ? '#10b981' : '#3b82f6' }}></div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${getEmotionalStateColor(emotionalState)}`}>
                                    {getEmotionalStateDescription(emotionalState).split(' ')[0]}
                                </span>

                                {/* Hover tooltip with full emotional analysis */}
                                {emotionalAnalysis && (
                                  <div className="absolute left-full ml-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900/95 border border-slate-700 rounded-lg p-3 min-w-[200px] z-50 backdrop-blur-md">
                                    <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                      <span className="text-lg">{getEmotionalStateEmoji(emotionalState)}</span>
                                      {getEmotionalStateDescription(emotionalState)}
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-[10px] text-slate-400">
                                        <span className="font-semibold">Confidence:</span> {Math.round(emotionalAnalysis.confidence * 100)}%
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        <span className="font-semibold">Coachingstil:</span> {emotionalAnalysis.recommendedStyle}
                                      </div>
                                      {emotionalAnalysis.secondaryState && (
                                        <div className="text-[10px] text-slate-500">
                                          <span className="font-semibold">Sekundär:</span> {getEmotionalStateDescription(emotionalAnalysis.secondaryState)}
                                        </div>
                                      )}
                                      <div className="pt-2 border-t border-slate-700">
                                        <div className="text-[10px] text-slate-300 italic">
                                          {emotionalAnalysis.recommendedStyle === 'ENCOURAGING' && 'Du gör bra ifrån dig! Fortsätt så!'}
                                          {emotionalAnalysis.recommendedStyle === 'CALMING' && 'Ta det lugnt, en rörelse i taget.'}
                                          {emotionalAnalysis.recommendedStyle === 'CHALLENGING' && 'Utmana dig själv lite extra!'}
                                          {emotionalAnalysis.recommendedStyle === 'SUPPORTIVE' && 'Det är okej att ta pauser.'}
                                          {emotionalAnalysis.recommendedStyle === 'CELEBRATORY' && 'Fantastiskt jobbat!'}
                                          {emotionalAnalysis.recommendedStyle === 'MOTIVATING' && 'Bara några reps till!'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                        )}

                        {/* AVERAGE ROM (after reps) */}
                        {sessionRomHistory.current.length > 0 && (
                            <div className="text-center bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                                <div className="text-[10px] text-slate-500 uppercase">Snitt ROM</div>
                                <div className="text-sm font-bold text-cyan-300">{getAverageROM()}°</div>
                            </div>
                        )}
                     </div>
                 </>
             )}
          </div>

          {/* Feedback Bar */}
          <div className="p-4 md:p-5 bg-slate-950 border-t border-slate-800 relative min-h-[80px] flex items-center">
             <div className="flex items-center gap-3 md:gap-4 w-full">
                 <div className={`p-2.5 md:p-3 rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.5)] ${activeIssues.length > 0 ? 'border-red-500 bg-red-950 text-red-500' : 'border-emerald-500 bg-emerald-950 text-emerald-500'}`}>
                    {activeIssues.length > 0 ? <Zap size={18} /> : <Target size={18} />}
                 </div>
                 <div className="flex-1 min-w-0">
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Live Feedback</p>
                     <p className={`text-sm md:text-base font-bold leading-tight truncate ${activeIssues.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {feedback}
                     </p>
                 </div>

                 {/* Control Buttons */}
                 <div className="flex items-center gap-2">
                   {/* Mirror Toggle */}
                   <button
                     onClick={() => setIsMirrored(prev => !prev)}
                     className={`p-2.5 rounded-xl transition-all ${
                       isMirrored
                         ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                         : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                     }`}
                     title={isMirrored ? 'Spegelvänd (på)' : 'Spegelvänd (av)'}
                     aria-label="Växla spegelvy"
                   >
                     <FlipHorizontal size={18} />
                   </button>

                   {/* Pause/Play Button */}
                   {isCalibrated && (
                     <button
                       onClick={togglePause}
                       className={`p-2.5 rounded-xl font-semibold transition-all ${
                         isPaused
                           ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                           : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                       }`}
                       title={isPaused ? 'Fortsätt' : 'Pausa'}
                       aria-label={isPaused ? 'Fortsätt träning' : 'Pausa träning'}
                     >
                       {isPaused ? <Play size={18} /> : <Pause size={18} />}
                     </button>
                   )}
                 </div>
             </div>
          </div>
      </div>

      {/* INTEGRATED: Exercise Summary Modal */}
      {showSummary && sessionScores.length > 0 && (
        <ExerciseSummary
          exerciseName={exerciseName}
          repScores={sessionScores}
          totalDuration={(Date.now() - sessionStartTime) / 1000}
          romAchieved={romData.currentROM > 0 ? Math.round((romData.currentROM / 90) * 100) : getAverageROM()}
          onClose={async () => {
            // Save movement session before closing
            const avgScore = sessionScores.length > 0
              ? Math.round(sessionScores.reduce((a, b) => a + b.overall, 0) / sessionScores.length)
              : 0;

            const session: MovementSession = {
              id: `session-${Date.now()}`,
              exerciseName,
              sessionDate: new Date().toISOString(),
              duration: (Date.now() - sessionStartTime) / 1000,
              repsCompleted: sessionScores.length,
              repScores: sessionScores,
              averageScore: avgScore,
              romAchieved: romData.currentROM > 0 ? Math.round((romData.currentROM / 90) * 100) : getAverageROM(),
              formIssues: sessionScores.flatMap(s => s.issues)
            };

            await storageService.saveMovementSession(session);

            setShowSummary(false);
            onClose();
          }}
          onRetry={() => {
            // Reset session
            setShowSummary(false);
            setSessionScores([]);
            setReps(0);
            setCurrentRepScore(null);
            setFormScore(100);
            repScoringService.reset();
            poseReconstructor.resetSmoothing();
          }}
        />
      )}
    </div>
  );
};

export default AIMovementCoach;
