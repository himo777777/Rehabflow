/**
 * DemonstratorAvatar3D - Professional 3D avatar for exercise demonstration
 * Uses React Three Fiber for high-quality rendering
 */

import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, RoundedBox, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'CORE' | 'STRETCH' | 'BALANCE' | 'PUSH' | 'GENERAL';

interface DemonstratorAvatar3DProps {
  mode: ExerciseMode;
  className?: string;
}

// Material definitions for professional look
const MATERIALS = {
  skin: new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e0b8a0'),
    roughness: 0.7,
    metalness: 0.1,
  }),
  muscle: new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4a9eff'),
    roughness: 0.3,
    metalness: 0.5,
    emissive: new THREE.Color('#1a5fff'),
    emissiveIntensity: 0.2,
  }),
  muscleActive: new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00ff88'),
    roughness: 0.2,
    metalness: 0.6,
    emissive: new THREE.Color('#00ff88'),
    emissiveIntensity: 0.5,
  }),
  joint: new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.2,
    metalness: 0.8,
    emissive: new THREE.Color('#4a9eff'),
    emissiveIntensity: 0.3,
  }),
  bone: new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f0f0f0'),
    roughness: 0.4,
    metalness: 0.3,
    transparent: true,
    opacity: 0.9,
  }),
};

// Limb component with joint sphere
const Limb: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  thickness?: number;
  isActive?: boolean;
  showJoint?: boolean;
}> = ({ start, end, thickness = 0.08, isActive = false, showJoint = true }) => {
  const direction = new THREE.Vector3(
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2]
  );
  const length = direction.length();
  const center = new THREE.Vector3(
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  );

  // Calculate rotation
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize()
  );

  const material = isActive ? MATERIALS.muscleActive : MATERIALS.muscle;

  return (
    <group>
      {/* Main limb cylinder */}
      <mesh position={[center.x, center.y, center.z]} quaternion={quaternion}>
        <capsuleGeometry args={[thickness, length - thickness * 2, 8, 16]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Joint sphere at start */}
      {showJoint && (
        <mesh position={start}>
          <sphereGeometry args={[thickness * 1.3, 16, 16]} />
          <primitive object={MATERIALS.joint} attach="material" />
        </mesh>
      )}

      {/* Joint sphere at end */}
      <mesh position={end}>
        <sphereGeometry args={[thickness * 1.3, 16, 16]} />
        <primitive object={MATERIALS.joint} attach="material" />
      </mesh>
    </group>
  );
};

// Main skeleton figure
const SkeletonFigure: React.FC<{ mode: ExerciseMode }> = ({ mode }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Determine which muscles are active based on mode
  const activeGroups = useMemo(() => {
    switch (mode) {
      case 'LEGS':
      case 'LUNGE':
        return { leftLeg: true, rightLeg: true };
      case 'PRESS':
      case 'PUSH':
        return { leftArm: true, rightArm: true, chest: true };
      case 'PULL':
        return { leftArm: true, rightArm: true, back: true };
      case 'CORE':
        return { core: true };
      case 'BALANCE':
        return { leftLeg: true, rightLeg: true, core: true };
      default:
        return {};
    }
  }, [mode]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Breathing animation
    const breathe = Math.sin(time * 2) * 0.02;
    if (torsoRef.current) {
      torsoRef.current.scale.set(1, 1 + breathe, 1);
    }

    // Exercise-specific animations
    const cycle = time % 5;
    let progress = 0;

    // Rehab tempo: 3s eccentric, 1s hold, 1s concentric
    if (cycle < 3) {
      progress = (1 - Math.cos((cycle / 3) * Math.PI)) / 2;
    } else if (cycle < 4) {
      progress = 1;
    } else {
      const t = cycle - 4;
      progress = 1 - (1 - Math.cos(t * Math.PI)) / 2;
    }

    // Arm animations
    if (leftArmRef.current && rightArmRef.current) {
      switch (mode) {
        case 'PRESS':
          leftArmRef.current.rotation.x = -Math.PI / 2 + progress * Math.PI / 3;
          rightArmRef.current.rotation.x = -Math.PI / 2 + progress * Math.PI / 3;
          break;
        case 'PULL':
          leftArmRef.current.rotation.x = -progress * Math.PI / 3;
          rightArmRef.current.rotation.x = -progress * Math.PI / 3;
          leftArmRef.current.rotation.z = progress * 0.3;
          rightArmRef.current.rotation.z = -progress * 0.3;
          break;
        case 'PUSH':
          leftArmRef.current.rotation.x = -Math.PI / 4 - progress * Math.PI / 4;
          rightArmRef.current.rotation.x = -Math.PI / 4 - progress * Math.PI / 4;
          break;
        default:
          // Idle arm swing
          leftArmRef.current.rotation.x = Math.sin(time) * 0.1;
          rightArmRef.current.rotation.x = -Math.sin(time) * 0.1;
      }
    }

    // Leg animations
    if (leftLegRef.current && rightLegRef.current) {
      switch (mode) {
        case 'LEGS':
          // Squat
          leftLegRef.current.rotation.x = progress * Math.PI / 4;
          rightLegRef.current.rotation.x = progress * Math.PI / 4;
          if (groupRef.current) {
            groupRef.current.position.y = -progress * 0.5;
          }
          break;
        case 'LUNGE':
          leftLegRef.current.rotation.x = progress * Math.PI / 6;
          rightLegRef.current.rotation.x = -progress * Math.PI / 4;
          break;
        case 'BALANCE':
          rightLegRef.current.rotation.x = progress * Math.PI / 6;
          rightLegRef.current.rotation.z = progress * 0.2;
          break;
        default:
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
      }
    }

    // Core animations
    if (torsoRef.current && mode === 'CORE') {
      torsoRef.current.rotation.x = progress * Math.PI / 8;
    }

    // Gentle rotation for visual interest
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <primitive object={MATERIALS.skin} attach="material" />
      </mesh>

      {/* Neck */}
      <Limb start={[0, 1.5, 0]} end={[0, 1.55, 0]} thickness={0.05} showJoint={false} />

      {/* Torso */}
      <group ref={torsoRef}>
        {/* Chest */}
        <mesh position={[0, 1.2, 0]}>
          <capsuleGeometry args={[0.2, 0.3, 8, 16]} />
          <primitive object={activeGroups.chest ? MATERIALS.muscleActive : MATERIALS.muscle} attach="material" />
        </mesh>

        {/* Spine */}
        <Limb
          start={[0, 0.8, 0]}
          end={[0, 1.4, 0]}
          thickness={0.12}
          isActive={activeGroups.back || activeGroups.core}
        />

        {/* Hip area */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.35, 0.15, 0.15]} />
          <primitive object={MATERIALS.bone} attach="material" />
        </mesh>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[0.3, 1.35, 0]}>
        {/* Upper arm */}
        <Limb
          start={[0, 0, 0]}
          end={[0.15, -0.35, 0]}
          thickness={0.06}
          isActive={activeGroups.leftArm}
        />
        {/* Forearm */}
        <Limb
          start={[0.15, -0.35, 0]}
          end={[0.2, -0.7, 0]}
          thickness={0.05}
          isActive={activeGroups.leftArm}
        />
        {/* Hand */}
        <mesh position={[0.2, -0.75, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <primitive object={MATERIALS.skin} attach="material" />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[-0.3, 1.35, 0]}>
        <Limb
          start={[0, 0, 0]}
          end={[-0.15, -0.35, 0]}
          thickness={0.06}
          isActive={activeGroups.rightArm}
        />
        <Limb
          start={[-0.15, -0.35, 0]}
          end={[-0.2, -0.7, 0]}
          thickness={0.05}
          isActive={activeGroups.rightArm}
        />
        <mesh position={[-0.2, -0.75, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <primitive object={MATERIALS.skin} attach="material" />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[0.12, 0.65, 0]}>
        {/* Upper leg */}
        <Limb
          start={[0, 0, 0]}
          end={[0, -0.45, 0]}
          thickness={0.08}
          isActive={activeGroups.leftLeg}
        />
        {/* Lower leg */}
        <Limb
          start={[0, -0.45, 0]}
          end={[0, -0.9, 0]}
          thickness={0.06}
          isActive={activeGroups.leftLeg}
        />
        {/* Foot */}
        <mesh position={[0, -0.95, 0.05]}>
          <boxGeometry args={[0.08, 0.05, 0.15]} />
          <primitive object={MATERIALS.skin} attach="material" />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[-0.12, 0.65, 0]}>
        <Limb
          start={[0, 0, 0]}
          end={[0, -0.45, 0]}
          thickness={0.08}
          isActive={activeGroups.rightLeg}
        />
        <Limb
          start={[0, -0.45, 0]}
          end={[0, -0.9, 0]}
          thickness={0.06}
          isActive={activeGroups.rightLeg}
        />
        <mesh position={[0, -0.95, 0.05]}>
          <boxGeometry args={[0.08, 0.05, 0.15]} />
          <primitive object={MATERIALS.skin} attach="material" />
        </mesh>
      </group>
    </group>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshBasicMaterial color="#4a9eff" wireframe />
  </mesh>
);

// Main component
const DemonstratorAvatar3D: React.FC<DemonstratorAvatar3DProps> = ({ mode, className = '' }) => {
  // Camera position adjusted to show full body (head at y=1.7, feet at y=-0.35)
  // Center at y=0.7, pull back to z=4 with wider FOV
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.7, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#4a9eff" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#00ff88" />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -0.35, 0]}
          opacity={0.5}
          scale={3}
          blur={2}
          far={1}
        />

        {/* Avatar - centered lower so full body is visible */}
        <group position={[0, -0.3, 0]}>
          <Suspense fallback={<LoadingFallback />}>
            <SkeletonFigure mode={mode} />
          </Suspense>
        </group>

        {/* Controls - limited for guided viewing */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0.5, 0]}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default DemonstratorAvatar3D;
