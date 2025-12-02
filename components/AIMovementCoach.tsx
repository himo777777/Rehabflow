
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, RefreshCw, AlertTriangle, Activity, BrainCircuit, Layers, Zap, Trophy, Timer, ScanLine, Target } from 'lucide-react';
// Use namespace imports to handle potential ESM/CJS interop issues with MediaPipe
import * as poseLib from '@mediapipe/pose';
import * as cameraUtils from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

interface AIMovementCoachProps {
  exerciseName: string;
  videoUrl?: string; 
  onClose: () => void;
}

type ExerciseMode = 'LEGS' | 'PRESS' | 'PULL' | 'LUNGE' | 'GENERAL';

// --- 3D MATH HELPERS ---
interface Point3D { x: number; y: number; z: number; }
interface Point2D { x: number; y: number; scale: number; }

const project = (p: Point3D, width: number, height: number, scale: number): Point2D => {
    const fov = 300;
    const cameraZ = 400;
    const factor = fov / (cameraZ + p.z);
    const x2d = p.x * factor * scale + width / 2;
    const y2d = p.y * factor * scale + height / 2;
    return { x: x2d, y: y2d, scale: factor * scale };
};

const rotateY = (p: Point3D, angle: number): Point3D => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: p.x * cos - p.z * sin,
        y: p.y,
        z: p.x * sin + p.z * cos
    };
};

// --- PROCEDURAL 3D AVATAR (THE DEMONSTRATOR) ---
const ProceduralAvatar = ({ mode }: { mode: ExerciseMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const startTime = Date.now();

        // REHAB TEMPO: 3s down, 1s hold, 1s up
        const getProgress = (time: number) => {
            const cycle = time % 5;
            if (cycle < 3) return { val: (1 - Math.cos((cycle / 3) * Math.PI)) / 2, phase: 'ECCENTRIC' };
            else if (cycle < 4) return { val: 1, phase: 'HOLD' };
            else {
                const t = cycle - 4;
                return { val: 1 - ((1 - Math.cos(t * Math.PI)) / 2), phase: 'CONCENTRIC' };
            }
        };

        const drawCylinder = (p1: Point2D, p2: Point2D, color: string, thickness: number, glow: boolean = false, isReflection = false, pulseOffset: number = 0) => {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const angle = Math.atan2(dy, dx);

            ctx.save();
            ctx.translate(p1.x, p1.y);
            ctx.rotate(angle);

            // Glow effect for active muscles
            if (glow && !isReflection) {
                ctx.shadowBlur = 25;
                ctx.shadowColor = color;
                ctx.globalAlpha = 1;
            } else if (isReflection) {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.15; // Faint reflection
                ctx.scale(1, -1);
            } else {
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.9;
            }

            // Draw "Bone/Muscle" as a gradient cylinder with metallic look
            const grad = ctx.createLinearGradient(0, -thickness/2, 0, thickness/2);
            if (isReflection) {
                grad.addColorStop(0, color);
                grad.addColorStop(1, 'transparent');
            } else {
                grad.addColorStop(0, '#020617'); // Deep shadow
                grad.addColorStop(0.2, color);   // Base color
                grad.addColorStop(0.4, '#f8fafc'); // Specular highlight (Shininess)
                grad.addColorStop(0.6, color); 
                grad.addColorStop(1, '#020617');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Rounded caps
            ctx.roundRect(0, -thickness/2, len, thickness, thickness/2);
            ctx.fill();
            
            // --- NEW: MUSCLE FIBERS & BONE CORE ---
            if (!isReflection) {
                // 1. Bone Core (X-Ray look)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.roundRect(5, -thickness/6, len-10, thickness/3, thickness/6);
                ctx.fill();

                // 2. Muscle Striations (Fibers)
                if (thickness > 10) {
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                    ctx.lineWidth = 1;
                    for(let i=-thickness/2 + 3; i<thickness/2; i+=4) {
                        if (Math.abs(i) < thickness/6) continue; // Skip bone core area
                        ctx.beginPath();
                        ctx.moveTo(0, i);
                        ctx.lineTo(len, i);
                        ctx.stroke();
                    }
                    
                    // 3. Synaptic Pulse (Energy Wave)
                    if (glow) {
                        const pulseX = (pulseOffset % 1) * len;
                        const pulseGrad = ctx.createLinearGradient(pulseX-20, 0, pulseX+20, 0);
                        pulseGrad.addColorStop(0, 'transparent');
                        pulseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
                        pulseGrad.addColorStop(1, 'transparent');
                        ctx.fillStyle = pulseGrad;
                        ctx.fillRect(0, -thickness/2, len, thickness);
                    }
                    ctx.globalCompositeOperation = 'source-over';
                }

                // Joint Nodes (Mechanical look)
                ctx.beginPath();
                ctx.arc(0, 0, thickness/1.6, 0, Math.PI*2);
                const nodeGrad = ctx.createRadialGradient(0,0, 0, 0,0, thickness/1.6);
                nodeGrad.addColorStop(0, '#e2e8f0');
                nodeGrad.addColorStop(0.5, '#475569');
                nodeGrad.addColorStop(1, '#0f172a');
                ctx.fillStyle = nodeGrad;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#94a3b8'; // Outer rim
                ctx.stroke();
            }

            ctx.restore();
        };

        const renderSkeleton = (p2d: Record<string, Point2D>, width: number, height: number, time: number, progress: number, phase: string, isReflection: boolean) => {
             // MUSCLE ACTIVATION COLORS
            let legColor = isReflection ? '#475569' : '#0ea5e9'; 
            let armColor = isReflection ? '#475569' : '#0ea5e9';
            let torsoColor = isReflection ? '#64748b' : '#64748b';
            
            const activeColor = '#f59e0b'; // Magma Orange/Amber for heat
            const pulse = (Date.now() / 1000);

            if (mode === 'LEGS' || mode === 'LUNGE') {
                if (phase === 'CONCENTRIC') legColor = activeColor;
            } 
            else if (mode === 'PRESS') {
                if (phase === 'CONCENTRIC') armColor = activeColor;
            }
            else if (mode === 'PULL') {
                if (phase === 'CONCENTRIC') torsoColor = activeColor;
            }

            if (isReflection) {
                // Dim colors for reflection
                legColor = legColor === activeColor ? '#7f1d1d' : '#334155';
                armColor = armColor === activeColor ? '#7f1d1d' : '#334155';
                torsoColor = torsoColor === activeColor ? '#7f1d1d' : '#334155';
            }

            // Draw Limbs
            // Spine
            drawCylinder(p2d.neck, {x: (p2d.lHip.x+p2d.rHip.x)/2, y: (p2d.lHip.y+p2d.rHip.y)/2, scale: 1}, torsoColor, 35 * p2d.lHip.scale, mode==='PULL' && phase==='CONCENTRIC', isReflection, pulse);

            // Legs
            drawCylinder(p2d.lHip, p2d.lKnee, legColor, 28 * p2d.lKnee.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.lKnee, p2d.lAnkle, legColor, 22 * p2d.lAnkle.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rHip, p2d.rKnee, legColor, 28 * p2d.rKnee.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rKnee, p2d.rAnkle, legColor, 22 * p2d.rAnkle.scale, (mode==='LEGS' || mode==='LUNGE') && phase === 'CONCENTRIC', isReflection, pulse);

            // Arms
            drawCylinder(p2d.lShldr, p2d.lElbow, armColor, 20 * p2d.lElbow.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.lElbow, p2d.lHand, armColor, 16 * p2d.lHand.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rShldr, p2d.rElbow, armColor, 20 * p2d.rElbow.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);
            drawCylinder(p2d.rElbow, p2d.rHand, armColor, 16 * p2d.rHand.scale, (mode==='PRESS' || mode==='PULL') && phase === 'CONCENTRIC', isReflection, pulse);

            if (!isReflection) {
                // Head (Visor Style)
                ctx.beginPath();
                ctx.arc(p2d.head.x, p2d.head.y, 30 * p2d.head.scale, 0, Math.PI * 2);
                ctx.fillStyle = '#0f172a';
                ctx.fill();
                // Visor
                ctx.beginPath();
                ctx.ellipse(p2d.head.x, p2d.head.y, 25 * p2d.head.scale, 15 * p2d.head.scale, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
                ctx.fill();
            }
        };

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const time = (Date.now() - startTime) / 1000;
            const { val: progress, phase } = getProgress(time); // 0 (start) to 1 (end range)
            
            // "Living" Breath Animation (Idle movement)
            const breath = Math.sin(time * 2) * 2; 

            // Camera Rotation (Dynamic view)
            const rotAngle = Math.sin(time * 0.2) * 0.3; 

            // --- 3D SKELETON RIG ---
            const hipY = 50;
            const shoulderY = -150 + breath; // Breathing effect
            const kneeY = 250;
            const ankleY = 400;
            
            const hipW = 40;
            const shoulderW = 60;

            // Default T-Pose / Standing
            let joints: Record<string, Point3D> = {
                head: { x: 0, y: -220 + breath, z: 0 },
                neck: { x: 0, y: shoulderY, z: 0 },
                lShldr: { x: -shoulderW, y: shoulderY, z: 0 },
                rShldr: { x: shoulderW, y: shoulderY, z: 0 },
                lHip: { x: -hipW, y: hipY, z: 0 },
                rHip: { x: hipW, y: hipY, z: 0 },
                lKnee: { x: -hipW, y: kneeY, z: 0 },
                rKnee: { x: hipW, y: kneeY, z: 0 },
                lAnkle: { x: -hipW, y: ankleY, z: 0 },
                rAnkle: { x: hipW, y: ankleY, z: 0 },
                lElbow: { x: -shoulderW - 10, y: shoulderY + 100, z: 0 },
                rElbow: { x: shoulderW + 10, y: shoulderY + 100, z: 0 },
                lHand: { x: -shoulderW - 10, y: shoulderY + 200, z: 0 },
                rHand: { x: shoulderW + 10, y: shoulderY + 200, z: 0 },
            };

            // --- BIO-MECHANICAL ANIMATION LOGIC ---
            
            if (mode === 'LEGS') {
                // SQUAT MECHANICS
                const squatDepth = progress * 150;
                const hipZ = progress * 100;
                
                joints.lHip.y += squatDepth; joints.rHip.y += squatDepth;
                joints.lHip.z += hipZ; joints.rHip.z += hipZ;
                
                const kneeZ = progress * -50; 
                joints.lKnee.y += squatDepth * 0.5; joints.rKnee.y += squatDepth * 0.5;
                joints.lKnee.z += kneeZ; joints.rKnee.z += kneeZ;
                joints.lKnee.x -= progress * 15; joints.rKnee.x += progress * 15; 

                const lean = progress * 80;
                joints.neck.z += lean; joints.head.z += lean;
                joints.lShldr.z += lean; joints.rShldr.z += lean;
                joints.neck.y += squatDepth; joints.head.y += squatDepth;
                joints.lShldr.y += squatDepth; joints.rShldr.y += squatDepth;

                joints.lElbow.z -= 100 * progress; joints.rElbow.z -= 100 * progress;
                joints.lElbow.y = joints.lShldr.y + 50; joints.rElbow.y = joints.rShldr.y + 50;
                joints.lHand.z -= 180 * progress; joints.rHand.z -= 180 * progress;
                joints.lHand.y = joints.lShldr.y; joints.rHand.y = joints.rShldr.y;
            } 
            
            else if (mode === 'LUNGE') {
                // SPLIT SQUAT MECHANICS
                const depth = progress * 120;
                joints.lHip.z -= 100; joints.lKnee.z -= 100; joints.lAnkle.z -= 100;
                joints.rHip.z += 100; joints.rKnee.z += 100; joints.rAnkle.z += 180;
                joints.lHip.y += depth; joints.rHip.y += depth;
                joints.lKnee.y += depth * 0.6; joints.lKnee.z += progress * 40;
                joints.rKnee.y += depth * 0.8; joints.rKnee.z += progress * 20;
                joints.neck.y += depth; joints.head.y += depth;
                joints.lShldr.y += depth; joints.rShldr.y += depth;
            }

            else if (mode === 'PRESS') {
                // SHOULDER PRESS
                const pressHeight = progress * 180;
                const startY = shoulderY - 20;
                joints.lHand.y = startY - pressHeight;
                joints.rHand.y = startY - pressHeight;
                joints.lHand.x = joints.lShldr.x; joints.rHand.x = joints.rShldr.x; 
                joints.lElbow.y = (joints.lShldr.y + joints.lHand.y) / 2;
                joints.rElbow.y = (joints.rShldr.y + joints.rHand.y) / 2;
                joints.lElbow.x = joints.lShldr.x - 40 * (1-progress); 
                joints.rElbow.x = joints.rShldr.x + 40 * (1-progress);
            }

            else if (mode === 'PULL') {
                // BENT OVER ROW
                const hinge = 45 * (Math.PI/180);
                const pull = progress * 100;
                const torsoLength = 200;
                const zLean = Math.sin(hinge) * torsoLength;
                const yDrop = (1 - Math.cos(hinge)) * torsoLength;
                joints.neck.z += zLean; joints.head.z += zLean + 20;
                joints.neck.y += yDrop; joints.head.y += yDrop;
                joints.lShldr.z += zLean; joints.rShldr.z += zLean;
                joints.lShldr.y += yDrop; joints.rShldr.y += yDrop;
                joints.lHand.x = joints.lShldr.x; joints.rHand.x = joints.rShldr.x;
                joints.lHand.y = joints.lShldr.y + 150 - (pull * 0.8); joints.rHand.y = joints.rShldr.y + 150 - (pull * 0.8);
                joints.lElbow.z = joints.lShldr.z + pull * 1.5; joints.rElbow.z = joints.rShldr.z + pull * 1.5;
                joints.lElbow.y = joints.lShldr.y + 20; joints.rElbow.y = joints.rShldr.y + 20;
            }

            // --- RENDERING PIPELINE ---
            ctx.clearRect(0, 0, width, height);
            
            // 1. Draw Background Grid (Floor)
            const gridZOffset = (time * 50) % 200;
            
            // Horizon/Floor Fade
            const gradient = ctx.createLinearGradient(0, height/2, 0, height);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
            gradient.addColorStop(1, 'rgba(6, 182, 212, 0.15)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, height/2, width, height/2);

            // Moving Floor Lines
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
            ctx.beginPath();
            for(let z = -200; z < 1000; z+=200) {
                const zPos = z - gridZOffset;
                if (zPos < -300) continue; 
                const p1 = project(rotateY({x: -800, y: 500, z: zPos}, rotAngle), width, height, 1);
                const p2 = project(rotateY({x: 800, y: 500, z: zPos}, rotAngle), width, height, 1);
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            }
            // Vertical Grid Lines
            for(let x = -600; x <= 600; x+=200) {
                const p1 = project(rotateY({x: x, y: 500, z: -200}, rotAngle), width, height, 1);
                const p2 = project(rotateY({x: x, y: 500, z: 800}, rotAngle), width, height, 1);
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            }
            ctx.stroke();
            
            // Floor Ripples (Impact)
            if (phase === 'CONCENTRIC') {
                const rippleSize = (progress * 100) % 100;
                const p = project(rotateY({x: 0, y: 500, z: 0}, rotAngle), width, height, 1);
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, rippleSize*3, rippleSize, 0, 0, Math.PI*2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${1-progress})`;
                ctx.stroke();
            }

            // 2. Project and Sort Joints
            const p2d: Record<string, Point2D> = {};
            // Reflection joints
            const p2dReflect: Record<string, Point2D> = {};
            
            for (const [key, p3d] of Object.entries(joints)) {
                p2d[key] = project(rotateY(p3d, rotAngle), width, height, 1);
                // Reflection points (inverted Y relative to floor)
                const floorY = 500;
                const dy = floorY - p3d.y;
                p2dReflect[key] = project(rotateY({ ...p3d, y: floorY + dy }, rotAngle), width, height, 1);
            }

            // 3. Draw Reflection (First, so it's behind)
            renderSkeleton(p2dReflect, width, height, time, progress, phase, true);

            // 4. Draw Main Body
            renderSkeleton(p2d, width, height, time, progress, phase, false);

            // Phase Text
            ctx.font = "bold 14px monospace";
            ctx.fillStyle = phase === 'CONCENTRIC' ? '#f59e0b' : phase === 'HOLD' ? '#22c55e' : '#3b82f6';
            ctx.fillText(phase, 20, height - 20);

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [mode]);

    return <canvas ref={canvasRef} width={600} height={800} className="w-full h-full object-cover" />;
};

interface Particle {
    x: number; y: number; vx: number; vy: number; life: number; color: string;
}

const AIMovementCoach: React.FC<AIMovementCoachProps> = ({ exerciseName, videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Calibration State
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationCounter, setCalibrationCounter] = useState(0);
  const [targetMetrics, setTargetMetrics] = useState<{shoulderY: number, hipY: number}>({shoulderY: 0, hipY: 0});

  // HUD State
  const [feedback, setFeedback] = useState("Väntar på kamera...");
  const [reps, setReps] = useState(0);
  const [activeIssues, setActiveIssues] = useState<string[]>([]);
  const [formScore, setFormScore] = useState(100);
  const [velocity, setVelocity] = useState(0); // For velocity bar
  
  const [motionState, setMotionState] = useState<'START' | 'ECCENTRIC' | 'TURN' | 'CONCENTRIC'>('START');
  const [isMuted, setIsMuted] = useState(false);
  const lastSpoke = useRef(0);
  const lastRepTime = useRef(Date.now());
  const landmarkHistory = useRef<any[]>([]); // Store history for trails
  const particles = useRef<Particle[]>([]); // Store particles for rewards
  const torqueRotation = useRef(0); // For spinning rings

  const exerciseMode: ExerciseMode = useMemo(() => {
      const name = exerciseName.toLowerCase();
      if (name.match(/utfall|lunge|split/)) return 'LUNGE';
      if (name.match(/knä|ben|squat|hopp|wad|vad/)) return 'LEGS';
      if (name.match(/press|lyft|axel|hantel|triceps/)) return 'PRESS';
      if (name.match(/rodd|curl|biceps|drag|row/)) return 'PULL';
      return 'GENERAL';
  }, [exerciseName]);
  
  const speak = (text: string, priority = false) => {
      if (isMuted || !window.speechSynthesis) return;
      const now = Date.now();
      if (!priority && now - lastSpoke.current < 4000) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      utterance.rate = 1.1; 
      window.speechSynthesis.speak(utterance);
      lastSpoke.current = now;
  };

  const calculateAngle = (a: any, b: any, c: any) => {
      if (!a || !b || !c) return 0;
      const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs(radians * 180.0 / Math.PI);
      if (angle > 180.0) angle = 360 - angle;
      return angle;
  };

  const spawnParticles = (x: number, y: number, color: string) => {
      for(let i=0; i<20; i++) {
          particles.current.push({
              x, y,
              vx: (Math.random() - 0.5) * 15,
              vy: (Math.random() - 0.5) * 15,
              life: 1.0,
              color
          });
      }
  };

  // --- AR EXOSUIT RENDERER ---
  const drawExosuitLimb = (ctx: CanvasRenderingContext2D, start: any, end: any, width: number, height: number, color: string, thickness: number = 20) => {
      if (!start || !end) return;
      const x1 = start.x * width; const y1 = start.y * height;
      const x2 = end.x * width; const y2 = end.y * height;
      
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const len = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
      
      ctx.save();
      ctx.translate(x1, y1);
      ctx.rotate(angle);
      
      // Draw Tech Bracket (Armor Plate)
      const pad = 10;
      const w = thickness;
      
      // Heatmap Color Transition (Blue -> Orange based on motion state)
      const isHot = color.includes('245'); // Check if Amber/Orange
      const fillStyle = isHot 
        ? 'rgba(245, 158, 11, 0.2)' 
        : 'rgba(6, 182, 212, 0.15)';

      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.rect(pad, -w/2, len - pad*2, w);
      ctx.fill();
      
      // Tech Mesh Pattern
      ctx.strokeStyle = isHot ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=pad; i<len-pad; i+=15) {
          ctx.moveTo(i, -w/2); ctx.lineTo(i+5, w/2);
      }
      ctx.stroke();

      // Borders (Brackets)
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      // Top bracket
      ctx.beginPath();
      ctx.moveTo(pad, -w/2 + 5); ctx.lineTo(pad, -w/2); ctx.lineTo(len-pad, -w/2); ctx.lineTo(len-pad, -w/2 + 5);
      ctx.stroke();
      
      // Bottom bracket
      ctx.beginPath();
      ctx.moveTo(pad, w/2 - 5); ctx.lineTo(pad, w/2); ctx.lineTo(len-pad, w/2); ctx.lineTo(len-pad, w/2 - 5);
      ctx.stroke();
      
      // Center Glow Line
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(pad, 0); ctx.lineTo(len-pad, 0); ctx.stroke();

      ctx.restore();
  };

  // --- NEW: AR JOINT TURBINE ---
  const drawJointTurbine = (ctx: CanvasRenderingContext2D, point: any, width: number, height: number, speed: number, color: string) => {
      const cx = point.x * width;
      const cy = point.y * height;
      const r = 25;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(torqueRotation.current * speed); // Spin based on global time * local speed
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Draw 3 blades
      for(let i=0; i<3; i++) {
          ctx.rotate(Math.PI * 2 / 3);
          ctx.moveTo(10, 0);
          ctx.arc(0, 0, r, -0.2, 0.2);
          ctx.lineTo(10, 0);
      }
      ctx.stroke();
      
      // Center hub
      ctx.beginPath(); ctx.arc(0,0, 5, 0, Math.PI*2); ctx.fillStyle = color; ctx.fill();
      
      // Outer Ring
      ctx.beginPath(); ctx.arc(0,0, r + 5, 0, Math.PI*2); 
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();

      ctx.restore();
  };

  const onResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current || !results.poseLandmarks) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);
    
    // Draw user video with sci-fi filter
    canvasCtx.drawImage(results.image, 0, 0, width, height);
    canvasCtx.fillStyle = 'rgba(2, 6, 23, 0.4)'; 
    canvasCtx.fillRect(0, 0, width, height);

    // Apply "Scan Lines"
    canvasCtx.fillStyle = 'rgba(34, 211, 238, 0.03)';
    for(let i=0; i<height; i+=3) canvasCtx.fillRect(0, i, width, 1);

    const lm = results.poseLandmarks;
    
    // UPDATE HISTORY BUFFER (For Motion Trails & Velocity)
    if (landmarkHistory.current.length > 15) landmarkHistory.current.shift();
    landmarkHistory.current.push(lm);

    const lShldr = lm[11]; const rShldr = lm[12];
    const lHip = lm[23]; const rHip = lm[24];
    const lKnee = lm[25]; const rKnee = lm[26];
    const lAnkle = lm[27]; const rAnkle = lm[28];
    const lElbow = lm[13]; const rElbow = lm[14];
    const lWrist = lm[15]; const rWrist = lm[16];

    let skeletonColor = 'rgba(6, 182, 212, 1)'; // Cyan default
    let feedbackMsg = feedback;
    let issues: string[] = [];
    let jointHighlights: {x: number, y: number, color: string}[] = [];
    let angleGauges: {center: any, angle: number, targetStart: number, targetEnd: number}[] = [];
    let stabilityShake = 0;

    // CALCULATE VERTICAL VELOCITY (for AR Gauge & Torque)
    let currentVel = 0;
    if (landmarkHistory.current.length > 2 && lHip) {
        const prevY = landmarkHistory.current[landmarkHistory.current.length - 2][23].y;
        currentVel = (lHip.y - prevY) * 100; // Scaled velocity
    }
    setVelocity(currentVel);
    torqueRotation.current += 0.05 + Math.abs(currentVel) * 0.2; // Spin faster when moving

    // --- CALIBRATION PHASE ---
    if (!isCalibrated) {
        if (lShldr.visibility > 0.8 && lHip.visibility > 0.8 && lAnkle.visibility > 0.8) {
            if (calibrationCounter < 100) {
                setCalibrationCounter(c => c + 2);
                feedbackMsg = "Stå stilla...";
                // Draw calibration overlay
                const progress = calibrationCounter / 100;
                canvasCtx.beginPath();
                canvasCtx.rect(width * 0.2, height * 0.1, width * 0.6, height * 0.8);
                canvasCtx.strokeStyle = `rgba(34, 211, 238, ${progress})`;
                canvasCtx.lineWidth = 4;
                canvasCtx.stroke();
            } else {
                setTargetMetrics({
                    shoulderY: (lShldr.y + rShldr.y) / 2,
                    hipY: (lHip.y + rHip.y) / 2
                });
                setIsCalibrated(true);
                speak("Kalibrering klar. Börja träna.");
            }
        } else {
            feedbackMsg = "Se till att hela kroppen syns";
            setCalibrationCounter(0);
        }
    } else {
        // --- CLINICAL ANALYSIS ENGINE ---
        let mainAngle = 0;
        
        if ((exerciseMode === 'LEGS' || exerciseMode === 'LUNGE') && lHip && lKnee && lAnkle) {
            mainAngle = calculateAngle(lHip, lKnee, lAnkle);
            
            // 1. ANGLE GAUGE WITH TARGET ZONE
            angleGauges.push({ center: lKnee, angle: mainAngle, targetStart: 70, targetEnd: 100 });

            // 2. HOLOGRAPHIC TARGET LINE
            const targetY = lKnee.y * height; 
            const currentHipY = lHip.y * height;
            
            canvasCtx.beginPath();
            canvasCtx.moveTo(width * 0.2, targetY);
            canvasCtx.lineTo(width * 0.8, targetY);
            canvasCtx.lineWidth = 4;
            canvasCtx.strokeStyle = currentHipY > targetY ? '#22c55e' : 'rgba(255,255,255,0.3)'; // Green if passed
            canvasCtx.setLineDash([10, 10]);
            canvasCtx.stroke();
            canvasCtx.setLineDash([]);
            
            // Label
            canvasCtx.fillStyle = '#fff';
            canvasCtx.font = "bold 14px monospace";
            canvasCtx.fillText("MÅLDJUP", width * 0.82, targetY);

            // VALGUS CHECK
            if (mainAngle < 140) { 
                const hipWidth = Math.abs(lHip.x - rHip.x);
                const kneeWidth = Math.abs(lKnee.x - rKnee.x);
                if (kneeWidth < hipWidth * 0.75) {
                    issues.push("Inåtvinkling");
                    jointHighlights.push({ x: lKnee.x, y: lKnee.y, color: '#ef4444' });
                    jointHighlights.push({ x: rKnee.x, y: rKnee.y, color: '#ef4444' });
                    speak("Pressa ut knäna!", true);
                    setFormScore(s => Math.max(0, s - 0.5));
                }
            }

            // STATE MACHINE & SPEED CHECK
            if (motionState === 'START') {
                if (mainAngle < 160) { 
                    setMotionState('ECCENTRIC'); 
                    lastRepTime.current = Date.now();
                    feedbackMsg = "Bromsa..."; 
                } else feedbackMsg = "Stå upprätt";
            } else if (motionState === 'ECCENTRIC') {
                if (mainAngle < 100) {
                    const descentTime = Date.now() - lastRepTime.current;
                    if (descentTime < 1500) {
                        issues.push("För snabbt!");
                        speak("Sakta ner.", false);
                        setFormScore(s => Math.max(0, s - 2));
                    }
                    setMotionState('TURN');
                    speak("Bra djup! Håll.", false);
                    feedbackMsg = "Perfekt djup!";
                    skeletonColor = 'rgba(34, 197, 94, 1)'; // Green
                    setFormScore(s => Math.min(100, s + 1));
                }
            } else if (motionState === 'TURN') {
                // Stability check: if horizontal wobble detected
                const wobble = Math.abs(lKnee.x - landmarkHistory.current[landmarkHistory.current.length-5]?.[25]?.x || 0);
                if (wobble > 0.02) {
                    stabilityShake = 5; // Trigger visual glitch
                    issues.push("Balansera!");
                }
                if (mainAngle > 110) setMotionState('CONCENTRIC');
            } else if (motionState === 'CONCENTRIC') {
                skeletonColor = 'rgba(245, 158, 11, 1)'; // Amber / Magma
                if (mainAngle > 165) {
                    setMotionState('START');
                    setReps(r => r + 1);
                    speak((reps + 1).toString(), true);
                    feedbackMsg = "Snyggt!";
                    setFormScore(s => Math.min(100, s + 2));
                    spawnParticles(lHip.x * width, lHip.y * height, '#22c55e');
                    spawnParticles(rHip.x * width, rHip.y * height, '#22c55e');
                }
            }
        }
        // PRESS & PULL LOGIC
        else if ((exerciseMode === 'PRESS' || exerciseMode === 'PULL') && lShldr && lElbow && lWrist) {
            mainAngle = calculateAngle(lShldr, lElbow, lWrist);
            angleGauges.push({ center: lElbow, angle: mainAngle, targetStart: 160, targetEnd: 180 });

            if (motionState === 'START') {
                if (mainAngle > 100) { setMotionState('CONCENTRIC'); feedbackMsg = "Jobba!"; }
            } else if (motionState === 'CONCENTRIC') {
                skeletonColor = 'rgba(245, 158, 11, 1)';
                if (mainAngle > 160) { 
                    setMotionState('TURN'); 
                    skeletonColor = 'rgba(34, 197, 94, 1)'; 
                    feedbackMsg = "Toppläge!";
                }
            } else if (motionState === 'TURN') {
                if (mainAngle < 150) setMotionState('ECCENTRIC');
            } else if (motionState === 'ECCENTRIC') {
                if (mainAngle < 70) {
                    setMotionState('START');
                    setReps(r => r + 1);
                    speak((reps+1).toString(), true);
                    spawnParticles(lElbow.x * width, lElbow.y * height, '#22c55e');
                }
            }
        }
    }

    setActiveIssues(issues);
    if (issues.length === 0) setFeedback(feedbackMsg);

    // --- RENDER LAYERS ---

    // 0. Stability Glitch Effect
    if (stabilityShake > 0) {
        canvasCtx.save();
        canvasCtx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
        // Chromatic aberration sort of effect
        canvasCtx.globalCompositeOperation = 'difference';
        canvasCtx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        canvasCtx.fillRect(0,0,width,height);
        canvasCtx.restore();
        canvasCtx.globalCompositeOperation = 'source-over';
    }

    // 1. MOTION TRAILS (Ghosting)
    if (isCalibrated && landmarkHistory.current.length > 2) {
        const trackIdx = (exerciseMode === 'LEGS' || exerciseMode === 'LUNGE') ? 26 : 16; 
        
        canvasCtx.beginPath();
        landmarkHistory.current.forEach((frameLm, i) => {
            if (!frameLm[trackIdx]) return;
            const x = frameLm[trackIdx].x * width;
            const y = frameLm[trackIdx].y * height;
            if (i === 0) canvasCtx.moveTo(x, y);
            else canvasCtx.lineTo(x, y);
        });
        canvasCtx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        canvasCtx.lineWidth = 8;
        canvasCtx.lineCap = 'round';
        canvasCtx.stroke();
    }

    // 2. VELOCITY GAUGE (AR Tempo Bar)
    if (isCalibrated) {
        const barX = width - 40;
        const barH = 300;
        const barY = height / 2 - barH / 2;
        canvasCtx.fillStyle = 'rgba(15, 23, 42, 0.6)'; canvasCtx.fillRect(barX, barY, 20, barH);
        canvasCtx.strokeStyle = '#fff'; canvasCtx.beginPath(); canvasCtx.moveTo(barX, height/2); canvasCtx.lineTo(barX+20, height/2); canvasCtx.stroke();
        
        const velHeight = Math.min(Math.abs(velocity * 50), barH/2);
        const isTooFast = Math.abs(velocity) > 2.0; 
        const barColor = isTooFast ? '#ef4444' : '#22c55e';
        
        canvasCtx.fillStyle = barColor;
        if (velocity > 0) canvasCtx.fillRect(barX + 2, height/2, 16, velHeight);
        else canvasCtx.fillRect(barX + 2, height/2 - velHeight, 16, velHeight);
        
        canvasCtx.fillStyle = '#fff'; canvasCtx.font = "10px monospace"; canvasCtx.fillText("TEMPO", barX - 10, barY - 5);
    }

    // 3. AR EXOSUIT (REPLACES STICK FIGURE)
    const drawLandmarks = (drawingUtils as any).drawLandmarks || (drawingUtils as any).default?.drawLandmarks;

    if (isCalibrated) {
        // Legs
        if (exerciseMode === 'LEGS' || exerciseMode === 'LUNGE') {
            drawExosuitLimb(canvasCtx, lHip, lKnee, width, height, skeletonColor, 40);
            drawExosuitLimb(canvasCtx, rHip, rKnee, width, height, skeletonColor, 40);
            drawExosuitLimb(canvasCtx, lKnee, lAnkle, width, height, skeletonColor, 30);
            drawExosuitLimb(canvasCtx, rKnee, rAnkle, width, height, skeletonColor, 30);
            
            // Torque Rings
            drawJointTurbine(canvasCtx, lKnee, width, height, 1, skeletonColor);
            drawJointTurbine(canvasCtx, rKnee, width, height, -1, skeletonColor);
        }
        // Arms
        else {
            drawExosuitLimb(canvasCtx, lShldr, lElbow, width, height, skeletonColor, 30);
            drawExosuitLimb(canvasCtx, rShldr, rElbow, width, height, skeletonColor, 30);
            drawExosuitLimb(canvasCtx, lElbow, lWrist, width, height, skeletonColor, 25);
            drawExosuitLimb(canvasCtx, rElbow, rWrist, width, height, skeletonColor, 25);
            
            // Torque Rings
            drawJointTurbine(canvasCtx, lElbow, width, height, 1, skeletonColor);
            drawJointTurbine(canvasCtx, rElbow, width, height, -1, skeletonColor);
        }
        
        // Torso Box
        if (lShldr && rShldr && lHip && rHip) {
            canvasCtx.beginPath();
            canvasCtx.moveTo(lShldr.x * width, lShldr.y * height);
            canvasCtx.lineTo(rShldr.x * width, rShldr.y * height);
            canvasCtx.lineTo(rHip.x * width, rHip.y * height);
            canvasCtx.lineTo(lHip.x * width, lHip.y * height);
            canvasCtx.closePath();
            canvasCtx.strokeStyle = 'rgba(255,255,255,0.5)';
            canvasCtx.lineWidth = 1;
            canvasCtx.stroke();
        }
    } else {
        // Fallback to simple landmarks during calibration
        if (drawLandmarks) drawLandmarks(canvasCtx, lm, { color: '#0ea5e9', lineWidth: 2, radius: 4 });
    }

    // 4. PARTICLES (Success Burst)
    for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.life -= 0.05;
        
        canvasCtx.globalAlpha = p.life;
        canvasCtx.fillStyle = p.color;
        canvasCtx.beginPath();
        canvasCtx.arc(p.x, p.y, 4, 0, Math.PI*2);
        canvasCtx.fill();
        canvasCtx.globalAlpha = 1;

        if (p.life <= 0) particles.current.splice(i, 1);
    }

    // 5. ENHANCED ANGLE GAUGES (AR HUD)
    angleGauges.forEach(gauge => {
        const cx = gauge.center.x * width;
        const cy = gauge.center.y * height;
        const radius = 45;
        
        canvasCtx.beginPath(); canvasCtx.moveTo(cx, cy);
        const startRad = -Math.PI / 2 + (gauge.targetStart / 360) * Math.PI * 2;
        const endRad = -Math.PI / 2 + (gauge.targetEnd / 360) * Math.PI * 2;
        canvasCtx.arc(cx, cy, radius + 10, startRad, endRad);
        canvasCtx.fillStyle = 'rgba(34, 197, 94, 0.2)'; canvasCtx.fill();

        canvasCtx.beginPath(); canvasCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        canvasCtx.strokeStyle = 'rgba(255,255,255,0.1)'; canvasCtx.lineWidth = 4; canvasCtx.stroke();

        canvasCtx.beginPath();
        const start = -Math.PI / 2;
        const end = start + (gauge.angle / 360) * Math.PI * 2;
        canvasCtx.arc(cx, cy, radius, start, end);
        const inZone = gauge.angle >= gauge.targetStart && gauge.angle <= gauge.targetEnd;
        canvasCtx.strokeStyle = inZone ? '#22c55e' : '#06b6d4';
        canvasCtx.lineWidth = 6; canvasCtx.stroke();

        canvasCtx.fillStyle = '#0f172a'; canvasCtx.fillRect(cx + radius + 5, cy - 10, 40, 20);
        canvasCtx.fillStyle = '#fff'; canvasCtx.font = "bold 12px monospace";
        canvasCtx.fillText(Math.round(gauge.angle) + "°", cx + radius + 10, cy + 4);
    });

    // Highlight issues
    jointHighlights.forEach(h => {
        canvasCtx.beginPath();
        canvasCtx.arc(h.x * width, h.y * height, 30, 0, Math.PI * 2);
        canvasCtx.strokeStyle = h.color;
        canvasCtx.lineWidth = 4;
        canvasCtx.stroke();
    });

    canvasCtx.restore();
  };

  useEffect(() => {
    setTimeout(() => speak(`System redo. Ställ dig så hela kroppen syns.`), 1000);

    const Pose = (poseLib as any).Pose || (poseLib as any).default?.Pose;
    const Camera = (cameraUtils as any).Camera || (cameraUtils as any).default?.Camera;

    if (!Pose || !Camera) return;

    const pose = new Pose({locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    pose.onResults(onResults);

    let camera: any = null;
    if (videoRef.current) {
      try {
          camera = new Camera(videoRef.current, {
            onFrame: async () => { if (videoRef.current) await pose.send({image: videoRef.current}); },
            width: 1280, height: 720
          });
          camera.start().then(() => setIsCameraActive(true)).catch(() => setPermissionDenied(true));
      } catch (err) { setPermissionDenied(true); }
    }
      
    return () => {
        if (camera) try { camera.stop(); } catch(e) { }
        try { pose.close(); } catch(e) { }
        window.speechSynthesis.cancel();
    };
  }, [exerciseMode, isCalibrated]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col md:flex-row overflow-hidden font-mono">
      {/* LEFT: 3D HOLOGRAPHIC DEMONSTRATOR */}
      <div className="h-1/2 md:h-full md:w-1/2 bg-slate-950 relative border-b md:border-b-0 md:border-r border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950"></div>
          
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-800 flex items-center gap-2">
                  <Layers size={12} /> BIO-DIGITAL TWIN v2.2
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                  MODE: {exerciseMode}
              </span>
          </div>

          <ProceduralAvatar mode={exerciseMode} />
          
          <div className="absolute bottom-8 left-8 right-8 text-center pointer-events-none">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                  <Timer size={10} /> Clinical Tempo Match
              </p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 w-1/3 animate-[pulse_5s_infinite]"></div>
              </div>
          </div>
      </div>

      {/* RIGHT: REAL-TIME ANALYSIS */}
      <div className="h-1/2 md:h-full md:w-1/2 relative bg-black flex flex-col">
          <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/90 to-transparent">
             <div>
                <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                    <BrainCircuit size={18} className="text-emerald-400" />
                    {exerciseName}
                </h3>
                {activeIssues.length > 0 ? (
                    <span className="text-red-400 text-xs font-bold flex items-center gap-1 mt-1 animate-pulse">
                        <AlertTriangle size={10} /> {activeIssues[0]}
                    </span>
                ) : (
                    <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 mt-1">
                        <Activity size={10} /> FORM OPTIMAL
                    </span>
                )}
             </div>
             <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={20} /></button>
          </div>

          <div className="relative flex-grow flex items-center justify-center overflow-hidden bg-slate-900">
             {!isCameraActive ? (
                 <div className="flex flex-col items-center text-slate-500 animate-pulse gap-4">
                     <RefreshCw className="animate-spin" size={32} />
                     <p>Calibrating Neural Vision...</p>
                 </div>
             ) : (
                 <>
                     <video ref={videoRef} className="hidden" playsInline muted></video>
                     <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" width={1280} height={720}></canvas>
                     
                     {/* CALIBRATION OVERLAY */}
                     {!isCalibrated && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-40 backdrop-blur-sm">
                             <ScanLine size={48} className="text-cyan-400 animate-bounce mb-4" />
                             <h4 className="text-white font-bold text-xl">System Kalibrering</h4>
                             <p className="text-cyan-200 text-sm mb-6">Stå stilla så hela kroppen syns</p>
                             <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${calibrationCounter}%` }}></div>
                             </div>
                         </div>
                     )}

                     <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col items-center z-30 pointer-events-none gap-6">
                        {/* REPS */}
                        <div className="text-center">
                            <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{reps}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Reps</div>
                        </div>
                        
                        {/* FORM SCORE */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center bg-black/50 backdrop-blur-md ${formScore > 80 ? 'border-emerald-500 text-emerald-400' : formScore > 50 ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400'}`}>
                                <span className="font-bold text-lg">{Math.round(formScore)}%</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality</span>
                        </div>
                     </div>
                 </>
             )}
          </div>

          {/* Feedback Bar */}
          <div className="p-5 bg-slate-950 border-t border-slate-800 relative min-h-[80px] flex items-center">
             <div className="flex items-center gap-4 w-full">
                 <div className={`p-3 rounded-full border shadow-[0_0_15px_rgba(0,0,0,0.5)] ${activeIssues.length > 0 ? 'border-red-500 bg-red-950 text-red-500' : 'border-emerald-500 bg-emerald-950 text-emerald-500'}`}>
                    {activeIssues.length > 0 ? <Zap size={20} /> : <Target size={20} />}
                 </div>
                 <div className="flex-1">
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Live Feedback</p>
                     <p className={`text-base font-bold leading-tight ${activeIssues.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {feedback}
                     </p>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default AIMovementCoach;
