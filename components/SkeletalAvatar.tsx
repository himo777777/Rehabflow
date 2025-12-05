/**
 * Skeletal Avatar Component
 * A procedural avatar with proper bone hierarchy and keyframe animation support
 */

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import {
  AvatarAnimationController,
  ExerciseAnimationData,
  JointRotation,
} from '../services/avatarAnimationService';

// Bone structure for the skeletal system
interface BoneNode {
  name: string;
  ref: React.RefObject<THREE.Group>;
  children: BoneNode[];
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
}

interface SkeletalAvatarProps {
  animation: ExerciseAnimationData | null;
  isPlaying: boolean;
  tempo?: number;
  onPhaseChange?: (phaseName: string) => void;
  emotion?: 'neutral' | 'happy' | 'focused' | 'encouraging';
  isSpeaking?: boolean;
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

const SkeletalAvatar: React.FC<SkeletalAvatarProps> = ({
  animation,
  isPlaying,
  tempo = 1,
  onPhaseChange,
  emotion = 'neutral',
  isSpeaking = false,
}) => {
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

  // Animation controller
  const controller = useMemo(() => new AvatarAnimationController(), []);

  // Blinking state
  const blinkStateRef = useRef(1);
  const mouthOpenRef2 = useRef(0);

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

  // Mouth movement for speaking
  useEffect(() => {
    if (!isSpeaking) {
      mouthOpenRef2.current = 0;
      return;
    }

    const interval = setInterval(() => {
      mouthOpenRef2.current = Math.random() * 0.8 + 0.2;
    }, 100);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Animation frame
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update animation controller
    const pose = controller.update(delta);

    if (pose) {
      // Apply joint rotations
      for (const [jointName, rotation] of Object.entries(pose.joints)) {
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
      if (currentPhase && onPhaseChange) {
        onPhaseChange(currentPhase.name);
      }
    } else {
      // Idle breathing animation when no animation is playing
      if (chestRef.current) {
        const breath = Math.sin(time * 2) * 0.02;
        chestRef.current.scale.x = 1 + breath;
        chestRef.current.scale.z = 1 + breath;
      }

      // Subtle sway
      if (rootRef.current) {
        rootRef.current.rotation.y = Math.sin(time * 0.5) * 0.03;
      }
    }

    // Eye blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = blinkStateRef.current;
      rightEyeRef.current.scale.y = blinkStateRef.current;
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

    // Mouth animation
    if (mouthOpenRef.current) {
      mouthOpenRef.current.scale.y = isSpeaking
        ? 0.5 + mouthOpenRef2.current * 0.5
        : 0.3;
      mouthOpenRef.current.scale.x = isSpeaking
        ? 0.8 + mouthOpenRef2.current * 0.2
        : 1;
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
                <Sphere args={[0.22, 32, 32]}>
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
