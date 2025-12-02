import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

// Anatomical body part definitions with 3D positions
interface BodyPartDef {
  id: string;
  label: string;
  position: [number, number, number];
  view: 'front' | 'back' | 'both';
}

const BODY_PARTS_3D: BodyPartDef[] = [
  // Head & Neck
  { id: 'Nacke', label: 'Nacke', position: [0, 1.55, 0], view: 'both' },

  // Upper body - Front
  { id: 'Axlar', label: 'Höger Axel', position: [-0.22, 1.4, 0.02], view: 'front' },
  { id: 'Axlar', label: 'Vänster Axel', position: [0.22, 1.4, 0.02], view: 'front' },
  { id: 'Bröstrygg', label: 'Bröst', position: [0, 1.25, 0.05], view: 'front' },
  { id: 'Armbåge', label: 'Höger Armbåge', position: [-0.35, 1.05, 0], view: 'front' },
  { id: 'Armbåge', label: 'Vänster Armbåge', position: [0.35, 1.05, 0], view: 'front' },
  { id: 'Handled', label: 'Höger Handled', position: [-0.42, 0.75, 0.02], view: 'front' },
  { id: 'Handled', label: 'Vänster Handled', position: [0.42, 0.75, 0.02], view: 'front' },

  // Lower body - Front
  { id: 'Ljumskar', label: 'Höger Ljumske', position: [-0.1, 0.9, 0.03], view: 'front' },
  { id: 'Ljumskar', label: 'Vänster Ljumske', position: [0.1, 0.9, 0.03], view: 'front' },
  { id: 'Knä', label: 'Höger Knä', position: [-0.12, 0.5, 0.03], view: 'front' },
  { id: 'Knä', label: 'Vänster Knä', position: [0.12, 0.5, 0.03], view: 'front' },
  { id: 'Underben', label: 'Höger Smalben', position: [-0.11, 0.3, 0.02], view: 'front' },
  { id: 'Underben', label: 'Vänster Smalben', position: [0.11, 0.3, 0.02], view: 'front' },
  { id: 'Fot', label: 'Höger Fot', position: [-0.1, 0.05, 0.05], view: 'front' },
  { id: 'Fot', label: 'Vänster Fot', position: [0.1, 0.05, 0.05], view: 'front' },

  // Back view
  { id: 'Skulderblad', label: 'Höger Skulderblad', position: [-0.15, 1.3, -0.05], view: 'back' },
  { id: 'Skulderblad', label: 'Vänster Skulderblad', position: [0.15, 1.3, -0.05], view: 'back' },
  { id: 'Ländrygg', label: 'Ländrygg', position: [0, 1.05, -0.05], view: 'back' },
  { id: 'Säte', label: 'Höger Säte', position: [-0.12, 0.88, -0.04], view: 'back' },
  { id: 'Säte', label: 'Vänster Säte', position: [0.12, 0.88, -0.04], view: 'back' },
  { id: 'Lår (Bak)', label: 'Höger Baksida Lår', position: [-0.12, 0.7, -0.03], view: 'back' },
  { id: 'Lår (Bak)', label: 'Vänster Baksida Lår', position: [0.12, 0.7, -0.03], view: 'back' },
  { id: 'Vad', label: 'Höger Vad', position: [-0.11, 0.35, -0.03], view: 'back' },
  { id: 'Vad', label: 'Vänster Vad', position: [0.11, 0.35, -0.03], view: 'back' },
  { id: 'Häl', label: 'Höger Häl', position: [-0.1, 0.08, -0.03], view: 'back' },
  { id: 'Häl', label: 'Vänster Häl', position: [0.1, 0.08, -0.03], view: 'back' },
];

// Realistic bone material
const createBoneMaterial = () => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e8dcc8'),
    roughness: 0.6,
    metalness: 0.1,
    envMapIntensity: 0.5,
  });
};

// Cartilage material (slightly blue tint)
const createCartilageMaterial = () => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c5d8e8'),
    roughness: 0.4,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });
};

// Human body silhouette
const BodySilhouette: React.FC = () => {
  return (
    <mesh position={[0, 0.95, 0]} castShadow>
      <capsuleGeometry args={[0.18, 1.1, 8, 16]} />
      <meshStandardMaterial
        color="#1a1a2e"
        transparent
        opacity={0.85}
        roughness={0.9}
      />
    </mesh>
  );
};

// Skull component
const Skull: React.FC<{ material: THREE.Material }> = ({ material }) => {
  return (
    <group position={[0, 1.72, 0]}>
      {/* Cranium */}
      <mesh material={material} castShadow>
        <sphereGeometry args={[0.095, 32, 24]} />
      </mesh>

      {/* Face/Maxilla */}
      <mesh position={[0, -0.06, 0.04]} material={material} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.06]} />
      </mesh>

      {/* Mandible (Jaw) */}
      <mesh position={[0, -0.11, 0.03]} material={material} castShadow>
        <boxGeometry args={[0.075, 0.04, 0.05]} />
      </mesh>

      {/* Eye sockets */}
      <mesh position={[-0.025, -0.02, 0.08]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      <mesh position={[0.025, -0.02, 0.08]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>

      {/* Nasal cavity */}
      <mesh position={[0, -0.05, 0.085]}>
        <boxGeometry args={[0.015, 0.025, 0.01]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>

      {/* Zygomatic bones (cheekbones) */}
      <mesh position={[-0.045, -0.03, 0.06]} material={material} castShadow>
        <sphereGeometry args={[0.02, 12, 12]} />
      </mesh>
      <mesh position={[0.045, -0.03, 0.06]} material={material} castShadow>
        <sphereGeometry args={[0.02, 12, 12]} />
      </mesh>
    </group>
  );
};

// Cervical Spine (Neck)
const CervicalSpine: React.FC<{ material: THREE.Material }> = ({ material }) => {
  const vertebrae = [];
  for (let i = 0; i < 7; i++) {
    vertebrae.push(
      <group key={i} position={[0, 1.58 - i * 0.022, 0]}>
        {/* Vertebral body */}
        <mesh material={material} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.018, 8]} />
        </mesh>
        {/* Spinous process */}
        <mesh position={[0, 0, -0.015]} material={material} castShadow>
          <boxGeometry args={[0.006, 0.012, 0.015]} />
        </mesh>
      </group>
    );
  }
  return <group>{vertebrae}</group>;
};

// Thoracic Cage (Ribcage)
const ThoracicCage: React.FC<{ material: THREE.Material; cartilageMaterial: THREE.Material }> = ({ material, cartilageMaterial }) => {
  const ribs = [];

  // 12 pairs of ribs
  for (let i = 0; i < 12; i++) {
    const y = 1.4 - i * 0.028;
    const ribWidth = 0.15 - Math.abs(i - 5) * 0.008;
    const ribDepth = 0.08 + i * 0.003;

    // Left rib
    ribs.push(
      <group key={`left-${i}`}>
        <mesh position={[-ribWidth * 0.5, y, ribDepth * 0.3]} rotation={[0, 0.3, -0.2 - i * 0.02]} material={material} castShadow>
          <torusGeometry args={[ribWidth * 0.6, 0.005, 8, 24, Math.PI * 0.6]} />
        </mesh>
        {/* Costal cartilage for upper ribs */}
        {i < 7 && (
          <mesh position={[-0.03, y - 0.01, 0.07]} material={cartilageMaterial}>
            <boxGeometry args={[0.04, 0.006, 0.008]} />
          </mesh>
        )}
      </group>
    );

    // Right rib
    ribs.push(
      <group key={`right-${i}`}>
        <mesh position={[ribWidth * 0.5, y, ribDepth * 0.3]} rotation={[0, -0.3, 0.2 + i * 0.02]} material={material} castShadow>
          <torusGeometry args={[ribWidth * 0.6, 0.005, 8, 24, Math.PI * 0.6]} />
        </mesh>
        {i < 7 && (
          <mesh position={[0.03, y - 0.01, 0.07]} material={cartilageMaterial}>
            <boxGeometry args={[0.04, 0.006, 0.008]} />
          </mesh>
        )}
      </group>
    );
  }

  // Sternum
  ribs.push(
    <mesh key="sternum" position={[0, 1.28, 0.08]} material={material} castShadow>
      <boxGeometry args={[0.035, 0.18, 0.015]} />
    </mesh>
  );

  // Thoracic vertebrae
  for (let i = 0; i < 12; i++) {
    ribs.push(
      <group key={`t-vert-${i}`} position={[0, 1.4 - i * 0.028, -0.02]}>
        <mesh material={material} castShadow>
          <cylinderGeometry args={[0.015, 0.016, 0.022, 8]} />
        </mesh>
        <mesh position={[0, 0, -0.018]} material={material} castShadow>
          <boxGeometry args={[0.008, 0.015, 0.02]} />
        </mesh>
      </group>
    );
  }

  return <group>{ribs}</group>;
};

// Lumbar Spine
const LumbarSpine: React.FC<{ material: THREE.Material }> = ({ material }) => {
  const vertebrae = [];
  for (let i = 0; i < 5; i++) {
    vertebrae.push(
      <group key={i} position={[0, 1.05 - i * 0.032, 0]}>
        {/* Larger vertebral body */}
        <mesh material={material} castShadow>
          <cylinderGeometry args={[0.022, 0.024, 0.028, 8]} />
        </mesh>
        {/* Spinous process */}
        <mesh position={[0, 0, -0.025]} material={material} castShadow>
          <boxGeometry args={[0.01, 0.02, 0.025]} />
        </mesh>
        {/* Transverse processes */}
        <mesh position={[-0.03, 0, -0.01]} rotation={[0, 0, 0.3]} material={material} castShadow>
          <boxGeometry args={[0.025, 0.008, 0.008]} />
        </mesh>
        <mesh position={[0.03, 0, -0.01]} rotation={[0, 0, -0.3]} material={material} castShadow>
          <boxGeometry args={[0.025, 0.008, 0.008]} />
        </mesh>
      </group>
    );
  }
  return <group>{vertebrae}</group>;
};

// Pelvis
const Pelvis: React.FC<{ material: THREE.Material }> = ({ material }) => {
  return (
    <group position={[0, 0.88, 0]}>
      {/* Sacrum */}
      <mesh position={[0, 0, -0.02]} rotation={[0.2, 0, 0]} material={material} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.025]} />
      </mesh>

      {/* Left Ilium (hip bone) */}
      <mesh position={[-0.1, 0.02, 0]} rotation={[0, -0.3, 0.1]} material={material} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
      </mesh>

      {/* Right Ilium */}
      <mesh position={[0.1, 0.02, 0]} rotation={[0, 0.3, -0.1]} material={material} castShadow>
        <boxGeometry args={[0.12, 0.1, 0.02]} />
      </mesh>

      {/* Left Ischium */}
      <mesh position={[-0.07, -0.06, 0.01]} material={material} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
      </mesh>

      {/* Right Ischium */}
      <mesh position={[0.07, -0.06, 0.01]} material={material} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
      </mesh>

      {/* Pubic symphysis */}
      <mesh position={[0, -0.05, 0.04]} material={material} castShadow>
        <boxGeometry args={[0.05, 0.025, 0.015]} />
      </mesh>

      {/* Acetabulum (hip sockets) */}
      <mesh position={[-0.1, -0.02, 0.02]} material={material}>
        <torusGeometry args={[0.025, 0.008, 8, 16]} />
      </mesh>
      <mesh position={[0.1, -0.02, 0.02]} material={material}>
        <torusGeometry args={[0.025, 0.008, 8, 16]} />
      </mesh>
    </group>
  );
};

// Clavicles and Scapulae
const ShoulderGirdle: React.FC<{ material: THREE.Material }> = ({ material }) => {
  return (
    <group>
      {/* Left Clavicle */}
      <mesh position={[-0.1, 1.45, 0.04]} rotation={[0, 0, 0.2]} material={material} castShadow>
        <capsuleGeometry args={[0.006, 0.1, 4, 8]} />
      </mesh>

      {/* Right Clavicle */}
      <mesh position={[0.1, 1.45, 0.04]} rotation={[0, 0, -0.2]} material={material} castShadow>
        <capsuleGeometry args={[0.006, 0.1, 4, 8]} />
      </mesh>

      {/* Left Scapula */}
      <group position={[-0.12, 1.32, -0.04]} rotation={[0.1, 0.2, 0]}>
        <mesh material={material} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.01]} />
        </mesh>
        {/* Spine of scapula */}
        <mesh position={[0, 0.025, -0.01]} rotation={[0.3, 0, 0]} material={material} castShadow>
          <boxGeometry args={[0.07, 0.01, 0.02]} />
        </mesh>
      </group>

      {/* Right Scapula */}
      <group position={[0.12, 1.32, -0.04]} rotation={[0.1, -0.2, 0]}>
        <mesh material={material} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.01]} />
        </mesh>
        <mesh position={[0, 0.025, -0.01]} rotation={[0.3, 0, 0]} material={material} castShadow>
          <boxGeometry args={[0.07, 0.01, 0.02]} />
        </mesh>
      </group>
    </group>
  );
};

// Arm bones
const Arm: React.FC<{ side: 'left' | 'right'; material: THREE.Material }> = ({ side, material }) => {
  const xMult = side === 'left' ? -1 : 1;

  return (
    <group>
      {/* Humerus */}
      <mesh position={[xMult * 0.24, 1.25, 0]} rotation={[0, 0, xMult * 0.15]} material={material} castShadow>
        <capsuleGeometry args={[0.015, 0.22, 4, 8]} />
      </mesh>

      {/* Humeral head */}
      <mesh position={[xMult * 0.2, 1.38, 0]} material={material} castShadow>
        <sphereGeometry args={[0.022, 12, 12]} />
      </mesh>

      {/* Elbow joint */}
      <mesh position={[xMult * 0.3, 1.08, 0]} material={material} castShadow>
        <sphereGeometry args={[0.018, 12, 12]} />
      </mesh>

      {/* Radius */}
      <mesh position={[xMult * 0.35, 0.9, 0.015]} rotation={[0.1, 0, xMult * 0.1]} material={material} castShadow>
        <capsuleGeometry args={[0.008, 0.2, 4, 8]} />
      </mesh>

      {/* Ulna */}
      <mesh position={[xMult * 0.34, 0.9, -0.01]} rotation={[0, 0, xMult * 0.1]} material={material} castShadow>
        <capsuleGeometry args={[0.009, 0.22, 4, 8]} />
      </mesh>

      {/* Wrist bones (carpals) */}
      <mesh position={[xMult * 0.38, 0.75, 0]} material={material} castShadow>
        <boxGeometry args={[0.03, 0.02, 0.02]} />
      </mesh>

      {/* Hand (metacarpals simplified) */}
      <group position={[xMult * 0.4, 0.68, 0]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.012, 0, 0]} rotation={[0, 0, xMult * 0.05]} material={material} castShadow>
            <capsuleGeometry args={[0.004, 0.06, 4, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Leg bones
const Leg: React.FC<{ side: 'left' | 'right'; material: THREE.Material }> = ({ side, material }) => {
  const xMult = side === 'left' ? -1 : 1;

  return (
    <group>
      {/* Femur head */}
      <mesh position={[xMult * 0.1, 0.82, 0.01]} material={material} castShadow>
        <sphereGeometry args={[0.028, 16, 16]} />
      </mesh>

      {/* Femur shaft */}
      <mesh position={[xMult * 0.11, 0.65, 0.01]} rotation={[0, 0, xMult * 0.05]} material={material} castShadow>
        <capsuleGeometry args={[0.018, 0.3, 4, 8]} />
      </mesh>

      {/* Femoral condyles (knee) */}
      <mesh position={[xMult * 0.115, 0.5, 0.02]} material={material} castShadow>
        <sphereGeometry args={[0.025, 12, 12]} />
      </mesh>

      {/* Patella (kneecap) */}
      <mesh position={[xMult * 0.115, 0.5, 0.05]} material={material} castShadow>
        <sphereGeometry args={[0.015, 12, 12]} />
      </mesh>

      {/* Tibia */}
      <mesh position={[xMult * 0.11, 0.28, 0.02]} rotation={[0.02, 0, xMult * 0.02]} material={material} castShadow>
        <capsuleGeometry args={[0.016, 0.32, 4, 8]} />
      </mesh>

      {/* Fibula */}
      <mesh position={[xMult * 0.13, 0.28, 0]} rotation={[0, 0, xMult * 0.02]} material={material} castShadow>
        <capsuleGeometry args={[0.007, 0.3, 4, 8]} />
      </mesh>

      {/* Ankle (malleoli) */}
      <mesh position={[xMult * 0.11, 0.1, 0.02]} material={material} castShadow>
        <sphereGeometry args={[0.018, 12, 12]} />
      </mesh>

      {/* Foot (tarsals & metatarsals) */}
      <group position={[xMult * 0.1, 0.04, 0.04]}>
        {/* Calcaneus (heel) */}
        <mesh position={[0, 0, -0.03]} material={material} castShadow>
          <boxGeometry args={[0.03, 0.025, 0.04]} />
        </mesh>
        {/* Talus */}
        <mesh position={[0, 0.01, 0]} material={material} castShadow>
          <sphereGeometry args={[0.015, 10, 10]} />
        </mesh>
        {/* Metatarsals */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - 2) * 0.01, 0, 0.04 + i * 0.005]} rotation={[0.4, 0, 0]} material={material} castShadow>
            <capsuleGeometry args={[0.004, 0.04, 4, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Complete Skeleton
const Skeleton: React.FC = () => {
  const boneMaterial = useMemo(() => createBoneMaterial(), []);
  const cartilageMaterial = useMemo(() => createCartilageMaterial(), []);

  return (
    <group position={[0, -0.95, 0]}>
      <Skull material={boneMaterial} />
      <CervicalSpine material={boneMaterial} />
      <ShoulderGirdle material={boneMaterial} />
      <ThoracicCage material={boneMaterial} cartilageMaterial={cartilageMaterial} />
      <LumbarSpine material={boneMaterial} />
      <Pelvis material={boneMaterial} />
      <Arm side="left" material={boneMaterial} />
      <Arm side="right" material={boneMaterial} />
      <Leg side="left" material={boneMaterial} />
      <Leg side="right" material={boneMaterial} />
    </group>
  );
};

// Interactive hotspot
interface HotspotProps {
  position: [number, number, number];
  label: string;
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isVisible: boolean;
}

const Hotspot: React.FC<HotspotProps> = ({ position, label, id, isSelected, onSelect, isVisible }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isSelected ? 1.5 : hovered ? 1.3 : 1;
      meshRef.current.scale.setScalar(scale);

      // Pulse animation
      if (isSelected) {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
        meshRef.current.scale.setScalar(scale * pulse);
      }
    }
  });

  if (!isVisible) return null;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#22d3ee' : hovered ? '#38bdf8' : '#0ea5e9'}
          emissive={isSelected ? '#22d3ee' : hovered ? '#0ea5e9' : '#0369a1'}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Glow effect */}
      <mesh scale={isSelected ? 2 : hovered ? 1.5 : 0}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} />
      </mesh>

      {/* Label on hover */}
      {(hovered || isSelected) && (
        <Html
          position={[0.08, 0.02, 0]}
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="bg-black/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-400/50 shadow-lg backdrop-blur-sm">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

// Camera controller for view switching
interface CameraControllerProps {
  view: 'front' | 'back' | 'side';
}

const CameraController: React.FC<CameraControllerProps> = ({ view }) => {
  const { camera } = useThree();

  useFrame(() => {
    const targetPosition = view === 'front'
      ? new THREE.Vector3(0, 0.8, 2)
      : view === 'back'
        ? new THREE.Vector3(0, 0.8, -2)
        : new THREE.Vector3(2, 0.8, 0);

    camera.position.lerp(targetPosition, 0.05);
    camera.lookAt(0, 0.8, 0);
  });

  return null;
};

// Main component
interface RealisticSkeleton3DProps {
  selected: string;
  onSelect: (part: string) => void;
}

const RealisticSkeleton3D: React.FC<RealisticSkeleton3DProps> = ({ selected, onSelect }) => {
  const [view, setView] = useState<'front' | 'back' | 'side'>('front');
  const [autoRotate, setAutoRotate] = useState(false);

  // Filter hotspots based on current view
  const visibleParts = useMemo(() => {
    return BODY_PARTS_3D.filter(part => {
      if (part.view === 'both') return true;
      if (view === 'side') return true;
      return part.view === view;
    });
  }, [view]);

  const infoText = selected ? (
    {
      'Nacke': 'Cervikalgi, Whiplash, Diskbråck eller Spänningshuvudvärk.',
      'Axlar': 'Impingement, Rotatorcuff-ruptur, Frozen Shoulder eller AC-led.',
      'Bröstrygg': 'Thorakal segmentell dysfunktion, "Låsning" eller Stress.',
      'Armbåge': 'Lateral epikondylit (Tennis), Medial (Golf) eller Bursit.',
      'Handled': 'Karpaltunnelsyndrom, TFCC-skada eller Överbelastning.',
      'Ländrygg': 'Lumbago (Ryggskott), Ischias, Diskbråck eller Spinal stenos.',
      'Ljumskar': 'FAI (Impingement), Adduktor-tendinopati eller Sportbråck.',
      'Säte': 'Gluteal tendinopati, Piriformis-syndrom eller Höftledsartros.',
      'Lår (Bak)': 'Hamstrings-ruptur/tendinopati (Löparskada).',
      'Knä': 'Patellofemoralt smärtsyndrom (PFSS), Menisk, Korsband eller Artros.',
      'Underben': 'Medialt Tibialt Stressyndrom (Benhinnor) eller Kompartment.',
      'Vad': 'Gastrocnemius-ruptur (Gubbvad) eller Akillestendinopati.',
      'Häl': 'Plantar fasciit (Hälsporre), Haglunds häl eller Fettkudde.',
      'Fot': 'Metatarsalgi, Morton\'s neurom eller Fotledsstukning.',
      'Skulderblad': 'Skulderbladsdysfunktion, Muskelspänning eller Snapping scapula.'
    }[selected.split(' ')[0]] || null
  ) : null;

  return (
    <div className="relative w-full h-[550px] bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800 ring-4 ring-slate-100">
      {/* View controls */}
      <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
        <button
          onClick={() => setView('front')}
          className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${
            view === 'front'
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-white/10 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          Framsida
        </button>
        <button
          onClick={() => setView('back')}
          className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${
            view === 'back'
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-white/10 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          Baksida
        </button>
        <button
          onClick={() => setView('side')}
          className={`px-3 py-2 text-xs font-bold rounded-xl border backdrop-blur-md transition-all ${
            view === 'side'
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-white/10 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          Sida
        </button>
      </div>

      {/* Rotate toggle */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
            autoRotate
              ? 'bg-cyan-500 text-black border-cyan-400'
              : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
          }`}
          title={autoRotate ? 'Stoppa rotation' : 'Auto-rotera'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Info HUD */}
      {selected && infoText && (
        <div className="absolute bottom-6 left-6 right-6 z-40 bg-black/90 backdrop-blur-md border border-cyan-500/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-cyan-900/50 rounded-lg text-cyan-400 mt-1 border border-cyan-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">{selected}</h4>
              <p className="text-gray-300 text-xs leading-relaxed">{infoText}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0.8, 2], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <pointLight position={[0, 2, 2]} intensity={0.3} color="#87ceeb" />

          {/* Environment for realistic reflections */}
          <Environment preset="studio" />

          {/* Human body silhouette */}
          <BodySilhouette />

          {/* Skeleton */}
          <Skeleton />

          {/* Interactive hotspots */}
          {visibleParts.map((part, idx) => (
            <Hotspot
              key={`${part.id}-${idx}`}
              position={part.position}
              label={part.label}
              id={part.id}
              isSelected={selected === part.id}
              onSelect={onSelect}
              isVisible={true}
            />
          ))}

          {/* Floor shadow */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.4}
            scale={3}
            blur={2.5}
            far={1}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1}
            maxDistance={4}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
          />

          {/* Camera animation for view switching */}
          <CameraController view={view} />
        </Suspense>
      </Canvas>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/30 text-sm font-medium" id="loading-indicator">
          Laddar 3D-modell...
        </div>
      </div>
    </div>
  );
};

export default RealisticSkeleton3D;
