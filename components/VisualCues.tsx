/**
 * VisualCues.tsx - Sprint 4
 *
 * Visual guidance overlay for 3D avatar exercise demonstrations.
 * Shows directional arrows, joint highlights, and movement paths.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type VisualCueType = 'arrow' | 'highlight' | 'path' | 'ring' | 'warning';

export interface VisualCue {
  id: string;
  type: VisualCueType;
  targetJoint: string;
  direction?: THREE.Vector3;
  color?: string;
  intensity?: number;
  duration?: number;
  pulseAnimation?: boolean;
  label?: string;
}

export interface JointPosition {
  name: string;
  position: THREE.Vector3;
  isActive?: boolean;
}

// Joint positions on the avatar (approximate world positions)
export const JOINT_POSITIONS: Record<string, THREE.Vector3> = {
  // Head & Neck
  head: new THREE.Vector3(0, 1.7, 0),
  neck: new THREE.Vector3(0, 1.5, 0),

  // Spine
  spine: new THREE.Vector3(0, 1.1, 0),
  chest: new THREE.Vector3(0, 1.3, 0),
  pelvis: new THREE.Vector3(0, 0.9, 0),

  // Left Arm
  leftShoulder: new THREE.Vector3(-0.25, 1.4, 0),
  leftElbow: new THREE.Vector3(-0.4, 1.1, 0),
  leftWrist: new THREE.Vector3(-0.5, 0.85, 0),
  leftHand: new THREE.Vector3(-0.55, 0.8, 0),

  // Right Arm
  rightShoulder: new THREE.Vector3(0.25, 1.4, 0),
  rightElbow: new THREE.Vector3(0.4, 1.1, 0),
  rightWrist: new THREE.Vector3(0.5, 0.85, 0),
  rightHand: new THREE.Vector3(0.55, 0.8, 0),

  // Left Leg
  leftHip: new THREE.Vector3(-0.12, 0.85, 0),
  leftKnee: new THREE.Vector3(-0.12, 0.5, 0),
  leftAnkle: new THREE.Vector3(-0.12, 0.1, 0),
  leftFoot: new THREE.Vector3(-0.12, 0.05, 0.08),

  // Right Leg
  rightHip: new THREE.Vector3(0.12, 0.85, 0),
  rightKnee: new THREE.Vector3(0.12, 0.5, 0),
  rightAnkle: new THREE.Vector3(0.12, 0.1, 0),
  rightFoot: new THREE.Vector3(0.12, 0.05, 0.08),
};

// ============================================================================
// HIGH CONTRAST MODE COLORS
// ============================================================================

/**
 * High contrast color palette for accessibility
 * Designed for color blindness (protanopia, deuteranopia, tritanopia)
 * Uses distinct brightness levels and patterns
 */
export const HIGH_CONTRAST_COLORS = {
  // Primary action colors (white on black provides maximum contrast)
  primary: '#FFFFFF',       // Pure white - primary indicator
  secondary: '#FFFF00',     // Yellow - secondary indicator

  // Status colors (designed to be distinguishable by all types of color blindness)
  success: '#00FF00',       // Bright green
  warning: '#FF8000',       // Orange (instead of red/green which can be confused)
  error: '#FF00FF',         // Magenta (visible to all color blindness types)
  info: '#00FFFF',          // Cyan

  // Movement direction colors
  up: '#00FF00',            // Bright green
  down: '#FF00FF',          // Magenta
  forward: '#00FFFF',       // Cyan
  backward: '#FFFF00',      // Yellow

  // Joint states
  active: '#FFFFFF',        // White for active joints
  inactive: '#808080',      // Gray for inactive
  highlight: '#FFFF00',     // Yellow highlight
};

/**
 * Default colors (normal mode)
 */
export const DEFAULT_COLORS = {
  primary: '#00ff88',       // Green
  secondary: '#0088ff',     // Blue
  success: '#22c55e',       // Green
  warning: '#ff4444',       // Red
  error: '#ef4444',         // Red
  info: '#3b82f6',          // Blue
  up: '#00ff88',
  down: '#ff8800',
  forward: '#0088ff',
  backward: '#ff4444',
  active: '#00ff88',
  inactive: '#666666',
  highlight: '#ffaa00',
};

/**
 * Get color based on contrast mode
 */
export function getContrastColor(
  colorKey: keyof typeof HIGH_CONTRAST_COLORS,
  highContrastMode: boolean
): string {
  return highContrastMode
    ? HIGH_CONTRAST_COLORS[colorKey]
    : DEFAULT_COLORS[colorKey];
}

// Movement direction presets
export const MOVEMENT_DIRECTIONS = {
  up: new THREE.Vector3(0, 1, 0),
  down: new THREE.Vector3(0, -1, 0),
  forward: new THREE.Vector3(0, 0, 1),
  backward: new THREE.Vector3(0, 0, -1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
  upForward: new THREE.Vector3(0, 0.7, 0.7).normalize(),
  upBackward: new THREE.Vector3(0, 0.7, -0.7).normalize(),
  downForward: new THREE.Vector3(0, -0.7, 0.7).normalize(),
  outLeft: new THREE.Vector3(-0.7, 0.7, 0).normalize(),
  outRight: new THREE.Vector3(0.7, 0.7, 0).normalize(),
};

// ============================================================================
// VISUAL CUE COMPONENTS
// ============================================================================

/**
 * Directional Arrow - Shows movement direction from a joint
 */
const DirectionalArrow: React.FC<{
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  color?: string;
  length?: number;
  pulse?: boolean;
  intensity?: number;
}> = ({ origin, direction, color = '#00ff88', length = 0.35, pulse = true, intensity = 1 }) => {
  const arrowRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!arrowRef.current) return;

    const time = state.clock.getElapsedTime();

    if (pulse) {
      // Pulsing opacity and scale
      const pulseValue = 0.6 + Math.sin(time * 3) * 0.4;
      arrowRef.current.scale.setScalar(0.9 + Math.sin(time * 2) * 0.1);

      // Update glow intensity
      if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = pulseValue * 0.3 * intensity;
      }
    }
  });

  // Create arrow geometry
  const arrowGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Arrow head shape
    shape.moveTo(0, length);
    shape.lineTo(-0.06, length - 0.12);
    shape.lineTo(-0.025, length - 0.12);
    shape.lineTo(-0.025, 0);
    shape.lineTo(0.025, 0);
    shape.lineTo(0.025, length - 0.12);
    shape.lineTo(0.06, length - 0.12);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: false,
    });
  }, [length]);

  // Calculate rotation to align with direction
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return q;
  }, [direction]);

  return (
    <group ref={arrowRef} position={origin} quaternion={quaternion}>
      {/* Main arrow */}
      <mesh geometry={arrowGeometry} position={[0, 0, -0.01]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5 * intensity}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} geometry={arrowGeometry} position={[0, 0, -0.02]} scale={1.3}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

/**
 * Joint Highlight - Glowing ring around a joint
 */
const JointHighlight: React.FC<{
  position: THREE.Vector3;
  color?: string;
  radius?: number;
  pulse?: boolean;
  intensity?: number;
  isWarning?: boolean;
}> = ({ position, color = '#00d4ff', radius = 0.08, pulse = true, intensity = 1, isWarning = false }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (ringRef.current) {
      // Rotate ring
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = time * (isWarning ? 2 : 0.5);

      if (pulse) {
        const scale = 1 + Math.sin(time * (isWarning ? 5 : 3)) * 0.15;
        ringRef.current.scale.setScalar(scale);
      }
    }

    if (glowRef.current) {
      glowRef.current.rotation.x = Math.PI / 2;
      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = (0.3 + Math.sin(time * 4) * 0.2) * intensity;
      }
    }
  });

  const effectiveColor = isWarning ? '#ff4444' : color;

  return (
    <group position={position}>
      {/* Main ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[radius, 0.01, 8, 32]} />
        <meshStandardMaterial
          color={effectiveColor}
          emissive={effectiveColor}
          emissiveIntensity={0.8 * intensity}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef}>
        <torusGeometry args={[radius * 1.3, 0.02, 8, 32]} />
        <meshBasicMaterial
          color={effectiveColor}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Center point */}
      <mesh>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial
          color={effectiveColor}
          emissive={effectiveColor}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
};

/**
 * Movement Path - Curved line showing movement trajectory
 */
const MovementPath: React.FC<{
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  color?: string;
  animated?: boolean;
  intensity?: number;
}> = ({ startPosition, endPosition, color = '#88ff00', animated = true, intensity = 1 }) => {
  const materialRef = useRef<THREE.LineDashedMaterial>(null);
  const progressRef = useRef(0);

  const curve = useMemo(() => {
    // Create curved path between points
    const midPoint = new THREE.Vector3()
      .addVectors(startPosition, endPosition)
      .multiplyScalar(0.5);

    // Add arc to the path
    const direction = new THREE.Vector3().subVectors(endPosition, startPosition);
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
    midPoint.add(perpendicular.multiplyScalar(0.1));
    midPoint.y += 0.1;

    return new THREE.QuadraticBezierCurve3(startPosition, midPoint, endPosition);
  }, [startPosition, endPosition]);

  const points = useMemo(() => curve.getPoints(30), [curve]);
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [points]);

  useFrame((state) => {
    if (!materialRef.current || !animated) return;

    const time = state.clock.getElapsedTime();
    progressRef.current = (Math.sin(time * 2) + 1) / 2;

    // Animate dash offset using material ref
    (materialRef.current as any).dashOffset = -time * 0.5;
  });

  return (
    <group>
      <primitive object={new THREE.Line(geometry, new THREE.LineDashedMaterial({
        color: color,
        dashSize: 0.05,
        gapSize: 0.03,
        opacity: 0.7 * intensity,
        transparent: true,
      }))} />

      {/* End point indicator */}
      <mesh position={endPosition}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

/**
 * Pulsing Ring - Expanding ring effect for emphasis
 */
const PulsingRing: React.FC<{
  position: THREE.Vector3;
  color?: string;
  maxRadius?: number;
  speed?: number;
}> = ({ position, color = '#00ffff', maxRadius = 0.2, speed = 1 }) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = (time * speed) % 1;

    const scale = 0.5 + progress * maxRadius * 2;
    ringRef.current.scale.setScalar(scale);

    if (ringRef.current.material instanceof THREE.MeshBasicMaterial) {
      ringRef.current.material.opacity = (1 - progress) * 0.5;
    }

    ringRef.current.rotation.x = Math.PI / 2;
  });

  return (
    <mesh ref={ringRef} position={position}>
      <ringGeometry args={[0.08, 0.1, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// ============================================================================
// MAIN VISUAL CUES COMPONENT
// ============================================================================

interface VisualCuesProps {
  cues: VisualCue[];
  visible?: boolean;
  globalIntensity?: number;
  activeJoints?: string[];
  currentPhase?: string;
  /** Enable high contrast mode for accessibility (color blindness support) */
  highContrastMode?: boolean;
}

/**
 * VisualCues - Main component that renders all visual guidance elements
 */
const VisualCues: React.FC<VisualCuesProps> = ({
  cues,
  visible = true,
  globalIntensity = 1,
  activeJoints = [],
  currentPhase,
  highContrastMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  /**
   * Get the appropriate color based on high contrast mode
   * If cue has a specific color and not in high contrast mode, use it
   * Otherwise use high contrast colors
   */
  const getCueColor = (cue: VisualCue, defaultKey: keyof typeof HIGH_CONTRAST_COLORS): string => {
    if (highContrastMode) {
      return HIGH_CONTRAST_COLORS[defaultKey];
    }
    return cue.color || DEFAULT_COLORS[defaultKey];
  };

  // Fade in/out effect
  useFrame(() => {
    if (!groupRef.current) return;

    const targetOpacity = visible ? 1 : 0;
    groupRef.current.visible = visible;
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {cues.map((cue) => {
        const jointPos = JOINT_POSITIONS[cue.targetJoint];
        if (!jointPos) return null;

        const isActive = activeJoints.includes(cue.targetJoint);
        // In high contrast mode, increase intensity for better visibility
        const baseIntensity = highContrastMode ? 1.5 : 1;
        const intensity = (cue.intensity ?? 1) * globalIntensity * baseIntensity * (isActive ? 1.2 : 0.8);

        switch (cue.type) {
          case 'arrow':
            return (
              <DirectionalArrow
                key={cue.id}
                origin={jointPos}
                direction={cue.direction || MOVEMENT_DIRECTIONS.up}
                color={getCueColor(cue, 'primary')}
                pulse={cue.pulseAnimation ?? true}
                intensity={intensity}
              />
            );

          case 'highlight':
            return (
              <JointHighlight
                key={cue.id}
                position={jointPos}
                color={getCueColor(cue, 'highlight')}
                pulse={cue.pulseAnimation ?? true}
                intensity={intensity}
              />
            );

          case 'warning':
            return (
              <JointHighlight
                key={cue.id}
                position={jointPos}
                color={highContrastMode ? HIGH_CONTRAST_COLORS.error : '#ff4444'}
                pulse={true}
                intensity={intensity}
                isWarning={true}
              />
            );

          case 'ring':
            return (
              <PulsingRing
                key={cue.id}
                position={jointPos}
                color={getCueColor(cue, 'secondary')}
              />
            );

          case 'path':
            // Path requires two joints - use direction as end offset
            if (cue.direction) {
              const endPos = jointPos.clone().add(cue.direction.clone().multiplyScalar(0.3));
              return (
                <MovementPath
                  key={cue.id}
                  startPosition={jointPos}
                  endPosition={endPos}
                  color={cue.color}
                  intensity={intensity}
                />
              );
            }
            return null;

          default:
            return null;
        }
      })}

      {/* Auto-highlight active joints */}
      {activeJoints.map((jointName) => {
        const jointPos = JOINT_POSITIONS[jointName];
        if (!jointPos) return null;

        // Don't duplicate if already in cues
        if (cues.some(c => c.targetJoint === jointName && c.type === 'highlight')) {
          return null;
        }

        return (
          <JointHighlight
            key={`active-${jointName}`}
            position={jointPos}
            color="#00d4ff"
            pulse={true}
            intensity={globalIntensity * 0.7}
          />
        );
      })}
    </group>
  );
};

// ============================================================================
// PRESET CUE GENERATORS
// ============================================================================

/**
 * Generate cues for shoulder exercises
 */
export function generateShoulderCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Lyft' || phase === 'CONCENTRIC') {
    cues.push(
      {
        id: 'left-shoulder-up',
        type: 'arrow',
        targetJoint: 'leftShoulder',
        direction: MOVEMENT_DIRECTIONS.upForward,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'right-shoulder-up',
        type: 'arrow',
        targetJoint: 'rightShoulder',
        direction: MOVEMENT_DIRECTIONS.upForward,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'left-elbow-highlight',
        type: 'highlight',
        targetJoint: 'leftElbow',
        color: '#00d4ff',
      },
      {
        id: 'right-elbow-highlight',
        type: 'highlight',
        targetJoint: 'rightElbow',
        color: '#00d4ff',
      }
    );
  } else if (phase === 'Sänk' || phase === 'ECCENTRIC') {
    cues.push(
      {
        id: 'left-shoulder-down',
        type: 'arrow',
        targetJoint: 'leftShoulder',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      },
      {
        id: 'right-shoulder-down',
        type: 'arrow',
        targetJoint: 'rightShoulder',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      }
    );
  }

  return cues;
}

/**
 * Generate cues for squat exercises
 */
export function generateSquatCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Ner' || phase === 'ECCENTRIC') {
    cues.push(
      {
        id: 'hip-down',
        type: 'arrow',
        targetJoint: 'pelvis',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      },
      {
        id: 'left-knee-highlight',
        type: 'highlight',
        targetJoint: 'leftKnee',
        color: '#00d4ff',
      },
      {
        id: 'right-knee-highlight',
        type: 'highlight',
        targetJoint: 'rightKnee',
        color: '#00d4ff',
      }
    );
  } else if (phase === 'Upp' || phase === 'CONCENTRIC') {
    cues.push(
      {
        id: 'hip-up',
        type: 'arrow',
        targetJoint: 'pelvis',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'chest-up',
        type: 'arrow',
        targetJoint: 'chest',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
        intensity: 0.7,
      }
    );
  } else if (phase === 'Håll' || phase === 'HOLD') {
    cues.push(
      {
        id: 'left-knee-ring',
        type: 'ring',
        targetJoint: 'leftKnee',
        color: '#ffff00',
      },
      {
        id: 'right-knee-ring',
        type: 'ring',
        targetJoint: 'rightKnee',
        color: '#ffff00',
      }
    );
  }

  return cues;
}

/**
 * Generate cues for stretch exercises
 */
export function generateStretchCues(phase: string, targetArea: string): VisualCue[] {
  const cues: VisualCue[] = [];

  switch (targetArea) {
    case 'hip_flexor':
      cues.push({
        id: 'hip-forward',
        type: 'arrow',
        targetJoint: 'pelvis',
        direction: MOVEMENT_DIRECTIONS.forward,
        color: '#88ff00',
      });
      break;

    case 'hamstring':
      cues.push({
        id: 'reach-down',
        type: 'arrow',
        targetJoint: 'spine',
        direction: MOVEMENT_DIRECTIONS.downForward,
        color: '#88ff00',
      });
      break;

    case 'shoulder':
      cues.push(
        {
          id: 'arm-across',
          type: 'arrow',
          targetJoint: 'rightShoulder',
          direction: MOVEMENT_DIRECTIONS.left,
          color: '#88ff00',
        },
        {
          id: 'shoulder-highlight',
          type: 'highlight',
          targetJoint: 'rightShoulder',
          color: '#00d4ff',
        }
      );
      break;
  }

  return cues;
}

/**
 * Generate warning cues for form issues
 */
export function generateWarningCues(issues: string[]): VisualCue[] {
  const cues: VisualCue[] = [];

  issues.forEach((issue, idx) => {
    if (issue.includes('knee_valgus') || issue.includes('knä')) {
      cues.push(
        {
          id: `warning-left-knee-${idx}`,
          type: 'warning',
          targetJoint: 'leftKnee',
        },
        {
          id: `warning-right-knee-${idx}`,
          type: 'warning',
          targetJoint: 'rightKnee',
        }
      );
    }

    if (issue.includes('forward_lean') || issue.includes('framåtlutning')) {
      cues.push({
        id: `warning-spine-${idx}`,
        type: 'warning',
        targetJoint: 'spine',
      });
    }

    if (issue.includes('shoulder') || issue.includes('axel')) {
      cues.push({
        id: `warning-shoulder-${idx}`,
        type: 'warning',
        targetJoint: 'leftShoulder',
      });
    }
  });

  return cues;
}

// ============================================================================
// SPRINT 5: EXPANDED CUE GENERATORS FOR ALL EXERCISE TYPES
// ============================================================================

/**
 * Generate cues for CORE exercises (planka, sit-ups, etc)
 */
export function generateCoreCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Håll' || phase === 'HOLD' || phase === 'ISOMETRIC') {
    // Core engagement indicators
    cues.push(
      {
        id: 'core-spine-straight',
        type: 'highlight',
        targetJoint: 'spine',
        color: '#00ffaa',
        pulseAnimation: true,
      },
      {
        id: 'core-pelvis-neutral',
        type: 'ring',
        targetJoint: 'pelvis',
        color: '#ffaa00',
      },
      {
        id: 'core-chest-stable',
        type: 'highlight',
        targetJoint: 'chest',
        color: '#00d4ff',
      }
    );
  } else if (phase === 'Lyft' || phase === 'CONCENTRIC') {
    // Crunch / sit-up upward motion
    cues.push(
      {
        id: 'core-chest-up',
        type: 'arrow',
        targetJoint: 'chest',
        direction: MOVEMENT_DIRECTIONS.upForward,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'core-neck-neutral',
        type: 'highlight',
        targetJoint: 'neck',
        color: '#ffaa00',
        intensity: 0.6,
      }
    );
  } else if (phase === 'Sänk' || phase === 'ECCENTRIC') {
    cues.push({
      id: 'core-chest-down',
      type: 'arrow',
      targetJoint: 'chest',
      direction: MOVEMENT_DIRECTIONS.down,
      color: '#ff8800',
      pulseAnimation: true,
    });
  }

  return cues;
}

/**
 * Generate cues for BALANCE exercises
 */
export function generateBalanceCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Håll' || phase === 'HOLD' || phase === 'Balans') {
    // Balance stability indicators
    cues.push(
      {
        id: 'balance-foot-stable',
        type: 'ring',
        targetJoint: 'leftFoot',
        color: '#00ffaa',
      },
      {
        id: 'balance-pelvis-center',
        type: 'highlight',
        targetJoint: 'pelvis',
        color: '#ffff00',
        pulseAnimation: true,
      },
      {
        id: 'balance-core-engaged',
        type: 'highlight',
        targetJoint: 'spine',
        color: '#00d4ff',
      }
    );
  } else if (phase === 'Lyft' || phase === 'CONCENTRIC') {
    // Leg lift
    cues.push(
      {
        id: 'balance-leg-up',
        type: 'arrow',
        targetJoint: 'rightKnee',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'balance-hip-highlight',
        type: 'highlight',
        targetJoint: 'rightHip',
        color: '#00d4ff',
      }
    );
  }

  return cues;
}

/**
 * Generate cues for PUSH exercises (armhävningar, press)
 */
export function generatePushCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Ner' || phase === 'ECCENTRIC') {
    // Lowering phase
    cues.push(
      {
        id: 'push-chest-down',
        type: 'arrow',
        targetJoint: 'chest',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      },
      {
        id: 'push-left-elbow-bend',
        type: 'highlight',
        targetJoint: 'leftElbow',
        color: '#00d4ff',
      },
      {
        id: 'push-right-elbow-bend',
        type: 'highlight',
        targetJoint: 'rightElbow',
        color: '#00d4ff',
      }
    );
  } else if (phase === 'Upp' || phase === 'CONCENTRIC') {
    // Pushing up
    cues.push(
      {
        id: 'push-chest-up',
        type: 'arrow',
        targetJoint: 'chest',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'push-core-stable',
        type: 'ring',
        targetJoint: 'pelvis',
        color: '#ffff00',
      }
    );
  } else if (phase === 'Håll' || phase === 'HOLD') {
    cues.push({
      id: 'push-hold-core',
      type: 'highlight',
      targetJoint: 'spine',
      color: '#ffaa00',
      pulseAnimation: true,
    });
  }

  return cues;
}

/**
 * Generate cues for PULL exercises (rodd, curls)
 */
export function generatePullCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Dra' || phase === 'CONCENTRIC') {
    // Pulling phase
    cues.push(
      {
        id: 'pull-elbows-back',
        type: 'arrow',
        targetJoint: 'leftElbow',
        direction: MOVEMENT_DIRECTIONS.backward,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'pull-elbows-back-right',
        type: 'arrow',
        targetJoint: 'rightElbow',
        direction: MOVEMENT_DIRECTIONS.backward,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'pull-shoulder-blades',
        type: 'highlight',
        targetJoint: 'chest',
        color: '#00d4ff',
      }
    );
  } else if (phase === 'Sträck' || phase === 'ECCENTRIC') {
    // Release phase
    cues.push(
      {
        id: 'pull-arms-forward',
        type: 'arrow',
        targetJoint: 'leftWrist',
        direction: MOVEMENT_DIRECTIONS.forward,
        color: '#ff8800',
        pulseAnimation: true,
      },
      {
        id: 'pull-arms-forward-right',
        type: 'arrow',
        targetJoint: 'rightWrist',
        direction: MOVEMENT_DIRECTIONS.forward,
        color: '#ff8800',
        pulseAnimation: true,
      }
    );
  } else if (phase === 'Håll' || phase === 'HOLD') {
    cues.push(
      {
        id: 'pull-squeeze',
        type: 'ring',
        targetJoint: 'chest',
        color: '#ffff00',
      }
    );
  }

  return cues;
}

/**
 * Generate cues for LUNGE exercises
 */
export function generateLungeCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Steg' || phase === 'Ner' || phase === 'ECCENTRIC') {
    // Step forward and lower
    cues.push(
      {
        id: 'lunge-front-knee',
        type: 'highlight',
        targetJoint: 'leftKnee',
        color: '#00d4ff',
        pulseAnimation: true,
      },
      {
        id: 'lunge-back-knee',
        type: 'arrow',
        targetJoint: 'rightKnee',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      },
      {
        id: 'lunge-hip-drop',
        type: 'arrow',
        targetJoint: 'pelvis',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        intensity: 0.7,
      }
    );
  } else if (phase === 'Upp' || phase === 'CONCENTRIC') {
    // Return to standing
    cues.push(
      {
        id: 'lunge-push-up',
        type: 'arrow',
        targetJoint: 'leftFoot',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'lunge-hip-rise',
        type: 'arrow',
        targetJoint: 'pelvis',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
      }
    );
  } else if (phase === 'Håll' || phase === 'HOLD') {
    cues.push(
      {
        id: 'lunge-knee-align',
        type: 'ring',
        targetJoint: 'leftKnee',
        color: '#ffff00',
      },
      {
        id: 'lunge-core-engaged',
        type: 'highlight',
        targetJoint: 'spine',
        color: '#00d4ff',
      }
    );
  }

  return cues;
}

/**
 * Generate cues for PRESS exercises (overhead press, etc)
 */
export function generatePressCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase === 'Press' || phase === 'Lyft' || phase === 'CONCENTRIC') {
    cues.push(
      {
        id: 'press-arms-up',
        type: 'arrow',
        targetJoint: 'leftWrist',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'press-arms-up-right',
        type: 'arrow',
        targetJoint: 'rightWrist',
        direction: MOVEMENT_DIRECTIONS.up,
        color: '#00ff88',
        pulseAnimation: true,
      },
      {
        id: 'press-core-stable',
        type: 'highlight',
        targetJoint: 'spine',
        color: '#ffaa00',
      }
    );
  } else if (phase === 'Sänk' || phase === 'ECCENTRIC') {
    cues.push(
      {
        id: 'press-arms-down',
        type: 'arrow',
        targetJoint: 'leftElbow',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      },
      {
        id: 'press-arms-down-right',
        type: 'arrow',
        targetJoint: 'rightElbow',
        direction: MOVEMENT_DIRECTIONS.down,
        color: '#ff8800',
        pulseAnimation: true,
      }
    );
  }

  return cues;
}

/**
 * Generate generic cues for any exercise (fallback)
 */
export function generateGeneralCues(phase: string): VisualCue[] {
  const cues: VisualCue[] = [];

  if (phase.toLowerCase().includes('lyft') || phase === 'CONCENTRIC') {
    cues.push({
      id: 'general-up',
      type: 'arrow',
      targetJoint: 'chest',
      direction: MOVEMENT_DIRECTIONS.up,
      color: '#00ff88',
      pulseAnimation: true,
    });
  } else if (phase.toLowerCase().includes('sänk') || phase.toLowerCase().includes('ner') || phase === 'ECCENTRIC') {
    cues.push({
      id: 'general-down',
      type: 'arrow',
      targetJoint: 'pelvis',
      direction: MOVEMENT_DIRECTIONS.down,
      color: '#ff8800',
      pulseAnimation: true,
    });
  } else if (phase.toLowerCase().includes('håll') || phase === 'HOLD') {
    cues.push({
      id: 'general-hold',
      type: 'ring',
      targetJoint: 'spine',
      color: '#ffff00',
    });
  }

  // Always show core engagement for stability
  cues.push({
    id: 'general-core',
    type: 'highlight',
    targetJoint: 'pelvis',
    color: '#00d4ff',
    intensity: 0.5,
  });

  return cues;
}

// ============================================================================
// UNIVERSAL CUE GENERATOR
// ============================================================================

export type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'CORE' | 'STRETCH' | 'BALANCE' | 'PUSH' | 'SHOULDER' | 'GENERAL';

/**
 * Universal cue generator - automatically selects the right generator based on exercise mode
 */
export function generateCuesForExercise(
  exerciseMode: ExerciseMode,
  phase: string,
  options?: { targetArea?: string }
): VisualCue[] {
  switch (exerciseMode) {
    case 'SHOULDER':
      return generateShoulderCues(phase);
    case 'LEGS':
      return generateSquatCues(phase);
    case 'CORE':
      return generateCoreCues(phase);
    case 'BALANCE':
      return generateBalanceCues(phase);
    case 'PUSH':
      return generatePushCues(phase);
    case 'PULL':
      return generatePullCues(phase);
    case 'LUNGE':
      return generateLungeCues(phase);
    case 'PRESS':
      return generatePressCues(phase);
    case 'STRETCH':
      return generateStretchCues(phase, options?.targetArea || 'general');
    case 'GENERAL':
    default:
      return generateGeneralCues(phase);
  }
}

/**
 * Generate form validation cues based on body position data
 */
export function generateFormValidationCues(formData: {
  kneeAlignment?: 'good' | 'valgus' | 'varus';
  spinePosition?: 'neutral' | 'flexion' | 'extension';
  shoulderPosition?: 'retracted' | 'protracted' | 'neutral';
  hipAngle?: number;
}): VisualCue[] {
  const cues: VisualCue[] = [];

  // Knee alignment check
  if (formData.kneeAlignment === 'valgus') {
    cues.push(
      {
        id: 'form-knee-valgus-left',
        type: 'warning',
        targetJoint: 'leftKnee',
        color: '#ff4444',
      },
      {
        id: 'form-knee-valgus-right',
        type: 'warning',
        targetJoint: 'rightKnee',
        color: '#ff4444',
      }
    );
  } else if (formData.kneeAlignment === 'good') {
    cues.push(
      {
        id: 'form-knee-good-left',
        type: 'highlight',
        targetJoint: 'leftKnee',
        color: '#00ff88',
        intensity: 0.6,
      },
      {
        id: 'form-knee-good-right',
        type: 'highlight',
        targetJoint: 'rightKnee',
        color: '#00ff88',
        intensity: 0.6,
      }
    );
  }

  // Spine position check
  if (formData.spinePosition === 'flexion') {
    cues.push({
      id: 'form-spine-flexion',
      type: 'warning',
      targetJoint: 'spine',
      color: '#ffaa00',
    });
  } else if (formData.spinePosition === 'neutral') {
    cues.push({
      id: 'form-spine-neutral',
      type: 'highlight',
      targetJoint: 'spine',
      color: '#00ff88',
      intensity: 0.5,
    });
  }

  // Shoulder position check
  if (formData.shoulderPosition === 'protracted') {
    cues.push(
      {
        id: 'form-shoulder-protracted-left',
        type: 'arrow',
        targetJoint: 'leftShoulder',
        direction: MOVEMENT_DIRECTIONS.backward,
        color: '#ffaa00',
        pulseAnimation: true,
      },
      {
        id: 'form-shoulder-protracted-right',
        type: 'arrow',
        targetJoint: 'rightShoulder',
        direction: MOVEMENT_DIRECTIONS.backward,
        color: '#ffaa00',
        pulseAnimation: true,
      }
    );
  }

  return cues;
}

export default VisualCues;
