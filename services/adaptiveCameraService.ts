/**
 * Adaptive Camera Service
 *
 * Del av FAS 8: Kamera & 3D Avatar Förbättringar
 *
 * Detekterar enhetens kapacitet och anpassar:
 * - Kameraupplösning
 * - Frame rate
 * - MediaPipe modelComplexity
 *
 * Detta förbättrar prestanda på mobila enheter och äldre datorer.
 */

export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceCapability {
  tier: DeviceTier;
  resolution: { width: number; height: number };
  targetFPS: number;
  modelComplexity: 0 | 1 | 2;
  enableEnsemble: boolean; // Om dual-model ska användas
  smoothingFactor: number; // Temporal smoothing
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/**
 * Detekterar enhetens kapacitet baserat på hårdvara
 */
export function detectDeviceCapability(): DeviceCapability {
  const nav = navigator as NavigatorWithMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowEndMobile = isMobile && (cores <= 4 || memory <= 3);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);

  // Lågpresterande enheter (mobiler, äldre datorer)
  if (isLowEndMobile || cores <= 2 || memory <= 2) {
    return {
      tier: 'low',
      resolution: { width: 640, height: 480 },
      targetFPS: 15,
      modelComplexity: 0, // Snabbaste modellen
      enableEnsemble: false, // Endast MediaPipe
      smoothingFactor: 0.5
    };
  }

  // Medelpresterande enheter (nyare mobiler, tablets, basic laptops)
  if (isMobile || isTablet || cores <= 4 || memory <= 4) {
    return {
      tier: 'medium',
      resolution: { width: 960, height: 720 },
      targetFPS: 20,
      modelComplexity: 1,
      enableEnsemble: false, // Spara CPU
      smoothingFactor: 0.6
    };
  }

  // Högpresterande enheter (stationära, gaming laptops)
  return {
    tier: 'high',
    resolution: { width: 1280, height: 720 },
    targetFPS: 30,
    modelComplexity: 2, // Mest exakt
    enableEnsemble: true, // Använd dual-model
    smoothingFactor: 0.7
  };
}

/**
 * Hämtar optimala MediaPipe-inställningar för enheten
 */
export function getMediaPipeConfig(capability: DeviceCapability) {
  return {
    modelComplexity: capability.modelComplexity,
    smoothLandmarks: true,
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: capability.tier === 'low' ? 0.6 : 0.7,
    minTrackingConfidence: capability.tier === 'low' ? 0.6 : 0.7,
  };
}

/**
 * Hämtar optimala kamerainställningar för enheten
 */
export function getCameraConstraints(capability: DeviceCapability): MediaStreamConstraints {
  return {
    video: {
      width: { ideal: capability.resolution.width },
      height: { ideal: capability.resolution.height },
      facingMode: 'user',
      frameRate: { ideal: capability.targetFPS, max: 30 }
    },
    audio: false
  };
}

/**
 * Beräknar prestanda-metrics för övervakning
 */
export interface PerformanceMetrics {
  averageFPS: number;
  averageLatency: number;
  droppedFrames: number;
  cpuPressure: 'nominal' | 'fair' | 'serious' | 'critical';
}

export class PerformanceMonitor {
  private frameTimestamps: number[] = [];
  private latencies: number[] = [];
  private droppedFrames = 0;
  private readonly maxSamples = 30;

  recordFrame(processingTime: number): void {
    const now = performance.now();
    this.frameTimestamps.push(now);
    this.latencies.push(processingTime);

    // Behåll endast senaste samples
    if (this.frameTimestamps.length > this.maxSamples) {
      this.frameTimestamps.shift();
      this.latencies.shift();
    }
  }

  recordDroppedFrame(): void {
    this.droppedFrames++;
  }

  getMetrics(): PerformanceMetrics {
    if (this.frameTimestamps.length < 2) {
      return {
        averageFPS: 0,
        averageLatency: 0,
        droppedFrames: this.droppedFrames,
        cpuPressure: 'nominal'
      };
    }

    // Beräkna genomsnittlig FPS
    const timeSpan = this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0];
    const averageFPS = (this.frameTimestamps.length - 1) / (timeSpan / 1000);

    // Beräkna genomsnittlig latency
    const averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;

    // Bedöm CPU-press
    let cpuPressure: PerformanceMetrics['cpuPressure'] = 'nominal';
    if (averageFPS < 10) cpuPressure = 'critical';
    else if (averageFPS < 15) cpuPressure = 'serious';
    else if (averageFPS < 20) cpuPressure = 'fair';

    return {
      averageFPS,
      averageLatency,
      droppedFrames: this.droppedFrames,
      cpuPressure
    };
  }

  reset(): void {
    this.frameTimestamps = [];
    this.latencies = [];
    this.droppedFrames = 0;
  }
}

/**
 * Singleton för global tillgång till enhetens kapacitet
 */
let cachedCapability: DeviceCapability | null = null;

export function getDeviceCapability(): DeviceCapability {
  if (!cachedCapability) {
    cachedCapability = detectDeviceCapability();
    console.log(`[AdaptiveCamera] Detected device tier: ${cachedCapability.tier}`, {
      resolution: cachedCapability.resolution,
      targetFPS: cachedCapability.targetFPS,
      modelComplexity: cachedCapability.modelComplexity
    });
  }
  return cachedCapability;
}

/**
 * Tvinga omdetektering (t.ex. efter ändring i inställningar)
 */
export function resetDeviceCapability(): void {
  cachedCapability = null;
}
