/**
 * Mirror Mode Avatar
 *
 * Del av FAS 8: Kamera & 3D Avatar Förbättringar
 *
 * Features:
 * - Speglar användarens rörelser i realtid via kamera
 * - Konverterar MediaPipe landmarks till avatar bone rotations
 * - Smooth interpolation för naturliga rörelser
 * - Visar användarens pose som en 3D-avatar
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { User, RefreshCw } from 'lucide-react';

// MediaPipe landmark indices
const LANDMARK_INDICES = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface BoneRotations {
  spine: THREE.Euler;
  leftShoulder: THREE.Euler;
  rightShoulder: THREE.Euler;
  leftElbow: THREE.Euler;
  rightElbow: THREE.Euler;
  leftHip: THREE.Euler;
  rightHip: THREE.Euler;
  leftKnee: THREE.Euler;
  rightKnee: THREE.Euler;
  head: THREE.Euler;
}

/**
 * Beräkna vinkel mellan tre punkter
 */
function calculateAngle(
  a: PoseLandmark,
  b: PoseLandmark,
  c: PoseLandmark
): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

/**
 * Konvertera pose landmarks till bone rotations
 */
export function poseToBoneRotations(landmarks: PoseLandmark[]): BoneRotations {
  if (!landmarks || landmarks.length < 33) {
    return getDefaultRotations();
  }

  const L = LANDMARK_INDICES;

  // Beräkna axelrotationer
  const leftShoulderAngle = calculateAngle(
    landmarks[L.LEFT_HIP],
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_ELBOW]
  );

  const rightShoulderAngle = calculateAngle(
    landmarks[L.RIGHT_HIP],
    landmarks[L.RIGHT_SHOULDER],
    landmarks[L.RIGHT_ELBOW]
  );

  // Beräkna armbågsrotationer
  const leftElbowAngle = calculateAngle(
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_ELBOW],
    landmarks[L.LEFT_WRIST]
  );

  const rightElbowAngle = calculateAngle(
    landmarks[L.RIGHT_SHOULDER],
    landmarks[L.RIGHT_ELBOW],
    landmarks[L.RIGHT_WRIST]
  );

  // Beräkna höftrotationer
  const leftHipAngle = calculateAngle(
    landmarks[L.LEFT_SHOULDER],
    landmarks[L.LEFT_HIP],
    landmarks[L.LEFT_KNEE]
  );

  const rightHipAngle = calculateAngle(
    landmarks[L.RIGHT_SHOULDER],
    landmarks[L.RIGHT_HIP],
    landmarks[L.RIGHT_KNEE]
  );

  // Beräkna knärotationer
  const leftKneeAngle = calculateAngle(
    landmarks[L.LEFT_HIP],
    landmarks[L.LEFT_KNEE],
    landmarks[L.LEFT_ANKLE]
  );

  const rightKneeAngle = calculateAngle(
    landmarks[L.RIGHT_HIP],
    landmarks[L.RIGHT_KNEE],
    landmarks[L.RIGHT_ANKLE]
  );

  // Beräkna ryggradens lutning
  const midShoulder = {
    x: (landmarks[L.LEFT_SHOULDER].x + landmarks[L.RIGHT_SHOULDER].x) / 2,
    y: (landmarks[L.LEFT_SHOULDER].y + landmarks[L.RIGHT_SHOULDER].y) / 2,
    z: (landmarks[L.LEFT_SHOULDER].z + landmarks[L.RIGHT_SHOULDER].z) / 2,
  };

  const midHip = {
    x: (landmarks[L.LEFT_HIP].x + landmarks[L.RIGHT_HIP].x) / 2,
    y: (landmarks[L.LEFT_HIP].y + landmarks[L.RIGHT_HIP].y) / 2,
    z: (landmarks[L.LEFT_HIP].z + landmarks[L.RIGHT_HIP].z) / 2,
  };

  const spineTilt = Math.atan2(midShoulder.z - midHip.z, midShoulder.y - midHip.y);

  // Beräkna huvudets rotation
  const headTilt = Math.atan2(
    landmarks[L.NOSE].z - midShoulder.z,
    landmarks[L.NOSE].y - midShoulder.y
  );

  // Konvertera vinklar till Euler rotationer
  return {
    spine: new THREE.Euler(spineTilt * 0.5, 0, 0),
    leftShoulder: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(leftShoulderAngle - 180)),
    rightShoulder: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-(rightShoulderAngle - 180))),
    leftElbow: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-(180 - leftElbowAngle))),
    rightElbow: new THREE.Euler(0, 0, THREE.MathUtils.degToRad(180 - rightElbowAngle)),
    leftHip: new THREE.Euler(THREE.MathUtils.degToRad(leftHipAngle - 180), 0, 0),
    rightHip: new THREE.Euler(THREE.MathUtils.degToRad(rightHipAngle - 180), 0, 0),
    leftKnee: new THREE.Euler(THREE.MathUtils.degToRad(-(180 - leftKneeAngle)), 0, 0),
    rightKnee: new THREE.Euler(THREE.MathUtils.degToRad(-(180 - rightKneeAngle)), 0, 0),
    head: new THREE.Euler(headTilt * 0.3, 0, 0),
  };
}

function getDefaultRotations(): BoneRotations {
  return {
    spine: new THREE.Euler(0, 0, 0),
    leftShoulder: new THREE.Euler(0, 0, 0),
    rightShoulder: new THREE.Euler(0, 0, 0),
    leftElbow: new THREE.Euler(0, 0, 0),
    rightElbow: new THREE.Euler(0, 0, 0),
    leftHip: new THREE.Euler(0, 0, 0),
    rightHip: new THREE.Euler(0, 0, 0),
    leftKnee: new THREE.Euler(0, 0, 0),
    rightKnee: new THREE.Euler(0, 0, 0),
    head: new THREE.Euler(0, 0, 0),
  };
}

/**
 * Smooth interpolation mellan rotationer
 */
function lerpEuler(from: THREE.Euler, to: THREE.Euler, alpha: number): THREE.Euler {
  return new THREE.Euler(
    THREE.MathUtils.lerp(from.x, to.x, alpha),
    THREE.MathUtils.lerp(from.y, to.y, alpha),
    THREE.MathUtils.lerp(from.z, to.z, alpha)
  );
}

/**
 * Simpel capsule-baserad avatar som speglar pose
 */
const MirrorAvatar: React.FC<{
  boneRotations: BoneRotations;
  smoothingFactor?: number;
}> = ({ boneRotations, smoothingFactor = 0.3 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftCalfRef = useRef<THREE.Group>(null);
  const rightCalfRef = useRef<THREE.Group>(null);

  const currentRotations = useRef<BoneRotations>(getDefaultRotations());

  useFrame(() => {
    // Smooth interpolation
    currentRotations.current = {
      spine: lerpEuler(currentRotations.current.spine, boneRotations.spine, smoothingFactor),
      leftShoulder: lerpEuler(currentRotations.current.leftShoulder, boneRotations.leftShoulder, smoothingFactor),
      rightShoulder: lerpEuler(currentRotations.current.rightShoulder, boneRotations.rightShoulder, smoothingFactor),
      leftElbow: lerpEuler(currentRotations.current.leftElbow, boneRotations.leftElbow, smoothingFactor),
      rightElbow: lerpEuler(currentRotations.current.rightElbow, boneRotations.rightElbow, smoothingFactor),
      leftHip: lerpEuler(currentRotations.current.leftHip, boneRotations.leftHip, smoothingFactor),
      rightHip: lerpEuler(currentRotations.current.rightHip, boneRotations.rightHip, smoothingFactor),
      leftKnee: lerpEuler(currentRotations.current.leftKnee, boneRotations.leftKnee, smoothingFactor),
      rightKnee: lerpEuler(currentRotations.current.rightKnee, boneRotations.rightKnee, smoothingFactor),
      head: lerpEuler(currentRotations.current.head, boneRotations.head, smoothingFactor),
    };

    // Applicera rotationer
    if (torsoRef.current) {
      torsoRef.current.rotation.copy(currentRotations.current.spine);
    }
    if (headRef.current) {
      headRef.current.rotation.copy(currentRotations.current.head);
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.copy(currentRotations.current.leftShoulder);
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.copy(currentRotations.current.rightShoulder);
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.rotation.copy(currentRotations.current.leftElbow);
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.rotation.copy(currentRotations.current.rightElbow);
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.copy(currentRotations.current.leftHip);
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.copy(currentRotations.current.rightHip);
    }
    if (leftCalfRef.current) {
      leftCalfRef.current.rotation.copy(currentRotations.current.leftKnee);
    }
    if (rightCalfRef.current) {
      rightCalfRef.current.rotation.copy(currentRotations.current.rightKnee);
    }
  });

  const skinColor = '#FFD5B8';
  const shirtColor = '#4A90D9';
  const pantsColor = '#2D3748';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Torso */}
      <group ref={torsoRef} position={[0, 0.3, 0]}>
        {/* Chest */}
        <mesh position={[0, 0.4, 0]}>
          <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>

        {/* Pelvis */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.18, 0.2, 8, 16]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>

        {/* Head */}
        <group position={[0, 0.9, 0]}>
          <mesh ref={headRef}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={skinColor} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.05, 0.02, 0.12]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0.05, 0.02, 0.12]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.28, 0.55, 0]}>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.06, 0.25, 8, 16]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          {/* Forearm */}
          <group ref={leftForearmRef} position={[-0.35, 0, 0]}>
            <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.05, 0.2, 8, 16]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Hand */}
            <mesh position={[-0.28, 0, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
          </group>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.28, 0.55, 0]}>
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.06, 0.25, 8, 16]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          {/* Forearm */}
          <group ref={rightForearmRef} position={[0.35, 0, 0]}>
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.05, 0.2, 8, 16]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
            {/* Hand */}
            <mesh position={[0.28, 0, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, -0.1, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Calf */}
        <group ref={leftCalfRef} position={[0, -0.55, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.06, 0.35, 8, 16]} />
            <meshStandardMaterial color={pantsColor} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.48, 0.05]}>
            <boxGeometry args={[0.08, 0.05, 0.15]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, -0.1, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.4, 8, 16]} />
          <meshStandardMaterial color={pantsColor} />
        </mesh>
        {/* Calf */}
        <group ref={rightCalfRef} position={[0, -0.55, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <capsuleGeometry args={[0.06, 0.35, 8, 16]} />
            <meshStandardMaterial color={pantsColor} />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.48, 0.05]}>
            <boxGeometry args={[0.08, 0.05, 0.15]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

interface MirrorModeAvatarProps {
  poseData: PoseLandmark[] | null;
  className?: string;
  showControls?: boolean;
  smoothingFactor?: number;
}

/**
 * Huvudkomponent för Mirror Mode Avatar
 */
const MirrorModeAvatar: React.FC<MirrorModeAvatarProps> = ({
  poseData,
  className = '',
  showControls = true,
  smoothingFactor = 0.3,
}) => {
  const boneRotations = useMemo(() => {
    if (!poseData) return getDefaultRotations();
    return poseToBoneRotations(poseData);
  }, [poseData]);

  const hasPoseData = poseData && poseData.length >= 33;

  return (
    <div className={`relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden ${className}`}>
      {/* Status indicator */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${hasPoseData ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
        <span className="text-xs text-white/70">
          {hasPoseData ? 'Speglar dina rörelser' : 'Väntar på kamera...'}
        </span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 50 }}
        style={{ height: '100%', minHeight: '300px' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, -5]} intensity={0.3} />

        <MirrorAvatar
          boneRotations={boneRotations}
          smoothingFactor={smoothingFactor}
        />

        <Environment preset="studio" />
        {showControls && <OrbitControls enablePan={false} enableZoom={true} />}
      </Canvas>

      {/* Placeholder when no pose */}
      {!hasPoseData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 pointer-events-none">
          <User className="w-16 h-16 text-slate-500 mb-4" />
          <p className="text-slate-400 text-sm">Starta kameran för att se din avatar</p>
        </div>
      )}

      {/* Mirror mode label */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-slate-700/80 rounded-full">
        <RefreshCw className="w-3 h-3 text-blue-400" />
        <span className="text-xs text-white/80">Spegelläge</span>
      </div>
    </div>
  );
};

export default MirrorModeAvatar;
export { MirrorAvatar, getDefaultRotations };
