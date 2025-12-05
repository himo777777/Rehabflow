/**
 * Standing Animation Primitives
 * 50 base animations for standing exercises
 * These can be parameterized for thousands of variations
 */

import { AnimationPrimitive } from '../../types';

export const STANDING_PRIMITIVES: AnimationPrimitive[] = [
  // ============================================
  // SQUAT VARIATIONS (12 animationer)
  // ============================================
  {
    id: 'squat_base',
    name: 'Knäböj bas',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'start' },
      { time: 0.5, pose: { hip: -90, knee: -90, ankle: 15 }, label: 'bottom' },
      { time: 1, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Sänk höfterna bakåt och ner' },
      { name: 'uppstigning', startTime: 0.5, endTime: 1, instruction: 'Pressa upp genom hälarna' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 2.0, default: 1.0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 3, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    description: 'Grundläggande knäböj med fokus på höft- och knäflexion'
  },
  {
    id: 'squat_sumo',
    name: 'Sumoknäböj',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0, ankle: 0, hipAbduction: 45 }, label: 'start' },
      { time: 0.5, pose: { hip: -80, knee: -90, ankle: 10, hipAbduction: 45 }, label: 'bottom' },
      { time: 1, pose: { hip: 0, knee: 0, ankle: 0, hipAbduction: 45 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Bred fotställning, sänk rakt ner' },
      { name: 'uppstigning', startTime: 0.5, endTime: 1, instruction: 'Pressa knäna utåt vid uppgång' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 2.0, default: 1.0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 3, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['adductors', 'glutes', 'quadriceps', 'inner_thigh'],
    description: 'Knäböj med bred fotställning för mer fokus på insida lår'
  },
  {
    id: 'squat_goblet',
    name: 'Goblet knäböj',
    joints: ['hip', 'knee', 'ankle', 'spine', 'shoulder', 'elbow'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0, ankle: 0, shoulderFlexion: 90, elbowFlexion: 90 }, label: 'start' },
      { time: 0.5, pose: { hip: -90, knee: -95, ankle: 15, shoulderFlexion: 90, elbowFlexion: 90 }, label: 'bottom' },
      { time: 1, pose: { hip: 0, knee: 0, ankle: 0, shoulderFlexion: 90, elbowFlexion: 90 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Håll vikten nära bröstet, sänk ner' },
      { name: 'uppstigning', startTime: 0.5, endTime: 1, instruction: 'Håll ryggen rak vid uppgång' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['weight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'core', 'upper_back'],
    description: 'Knäböj med vikt framför bröstet för bättre upprätt position'
  },
  {
    id: 'squat_split',
    name: 'Split squat',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { frontHip: 0, frontKnee: 0, backHip: -20, backKnee: 0 }, label: 'start' },
      { time: 0.5, pose: { frontHip: -90, frontKnee: -90, backHip: -30, backKnee: -90 }, label: 'bottom' },
      { time: 1, pose: { frontHip: 0, frontKnee: 0, backHip: -20, backKnee: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Sänk bakre knät mot golvet' },
      { name: 'uppstigning', startTime: 0.5, endTime: 1, instruction: 'Pressa upp genom främre hälen' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'hip_flexors'],
    description: 'Statisk utfallsposition med vertikal rörelse'
  },
  {
    id: 'squat_bulgarian',
    name: 'Bulgarisk split squat',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { frontHip: 0, frontKnee: 0, backHip: -30, backKnee: -20 }, label: 'start' },
      { time: 0.5, pose: { frontHip: -100, frontKnee: -90, backHip: -40, backKnee: -110 }, label: 'bottom' },
      { time: 1, pose: { frontHip: 0, frontKnee: 0, backHip: -30, backKnee: -20 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Bakre fot på bänk, sänk kontrollerat' },
      { name: 'uppstigning', startTime: 0.5, endTime: 1, instruction: 'Driv upp genom främre benet' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 0.8 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'hip_flexors', 'core'],
    description: 'Avancerad split squat med bakre fot eleverad'
  },
  {
    id: 'squat_pistol',
    name: 'Pistol squat',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { standingHip: 0, standingKnee: 0, raisedHip: 45, raisedKnee: 0 }, label: 'start' },
      { time: 0.5, pose: { standingHip: -120, standingKnee: -140, raisedHip: 90, raisedKnee: 0 }, label: 'bottom' },
      { time: 1, pose: { standingHip: 0, standingKnee: 0, raisedHip: 45, raisedKnee: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Ett ben framåt, sänk på stående benet' },
      { name: 'uppstigning', startTime: 0.5, endTime: 1, instruction: 'Pressa upp utan att sätta ner foten' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.5 },
      speed: { min: 0.3, max: 1.0, default: 0.5 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 1, default: 0 },
      resistance: ['none', 'bodyweight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'hip_flexors', 'core', 'ankle_stabilizers'],
    description: 'Avancerad enbenssquat med fritt ben framåt'
  },
  {
    id: 'squat_wall',
    name: 'Väggstol',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: -90, knee: -90, ankle: 0 }, label: 'hold' }
    ],
    phases: [
      { name: 'håll', startTime: 0, endTime: 1, instruction: 'Håll positionen med ryggen mot väggen' }
    ],
    loop: false,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0, max: 0, default: 0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 10, max: 120, default: 30 },
      resistance: ['none', 'bodyweight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'core'],
    description: 'Isometrisk knäböj mot vägg'
  },

  // ============================================
  // LUNGE VARIATIONS (8 animationer)
  // ============================================
  {
    id: 'lunge_forward',
    name: 'Framåtutfall',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'start' },
      { time: 0.3, pose: { frontHip: -90, frontKnee: -90, backKnee: -90 }, label: 'lunge' },
      { time: 0.6, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'return' },
      { time: 1, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'utfall', startTime: 0, endTime: 0.3, instruction: 'Ta ett stort steg framåt' },
      { name: 'sänkning', startTime: 0.3, endTime: 0.5, instruction: 'Sänk bakre knät mot golvet' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Pressa tillbaka till start' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings', 'hip_flexors'],
    description: 'Dynamiskt utfall framåt'
  },
  {
    id: 'lunge_reverse',
    name: 'Bakåtutfall',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'start' },
      { time: 0.3, pose: { frontHip: -90, frontKnee: -90, backHip: -20, backKnee: -90 }, label: 'lunge' },
      { time: 1, pose: { hip: 0, knee: 0, ankle: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'steg', startTime: 0, endTime: 0.3, instruction: 'Ta ett steg bakåt' },
      { name: 'sänkning', startTime: 0.3, endTime: 0.5, instruction: 'Sänk bakre knät mot golvet' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Driv tillbaka genom främre hälen' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    description: 'Utfall bakåt, skonsammare för knäna'
  },
  {
    id: 'lunge_lateral',
    name: 'Sidoutfall',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0, hipAbduction: 0 }, label: 'start' },
      { time: 0.4, pose: { lungeHip: -90, lungeKnee: -90, straightLeg: 0, hipAbduction: 60 }, label: 'side_lunge' },
      { time: 1, pose: { hip: 0, knee: 0, hipAbduction: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'sidosteg', startTime: 0, endTime: 0.3, instruction: 'Ta ett brett steg åt sidan' },
      { name: 'sänkning', startTime: 0.3, endTime: 0.5, instruction: 'Sänk höften mot utfallsbenet' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Pressa tillbaka till mitten' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['adductors', 'quadriceps', 'glutes', 'hip_abductors'],
    description: 'Utfall i sidled för adduktorer och abduktorer'
  },
  {
    id: 'lunge_curtsy',
    name: 'Curtsy utfall',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0 }, label: 'start' },
      { time: 0.4, pose: { frontHip: -80, frontKnee: -90, backHipCrossed: -30, backKnee: -90 }, label: 'curtsy' },
      { time: 1, pose: { hip: 0, knee: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'korsning', startTime: 0, endTime: 0.3, instruction: 'Korsa benet bakom, som en nigning' },
      { name: 'sänkning', startTime: 0.3, endTime: 0.5, instruction: 'Sänk bakre knät mot golvet' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Pressa tillbaka till start' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['glutes', 'quadriceps', 'hip_abductors', 'adductors'],
    description: 'Korsat utfall för gluteus medius fokus'
  },
  {
    id: 'lunge_walking',
    name: 'Gångutfall',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 0 }, label: 'start' },
      { time: 0.25, pose: { frontHip: -90, frontKnee: -90, backKnee: -90 }, label: 'lunge_right' },
      { time: 0.5, pose: { hip: 0, knee: 0 }, label: 'step_through' },
      { time: 0.75, pose: { frontHip: -90, frontKnee: -90, backKnee: -90 }, label: 'lunge_left' },
      { time: 1, pose: { hip: 0, knee: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'utfall_1', startTime: 0, endTime: 0.25, instruction: 'Utfall höger' },
      { name: 'genomsteg', startTime: 0.25, endTime: 0.5, instruction: 'Steg igenom framåt' },
      { name: 'utfall_2', startTime: 0.5, endTime: 0.75, instruction: 'Utfall vänster' },
      { name: 'genomsteg_2', startTime: 0.75, endTime: 1, instruction: 'Fortsätt framåt' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['alternating'],
      holdDuration: { min: 0, max: 1, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'functional',
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings', 'hip_flexors', 'core'],
    description: 'Kontinuerligt gående utfall framåt'
  },

  // ============================================
  // CALF & ANKLE (5 animationer)
  // ============================================
  {
    id: 'calf_raise_double',
    name: 'Tåhävning dubbelsidig',
    joints: ['ankle'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { ankle: 0 }, label: 'start' },
      { time: 0.5, pose: { ankle: -30 }, label: 'top' },
      { time: 1, pose: { ankle: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'hävning', startTime: 0, endTime: 0.5, instruction: 'Res dig på tårna' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat ner hälarna' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.5, max: 2.0, default: 1.0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 3, default: 1 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['gastrocnemius', 'soleus'],
    description: 'Grundläggande tåhävning på båda fötterna'
  },
  {
    id: 'calf_raise_single',
    name: 'Tåhävning enbenig',
    joints: ['ankle', 'hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { standingAnkle: 0, raisedHip: 45, raisedKnee: 90 }, label: 'start' },
      { time: 0.5, pose: { standingAnkle: -30, raisedHip: 45, raisedKnee: 90 }, label: 'top' },
      { time: 1, pose: { standingAnkle: 0, raisedHip: 45, raisedKnee: 90 }, label: 'end' }
    ],
    phases: [
      { name: 'hävning', startTime: 0, endTime: 0.5, instruction: 'Res dig på ena fotens tår' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.5, max: 1.5, default: 0.8 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 3, default: 1 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['gastrocnemius', 'soleus', 'ankle_stabilizers'],
    description: 'Enbenig tåhävning för vadstyrka'
  },
  {
    id: 'ankle_circles',
    name: 'Fotledscirklar',
    joints: ['ankle'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { ankleX: 0, ankleY: 0 }, label: 'start' },
      { time: 0.25, pose: { ankleX: 15, ankleY: 15 }, label: 'quarter' },
      { time: 0.5, pose: { ankleX: 0, ankleY: 30 }, label: 'half' },
      { time: 0.75, pose: { ankleX: -15, ankleY: 15 }, label: 'three_quarter' },
      { time: 1, pose: { ankleX: 0, ankleY: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'cirkel', startTime: 0, endTime: 1, instruction: 'Rita cirklar med foten' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.3, max: 1.5, default: 0.7 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['ankle_stabilizers', 'tibialis_anterior', 'peroneals'],
    description: 'Rörlighetsövning för fotleden'
  },
  {
    id: 'heel_walk',
    name: 'Hälgång',
    joints: ['ankle', 'hip', 'knee'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { leftAnkle: 20, rightAnkle: 20, leftHip: 0, rightHip: -30 }, label: 'start' },
      { time: 0.5, pose: { leftAnkle: 20, rightAnkle: 20, leftHip: -30, rightHip: 0 }, label: 'mid' },
      { time: 1, pose: { leftAnkle: 20, rightAnkle: 20, leftHip: 0, rightHip: -30 }, label: 'end' }
    ],
    phases: [
      { name: 'gång', startTime: 0, endTime: 1, instruction: 'Gå på hälarna med tårna uppåt' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.3, max: 1.0, default: 0.5 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['tibialis_anterior', 'ankle_dorsiflexors'],
    description: 'Gång på hälarna för tibialis anterior'
  },
  {
    id: 'toe_walk',
    name: 'Tågång',
    joints: ['ankle', 'hip', 'knee'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { leftAnkle: -25, rightAnkle: -25, leftHip: 0, rightHip: -20 }, label: 'start' },
      { time: 0.5, pose: { leftAnkle: -25, rightAnkle: -25, leftHip: -20, rightHip: 0 }, label: 'mid' },
      { time: 1, pose: { leftAnkle: -25, rightAnkle: -25, leftHip: 0, rightHip: -20 }, label: 'end' }
    ],
    phases: [
      { name: 'gång', startTime: 0, endTime: 1, instruction: 'Gå på tårna' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.3, max: 1.0, default: 0.5 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'strength',
    targetMuscles: ['gastrocnemius', 'soleus', 'ankle_stabilizers'],
    description: 'Gång på tårna för vadstyrka och balans'
  },

  // ============================================
  // HIP MOVEMENTS (8 animationer)
  // ============================================
  {
    id: 'hip_hinge',
    name: 'Höftgångjärn',
    joints: ['hip', 'spine', 'knee'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, spine: 0, knee: 10 }, label: 'start' },
      { time: 0.5, pose: { hip: -90, spine: 0, knee: 15 }, label: 'hinged' },
      { time: 1, pose: { hip: 0, spine: 0, knee: 10 }, label: 'end' }
    ],
    phases: [
      { name: 'framåtfällning', startTime: 0, endTime: 0.5, instruction: 'Skjut höften bakåt, rak rygg' },
      { name: 'uppresning', startTime: 0.5, endTime: 1, instruction: 'Kläm ihop skinkorna vid uppgång' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['hamstrings', 'glutes', 'erector_spinae'],
    description: 'Grundläggande höftgångjärn för posterior kedja'
  },
  {
    id: 'rdl_single_leg',
    name: 'Enbenig rumänsk marklyft',
    joints: ['hip', 'spine', 'knee'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { standingHip: 0, spine: 0, raisedHip: 0 }, label: 'start' },
      { time: 0.5, pose: { standingHip: -90, spine: 0, raisedHip: 90 }, label: 'bottom' },
      { time: 1, pose: { standingHip: 0, spine: 0, raisedHip: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'sänkning', startTime: 0, endTime: 0.5, instruction: 'Fäll framåt, lyft bakre benet' },
      { name: 'uppresning', startTime: 0.5, endTime: 1, instruction: 'Res dig kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.6 },
      speed: { min: 0.3, max: 1.0, default: 0.6 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight', 'weight']
    },
    category: 'strength',
    targetMuscles: ['hamstrings', 'glutes', 'erector_spinae', 'core'],
    description: 'Enbenig höftgångjärn för balans och styrka'
  },
  {
    id: 'hip_abduction_standing',
    name: 'Höftabduktion stående',
    joints: ['hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hipAbduction: 0 }, label: 'start' },
      { time: 0.5, pose: { hipAbduction: 45 }, label: 'abducted' },
      { time: 1, pose: { hipAbduction: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'lyft', startTime: 0, endTime: 0.5, instruction: 'Lyft benet ut åt sidan' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat tillbaka' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 3, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['gluteus_medius', 'gluteus_minimus', 'tensor_fasciae_latae'],
    description: 'Höftabduktion för gluteus medius'
  },
  {
    id: 'hip_extension_standing',
    name: 'Höftextension stående',
    joints: ['hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hipExtension: 0 }, label: 'start' },
      { time: 0.5, pose: { hipExtension: -30 }, label: 'extended' },
      { time: 1, pose: { hipExtension: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'extension', startTime: 0, endTime: 0.5, instruction: 'Lyft benet bakåt' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Sänk tillbaka kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 3, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['gluteus_maximus', 'hamstrings'],
    description: 'Stående höftextension för gluteus'
  },
  {
    id: 'hip_flexor_stretch_standing',
    name: 'Höftböjarstretch stående',
    joints: ['hip', 'knee', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { frontHip: -45, frontKnee: -90, backHip: 10, spine: 5 }, label: 'stretch' }
    ],
    phases: [
      { name: 'håll', startTime: 0, endTime: 1, instruction: 'Skjut höften framåt, känn stretch i höftböjaren' }
    ],
    loop: false,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 0.8 },
      speed: { min: 0, max: 0, default: 0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 15, max: 60, default: 30 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['iliopsoas', 'rectus_femoris', 'tensor_fasciae_latae'],
    description: 'Stretch för höftböjarna i stående utfallsposition'
  },
  {
    id: 'hip_circles',
    name: 'Höftcirklar',
    joints: ['hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hipFlexion: 90, hipAbduction: 0 }, label: 'front' },
      { time: 0.25, pose: { hipFlexion: 45, hipAbduction: 45 }, label: 'side' },
      { time: 0.5, pose: { hipFlexion: 0, hipAbduction: 0, hipExtension: 15 }, label: 'back' },
      { time: 0.75, pose: { hipFlexion: 45, hipAbduction: -30 }, label: 'cross' },
      { time: 1, pose: { hipFlexion: 90, hipAbduction: 0 }, label: 'front' }
    ],
    phases: [
      { name: 'cirkel', startTime: 0, endTime: 1, instruction: 'Rita stora cirklar med knät' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.3, max: 1.0, default: 0.5 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['hip_flexors', 'hip_rotators', 'hip_abductors'],
    description: 'Rörlighetsövning för hela höftleden'
  },
  {
    id: 'leg_swing_frontal',
    name: 'Benpendel framåt-bakåt',
    joints: ['hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hipFlexion: 0 }, label: 'neutral' },
      { time: 0.25, pose: { hipFlexion: 60 }, label: 'forward' },
      { time: 0.5, pose: { hipFlexion: 0 }, label: 'neutral' },
      { time: 0.75, pose: { hipExtension: 30 }, label: 'backward' },
      { time: 1, pose: { hipFlexion: 0 }, label: 'neutral' }
    ],
    phases: [
      { name: 'framåt', startTime: 0, endTime: 0.5, instruction: 'Svinga benet framåt' },
      { name: 'bakåt', startTime: 0.5, endTime: 1, instruction: 'Svinga benet bakåt' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['hip_flexors', 'hamstrings', 'glutes'],
    description: 'Dynamisk uppvärmning för höften'
  },
  {
    id: 'leg_swing_lateral',
    name: 'Benpendel sidled',
    joints: ['hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hipAbduction: 0 }, label: 'neutral' },
      { time: 0.25, pose: { hipAbduction: 45 }, label: 'out' },
      { time: 0.5, pose: { hipAbduction: 0 }, label: 'neutral' },
      { time: 0.75, pose: { hipAdduction: 30 }, label: 'cross' },
      { time: 1, pose: { hipAbduction: 0 }, label: 'neutral' }
    ],
    phases: [
      { name: 'ut', startTime: 0, endTime: 0.5, instruction: 'Svinga benet ut åt sidan' },
      { name: 'in', startTime: 0.5, endTime: 1, instruction: 'Svinga benet in över kroppen' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['hip_abductors', 'adductors'],
    description: 'Dynamisk uppvärmning för höftens sido-rörelse'
  },

  // ============================================
  // SHOULDER MOVEMENTS (10 animationer)
  // ============================================
  {
    id: 'shoulder_flexion',
    name: 'Axelflexion',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderFlexion: 0 }, label: 'start' },
      { time: 0.5, pose: { shoulderFlexion: 180 }, label: 'top' },
      { time: 1, pose: { shoulderFlexion: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'lyft', startTime: 0, endTime: 0.5, instruction: 'Lyft armarna framåt och upp' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat tillbaka' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral', 'left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 3, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'mobility',
    targetMuscles: ['anterior_deltoid', 'upper_pectoralis', 'biceps'],
    description: 'Axelflexion för rörlighet och styrka'
  },
  {
    id: 'shoulder_abduction',
    name: 'Axelabduktion',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderAbduction: 0 }, label: 'start' },
      { time: 0.5, pose: { shoulderAbduction: 180 }, label: 'top' },
      { time: 1, pose: { shoulderAbduction: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'lyft', startTime: 0, endTime: 0.5, instruction: 'Lyft armarna ut åt sidorna' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat tillbaka' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral', 'left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 3, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['lateral_deltoid', 'supraspinatus', 'trapezius'],
    description: 'Sidolyft för axlarna'
  },
  {
    id: 'shoulder_external_rotation',
    name: 'Utåtrotation axel',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderRotation: 0, elbowFlexion: 90 }, label: 'start' },
      { time: 0.5, pose: { shoulderRotation: 45, elbowFlexion: 90 }, label: 'rotated' },
      { time: 1, pose: { shoulderRotation: 0, elbowFlexion: 90 }, label: 'end' }
    ],
    phases: [
      { name: 'rotation', startTime: 0, endTime: 0.5, instruction: 'Rotera underarmen utåt' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Rotera tillbaka kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 0.8 },
      supportedLaterality: ['bilateral', 'left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['infraspinatus', 'teres_minor', 'posterior_deltoid'],
    description: 'Rotator cuff-övning för utåtrotatorer'
  },
  {
    id: 'shoulder_internal_rotation',
    name: 'Inåtrotation axel',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderRotation: 45, elbowFlexion: 90 }, label: 'start' },
      { time: 0.5, pose: { shoulderRotation: -45, elbowFlexion: 90 }, label: 'rotated' },
      { time: 1, pose: { shoulderRotation: 45, elbowFlexion: 90 }, label: 'end' }
    ],
    phases: [
      { name: 'rotation', startTime: 0, endTime: 0.5, instruction: 'Rotera underarmen inåt' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Rotera tillbaka kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 0.8 },
      supportedLaterality: ['bilateral', 'left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['subscapularis', 'pectoralis_major', 'latissimus_dorsi'],
    description: 'Rotator cuff-övning för inåtrotatorer'
  },
  {
    id: 'shoulder_circles',
    name: 'Axelcirklar',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderElevation: 0, shoulderProtraction: 0 }, label: 'start' },
      { time: 0.25, pose: { shoulderElevation: 20, shoulderProtraction: 10 }, label: 'up_forward' },
      { time: 0.5, pose: { shoulderElevation: 0, shoulderProtraction: 20 }, label: 'forward' },
      { time: 0.75, pose: { shoulderElevation: -10, shoulderProtraction: 0 }, label: 'down' },
      { time: 1, pose: { shoulderElevation: 0, shoulderProtraction: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'cirkel', startTime: 0, endTime: 1, instruction: 'Rita cirklar med axlarna' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.3, max: 1.0, default: 0.5 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['trapezius', 'rhomboids', 'levator_scapulae'],
    description: 'Rörlighetsövning för axelpartiet'
  },
  {
    id: 'overhead_press',
    name: 'Axelpress',
    joints: ['shoulder', 'elbow'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderFlexion: 90, shoulderAbduction: 45, elbowFlexion: 90 }, label: 'start' },
      { time: 0.5, pose: { shoulderFlexion: 180, shoulderAbduction: 0, elbowFlexion: 0 }, label: 'top' },
      { time: 1, pose: { shoulderFlexion: 90, shoulderAbduction: 45, elbowFlexion: 90 }, label: 'end' }
    ],
    phases: [
      { name: 'press', startTime: 0, endTime: 0.5, instruction: 'Pressa armarna rakt upp' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat till axelhöjd' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.4, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral', 'left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['anterior_deltoid', 'lateral_deltoid', 'triceps', 'upper_trapezius'],
    description: 'Stående axelpress för överkroppsstyrka'
  },
  {
    id: 'front_raise',
    name: 'Frontlyft',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderFlexion: 0 }, label: 'start' },
      { time: 0.5, pose: { shoulderFlexion: 90 }, label: 'top' },
      { time: 1, pose: { shoulderFlexion: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'lyft', startTime: 0, endTime: 0.5, instruction: 'Lyft armarna framåt till axelhöjd' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral', 'left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['anterior_deltoid', 'upper_pectoralis'],
    description: 'Isolerad övning för främre deltoideus'
  },
  {
    id: 'lateral_raise',
    name: 'Sidolyft',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderAbduction: 0 }, label: 'start' },
      { time: 0.5, pose: { shoulderAbduction: 90 }, label: 'top' },
      { time: 1, pose: { shoulderAbduction: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'lyft', startTime: 0, endTime: 0.5, instruction: 'Lyft armarna ut åt sidorna till axelhöjd' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral', 'left', 'right', 'alternating'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['lateral_deltoid', 'supraspinatus'],
    description: 'Isolerad övning för laterala deltoideus'
  },
  {
    id: 'scaption',
    name: 'Scaption (skulderbladslinje)',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderFlexion: 0, shoulderAbduction: 0 }, label: 'start' },
      { time: 0.5, pose: { shoulderFlexion: 60, shoulderAbduction: 60 }, label: 'top' },
      { time: 1, pose: { shoulderFlexion: 0, shoulderAbduction: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'lyft', startTime: 0, endTime: 0.5, instruction: 'Lyft armarna i 45° vinkel framåt-utåt' },
      { name: 'sänkning', startTime: 0.5, endTime: 1, instruction: 'Sänk kontrollerat' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.8 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral', 'left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'strength',
    targetMuscles: ['supraspinatus', 'anterior_deltoid', 'lateral_deltoid'],
    description: 'Lyft i skulderbladets plan för rotatorkuffen'
  },
  {
    id: 'arm_circles',
    name: 'Armcirklar',
    joints: ['shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderFlexion: 90, shoulderAbduction: 90 }, label: 'front' },
      { time: 0.25, pose: { shoulderFlexion: 45, shoulderAbduction: 135 }, label: 'up' },
      { time: 0.5, pose: { shoulderFlexion: 0, shoulderAbduction: 90 }, label: 'back' },
      { time: 0.75, pose: { shoulderFlexion: 45, shoulderAbduction: 45 }, label: 'down' },
      { time: 1, pose: { shoulderFlexion: 90, shoulderAbduction: 90 }, label: 'front' }
    ],
    phases: [
      { name: 'cirkel', startTime: 0, endTime: 1, instruction: 'Rita stora cirklar med utsträckta armar' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.3, max: 1.5, default: 0.8 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'mobility',
    targetMuscles: ['deltoids', 'rotator_cuff', 'trapezius'],
    description: 'Dynamisk uppvärmning för axlarna'
  },

  // ============================================
  // BALANCE EXERCISES (5 animationer)
  // ============================================
  {
    id: 'single_leg_stance',
    name: 'Enbensstående',
    joints: ['hip', 'knee', 'ankle'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { standingHip: 0, standingKnee: 5, raisedHip: 45, raisedKnee: 90 }, label: 'hold' }
    ],
    phases: [
      { name: 'håll', startTime: 0, endTime: 1, instruction: 'Stå på ett ben, håll balansen' }
    ],
    loop: false,
    parameters: {
      rangeOfMotion: { min: 1.0, max: 1.0, default: 1.0 },
      speed: { min: 0, max: 0, default: 0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 10, max: 120, default: 30 },
      resistance: ['none']
    },
    category: 'balance',
    targetMuscles: ['ankle_stabilizers', 'hip_stabilizers', 'core'],
    description: 'Grundläggande balansövning på ett ben'
  },
  {
    id: 'tandem_stance',
    name: 'Tandemstående',
    joints: ['hip', 'ankle'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { frontAnkle: 0, backAnkle: 0 }, label: 'hold' }
    ],
    phases: [
      { name: 'håll', startTime: 0, endTime: 1, instruction: 'Stå med fötterna i linje, häl mot tå' }
    ],
    loop: false,
    parameters: {
      rangeOfMotion: { min: 1.0, max: 1.0, default: 1.0 },
      speed: { min: 0, max: 0, default: 0 },
      supportedLaterality: ['left_front', 'right_front'],
      holdDuration: { min: 10, max: 60, default: 30 },
      resistance: ['none']
    },
    category: 'balance',
    targetMuscles: ['ankle_stabilizers', 'core'],
    description: 'Balansövning med smal bas'
  },
  {
    id: 'heel_to_toe_walk',
    name: 'Balansgång häl-tå',
    joints: ['hip', 'knee', 'ankle'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { leftHip: -20, rightHip: 0 }, label: 'step_left' },
      { time: 0.5, pose: { leftHip: 0, rightHip: -20 }, label: 'step_right' },
      { time: 1, pose: { leftHip: -20, rightHip: 0 }, label: 'step_left' }
    ],
    phases: [
      { name: 'gång', startTime: 0, endTime: 1, instruction: 'Gå med hälen mot tån på varje steg' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.2, max: 0.8, default: 0.4 },
      supportedLaterality: ['alternating'],
      holdDuration: { min: 0, max: 0, default: 0 },
      resistance: ['none']
    },
    category: 'balance',
    targetMuscles: ['ankle_stabilizers', 'core', 'hip_stabilizers'],
    description: 'Gångövning för dynamisk balans'
  },
  {
    id: 'eyes_closed_balance',
    name: 'Balans slutna ögon',
    joints: ['hip', 'knee', 'ankle'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { hip: 0, knee: 5, ankle: 0 }, label: 'hold' }
    ],
    phases: [
      { name: 'håll', startTime: 0, endTime: 1, instruction: 'Stå still med ögonen slutna' }
    ],
    loop: false,
    parameters: {
      rangeOfMotion: { min: 1.0, max: 1.0, default: 1.0 },
      speed: { min: 0, max: 0, default: 0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 10, max: 60, default: 30 },
      resistance: ['none']
    },
    category: 'balance',
    targetMuscles: ['ankle_stabilizers', 'core', 'proprioceptors'],
    description: 'Proprioceptiv balansövning utan visuell input'
  },
  {
    id: 'single_leg_reach',
    name: 'Enbensstående räckning',
    joints: ['hip', 'knee', 'ankle', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { standingHip: 0, standingKnee: 20, raisedHip: 45, armReach: 0 }, label: 'start' },
      { time: 0.5, pose: { standingHip: -30, standingKnee: 40, raisedHip: 70, armReach: 45 }, label: 'reach' },
      { time: 1, pose: { standingHip: 0, standingKnee: 20, raisedHip: 45, armReach: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'räckning', startTime: 0, endTime: 0.5, instruction: 'Böj stående knät och räck framåt' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Res dig tillbaka till start' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.3, max: 1.0, default: 0.5 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'bodyweight']
    },
    category: 'balance',
    targetMuscles: ['quadriceps', 'glutes', 'core', 'ankle_stabilizers'],
    description: 'Dynamisk balansövning med räckning'
  },

  // ============================================
  // CORE STANDING (5 animationer)
  // ============================================
  {
    id: 'standing_crunch',
    name: 'Stående crunch',
    joints: ['spine', 'hip', 'shoulder'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { spineFlexion: 0, shoulderFlexion: 180, hipFlexion: 0 }, label: 'start' },
      { time: 0.5, pose: { spineFlexion: 30, shoulderFlexion: 90, hipFlexion: 30 }, label: 'crunch' },
      { time: 1, pose: { spineFlexion: 0, shoulderFlexion: 180, hipFlexion: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'crunch', startTime: 0, endTime: 0.5, instruction: 'Böj överkroppen, för händerna mot knäna' },
      { name: 'extension', startTime: 0.5, endTime: 1, instruction: 'Sträck ut till start' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'weight']
    },
    category: 'strength',
    targetMuscles: ['rectus_abdominis', 'hip_flexors'],
    description: 'Core-övning i stående position'
  },
  {
    id: 'woodchop',
    name: 'Vedhugg',
    joints: ['spine', 'shoulder', 'hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { spineRotation: 45, shoulderFlexion: 150, hipRotation: 20 }, label: 'high' },
      { time: 0.5, pose: { spineRotation: -45, shoulderFlexion: 30, hipRotation: -20 }, label: 'low' },
      { time: 1, pose: { spineRotation: 45, shoulderFlexion: 150, hipRotation: 20 }, label: 'high' }
    ],
    phases: [
      { name: 'nedhugg', startTime: 0, endTime: 0.5, instruction: 'Diagonal rörelse från hög till låg' },
      { name: 'upphugg', startTime: 0.5, endTime: 1, instruction: 'Tillbaka till startposition' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.5, max: 1.5, default: 1.0 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 1, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'functional',
    targetMuscles: ['obliques', 'rectus_abdominis', 'shoulders', 'hips'],
    description: 'Rotationsövning för core och hela kroppen'
  },
  {
    id: 'pallof_press',
    name: 'Pallof press',
    joints: ['shoulder', 'spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { shoulderFlexion: 90, elbowFlexion: 90, spineRotation: 0 }, label: 'start' },
      { time: 0.5, pose: { shoulderFlexion: 90, elbowFlexion: 0, spineRotation: 0 }, label: 'pressed' },
      { time: 1, pose: { shoulderFlexion: 90, elbowFlexion: 90, spineRotation: 0 }, label: 'end' }
    ],
    phases: [
      { name: 'press', startTime: 0, endTime: 0.5, instruction: 'Pressa händerna framåt, motstå rotation' },
      { name: 'återgång', startTime: 0.5, endTime: 1, instruction: 'Dra tillbaka till bröstet' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.5, max: 1.0, default: 1.0 },
      speed: { min: 0.3, max: 1.0, default: 0.6 },
      supportedLaterality: ['left', 'right'],
      holdDuration: { min: 0, max: 3, default: 1 },
      resistance: ['band', 'cable']
    },
    category: 'strength',
    targetMuscles: ['obliques', 'transverse_abdominis', 'rectus_abdominis'],
    description: 'Anti-rotationsövning för core-stabilitet'
  },
  {
    id: 'standing_rotation',
    name: 'Stående rotation',
    joints: ['spine', 'hip'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { spineRotation: 0 }, label: 'center' },
      { time: 0.25, pose: { spineRotation: 45 }, label: 'right' },
      { time: 0.5, pose: { spineRotation: 0 }, label: 'center' },
      { time: 0.75, pose: { spineRotation: -45 }, label: 'left' },
      { time: 1, pose: { spineRotation: 0 }, label: 'center' }
    ],
    phases: [
      { name: 'höger', startTime: 0, endTime: 0.25, instruction: 'Rotera överkroppen åt höger' },
      { name: 'mitt', startTime: 0.25, endTime: 0.5, instruction: 'Tillbaka till mitten' },
      { name: 'vänster', startTime: 0.5, endTime: 0.75, instruction: 'Rotera överkroppen åt vänster' },
      { name: 'slutmitt', startTime: 0.75, endTime: 1, instruction: 'Tillbaka till mitten' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.3, max: 1.0, default: 0.6 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'band', 'weight']
    },
    category: 'mobility',
    targetMuscles: ['obliques', 'erector_spinae', 'hip_rotators'],
    description: 'Rörlighetsövning för bålrotation'
  },
  {
    id: 'standing_side_bend',
    name: 'Stående sidoböjning',
    joints: ['spine'],
    bodyPosition: 'standing',
    keyframes: [
      { time: 0, pose: { spineLateralFlexion: 0 }, label: 'center' },
      { time: 0.25, pose: { spineLateralFlexion: 30 }, label: 'right' },
      { time: 0.5, pose: { spineLateralFlexion: 0 }, label: 'center' },
      { time: 0.75, pose: { spineLateralFlexion: -30 }, label: 'left' },
      { time: 1, pose: { spineLateralFlexion: 0 }, label: 'center' }
    ],
    phases: [
      { name: 'höger', startTime: 0, endTime: 0.25, instruction: 'Böj åt höger sida' },
      { name: 'mitt', startTime: 0.25, endTime: 0.5, instruction: 'Tillbaka till mitten' },
      { name: 'vänster', startTime: 0.5, endTime: 0.75, instruction: 'Böj åt vänster sida' },
      { name: 'slutmitt', startTime: 0.75, endTime: 1, instruction: 'Tillbaka till mitten' }
    ],
    loop: true,
    parameters: {
      rangeOfMotion: { min: 0.3, max: 1.0, default: 0.7 },
      speed: { min: 0.3, max: 1.0, default: 0.6 },
      supportedLaterality: ['bilateral'],
      holdDuration: { min: 0, max: 2, default: 0 },
      resistance: ['none', 'weight']
    },
    category: 'mobility',
    targetMuscles: ['obliques', 'quadratus_lumborum', 'latissimus_dorsi'],
    description: 'Rörlighets- och styrkeövning för sidan av bålen'
  }
];

// Export med metadata
export const STANDING_ANIMATION_META = {
  count: STANDING_PRIMITIVES.length,
  categories: {
    squat: 7,
    lunge: 5,
    calf_ankle: 5,
    hip: 8,
    shoulder: 10,
    balance: 5,
    core: 5
  },
  totalVariations: STANDING_PRIMITIVES.reduce((sum, p) => {
    const lateralityCount = p.parameters.supportedLaterality.length;
    const hasHold = p.parameters.holdDuration && p.parameters.holdDuration.max > 0;
    const resistanceCount = p.parameters.resistance?.length || 1;
    return sum + (lateralityCount * resistanceCount * (hasHold ? 3 : 1));
  }, 0)
};

export default STANDING_PRIMITIVES;
