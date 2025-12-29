/**
 * AvatarFeedbackOverlay.tsx
 *
 * Real-time form feedback overlay for 3D avatar exercises.
 * Shows pose quality, correction hints, and progress indicators.
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { JOINT_POSITIONS } from './VisualCues';

// ============================================================================
// TYPES
// ============================================================================

export interface FormFeedback {
  joint: string;
  quality: 'excellent' | 'good' | 'needs_work' | 'incorrect';
  message: string;
  correctionAngle?: number;
  correctionDirection?: THREE.Vector3;
}

export interface PoseComparison {
  targetPose: Record<string, { x: number; y: number; z: number }>;
  currentPose: Record<string, { x: number; y: number; z: number }>;
  deviations: Record<string, number>;
}

interface AvatarFeedbackOverlayProps {
  feedback: FormFeedback[];
  poseComparison?: PoseComparison;
  overallScore?: number;
  showGhostPose?: boolean;
  showCorrectionArrows?: boolean;
  showScoreDisplay?: boolean;
  showMuscleActivation?: boolean;
  activeMuscles?: string[];
  highContrastMode?: boolean;
}

// ============================================================================
// QUALITY COLORS
// ============================================================================

const QUALITY_COLORS = {
  excellent: '#22c55e',
  good: '#84cc16',
  needs_work: '#f59e0b',
  incorrect: '#ef4444',
};

const QUALITY_COLORS_HIGH_CONTRAST = {
  excellent: '#00FF00',
  good: '#FFFF00',
  needs_work: '#FF8000',
  incorrect: '#FF00FF',
};

// ============================================================================
// MUSCLE POSITIONS FOR ACTIVATION VISUALIZATION
// ============================================================================

const MUSCLE_POSITIONS: Record<string, { position: THREE.Vector3; size: number }> = {
  quadriceps: { position: new THREE.Vector3(0, 0.55, 0.05), size: 0.15 },
  hamstrings: { position: new THREE.Vector3(0, 0.55, -0.05), size: 0.12 },
  glutes: { position: new THREE.Vector3(0, 0.8, -0.08), size: 0.18 },
  core: { position: new THREE.Vector3(0, 1.05, 0), size: 0.2 },
  chest: { position: new THREE.Vector3(0, 1.3, 0.08), size: 0.15 },
  back: { position: new THREE.Vector3(0, 1.2, -0.1), size: 0.18 },
  biceps: { position: new THREE.Vector3(-0.38, 1.2, 0), size: 0.06 },
  triceps: { position: new THREE.Vector3(-0.38, 1.15, -0.03), size: 0.05 },
  deltoids: { position: new THREE.Vector3(-0.28, 1.4, 0), size: 0.08 },
  calves: { position: new THREE.Vector3(0, 0.25, -0.02), size: 0.06 },
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Joint Quality Indicator - Shows feedback at a specific joint
 */
const JointQualityIndicator: React.FC<{
  joint: string;
  quality: FormFeedback['quality'];
  message: string;
  highContrast?: boolean;
}> = ({ joint, quality, message, highContrast = false }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const position = JOINT_POSITIONS[joint];

  const colors = highContrast ? QUALITY_COLORS_HIGH_CONTRAST : QUALITY_COLORS;
  const color = colors[quality];

  useFrame((state) => {
    if (!ringRef.current) return;
    const time = state.clock.getElapsedTime();

    // Pulse effect for needs_work and incorrect
    if (quality === 'needs_work' || quality === 'incorrect') {
      const scale = 1 + Math.sin(time * 4) * 0.15;
      ringRef.current.scale.setScalar(scale);
    }
  });

  if (!position) return null;

  return (
    <group position={position}>
      {/* Glowing ring around joint */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.015, 16, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Tooltip with message */}
      {(quality === 'needs_work' || quality === 'incorrect') && (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Html
            distanceFactor={10}
            position={[0, 0.15, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className={`
              px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap
              ${highContrast
                ? 'bg-black border-2 border-white text-white'
                : 'bg-slate-900/90 text-white border border-slate-700'
              }
            `}>
              {message}
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
};

/**
 * Correction Arrow - Shows direction to correct a joint position
 */
const CorrectionArrow: React.FC<{
  joint: string;
  direction: THREE.Vector3;
  angle: number;
  highContrast?: boolean;
}> = ({ joint, direction, angle, highContrast = false }) => {
  const arrowRef = useRef<THREE.Group>(null);
  const position = JOINT_POSITIONS[joint];

  useFrame((state) => {
    if (!arrowRef.current) return;
    const time = state.clock.getElapsedTime();

    // Animate arrow movement
    const offset = Math.sin(time * 3) * 0.05;
    arrowRef.current.position.copy(direction.clone().multiplyScalar(offset));
  });

  if (!position || angle < 5) return null;

  // Calculate arrow rotation to point in direction
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

  const color = highContrast ? '#FF8000' : '#f59e0b';
  const arrowLength = Math.min(0.3, angle / 50);

  return (
    <group position={position}>
      <group ref={arrowRef} quaternion={quaternion}>
        {/* Arrow shaft */}
        <mesh position={[0, arrowLength / 2, 0]}>
          <cylinderGeometry args={[0.015, 0.015, arrowLength, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Arrow head */}
        <mesh position={[0, arrowLength + 0.03, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.04, 0.08, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Ghost Pose - Semi-transparent ideal pose overlay
 */
const GhostPose: React.FC<{
  targetPose: PoseComparison['targetPose'];
  opacity?: number;
}> = ({ targetPose, opacity = 0.3 }) => {
  // Render simplified ghost skeleton
  const joints = Object.keys(targetPose);

  return (
    <group>
      {joints.map((jointName) => {
        const position = JOINT_POSITIONS[jointName];
        if (!position) return null;

        return (
          <mesh key={jointName} position={position}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Score Display - Shows overall form score
 */
const ScoreDisplay: React.FC<{
  score: number;
  highContrast?: boolean;
}> = ({ score, highContrast = false }) => {
  const getScoreColor = () => {
    if (score >= 90) return highContrast ? '#00FF00' : '#22c55e';
    if (score >= 70) return highContrast ? '#FFFF00' : '#84cc16';
    if (score >= 50) return highContrast ? '#FF8000' : '#f59e0b';
    return highContrast ? '#FF00FF' : '#ef4444';
  };

  const getScoreLabel = () => {
    if (score >= 90) return 'Utmärkt!';
    if (score >= 70) return 'Bra';
    if (score >= 50) return 'Fortsätt';
    return 'Justera';
  };

  return (
    <Billboard
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
      position={[0, 2.2, 0]}
    >
      <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div className={`
          flex flex-col items-center gap-1 px-4 py-2 rounded-xl
          ${highContrast
            ? 'bg-black border-2 border-white'
            : 'bg-slate-900/95 backdrop-blur-sm border border-slate-700'
          }
        `}>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: getScoreColor() }}
            >
              {Math.round(score)}
            </span>
            <span className={highContrast ? 'text-white text-sm' : 'text-slate-400 text-sm'}>
              /100
            </span>
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: getScoreColor() }}
          >
            {getScoreLabel()}
          </span>
        </div>
      </Html>
    </Billboard>
  );
};

/**
 * Muscle Activation Glow - Shows which muscles are being worked
 */
const MuscleActivationGlow: React.FC<{
  muscle: string;
  intensity?: number;
  highContrast?: boolean;
}> = ({ muscle, intensity = 0.8, highContrast = false }) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const muscleData = MUSCLE_POSITIONS[muscle];

  useFrame((state) => {
    if (!glowRef.current) return;
    const time = state.clock.getElapsedTime();

    // Pulsing glow effect
    const pulse = 0.7 + Math.sin(time * 2) * 0.3;
    glowRef.current.scale.setScalar(1 + pulse * 0.2);

    if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = intensity * pulse * 0.5;
    }
  });

  if (!muscleData) return null;

  const color = highContrast ? '#FF0000' : '#ff6b6b';

  return (
    <mesh ref={glowRef} position={muscleData.position}>
      <sphereGeometry args={[muscleData.size, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AvatarFeedbackOverlay: React.FC<AvatarFeedbackOverlayProps> = ({
  feedback,
  poseComparison,
  overallScore,
  showGhostPose = false,
  showCorrectionArrows = true,
  showScoreDisplay = true,
  showMuscleActivation = true,
  activeMuscles = [],
  highContrastMode = false,
}) => {
  return (
    <group>
      {/* Joint Quality Indicators */}
      {feedback.map((fb) => (
        <JointQualityIndicator
          key={fb.joint}
          joint={fb.joint}
          quality={fb.quality}
          message={fb.message}
          highContrast={highContrastMode}
        />
      ))}

      {/* Correction Arrows */}
      {showCorrectionArrows &&
        feedback
          .filter((fb) => fb.correctionDirection && fb.correctionAngle)
          .map((fb) => (
            <CorrectionArrow
              key={`arrow-${fb.joint}`}
              joint={fb.joint}
              direction={fb.correctionDirection!}
              angle={fb.correctionAngle!}
              highContrast={highContrastMode}
            />
          ))}

      {/* Ghost Pose */}
      {showGhostPose && poseComparison && (
        <GhostPose targetPose={poseComparison.targetPose} opacity={0.25} />
      )}

      {/* Overall Score */}
      {showScoreDisplay && overallScore !== undefined && (
        <ScoreDisplay score={overallScore} highContrast={highContrastMode} />
      )}

      {/* Muscle Activation */}
      {showMuscleActivation &&
        activeMuscles.map((muscle) => (
          <MuscleActivationGlow
            key={muscle}
            muscle={muscle}
            highContrast={highContrastMode}
          />
        ))}
    </group>
  );
};

export default AvatarFeedbackOverlay;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate form quality based on pose deviation
 */
export function calculateFormQuality(deviation: number): FormFeedback['quality'] {
  if (deviation < 5) return 'excellent';
  if (deviation < 15) return 'good';
  if (deviation < 30) return 'needs_work';
  return 'incorrect';
}

/**
 * Generate feedback messages based on joint and quality
 */
export function generateFeedbackMessage(
  joint: string,
  quality: FormFeedback['quality'],
  deviation: number
): string {
  const jointNames: Record<string, string> = {
    leftKnee: 'vänster knä',
    rightKnee: 'höger knä',
    leftHip: 'vänster höft',
    rightHip: 'höger höft',
    leftShoulder: 'vänster axel',
    rightShoulder: 'höger axel',
    leftElbow: 'vänster armbåge',
    rightElbow: 'höger armbåge',
    spine: 'ryggraden',
    chest: 'bröstkorgen',
    neck: 'nacken',
  };

  const jointName = jointNames[joint] || joint;

  switch (quality) {
    case 'excellent':
      return `Perfekt position för ${jointName}!`;
    case 'good':
      return `Bra, ${jointName} är nästan rätt`;
    case 'needs_work':
      return `Justera ${jointName} (${Math.round(deviation)}° fel)`;
    case 'incorrect':
      return `Korrigera ${jointName} (${Math.round(deviation)}° fel)`;
  }
}

/**
 * Get active muscles for a given exercise mode
 */
export function getActiveMusclesForExercise(exerciseMode: string): string[] {
  const muscleMap: Record<string, string[]> = {
    LEGS: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    SQUAT: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    LUNGE: ['quadriceps', 'glutes', 'hamstrings'],
    CORE: ['core', 'back'],
    PUSH: ['chest', 'triceps', 'deltoids'],
    PULL: ['back', 'biceps'],
    PRESS: ['deltoids', 'triceps', 'chest'],
    SHOULDER: ['deltoids', 'back'],
    BALANCE: ['core', 'calves', 'glutes'],
    STRETCH: [],
    GENERAL: ['core'],
  };

  return muscleMap[exerciseMode] || muscleMap.GENERAL;
}

/**
 * Calculate overall form score from feedback
 */
export function calculateOverallScore(feedback: FormFeedback[]): number {
  if (feedback.length === 0) return 100;

  const qualityScores = {
    excellent: 100,
    good: 80,
    needs_work: 50,
    incorrect: 20,
  };

  const totalScore = feedback.reduce(
    (sum, fb) => sum + qualityScores[fb.quality],
    0
  );

  return totalScore / feedback.length;
}
