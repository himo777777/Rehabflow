/**
 * ARService - Sprint 5.23
 *
 * Augmented Reality-service för RehabFlow med:
 * - WebXR AR-integration
 * - Ytstöd (plane detection)
 * - Hit testing
 * - Ljusuppskattning
 * - Bildspårning
 * - Ankarhantering
 * - DOM Overlay
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ARSessionMode = 'immersive-ar';

export interface ARSessionConfig {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: HTMLElement;
}

export interface PlaneInfo {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: Vector3;
  extent: { width: number; height: number };
  polygon: Vector3[];
  lastUpdated: number;
}

export interface HitTestResult {
  position: Vector3;
  rotation: Quaternion;
  plane?: PlaneInfo;
  distance: number;
}

export interface ARObject {
  id: string;
  type: 'model' | 'ui' | 'primitive';
  modelUrl?: string;
  position: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  anchorId?: string;
  visible: boolean;
  interactive?: boolean;
  occluded?: boolean;
}

export interface ARAnchor {
  id: string;
  position: Vector3;
  rotation: Quaternion;
  persistent: boolean;
  createdAt: number;
}

export interface LightEstimate {
  primaryLightDirection: Vector3;
  primaryLightIntensity: number;
  sphericalHarmonicsCoefficients: Float32Array | null;
}

export interface ImageTarget {
  id: string;
  name: string;
  imageUrl: string;
  physicalWidth: number; // meter
  trackingState: 'tracked' | 'limited' | 'not_tracked';
  position?: Vector3;
  rotation?: Quaternion;
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

export interface AROverlayConfig {
  element: HTMLElement;
  position?: 'fixed' | 'floating';
  worldPosition?: Vector3;
}

export interface OcclusionConfig {
  enabled: boolean;
  environmentDepth?: boolean;
  meshOcclusion?: boolean;
}

export interface ARSceneConfig {
  lighting?: boolean;
  shadows?: boolean;
  occlusion?: OcclusionConfig;
  planeVisualization?: boolean;
}

// ============================================================================
// AR SERVICE
// ============================================================================

class ARService {
  private static instance: ARService;

  private xrSession: XRSession | null = null;
  private xrReferenceSpace: XRReferenceSpace | null = null;
  private xrFrame: XRFrame | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private planes: Map<string, PlaneInfo> = new Map();
  private anchors: Map<string, ARAnchor> = new Map();
  private objects: Map<string, ARObject> = new Map();
  private imageTargets: Map<string, ImageTarget> = new Map();
  private lightEstimate: LightEstimate | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private isPresenting: boolean = false;
  private sceneConfig: ARSceneConfig = {};

  private constructor() {}

  public static getInstance(): ARService {
    if (!ARService.instance) {
      ARService.instance = new ARService();
    }
    return ARService.instance;
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Kontrollera AR-stöd
   */
  public async isSupported(): Promise<boolean> {
    if (!('xr' in navigator)) return false;

    try {
      return await navigator.xr!.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }

  /**
   * Kontrollera specifik feature-support
   */
  public async isFeatureSupported(feature: string): Promise<boolean> {
    // WebXR har inget direkt API för detta, så vi försöker starta session
    // med featuren och ser om det lyckas
    return this.isSupported();
  }

  /**
   * Starta AR-session
   */
  public async startSession(config: ARSessionConfig = {}): Promise<boolean> {
    if (!('xr' in navigator)) {
      console.error('WebXR stöds inte');
      return false;
    }

    try {
      const sessionInit: XRSessionInit = {
        requiredFeatures: config.requiredFeatures || ['hit-test', 'local-floor'],
        optionalFeatures: config.optionalFeatures || [
          'plane-detection',
          'light-estimation',
          'anchors',
          'depth-sensing',
          'dom-overlay'
        ]
      };

      if (config.domOverlay) {
        (sessionInit as XRSessionInit & { domOverlay?: { root: HTMLElement } }).domOverlay = { root: config.domOverlay };
      }

      this.xrSession = await navigator.xr!.requestSession('immersive-ar', sessionInit);

      this.xrSession.addEventListener('end', this.handleSessionEnd);

      // Skapa reference space
      this.xrReferenceSpace = await this.xrSession.requestReferenceSpace('local-floor');

      // Initiera hit test
      await this.initHitTest();

      this.isPresenting = true;
      this.emit('sessionstart', { session: this.xrSession });

      console.log('AR-session startad');
      return true;
    } catch (error) {
      console.error('Kunde inte starta AR-session:', error);
      return false;
    }
  }

  /**
   * Avsluta AR-session
   */
  public async endSession(): Promise<void> {
    if (this.xrSession) {
      await this.xrSession.end();
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
    this.hitTestSource = null;
    this.planes.clear();
    this.emit('sessionend', {});
    console.log('AR-session avslutad');
  };

  // ============================================================================
  // HIT TESTING
  // ============================================================================

  private async initHitTest(): Promise<void> {
    if (!this.xrSession) return;

    try {
      const viewerSpace = await this.xrSession.requestReferenceSpace('viewer');

      this.hitTestSource = await this.xrSession.requestHitTestSource?.({
        space: viewerSpace
      }) || null;
    } catch (error) {
      console.warn('Hit test kunde inte initieras:', error);
    }
  }

  /**
   * Utför hit test mot ytor
   */
  public performHitTest(): HitTestResult | null {
    if (!this.xrFrame || !this.hitTestSource || !this.xrReferenceSpace) {
      return null;
    }

    const results = this.xrFrame.getHitTestResults(this.hitTestSource);

    if (results.length === 0) return null;

    const hit = results[0];
    const pose = hit.getPose(this.xrReferenceSpace);

    if (!pose) return null;

    return {
      position: this.transformToVector3(pose.transform.position),
      rotation: this.transformToQuaternion(pose.transform.orientation),
      distance: 0 // Kan beräknas
    };
  }

  /**
   * Utför hit test från specifik punkt
   */
  public async hitTestFromPoint(
    screenX: number,
    screenY: number
  ): Promise<HitTestResult | null> {
    if (!this.xrSession || !this.xrReferenceSpace) return null;

    // Detta kräver transient input
    // Förenklad implementation
    return this.performHitTest();
  }

  // ============================================================================
  // PLANE DETECTION
  // ============================================================================

  /**
   * Uppdatera detekterade ytor
   */
  public updatePlanes(frame: XRFrame): void {
    if (!frame.detectedPlanes) return;

    const currentPlaneIds = new Set<string>();

    for (const plane of frame.detectedPlanes) {
      const id = this.getPlaneId(plane);
      currentPlaneIds.add(id);

      const pose = frame.getPose(plane.planeSpace, this.xrReferenceSpace!);
      if (!pose) continue;

      const planeInfo: PlaneInfo = {
        id,
        orientation: plane.orientation as 'horizontal' | 'vertical',
        position: this.transformToVector3(pose.transform.position),
        extent: { width: 1, height: 1 }, // Bör beräknas från polygon
        polygon: Array.from(plane.polygon).map(p => ({ x: p.x, y: p.y, z: p.z })),
        lastUpdated: Date.now()
      };

      const isNew = !this.planes.has(id);
      this.planes.set(id, planeInfo);

      if (isNew) {
        this.emit('planeadded', { plane: planeInfo });
      } else {
        this.emit('planeupdated', { plane: planeInfo });
      }
    }

    // Ta bort ytor som inte längre finns
    for (const id of this.planes.keys()) {
      if (!currentPlaneIds.has(id)) {
        const plane = this.planes.get(id);
        this.planes.delete(id);
        this.emit('planeremoved', { plane });
      }
    }
  }

  private getPlaneId(plane: XRPlane): string {
    // Generera unikt ID baserat på plane-objektet
    return `plane_${(plane as XRPlane & { id?: string }).id || Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hämta alla detekterade ytor
   */
  public getPlanes(orientation?: 'horizontal' | 'vertical'): PlaneInfo[] {
    const planes = Array.from(this.planes.values());
    if (orientation) {
      return planes.filter(p => p.orientation === orientation);
    }
    return planes;
  }

  /**
   * Hitta närmaste yta
   */
  public findNearestPlane(position: Vector3, orientation?: 'horizontal' | 'vertical'): PlaneInfo | null {
    const planes = this.getPlanes(orientation);
    if (planes.length === 0) return null;

    let nearest: PlaneInfo | null = null;
    let minDistance = Infinity;

    for (const plane of planes) {
      const distance = this.distance(position, plane.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = plane;
      }
    }

    return nearest;
  }

  // ============================================================================
  // ANCHORS
  // ============================================================================

  /**
   * Skapa ankare
   */
  public async createAnchor(position: Vector3, rotation?: Quaternion): Promise<string | null> {
    if (!this.xrFrame || !this.xrReferenceSpace) return null;

    try {
      const anchorId = `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const anchor: ARAnchor = {
        id: anchorId,
        position,
        rotation: rotation || { x: 0, y: 0, z: 0, w: 1 },
        persistent: false,
        createdAt: Date.now()
      };

      this.anchors.set(anchorId, anchor);
      this.emit('anchoradded', { anchor });

      return anchorId;
    } catch (error) {
      console.error('Kunde inte skapa ankare:', error);
      return null;
    }
  }

  /**
   * Skapa ankare på hit test-resultat
   */
  public async createAnchorOnHitTest(): Promise<string | null> {
    const hitResult = this.performHitTest();
    if (!hitResult) return null;

    return this.createAnchor(hitResult.position, hitResult.rotation);
  }

  /**
   * Ta bort ankare
   */
  public removeAnchor(anchorId: string): void {
    const anchor = this.anchors.get(anchorId);
    if (anchor) {
      this.anchors.delete(anchorId);

      // Ta bort objekt kopplade till ankaret
      for (const [objId, obj] of this.objects) {
        if (obj.anchorId === anchorId) {
          this.removeObject(objId);
        }
      }

      this.emit('anchorremoved', { anchor });
    }
  }

  /**
   * Hämta ankare
   */
  public getAnchor(anchorId: string): ARAnchor | null {
    return this.anchors.get(anchorId) || null;
  }

  /**
   * Lista alla ankare
   */
  public getAllAnchors(): ARAnchor[] {
    return Array.from(this.anchors.values());
  }

  // ============================================================================
  // OBJECTS
  // ============================================================================

  /**
   * Placera objekt i AR
   */
  public placeObject(object: Omit<ARObject, 'id'>): string {
    const id = `ar_obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const arObject: ARObject = {
      id,
      visible: true,
      ...object
    };

    this.objects.set(id, arObject);
    this.emit('objectplaced', { object: arObject });

    return id;
  }

  /**
   * Placera objekt vid hit test
   */
  public placeObjectAtHitTest(objectConfig: Omit<ARObject, 'id' | 'position'>): string | null {
    const hitResult = this.performHitTest();
    if (!hitResult) return null;

    return this.placeObject({
      ...objectConfig,
      position: hitResult.position,
      rotation: this.quaternionToEuler(hitResult.rotation)
    });
  }

  /**
   * Uppdatera objekt
   */
  public updateObject(objectId: string, updates: Partial<ARObject>): void {
    const object = this.objects.get(objectId);
    if (object) {
      const updated = { ...object, ...updates };
      this.objects.set(objectId, updated);
      this.emit('objectupdated', { object: updated });
    }
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
   * Hämta objekt
   */
  public getObject(objectId: string): ARObject | null {
    return this.objects.get(objectId) || null;
  }

  /**
   * Lista alla objekt
   */
  public getAllObjects(): ARObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Visa/dölj objekt
   */
  public setObjectVisibility(objectId: string, visible: boolean): void {
    this.updateObject(objectId, { visible });
  }

  // ============================================================================
  // LIGHT ESTIMATION
  // ============================================================================

  /**
   * Uppdatera ljusuppskattning
   */
  public updateLightEstimate(frame: XRFrame): void {
    if (!frame.lightEstimate) return;

    this.lightEstimate = {
      primaryLightDirection: frame.lightEstimate.primaryLightDirection
        ? this.transformToVector3(frame.lightEstimate.primaryLightDirection)
        : { x: 0, y: -1, z: 0 },
      primaryLightIntensity: frame.lightEstimate.primaryLightIntensity || 1,
      sphericalHarmonicsCoefficients: frame.lightEstimate.sphericalHarmonicsCoefficients || null
    };

    this.emit('lightestimate', { estimate: this.lightEstimate });
  }

  /**
   * Hämta aktuell ljusuppskattning
   */
  public getLightEstimate(): LightEstimate | null {
    return this.lightEstimate;
  }

  // ============================================================================
  // IMAGE TRACKING
  // ============================================================================

  /**
   * Lägg till bildmål för spårning
   */
  public async addImageTarget(target: Omit<ImageTarget, 'trackingState'>): Promise<boolean> {
    // I en verklig implementation skulle detta registrera bilden med WebXR
    const imageTarget: ImageTarget = {
      ...target,
      trackingState: 'not_tracked'
    };

    this.imageTargets.set(target.id, imageTarget);
    this.emit('imagetargetadded', { target: imageTarget });

    return true;
  }

  /**
   * Ta bort bildmål
   */
  public removeImageTarget(targetId: string): void {
    const target = this.imageTargets.get(targetId);
    if (target) {
      this.imageTargets.delete(targetId);
      this.emit('imagetargetremoved', { target });
    }
  }

  /**
   * Hämta bildmål status
   */
  public getImageTarget(targetId: string): ImageTarget | null {
    return this.imageTargets.get(targetId) || null;
  }

  /**
   * Uppdatera bildspårning
   */
  public updateImageTracking(frame: XRFrame): void {
    // Förenklad - verklig implementation kräver WebXR Image Tracking API
    // som inte är standardiserat ännu
  }

  // ============================================================================
  // SCENE CONFIGURATION
  // ============================================================================

  /**
   * Konfigurera AR-scen
   */
  public configureScene(config: ARSceneConfig): void {
    this.sceneConfig = { ...this.sceneConfig, ...config };
    this.emit('sceneconfigured', { config: this.sceneConfig });
  }

  /**
   * Aktivera ocklusion
   */
  public enableOcclusion(config: OcclusionConfig): void {
    this.sceneConfig.occlusion = config;
    this.emit('occlusionupdated', { config });
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
   * Uppdatera frame
   */
  public updateFrame(frame: XRFrame): void {
    this.xrFrame = frame;

    // Uppdatera ytor
    this.updatePlanes(frame);

    // Uppdatera ljusuppskattning
    this.updateLightEstimate(frame);

    // Uppdatera bildspårning
    this.updateImageTracking(frame);

    // Uppdatera ankare
    this.updateAnchors(frame);

    this.emit('frameupdate', { frame });
  }

  private updateAnchors(frame: XRFrame): void {
    if (!this.xrReferenceSpace) return;

    for (const [id, anchor] of this.anchors) {
      // I en verklig implementation skulle vi uppdatera ankarets pose
      // baserat på XRAnchor API:t
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private transformToVector3(pos: DOMPointReadOnly): Vector3 {
    return { x: pos.x, y: pos.y, z: pos.z };
  }

  private transformToQuaternion(rot: DOMPointReadOnly): Quaternion {
    return { x: rot.x, y: rot.y, z: rot.z, w: rot.w };
  }

  private quaternionToEuler(q: Quaternion): Vector3 {
    // Konvertera quaternion till euler-vinklar
    const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    const x = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (q.w * q.y - q.z * q.x);
    const y = Math.abs(sinp) >= 1
      ? Math.sign(sinp) * Math.PI / 2
      : Math.asin(sinp);

    const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
    const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
    const z = Math.atan2(siny_cosp, cosy_cosp);

    return { x, y, z };
  }

  private distance(a: Vector3, b: Vector3): number {
    return Math.sqrt(
      Math.pow(b.x - a.x, 2) +
      Math.pow(b.y - a.y, 2) +
      Math.pow(b.z - a.z, 2)
    );
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
  // CAMERA ACCESS
  // ============================================================================

  /**
   * Hämta kameravy
   */
  public getCameraView(): { position: Vector3; rotation: Quaternion } | null {
    if (!this.xrFrame || !this.xrReferenceSpace) return null;

    const pose = this.xrFrame.getViewerPose(this.xrReferenceSpace);
    if (!pose) return null;

    return {
      position: this.transformToVector3(pose.transform.position),
      rotation: this.transformToQuaternion(pose.transform.orientation)
    };
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook för AR-session
 */
export function useARSession() {
  const [isSupported, setIsSupported] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const service = ARService.getInstance();

  useEffect(() => {
    service.isSupported().then(setIsSupported);

    const unsubscribeStart = service.on('sessionstart', () => setIsPresenting(true));
    const unsubscribeEnd = service.on('sessionend', () => setIsPresenting(false));

    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, []);

  const enterAR = useCallback(async (config?: ARSessionConfig) => {
    return service.startSession(config);
  }, []);

  const exitAR = useCallback(async () => {
    return service.endSession();
  }, []);

  return { isSupported, isPresenting, enterAR, exitAR, service };
}

/**
 * Hook för hit testing
 */
export function useHitTest() {
  const [hitResult, setHitResult] = useState<HitTestResult | null>(null);
  const service = ARService.getInstance();

  useEffect(() => {
    const unsubscribe = service.on('frameupdate', () => {
      setHitResult(service.performHitTest());
    });

    return unsubscribe;
  }, []);

  const placeAtHit = useCallback((objectConfig: Omit<ARObject, 'id' | 'position'>) => {
    return service.placeObjectAtHitTest(objectConfig);
  }, []);

  return { hitResult, placeAtHit };
}

/**
 * Hook för plane detection
 */
export function usePlanes(orientation?: 'horizontal' | 'vertical') {
  const [planes, setPlanes] = useState<PlaneInfo[]>([]);
  const service = ARService.getInstance();

  useEffect(() => {
    const updatePlanes = () => {
      setPlanes(service.getPlanes(orientation));
    };

    const unsub1 = service.on('planeadded', updatePlanes);
    const unsub2 = service.on('planeupdated', updatePlanes);
    const unsub3 = service.on('planeremoved', updatePlanes);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [orientation]);

  return planes;
}

/**
 * Hook för AR-objekt
 */
export function useARObjects() {
  const [objects, setObjects] = useState<ARObject[]>([]);
  const service = ARService.getInstance();

  useEffect(() => {
    const updateObjects = () => {
      setObjects(service.getAllObjects());
    };

    const unsub1 = service.on('objectplaced', updateObjects);
    const unsub2 = service.on('objectupdated', updateObjects);
    const unsub3 = service.on('objectremoved', updateObjects);

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const placeObject = useCallback((config: Omit<ARObject, 'id'>) => {
    return service.placeObject(config);
  }, []);

  const removeObject = useCallback((id: string) => {
    service.removeObject(id);
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<ARObject>) => {
    service.updateObject(id, updates);
  }, []);

  return { objects, placeObject, removeObject, updateObject };
}

/**
 * Hook för light estimation
 */
export function useLightEstimate() {
  const [estimate, setEstimate] = useState<LightEstimate | null>(null);
  const service = ARService.getInstance();

  useEffect(() => {
    const unsubscribe = service.on('lightestimate', (data: unknown) => {
      setEstimate((data as { estimate: LightEstimate }).estimate);
    });

    return unsubscribe;
  }, []);

  return estimate;
}

/**
 * Hook för image tracking
 */
export function useImageTracking() {
  const [trackedImages, setTrackedImages] = useState<Map<string, ImageTarget>>(new Map());
  const service = ARService.getInstance();

  const addTarget = useCallback(async (target: Omit<ImageTarget, 'trackingState'>) => {
    return service.addImageTarget(target);
  }, []);

  const removeTarget = useCallback((targetId: string) => {
    service.removeImageTarget(targetId);
  }, []);

  const getTarget = useCallback((targetId: string) => {
    return service.getImageTarget(targetId);
  }, []);

  return { trackedImages, addTarget, removeTarget, getTarget };
}

/**
 * Hook för anchors
 */
export function useAnchors() {
  const [anchors, setAnchors] = useState<ARAnchor[]>([]);
  const service = ARService.getInstance();

  useEffect(() => {
    const updateAnchors = () => {
      setAnchors(service.getAllAnchors());
    };

    const unsub1 = service.on('anchoradded', updateAnchors);
    const unsub2 = service.on('anchorremoved', updateAnchors);

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const createAnchor = useCallback(async (position: Vector3, rotation?: Quaternion) => {
    return service.createAnchor(position, rotation);
  }, []);

  const createAnchorAtHit = useCallback(async () => {
    return service.createAnchorOnHitTest();
  }, []);

  const removeAnchor = useCallback((anchorId: string) => {
    service.removeAnchor(anchorId);
  }, []);

  return { anchors, createAnchor, createAnchorAtHit, removeAnchor };
}

// ============================================================================
// EXPORT
// ============================================================================

export const arService = ARService.getInstance();
export default arService;
