/**
 * Skeletal Avatar Component
 * A procedural avatar with proper bone hierarchy and keyframe animation support
 */

import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import {
  AvatarAnimationController,
  ExerciseAnimationData,
  JointRotation,
  applySecondaryMotionToPose,
  resetSecondaryMotionState,
} from '../services/avatarAnimationService';
import {
  muscleDeformationService,
  getDefaultJointAngles,
  JointAngles,
} from '../services/muscleDeformationService';
import {
  balanceService,
  calculateNaturalSway,
} from '../services/balanceService';
import { useFootIK } from '../services/footIKService';

// Bone structure for the skeletal system
interface BoneNode {
  name: string;
  ref: React.RefObject<THREE.Group>;
  children: BoneNode[];
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
}

// LOD levels for performance optimization
export type LODLevel = 'high' | 'medium' | 'low';

const LOD_CONFIG = {
  high: { sphereSegments: 32, cylinderSegments: 16 },
  medium: { sphereSegments: 16, cylinderSegments: 8 },
  low: { sphereSegments: 8, cylinderSegments: 6 },
};

interface SkeletalAvatarProps {
  animation: ExerciseAnimationData | null;
  isPlaying: boolean;
  tempo?: number;
  onPhaseChange?: (phaseName: string) => void;
  emotion?: 'neutral' | 'happy' | 'focused' | 'encouraging';
  isSpeaking?: boolean;
  /** LOD level for performance */
  lodLevel?: LODLevel;
  /** Exercise intensity 0-1 for breathing rate */
  exerciseIntensity?: number;
  /** Enable muscle deformation */
  enableMuscleDeformation?: boolean;
  /** Enable IK for foot placement */
  enableFootIK?: boolean;
  /** Enable natural body sway */
  enableSway?: boolean;
}

// Joint rotation helper
const applyJointRotation = (
  ref: React.RefObject<THREE.Group>,
  rotation: JointRotation | undefined,
  lerpFactor: number = 0.1
) => {
  if (!ref.current || !rotation) return;

  ref.current.rotation.x = THREE.MathUtils.lerp(
    ref.current.rotation.x,
    rotation.x,
    lerpFactor
  );
  ref.current.rotation.y = THREE.MathUtils.lerp(
    ref.current.rotation.y,
    rotation.y,
    lerpFactor
  );
  ref.current.rotation.z = THREE.MathUtils.lerp(
    ref.current.rotation.z,
    rotation.z,
    lerpFactor
  );
};

const SkeletalAvatarComponent: React.FC<SkeletalAvatarProps> = ({
  animation,
  isPlaying,
  tempo = 1,
  onPhaseChange,
  emotion = 'neutral',
  isSpeaking = false,
  lodLevel = 'high',
  exerciseIntensity = 0,
  enableMuscleDeformation = true,
  enableFootIK = false,
  enableSway = true,
}) => {
  // Get LOD configuration
  const lodConfig = LOD_CONFIG[lodLevel];
  // Root group ref
  const rootRef = useRef<THREE.Group>(null);

  // Skeleton bone refs - hierarchical structure
  const hipsRef = useRef<THREE.Group>(null);
  const spineRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const neckRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Left arm chain
  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftUpperArmRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const leftWristRef = useRef<THREE.Group>(null);

  // Right arm chain
  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightUpperArmRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const rightWristRef = useRef<THREE.Group>(null);

  // Left leg chain
  const leftHipRef = useRef<THREE.Group>(null);
  const leftUpperLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const leftAnkleRef = useRef<THREE.Group>(null);

  // Right leg chain
  const rightHipRef = useRef<THREE.Group>(null);
  const rightUpperLegRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const rightAnkleRef = useRef<THREE.Group>(null);

  // Face refs
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const mouthOpenRef = useRef<THREE.Mesh>(null);

  // Sprint 4: Enhanced lip sync with visemes
  // Viseme types: rest, A (open), E (wide), I (narrow), O (rounded), U (pursed)
  const visemeRef = useRef({
    current: 'rest' as 'rest' | 'A' | 'E' | 'I' | 'O' | 'U',
    target: 'rest' as 'rest' | 'A' | 'E' | 'I' | 'O' | 'U',
    progress: 0,
    lastChange: 0,
    openness: 0,        // 0-1 how open the mouth is
    width: 1,           // Width multiplier (1 = normal, >1 = wide, <1 = narrow)
    roundness: 0,       // 0-1 how rounded the mouth is
  });

  // Viseme shapes define mouth characteristics
  const VISEME_SHAPES = {
    rest: { openness: 0, width: 1, roundness: 0 },
    A: { openness: 0.9, width: 1.1, roundness: 0.3 },     // Open wide "ah"
    E: { openness: 0.5, width: 1.3, roundness: 0 },       // Wide "eh"
    I: { openness: 0.3, width: 1.2, roundness: 0 },       // Smile "ee"
    O: { openness: 0.7, width: 0.8, roundness: 0.9 },     // Rounded "oh"
    U: { openness: 0.4, width: 0.6, roundness: 1.0 },     // Pursed "oo"
  };

  // Animation controller
  const controller = useMemo(() => new AvatarAnimationController(), []);

  // Blinking state
  const blinkStateRef = useRef(1);
  const mouthOpenRef2 = useRef(0);

  // Sprint 4: Gaze tracking system
  const gazeTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 5)); // Default: look at camera
  const gazeOffsetRef = useRef({ x: 0, y: 0 }); // Micro eye movements
  const gazePhaseRef = useRef(0); // For subtle saccades
  const lastGazeChangeRef = useRef(0);

  // Sprint 5.2: Enhanced systems state
  const jointAnglesRef = useRef<JointAngles>(getDefaultJointAngles());
  const breathingStateRef = useRef({
    rate: 15,         // Breaths per minute (resting: 12-16, exercise: up to 40)
    phase: 0,         // Current phase in breathing cycle
    depth: 0.02,      // Breathing depth (chest expansion)
    valsalva: false,  // True during heavy lifts
  });
  const swayTimeRef = useRef(0);

  // Sprint 5.4: Foot IK for ground contact
  const { updateFootIK, reset: resetFootIK } = useFootIK(enableFootIK);
  const currentPhaseRef = useRef<string>('');

  // Map joint names to refs
  const jointRefMap = useMemo(
    () => ({
      hips: hipsRef,
      spine: spineRef,
      chest: chestRef,
      neck: neckRef,
      head: headRef,
      leftShoulder: leftShoulderRef,
      leftUpperArm: leftUpperArmRef,
      leftElbow: leftElbowRef,
      leftWrist: leftWristRef,
      rightShoulder: rightShoulderRef,
      rightUpperArm: rightUpperArmRef,
      rightElbow: rightElbowRef,
      rightWrist: rightWristRef,
      leftHip: leftHipRef,
      leftUpperLeg: leftUpperLegRef,
      leftKnee: leftKneeRef,
      leftAnkle: leftAnkleRef,
      rightHip: rightHipRef,
      rightUpperLeg: rightUpperLegRef,
      rightKnee: rightKneeRef,
      rightAnkle: rightAnkleRef,
    }),
    []
  );

  // Set animation when it changes
  useEffect(() => {
    if (animation) {
      // Reset secondary motion state when animation changes for smooth transition
      resetSecondaryMotionState();
      controller.setAnimation(animation);
      controller.setTempo(tempo);
    }
  }, [animation, controller, tempo]);

  // Play/pause control
  useEffect(() => {
    if (isPlaying) {
      controller.play();
    } else {
      controller.pause();
    }
  }, [isPlaying, controller]);

  // Natural blinking effect
  useEffect(() => {
    const blink = () => {
      blinkStateRef.current = 0;
      setTimeout(() => {
        blinkStateRef.current = 1;
      }, 150);
    };

    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Sprint 4: Enhanced viseme-based mouth animation for speaking
  useEffect(() => {
    if (!isSpeaking) {
      // Reset to rest position when not speaking
      visemeRef.current.target = 'rest';
      mouthOpenRef2.current = 0;
      return;
    }

    // Viseme sequence patterns for natural speech
    const visemePatterns = [
      ['A', 'E', 'I'],      // Open vowel pattern
      ['O', 'U', 'A'],      // Rounded vowel pattern
      ['E', 'A', 'O'],      // Wide to rounded pattern
      ['I', 'E', 'A', 'O'], // Increasing openness
      ['U', 'O', 'A'],      // Pursed to open
    ] as const;

    let patternIndex = Math.floor(Math.random() * visemePatterns.length);
    let visemeIndex = 0;

    const interval = setInterval(() => {
      const currentPattern = visemePatterns[patternIndex];
      visemeRef.current.target = currentPattern[visemeIndex] as 'A' | 'E' | 'I' | 'O' | 'U';
      visemeRef.current.lastChange = Date.now();

      visemeIndex++;
      if (visemeIndex >= currentPattern.length) {
        visemeIndex = 0;
        // Occasionally switch patterns for variety
        if (Math.random() > 0.7) {
          patternIndex = Math.floor(Math.random() * visemePatterns.length);
        }
      }

      // Also update legacy ref for backwards compatibility
      mouthOpenRef2.current = VISEME_SHAPES[visemeRef.current.target].openness;
    }, 120); // Slightly slower for smoother transitions

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Animation frame
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update animation controller
    const pose = controller.update(delta);

    if (pose) {
      // Apply secondary motion for more natural movement (follow-through, inertia)
      const enhancedJoints = applySecondaryMotionToPose(pose.joints, delta);

      // Apply joint rotations with secondary motion
      for (const [jointName, rotation] of Object.entries(enhancedJoints)) {
        const ref = jointRefMap[jointName as keyof typeof jointRefMap];
        if (ref) {
          applyJointRotation(ref, rotation, 0.15);
        }
      }

      // Apply root Y position (for squats, etc.)
      if (rootRef.current && pose.rootY !== undefined) {
        rootRef.current.position.y = THREE.MathUtils.lerp(
          rootRef.current.position.y,
          pose.rootY,
          0.1
        );
      }

      // Notify phase change
      const currentPhase = controller.getCurrentPhase();
      if (currentPhase) {
        currentPhaseRef.current = currentPhase.name;
        if (onPhaseChange) {
          onPhaseChange(currentPhase.name);
        }
      }
    } else {
      // Sprint 5.2: Enhanced breathing animation based on exercise intensity
      if (chestRef.current) {
        // Calculate breathing rate based on intensity (12-40 breaths/min)
        const targetRate = 12 + exerciseIntensity * 28;
        breathingStateRef.current.rate = THREE.MathUtils.lerp(
          breathingStateRef.current.rate,
          targetRate,
          0.02
        );

        // Calculate breathing depth (increases with intensity)
        const baseDepth = 0.02;
        const intensityDepth = exerciseIntensity * 0.03;
        breathingStateRef.current.depth = baseDepth + intensityDepth;

        // Update breathing phase
        const breathFreq = breathingStateRef.current.rate / 60; // Convert to Hz
        breathingStateRef.current.phase += delta * breathFreq * Math.PI * 2;

        // Asymmetric breathing: slower exhale than inhale
        const breathPhase = breathingStateRef.current.phase;
        const inhaleRatio = 0.4; // Inhale takes 40% of cycle
        const normalizedPhase = (breathPhase % (Math.PI * 2)) / (Math.PI * 2);
        let breathScale;

        if (normalizedPhase < inhaleRatio) {
          // Inhale phase - smooth rise
          breathScale = Math.sin((normalizedPhase / inhaleRatio) * Math.PI * 0.5);
        } else {
          // Exhale phase - slower fall
          breathScale = Math.cos(((normalizedPhase - inhaleRatio) / (1 - inhaleRatio)) * Math.PI * 0.5);
        }

        const depth = breathingStateRef.current.depth;
        chestRef.current.scale.x = 1 + breathScale * depth;
        chestRef.current.scale.z = 1 + breathScale * depth * 0.7; // Less front-back expansion
        chestRef.current.scale.y = 1 + breathScale * depth * 0.3; // Slight vertical lift
      }

      // Sprint 5.2: Enhanced natural sway
      if (rootRef.current && enableSway) {
        swayTimeRef.current += delta;
        const sway = calculateNaturalSway(swayTimeRef.current, {
          swayAmplitude: 0.008,
          swayFrequency: 0.15,
          compensationStrength: 0.7,
          stabilityThreshold: 0.8,
        });

        // Apply sway to root
        rootRef.current.position.x = THREE.MathUtils.lerp(
          rootRef.current.position.x,
          sway.offset.x,
          0.05
        );
        rootRef.current.position.z = THREE.MathUtils.lerp(
          rootRef.current.position.z,
          sway.offset.z,
          0.05
        );
        rootRef.current.rotation.y = THREE.MathUtils.lerp(
          rootRef.current.rotation.y,
          Math.sin(swayTimeRef.current * 0.3) * 0.02,
          0.03
        );
      }
    }

    // Sprint 5.2: Update muscle deformation if enabled
    if (enableMuscleDeformation) {
      // Extract joint angles from current pose
      const angles = jointAnglesRef.current;

      // Update angles based on joint rotations
      if (leftElbowRef.current) {
        angles.leftElbow = Math.abs(leftElbowRef.current.rotation.x) * (180 / Math.PI);
      }
      if (rightElbowRef.current) {
        angles.rightElbow = Math.abs(rightElbowRef.current.rotation.x) * (180 / Math.PI);
      }
      if (leftKneeRef.current) {
        angles.leftKnee = Math.abs(leftKneeRef.current.rotation.x) * (180 / Math.PI);
      }
      if (rightKneeRef.current) {
        angles.rightKnee = Math.abs(rightKneeRef.current.rotation.x) * (180 / Math.PI);
      }
      if (spineRef.current) {
        angles.trunkFlexion = spineRef.current.rotation.x * (180 / Math.PI);
        angles.trunkRotation = spineRef.current.rotation.y * (180 / Math.PI);
        angles.trunkLateralFlexion = spineRef.current.rotation.z * (180 / Math.PI);
      }

      // Update muscle state
      const muscleState = muscleDeformationService.update(angles);
      const boneScales = muscleDeformationService.getBoneScales();

      // Apply muscle bulge to upper arms (biceps)
      if (leftUpperArmRef.current) {
        const targetScale = 1 + muscleState.bicepBulge.left * 0.15;
        leftUpperArmRef.current.scale.x = THREE.MathUtils.lerp(
          leftUpperArmRef.current.scale.x,
          targetScale,
          0.1
        );
        leftUpperArmRef.current.scale.z = THREE.MathUtils.lerp(
          leftUpperArmRef.current.scale.z,
          targetScale,
          0.1
        );
      }
      if (rightUpperArmRef.current) {
        const targetScale = 1 + muscleState.bicepBulge.right * 0.15;
        rightUpperArmRef.current.scale.x = THREE.MathUtils.lerp(
          rightUpperArmRef.current.scale.x,
          targetScale,
          0.1
        );
        rightUpperArmRef.current.scale.z = THREE.MathUtils.lerp(
          rightUpperArmRef.current.scale.z,
          targetScale,
          0.1
        );
      }

      // Apply muscle contraction to upper legs (quads)
      if (leftUpperLegRef.current) {
        const targetScale = 1 + muscleState.quadContraction.left * 0.12;
        leftUpperLegRef.current.scale.x = THREE.MathUtils.lerp(
          leftUpperLegRef.current.scale.x,
          targetScale,
          0.1
        );
        leftUpperLegRef.current.scale.z = THREE.MathUtils.lerp(
          leftUpperLegRef.current.scale.z,
          targetScale,
          0.1
        );
      }
      if (rightUpperLegRef.current) {
        const targetScale = 1 + muscleState.quadContraction.right * 0.12;
        rightUpperLegRef.current.scale.x = THREE.MathUtils.lerp(
          rightUpperLegRef.current.scale.x,
          targetScale,
          0.1
        );
        rightUpperLegRef.current.scale.z = THREE.MathUtils.lerp(
          rightUpperLegRef.current.scale.z,
          targetScale,
          0.1
        );
      }
    }

    // Sprint 5.4: Foot IK for realistic ground contact
    if (enableFootIK && leftHipRef.current && rightHipRef.current) {
      // Get hip world positions
      const leftHipWorld = new THREE.Vector3();
      const rightHipWorld = new THREE.Vector3();
      leftHipRef.current.getWorldPosition(leftHipWorld);
      rightHipRef.current.getWorldPosition(rightHipWorld);

      // Get current root Y for squat/lunge detection
      const currentRootY = rootRef.current?.position.y ?? 0;

      // Update foot IK
      const ikResult = updateFootIK(
        leftHipWorld,
        rightHipWorld,
        delta,
        currentPhaseRef.current,
        currentRootY
      );

      if (ikResult) {
        // Apply left leg IK angles
        if (leftHipRef.current && ikResult.left.hipAngle) {
          leftHipRef.current.rotation.x = THREE.MathUtils.lerp(
            leftHipRef.current.rotation.x,
            ikResult.left.hipAngle.x,
            0.1
          );
          leftHipRef.current.rotation.z = THREE.MathUtils.lerp(
            leftHipRef.current.rotation.z,
            ikResult.left.hipAngle.z,
            0.1
          );
        }
        if (leftKneeRef.current) {
          leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(
            leftKneeRef.current.rotation.x,
            -ikResult.left.kneeAngle,
            0.1
          );
        }

        // Apply right leg IK angles
        if (rightHipRef.current && ikResult.right.hipAngle) {
          rightHipRef.current.rotation.x = THREE.MathUtils.lerp(
            rightHipRef.current.rotation.x,
            ikResult.right.hipAngle.x,
            0.1
          );
          rightHipRef.current.rotation.z = THREE.MathUtils.lerp(
            rightHipRef.current.rotation.z,
            ikResult.right.hipAngle.z,
            0.1
          );
        }
        if (rightKneeRef.current) {
          rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(
            rightKneeRef.current.rotation.x,
            -ikResult.right.kneeAngle,
            0.1
          );
        }

        // Apply ankle rotation for foot orientation
        if (leftAnkleRef.current && ikResult.state.left.rotation) {
          leftAnkleRef.current.quaternion.slerp(ikResult.state.left.rotation, 0.1);
        }
        if (rightAnkleRef.current && ikResult.state.right.rotation) {
          rightAnkleRef.current.quaternion.slerp(ikResult.state.right.rotation, 0.1);
        }
      }
    }

    // Eye blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = blinkStateRef.current;
      rightEyeRef.current.scale.y = blinkStateRef.current;

      // Sprint 4: Gaze tracking - eyes look at camera with subtle movements
      gazePhaseRef.current += delta * 0.5;

      // Micro saccades - tiny random eye movements that make eyes look alive
      if (time - lastGazeChangeRef.current > 0.8 + Math.random() * 1.5) {
        lastGazeChangeRef.current = time;
        gazeOffsetRef.current = {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.01,
        };
      }

      // Base gaze toward camera (z-forward)
      const baseLookX = 0;
      const baseLookY = 0.02; // Slight upward gaze for friendly appearance

      // Add micro movements and breathing-synced subtle movement
      const breathEffect = Math.sin(time * 0.8) * 0.003;
      const targetX = baseLookX + gazeOffsetRef.current.x;
      const targetY = baseLookY + gazeOffsetRef.current.y + breathEffect;

      // Apply gaze with smooth interpolation
      const leftEyePos = leftEyeRef.current.position;
      const rightEyePos = rightEyeRef.current.position;

      // Eyes are at z=0.18 in head space, move them slightly for gaze direction
      leftEyePos.x = THREE.MathUtils.lerp(leftEyePos.x, -0.07 + targetX, 0.08);
      leftEyePos.y = THREE.MathUtils.lerp(leftEyePos.y, 0.05 + targetY, 0.08);
      rightEyePos.x = THREE.MathUtils.lerp(rightEyePos.x, 0.07 + targetX, 0.08);
      rightEyePos.y = THREE.MathUtils.lerp(rightEyePos.y, 0.05 + targetY, 0.08);

      // Head follows gaze slightly (natural head-eye coordination)
      if (headRef.current) {
        const headGazeX = targetX * 2; // Head turns less than eyes
        const headGazeY = -targetY * 1.5; // Head tilts opposite to eye vertical

        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          headGazeX,
          0.03
        );
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          headGazeY,
          0.03
        );
      }
    }

    // Eyebrow animation based on emotion
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      let eyebrowY = 0;
      let eyebrowRotation = 0;

      switch (emotion) {
        case 'happy':
          eyebrowY = 0.02;
          break;
        case 'focused':
          eyebrowRotation = 0.1;
          break;
        case 'encouraging':
          eyebrowY = 0.03;
          eyebrowRotation = -0.1;
          break;
      }

      leftEyebrowRef.current.position.y = THREE.MathUtils.lerp(
        leftEyebrowRef.current.position.y,
        0.12 + eyebrowY,
        0.1
      );
      rightEyebrowRef.current.position.y = THREE.MathUtils.lerp(
        rightEyebrowRef.current.position.y,
        0.12 + eyebrowY,
        0.1
      );
      leftEyebrowRef.current.rotation.z = THREE.MathUtils.lerp(
        leftEyebrowRef.current.rotation.z,
        -eyebrowRotation,
        0.1
      );
      rightEyebrowRef.current.rotation.z = THREE.MathUtils.lerp(
        rightEyebrowRef.current.rotation.z,
        eyebrowRotation,
        0.1
      );
    }

    // Sprint 4: Enhanced viseme-based mouth animation
    if (mouthOpenRef.current) {
      const viseme = visemeRef.current;

      if (isSpeaking) {
        // Get target shape values
        const targetShape = VISEME_SHAPES[viseme.target];

        // Smooth interpolation to target values
        const lerpSpeed = 0.2;
        viseme.openness = THREE.MathUtils.lerp(viseme.openness, targetShape.openness, lerpSpeed);
        viseme.width = THREE.MathUtils.lerp(viseme.width, targetShape.width, lerpSpeed);
        viseme.roundness = THREE.MathUtils.lerp(viseme.roundness, targetShape.roundness, lerpSpeed);

        // Apply viseme values to mouth mesh
        // Y scale = openness (how much the mouth is open)
        mouthOpenRef.current.scale.y = 0.3 + viseme.openness * 0.8;

        // X scale = width (how wide the mouth is stretched)
        mouthOpenRef.current.scale.x = 0.8 * viseme.width;

        // Z scale = roundness (for O and U sounds, make mouth protrude)
        mouthOpenRef.current.scale.z = 1 + viseme.roundness * 0.3;

        // Slight position adjustment for rounded vowels (mouth moves forward)
        mouthOpenRef.current.position.z = 0.19 + viseme.roundness * 0.02;
      } else {
        // Smoothly close mouth when not speaking
        viseme.openness = THREE.MathUtils.lerp(viseme.openness, 0, 0.1);
        viseme.width = THREE.MathUtils.lerp(viseme.width, 1, 0.1);
        viseme.roundness = THREE.MathUtils.lerp(viseme.roundness, 0, 0.1);

        mouthOpenRef.current.scale.y = 0.3 + viseme.openness * 0.5;
        mouthOpenRef.current.scale.x = 1;
        mouthOpenRef.current.scale.z = 1;
        mouthOpenRef.current.position.z = 0.19;
      }
    }
  });

  // Colors
  const skinColor = '#ffdbac';
  const shirtColor = '#4f86f7';
  const pantsColor = '#2d3748';
  const shoeColor = '#333';

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {/* Hips - Root of skeleton */}
      <group ref={hipsRef} position={[0, 1.0, 0]}>
        <RoundedBox args={[0.35, 0.15, 0.18]} radius={0.03}>
          <meshStandardMaterial color={pantsColor} />
        </RoundedBox>

        {/* Spine */}
        <group ref={spineRef} position={[0, 0.1, 0]}>
          {/* Chest */}
          <group ref={chestRef} position={[0, 0.25, 0]}>
            <RoundedBox args={[0.45, 0.35, 0.22]} radius={0.04}>
              <meshStandardMaterial color={shirtColor} />
            </RoundedBox>

            {/* Neck */}
            <group ref={neckRef} position={[0, 0.25, 0]}>
              <Cylinder args={[0.08, 0.1, 0.12, 16]}>
                <meshStandardMaterial color={skinColor} />
              </Cylinder>

              {/* Head */}
              <group ref={headRef} position={[0, 0.2, 0]}>
                <Sphere args={[0.22, lodConfig.sphereSegments, lodConfig.sphereSegments]}>
                  <meshStandardMaterial color={skinColor} />
                </Sphere>

                {/* Eyebrows */}
                <mesh
                  ref={leftEyebrowRef}
                  position={[-0.08, 0.12, 0.18]}
                  rotation={[0, 0, 0.1]}
                >
                  <boxGeometry args={[0.07, 0.012, 0.01]} />
                  <meshStandardMaterial color="#5d4037" />
                </mesh>
                <mesh
                  ref={rightEyebrowRef}
                  position={[0.08, 0.12, 0.18]}
                  rotation={[0, 0, -0.1]}
                >
                  <boxGeometry args={[0.07, 0.012, 0.01]} />
                  <meshStandardMaterial color="#5d4037" />
                </mesh>

                {/* Eyes */}
                <mesh ref={leftEyeRef} position={[-0.07, 0.05, 0.18]}>
                  <sphereGeometry args={[0.035, 16, 16]} />
                  <meshStandardMaterial color="#1a1a2e" />
                </mesh>
                <mesh ref={rightEyeRef} position={[0.07, 0.05, 0.18]}>
                  <sphereGeometry args={[0.035, 16, 16]} />
                  <meshStandardMaterial color="#1a1a2e" />
                </mesh>

                {/* Eye highlights */}
                <Sphere args={[0.012, 8, 8]} position={[-0.055, 0.065, 0.2]}>
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                  />
                </Sphere>
                <Sphere args={[0.012, 8, 8]} position={[0.085, 0.065, 0.2]}>
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                  />
                </Sphere>

                {/* Mouth - closed smile */}
                <mesh
                  position={[0, -0.06, 0.19]}
                  rotation={[0, 0, 0]}
                  visible={!isSpeaking}
                >
                  <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
                  <meshStandardMaterial color="#cc6666" />
                </mesh>

                {/* Mouth - open (for speaking) */}
                <mesh
                  ref={mouthOpenRef}
                  position={[0, -0.08, 0.19]}
                  visible={isSpeaking}
                >
                  <sphereGeometry args={[0.035, 16, 16]} />
                  <meshStandardMaterial color="#8b0000" />
                </mesh>
              </group>
            </group>

            {/* Left Shoulder */}
            <group ref={leftShoulderRef} position={[-0.28, 0.12, 0]}>
              <Sphere args={[0.06, 16, 16]}>
                <meshStandardMaterial color={shirtColor} />
              </Sphere>

              {/* Left Upper Arm */}
              <group ref={leftUpperArmRef} position={[0, 0, 0]}>
                <group ref={leftElbowRef} position={[0, -0.22, 0]}>
                  <Cylinder args={[0.055, 0.045, 0.22, 16]} position={[0, 0.11, 0]}>
                    <meshStandardMaterial color={shirtColor} />
                  </Cylinder>

                  {/* Elbow joint */}
                  <Sphere args={[0.04, 12, 12]}>
                    <meshStandardMaterial color={skinColor} />
                  </Sphere>

                  {/* Left Forearm + Wrist */}
                  <group ref={leftWristRef} position={[0, -0.18, 0]}>
                    <Cylinder args={[0.04, 0.035, 0.18, 16]} position={[0, 0.09, 0]}>
                      <meshStandardMaterial color={skinColor} />
                    </Cylinder>

                    {/* Hand */}
                    <Sphere args={[0.045, 12, 12]} position={[0, -0.05, 0]}>
                      <meshStandardMaterial color={skinColor} />
                    </Sphere>
                  </group>
                </group>
              </group>
            </group>

            {/* Right Shoulder */}
            <group ref={rightShoulderRef} position={[0.28, 0.12, 0]}>
              <Sphere args={[0.06, 16, 16]}>
                <meshStandardMaterial color={shirtColor} />
              </Sphere>

              {/* Right Upper Arm */}
              <group ref={rightUpperArmRef} position={[0, 0, 0]}>
                <group ref={rightElbowRef} position={[0, -0.22, 0]}>
                  <Cylinder args={[0.055, 0.045, 0.22, 16]} position={[0, 0.11, 0]}>
                    <meshStandardMaterial color={shirtColor} />
                  </Cylinder>

                  {/* Elbow joint */}
                  <Sphere args={[0.04, 12, 12]}>
                    <meshStandardMaterial color={skinColor} />
                  </Sphere>

                  {/* Right Forearm + Wrist */}
                  <group ref={rightWristRef} position={[0, -0.18, 0]}>
                    <Cylinder args={[0.04, 0.035, 0.18, 16]} position={[0, 0.09, 0]}>
                      <meshStandardMaterial color={skinColor} />
                    </Cylinder>

                    {/* Hand */}
                    <Sphere args={[0.045, 12, 12]} position={[0, -0.05, 0]}>
                      <meshStandardMaterial color={skinColor} />
                    </Sphere>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        {/* Left Hip */}
        <group ref={leftHipRef} position={[-0.1, -0.08, 0]}>
          {/* Left Upper Leg */}
          <group ref={leftUpperLegRef}>
            <group ref={leftKneeRef} position={[0, -0.24, 0]}>
              <Cylinder args={[0.075, 0.06, 0.24, 16]} position={[0, 0.12, 0]}>
                <meshStandardMaterial color={pantsColor} />
              </Cylinder>

              {/* Knee joint */}
              <Sphere args={[0.05, 12, 12]}>
                <meshStandardMaterial color={pantsColor} />
              </Sphere>

              {/* Left Lower Leg + Ankle */}
              <group ref={leftAnkleRef} position={[0, -0.24, 0]}>
                <Cylinder args={[0.055, 0.05, 0.24, 16]} position={[0, 0.12, 0]}>
                  <meshStandardMaterial color={pantsColor} />
                </Cylinder>

                {/* Foot */}
                <RoundedBox
                  args={[0.08, 0.06, 0.14]}
                  position={[0, -0.03, 0.03]}
                  radius={0.015}
                >
                  <meshStandardMaterial color={shoeColor} />
                </RoundedBox>
              </group>
            </group>
          </group>
        </group>

        {/* Right Hip */}
        <group ref={rightHipRef} position={[0.1, -0.08, 0]}>
          {/* Right Upper Leg */}
          <group ref={rightUpperLegRef}>
            <group ref={rightKneeRef} position={[0, -0.24, 0]}>
              <Cylinder args={[0.075, 0.06, 0.24, 16]} position={[0, 0.12, 0]}>
                <meshStandardMaterial color={pantsColor} />
              </Cylinder>

              {/* Knee joint */}
              <Sphere args={[0.05, 12, 12]}>
                <meshStandardMaterial color={pantsColor} />
              </Sphere>

              {/* Right Lower Leg + Ankle */}
              <group ref={rightAnkleRef} position={[0, -0.24, 0]}>
                <Cylinder args={[0.055, 0.05, 0.24, 16]} position={[0, 0.12, 0]}>
                  <meshStandardMaterial color={pantsColor} />
                </Cylinder>

                {/* Foot */}
                <RoundedBox
                  args={[0.08, 0.06, 0.14]}
                  position={[0, -0.03, 0.03]}
                  radius={0.015}
                >
                  <meshStandardMaterial color={shoeColor} />
                </RoundedBox>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

// React.memo optimization to prevent unnecessary re-renders
// Compare animation name, playback state, and visual settings
const SkeletalAvatar = React.memo(SkeletalAvatarComponent, (prevProps, nextProps) => {
  return (
    prevProps.animation?.exerciseName === nextProps.animation?.exerciseName &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.tempo === nextProps.tempo &&
    prevProps.emotion === nextProps.emotion &&
    prevProps.isSpeaking === nextProps.isSpeaking &&
    prevProps.lodLevel === nextProps.lodLevel &&
    prevProps.exerciseIntensity === nextProps.exerciseIntensity &&
    prevProps.enableMuscleDeformation === nextProps.enableMuscleDeformation &&
    prevProps.enableFootIK === nextProps.enableFootIK &&
    prevProps.enableSway === nextProps.enableSway
  );
});

export default SkeletalAvatar;

/**
 * Simple CCDIK Solver (Cyclic Coordinate Descent Inverse Kinematics)
 * For future use when we need end-effector positioning
 */
export class CCDIKSolver {
  private chain: THREE.Object3D[];
  private target: THREE.Vector3;
  private iterations: number;

  constructor(chain: THREE.Object3D[], target: THREE.Vector3, iterations = 10) {
    this.chain = chain;
    this.target = target;
    this.iterations = iterations;
  }

  solve(): void {
    const endEffector = this.chain[this.chain.length - 1];

    for (let iter = 0; iter < this.iterations; iter++) {
      // Iterate from end-effector to root
      for (let i = this.chain.length - 2; i >= 0; i--) {
        const joint = this.chain[i];

        // Get world positions
        const jointWorldPos = new THREE.Vector3();
        joint.getWorldPosition(jointWorldPos);

        const endEffectorWorldPos = new THREE.Vector3();
        endEffector.getWorldPosition(endEffectorWorldPos);

        // Calculate vectors
        const toEndEffector = endEffectorWorldPos.clone().sub(jointWorldPos).normalize();
        const toTarget = this.target.clone().sub(jointWorldPos).normalize();

        // Calculate rotation axis and angle
        const axis = new THREE.Vector3().crossVectors(toEndEffector, toTarget).normalize();
        const angle = Math.acos(
          THREE.MathUtils.clamp(toEndEffector.dot(toTarget), -1, 1)
        );

        // Skip if angle is too small
        if (angle < 0.001) continue;

        // Convert to local rotation
        const worldToLocal = new THREE.Quaternion();
        joint.getWorldQuaternion(worldToLocal);
        worldToLocal.invert();

        const localAxis = axis.clone().applyQuaternion(worldToLocal);
        const rotationQuat = new THREE.Quaternion().setFromAxisAngle(
          localAxis,
          angle * 0.5 // Damping factor
        );

        // Apply rotation
        joint.quaternion.multiply(rotationQuat);
        joint.updateMatrixWorld();
      }

      // Check if close enough to target
      const finalPos = new THREE.Vector3();
      endEffector.getWorldPosition(finalPos);
      if (finalPos.distanceTo(this.target) < 0.01) break;
    }
  }

  setTarget(target: THREE.Vector3): void {
    this.target = target;
  }
}
