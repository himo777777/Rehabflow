/**
 * Mobile Optimizations Hook - Sprint 5.4
 *
 * Provides device capability detection and optimized settings for mobile devices.
 * Automatically adjusts LOD levels, disables expensive features on low-end devices.
 *
 * Features:
 * - Device capability detection (mobile, tablet, desktop)
 * - GPU performance estimation
 * - Memory-aware settings
 * - Automatic LOD selection
 * - Battery-aware optimizations
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { LODLevel } from '../components/SkeletalAvatar';

// ============================================================================
// TYPES
// ============================================================================

export interface DeviceCapabilities {
  /** Device type based on screen size and touch */
  deviceType: 'mobile' | 'tablet' | 'desktop';
  /** Whether device is touch-capable */
  isTouch: boolean;
  /** Screen width in pixels */
  screenWidth: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Estimated GPU tier (1=low, 2=medium, 3=high) */
  gpuTier: 1 | 2 | 3;
  /** Available memory in MB (if available) */
  memoryMB: number | null;
  /** Whether battery saver should be suggested */
  lowBattery: boolean;
  /** Whether reduce motion is preferred */
  prefersReducedMotion: boolean;
  /** Connection type if available */
  connectionType: 'slow' | 'medium' | 'fast' | 'unknown';
  /** Number of CPU cores */
  cpuCores: number;
}

export interface OptimizedSettings {
  /** LOD level for avatar rendering */
  lodLevel: LODLevel;
  /** Whether to enable muscle deformation */
  enableMuscleDeformation: boolean;
  /** Whether to enable foot IK */
  enableFootIK: boolean;
  /** Whether to enable body sway */
  enableSway: boolean;
  /** Whether to enable haptic feedback */
  enableHaptics: boolean;
  /** Max FPS target */
  targetFPS: number;
  /** Whether to enable visual cues */
  enableVisualCues: boolean;
  /** Shadow quality */
  shadowQuality: 'none' | 'low' | 'high';
  /** Antialiasing */
  enableAntialias: boolean;
  /** Animation update frequency */
  animationUpdateRate: 'every-frame' | 'every-other' | 'throttled';
}

// ============================================================================
// DETECTION UTILITIES
// ============================================================================

/**
 * Detect device type based on screen size and touch capability
 */
function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (width < 768) return 'mobile';
  if (width < 1024 && isTouch) return 'tablet';
  return 'desktop';
}

/**
 * Estimate GPU tier based on various signals
 */
function estimateGPUTier(): 1 | 2 | 3 {
  // Try to get WebGL renderer info
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        // Check for known high-end GPUs
        if (/nvidia|geforce|rtx|gtx/i.test(renderer)) return 3;
        if (/radeon|rx\s?\d{4}/i.test(renderer)) return 3;
        if (/apple.*m[123]/i.test(renderer)) return 3;

        // Check for known low-end GPUs
        if (/mali|adreno\s?[234]\d{2}|powervr/i.test(renderer)) return 1;
        if (/intel.*hd/i.test(renderer)) return 2;
      }

      // Fallback: check max texture size
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      if (maxTextureSize >= 16384) return 3;
      if (maxTextureSize >= 8192) return 2;
      return 1;
    }
  } catch {
    // WebGL not available
  }

  // Default based on device type
  const deviceType = detectDeviceType();
  if (deviceType === 'mobile') return 1;
  if (deviceType === 'tablet') return 2;
  return 3;
}

/**
 * Get available memory if supported
 */
function getAvailableMemory(): number | null {
  if ('deviceMemory' in navigator) {
    return (navigator as unknown as { deviceMemory: number }).deviceMemory * 1024; // Convert GB to MB
  }
  return null;
}

/**
 * Check battery status
 */
async function checkBattery(): Promise<boolean> {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean }> }).getBattery();
      return battery.level < 0.2 && !battery.charging;
    }
  } catch {
    // Battery API not available
  }
  return false;
}

/**
 * Check connection type
 */
function getConnectionType(): 'slow' | 'medium' | 'fast' | 'unknown' {
  // @ts-expect-error - Network Information API not in standard types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    if (effectiveType === '4g') return 'fast';
  }

  return 'unknown';
}

/**
 * Check reduced motion preference
 */
function getPrefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for mobile optimizations with automatic device detection
 *
 * @example
 * ```tsx
 * function Avatar3D() {
 *   const { settings, capabilities, forceQuality } = useMobileOptimizations();
 *
 *   return (
 *     <SkeletalAvatar
 *       lodLevel={settings.lodLevel}
 *       enableMuscleDeformation={settings.enableMuscleDeformation}
 *       enableFootIK={settings.enableFootIK}
 *       enableSway={settings.enableSway}
 *     />
 *   );
 * }
 * ```
 */
export function useMobileOptimizations() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => ({
    deviceType: 'desktop',
    isTouch: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    gpuTier: 3,
    memoryMB: null,
    lowBattery: false,
    prefersReducedMotion: false,
    connectionType: 'unknown',
    cpuCores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
  }));

  const [forcedQuality, setForcedQuality] = useState<'auto' | 'low' | 'medium' | 'high'>('auto');

  // Detect capabilities on mount
  useEffect(() => {
    async function detectCapabilities() {
      const lowBattery = await checkBattery();

      setCapabilities({
        deviceType: detectDeviceType(),
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        gpuTier: estimateGPUTier(),
        memoryMB: getAvailableMemory(),
        lowBattery,
        prefersReducedMotion: getPrefersReducedMotion(),
        connectionType: getConnectionType(),
        cpuCores: navigator.hardwareConcurrency || 4,
      });
    }

    detectCapabilities();

    // Listen for changes
    const handleResize = () => {
      setCapabilities((prev) => ({
        ...prev,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        deviceType: detectDeviceType(),
      }));
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setCapabilities((prev) => ({
        ...prev,
        prefersReducedMotion: e.matches,
      }));
    };

    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Calculate optimized settings based on capabilities
  const settings = useMemo<OptimizedSettings>(() => {
    // Use forced quality if set
    if (forcedQuality !== 'auto') {
      if (forcedQuality === 'low') {
        return {
          lodLevel: 'low',
          enableMuscleDeformation: false,
          enableFootIK: false,
          enableSway: false,
          enableHaptics: true,
          targetFPS: 30,
          enableVisualCues: true,
          shadowQuality: 'none',
          enableAntialias: false,
          animationUpdateRate: 'throttled',
        };
      }
      if (forcedQuality === 'medium') {
        return {
          lodLevel: 'medium',
          enableMuscleDeformation: true,
          enableFootIK: false,
          enableSway: true,
          enableHaptics: true,
          targetFPS: 45,
          enableVisualCues: true,
          shadowQuality: 'low',
          enableAntialias: false,
          animationUpdateRate: 'every-other',
        };
      }
      // high
      return {
        lodLevel: 'high',
        enableMuscleDeformation: true,
        enableFootIK: true,
        enableSway: true,
        enableHaptics: true,
        targetFPS: 60,
        enableVisualCues: true,
        shadowQuality: 'high',
        enableAntialias: true,
        animationUpdateRate: 'every-frame',
      };
    }

    // Auto-detect based on capabilities
    const { deviceType, gpuTier, lowBattery, prefersReducedMotion, memoryMB, cpuCores } = capabilities;

    // Calculate a "power score" 0-10
    let powerScore = gpuTier * 2; // 2-6
    if (memoryMB && memoryMB >= 4096) powerScore += 2;
    if (cpuCores >= 8) powerScore += 2;
    if (deviceType === 'desktop') powerScore += 1;

    // Reduce for constraints
    if (lowBattery) powerScore -= 3;
    if (prefersReducedMotion) powerScore -= 2;
    if (deviceType === 'mobile') powerScore -= 2;

    powerScore = Math.max(1, Math.min(10, powerScore));

    // Low power (1-3)
    if (powerScore <= 3) {
      return {
        lodLevel: 'low',
        enableMuscleDeformation: false,
        enableFootIK: false,
        enableSway: !prefersReducedMotion,
        enableHaptics: deviceType !== 'desktop',
        targetFPS: 30,
        enableVisualCues: true,
        shadowQuality: 'none',
        enableAntialias: false,
        animationUpdateRate: 'throttled',
      };
    }

    // Medium power (4-6)
    if (powerScore <= 6) {
      return {
        lodLevel: 'medium',
        enableMuscleDeformation: gpuTier >= 2,
        enableFootIK: false,
        enableSway: !prefersReducedMotion,
        enableHaptics: deviceType !== 'desktop',
        targetFPS: 45,
        enableVisualCues: true,
        shadowQuality: 'low',
        enableAntialias: gpuTier >= 2,
        animationUpdateRate: 'every-other',
      };
    }

    // High power (7-10)
    return {
      lodLevel: 'high',
      enableMuscleDeformation: true,
      enableFootIK: true,
      enableSway: !prefersReducedMotion,
      enableHaptics: deviceType !== 'desktop',
      targetFPS: 60,
      enableVisualCues: true,
      shadowQuality: 'high',
      enableAntialias: true,
      animationUpdateRate: 'every-frame',
    };
  }, [capabilities, forcedQuality]);

  // Force a specific quality level
  const forceQuality = useCallback((quality: 'auto' | 'low' | 'medium' | 'high') => {
    setForcedQuality(quality);
  }, []);

  // Check if device is considered "low-end"
  const isLowEnd = useMemo(() => {
    return capabilities.gpuTier === 1 ||
           capabilities.deviceType === 'mobile' ||
           capabilities.lowBattery ||
           (capabilities.memoryMB !== null && capabilities.memoryMB < 2048);
  }, [capabilities]);

  // Check if device is mobile
  const isMobile = capabilities.deviceType === 'mobile';

  // Check if device is tablet
  const isTablet = capabilities.deviceType === 'tablet';

  return {
    capabilities,
    settings,
    forceQuality,
    forcedQuality,
    isLowEnd,
    isMobile,
    isTablet,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Simple hook to check if device is mobile
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to get optimal LOD level based on device
 */
export function useOptimalLOD(): LODLevel {
  const { settings } = useMobileOptimizations();
  return settings.lodLevel;
}

/**
 * Hook to check if feature should be disabled on current device
 */
export function useShouldDisableFeature(feature: keyof OptimizedSettings): boolean {
  const { settings } = useMobileOptimizations();
  const value = settings[feature];
  return value === false || value === 'none' || value === 'throttled';
}

export default useMobileOptimizations;
