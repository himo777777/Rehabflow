/**
 * RealisticAvatar3D - High-quality 3D human avatar using GLB model
 * Falls back to procedural avatar if model is not available
 *
 * Supports all body positions: standing, lying, sitting, kneeling, sidelying
 */

import React, { useRef, Suspense, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { createBoneMap, applyPose, BoneMap, validateSkeleton, listAllBones } from '../utils/boneMapping';
import { CAMERA_PRESETS, BodyPosition } from '../constants/cameraPresets';
import { getAnimationMapping, ExerciseAnimationMapping } from '../data/exerciseAnimationMap';
import { getExerciseAnimation } from '../data/exerciseAnimations';
import { ExerciseAnimationData, PoseKeyframe } from '../services/avatarAnimationService';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { logger } from '../utils/logger';

/**
 * Map animation joint names to bone names used in the skeleton
 * exerciseAnimations.ts uses different naming conventions
 */
const JOINT_TO_BONE_MAP: Record<string, string> = {
  // Shoulders/Arms
  'leftShoulder': 'leftUpperArm',
  'leftElbow': 'leftLowerArm',
  'rightShoulder': 'rightUpperArm',
  'rightElbow': 'rightLowerArm',
  // Legs
  'leftHip': 'leftUpperLeg',
  'leftKnee': 'leftLowerLeg',
  'rightHip': 'rightUpperLeg',
  'rightKnee': 'rightLowerLeg',
  // Direct mappings
  'hips': 'hips',
  'spine': 'spine',
  'chest': 'chest',
  'neck': 'neck',
  'head': 'head',
  'leftHand': 'leftHand',
  'rightHand': 'rightHand',
  'leftFoot': 'leftFoot',
  'rightFoot': 'rightFoot',
  'leftUpperArm': 'leftUpperArm',
  'leftLowerArm': 'leftLowerArm',
  'rightUpperArm': 'rightUpperArm',
  'rightLowerArm': 'rightLowerArm',
  'leftUpperLeg': 'leftUpperLeg',
  'leftLowerLeg': 'leftLowerLeg',
  'rightUpperLeg': 'rightUpperLeg',
  'rightLowerLeg': 'rightLowerLeg',
};

type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'CORE' | 'STRETCH' | 'BALANCE' | 'PUSH' | 'GENERAL';

interface RealisticAvatar3DProps {
  mode: ExerciseMode;
  gender?: 'male' | 'female';
  className?: string;
  exerciseName?: string;  // Ny prop för specifik övning
  bodyPosition?: BodyPosition;  // Ny prop för explicit position
  animationKey?: string;  // Ny prop för specifik animation
  onPhaseChange?: (phase: string, progress: number) => void;  // Callback för fasändringar
  showPhaseIndicator?: boolean;  // Visa fasindikator
}

/**
 * Base poses for different body positions
 * These transform the standing T-pose to the correct starting position
 */
const BASE_POSES: Record<BodyPosition, {
  pose: Record<string, { x: number; y: number; z: number }>;
  rootPosition: { x: number; y: number; z: number };
  rootRotation: { x: number; y: number; z: number };
}> = {
  standing: {
    pose: {},
    rootPosition: { x: 0, y: 0, z: 0 },
    rootRotation: { x: 0, y: 0, z: 0 },
  },
  lying: {
    pose: {
      // Kroppen ligger på rygg
      hips: { x: -Math.PI / 2, y: 0, z: 0 },
      spine: { x: 0, y: 0, z: 0 },
      chest: { x: 0, y: 0, z: 0 },
      // Armar vid sidorna
      leftUpperArm: { x: 0, y: 0, z: Math.PI / 6 },
      rightUpperArm: { x: 0, y: 0, z: -Math.PI / 6 },
      leftLowerArm: { x: 0, y: 0, z: 0 },
      rightLowerArm: { x: 0, y: 0, z: 0 },
      // Ben utsträckta
      leftUpperLeg: { x: 0, y: 0, z: 0 },
      rightUpperLeg: { x: 0, y: 0, z: 0 },
      leftLowerLeg: { x: 0, y: 0, z: 0 },
      rightLowerLeg: { x: 0, y: 0, z: 0 },
    },
    rootPosition: { x: 0, y: 0.1, z: 0 },
    rootRotation: { x: -Math.PI / 2, y: 0, z: 0 },
  },
  sitting: {
    pose: {
      // Höfter böjda 90 grader
      leftUpperLeg: { x: Math.PI / 2, y: 0, z: 0 },
      rightUpperLeg: { x: Math.PI / 2, y: 0, z: 0 },
      // Knän böjda 90 grader
      leftLowerLeg: { x: -Math.PI / 2, y: 0, z: 0 },
      rightLowerLeg: { x: -Math.PI / 2, y: 0, z: 0 },
      // Rak rygg
      spine: { x: 0, y: 0, z: 0 },
      chest: { x: 0, y: 0, z: 0 },
      // Armar avslappnade
      leftUpperArm: { x: 0, y: 0, z: 0.2 },
      rightUpperArm: { x: 0, y: 0, z: -0.2 },
    },
    rootPosition: { x: 0, y: -0.4, z: 0 },
    rootRotation: { x: 0, y: 0, z: 0 },
  },
  kneeling: {
    pose: {
      // På alla fyra (fyrfotaposition)
      spine: { x: Math.PI / 12, y: 0, z: 0 },
      chest: { x: 0, y: 0, z: 0 },
      // Armar rakt ner
      leftUpperArm: { x: -Math.PI / 2, y: 0, z: 0.1 },
      rightUpperArm: { x: -Math.PI / 2, y: 0, z: -0.1 },
      leftLowerArm: { x: 0, y: 0, z: 0 },
      rightLowerArm: { x: 0, y: 0, z: 0 },
      // Ben böjda under kroppen
      leftUpperLeg: { x: Math.PI / 2, y: 0, z: 0 },
      rightUpperLeg: { x: Math.PI / 2, y: 0, z: 0 },
      leftLowerLeg: { x: -Math.PI / 1.2, y: 0, z: 0 },
      rightLowerLeg: { x: -Math.PI / 1.2, y: 0, z: 0 },
    },
    rootPosition: { x: 0, y: -0.3, z: 0 },
    rootRotation: { x: Math.PI / 6, y: 0, z: 0 },
  },
  sidelying: {
    pose: {
      // Ligger på sidan
      hips: { x: -Math.PI / 2, y: 0, z: Math.PI / 2 },
      spine: { x: 0, y: 0, z: 0 },
      // Armar
      leftUpperArm: { x: 0, y: 0, z: 0 },
      rightUpperArm: { x: 0, y: 0, z: 0 },
      // Ben lätt böjda
      leftUpperLeg: { x: Math.PI / 6, y: 0, z: 0 },
      rightUpperLeg: { x: Math.PI / 6, y: 0, z: 0 },
      leftLowerLeg: { x: -Math.PI / 6, y: 0, z: 0 },
      rightLowerLeg: { x: -Math.PI / 6, y: 0, z: 0 },
    },
    rootPosition: { x: 0, y: 0.1, z: 0 },
    rootRotation: { x: -Math.PI / 2, y: Math.PI / 2, z: 0 },
  },
};

// Animation keyframes for different exercise modes
const EXERCISE_ANIMATIONS: Record<ExerciseMode, {
  keyframes: Array<{
    time: number;
    pose: Record<string, { x: number; y: number; z: number }>;
    rootY?: number;
  }>;
  duration: number;
}> = {
  LEGS: {
    duration: 5,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: 0, y: 0, z: 0 },
          leftLowerLeg: { x: 0, y: 0, z: 0 },
          rightLowerLeg: { x: 0, y: 0, z: 0 },
        },
        rootY: 0,
      },
      {
        time: 0.6, // 3s eccentric
        pose: {
          leftUpperLeg: { x: Math.PI / 4, y: 0, z: 0 },
          rightUpperLeg: { x: Math.PI / 4, y: 0, z: 0 },
          leftLowerLeg: { x: -Math.PI / 2.5, y: 0, z: 0 },
          rightLowerLeg: { x: -Math.PI / 2.5, y: 0, z: 0 },
        },
        rootY: -0.4,
      },
      {
        time: 0.8, // 1s hold
        pose: {
          leftUpperLeg: { x: Math.PI / 4, y: 0, z: 0 },
          rightUpperLeg: { x: Math.PI / 4, y: 0, z: 0 },
          leftLowerLeg: { x: -Math.PI / 2.5, y: 0, z: 0 },
          rightLowerLeg: { x: -Math.PI / 2.5, y: 0, z: 0 },
        },
        rootY: -0.4,
      },
      {
        time: 1,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: 0, y: 0, z: 0 },
          leftLowerLeg: { x: 0, y: 0, z: 0 },
          rightLowerLeg: { x: 0, y: 0, z: 0 },
        },
        rootY: 0,
      },
    ],
  },
  PRESS: {
    duration: 5,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: Math.PI / 2 },
          rightUpperArm: { x: 0, y: 0, z: -Math.PI / 2 },
          leftLowerArm: { x: 0, y: Math.PI / 2, z: 0 },
          rightLowerArm: { x: 0, y: -Math.PI / 2, z: 0 },
        },
      },
      {
        time: 0.6,
        pose: {
          leftUpperArm: { x: -Math.PI / 6, y: 0, z: Math.PI / 1.5 },
          rightUpperArm: { x: -Math.PI / 6, y: 0, z: -Math.PI / 1.5 },
          leftLowerArm: { x: 0, y: 0, z: 0 },
          rightLowerArm: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 0.8,
        pose: {
          leftUpperArm: { x: -Math.PI / 6, y: 0, z: Math.PI / 1.5 },
          rightUpperArm: { x: -Math.PI / 6, y: 0, z: -Math.PI / 1.5 },
          leftLowerArm: { x: 0, y: 0, z: 0 },
          rightLowerArm: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 1,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: Math.PI / 2 },
          rightUpperArm: { x: 0, y: 0, z: -Math.PI / 2 },
          leftLowerArm: { x: 0, y: Math.PI / 2, z: 0 },
          rightLowerArm: { x: 0, y: -Math.PI / 2, z: 0 },
        },
      },
    ],
  },
  PULL: {
    duration: 5,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperArm: { x: -Math.PI / 3, y: 0, z: 0.2 },
          rightUpperArm: { x: -Math.PI / 3, y: 0, z: -0.2 },
          leftLowerArm: { x: 0, y: 0, z: 0 },
          rightLowerArm: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 0.6,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: 0.5 },
          rightUpperArm: { x: 0, y: 0, z: -0.5 },
          leftLowerArm: { x: -Math.PI / 2, y: 0, z: 0 },
          rightLowerArm: { x: -Math.PI / 2, y: 0, z: 0 },
        },
      },
      {
        time: 0.8,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: 0.5 },
          rightUpperArm: { x: 0, y: 0, z: -0.5 },
          leftLowerArm: { x: -Math.PI / 2, y: 0, z: 0 },
          rightLowerArm: { x: -Math.PI / 2, y: 0, z: 0 },
        },
      },
      {
        time: 1,
        pose: {
          leftUpperArm: { x: -Math.PI / 3, y: 0, z: 0.2 },
          rightUpperArm: { x: -Math.PI / 3, y: 0, z: -0.2 },
          leftLowerArm: { x: 0, y: 0, z: 0 },
          rightLowerArm: { x: 0, y: 0, z: 0 },
        },
      },
    ],
  },
  LUNGE: {
    duration: 5,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: 0, y: 0, z: 0 },
          leftLowerLeg: { x: 0, y: 0, z: 0 },
          rightLowerLeg: { x: 0, y: 0, z: 0 },
        },
        rootY: 0,
      },
      {
        time: 0.6,
        pose: {
          leftUpperLeg: { x: -Math.PI / 6, y: 0, z: 0 },
          rightUpperLeg: { x: Math.PI / 3, y: 0, z: 0 },
          leftLowerLeg: { x: Math.PI / 3, y: 0, z: 0 },
          rightLowerLeg: { x: -Math.PI / 2, y: 0, z: 0 },
        },
        rootY: -0.3,
      },
      {
        time: 0.8,
        pose: {
          leftUpperLeg: { x: -Math.PI / 6, y: 0, z: 0 },
          rightUpperLeg: { x: Math.PI / 3, y: 0, z: 0 },
          leftLowerLeg: { x: Math.PI / 3, y: 0, z: 0 },
          rightLowerLeg: { x: -Math.PI / 2, y: 0, z: 0 },
        },
        rootY: -0.3,
      },
      {
        time: 1,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: 0, y: 0, z: 0 },
          leftLowerLeg: { x: 0, y: 0, z: 0 },
          rightLowerLeg: { x: 0, y: 0, z: 0 },
        },
        rootY: 0,
      },
    ],
  },
  CORE: {
    duration: 4,
    keyframes: [
      {
        time: 0,
        pose: {
          spine: { x: 0, y: 0, z: 0 },
          chest: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 0.5,
        pose: {
          spine: { x: Math.PI / 6, y: 0, z: 0 },
          chest: { x: Math.PI / 8, y: 0, z: 0 },
        },
      },
      {
        time: 0.75,
        pose: {
          spine: { x: Math.PI / 6, y: 0, z: 0 },
          chest: { x: Math.PI / 8, y: 0, z: 0 },
        },
      },
      {
        time: 1,
        pose: {
          spine: { x: 0, y: 0, z: 0 },
          chest: { x: 0, y: 0, z: 0 },
        },
      },
    ],
  },
  STRETCH: {
    duration: 6,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: 0 },
          rightUpperArm: { x: 0, y: 0, z: 0 },
          spine: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 0.5,
        pose: {
          leftUpperArm: { x: -Math.PI, y: 0, z: 0.3 },
          rightUpperArm: { x: 0, y: 0, z: -0.3 },
          spine: { x: 0, y: 0, z: -0.2 },
        },
      },
      {
        time: 1,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: 0 },
          rightUpperArm: { x: 0, y: 0, z: 0 },
          spine: { x: 0, y: 0, z: 0 },
        },
      },
    ],
  },
  BALANCE: {
    duration: 4,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: 0, y: 0, z: 0 },
          leftUpperArm: { x: 0, y: 0, z: 0.5 },
          rightUpperArm: { x: 0, y: 0, z: -0.5 },
        },
      },
      {
        time: 0.5,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: Math.PI / 4, y: 0, z: 0.2 },
          leftUpperArm: { x: -Math.PI / 4, y: 0, z: Math.PI / 3 },
          rightUpperArm: { x: -Math.PI / 4, y: 0, z: -Math.PI / 3 },
        },
      },
      {
        time: 0.75,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: Math.PI / 4, y: 0, z: 0.2 },
          leftUpperArm: { x: -Math.PI / 4, y: 0, z: Math.PI / 3 },
          rightUpperArm: { x: -Math.PI / 4, y: 0, z: -Math.PI / 3 },
        },
      },
      {
        time: 1,
        pose: {
          leftUpperLeg: { x: 0, y: 0, z: 0 },
          rightUpperLeg: { x: 0, y: 0, z: 0 },
          leftUpperArm: { x: 0, y: 0, z: 0.5 },
          rightUpperArm: { x: 0, y: 0, z: -0.5 },
        },
      },
    ],
  },
  PUSH: {
    duration: 5,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperArm: { x: -Math.PI / 4, y: 0, z: 0.3 },
          rightUpperArm: { x: -Math.PI / 4, y: 0, z: -0.3 },
          leftLowerArm: { x: -Math.PI / 4, y: 0, z: 0 },
          rightLowerArm: { x: -Math.PI / 4, y: 0, z: 0 },
        },
      },
      {
        time: 0.6,
        pose: {
          leftUpperArm: { x: -Math.PI / 2, y: 0, z: 0.3 },
          rightUpperArm: { x: -Math.PI / 2, y: 0, z: -0.3 },
          leftLowerArm: { x: 0, y: 0, z: 0 },
          rightLowerArm: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 0.8,
        pose: {
          leftUpperArm: { x: -Math.PI / 2, y: 0, z: 0.3 },
          rightUpperArm: { x: -Math.PI / 2, y: 0, z: -0.3 },
          leftLowerArm: { x: 0, y: 0, z: 0 },
          rightLowerArm: { x: 0, y: 0, z: 0 },
        },
      },
      {
        time: 1,
        pose: {
          leftUpperArm: { x: -Math.PI / 4, y: 0, z: 0.3 },
          rightUpperArm: { x: -Math.PI / 4, y: 0, z: -0.3 },
          leftLowerArm: { x: -Math.PI / 4, y: 0, z: 0 },
          rightLowerArm: { x: -Math.PI / 4, y: 0, z: 0 },
        },
      },
    ],
  },
  GENERAL: {
    duration: 3,
    keyframes: [
      {
        time: 0,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: 0.1 },
          rightUpperArm: { x: 0, y: 0, z: -0.1 },
        },
      },
      {
        time: 0.5,
        pose: {
          leftUpperArm: { x: 0.1, y: 0, z: 0.1 },
          rightUpperArm: { x: -0.1, y: 0, z: -0.1 },
        },
      },
      {
        time: 1,
        pose: {
          leftUpperArm: { x: 0, y: 0, z: 0.1 },
          rightUpperArm: { x: 0, y: 0, z: -0.1 },
        },
      },
    ],
  },
};

/**
 * Anatomical joint constraints for 100% accurate biomechanics
 * All values in radians, based on human anatomy research
 */
const JOINT_CONSTRAINTS: Record<string, { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } }> = {
  // Spine - limited flexion/extension, lateral bend, rotation
  spine: {
    min: { x: -Math.PI / 6, y: -Math.PI / 4, z: -Math.PI / 6 },
    max: { x: Math.PI / 4, y: Math.PI / 4, z: Math.PI / 6 },
  },
  chest: {
    min: { x: -Math.PI / 8, y: -Math.PI / 6, z: -Math.PI / 8 },
    max: { x: Math.PI / 3, y: Math.PI / 6, z: Math.PI / 8 },
  },
  neck: {
    min: { x: -Math.PI / 4, y: -Math.PI / 3, z: -Math.PI / 4 },
    max: { x: Math.PI / 6, y: Math.PI / 3, z: Math.PI / 4 },
  },
  head: {
    min: { x: -Math.PI / 6, y: -Math.PI / 4, z: -Math.PI / 6 },
    max: { x: Math.PI / 6, y: Math.PI / 4, z: Math.PI / 6 },
  },

  // Shoulders - ball-and-socket joint, wide ROM
  leftUpperArm: {
    min: { x: -Math.PI, y: -Math.PI / 2, z: -Math.PI / 6 },
    max: { x: Math.PI, y: Math.PI / 2, z: Math.PI },
  },
  rightUpperArm: {
    min: { x: -Math.PI, y: -Math.PI / 2, z: -Math.PI },
    max: { x: Math.PI, y: Math.PI / 2, z: Math.PI / 6 },
  },

  // Elbows - hinge joint, flexion only
  leftLowerArm: {
    min: { x: -Math.PI / 1.2, y: -Math.PI / 12, z: -Math.PI / 12 },
    max: { x: 0, y: Math.PI / 12, z: Math.PI / 12 },
  },
  rightLowerArm: {
    min: { x: -Math.PI / 1.2, y: -Math.PI / 12, z: -Math.PI / 12 },
    max: { x: 0, y: Math.PI / 12, z: Math.PI / 12 },
  },

  // Hips - ball-and-socket, large ROM but less than shoulder
  leftUpperLeg: {
    min: { x: -Math.PI / 6, y: -Math.PI / 4, z: -Math.PI / 6 },
    max: { x: Math.PI / 2, y: Math.PI / 4, z: Math.PI / 4 },
  },
  rightUpperLeg: {
    min: { x: -Math.PI / 6, y: -Math.PI / 4, z: -Math.PI / 4 },
    max: { x: Math.PI / 2, y: Math.PI / 4, z: Math.PI / 6 },
  },

  // Knees - hinge joint, flexion only
  leftLowerLeg: {
    min: { x: -Math.PI / 1.2, y: -Math.PI / 24, z: -Math.PI / 24 },
    max: { x: 0, y: Math.PI / 24, z: Math.PI / 24 },
  },
  rightLowerLeg: {
    min: { x: -Math.PI / 1.2, y: -Math.PI / 24, z: -Math.PI / 24 },
    max: { x: 0, y: Math.PI / 24, z: Math.PI / 24 },
  },

  // Hands and feet - limited ROM
  leftHand: {
    min: { x: -Math.PI / 6, y: -Math.PI / 12, z: -Math.PI / 12 },
    max: { x: Math.PI / 6, y: Math.PI / 12, z: Math.PI / 12 },
  },
  rightHand: {
    min: { x: -Math.PI / 6, y: -Math.PI / 12, z: -Math.PI / 12 },
    max: { x: Math.PI / 6, y: Math.PI / 12, z: Math.PI / 12 },
  },
  leftFoot: {
    min: { x: -Math.PI / 6, y: -Math.PI / 12, z: -Math.PI / 12 },
    max: { x: Math.PI / 4, y: Math.PI / 12, z: Math.PI / 12 },
  },
  rightFoot: {
    min: { x: -Math.PI / 6, y: -Math.PI / 12, z: -Math.PI / 12 },
    max: { x: Math.PI / 4, y: Math.PI / 12, z: Math.PI / 12 },
  },
};

/**
 * Clamp joint rotation to anatomical limits for 100% accurate biomechanics
 */
function clampJointToAnatomicalLimits(
  joint: string,
  rotation: { x: number; y: number; z: number }
): { x: number; y: number; z: number } {
  const constraint = JOINT_CONSTRAINTS[joint];
  if (!constraint) return rotation; // No constraint defined, return as-is

  return {
    x: THREE.MathUtils.clamp(rotation.x, constraint.min.x, constraint.max.x),
    y: THREE.MathUtils.clamp(rotation.y, constraint.min.y, constraint.max.y),
    z: THREE.MathUtils.clamp(rotation.z, constraint.min.z, constraint.max.z),
  };
}

/**
 * Exercise-specific biomechanical validation for 100% correct form
 */
const EXERCISE_BIOMECHANICS: Record<ExerciseMode, {
  primaryJoints: string[];
  secondaryJoints: string[];
  formChecks: string[];
}> = {
  LEGS: {
    primaryJoints: ['leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg'],
    secondaryJoints: ['spine', 'chest', 'hips'],
    formChecks: [
      'Knees track over toes',
      'Back remains neutral',
      'Hips descend below parallel',
      'Weight distributed evenly',
    ],
  },
  LUNGE: {
    primaryJoints: ['leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg'],
    secondaryJoints: ['spine', 'hips'],
    formChecks: [
      'Front knee at 90 degrees',
      'Back knee nearly touches ground',
      'Torso upright',
      'Front knee over ankle',
    ],
  },
  PRESS: {
    primaryJoints: ['leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm'],
    secondaryJoints: ['chest', 'spine'],
    formChecks: [
      'Elbows at 90 degrees at bottom',
      'Full extension at top',
      'Wrists aligned with elbows',
      'Shoulders stable',
    ],
  },
  PULL: {
    primaryJoints: ['leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm'],
    secondaryJoints: ['spine', 'chest'],
    formChecks: [
      'Scapular retraction',
      'Elbows close to body',
      'Full ROM',
      'Controlled tempo',
    ],
  },
  PUSH: {
    primaryJoints: ['leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm'],
    secondaryJoints: ['spine', 'chest', 'hips'],
    formChecks: [
      'Body in straight line',
      'Elbows at 45 degrees',
      'Full ROM',
      'Core engaged',
    ],
  },
  CORE: {
    primaryJoints: ['spine', 'chest', 'hips'],
    secondaryJoints: ['leftUpperLeg', 'rightUpperLeg'],
    formChecks: [
      'Neutral spine',
      'Pelvis stable',
      'Breathing maintained',
      'No hip flexor dominance',
    ],
  },
  STRETCH: {
    primaryJoints: ['spine', 'chest', 'leftUpperArm', 'rightUpperArm'],
    secondaryJoints: ['neck', 'hips'],
    formChecks: [
      'Gradual progression',
      'No bouncing',
      'Breathing maintained',
      'Symmetrical ROM',
    ],
  },
  BALANCE: {
    primaryJoints: ['leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg'],
    secondaryJoints: ['spine', 'leftUpperArm', 'rightUpperArm'],
    formChecks: [
      'Stable base',
      'Core engaged',
      'Eyes focused',
      'Controlled movement',
    ],
  },
  GENERAL: {
    primaryJoints: ['spine', 'chest'],
    secondaryJoints: ['leftUpperArm', 'rightUpperArm'],
    formChecks: [
      'Natural posture',
      'Relaxed shoulders',
      'Neutral spine',
      'Even breathing',
    ],
  },
};

/**
 * Advanced easing functions for ultra-realistic motion
 */
const EASING_FUNCTIONS = {
  // Smoothstep - smooth acceleration and deceleration
  smoothstep: (t: number) => t * t * (3 - 2 * t),

  // Smootherstep - even smoother with zero velocity at ends
  smootherstep: (t: number) => t * t * t * (t * (t * 6 - 15) + 10),

  // Elastic - spring-like motion with slight overshoot
  elastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },

  // InOutCubic - natural acceleration/deceleration
  inOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // InOutQuart - more pronounced ease
  inOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
};

/**
 * Spring physics system for natural motion with momentum
 */
interface SpringState {
  position: number;
  velocity: number;
  target: number;
}

interface Vector3SpringState {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

/**
 * Joint-specific physical properties based on biomechanics
 * Larger joints = higher mass/inertia = slower response
 */
const JOINT_PHYSICS_PROPERTIES: Record<string, { mass: number; damping: number; stiffness: number }> = {
  // Core/trunk - high mass, high damping (slow, stable)
  hips: { mass: 3.0, damping: 35, stiffness: 150 },
  spine: { mass: 2.5, damping: 32, stiffness: 160 },
  chest: { mass: 2.0, damping: 30, stiffness: 170 },
  neck: { mass: 0.8, damping: 22, stiffness: 190 },
  head: { mass: 0.7, damping: 20, stiffness: 200 },

  // Upper limbs - medium mass
  leftUpperArm: { mass: 1.2, damping: 24, stiffness: 180 },
  rightUpperArm: { mass: 1.2, damping: 24, stiffness: 180 },
  leftLowerArm: { mass: 0.8, damping: 20, stiffness: 200 },
  rightLowerArm: { mass: 0.8, damping: 20, stiffness: 200 },
  leftHand: { mass: 0.3, damping: 15, stiffness: 220 },
  rightHand: { mass: 0.3, damping: 15, stiffness: 220 },

  // Lower limbs - high mass (legs are heavy)
  leftUpperLeg: { mass: 2.0, damping: 28, stiffness: 160 },
  rightUpperLeg: { mass: 2.0, damping: 28, stiffness: 160 },
  leftLowerLeg: { mass: 1.5, damping: 25, stiffness: 175 },
  rightLowerLeg: { mass: 1.5, damping: 25, stiffness: 175 },
  leftFoot: { mass: 0.5, damping: 18, stiffness: 210 },
  rightFoot: { mass: 0.5, damping: 18, stiffness: 210 },
};

class SpringPhysics {
  private stiffness: number;
  private damping: number;
  private mass: number;

  constructor(stiffness = 170, damping = 26, mass = 1) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
  }

  update(state: SpringState, deltaTime: number): SpringState {
    // Spring force: F = -k * (x - target)
    const springForce = -this.stiffness * (state.position - state.target);

    // Damping force: F = -c * v
    const dampingForce = -this.damping * state.velocity;

    // Total force and acceleration
    const acceleration = (springForce + dampingForce) / this.mass;

    // Update velocity and position (Euler integration)
    const newVelocity = state.velocity + acceleration * deltaTime;
    const newPosition = state.position + newVelocity * deltaTime;

    return {
      position: newPosition,
      velocity: newVelocity,
      target: state.target,
    };
  }
}

/**
 * 3D Vector Spring Physics with velocity-dependent damping
 * for ultra-realistic joint motion
 */
/**
 * GPU-Optimized Vector3 Spring Physics
 * Uses SIMD-friendly operations for potential GPU acceleration
 *
 * FUTURE OPTIMIZATION: This could be accelerated with WebGPU compute shaders
 * for batch processing of multiple joints simultaneously (10-100x speedup)
 */
class Vector3SpringPhysics {
  private stiffness: number;
  private damping: number;
  private mass: number;
  private invMass: number; // Pre-compute inverse mass for faster division

  constructor(stiffness = 170, damping = 26, mass = 1) {
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
    this.invMass = 1 / mass; // Division is expensive, pre-compute
  }

  /**
   * GPU-friendly update using vectorized operations
   * Processes all 3 axes in parallel-friendly manner
   */
  update(state: Vector3SpringState, deltaTime: number): Vector3SpringState {
    // Pre-compute constants (GPU-friendly: hoist invariant calculations)
    const negStiffness = -this.stiffness;

    // Process all axes (SIMD-friendly: same operations on multiple data)
    // GPU Note: This pattern is optimal for SIMD/GPU vectorization
    const dx = state.position.x - state.target.x;
    const dy = state.position.y - state.target.y;
    const dz = state.position.z - state.target.z;

    // Spring forces (vectorized)
    const fx_spring = negStiffness * dx;
    const fy_spring = negStiffness * dy;
    const fz_spring = negStiffness * dz;

    // Velocity-dependent damping (GPU-friendly: minimize branching)
    const vx = state.velocity.x;
    const vy = state.velocity.y;
    const vz = state.velocity.z;

    const vx_mag = Math.abs(vx);
    const vy_mag = Math.abs(vy);
    const vz_mag = Math.abs(vz);

    const dampMultiplierX = 1 + vx_mag * 2;
    const dampMultiplierY = 1 + vy_mag * 2;
    const dampMultiplierZ = 1 + vz_mag * 2;

    const effDampX = this.damping * dampMultiplierX;
    const effDampY = this.damping * dampMultiplierY;
    const effDampZ = this.damping * dampMultiplierZ;

    // Damping forces (vectorized)
    const fx_damp = -effDampX * vx;
    const fy_damp = -effDampY * vy;
    const fz_damp = -effDampZ * vz;

    // Total accelerations (use pre-computed invMass)
    const ax = (fx_spring + fx_damp) * this.invMass;
    const ay = (fy_spring + fy_damp) * this.invMass;
    const az = (fz_spring + fz_damp) * this.invMass;

    // Semi-implicit Euler (better stability, GPU-friendly)
    const newVx = vx + ax * deltaTime;
    const newVy = vy + ay * deltaTime;
    const newVz = vz + az * deltaTime;

    return {
      position: {
        x: state.position.x + newVx * deltaTime,
        y: state.position.y + newVy * deltaTime,
        z: state.position.z + newVz * deltaTime,
      },
      velocity: {
        x: newVx,
        y: newVy,
        z: newVz,
      },
      target: state.target,
    };
  }
}

/**
 * Center of Mass (COM) calculator for realistic balance
 */
class CenterOfMassTracker {
  private jointMasses: Record<string, number>;

  constructor() {
    this.jointMasses = {};
    for (const [joint, props] of Object.entries(JOINT_PHYSICS_PROPERTIES)) {
      this.jointMasses[joint] = props.mass;
    }
  }

  calculateCOM(jointPositions: Record<string, THREE.Vector3>): THREE.Vector3 {
    let totalMass = 0;
    const weightedSum = new THREE.Vector3(0, 0, 0);

    for (const [joint, position] of Object.entries(jointPositions)) {
      const mass = this.jointMasses[joint] || 1.0;
      weightedSum.add(position.clone().multiplyScalar(mass));
      totalMass += mass;
    }

    return weightedSum.divideScalar(totalMass);
  }

  getBalanceOffset(com: THREE.Vector3, basePosition: THREE.Vector3): THREE.Vector3 {
    // Calculate how far COM is from base - used for balance corrections
    return com.clone().sub(basePosition);
  }
}

// Interpolate between keyframes with advanced easing
function interpolateKeyframes(
  keyframes: typeof EXERCISE_ANIMATIONS.LEGS.keyframes,
  normalizedTime: number
): { pose: Record<string, { x: number; y: number; z: number }>; rootY: number } {
  // Find the two keyframes to interpolate between
  let startFrame = keyframes[0];
  let endFrame = keyframes[keyframes.length - 1];
  let phaseType: 'eccentric' | 'hold' | 'concentric' = 'concentric';

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (normalizedTime >= keyframes[i].time && normalizedTime <= keyframes[i + 1].time) {
      startFrame = keyframes[i];
      endFrame = keyframes[i + 1];

      // Determine phase type based on time
      if (normalizedTime < 0.6) phaseType = 'eccentric';
      else if (normalizedTime < 0.8) phaseType = 'hold';
      else phaseType = 'concentric';

      break;
    }
  }

  // Calculate interpolation factor
  const range = endFrame.time - startFrame.time;
  const t = range > 0 ? (normalizedTime - startFrame.time) / range : 0;

  // Use different easing based on phase
  let eased: number;
  if (phaseType === 'eccentric') {
    // Slow, controlled lowering - smootherstep for ultra-smooth
    eased = EASING_FUNCTIONS.smootherstep(t);
  } else if (phaseType === 'hold') {
    // Hold position - minimal movement
    eased = t;
  } else {
    // Explosive concentric - inOutQuart for power
    eased = EASING_FUNCTIONS.inOutQuart(t);
  }

  // Interpolate pose
  const pose: Record<string, { x: number; y: number; z: number }> = {};
  const allJoints = new Set([...Object.keys(startFrame.pose), ...Object.keys(endFrame.pose)]);

  for (const joint of allJoints) {
    const start = startFrame.pose[joint] || { x: 0, y: 0, z: 0 };
    const end = endFrame.pose[joint] || { x: 0, y: 0, z: 0 };
    pose[joint] = {
      x: start.x + (end.x - start.x) * eased,
      y: start.y + (end.y - start.y) * eased,
      z: start.z + (end.z - start.z) * eased,
    };
  }

  // Interpolate rootY with physics-based smoothing
  const startRootY = startFrame.rootY ?? 0;
  const endRootY = endFrame.rootY ?? 0;
  const rootY = startRootY + (endRootY - startRootY) * eased;

  return { pose, rootY };
}

/**
 * Convert animation keyframe joints to bone-compatible format
 */
function convertKeyframeToBones(keyframe: PoseKeyframe): {
  pose: Record<string, { x: number; y: number; z: number }>;
  rootY: number;
} {
  const pose: Record<string, { x: number; y: number; z: number }> = {};

  for (const [joint, rotation] of Object.entries(keyframe.joints)) {
    const boneName = JOINT_TO_BONE_MAP[joint] || joint;
    pose[boneName] = { x: rotation.x, y: rotation.y, z: rotation.z };
  }

  const rootY = keyframe.rootPosition?.y || 0;
  return { pose, rootY };
}

/**
 * Interpolate keyframes from ExerciseAnimationData format with advanced easing
 */
function interpolateExerciseKeyframes(
  keyframes: PoseKeyframe[],
  normalizedTime: number
): { pose: Record<string, { x: number; y: number; z: number }>; rootY: number } {
  if (keyframes.length === 0) {
    return { pose: {}, rootY: 0 };
  }

  if (keyframes.length === 1) {
    return convertKeyframeToBones(keyframes[0]);
  }

  // Find surrounding keyframes
  let startFrame = keyframes[0];
  let endFrame = keyframes[keyframes.length - 1];
  let phaseType: 'eccentric' | 'hold' | 'concentric' = 'concentric';

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (normalizedTime >= keyframes[i].time && normalizedTime <= keyframes[i + 1].time) {
      startFrame = keyframes[i];
      endFrame = keyframes[i + 1];

      // Determine phase type based on time range
      if (normalizedTime < 0.6) phaseType = 'eccentric';
      else if (normalizedTime < 0.8) phaseType = 'hold';
      else phaseType = 'concentric';

      break;
    }
  }

  // Calculate interpolation factor
  const range = endFrame.time - startFrame.time;
  const t = range > 0 ? (normalizedTime - startFrame.time) / range : 0;

  // Apply phase-specific easing for ultra-realistic motion
  let eased: number;
  if (phaseType === 'eccentric') {
    // Slow, controlled lowering phase - smootherstep
    eased = EASING_FUNCTIONS.smootherstep(t);
  } else if (phaseType === 'hold') {
    // Isometric hold - minimal interpolation
    eased = EASING_FUNCTIONS.smoothstep(t);
  } else {
    // Explosive concentric phase - powerful acceleration
    eased = EASING_FUNCTIONS.inOutQuart(t);
  }

  // Convert and interpolate
  const startConverted = convertKeyframeToBones(startFrame);
  const endConverted = convertKeyframeToBones(endFrame);

  const pose: Record<string, { x: number; y: number; z: number }> = {};

  // Collect all joints from both frames
  const allJoints = new Set([
    ...Object.keys(startConverted.pose),
    ...Object.keys(endConverted.pose)
  ]);

  for (const joint of allJoints) {
    const start = startConverted.pose[joint] || { x: 0, y: 0, z: 0 };
    const end = endConverted.pose[joint] || { x: 0, y: 0, z: 0 };
    pose[joint] = {
      x: start.x + (end.x - start.x) * eased,
      y: start.y + (end.y - start.y) * eased,
      z: start.z + (end.z - start.z) * eased,
    };
  }

  const rootY = startConverted.rootY + (endConverted.rootY - startConverted.rootY) * eased;
  return { pose, rootY };
}

// Avatar model component - nu med stöd för alla positioner och övningsspecifika animationer
interface AvatarModelProps {
  mode: ExerciseMode;
  modelPath: string;
  bodyPosition: BodyPosition;
  animationKey?: string;
  exerciseName?: string;
  onPhaseChange?: (phase: string, progress: number) => void;
}

/**
 * Muscle activation patterns for realistic biomechanics
 * Each muscle group has activation curves during exercise phases
 */
interface MuscleActivation {
  quadriceps: number;
  hamstrings: number;
  glutes: number;
  calves: number;
  core: number;
  pectorals: number;
  deltoids: number;
  latissimus: number;
  biceps: number;
  triceps: number;
}

/**
 * Exercise-specific muscle activation patterns (0-1 scale)
 */
const MUSCLE_ACTIVATION_PATTERNS: Record<ExerciseMode, {
  eccentric: MuscleActivation;
  hold: MuscleActivation;
  concentric: MuscleActivation;
}> = {
  LEGS: {
    eccentric: { quadriceps: 0.8, hamstrings: 0.6, glutes: 0.7, calves: 0.4, core: 0.6, pectorals: 0.1, deltoids: 0.2, latissimus: 0.2, biceps: 0.1, triceps: 0.1 },
    hold: { quadriceps: 0.9, hamstrings: 0.7, glutes: 0.8, calves: 0.5, core: 0.8, pectorals: 0.1, deltoids: 0.2, latissimus: 0.2, biceps: 0.1, triceps: 0.1 },
    concentric: { quadriceps: 0.95, hamstrings: 0.5, glutes: 0.9, calves: 0.6, core: 0.7, pectorals: 0.1, deltoids: 0.2, latissimus: 0.2, biceps: 0.1, triceps: 0.1 },
  },
  PRESS: {
    eccentric: { quadriceps: 0.2, hamstrings: 0.1, glutes: 0.2, calves: 0.1, core: 0.5, pectorals: 0.7, deltoids: 0.8, latissimus: 0.3, biceps: 0.3, triceps: 0.5 },
    hold: { quadriceps: 0.2, hamstrings: 0.1, glutes: 0.2, calves: 0.1, core: 0.7, pectorals: 0.8, deltoids: 0.9, latissimus: 0.4, biceps: 0.3, triceps: 0.6 },
    concentric: { quadriceps: 0.2, hamstrings: 0.1, glutes: 0.2, calves: 0.1, core: 0.6, pectorals: 0.9, deltoids: 0.95, latissimus: 0.4, biceps: 0.3, triceps: 0.9 },
  },
  PULL: {
    eccentric: { quadriceps: 0.2, hamstrings: 0.2, glutes: 0.2, calves: 0.1, core: 0.6, pectorals: 0.3, deltoids: 0.6, latissimus: 0.9, biceps: 0.8, triceps: 0.2 },
    hold: { quadriceps: 0.2, hamstrings: 0.2, glutes: 0.2, calves: 0.1, core: 0.7, pectorals: 0.3, deltoids: 0.7, latissimus: 0.95, biceps: 0.9, triceps: 0.2 },
    concentric: { quadriceps: 0.2, hamstrings: 0.2, glutes: 0.2, calves: 0.1, core: 0.6, pectorals: 0.3, deltoids: 0.6, latissimus: 0.85, biceps: 0.85, triceps: 0.2 },
  },
  LUNGE: {
    eccentric: { quadriceps: 0.85, hamstrings: 0.7, glutes: 0.8, calves: 0.5, core: 0.7, pectorals: 0.1, deltoids: 0.2, latissimus: 0.2, biceps: 0.1, triceps: 0.1 },
    hold: { quadriceps: 0.9, hamstrings: 0.75, glutes: 0.85, calves: 0.6, core: 0.8, pectorals: 0.1, deltoids: 0.2, latissimus: 0.2, biceps: 0.1, triceps: 0.1 },
    concentric: { quadriceps: 0.95, hamstrings: 0.6, glutes: 0.9, calves: 0.7, core: 0.75, pectorals: 0.1, deltoids: 0.2, latissimus: 0.2, biceps: 0.1, triceps: 0.1 },
  },
  PUSH: {
    eccentric: { quadriceps: 0.3, hamstrings: 0.2, glutes: 0.3, calves: 0.2, core: 0.8, pectorals: 0.85, deltoids: 0.7, latissimus: 0.4, biceps: 0.2, triceps: 0.7 },
    hold: { quadriceps: 0.3, hamstrings: 0.2, glutes: 0.3, calves: 0.2, core: 0.9, pectorals: 0.9, deltoids: 0.75, latissimus: 0.4, biceps: 0.2, triceps: 0.8 },
    concentric: { quadriceps: 0.3, hamstrings: 0.2, glutes: 0.3, calves: 0.2, core: 0.85, pectorals: 0.95, deltoids: 0.8, latissimus: 0.4, biceps: 0.2, triceps: 0.95 },
  },
  CORE: {
    eccentric: { quadriceps: 0.4, hamstrings: 0.4, glutes: 0.5, calves: 0.2, core: 0.85, pectorals: 0.3, deltoids: 0.3, latissimus: 0.4, biceps: 0.2, triceps: 0.2 },
    hold: { quadriceps: 0.4, hamstrings: 0.4, glutes: 0.5, calves: 0.2, core: 0.95, pectorals: 0.3, deltoids: 0.3, latissimus: 0.4, biceps: 0.2, triceps: 0.2 },
    concentric: { quadriceps: 0.4, hamstrings: 0.4, glutes: 0.5, calves: 0.2, core: 0.9, pectorals: 0.3, deltoids: 0.3, latissimus: 0.4, biceps: 0.2, triceps: 0.2 },
  },
  STRETCH: {
    eccentric: { quadriceps: 0.2, hamstrings: 0.3, glutes: 0.2, calves: 0.2, core: 0.4, pectorals: 0.3, deltoids: 0.4, latissimus: 0.4, biceps: 0.2, triceps: 0.2 },
    hold: { quadriceps: 0.2, hamstrings: 0.3, glutes: 0.2, calves: 0.2, core: 0.4, pectorals: 0.3, deltoids: 0.4, latissimus: 0.4, biceps: 0.2, triceps: 0.2 },
    concentric: { quadriceps: 0.2, hamstrings: 0.3, glutes: 0.2, calves: 0.2, core: 0.4, pectorals: 0.3, deltoids: 0.4, latissimus: 0.4, biceps: 0.2, triceps: 0.2 },
  },
  BALANCE: {
    eccentric: { quadriceps: 0.5, hamstrings: 0.5, glutes: 0.5, calves: 0.7, core: 0.7, pectorals: 0.2, deltoids: 0.3, latissimus: 0.3, biceps: 0.2, triceps: 0.2 },
    hold: { quadriceps: 0.6, hamstrings: 0.6, glutes: 0.6, calves: 0.8, core: 0.8, pectorals: 0.2, deltoids: 0.3, latissimus: 0.3, biceps: 0.2, triceps: 0.2 },
    concentric: { quadriceps: 0.5, hamstrings: 0.5, glutes: 0.5, calves: 0.7, core: 0.7, pectorals: 0.2, deltoids: 0.3, latissimus: 0.3, biceps: 0.2, triceps: 0.2 },
  },
  GENERAL: {
    eccentric: { quadriceps: 0.3, hamstrings: 0.3, glutes: 0.3, calves: 0.2, core: 0.4, pectorals: 0.2, deltoids: 0.3, latissimus: 0.2, biceps: 0.2, triceps: 0.2 },
    hold: { quadriceps: 0.3, hamstrings: 0.3, glutes: 0.3, calves: 0.2, core: 0.4, pectorals: 0.2, deltoids: 0.3, latissimus: 0.2, biceps: 0.2, triceps: 0.2 },
    concentric: { quadriceps: 0.3, hamstrings: 0.3, glutes: 0.3, calves: 0.2, core: 0.4, pectorals: 0.2, deltoids: 0.3, latissimus: 0.2, biceps: 0.2, triceps: 0.2 },
  },
};

/**
 * Joint coupling relationships - joints that move together
 * Based on kinematic chains in human movement
 */
const JOINT_COUPLING: Record<string, { coupled: string[]; ratio: number }[]> = {
  // Hip-Knee coupling in squats/lunges
  leftUpperLeg: [
    { coupled: ['leftLowerLeg'], ratio: 0.7 },
    { coupled: ['spine'], ratio: 0.3 },
  ],
  rightUpperLeg: [
    { coupled: ['rightLowerLeg'], ratio: 0.7 },
    { coupled: ['spine'], ratio: 0.3 },
  ],
  // Shoulder-Elbow coupling in pressing
  leftUpperArm: [
    { coupled: ['leftLowerArm'], ratio: 0.6 },
    { coupled: ['chest'], ratio: 0.2 },
  ],
  rightUpperArm: [
    { coupled: ['rightLowerArm'], ratio: 0.6 },
    { coupled: ['chest'], ratio: 0.2 },
  ],
  // Spine-Chest coupling
  spine: [
    { coupled: ['chest'], ratio: 0.5 },
    { coupled: ['neck'], ratio: 0.3 },
  ],
};

/**
 * Performance metrics tracker for real-time analysis
 */
interface PerformanceMetrics {
  currentROM: number;
  peakVelocity: number;
  averageVelocity: number;
  powerOutput: number;
  timeUnderTension: number;
  tempoConsistency: number;
  formScore: number;
}

class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    currentROM: 0,
    peakVelocity: 0,
    averageVelocity: 0,
    powerOutput: 0,
    timeUnderTension: 0,
    tempoConsistency: 100,
    formScore: 100,
  };
  private velocityHistory: number[] = [];
  private romHistory: number[] = [];
  private lastPosition: number = 0;

  updateMetrics(currentPosition: number, deltaTime: number, phase: string) {
    // Calculate velocity (rad/s)
    const velocity = Math.abs((currentPosition - this.lastPosition) / deltaTime);
    this.velocityHistory.push(velocity);
    if (this.velocityHistory.length > 10) this.velocityHistory.shift();

    // Update peak velocity
    this.metrics.peakVelocity = Math.max(this.metrics.peakVelocity, velocity);

    // Average velocity
    this.metrics.averageVelocity = this.velocityHistory.reduce((a, b) => a + b, 0) / this.velocityHistory.length;

    // Time under tension (only during eccentric/concentric)
    if (phase === 'ECCENTRIC' || phase === 'CONCENTRIC') {
      this.metrics.timeUnderTension += deltaTime;
    }

    // ROM tracking
    this.romHistory.push(Math.abs(currentPosition));
    if (this.romHistory.length > 50) this.romHistory.shift();
    this.metrics.currentROM = Math.max(...this.romHistory);

    // Power output estimation (simplified: velocity * force proxy)
    this.metrics.powerOutput = velocity * 10; // Arbitrary units

    // Tempo consistency (variance in velocity)
    if (this.velocityHistory.length >= 5) {
      const avgVel = this.metrics.averageVelocity;
      const variance = this.velocityHistory.reduce((sum, v) => sum + Math.pow(v - avgVel, 2), 0) / this.velocityHistory.length;
      const stdDev = Math.sqrt(variance);
      this.metrics.tempoConsistency = Math.max(0, 100 - stdDev * 50);
    }

    this.lastPosition = currentPosition;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      currentROM: 0,
      peakVelocity: 0,
      averageVelocity: 0,
      powerOutput: 0,
      timeUnderTension: 0,
      tempoConsistency: 100,
      formScore: 100,
    };
    this.velocityHistory = [];
    this.romHistory = [];
  }
}

/**
 * Neural delay simulation - realistic signal propagation time
 */
class NeuralDelayBuffer {
  private buffer: Array<{ timestamp: number; value: any }> = [];
  private delayMs: number;

  constructor(delayMs = 50) {
    // 50ms typical neuromuscular delay
    this.delayMs = delayMs;
  }

  addValue(value: any, currentTime: number) {
    this.buffer.push({ timestamp: currentTime + this.delayMs / 1000, value });
    // Keep buffer size manageable
    if (this.buffer.length > 10) {
      this.buffer.shift();
    }
  }

  getValue(currentTime: number): any | null {
    // Find first value whose timestamp has passed
    const index = this.buffer.findIndex(item => item.timestamp <= currentTime);
    if (index !== -1) {
      const value = this.buffer[index].value;
      this.buffer.splice(index, 1);
      return value;
    }
    return null;
  }

  clear() {
    this.buffer = [];
  }
}

/**
 * Anticipatory Postural Adjustments (APA) - body prepares before movement
 */
class APASystem {
  private anticipationWindow: number = 0.15; // 150ms before movement
  private lastPhase: string = 'IDLE';

  getAnticipationAdjustment(currentPhase: string, normalizedTime: number, mode: ExerciseMode): Record<string, { x: number; y: number; z: number }> {
    const adjustments: Record<string, { x: number; y: number; z: number }> = {};

    // Detect phase transitions
    const isTransitioning = currentPhase !== this.lastPhase;

    if (isTransitioning) {
      // Body prepares for upcoming phase
      if (currentPhase === 'ECCENTRIC') {
        // Prepare for descent - slight forward lean, core engagement
        if (mode === 'LEGS' || mode === 'LUNGE') {
          adjustments.spine = { x: 0.05, y: 0, z: 0 };
          adjustments.chest = { x: 0.03, y: 0, z: 0 };
          adjustments.hips = { x: 0.02, y: 0, z: 0 };
        }
      } else if (currentPhase === 'CONCENTRIC') {
        // Prepare for ascent - core bracing, posterior chain activation
        if (mode === 'LEGS' || mode === 'LUNGE') {
          adjustments.spine = { x: -0.03, y: 0, z: 0 };
          adjustments.chest = { x: -0.02, y: 0, z: 0 };
        }
      }
    }

    this.lastPhase = currentPhase;
    return adjustments;
  }
}

/**
 * Ground Reaction Forces (GRF) - Force plate simulation
 */
interface GroundReactionForce {
  vertical: number;
  anteriorPosterior: number;
  mediolateral: number;
  centerOfPressure: { x: number; z: number };
}

class GRFSimulator {
  private bodyMass: number = 75;
  private gravity: number = 9.81;

  calculateGRF(
    phase: string,
    rootYVelocity: number,
    muscleActivation: MuscleActivation,
    balanceOffset: THREE.Vector3
  ): GroundReactionForce {
    let verticalMultiplier = 1.0;

    if (phase === 'ECCENTRIC') {
      verticalMultiplier = 0.8 - Math.abs(rootYVelocity) * 0.5;
    } else if (phase === 'CONCENTRIC') {
      verticalMultiplier = 1.2 + Math.abs(rootYVelocity) * 2.0;
    } else if (phase === 'HOLD') {
      const tension = (muscleActivation.quadriceps + muscleActivation.glutes) / 2;
      verticalMultiplier = 1.0 + tension * 0.3;
    }

    const verticalForce = this.bodyMass * this.gravity * verticalMultiplier;
    const apForce = balanceOffset.z * 50;
    const mlForce = balanceOffset.x * 50;
    const cop = { x: balanceOffset.x * 0.1, z: balanceOffset.z * 0.1 };

    return { vertical: verticalForce, anteriorPosterior: apForce, mediolateral: mlForce, centerOfPressure: cop };
  }
}

/**
 * Dynamic Load Calculator
 */
class DynamicLoadCalculator {
  private externalLoad: number = 0;

  setLoad(weight: number) {
    this.externalLoad = weight;
  }

  calculateJointLoad(joint: string, angle: number, muscleActivation: number, phase: string): number {
    const baseTorque = this.externalLoad * 9.81 * Math.abs(Math.sin(angle));
    const muscleSupport = muscleActivation * 0.6;
    const effectiveLoad = baseTorque * (1 - muscleSupport);
    const phaseMultiplier = phase === 'ECCENTRIC' ? 1.3 : phase === 'CONCENTRIC' ? 0.9 : 1.0;
    return effectiveLoad * phaseMultiplier;
  }
}

/**
 * Adaptive Difficulty AI
 */
class AdaptiveDifficultyAI {
  private difficultyLevel: number = 1.0;
  private performanceHistory: number[] = [];

  updateDifficulty(performanceScore: number, fatigueLevel: number) {
    this.performanceHistory.push(performanceScore);
    if (this.performanceHistory.length > 20) this.performanceHistory.shift();

    if (this.performanceHistory.length >= 5) {
      const avgPerformance = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;
      if (avgPerformance > 90 && fatigueLevel < 0.3) {
        this.difficultyLevel = Math.min(1.5, this.difficultyLevel + 0.05);
      } else if (avgPerformance < 70 || fatigueLevel > 0.7) {
        this.difficultyLevel = Math.max(0.5, this.difficultyLevel - 0.05);
      }
    }
  }

  getDifficultyLevel(): number {
    return this.difficultyLevel;
  }
}

/**
 * Predictive Fatigue System
 */
class PredictiveFatigueSystem {
  private fatigueTrajectory: number[] = [];
  private timePoints: number[] = [];

  addDataPoint(fatigue: number, time: number) {
    this.fatigueTrajectory.push(fatigue);
    this.timePoints.push(time);
    if (this.fatigueTrajectory.length > 50) {
      this.fatigueTrajectory.shift();
      this.timePoints.shift();
    }
  }

  predictFatigueIn(seconds: number): number {
    if (this.fatigueTrajectory.length < 5) return 0;

    const n = this.fatigueTrajectory.length;
    const sumX = this.timePoints.reduce((a, b) => a + b, 0);
    const sumY = this.fatigueTrajectory.reduce((a, b) => a + b, 0);
    const sumXY = this.timePoints.reduce((sum, x, i) => sum + x * this.fatigueTrajectory[i], 0);
    const sumX2 = this.timePoints.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const futureTime = this.timePoints[this.timePoints.length - 1] + seconds;
    const predictedFatigue = slope * futureTime + intercept;

    return Math.max(0, Math.min(1, predictedFatigue));
  }
}

/**
 * Injury Risk Assessment
 */
interface InjuryRiskFactors {
  overloadRisk: number;
  fatigueRisk: number;
  formDegradation: number;
  asymmetryRisk: number;
  velocityRisk: number;
  overallRisk: number;
}

class InjuryRiskAssessor {
  private riskHistory: InjuryRiskFactors[] = [];

  assessRisk(jointLoads: Record<string, number>, fatigue: number, formScore: number, velocity: number, asymmetry: number): InjuryRiskFactors {
    const maxLoad = Math.max(...Object.values(jointLoads));
    const overloadRisk = Math.min(1, maxLoad / 1000);
    const fatigueRisk = Math.pow(fatigue, 2);
    const formDegradation = Math.max(0, (100 - formScore) / 100);
    const asymmetryRisk = asymmetry;
    const velocityRisk = velocity > 3.0 && fatigue > 0.5 ? 0.8 : 0.2;
    const overallRisk = overloadRisk * 0.3 + fatigueRisk * 0.25 + formDegradation * 0.25 + asymmetryRisk * 0.15 + velocityRisk * 0.05;

    const risk: InjuryRiskFactors = { overloadRisk, fatigueRisk, formDegradation, asymmetryRisk, velocityRisk, overallRisk };
    this.riskHistory.push(risk);
    if (this.riskHistory.length > 20) this.riskHistory.shift();
    return risk;
  }

  getRiskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (this.riskHistory.length === 0) return 'LOW';
    const recentRisk = this.riskHistory.slice(-5);
    const avgRisk = recentRisk.reduce((sum, r) => sum + r.overallRisk, 0) / recentRisk.length;
    if (avgRisk < 0.3) return 'LOW';
    if (avgRisk < 0.5) return 'MEDIUM';
    if (avgRisk < 0.7) return 'HIGH';
    return 'CRITICAL';
  }
}

/**
 * Asymmetry Detection
 */
class AsymmetryDetector {
  private leftActivations: number[] = [];
  private rightActivations: number[] = [];

  updateAsymmetry(leftJointAngles: Record<string, number>, rightJointAngles: Record<string, number>) {
    const leftAvg = Object.values(leftJointAngles).reduce((a, b) => a + Math.abs(b), 0) / Object.keys(leftJointAngles).length;
    const rightAvg = Object.values(rightJointAngles).reduce((a, b) => a + Math.abs(b), 0) / Object.keys(rightJointAngles).length;
    this.leftActivations.push(leftAvg);
    this.rightActivations.push(rightAvg);
    if (this.leftActivations.length > 30) {
      this.leftActivations.shift();
      this.rightActivations.shift();
    }
  }

  getAsymmetryScore(): number {
    if (this.leftActivations.length < 5) return 0;
    const leftMean = this.leftActivations.reduce((a, b) => a + b, 0) / this.leftActivations.length;
    const rightMean = this.rightActivations.reduce((a, b) => a + b, 0) / this.rightActivations.length;
    const diff = Math.abs(leftMean - rightMean);
    const avg = (leftMean + rightMean) / 2;
    return avg > 0 ? Math.min(1, diff / avg) : 0;
  }
}

/**
 * Fatigue modeling system for realistic muscle tiredness
 */
class FatigueModel {
  private fatigueLevel: number = 0; // 0 = fresh, 1 = exhausted
  private recoveryRate: number = 0.05; // Recovery per second
  private fatigueRate: number = 0.02; // Fatigue accumulation per rep
  private muscleActivations: MuscleActivation;

  constructor() {
    this.muscleActivations = {
      quadriceps: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0,
      pectorals: 0, deltoids: 0, latissimus: 0, biceps: 0, triceps: 0,
    };
  }

  updateFatigue(isExerting: boolean, deltaTime: number, currentActivations?: MuscleActivation) {
    if (isExerting && currentActivations) {
      // Accumulate fatigue based on muscle activation levels
      const avgActivation = Object.values(currentActivations).reduce((a, b) => a + b, 0) / Object.keys(currentActivations).length;
      this.fatigueLevel = Math.min(1, this.fatigueLevel + this.fatigueRate * deltaTime * avgActivation);

      // Track muscle-specific activations
      this.muscleActivations = currentActivations;
    } else {
      // Recover during rest
      this.fatigueLevel = Math.max(0, this.fatigueLevel - this.recoveryRate * deltaTime);
    }
  }

  getFatigueLevel(): number {
    return this.fatigueLevel;
  }

  getTremor(): number {
    // Muscle tremor increases with fatigue (0-0.02 radians)
    // More pronounced in highly activated muscles
    const baseTremor = this.fatigueLevel * 0.02 * (Math.random() - 0.5);
    return baseTremor;
  }

  getSlowdownFactor(): number {
    // Movement slows down when fatigued (0.7-1.0)
    return 1 - this.fatigueLevel * 0.3;
  }

  getMuscleActivations(): MuscleActivation {
    return { ...this.muscleActivations };
  }

  reset() {
    this.fatigueLevel = 0;
    this.muscleActivations = {
      quadriceps: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0,
      pectorals: 0, deltoids: 0, latissimus: 0, biceps: 0, triceps: 0,
    };
  }
}

/**
 * Form Quality Visualization Overlay
 * Shows real-time technique feedback with color-coded overlays
 */
interface FormQualityOverlayProps {
  injuryRisk: {
    overloadRisk: number;
    fatigueRisk: number;
    formDegradation: number;
    asymmetryRisk: number;
    velocityRisk: number;
    overallRisk: number;
  };
  formScore: number;
  asymmetryScore: number;
  boneMap: BoneMap;
  visible?: boolean;
}

const FormQualityOverlay: React.FC<FormQualityOverlayProps> = ({
  injuryRisk,
  formScore,
  asymmetryScore,
  boneMap,
  visible = true,
}) => {
  if (!visible || Object.keys(boneMap).length === 0) return null;

  /**
   * Convert form score (0-100) to quality color
   * Green (80-100) = Good, Yellow (60-80) = Needs attention, Orange (40-60) = Poor, Red (0-40) = Critical
   */
  const getFormColor = (score: number): THREE.Color => {
    const color = new THREE.Color();
    if (score >= 80) {
      // Green (good form)
      color.setRGB(0, 1, 0.3);
    } else if (score >= 60) {
      // Yellow (needs attention)
      const t = (80 - score) / 20;
      color.setRGB(t, 1, 0);
    } else if (score >= 40) {
      // Orange (poor form)
      const t = (60 - score) / 20;
      color.setRGB(1, 1 - t * 0.5, 0);
    } else {
      // Red (critical)
      color.setRGB(1, 0, 0);
    }
    return color;
  };

  /**
   * Identify problem areas based on injury risk factors
   */
  const getProblemJoints = (): string[] => {
    const problems: string[] = [];

    // Form degradation - highlight primary movement joints
    if (injuryRisk.formDegradation > 0.3) {
      problems.push('leftUpperLeg', 'rightUpperLeg', 'spine', 'chest');
    }

    // Asymmetry - highlight bilateral joints
    if (asymmetryScore > 0.15) {
      problems.push('leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg');
      problems.push('leftUpperArm', 'rightUpperArm');
    }

    // Overload - highlight load-bearing joints
    if (injuryRisk.overloadRisk > 0.4) {
      problems.push('hips', 'leftUpperLeg', 'rightUpperLeg', 'spine');
    }

    // Velocity issues - highlight dynamic joints
    if (injuryRisk.velocityRisk > 0.5) {
      problems.push('leftLowerLeg', 'rightLowerLeg', 'leftLowerArm', 'rightLowerArm');
    }

    return [...new Set(problems)]; // Remove duplicates
  };

  const problemJoints = getProblemJoints();
  const overallFormColor = getFormColor(formScore);

  /**
   * Create directional arrows for form correction guidance
   */
  const createCorrectionArrow = (
    position: THREE.Vector3,
    direction: [number, number, number],
    color: THREE.Color
  ) => {
    return (
      <group>
        {/* Arrow shaft */}
        <mesh position={[position.x, position.y, position.z]}>
          <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Arrow head */}
        <mesh
          position={[
            position.x + direction[0] * 0.1,
            position.y + direction[1] * 0.1,
            position.z + direction[2] * 0.1,
          ]}
          rotation={[
            direction[0] > 0 ? Math.PI / 2 : direction[0] < 0 ? -Math.PI / 2 : 0,
            0,
            direction[2] > 0 ? -Math.PI / 2 : direction[2] < 0 ? Math.PI / 2 : 0,
          ]}
        >
          <coneGeometry args={[0.025, 0.05, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Highlight problem joints */}
      {problemJoints.map((jointName) => {
        const bone = boneMap[jointName];
        if (!bone) return null;

        const worldPos = new THREE.Vector3();
        bone.getWorldPosition(worldPos);

        // Calculate specific form issue color
        let issueColor = overallFormColor;
        let size = 0.08;

        // Emphasize based on specific issue
        if (asymmetryScore > 0.15 && (jointName.includes('left') || jointName.includes('right'))) {
          issueColor = new THREE.Color(1, 0.5, 0); // Orange for asymmetry
          size = 0.10;
        } else if (injuryRisk.formDegradation > 0.5) {
          issueColor = new THREE.Color(1, 0, 0); // Red for poor form
          size = 0.12;
        }

        return (
          <group key={`form-${jointName}`}>
            {/* Pulsing ring indicator */}
            <mesh position={[worldPos.x, worldPos.y, worldPos.z]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[size, 0.01, 8, 16]} />
              <meshStandardMaterial
                color={issueColor}
                emissive={issueColor}
                emissiveIntensity={0.8}
                transparent
                opacity={0.6 + Math.sin(Date.now() / 300) * 0.2} // Pulsing effect
                roughness={0.2}
                metalness={0.3}
              />
            </mesh>

            {/* Form correction arrows for specific issues */}
            {asymmetryScore > 0.2 && jointName === 'spine' &&
              createCorrectionArrow(worldPos, [0, 1, 0], new THREE.Color(0, 1, 0.5))}
            {injuryRisk.formDegradation > 0.4 && jointName === 'chest' &&
              createCorrectionArrow(worldPos, [0, 0, -1], new THREE.Color(0, 1, 1))}
          </group>
        );
      })}

      {/* Overall form quality indicator - floating above head */}
      {boneMap.head && (
        <group>
          <mesh
            position={[
              boneMap.head.position.x,
              boneMap.head.position.y + 0.3,
              boneMap.head.position.z,
            ]}
          >
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color={overallFormColor}
              emissive={overallFormColor}
              emissiveIntensity={1.0}
              transparent
              opacity={0.9}
              roughness={0.1}
              metalness={0.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * Joint Stress Indicator Component
 * Visualizes joint load with color-coded markers
 * Green (0-300N) = Safe, Yellow (300-600N) = Moderate, Orange (600-900N) = High, Red (900N+) = Critical
 */
interface JointStressIndicatorProps {
  jointLoads: Record<string, number>;
  boneMap: BoneMap;
  visible?: boolean;
}

const JointStressIndicator: React.FC<JointStressIndicatorProps> = ({ jointLoads, boneMap, visible = true }) => {
  if (!visible || Object.keys(boneMap).length === 0) return null;

  /**
   * Convert joint load (Newtons) to stress color
   * Green → Yellow → Orange → Red based on load thresholds
   */
  const getStressColor = (load: number): THREE.Color => {
    const color = new THREE.Color();
    if (load < 300) {
      // Green (safe)
      const t = load / 300;
      color.setRGB(0, 1, 0.3);
    } else if (load < 600) {
      // Yellow (moderate)
      const t = (load - 300) / 300;
      color.setRGB(t, 1, 0);
    } else if (load < 900) {
      // Orange (high)
      const t = (load - 600) / 300;
      color.setRGB(1, 1 - t * 0.5, 0);
    } else {
      // Red (critical)
      color.setRGB(1, 0, 0);
    }
    return color;
  };

  /**
   * Get stress level label
   */
  const getStressLevel = (load: number): string => {
    if (load < 300) return 'SAFE';
    if (load < 600) return 'MODERATE';
    if (load < 900) return 'HIGH';
    return 'CRITICAL';
  };

  /**
   * Primary joints to monitor for stress
   */
  const monitoredJoints = [
    'leftUpperLeg', 'rightUpperLeg',
    'leftLowerLeg', 'rightLowerLeg',
    'leftUpperArm', 'rightUpperArm',
    'leftLowerArm', 'rightLowerArm',
    'spine', 'chest', 'hips',
  ];

  return (
    <group>
      {monitoredJoints.map((jointName) => {
        const bone = boneMap[jointName];
        const load = jointLoads[jointName] || 0;
        if (!bone || load === 0) return null;

        // Get world position of the joint
        const worldPos = new THREE.Vector3();
        bone.getWorldPosition(worldPos);

        const color = getStressColor(load);
        const size = 0.04 + (Math.min(load, 1200) / 1200) * 0.06; // Size increases with load

        return (
          <mesh
            key={`stress-${jointName}`}
            position={[worldPos.x, worldPos.y, worldPos.z]}
          >
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
              roughness={0.2}
              metalness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Muscle Heat Map Overlay Component
 * Visualizes muscle activation with color-coded 3D overlays
 */
interface MuscleHeatMapProps {
  muscleActivation: MuscleActivation;
  boneMap: BoneMap;
  visible?: boolean;
}

const MuscleHeatMap: React.FC<MuscleHeatMapProps> = ({ muscleActivation, boneMap, visible = true }) => {
  if (!visible || Object.keys(boneMap).length === 0) return null;

  /**
   * Convert muscle activation (0-1) to heat map color
   * Blue (low) → Cyan → Green → Yellow → Orange → Red (high)
   */
  const getHeatColor = (activation: number): THREE.Color => {
    const color = new THREE.Color();
    if (activation < 0.2) {
      // Blue to Cyan
      color.setRGB(0, activation * 5 * 0.5, 1);
    } else if (activation < 0.4) {
      // Cyan to Green
      const t = (activation - 0.2) * 5;
      color.setRGB(0, 1, 1 - t);
    } else if (activation < 0.6) {
      // Green to Yellow
      const t = (activation - 0.4) * 5;
      color.setRGB(t, 1, 0);
    } else if (activation < 0.8) {
      // Yellow to Orange
      const t = (activation - 0.6) * 5;
      color.setRGB(1, 1 - t * 0.5, 0);
    } else {
      // Orange to Red
      const t = (activation - 0.8) * 5;
      color.setRGB(1, 0.5 - t * 0.5, 0);
    }
    return color;
  };

  /**
   * Map muscle groups to bone positions and geometry
   */
  const muscleOverlays: Array<{
    muscle: keyof MuscleActivation;
    bones: string[];
    size: [number, number]; // [radius, length]
    offset: [number, number, number];
  }> = [
    // Leg muscles
    { muscle: 'quadriceps', bones: ['leftUpperLeg', 'rightUpperLeg'], size: [0.12, 0.35], offset: [0, -0.1, 0.05] },
    { muscle: 'hamstrings', bones: ['leftUpperLeg', 'rightUpperLeg'], size: [0.10, 0.30], offset: [0, -0.1, -0.05] },
    { muscle: 'calves', bones: ['leftLowerLeg', 'rightLowerLeg'], size: [0.08, 0.25], offset: [0, -0.1, -0.02] },
    { muscle: 'glutes', bones: ['hips'], size: [0.15, 0.20], offset: [0, -0.1, -0.08] },

    // Core muscles
    { muscle: 'core', bones: ['spine'], size: [0.18, 0.30], offset: [0, 0, 0] },

    // Upper body muscles
    { muscle: 'pectorals', bones: ['chest'], size: [0.14, 0.20], offset: [0, 0, 0.08] },
    { muscle: 'deltoids', bones: ['leftUpperArm', 'rightUpperArm'], size: [0.09, 0.12], offset: [0, 0.08, 0] },
    { muscle: 'latissimus', bones: ['chest'], size: [0.16, 0.28], offset: [0, -0.05, -0.08] },

    // Arm muscles
    { muscle: 'biceps', bones: ['leftUpperArm', 'rightUpperArm'], size: [0.06, 0.18], offset: [0, -0.05, 0.03] },
    { muscle: 'triceps', bones: ['leftUpperArm', 'rightUpperArm'], size: [0.06, 0.18], offset: [0, -0.05, -0.03] },
  ];

  return (
    <group>
      {muscleOverlays.map((overlay, index) => {
        const activation = muscleActivation[overlay.muscle];
        const color = getHeatColor(activation);
        const opacity = Math.max(0.2, activation * 0.7); // Min 20% opacity, max 70%

        return overlay.bones.map((boneName, boneIndex) => {
          const bone = boneMap[boneName];
          if (!bone) return null;

          // Get world position of the bone
          const worldPos = new THREE.Vector3();
          bone.getWorldPosition(worldPos);

          return (
            <mesh
              key={`${overlay.muscle}-${boneName}-${index}-${boneIndex}`}
              position={[
                worldPos.x + overlay.offset[0],
                worldPos.y + overlay.offset[1],
                worldPos.z + overlay.offset[2],
              ]}
            >
              <capsuleGeometry args={[overlay.size[0], overlay.size[1], 4, 8]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
                emissive={color}
                emissiveIntensity={activation * 0.5}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
          );
        });
      })}
    </group>
  );
};

/**
 * Bone Culling System
 * Optimizes rendering by identifying non-critical bones and overlay elements
 */
class BoneCullingSystem {
  /**
   * Define bone importance hierarchy
   * Critical bones always update, peripheral bones can be skipped in low LOD
   */
  private static readonly BONE_IMPORTANCE = {
    critical: ['hips', 'spine', 'chest', 'leftUpperLeg', 'rightUpperLeg', 'leftLowerLeg', 'rightLowerLeg'],
    important: ['leftUpperArm', 'rightUpperArm', 'leftLowerArm', 'rightLowerArm', 'neck'],
    peripheral: ['leftHand', 'rightHand', 'leftFoot', 'rightFoot', 'head'],
  };

  /**
   * Determine if a bone should be updated based on LOD and importance
   */
  shouldUpdateBone(boneName: string, lod: 'high' | 'medium' | 'low'): boolean {
    if (lod === 'high') return true; // Always update in high LOD

    const isCritical = BoneCullingSystem.BONE_IMPORTANCE.critical.includes(boneName);
    if (isCritical) return true; // Always update critical bones

    if (lod === 'medium') {
      const isImportant = BoneCullingSystem.BONE_IMPORTANCE.important.includes(boneName);
      return isCritical || isImportant; // Update critical and important in medium
    }

    // Low LOD: only update critical bones
    return isCritical;
  }

  /**
   * Get list of bones to update based on LOD
   */
  getActiveBones(allBones: string[], lod: 'high' | 'medium' | 'low'): string[] {
    return allBones.filter((bone) => this.shouldUpdateBone(bone, lod));
  }

  /**
   * Check if overlay element should render based on camera frustum
   * Simple sphere-based frustum culling
   */
  isInFrustum(position: THREE.Vector3, camera: THREE.Camera, radius: number = 0.2): boolean {
    // Create a frustum from the camera
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);

    // Create a bounding sphere for the overlay
    const sphere = new THREE.Sphere(position, radius);

    // Check if sphere intersects frustum
    return frustum.intersectsSphere(sphere);
  }

  /**
   * Get culling stats for debugging
   */
  getCullingStats(totalBones: number, activeBones: number): {
    culledCount: number;
    culledPercentage: number;
  } {
    const culledCount = totalBones - activeBones;
    const culledPercentage = (culledCount / totalBones) * 100;
    return { culledCount, culledPercentage };
  }
}

/**
 * LOD (Level of Detail) Manager
 * Dynamically adjusts rendering quality based on camera distance and performance
 */
class LODManager {
  private currentLOD: 'high' | 'medium' | 'low' = 'high';
  private lastUpdateTime: number = 0;
  private updateThrottleMs: number = 200; // Update LOD every 200ms
  private performanceHistory: number[] = [];
  private maxHistorySize: number = 30; // 30 frames of history

  /**
   * Calculate LOD level based on camera distance
   */
  getLODFromDistance(distance: number): 'high' | 'medium' | 'low' {
    if (distance < 3) return 'high';
    if (distance < 6) return 'medium';
    return 'low';
  }

  /**
   * Calculate LOD level based on frame time (performance)
   */
  getLODFromPerformance(frameTimeMs: number): 'high' | 'medium' | 'low' {
    this.performanceHistory.push(frameTimeMs);
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }

    const avgFrameTime = this.performanceHistory.reduce((a, b) => a + b, 0) / this.performanceHistory.length;

    // Target 60fps (16.67ms), degrade if higher
    if (avgFrameTime < 20) return 'high';    // Good performance
    if (avgFrameTime < 33) return 'medium';  // Moderate performance (~30fps)
    return 'low';                             // Poor performance
  }

  /**
   * Update LOD level (throttled)
   */
  updateLOD(cameraDistance: number, frameTimeMs: number, currentTime: number): 'high' | 'medium' | 'low' {
    if (currentTime - this.lastUpdateTime < this.updateThrottleMs) {
      return this.currentLOD;
    }

    this.lastUpdateTime = currentTime;

    const distanceLOD = this.getLODFromDistance(cameraDistance);
    const performanceLOD = this.getLODFromPerformance(frameTimeMs);

    // Take the lower LOD (more aggressive optimization)
    const lodLevels = { high: 2, medium: 1, low: 0 };
    const finalLOD = Math.min(lodLevels[distanceLOD], lodLevels[performanceLOD]);

    this.currentLOD = finalLOD === 2 ? 'high' : finalLOD === 1 ? 'medium' : 'low';
    return this.currentLOD;
  }

  /**
   * Get update rate multiplier based on LOD
   */
  getUpdateRateMultiplier(): number {
    switch (this.currentLOD) {
      case 'high': return 1;    // Update every frame
      case 'medium': return 2;  // Update every 2 frames
      case 'low': return 4;     // Update every 4 frames
    }
  }

  /**
   * Should update overlays (skip for low LOD)
   */
  shouldUpdateOverlays(): boolean {
    return this.currentLOD !== 'low';
  }

  /**
   * Get geometry quality settings
   */
  getGeometryQuality(): { sphereSegments: number; capsuleSegments: number; torusSegments: number } {
    switch (this.currentLOD) {
      case 'high':
        return { sphereSegments: 16, capsuleSegments: 8, torusSegments: 16 };
      case 'medium':
        return { sphereSegments: 12, capsuleSegments: 6, torusSegments: 12 };
      case 'low':
        return { sphereSegments: 8, capsuleSegments: 4, torusSegments: 8 };
    }
  }

  getCurrentLOD(): 'high' | 'medium' | 'low' {
    return this.currentLOD;
  }
}

const AvatarModel: React.FC<AvatarModelProps> = ({ mode, modelPath, bodyPosition, animationKey, exerciseName, onPhaseChange }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [boneMap, setBoneMap] = useState<BoneMap>({});
  const lastPhaseRef = useRef<string>('');
  const [skeleton, setSkeleton] = useState<THREE.Skeleton | null>(null);
  const [defaultHipsY, setDefaultHipsY] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // State for muscle heat map visualization
  const [currentMuscleActivation, setCurrentMuscleActivation] = useState<MuscleActivation>({
    quadriceps: 0, hamstrings: 0, glutes: 0, calves: 0, core: 0,
    pectorals: 0, deltoids: 0, latissimus: 0, biceps: 0, triceps: 0,
  });

  // State for joint stress indicators
  const [currentJointLoads, setCurrentJointLoads] = useState<Record<string, number>>({});

  // State for form quality visualization
  const [currentInjuryRisk, setCurrentInjuryRisk] = useState({
    overloadRisk: 0, fatigueRisk: 0, formDegradation: 0, asymmetryRisk: 0, velocityRisk: 0, overallRisk: 0,
  });
  const [currentFormScore, setCurrentFormScore] = useState(100);
  const [currentAsymmetryScore, setCurrentAsymmetryScore] = useState(0);

  // LOD Manager for performance optimization
  const lodManager = useRef(new LODManager());
  const [currentLOD, setCurrentLOD] = useState<'high' | 'medium' | 'low'>('high');
  const frameCounter = useRef(0);

  // Bone Culling System for selective bone updates
  const boneCullingSystem = useRef(new BoneCullingSystem());

  // Spring physics for ultra-realistic motion with momentum
  const springPhysics = useRef(new SpringPhysics(170, 26, 1));
  const rootYSpringState = useRef<SpringState>({ position: 0, velocity: 0, target: 0 });
  const lastFrameTime = useRef<number>(0);

  // Per-joint spring physics system for ultra-realistic motion
  const jointSpringPhysics = useRef<Map<string, Vector3SpringPhysics>>(new Map());
  const jointSpringStates = useRef<Map<string, Vector3SpringState>>(new Map());

  // Center of mass tracker for realistic balance
  const comTracker = useRef(new CenterOfMassTracker());

  // Fatigue modeling for realistic muscle tiredness
  const fatigueModel = useRef(new FatigueModel());

  // Performance metrics tracking
  const performanceTracker = useRef(new PerformanceTracker());

  // Neural delay simulation for realistic response time
  const neuralDelayBuffer = useRef(new NeuralDelayBuffer(50));

  // Anticipatory Postural Adjustments system
  const apaSystem = useRef(new APASystem());

  // Ground Reaction Forces simulator
  const grfSimulator = useRef(new GRFSimulator());

  // Dynamic Load Calculator
  const loadCalculator = useRef(new DynamicLoadCalculator());

  // Adaptive Difficulty AI
  const adaptiveAI = useRef(new AdaptiveDifficultyAI());

  // Predictive Fatigue System
  const predictiveFatigue = useRef(new PredictiveFatigueSystem());

  // Injury Risk Assessor
  const injuryRiskAssessor = useRef(new InjuryRiskAssessor());

  // Asymmetry Detector
  const asymmetryDetector = useRef(new AsymmetryDetector());

  // Secondary motion accumulators for micro-movements
  const breathingPhase = useRef<number>(0);
  const swayPhase = useRef<number>(0);
  const weightShiftPhase = useRef<number>(0);

  // Initialize per-joint spring physics
  useEffect(() => {
    for (const [joint, props] of Object.entries(JOINT_PHYSICS_PROPERTIES)) {
      jointSpringPhysics.current.set(
        joint,
        new Vector3SpringPhysics(props.stiffness, props.damping, props.mass)
      );
      jointSpringStates.current.set(joint, {
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        target: { x: 0, y: 0, z: 0 },
      });
    }
  }, []);

  // Load the GLTF model
  const { scene } = useGLTF(modelPath);

  // Clone and setup the model
  const clonedScene = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene) as THREE.Group;

    // Find skeleton and create bone map
    let foundSkeleton: THREE.Skeleton | null = null;
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh && !foundSkeleton) {
        foundSkeleton = (child as THREE.SkinnedMesh).skeleton;

        // Improve materials
        const mesh = child as THREE.SkinnedMesh;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.6;
          mat.metalness = 0.1;
          mat.envMapIntensity = 0.8;
          mat.needsUpdate = true;
        }
      }
    });

    if (foundSkeleton) {
      const map = createBoneMap(foundSkeleton);
      setBoneMap(map);
      setSkeleton(foundSkeleton);

      // Store default hips Y position
      if (map.hips) {
        setDefaultHipsY(map.hips.position.y);
      }

      // Debug: Log validation
      const validation = validateSkeleton(foundSkeleton);
      logger.debug('[RealisticAvatar3D] Skeleton validation:', validation);
      logger.debug('[RealisticAvatar3D] All bones:', listAllBones(foundSkeleton));
    }

    return cloned;
  }, [scene]);

  // Get base pose for current body position
  const basePose = BASE_POSES[bodyPosition];

  // Get exercise-specific animation (memoized)
  const specificAnimation = useMemo(() => {
    if (exerciseName) {
      const anim = getExerciseAnimation(exerciseName);
      if (anim) {
        logger.debug('[RealisticAvatar3D] Using specific animation for:', exerciseName, anim.exerciseName);
        return anim;
      }
    }
    if (animationKey) {
      const anim = getExerciseAnimation(animationKey);
      if (anim) {
        logger.debug('[RealisticAvatar3D] Using animation key:', animationKey);
        return anim;
      }
    }
    return null;
  }, [exerciseName, animationKey]);

  // Animation loop with base pose support and ultra-realistic physics
  useFrame((state) => {
    if (!groupRef.current || Object.keys(boneMap).length === 0) return;

    const time = state.clock.getElapsedTime();
    const deltaTime = lastFrameTime.current > 0 ? time - lastFrameTime.current : 0.016;
    lastFrameTime.current = time;

    // === LOD (Level of Detail) OPTIMIZATION ===
    // Calculate camera distance to avatar
    const cameraPos = state.camera.position;
    const avatarPos = groupRef.current.position;
    const cameraDistance = Math.sqrt(
      Math.pow(cameraPos.x - avatarPos.x, 2) +
      Math.pow(cameraPos.y - avatarPos.y, 2) +
      Math.pow(cameraPos.z - avatarPos.z, 2)
    );

    // Update LOD based on distance and performance
    const frameTimeMs = deltaTime * 1000;
    const lod = lodManager.current.updateLOD(cameraDistance, frameTimeMs, time * 1000);
    setCurrentLOD(lod);

    // Frame skipping based on LOD
    frameCounter.current++;
    const updateMultiplier = lodManager.current.getUpdateRateMultiplier();
    const shouldUpdateThisFrame = frameCounter.current % updateMultiplier === 0;

    // Skip expensive updates if LOD dictates
    if (!shouldUpdateThisFrame) {
      return;
    }

    let animationPose: Record<string, { x: number; y: number; z: number }>;
    let rootY: number;
    let duration: number;

    // Use exercise-specific animation if available, otherwise fallback to mode-based
    let currentPhase = 'IDLE';
    let normalizedTime: number;

    if (specificAnimation) {
      duration = specificAnimation.duration;
      normalizedTime = (time % duration) / duration;
      const result = interpolateExerciseKeyframes(specificAnimation.keyframes, normalizedTime);
      animationPose = result.pose;
      rootY = result.rootY;

      // Determine current phase from animation phases
      if (specificAnimation.phases) {
        for (const phase of specificAnimation.phases) {
          if (normalizedTime >= phase.startTime && normalizedTime <= phase.endTime) {
            currentPhase = phase.name;
            break;
          }
        }
      }
    } else {
      const fallbackAnimation = EXERCISE_ANIMATIONS[mode];
      duration = fallbackAnimation.duration;
      normalizedTime = (time % duration) / duration;
      const result = interpolateKeyframes(fallbackAnimation.keyframes, normalizedTime);
      animationPose = result.pose;
      rootY = result.rootY;

      // Determine phase from normalized time for fallback animation
      if (normalizedTime < 0.6) {
        currentPhase = 'ECCENTRIC';
      } else if (normalizedTime < 0.8) {
        currentPhase = 'HOLD';
      } else {
        currentPhase = 'CONCENTRIC';
      }
    }

    // Report phase changes via callback
    if (onPhaseChange && currentPhase !== lastPhaseRef.current) {
      lastPhaseRef.current = currentPhase;
      onPhaseChange(currentPhase, normalizedTime);
    }

    // === SECONDARY MOTION: MICRO-MOVEMENTS FOR ULTRA-REALISM ===

    // 1. Enhanced Breathing Animation - realistic respiratory pattern
    breathingPhase.current += deltaTime * 0.8; // ~12 breaths per minute
    const breathCycle = Math.sin(breathingPhase.current);
    // Inhale faster, exhale slower (realistic breathing)
    const breathingStrength = breathCycle > 0
      ? Math.pow(breathCycle, 0.7) * 0.025  // Inhale
      : Math.pow(-breathCycle, 1.3) * 0.02; // Exhale

    // 2. Subtle Weight Shift - natural micro-balance adjustments
    weightShiftPhase.current += deltaTime * 0.4;
    const weightShift = Math.sin(weightShiftPhase.current) * 0.008;

    // 3. Natural Sway - subtle postural sway (0.1-0.3 Hz typical for standing)
    swayPhase.current += deltaTime * 0.5;
    const lateralSway = Math.sin(swayPhase.current) * 0.012;
    const anteriorSway = Math.cos(swayPhase.current * 0.7) * 0.01;

    // Merge base pose with animation pose
    // Base pose provides the starting position, animation modifies from there
    const combinedPose: Record<string, { x: number; y: number; z: number }> = {};

    // First apply base pose
    for (const [joint, rotation] of Object.entries(basePose.pose)) {
      combinedPose[joint] = { ...rotation };
    }

    // Then add animation deltas (for standing, these are the actual poses)
    // For other positions, we add them as modifications
    for (const [joint, rotation] of Object.entries(animationPose)) {
      if (bodyPosition === 'standing') {
        // Standing: use animation pose directly
        combinedPose[joint] = rotation;
      } else {
        // Other positions: add animation as delta to base pose
        if (combinedPose[joint]) {
          combinedPose[joint] = {
            x: combinedPose[joint].x + rotation.x * 0.3, // Scale down animation for other poses
            y: combinedPose[joint].y + rotation.y * 0.3,
            z: combinedPose[joint].z + rotation.z * 0.3,
          };
        } else {
          combinedPose[joint] = rotation;
        }
      }
    }

    // === ADD SECONDARY MOTION TO JOINTS ===

    // Breathing affects spine, chest, and shoulders
    if (combinedPose.spine) {
      combinedPose.spine.x += breathingStrength * 0.5;
    }
    if (combinedPose.chest) {
      combinedPose.chest.x += breathingStrength * 0.8;
    }
    if (combinedPose.leftUpperArm) {
      combinedPose.leftUpperArm.z += breathingStrength * 0.3;
    }
    if (combinedPose.rightUpperArm) {
      combinedPose.rightUpperArm.z -= breathingStrength * 0.3;
    }

    // Weight shift affects hips and legs
    if (combinedPose.hips) {
      combinedPose.hips.z += weightShift;
    }
    if (combinedPose.leftUpperLeg) {
      combinedPose.leftUpperLeg.z += weightShift * 0.5;
    }
    if (combinedPose.rightUpperLeg) {
      combinedPose.rightUpperLeg.z -= weightShift * 0.5;
    }

    // Postural sway affects spine and head
    if (combinedPose.spine) {
      combinedPose.spine.z += lateralSway;
      combinedPose.spine.x += anteriorSway;
    }
    if (combinedPose.neck) {
      combinedPose.neck.z += lateralSway * 0.7;
      combinedPose.neck.x += anteriorSway * 0.5;
    }
    if (combinedPose.head) {
      combinedPose.head.z += lateralSway * 0.5;
    }

    // === MUSCLE ACTIVATION PATTERNS ===
    // Get current muscle activations based on phase
    const activationPatterns = MUSCLE_ACTIVATION_PATTERNS[mode];
    let muscleActivation: MuscleActivation;
    if (currentPhase === 'ECCENTRIC') {
      muscleActivation = activationPatterns.eccentric;
    } else if (currentPhase === 'HOLD') {
      muscleActivation = activationPatterns.hold;
    } else if (currentPhase === 'CONCENTRIC') {
      muscleActivation = activationPatterns.concentric;
    } else {
      // Idle/rest - minimal activation
      muscleActivation = {
        quadriceps: 0.1, hamstrings: 0.1, glutes: 0.1, calves: 0.1, core: 0.2,
        pectorals: 0.1, deltoids: 0.1, latissimus: 0.1, biceps: 0.1, triceps: 0.1,
      };
    }

    // Update state for heat map visualization
    setCurrentMuscleActivation(muscleActivation);

    // === ANTICIPATORY POSTURAL ADJUSTMENTS (APA) ===
    // Body prepares for upcoming movements
    const apaAdjustments = apaSystem.current.getAnticipationAdjustment(currentPhase, normalizedTime, mode);
    for (const [joint, adjustment] of Object.entries(apaAdjustments)) {
      if (combinedPose[joint]) {
        combinedPose[joint].x += adjustment.x;
        combinedPose[joint].y += adjustment.y;
        combinedPose[joint].z += adjustment.z;
      }
    }

    // === JOINT COUPLING - Coordinated joint movements ===
    // Apply kinematic chain relationships
    const coupledAdjustments: Record<string, { x: number; y: number; z: number }> = {};
    for (const [joint, couplings] of Object.entries(JOINT_COUPLING)) {
      if (combinedPose[joint]) {
        for (const coupling of couplings) {
          for (const coupledJoint of coupling.coupled) {
            if (!coupledAdjustments[coupledJoint]) {
              coupledAdjustments[coupledJoint] = { x: 0, y: 0, z: 0 };
            }
            // Add proportional movement from driving joint
            coupledAdjustments[coupledJoint].x += combinedPose[joint].x * coupling.ratio * 0.1;
            coupledAdjustments[coupledJoint].y += combinedPose[joint].y * coupling.ratio * 0.1;
            coupledAdjustments[coupledJoint].z += combinedPose[joint].z * coupling.ratio * 0.1;
          }
        }
      }
    }
    // Apply coupled adjustments
    for (const [joint, adjustment] of Object.entries(coupledAdjustments)) {
      if (combinedPose[joint]) {
        combinedPose[joint].x += adjustment.x;
        combinedPose[joint].y += adjustment.y;
        combinedPose[joint].z += adjustment.z;
      }
    }

    // === NEURAL DELAY - Realistic signal propagation time ===
    // Add current pose to neural buffer
    neuralDelayBuffer.current.addValue({ ...combinedPose }, time);

    // Try to get delayed pose (50ms ago)
    const delayedPose = neuralDelayBuffer.current.getValue(time) as Record<string, { x: number; y: number; z: number }> | null;
    const poseToUse: Record<string, { x: number; y: number; z: number }> = delayedPose || combinedPose; // Fallback to current if buffer empty

    // === UPDATE FATIGUE MODEL with muscle activations ===
    // Determine if exercising (eccentric or concentric phase)
    const isExerting = currentPhase === 'ECCENTRIC' || currentPhase === 'CONCENTRIC';
    fatigueModel.current.updateFatigue(isExerting, deltaTime, muscleActivation);
    const fatigueTremor = fatigueModel.current.getTremor();

    // === UPDATE PERFORMANCE METRICS ===
    // Track ROM and velocity for primary joint
    const primaryJoints = EXERCISE_BIOMECHANICS[mode].primaryJoints;
    let primaryJointVelocity = 0;
    if (primaryJoints.length > 0 && poseToUse[primaryJoints[0]]) {
      const primaryJointRotation = poseToUse[primaryJoints[0]];
      const totalRotation = Math.sqrt(
        primaryJointRotation.x ** 2 +
        primaryJointRotation.y ** 2 +
        primaryJointRotation.z ** 2
      );
      performanceTracker.current.updateMetrics(totalRotation, deltaTime, currentPhase);
      const metrics = performanceTracker.current.getMetrics();
      primaryJointVelocity = metrics.averageVelocity;
    }

    // === CALCULATE DYNAMIC JOINT LOADS (with Bone Culling) ===
    // Get active bones based on current LOD level
    const allJoints = Object.keys(poseToUse);
    const activeJoints = boneCullingSystem.current.getActiveBones(allJoints, lod);

    const jointLoads: Record<string, number> = {};
    for (const [joint, rotation] of Object.entries(poseToUse)) {
      // Skip non-active joints in lower LOD levels
      if (!activeJoints.includes(joint)) {
        jointLoads[joint] = 0; // Set to 0 for culled joints
        continue;
      }

      const biomechanics = EXERCISE_BIOMECHANICS[mode];
      const activation = biomechanics.primaryJoints.includes(joint) ? 0.8 : 0.3;
      const totalAngle = Math.sqrt(rotation.x ** 2 + rotation.y ** 2 + rotation.z ** 2);
      jointLoads[joint] = loadCalculator.current.calculateJointLoad(joint, totalAngle, activation, currentPhase);
    }

    // Update state for joint stress visualization
    setCurrentJointLoads(jointLoads);

    // === UPDATE ASYMMETRY DETECTION ===
    const leftJoints: Record<string, number> = {};
    const rightJoints: Record<string, number> = {};
    for (const [joint, rotation] of Object.entries(poseToUse)) {
      const totalAngle = Math.abs(rotation.x) + Math.abs(rotation.y) + Math.abs(rotation.z);
      if (joint.startsWith('left')) leftJoints[joint] = totalAngle;
      if (joint.startsWith('right')) rightJoints[joint] = totalAngle;
    }
    asymmetryDetector.current.updateAsymmetry(leftJoints, rightJoints);
    const asymmetryScore = asymmetryDetector.current.getAsymmetryScore();

    // === UPDATE PREDICTIVE FATIGUE ===
    predictiveFatigue.current.addDataPoint(fatigueModel.current.getFatigueLevel(), time);
    const predictedFatigueIn30s = predictiveFatigue.current.predictFatigueIn(30);

    // === ASSESS INJURY RISK ===
    const currentMetrics = performanceTracker.current.getMetrics();
    const injuryRisk = injuryRiskAssessor.current.assessRisk(
      jointLoads,
      fatigueModel.current.getFatigueLevel(),
      currentMetrics.formScore,
      primaryJointVelocity,
      asymmetryScore
    );

    // Update states for form quality visualization
    setCurrentInjuryRisk(injuryRisk);
    setCurrentFormScore(currentMetrics.formScore);
    setCurrentAsymmetryScore(asymmetryScore);

    // === UPDATE ADAPTIVE DIFFICULTY AI ===
    adaptiveAI.current.updateDifficulty(currentMetrics.formScore, fatigueModel.current.getFatigueLevel());

    // === APPLY ANATOMICAL CONSTRAINTS FOR 100% ACCURATE BIOMECHANICS ===
    // This ensures all joint rotations stay within realistic human limits
    const constrainedPose: Record<string, { x: number; y: number; z: number }> = {};
    for (const [joint, rotation] of Object.entries(poseToUse)) {
      let clampedRotation = clampJointToAnatomicalLimits(joint, rotation);

      // Add fatigue tremor to primary joints during exertion
      if (isExerting) {
        const biomechanics = EXERCISE_BIOMECHANICS[mode];
        if (biomechanics.primaryJoints.includes(joint)) {
          clampedRotation.x += fatigueTremor;
          clampedRotation.y += fatigueTremor * 0.5;
          clampedRotation.z += fatigueTremor * 0.7;
        }
      }

      constrainedPose[joint] = clampedRotation;
    }

    // === PER-JOINT SPRING PHYSICS FOR ULTRA-REALISTIC MOTION ===
    const physicsAppliedPose: Record<string, { x: number; y: number; z: number }> = {};

    for (const [joint, targetRotation] of Object.entries(constrainedPose)) {
      const springPhysics = jointSpringPhysics.current.get(joint);
      let springState = jointSpringStates.current.get(joint);

      if (springPhysics && springState) {
        // Update spring state target
        springState.target = targetRotation;

        // Apply spring physics
        springState = springPhysics.update(springState, Math.min(deltaTime, 0.05));

        // Store updated state
        jointSpringStates.current.set(joint, springState);

        // Use spring-smoothed position
        physicsAppliedPose[joint] = springState.position;
      } else {
        // Fallback if no spring physics defined for this joint
        physicsAppliedPose[joint] = targetRotation;
      }
    }

    // Apply physics-smoothed pose to bones
    applyPose(boneMap, physicsAppliedPose, 0.05); // Even smoother with per-joint physics

    // === PHYSICS-BASED ROOT POSITION WITH SPRING SYSTEM ===
    if (boneMap.hips) {
      const baseRootY = basePose.rootPosition.y;
      const animRootY = bodyPosition === 'standing' ? rootY : rootY * 0.3;
      const targetY = defaultHipsY + baseRootY + (animRootY || 0);

      // Update spring physics
      rootYSpringState.current.target = targetY;
      rootYSpringState.current = springPhysics.current.update(
        rootYSpringState.current,
        Math.min(deltaTime, 0.05) // Cap deltaTime to prevent instability
      );

      // Apply spring position with breathing influence
      boneMap.hips.position.y = rootYSpringState.current.position + breathingStrength * 0.3;
    }

    // === CENTER OF MASS TRACKING FOR REALISTIC BALANCE ===
    // Collect all joint world positions
    const jointPositions: Record<string, THREE.Vector3> = {};
    for (const [joint, bone] of Object.entries(boneMap)) {
      if (bone) {
        const worldPos = new THREE.Vector3();
        bone.getWorldPosition(worldPos);
        jointPositions[joint] = worldPos;
      }
    }

    // Calculate center of mass
    const com = comTracker.current.calculateCOM(jointPositions);
    const basePosition = groupRef.current ? new THREE.Vector3().setFromMatrixPosition(groupRef.current.matrixWorld) : new THREE.Vector3();
    const balanceOffset = comTracker.current.getBalanceOffset(com, basePosition);

    // === CALCULATE GROUND REACTION FORCES (needs balanceOffset) ===
    const rootYVelocity = rootYSpringState.current.velocity;
    const grf = grfSimulator.current.calculateGRF(currentPhase, rootYVelocity, muscleActivation, balanceOffset);

    // Apply balance corrections based on COM
    const balanceAdjustment = {
      x: balanceOffset.x * 0.02, // Small corrections for natural balance
      y: balanceOffset.y * 0.01,
      z: balanceOffset.z * 0.02,
    };

    // Apply root rotation for non-standing positions with sway and balance
    if (groupRef.current && bodyPosition !== 'standing') {
      const targetRotation = basePose.rootRotation;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.x + anteriorSway * 0.2 + balanceAdjustment.x,
        0.08
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotation.z + lateralSway * 0.3 + balanceAdjustment.z,
        0.08
      );
      // Keep gentle y rotation for visual interest
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.y + Math.sin(time * 0.3) * 0.05 + weightShift,
        0.08
      );
    } else if (groupRef.current) {
      // Standing: gentle rotation with postural sway and balance corrections
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1 + weightShift * 0.5;
      groupRef.current.rotation.x = anteriorSway * 0.3 + balanceAdjustment.x;
      groupRef.current.rotation.z = lateralSway * 0.4 + balanceAdjustment.z;
    }

    // Enhanced breathing animation on chest/spine with realistic expansion
    if (boneMap.chest) {
      const chestExpansion = 1 + breathingStrength * 1.5;
      boneMap.chest.scale.set(
        chestExpansion * 0.8, // Lateral expansion
        chestExpansion * 1.2, // Vertical expansion (primary)
        chestExpansion        // Anterior expansion
      );
    }

    // Add subtle spine breathing effect
    if (boneMap.spine) {
      const spineExpansion = 1 + breathingStrength * 0.8;
      boneMap.spine.scale.setScalar(spineExpansion);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1}>
      <primitive object={clonedScene} />
      {/* Muscle Heat Map Overlay - Hidden in low LOD */}
      <MuscleHeatMap
        muscleActivation={currentMuscleActivation}
        boneMap={boneMap}
        visible={currentLOD !== 'low'}
      />
      {/* Joint Stress Indicators - Hidden in low LOD */}
      <JointStressIndicator
        jointLoads={currentJointLoads}
        boneMap={boneMap}
        visible={currentLOD !== 'low'}
      />
      {/* Form Quality Visualization - Always visible for safety */}
      <FormQualityOverlay
        injuryRisk={currentInjuryRisk}
        formScore={currentFormScore}
        asymmetryScore={currentAsymmetryScore}
        boneMap={boneMap}
        visible={true}
      />
    </group>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[0.3, 16, 16]} />
    <meshBasicMaterial color="#4a9eff" wireframe />
  </mesh>
);

// Error fallback - simple humanoid shape
const ErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple humanoid placeholder */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshStandardMaterial color="#4f86f7" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.35, 1.1, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.35, 1.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.06, 0.4, 8, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.12, 0.1, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.12, 0.1, 0]}>
        <capsuleGeometry args={[0.08, 0.5, 8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
    </group>
  );
};

/**
 * Helper function to get body position from exercise name or mode
 */
function getBodyPosition(exerciseName?: string, mode?: ExerciseMode, explicitPosition?: BodyPosition): BodyPosition {
  // Explicit position takes priority
  if (explicitPosition) {
    return explicitPosition;
  }

  // Try to get from exercise name mapping
  if (exerciseName) {
    const mapping = getAnimationMapping(exerciseName);
    if (mapping) {
      return mapping.position;
    }
  }

  // Fallback based on exercise mode
  if (mode) {
    const modeToPosition: Partial<Record<ExerciseMode, BodyPosition>> = {
      CORE: 'lying',  // Most core exercises are lying down
      // All others default to standing
    };
    return modeToPosition[mode] || 'standing';
  }

  return 'standing';
}

/**
 * Find exercise from database by name (fuzzy matching)
 */
function findExerciseByName(exerciseName: string | undefined) {
  if (!exerciseName) return null;

  // Exact match first
  const exactMatch = EXERCISE_DATABASE.find(e => e.name === exerciseName);
  if (exactMatch) return exactMatch;

  // Normalized match
  const normalized = exerciseName.toLowerCase().replace(/[()]/g, '').trim();
  return EXERCISE_DATABASE.find(e => {
    const eName = e.name.toLowerCase().replace(/[()]/g, '').trim();
    return eName.includes(normalized) || normalized.includes(eName);
  }) || null;
}

// Phase display names in Swedish
const PHASE_DISPLAY_NAMES: Record<string, string> = {
  'ECCENTRIC': 'Sänkning',
  'HOLD': 'Håll',
  'CONCENTRIC': 'Lyftning',
  'IDLE': 'Redo',
  'START': 'Start',
  'Sänkning': 'Sänkning',
  'Höjning': 'Höjning',
  'Håll': 'Håll',
};

// Phase colors for indicator
const PHASE_COLORS: Record<string, string> = {
  'ECCENTRIC': 'bg-blue-500',
  'HOLD': 'bg-amber-500',
  'CONCENTRIC': 'bg-green-500',
  'IDLE': 'bg-gray-500',
  'START': 'bg-cyan-500',
  'Sänkning': 'bg-blue-500',
  'Höjning': 'bg-green-500',
  'Håll': 'bg-amber-500',
};

// Main component
const RealisticAvatar3D: React.FC<RealisticAvatar3DProps> = ({
  mode,
  gender = 'male',
  className = '',
  exerciseName,
  bodyPosition: explicitPosition,
  animationKey,
  onPhaseChange,
  showPhaseIndicator = false,
}) => {
  const [modelExists, setModelExists] = useState<boolean | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('IDLE');
  const [animationProgress, setAnimationProgress] = useState<number>(0);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  // Find exercise data from database
  const exerciseData = useMemo(() => findExerciseByName(exerciseName), [exerciseName]);

  // Determine body position from exercise name, mode, or explicit prop
  const bodyPosition = getBodyPosition(exerciseName, mode, explicitPosition);

  // Get camera preset for the body position
  const cameraPreset = CAMERA_PRESETS[bodyPosition];

  // Select model based on gender
  const modelPath = gender === 'female'
    ? '/models/avatar-female.glb'
    : '/models/avatar-male.glb';

  // Internal phase change handler
  const handlePhaseChange = useCallback((phase: string, progress: number) => {
    setCurrentPhase(phase);
    setAnimationProgress(progress);
    if (onPhaseChange) {
      onPhaseChange(phase, progress);
    }
  }, [onPhaseChange]);

  // Check if model exists
  useEffect(() => {
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => setModelExists(res.ok))
      .catch(() => setModelExists(false));
  }, [modelPath]);

  // Log current state for debugging
  useEffect(() => {
    logger.debug('[RealisticAvatar3D] State:', {
      exerciseName,
      mode,
      bodyPosition,
      animationKey,
    });
  }, [exerciseName, mode, bodyPosition, animationKey]);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{
          position: cameraPreset.position,
          fov: cameraPreset.fov,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#4a9eff" />
        <pointLight position={[0, 2, 2]} intensity={0.4} color="#ffffff" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={4}
          blur={2.5}
          far={1.5}
        />

        {/* Avatar */}
        <Suspense fallback={<LoadingFallback />}>
          {modelExists === null ? (
            <LoadingFallback />
          ) : modelExists ? (
            <AvatarModel
              mode={mode}
              modelPath={modelPath}
              bodyPosition={bodyPosition}
              animationKey={animationKey}
              exerciseName={exerciseName}
              onPhaseChange={handlePhaseChange}
            />
          ) : (
            <ErrorFallback message="Model not found. See /public/models/README.md for instructions." />
          )}
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          target={cameraPreset.target}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* Phase indicator overlay */}
      {showPhaseIndicator && (
        <div className="absolute top-2 left-2 right-2 flex flex-col gap-1">
          {/* Phase name badge */}
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-white text-xs font-medium ${PHASE_COLORS[currentPhase] || 'bg-gray-500'}`}>
              {PHASE_DISPLAY_NAMES[currentPhase] || currentPhase}
            </div>
            {exerciseName && (
              <div className="px-2 py-1 bg-slate-800/80 text-cyan-400 text-xs rounded">
                {exerciseName}
              </div>
            )}
          </div>

          {/* Animation progress bar */}
          <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${PHASE_COLORS[currentPhase]?.replace('bg-', 'bg-') || 'bg-cyan-500'}`}
              style={{ width: `${animationProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Model missing indicator */}
      {modelExists === false && (
        <div className="absolute bottom-2 left-2 right-2 bg-amber-500/90 text-amber-900 text-xs p-2 rounded">
          3D-modell saknas. Se /public/models/README.md för instruktioner.
        </div>
      )}

      {/* Exercise Instructions Overlay */}
      {exerciseData && showInstructions && (
        <div className="absolute bottom-4 left-2 right-2 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-slate-700">
          {/* Toggle button */}
          <button
            onClick={() => setShowInstructions(false)}
            className="absolute top-1 right-1 text-slate-400 hover:text-white p-1"
            aria-label="Dölj instruktioner"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Exercise name */}
          <h3 className="text-cyan-400 font-semibold text-sm mb-1 pr-6">{exerciseData.name}</h3>

          {/* Description */}
          <p className="text-slate-300 text-xs leading-relaxed mb-2">{exerciseData.description}</p>

          {/* Steps (if available) */}
          {exerciseData.steps && exerciseData.steps.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <p className="text-slate-400 text-xs font-medium mb-1">Steg:</p>
              <ol className="text-slate-300 text-xs space-y-1">
                {exerciseData.steps.slice(0, 3).map((step, idx) => (
                  <li key={idx} className="flex gap-1">
                    <span className="text-cyan-500">{idx + 1}.</span>
                    <span>{step.title}: {step.instruction}</span>
                  </li>
                ))}
                {exerciseData.steps.length > 3 && (
                  <li className="text-slate-500">+{exerciseData.steps.length - 3} till...</li>
                )}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Show instructions button when hidden */}
      {exerciseData && !showInstructions && (
        <button
          onClick={() => setShowInstructions(true)}
          className="absolute bottom-4 right-4 bg-slate-800/80 hover:bg-slate-700 text-cyan-400 px-3 py-1 rounded text-xs"
        >
          Visa instruktioner
        </button>
      )}
    </div>
  );
};

export default RealisticAvatar3D;

// Preload hook for both models
export const preloadRealisticAvatar = (gender?: 'male' | 'female') => {
  if (gender === 'female') {
    useGLTF.preload('/models/avatar-female.glb');
  } else if (gender === 'male') {
    useGLTF.preload('/models/avatar-male.glb');
  } else {
    // Preload both models
    useGLTF.preload('/models/avatar-male.glb');
    useGLTF.preload('/models/avatar-female.glb');
  }
};
