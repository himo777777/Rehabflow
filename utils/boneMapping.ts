/**
 * Bone Mapping Utility
 * Maps system joint names to various 3D model bone naming conventions
 */

import * as THREE from 'three';

// System joint names used in the animation system
export type SystemJointName =
  | 'root'
  | 'hips'
  | 'spine'
  | 'chest'
  | 'neck'
  | 'head'
  | 'leftShoulder'
  | 'leftUpperArm'
  | 'leftLowerArm'
  | 'leftHand'
  | 'rightShoulder'
  | 'rightUpperArm'
  | 'rightLowerArm'
  | 'rightHand'
  | 'leftUpperLeg'
  | 'leftLowerLeg'
  | 'leftFoot'
  | 'rightUpperLeg'
  | 'rightLowerLeg'
  | 'rightFoot';

// Mapping from system names to possible bone names in different rigs
export const BONE_NAME_MAP: Record<SystemJointName, string[]> = {
  root: ['Root', 'root', 'Armature'],
  hips: ['Hips', 'mixamorigHips', 'pelvis', 'Pelvis', 'hip', 'Hip'],
  spine: ['Spine', 'mixamorigSpine', 'Spine1', 'spine', 'spine_01'],
  chest: ['Spine2', 'mixamorigSpine2', 'Chest', 'chest', 'spine_02', 'Spine1'],
  neck: ['Neck', 'mixamorigNeck', 'neck', 'neck_01'],
  head: ['Head', 'mixamorigHead', 'head', 'head_01'],

  // Left arm
  leftShoulder: ['LeftShoulder', 'mixamorigLeftShoulder', 'shoulder_l', 'l_shoulder', 'clavicle_l'],
  leftUpperArm: ['LeftArm', 'mixamorigLeftArm', 'upperarm_l', 'l_upperarm', 'arm_l'],
  leftLowerArm: ['LeftForeArm', 'mixamorigLeftForeArm', 'lowerarm_l', 'l_lowerarm', 'forearm_l'],
  leftHand: ['LeftHand', 'mixamorigLeftHand', 'hand_l', 'l_hand', 'wrist_l'],

  // Right arm
  rightShoulder: ['RightShoulder', 'mixamorigRightShoulder', 'shoulder_r', 'r_shoulder', 'clavicle_r'],
  rightUpperArm: ['RightArm', 'mixamorigRightArm', 'upperarm_r', 'r_upperarm', 'arm_r'],
  rightLowerArm: ['RightForeArm', 'mixamorigRightForeArm', 'lowerarm_r', 'r_lowerarm', 'forearm_r'],
  rightHand: ['RightHand', 'mixamorigRightHand', 'hand_r', 'r_hand', 'wrist_r'],

  // Left leg
  leftUpperLeg: ['LeftUpLeg', 'mixamorigLeftUpLeg', 'thigh_l', 'l_thigh', 'upperleg_l'],
  leftLowerLeg: ['LeftLeg', 'mixamorigLeftLeg', 'calf_l', 'l_calf', 'lowerleg_l', 'shin_l'],
  leftFoot: ['LeftFoot', 'mixamorigLeftFoot', 'foot_l', 'l_foot', 'ankle_l'],

  // Right leg
  rightUpperLeg: ['RightUpLeg', 'mixamorigRightUpLeg', 'thigh_r', 'r_thigh', 'upperleg_r'],
  rightLowerLeg: ['RightLeg', 'mixamorigRightLeg', 'calf_r', 'r_calf', 'lowerleg_r', 'shin_r'],
  rightFoot: ['RightFoot', 'mixamorigRightFoot', 'foot_r', 'r_foot', 'ankle_r'],
};

export interface BoneMap {
  [key: string]: THREE.Bone | null;
}

/**
 * Find a bone by trying multiple possible names
 */
export function findBone(skeleton: THREE.Skeleton, possibleNames: string[]): THREE.Bone | null {
  for (const name of possibleNames) {
    const bone = skeleton.getBoneByName(name);
    if (bone) return bone;
  }
  return null;
}

/**
 * Create a complete bone map from a skeleton
 */
export function createBoneMap(skeleton: THREE.Skeleton): BoneMap {
  const boneMap: BoneMap = {};

  for (const [systemName, possibleNames] of Object.entries(BONE_NAME_MAP)) {
    boneMap[systemName] = findBone(skeleton, possibleNames);
  }

  return boneMap;
}

/**
 * Get all available bones in a skeleton for debugging
 */
export function listAllBones(skeleton: THREE.Skeleton): string[] {
  return skeleton.bones.map(bone => bone.name);
}

/**
 * Check if a skeleton has the minimum required bones for animation
 */
export function validateSkeleton(skeleton: THREE.Skeleton): {
  valid: boolean;
  missingBones: string[];
  foundBones: string[];
} {
  const requiredJoints: SystemJointName[] = [
    'hips', 'spine', 'head',
    'leftUpperArm', 'leftLowerArm',
    'rightUpperArm', 'rightLowerArm',
    'leftUpperLeg', 'leftLowerLeg',
    'rightUpperLeg', 'rightLowerLeg',
  ];

  const missingBones: string[] = [];
  const foundBones: string[] = [];

  for (const joint of requiredJoints) {
    const bone = findBone(skeleton, BONE_NAME_MAP[joint]);
    if (bone) {
      foundBones.push(joint);
    } else {
      missingBones.push(joint);
    }
  }

  return {
    valid: missingBones.length === 0,
    missingBones,
    foundBones,
  };
}

/**
 * Apply rotation to a bone with interpolation
 */
export function applyBoneRotation(
  bone: THREE.Bone | null,
  rotation: { x: number; y: number; z: number },
  lerp: number = 0.1
): void {
  if (!bone) return;

  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, rotation.x, lerp);
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, rotation.y, lerp);
  bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, rotation.z, lerp);
}

/**
 * Apply a complete pose to a bone map
 */
export function applyPose(
  boneMap: BoneMap,
  pose: Record<string, { x: number; y: number; z: number }>,
  lerp: number = 0.1
): void {
  for (const [jointName, rotation] of Object.entries(pose)) {
    const bone = boneMap[jointName];
    if (bone) {
      applyBoneRotation(bone, rotation, lerp);
    }
  }
}
