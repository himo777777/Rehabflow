/**
 * VRService - Sprint 5.23
 *
 * Virtual Reality-service för RehabFlow med:
 * - WebXR-integration
 * - VR-scenhantering
 * - Controller-input
 * - Haptic feedback
 * - Rumslig audio
 * - Teleportation & rörelse
 * - Hand tracking
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
export type XRReferenceSpaceType = 'local' | 'local-floor' | 'bounded-floor' | 'unbounded' | 'viewer';
export type HandednessType = 'left' | 'right' | 'none';

export interface VRSessionConfig {
  mode: XRSessionMode;
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: HTMLElement;
}

export interface VRControllerState {
  handedness: HandednessType;
  position: Vector3;
  rotation: Quaternion;
  grip: GripState;
  buttons: ButtonState[];
  axes: number[];
  connected: boolean;
}

export interface GripState {
  position: Vector3;
  rotation: Quaternion;
}

export interface ButtonState {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface VREnvironment {
  id: string;
  name: string;
  skybox?: string;
  floor?: FloorConfig;
  lighting?: LightingConfig;
  objects?: VRObject[];
}

export interface FloorConfig {
  size: Vector3;
  texture?: string;
  color?: string;
  grid?: boolean;
}

export interface LightingConfig {
  ambient: { color: string; intensity: number };
  directional?: { color: string; intensity: number; position: Vector3 };
  point?: { color: string; intensity: number; position: Vector3; distance: number }[];
}

export interface VRObject {
  id: string;
  type: 'primitive' | 'model' | 'ui';
  geometry?: PrimitiveGeometry;
  modelUrl?: string;
  position: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  material?: MaterialConfig;
  interactive?: boolean;
  physics?: PhysicsConfig;
}

export type PrimitiveGeometry =
  | { type: 'box'; width: number; height: number; depth: number }
  | { type: 'sphere'; radius: number }
  | { type: 'cylinder'; radiusTop: number; radiusBottom: number; height: number }
  | { type: 'plane'; width: number; height: number };

export interface MaterialConfig {
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  transparent?: boolean;
  opacity?: number;
  texture?: string;
}

export interface PhysicsConfig {
  type: 'static' | 'dynamic' | 'kinematic';
  mass?: number;
  friction?: number;
  restitution?: number;
  collider?: 'box' | 'sphere' | 'mesh';
}

export interface TeleportConfig {
  enabled: boolean;
  maxDistance?: number;
  validSurfaces?: string[];
  curvePoints?: number;
  landingIndicator?: boolean;
}

export interface HandTrackingState {
  handedness: HandednessType;
  joints: Map<string, JointPose>;
  pinchStrength: number;
  grabStrength: number;
}

export interface JointPose {
  position: Vector3;
  rotation: Quaternion;
  radius: number;
}

export interface HapticFeedback {
  intensity: number;
  duration: number;
}

export interface SpatialAudioConfig {
  position: Vector3;
  rolloff?: 'linear' | 'inverse' | 'exponential';
  refDistance?: number;
  maxDistance?: number;
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterGain?: number;
}

// ============================================================================
// VR SERVICE
// ============================================================================

class VRService {
  private static instance: VRService;

  private xrSession: XRSession | null = null;
  private xrReferenceSpace: XRReferenceSpace | null = null;
  private xrFrame: XRFrame | null = null;
  private controllers: Map<string, VRControllerState> = new Map();
  private handTracking: Map<HandednessType, HandTrackingState> = new Map();
  private environment: VREnvironment | null = null;
  private objects: Map<string, VRObject> = new Map();
  private audioContext: AudioContext | null = null;
  private audioSources: Map<string, AudioBufferSourceNode> = new Map();
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private teleportConfig: TeleportConfig = { enabled: false };
  private isPresenting: boolean = false;

  private constructor() {}

  public static getInstance(): VRService {
    if (!VRService.instance) {
      VRService.instance = new VRService();
    }
    return VRService.instance;
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Kontrollera VR-stöd
   */
  public async isSupported(mode: XRSessionMode = 'immersive-vr'): Promise<boolean> {
    if (!('xr' in navigator)) return false;

    try {
      return await navigator.xr!.isSessionSupported(mode);
    } catch {
      return false;
    }
  }

  /**
   * Starta VR-session
   */
  public async startSession(config: VRSessionConfig): Promise<boolean> {
    if (!('xr' in navigator)) {
      console.error('WebXR stöds inte i denna webbläsare');
      return false;
    }

    try {
      const sessionInit: XRSessionInit = {
        requiredFeatures: config.requiredFeatures || ['local-floor'],
        optionalFeatures: config.optionalFeatures || ['hand-tracking', 'bounded-floor']
      };

      if (config.domOverlay) {
        sessionInit.optionalFeatures?.push('dom-overlay');
        (sessionInit as XRSessionInit & { domOverlay?: { root: HTMLElement } }).domOverlay = { root: config.domOverlay };
      }

      this.xrSession = await navigator.xr!.requestSession(config.mode, sessionInit);

      this.xrSession.addEventListener('end', this.handleSessionEnd);
      this.xrSession.addEventListener('inputsourceschange', this.handleInputSourcesChange);

      // Skapa reference space
      this.xrReferenceSpace = await this.xrSession.requestReferenceSpace('local-floor');

      this.isPresenting = true;

      // Initiera audio
      this.initAudio();

      this.emit('sessionstart', { session: this.xrSession });

      console.log('VR-session startad');
      return true;
    } catch (error) {
      console.error('Kunde inte starta VR-session:', error);
      return false;
    }
  }

  /**
   * Avsluta VR-session
   */
  public async endSession(): Promise<void> {
    if (this.xrSession) {
      await this.xrSession.end();
      this.xrSession = null;
      this.xrReferenceSpace = null;
      this.isPresenting = false;
    }
  }

  /**
   * Kontrollera om session är aktiv
   */
  public isSessionActive(): boolean {
    return this.xrSession !== null && this.isPresenting;
  }

  private handleSessionEnd = (): void => {
    this.isPresenting = false;
    this.xrSession = null;
    this.xrReferenceSpace = null;
    this.emit('sessionend', {});
    console.log('VR-session avslutad');
  };

  private handleInputSourcesChange = (event: XRInputSourceChangeEvent): void => {
    // Hantera nya controllers
    event.added.forEach(inputSource => {
      const handedness = inputSource.handedness;
      this.controllers.set(handedness, this.createControllerState(inputSource));
      this.emit('controllerconnected', { handedness, inputSource });
    });

    // Hantera borttagna controllers
    event.removed.forEach(inputSource => {
      const handedness = inputSource.handedness;
      this.controllers.delete(handedness);
      this.emit('controllerdisconnected', { handedness });
    });
  };

  private createControllerState(inputSource: XRInputSource): VRControllerState {
    return {
      handedness: inputSource.handedness as HandednessType,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      grip: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 }
      },
      buttons: [],
      axes: [],
      connected: true
    };
  }

  // ============================================================================
  // FRAME LOOP
  // ============================================================================

  /**
   * Begär animation frame
   */
  public requestAnimationFrame(callback: XRFrameRequestCallback): number {
    if (!this.xrSession) return 0;
    return this.xrSession.requestAnimationFrame(callback);
  }

  /**
   * Uppdatera controller-states
   */
  public updateFrame(frame: XRFrame): void {
    this.xrFrame = frame;

    if (!this.xrReferenceSpace) return;

    // Uppdatera controller-positions
    for (const inputSource of frame.session.inputSources) {
      const state = this.controllers.get(inputSource.handedness);
      if (!state) continue;

      // Target ray pose
      const targetPose = frame.getPose(inputSource.targetRaySpace, this.xrReferenceSpace);
      if (targetPose) {
        state.position = this.transformToVector3(targetPose.transform.position);
        state.rotation = this.transformToQuaternion(targetPose.transform.orientation);
      }

      // Grip pose
      if (inputSource.gripSpace) {
        const gripPose = frame.getPose(inputSource.gripSpace, this.xrReferenceSpace);
        if (gripPose) {
          state.grip.position = this.transformToVector3(gripPose.transform.position);
          state.grip.rotation = this.transformToQuaternion(gripPose.transform.orientation);
        }
      }

      // Gamepad state
      if (inputSource.gamepad) {
        state.buttons = inputSource.gamepad.buttons.map(b => ({
          pressed: b.pressed,
          touched: b.touched,
          value: b.value
        }));
        state.axes = Array.from(inputSource.gamepad.axes);
      }

      // Hand tracking
      if (inputSource.hand) {
        this.updateHandTracking(inputSource.hand, inputSource.handedness as HandednessType, frame);
      }
    }

    this.emit('frameupdate', { frame, controllers: this.controllers });
  }

  private updateHandTracking(
    hand: XRHand,
    handedness: HandednessType,
    frame: XRFrame
  ): void {
    if (!this.xrReferenceSpace) return;

    const joints = new Map<string, JointPose>();

    for (const jointSpace of hand.values()) {
      const jointPose = frame.getJointPose?.(jointSpace, this.xrReferenceSpace);
      if (jointPose) {
        joints.set(jointSpace.jointName || 'unknown', {
          position: this.transformToVector3(jointPose.transform.position),
          rotation: this.transformToQuaternion(jointPose.transform.orientation),
          radius: jointPose.radius
        });
      }
    }

    // Beräkna pinch och grab strength
    const thumbTip = joints.get('thumb-tip');
    const indexTip = joints.get('index-finger-tip');
    const pinchStrength = thumbTip && indexTip
      ? Math.max(0, 1 - this.distance(thumbTip.position, indexTip.position) * 20)
      : 0;

    this.handTracking.set(handedness, {
      handedness,
      joints,
      pinchStrength,
      grabStrength: 0 // Kan beräknas mer exakt
    });
  }

  private transformToVector3(pos: DOMPointReadOnly): Vector3 {
    return { x: pos.x, y: pos.y, z: pos.z };
  }

  private transformToQuaternion(rot: DOMPointReadOnly): Quaternion {
    return { x: rot.x, y: rot.y, z: rot.z, w: rot.w };
  }

  private distance(a: Vector3, b: Vector3): number {
    return Math.sqrt(
      Math.pow(b.x - a.x, 2) +
      Math.pow(b.y - a.y, 2) +
      Math.pow(b.z - a.z, 2)
    );
  }

  // ============================================================================
  // CONTROLLER INPUT
  // ============================================================================

  /**
   * Hämta controller-state
   */
  public getController(handedness: HandednessType): VRControllerState | null {
    return this.controllers.get(handedness) || null;
  }

  /**
   * Kontrollera om knapp är nedtryckt
   */
  public isButtonPressed(handedness: HandednessType, buttonIndex: number): boolean {
    const controller = this.controllers.get(handedness);
    return controller?.buttons[buttonIndex]?.pressed ?? false;
  }

  /**
   * Hämta axelvärde
   */
  public getAxisValue(handedness: HandednessType, axisIndex: number): number {
    const controller = this.controllers.get(handedness);
    return controller?.axes[axisIndex] ?? 0;
  }

  /**
   * Vibrera controller
   */
  public async vibrate(
    handedness: HandednessType,
    feedback: HapticFeedback
  ): Promise<void> {
    if (!this.xrSession) return;

    for (const inputSource of this.xrSession.inputSources) {
      if (inputSource.handedness === handedness && inputSource.gamepad?.hapticActuators) {
        const actuator = inputSource.gamepad.hapticActuators[0];
        if (actuator) {
          await actuator.pulse(feedback.intensity, feedback.duration);
        }
      }
    }
  }

  // ============================================================================
  // HAND TRACKING
  // ============================================================================

  /**
   * Hämta hand tracking state
   */
  public getHandTracking(handedness: HandednessType): HandTrackingState | null {
    return this.handTracking.get(handedness) || null;
  }

  /**
   * Kontrollera pinch-gest
   */
  public isPinching(handedness: HandednessType, threshold: number = 0.8): boolean {
    const hand = this.handTracking.get(handedness);
    return (hand?.pinchStrength ?? 0) > threshold;
  }

  /**
   * Kontrollera grab-gest
   */
  public isGrabbing(handedness: HandednessType, threshold: number = 0.8): boolean {
    const hand = this.handTracking.get(handedness);
    return (hand?.grabStrength ?? 0) > threshold;
  }

  // ============================================================================
  // ENVIRONMENT
  // ============================================================================

  /**
   * Ladda VR-miljö
   */
  public loadEnvironment(environment: VREnvironment): void {
    this.environment = environment;

    // Ladda objekt
    environment.objects?.forEach(obj => {
      this.objects.set(obj.id, obj);
    });

    this.emit('environmentloaded', { environment });
  }

  /**
   * Lägg till objekt i scenen
   */
  public addObject(object: VRObject): void {
    this.objects.set(object.id, object);
    this.emit('objectadded', { object });
  }

  /**
   * Ta bort objekt
   */
  public removeObject(objectId: string): void {
    const object = this.objects.get(objectId);
    if (object) {
      this.objects.delete(objectId);
      this.emit('objectremoved', { object });
    }
  }

  /**
   * Uppdatera objekt
   */
  public updateObject(objectId: string, updates: Partial<VRObject>): void {
    const object = this.objects.get(objectId);
    if (object) {
      const updated = { ...object, ...updates };
      this.objects.set(objectId, updated);
      this.emit('objectupdated', { object: updated });
    }
  }

  /**
   * Hämta objekt
   */
  public getObject(objectId: string): VRObject | null {
    return this.objects.get(objectId) || null;
  }

  /**
   * Lista alla objekt
   */
  public getAllObjects(): VRObject[] {
    return Array.from(this.objects.values());
  }

  // ============================================================================
  // TELEPORTATION
  // ============================================================================

  /**
   * Konfigurera teleportation
   */
  public configureTeleport(config: TeleportConfig): void {
    this.teleportConfig = config;
  }

  /**
   * Beräkna teleportationsbana
   */
  public calculateTeleportArc(
    origin: Vector3,
    direction: Vector3,
    numPoints: number = 20
  ): Vector3[] {
    if (!this.teleportConfig.enabled) return [];

    const points: Vector3[] = [];
    const gravity = 9.8;
    const velocity = 5;
    const maxDistance = this.teleportConfig.maxDistance || 10;

    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * 2; // Tid i sekunder
      const x = origin.x + direction.x * velocity * t;
      const y = origin.y + direction.y * velocity * t - 0.5 * gravity * t * t;
      const z = origin.z + direction.z * velocity * t;

      // Stoppa om vi nått maxavstånd
      const distance = Math.sqrt(
        Math.pow(x - origin.x, 2) +
        Math.pow(z - origin.z, 2)
      );

      if (distance > maxDistance || y < 0) break;

      points.push({ x, y, z });
    }

    return points;
  }

  /**
   * Utför teleportation
   */
  public teleportTo(position: Vector3): void {
    if (!this.teleportConfig.enabled) return;

    // I en verklig implementation skulle detta flytta spelaren
    this.emit('teleport', { position });
  }

  // ============================================================================
  // SPATIAL AUDIO
  // ============================================================================

  private initAudio(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Spela rumsligt ljud
   */
  public async playSpatialAudio(
    audioUrl: string,
    config: SpatialAudioConfig,
    loop: boolean = false
  ): Promise<string> {
    if (!this.audioContext) {
      this.initAudio();
    }

    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

    const source = this.audioContext!.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = loop;

    // Skapa panner för spatial audio
    const panner = this.audioContext!.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = config.rolloff || 'inverse';
    panner.refDistance = config.refDistance || 1;
    panner.maxDistance = config.maxDistance || 100;
    panner.coneInnerAngle = config.coneInnerAngle || 360;
    panner.coneOuterAngle = config.coneOuterAngle || 360;
    panner.coneOuterGain = config.coneOuterGain || 0;

    panner.positionX.value = config.position.x;
    panner.positionY.value = config.position.y;
    panner.positionZ.value = config.position.z;

    source.connect(panner);
    panner.connect(this.audioContext!.destination);

    source.start();

    const id = `audio_${Date.now()}`;
    this.audioSources.set(id, source);

    source.onended = () => {
      this.audioSources.delete(id);
    };

    return id;
  }

  /**
   * Stoppa ljud
   */
  public stopAudio(audioId: string): void {
    const source = this.audioSources.get(audioId);
    if (source) {
      source.stop();
      this.audioSources.delete(audioId);
    }
  }

  /**
   * Uppdatera lyssnare position
   */
  public updateListenerPosition(position: Vector3, forward: Vector3, up: Vector3): void {
    if (!this.audioContext) return;

    const listener = this.audioContext.listener;

    if (listener.positionX) {
      listener.positionX.value = position.x;
      listener.positionY.value = position.y;
      listener.positionZ.value = position.z;
      listener.forwardX.value = forward.x;
      listener.forwardY.value = forward.y;
      listener.forwardZ.value = forward.z;
      listener.upX.value = up.x;
      listener.upY.value = up.y;
      listener.upZ.value = up.z;
    }
  }

  // ============================================================================
  // EVENTS
  // ============================================================================

  /**
   * Lyssna på event
   */
  public on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Ray casting mot objekt
   */
  public raycast(origin: Vector3, direction: Vector3): VRObject | null {
    // Enkel ray-box intersection
    for (const object of this.objects.values()) {
      if (!object.interactive) continue;

      // Förenklad intersection test
      const distance = this.distance(origin, object.position);
      if (distance < 2) { // Inom 2m
        return object;
      }
    }
    return null;
  }

  /**
   * Hämta viewer-position
   */
  public getViewerPosition(): Vector3 | null {
    if (!this.xrFrame || !this.xrReferenceSpace) return null;

    const pose = this.xrFrame.getViewerPose(this.xrReferenceSpace);
    if (!pose) return null;

    return this.transformToVector3(pose.transform.position);
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook för VR-session
 */
export function useVRSession() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const service = VRService.getInstance();

  useEffect(() => {
    service.isSupported().then(setIsSupported);

    const unsubscribeStart = service.on('sessionstart', () => setIsPresenting(true));
    const unsubscribeEnd = service.on('sessionend', () => setIsPresenting(false));

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, []);

  const enterVR = useCallback(async (config?: Partial<VRSessionConfig>) => {
    return service.startSession({
      mode: 'immersive-vr',
      requiredFeatures: ['local-floor'],
      ...config
    });
  }, []);

  const exitVR = useCallback(async () => {
    return service.endSession();
  }, []);

  return { isSupported, isPresenting, enterVR, exitVR, service };
}

/**
 * Hook för VR-controller
 */
export function useVRController(handedness: HandednessType) {
  const [state, setState] = useState<VRControllerState | null>(null);
  const service = VRService.getInstance();

  useEffect(() => {
    const unsubscribe = service.on('frameupdate', () => {
      setState(service.getController(handedness));
    });

    return unsubscribe;
  }, [handedness]);

  const vibrate = useCallback((intensity: number, duration: number) => {
    service.vibrate(handedness, { intensity, duration });
  }, [handedness]);

  return { state, vibrate };
}

/**
 * Hook för hand tracking
 */
export function useHandTracking(handedness: HandednessType) {
  const [state, setState] = useState<HandTrackingState | null>(null);
  const service = VRService.getInstance();

  useEffect(() => {
    const unsubscribe = service.on('frameupdate', () => {
      setState(service.getHandTracking(handedness));
    });

    return unsubscribe;
  }, [handedness]);

  const isPinching = service.isPinching(handedness);
  const isGrabbing = service.isGrabbing(handedness);

  return { state, isPinching, isGrabbing };
}

/**
 * Hook för VR-objekt
 */
export function useVRObject(objectId: string) {
  const [object, setObject] = useState<VRObject | null>(null);
  const service = VRService.getInstance();

  useEffect(() => {
    setObject(service.getObject(objectId));

    const unsubscribe = service.on('objectupdated', (data: unknown) => {
      const event = data as { object: VRObject };
      if (event.object.id === objectId) {
        setObject(event.object);
      }
    });

    return unsubscribe;
  }, [objectId]);

  const updateObject = useCallback((updates: Partial<VRObject>) => {
    service.updateObject(objectId, updates);
  }, [objectId]);

  return { object, updateObject };
}

/**
 * Hook för teleportation
 */
export function useTeleportation() {
  const [arc, setArc] = useState<Vector3[]>([]);
  const service = VRService.getInstance();

  const updateArc = useCallback((origin: Vector3, direction: Vector3) => {
    setArc(service.calculateTeleportArc(origin, direction));
  }, []);

  const teleport = useCallback((position: Vector3) => {
    service.teleportTo(position);
  }, []);

  return { arc, updateArc, teleport };
}

// ============================================================================
// EXPORT
// ============================================================================

export const vrService = VRService.getInstance();
export default vrService;
