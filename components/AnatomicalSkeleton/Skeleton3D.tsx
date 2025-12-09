/**
 * Skeleton3D - Professional 3D interactive body map
 *
 * Uses React Three Fiber to render a 3D skeleton model with:
 * - Smooth orbit controls (rotate, zoom, pan)
 * - Clickable body regions
 * - Professional medical-grade lighting
 * - Pain intensity visualization
 */

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { MeshoptDecoder } from 'meshoptimizer';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { logger } from '../../utils/logger';

interface Skeleton3DProps {
  selected: string;
  onSelect: (part: string) => void;
  painLevels?: Record<string, number>;
}

// Map mesh names to body region IDs
const MESH_TO_REGION: Record<string, string> = {
  // Head
  'head': 'Huvud',
  'skull': 'Huvud',
  'cranium': 'Huvud',

  // Neck
  'neck': 'Nacke',
  'cervical': 'Nacke',

  // Shoulders
  'shoulder_l': 'Vänster axel',
  'shoulder_r': 'Höger axel',
  'clavicle_l': 'Vänster axel',
  'clavicle_r': 'Höger axel',
  'scapula_l': 'Vänster axel',
  'scapula_r': 'Höger axel',

  // Arms
  'humerus_l': 'Vänster överarm',
  'humerus_r': 'Höger överarm',
  'upperarm_l': 'Vänster överarm',
  'upperarm_r': 'Höger överarm',

  // Elbows
  'elbow_l': 'Vänster armbåge',
  'elbow_r': 'Höger armbåge',

  // Forearms
  'radius_l': 'Vänster underarm',
  'radius_r': 'Höger underarm',
  'ulna_l': 'Vänster underarm',
  'ulna_r': 'Höger underarm',
  'forearm_l': 'Vänster underarm',
  'forearm_r': 'Höger underarm',

  // Wrists & Hands
  'wrist_l': 'Vänster handled',
  'wrist_r': 'Höger handled',
  'hand_l': 'Vänster hand',
  'hand_r': 'Höger hand',
  'carpal_l': 'Vänster handled',
  'carpal_r': 'Höger handled',

  // Spine
  'spine': 'Ländrygg',
  'thoracic': 'Övre rygg',
  'lumbar': 'Ländrygg',
  'vertebra': 'Ländrygg',

  // Chest
  'sternum': 'Bröst',
  'ribs': 'Bröst',
  'ribcage': 'Bröst',
  'chest': 'Bröst',

  // Pelvis & Hips
  'pelvis': 'Bäcken',
  'hip_l': 'Vänster höft',
  'hip_r': 'Höger höft',
  'ilium_l': 'Vänster höft',
  'ilium_r': 'Höger höft',

  // Thighs
  'femur_l': 'Vänster lår',
  'femur_r': 'Höger lår',
  'thigh_l': 'Vänster lår',
  'thigh_r': 'Höger lår',

  // Knees
  'knee_l': 'Vänster knä',
  'knee_r': 'Höger knä',
  'patella_l': 'Vänster knä',
  'patella_r': 'Höger knä',

  // Lower legs
  'tibia_l': 'Vänster underben',
  'tibia_r': 'Höger underben',
  'fibula_l': 'Vänster underben',
  'fibula_r': 'Höger underben',
  'shin_l': 'Vänster underben',
  'shin_r': 'Höger underben',
  'calf_l': 'Vänster vad',
  'calf_r': 'Höger vad',

  // Ankles & Feet
  'ankle_l': 'Vänster fotled',
  'ankle_r': 'Höger fotled',
  'foot_l': 'Vänster fot',
  'foot_r': 'Höger fot',
  'tarsal_l': 'Vänster fotled',
  'tarsal_r': 'Höger fotled',
};

// Find region from mesh name (fuzzy matching)
function findRegion(meshName: string): string | null {
  const nameLower = meshName.toLowerCase();

  // Direct match
  if (MESH_TO_REGION[nameLower]) {
    return MESH_TO_REGION[nameLower];
  }

  // Partial match
  for (const [key, region] of Object.entries(MESH_TO_REGION)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      return region;
    }
  }

  return null;
}

// Get pain color based on level
function getPainColor(level: number): THREE.Color {
  if (level <= 3) return new THREE.Color('#fcd34d'); // Yellow - mild
  if (level <= 6) return new THREE.Color('#fb923c'); // Orange - moderate
  return new THREE.Color('#ef4444'); // Red - severe
}

// Skeleton Model Component
function SkeletonModel({
  selected,
  onSelect,
  painLevels = {}
}: Skeleton3DProps) {
  const group = useRef<THREE.Group>(null);
  // Load with MeshoptDecoder for compressed models
  const gltf = useLoader(
    GLTFLoader,
    '/models/skeleton.glb',
    (loader) => loader.setMeshoptDecoder(MeshoptDecoder)
  );
  const scene = gltf.scene;
  const [hovered, setHovered] = useState<string | null>(null);
  const { gl } = useThree();

  // Clone scene to avoid modifying original
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  // Setup materials for each mesh - ensure ALL parts are visible
  useEffect(() => {
    // Debug: log all mesh names to console
    logger.debug('=== 3D Model Structure ===');

    clonedScene.traverse((child) => {
      // Force visibility on all objects
      child.visible = true;

      // Log object info for debugging
      if (child instanceof THREE.Mesh) {
        logger.debug('Mesh found:', child.name, 'visible:', child.visible);

        // Create new material for each mesh
        const baseMaterial = new THREE.MeshStandardMaterial({
          color: '#E8E4DC',
          roughness: 0.6,
          metalness: 0.1,
          transparent: false,
          opacity: 1,
          side: THREE.DoubleSide, // Render both sides of faces
        });

        child.material = baseMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Prevent culling
      }

      // Also handle groups/objects
      if (child instanceof THREE.Object3D) {
        child.visible = true;
      }
    });

    logger.debug('=== End Model Structure ===');
  }, [clonedScene]);

  // Update hover state
  useEffect(() => {
    gl.domElement.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered, gl]);

  // Gentle rotation animation
  useFrame((state) => {
    if (group.current) {
      // Subtle floating animation
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  // Update materials based on selection/hover/pain
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const region = findRegion(child.name);
        const isSelected = region === selected;
        const isHovered = child.name === hovered;
        const painLevel = region ? painLevels[region] : undefined;

        // Set color based on state
        if (painLevel) {
          child.material.color = getPainColor(painLevel);
          child.material.emissive = getPainColor(painLevel);
          child.material.emissiveIntensity = 0.3;
        } else if (isSelected) {
          child.material.color = new THREE.Color('#22d3ee');
          child.material.emissive = new THREE.Color('#22d3ee');
          child.material.emissiveIntensity = 0.4;
        } else if (isHovered) {
          child.material.color = new THREE.Color('#38bdf8');
          child.material.emissive = new THREE.Color('#38bdf8');
          child.material.emissiveIntensity = 0.2;
        } else {
          child.material.color = new THREE.Color('#E8E4DC');
          child.material.emissive = new THREE.Color('#000000');
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [clonedScene, selected, hovered, painLevels]);

  // Handle click on mesh
  const handleClick = (event: { stopPropagation: () => void; object: THREE.Object3D }) => {
    event.stopPropagation();
    const region = findRegion(event.object.name);
    if (region) {
      onSelect(region);
    }
  };

  // Handle hover
  const handlePointerOver = (event: { stopPropagation: () => void; object: THREE.Object3D }) => {
    event.stopPropagation();
    setHovered(event.object.name);
  };

  const handlePointerOut = () => {
    setHovered(null);
  };

  return (
    <group ref={group}>
      <primitive
        object={clonedScene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        scale={0.28}
        position={[0, 0.1, 0]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}

// Loading placeholder
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 1, 0.2]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  );
}

// Main exported component
const Skeleton3D: React.FC<Skeleton3DProps> = ({
  selected,
  onSelect,
  painLevels = {},
}) => {
  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl overflow-hidden border border-slate-700/50">
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 text-xs text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
        Dra för att rotera | Klicka för att välja
      </div>

      {/* Selected region indicator */}
      {selected && (
        <div className="absolute top-4 right-4 z-10 bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <span className="text-cyan-400 text-sm font-medium">{selected}</span>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} />
        <pointLight position={[0, 2, 2]} intensity={0.3} color="#22d3ee" />

        {/* Environment for reflections */}
        <Environment preset="studio" />

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={3}
          blur={2}
          far={4}
        />

        {/* Skeleton model */}
        <Suspense fallback={<LoadingFallback />}>
          <SkeletonModel
            selected={selected}
            onSelect={onSelect}
            painLevels={painLevels}
          />
        </Suspense>

        {/* Controls - only horizontal rotation */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={5}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Pain legend */}
      {Object.keys(painLevels).length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4 text-xs">
          <span className="text-slate-500">Smärtintensitet:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="text-slate-400">Mild</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span>
            <span className="text-slate-400">Måttlig</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-slate-400">Svår</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Preload the model with MeshoptDecoder
useLoader.preload(
  GLTFLoader,
  '/models/skeleton.glb',
  (loader) => loader.setMeshoptDecoder(MeshoptDecoder)
);

export default Skeleton3D;
