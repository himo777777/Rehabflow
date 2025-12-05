/**
 * useAvatarModel Hook
 * Handles loading and managing 3D avatar models for React Three Fiber
 */

import { useMemo, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { createBoneMap, validateSkeleton, BoneMap, listAllBones } from '../utils/boneMapping';
import { logger } from '../utils/logger';

export interface AvatarModelState {
  scene: THREE.Group | null;
  skeleton: THREE.Skeleton | null;
  boneMap: BoneMap;
  isLoaded: boolean;
  isValid: boolean;
  error: string | null;
  missingBones: string[];
  allBoneNames: string[];
}

// Default model path
const DEFAULT_MODEL_PATH = '/models/avatar.glb';

/**
 * Hook to load and manage a 3D avatar model
 */
export function useAvatarModel(modelPath: string = DEFAULT_MODEL_PATH): AvatarModelState {
  const [state, setState] = useState<AvatarModelState>({
    scene: null,
    skeleton: null,
    boneMap: {},
    isLoaded: false,
    isValid: false,
    error: null,
    missingBones: [],
    allBoneNames: [],
  });

  // Try to load the model
  let gltfData: { scene: THREE.Group } | null = null;
  let loadError: Error | null = null;

  try {
    // This will throw if the model doesn't exist
    gltfData = useGLTF(modelPath);
  } catch (err) {
    loadError = err as Error;
  }

  // Process the loaded model
  const processedData = useMemo(() => {
    if (!gltfData?.scene) {
      return null;
    }

    try {
      // Clone the scene for safe manipulation
      const clonedScene = SkeletonUtils.clone(gltfData.scene) as THREE.Group;

      // Find the skeleton
      let skeleton: THREE.Skeleton | null = null;
      clonedScene.traverse((child) => {
        if ((child as THREE.SkinnedMesh).isSkinnedMesh && !skeleton) {
          skeleton = (child as THREE.SkinnedMesh).skeleton;
        }
      });

      if (!skeleton) {
        return {
          scene: clonedScene,
          skeleton: null,
          boneMap: {},
          allBoneNames: [],
          validation: { valid: false, missingBones: ['No skeleton found'], foundBones: [] },
        };
      }

      // Create bone map and validate
      const boneMap = createBoneMap(skeleton);
      const validation = validateSkeleton(skeleton);
      const allBoneNames = listAllBones(skeleton);

      return {
        scene: clonedScene,
        skeleton,
        boneMap,
        allBoneNames,
        validation,
      };
    } catch (err) {
      console.error('[useAvatarModel] Error processing model:', err);
      return null;
    }
  }, [gltfData?.scene]);

  // Update state when processed data changes
  useEffect(() => {
    if (loadError) {
      setState({
        scene: null,
        skeleton: null,
        boneMap: {},
        isLoaded: false,
        isValid: false,
        error: `Failed to load model: ${loadError.message}`,
        missingBones: [],
        allBoneNames: [],
      });
      return;
    }

    if (processedData) {
      setState({
        scene: processedData.scene,
        skeleton: processedData.skeleton,
        boneMap: processedData.boneMap,
        isLoaded: true,
        isValid: processedData.validation.valid,
        error: processedData.validation.valid ? null : 'Model missing required bones',
        missingBones: processedData.validation.missingBones,
        allBoneNames: processedData.allBoneNames,
      });

      // Log for debugging
      logger.debug('[useAvatarModel] Model loaded:', {
        valid: processedData.validation.valid,
        foundBones: processedData.validation.foundBones,
        missingBones: processedData.validation.missingBones,
        allBones: processedData.allBoneNames,
      });
    }
  }, [processedData, loadError]);

  return state;
}

/**
 * Preload the avatar model
 */
export function preloadAvatarModel(modelPath: string = DEFAULT_MODEL_PATH): void {
  useGLTF.preload(modelPath);
}

/**
 * Check if model file exists (for conditional rendering)
 */
export async function checkModelExists(modelPath: string = DEFAULT_MODEL_PATH): Promise<boolean> {
  try {
    const response = await fetch(modelPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
