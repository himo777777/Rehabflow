
import React, { useRef, useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, RoundedBox, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { speechService } from '../services/speechService';
import { Volume2, VolumeX, Play, Pause, RotateCcw, X, ChevronRight, ChevronLeft, Loader2, Gauge, Eye, Info } from 'lucide-react';
import SkeletalAvatar from './SkeletalAvatar';
import { getExerciseAnimation, idleAnimation } from '../data/exerciseAnimations';
import { ExerciseAnimationData, AnimationPhase } from '../services/avatarAnimationService';

interface Avatar3DProps {
  exerciseName: string;
  steps: { title: string; instruction: string }[];
  onClose?: () => void;
}

// Simplified humanoid avatar using basic shapes with facial expressions
const HumanoidAvatar: React.FC<{
  animation: string;
  animationProgress: number;
  isSpeaking: boolean;
  emotion: 'neutral' | 'happy' | 'focused' | 'encouraging';
}> = ({ animation, animationProgress, isSpeaking, emotion }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const mouthOpenRef = useRef<THREE.Mesh>(null);

  // Track mouth animation for speech
  const [mouthOpen, setMouthOpen] = useState(0);
  const [blinkState, setBlinkState] = useState(1);

  // Mouth animation for speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    // Simulate mouth movement while speaking
    const interval = setInterval(() => {
      setMouthOpen(Math.random() * 0.8 + 0.2);
    }, 100);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Natural blinking
  useEffect(() => {
    const blink = () => {
      setBlinkState(0);
      setTimeout(() => setBlinkState(1), 150);
    };

    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Eye blinking animation
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = blinkState;
      rightEyeRef.current.scale.y = blinkState;
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

      leftEyebrowRef.current.position.y = 1.82 + eyebrowY;
      rightEyebrowRef.current.position.y = 1.82 + eyebrowY;
      leftEyebrowRef.current.rotation.z = -eyebrowRotation;
      rightEyebrowRef.current.rotation.z = eyebrowRotation;
    }

    // Mouth animation
    if (mouthOpenRef.current) {
      mouthOpenRef.current.scale.y = isSpeaking ? 0.5 + mouthOpen * 0.5 : 0.3;
      mouthOpenRef.current.scale.x = isSpeaking ? 0.8 + mouthOpen * 0.2 : 1;
    }

    // Gentle breathing animation for torso
    if (torsoRef.current) {
      torsoRef.current.scale.x = 1 + Math.sin(time * 2) * 0.02;
      torsoRef.current.scale.z = 1 + Math.sin(time * 2) * 0.02;
    }

    // Animation based on current step
    switch (animation) {
      case 'idle':
        // Subtle swaying
        if (groupRef.current) {
          groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        }
        break;

      case 'arm_raise':
        // Raise both arms
        if (leftArmRef.current && rightArmRef.current) {
          const targetRotation = -Math.PI * 0.7 * animationProgress;
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
            leftArmRef.current.rotation.z,
            -targetRotation,
            0.1
          );
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
            rightArmRef.current.rotation.z,
            targetRotation,
            0.1
          );
        }
        break;

      case 'squat':
        // Squat motion
        if (groupRef.current && leftLegRef.current && rightLegRef.current) {
          const squat = Math.sin(animationProgress * Math.PI) * 0.3;
          groupRef.current.position.y = -squat;
          leftLegRef.current.rotation.x = squat * 0.5;
          rightLegRef.current.rotation.x = squat * 0.5;
        }
        break;

      case 'stretch':
        // Side stretch
        if (torsoRef.current && leftArmRef.current) {
          torsoRef.current.rotation.z = Math.sin(animationProgress * Math.PI * 2) * 0.2;
          leftArmRef.current.rotation.z = -Math.PI * 0.5 - animationProgress * 0.3;
        }
        break;

      case 'balance':
        // Balance on one leg
        if (leftLegRef.current && rightArmRef.current && leftArmRef.current) {
          leftLegRef.current.rotation.x = animationProgress * 0.5;
          rightArmRef.current.rotation.z = animationProgress * 0.3;
          leftArmRef.current.rotation.z = -animationProgress * 0.3;
        }
        break;

      default:
        // Reset to neutral
        if (leftArmRef.current) leftArmRef.current.rotation.z = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.z = 0;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
    }
  });

  const skinColor = '#ffdbac';
  const shirtColor = '#4f86f7';
  const pantsColor = '#2d3748';

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head */}
      <Sphere args={[0.25, 32, 32]} position={[0, 1.7, 0]}>
        <meshStandardMaterial color={skinColor} />
      </Sphere>

      {/* Eyebrows */}
      <mesh ref={leftEyebrowRef} position={[-0.1, 1.82, 0.2]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.08, 0.015, 0.01]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh ref={rightEyebrowRef} position={[0.1, 1.82, 0.2]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.08, 0.015, 0.01]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.08, 1.75, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.08, 1.75, 0.2]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Eye highlights (for liveliness) */}
      <Sphere args={[0.015, 8, 8]} position={[-0.06, 1.77, 0.23]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.015, 8, 8]} position={[0.1, 1.77, 0.23]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </Sphere>

      {/* Mouth - base (closed smile) */}
      <mesh ref={mouthRef} position={[0, 1.62, 0.22]} rotation={[0, 0, 0]} visible={!isSpeaking}>
        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#cc6666" />
      </mesh>

      {/* Mouth - open (for speaking) */}
      <mesh ref={mouthOpenRef} position={[0, 1.6, 0.22]} visible={isSpeaking}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#8b0000" />
      </mesh>

      {/* Torso */}
      <group ref={torsoRef}>
        <RoundedBox args={[0.5, 0.7, 0.25]} position={[0, 1.1, 0]} radius={0.05}>
          <meshStandardMaterial color={shirtColor} />
        </RoundedBox>
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.35, 1.35, 0]}>
        <Cylinder args={[0.08, 0.06, 0.5, 16]} position={[0, -0.25, 0]}>
          <meshStandardMaterial color={shirtColor} />
        </Cylinder>
        <Cylinder args={[0.06, 0.05, 0.4, 16]} position={[0, -0.55, 0]}>
          <meshStandardMaterial color={skinColor} />
        </Cylinder>
        <Sphere args={[0.06, 16, 16]} position={[0, -0.8, 0]}>
          <meshStandardMaterial color={skinColor} />
        </Sphere>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.35, 1.35, 0]}>
        <Cylinder args={[0.08, 0.06, 0.5, 16]} position={[0, -0.25, 0]}>
          <meshStandardMaterial color={shirtColor} />
        </Cylinder>
        <Cylinder args={[0.06, 0.05, 0.4, 16]} position={[0, -0.55, 0]}>
          <meshStandardMaterial color={skinColor} />
        </Cylinder>
        <Sphere args={[0.06, 16, 16]} position={[0, -0.8, 0]}>
          <meshStandardMaterial color={skinColor} />
        </Sphere>
      </group>

      {/* Hips */}
      <RoundedBox args={[0.4, 0.2, 0.2]} position={[0, 0.65, 0]} radius={0.03}>
        <meshStandardMaterial color={pantsColor} />
      </RoundedBox>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.55, 0]}>
        <Cylinder args={[0.1, 0.08, 0.5, 16]} position={[0, -0.25, 0]}>
          <meshStandardMaterial color={pantsColor} />
        </Cylinder>
        <Cylinder args={[0.08, 0.07, 0.5, 16]} position={[0, -0.55, 0]}>
          <meshStandardMaterial color={pantsColor} />
        </Cylinder>
        <RoundedBox args={[0.1, 0.08, 0.18]} position={[0, -0.85, 0.04]} radius={0.02}>
          <meshStandardMaterial color="#333" />
        </RoundedBox>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.55, 0]}>
        <Cylinder args={[0.1, 0.08, 0.5, 16]} position={[0, -0.25, 0]}>
          <meshStandardMaterial color={pantsColor} />
        </Cylinder>
        <Cylinder args={[0.08, 0.07, 0.5, 16]} position={[0, -0.55, 0]}>
          <meshStandardMaterial color={pantsColor} />
        </Cylinder>
        <RoundedBox args={[0.1, 0.08, 0.18]} position={[0, -0.85, 0.04]} radius={0.02}>
          <meshStandardMaterial color="#333" />
        </RoundedBox>
      </group>
    </group>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      <span className="text-sm text-slate-500">Laddar 3D...</span>
    </div>
  </Html>
);

// Camera angle presets
type CameraAngle = 'front' | 'side' | 'top';
const CAMERA_ANGLES: Record<CameraAngle, [number, number, number]> = {
  front: [0, 1, 3],
  side: [3, 1, 0],
  top: [0, 3.5, 1],
};

// Tempo options
const TEMPO_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

const Avatar3D: React.FC<Avatar3DProps> = ({ exerciseName, steps, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [currentPhaseDescription, setCurrentPhaseDescription] = useState<string>('');
  const [useNewAvatar, setUseNewAvatar] = useState(true);
  const [showAnimationInfo, setShowAnimationInfo] = useState(true);

  // NEW: Tempo and camera controls
  const [tempo, setTempo] = useState(1);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('front');
  const controlsRef = useRef<any>(null);
  const previousPhaseRef = useRef<string>('');

  // Get exercise animation data
  const exerciseAnimation = useMemo<ExerciseAnimationData | null>(() => {
    const anim = getExerciseAnimation(exerciseName);
    return anim || idleAnimation;
  }, [exerciseName]);

  // Generate animation-based instructions from phases
  const animationInstructions = useMemo(() => {
    if (!exerciseAnimation || !exerciseAnimation.phases) return [];
    return exerciseAnimation.phases.map((phase, idx) => ({
      title: phase.name,
      instruction: phase.description || `${phase.name} - kontrollerat`,
    }));
  }, [exerciseAnimation]);

  // Use animation instructions if no steps provided, or merge them
  const effectiveSteps = useMemo(() => {
    if (steps.length > 0) return steps;
    if (animationInstructions.length > 0) return animationInstructions;
    return [{ title: 'Utför övningen', instruction: 'Följ avatarens rörelse' }];
  }, [steps, animationInstructions]);

  // Handle phase changes from skeletal avatar with voice guidance
  const handlePhaseChange = useCallback((phaseName: string) => {
    setCurrentPhase(phaseName);

    // Find phase description
    if (exerciseAnimation?.phases) {
      const phase = exerciseAnimation.phases.find(p => p.name === phaseName);
      if (phase?.description) {
        setCurrentPhaseDescription(phase.description);
      }
    }
  }, [exerciseAnimation]);

  // Voice guidance for phase changes during animation
  useEffect(() => {
    if (!isPlaying || !voiceEnabled || !currentPhase) return;

    // Only speak if phase actually changed
    if (previousPhaseRef.current !== currentPhase) {
      previousPhaseRef.current = currentPhase;

      // Find the phase description
      const phase = exerciseAnimation?.phases?.find(p => p.name === currentPhase);
      if (phase?.description) {
        // Use short, encouraging guidance
        setIsSpeaking(true);
        speechService.speak(phase.description, { rate: 1.1 }) // Slightly faster
          .then(() => setIsSpeaking(false))
          .catch(() => setIsSpeaking(false));
      }
    }
  }, [currentPhase, isPlaying, voiceEnabled, exerciseAnimation]);

  // Legacy: Determine animation based on exercise name keywords (for old avatar)
  const getAnimationType = (): string => {
    const name = exerciseName.toLowerCase();
    if (name.includes('arm') || name.includes('axel') || name.includes('skulder')) return 'arm_raise';
    if (name.includes('squat') || name.includes('knä') || name.includes('ben')) return 'squat';
    if (name.includes('stretch') || name.includes('sträck') || name.includes('böj')) return 'stretch';
    if (name.includes('balans') || name.includes('stå')) return 'balance';
    return 'idle';
  };

  const animation = getAnimationType();

  // Determine emotion based on step
  const emotion = useMemo((): 'neutral' | 'happy' | 'focused' | 'encouraging' => {
    const step = steps[currentStep];
    if (!step) return 'neutral';
    const title = step.title.toLowerCase();
    if (title.includes('start') || title.includes('utgång')) return 'focused';
    if (title.includes('utför') || title.includes('rörelse')) return 'encouraging';
    if (title.includes('tips') || title.includes('klart')) return 'happy';
    return 'neutral';
  }, [currentStep, steps]);

  // Animation progress loop - uses tempo for speed control
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        if (prev >= 1) return 0;
        return prev + (0.02 * tempo); // Adjusted by tempo
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, tempo]);

  // Camera angle change effect
  useEffect(() => {
    if (controlsRef.current) {
      const newPosition = CAMERA_ANGLES[cameraAngle];
      // Smooth camera transition would need animation, for now direct set
      controlsRef.current.object.position.set(...newPosition);
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
    }
  }, [cameraAngle]);

  // Speak current step (only when not playing animation - animation phases handle their own speech)
  useEffect(() => {
    if (isPlaying) return; // Let phase-based speech handle this during animation

    if (voiceEnabled && effectiveSteps[currentStep]) {
      setIsSpeaking(true);
      speechService
        .speak(`${effectiveSteps[currentStep].title}. ${effectiveSteps[currentStep].instruction}`)
        .then(() => setIsSpeaking(false))
        .catch(() => setIsSpeaking(false));
    }

    return () => {
      speechService.stop();
    };
  }, [currentStep, voiceEnabled, isPlaying, effectiveSteps]);

  // Announce exercise and animation at start
  useEffect(() => {
    if (voiceEnabled && exerciseAnimation && exerciseAnimation.exerciseName !== 'Idle') {
      speechService.speak(`${exerciseName}. Tryck på Spela för att starta demonstrationen.`);
    }
  }, [exerciseName, exerciseAnimation, voiceEnabled]);

  const handleNext = () => {
    speechService.stop();
    if (currentStep < effectiveSteps.length - 1) {
      setCurrentStep((c) => c + 1);
    }
  };

  const handlePrev = () => {
    speechService.stop();
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  const handleReset = () => {
    speechService.stop();
    setCurrentStep(0);
    setAnimationProgress(0);
    setIsPlaying(false);
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      speechService.stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">3D</span>
          </div>
          <div>
            <h2 className="text-white font-bold">{exerciseName}</h2>
            <p className="text-slate-400 text-sm">Interaktiv demonstration</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 1, 3], fov: 50 }}
          className="bg-gradient-to-b from-slate-800 to-slate-900"
        >
          <Suspense fallback={<LoadingFallback />}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.3} />

            {useNewAvatar ? (
              <SkeletalAvatar
                animation={isPlaying ? exerciseAnimation : idleAnimation}
                isPlaying={isPlaying}
                tempo={tempo}
                onPhaseChange={handlePhaseChange}
                emotion={emotion}
                isSpeaking={isSpeaking}
              />
            ) : (
              <HumanoidAvatar
                animation={isPlaying ? animation : 'idle'}
                animationProgress={animationProgress}
                isSpeaking={isSpeaking}
                emotion={emotion}
              />
            )}

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={2}
              maxDistance={6}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI * 0.6}
            />

            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
              <circleGeometry args={[2, 64]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            <Environment preset="city" />
          </Suspense>
        </Canvas>

        {/* Step indicator overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex justify-center gap-1.5">
            {effectiveSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-cyan-400' : idx < currentStep ? 'w-2 bg-cyan-600' : 'w-2 bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Animation Phase Indicator - Enhanced */}
        {isPlaying && currentPhase && (
          <div className="absolute top-12 left-4 right-4 flex justify-between items-start">
            {/* Current Phase */}
            <div className="bg-gradient-to-r from-blue-500/30 to-cyan-500/20 border border-blue-500/40 rounded-xl px-4 py-2 backdrop-blur-sm max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-cyan-300 text-xs font-bold uppercase tracking-wide">{currentPhase}</span>
              </div>
              {currentPhaseDescription && (
                <p className="text-white text-sm font-medium">{currentPhaseDescription}</p>
              )}
            </div>

            {/* Animation info */}
            {exerciseAnimation && exerciseAnimation.exerciseName !== 'Idle' && (
              <div className="bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <span className="text-slate-400 text-xs">
                  Animation: <span className="text-cyan-400 font-medium">{exerciseAnimation.exerciseName}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 8}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            <span className="text-cyan-300 text-xs font-medium">Talar...</span>
          </div>
        )}
      </div>

      {/* Instructions Panel */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-t border-slate-700/50 p-4">
        <div className="max-w-lg mx-auto">
          {/* Current Step */}
          <div className="bg-slate-700/50 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold">
                  Steg {currentStep + 1} / {effectiveSteps.length}
                </span>
                <h3 className="text-white font-bold">{effectiveSteps[currentStep]?.title}</h3>
              </div>
              {/* Show animation match status */}
              {exerciseAnimation && exerciseAnimation.exerciseName !== 'Idle' && (
                <div className="flex items-center gap-1.5 text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-xs">Animation matchad</span>
                </div>
              )}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{effectiveSteps[currentStep]?.instruction}</p>
            {/* Show phase info when animation uses phases */}
            {isPlaying && currentPhase && (
              <div className="mt-3 pt-3 border-t border-slate-600/50">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-cyan-400" />
                  <span className="text-cyan-300 text-xs">
                    Aktuell fas: <strong>{currentPhase}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tempo & Camera Controls */}
          <div className="flex items-center justify-between mb-3 gap-4">
            {/* Tempo Control */}
            <div className="flex items-center gap-2">
              <Gauge size={16} className="text-slate-400" />
              <div className="flex rounded-lg bg-slate-700/50 border border-slate-600 overflow-hidden">
                {TEMPO_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTempo(opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
                      tempo === opt.value
                        ? 'bg-cyan-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                    title={`Hastighet ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Angle Control */}
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-slate-400" />
              <div className="flex rounded-lg bg-slate-700/50 border border-slate-600 overflow-hidden">
                {(['front', 'side', 'top'] as CameraAngle[]).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setCameraAngle(angle)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
                      cameraAngle === angle
                        ? 'bg-cyan-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-600'
                    }`}
                    title={`${angle === 'front' ? 'Framifrån' : angle === 'side' ? 'Sidan' : 'Ovanifrån'}`}
                  >
                    {angle === 'front' ? 'Fram' : angle === 'side' ? 'Sida' : 'Ovan'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={toggleVoice}
                className={`p-3 rounded-xl transition-all ${
                  voiceEnabled
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}
                title={voiceEnabled ? 'Stäng av röst' : 'Sätt på röst'}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-xl bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-white transition-all"
                title="Börja om"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={20} /> Pausa
                </>
              ) : (
                <>
                  <Play size={20} /> Spela
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-3 rounded-xl bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === effectiveSteps.length - 1}
                className="p-3 rounded-xl bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Avatar3D;
