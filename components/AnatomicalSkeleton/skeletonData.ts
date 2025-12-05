/**
 * Anatomical Skeleton Data
 *
 * Coordinate System:
 * - viewBox: 0 0 200 830 (width 200, height 830)
 * - 1 head unit = 104px (total height 830 ≈ 8 head heights)
 * - Center x = 100
 * - Top of skull at y = 8
 * - Pelvis center at y ≈ 415 (half body height)
 * - Feet at y ≈ 820
 *
 * Anatomical Proportions (standard adult):
 * - Total height: 8 head units
 * - Chin at: 1.2 head units (~122px)
 * - Shoulders: 1.8 head units (~185px)
 * - Nipple line: 2.2 head units (~230px)
 * - Elbows: 2.8 head units (~295px)
 * - Navel: 2.8 head units (~295px)
 * - Pubic symphysis: 4.1 head units (~430px) - midpoint
 * - Mid-thigh: 5 head units (~520px)
 * - Knee: 5.8 head units (~600px)
 * - Mid-calf: 6.7 head units (~700px)
 * - Ankles: 7.5 head units (~775px)
 * - Feet: 7.9 head units (~820px)
 *
 * To add a new clickable region:
 * 1. Add entry to SKELETON_REGIONS array
 * 2. Specify coordinates for each view (front, back, side)
 * 3. Set paired: true and side: 'left'|'right' for bilateral regions
 */

export interface SkeletonRegion {
  id: string;
  label: string;
  labelEn: string;
  description: string;
  coordinates: {
    front?: { x: number; y: number; radius: number };
    back?: { x: number; y: number; radius: number };
    side?: { x: number; y: number; radius: number };
  };
  paired?: boolean;
  side?: 'left' | 'right';
}

// Head unit in pixels (total height 830 / 8 ≈ 104)
export const HEAD_UNIT = 104;
export const SVG_WIDTH = 200;
export const SVG_HEIGHT = 830;
export const CENTER_X = 100;

// Key anatomical Y positions (matched to SkeletonSVG.tsx line-art style)
export const Y_POSITIONS = {
  skullTop: 12,
  chin: 128,                          // Mandible bottom
  shoulders: 195,                     // Shoulder joints
  nippleLine: 235,                    // Mid-thorax
  elbows: 300,                        // Elbow joint
  navel: 285,                         // Xiphoid level
  wrists: 395,                        // Wrist/carpal area
  pubicSymphysis: 435,                // Pubic symphysis
  midThigh: 520,                      // Mid-femur
  knees: 608,                         // Patella
  midCalf: 695,                       // Mid tibia/fibula
  ankles: 778,                        // Ankle joint
  feet: 806,                          // Foot/metatarsals
};

// X offsets from center for key structures (matched to line-art skeleton)
export const X_OFFSETS = {
  shoulder: 52,    // Shoulder joints (at x=48 and x=152)
  elbow: 60,       // Elbow joints (at x=40 and x=160)
  wrist: 66,       // Wrist joints (at x=34 and x=166)
  hand: 74,        // Hand center
  hip: 32,         // Hip joints (at x=68 and x=132)
  groin: 20,       // Inguinal area
  knee: 26,        // Knee joints (at x=74 and x=126)
  ankle: 26,       // Ankle joints
  foot: 26,        // Foot center
};

export const SKELETON_REGIONS: SkeletonRegion[] = [
  // === HEAD & NECK ===
  {
    id: 'Nacke',
    label: 'Nacke',
    labelEn: 'Neck',
    description: 'Cervikalgi, Whiplash, Diskbråck eller Spänningshuvudvärk.',
    coordinates: {
      front: { x: CENTER_X, y: 155, radius: 12 },
      back: { x: CENTER_X, y: 145, radius: 12 },
    },
  },

  // === SHOULDERS (paired) ===
  {
    id: 'Axlar',
    label: 'Höger Axel',
    labelEn: 'Right Shoulder',
    description: 'Impingement, Rotatorcuff-ruptur, Frozen Shoulder eller AC-led.',
    coordinates: {
      front: { x: 48, y: Y_POSITIONS.shoulders, radius: 13 },
      back: { x: 40, y: 192, radius: 13 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Axlar',
    label: 'Vänster Axel',
    labelEn: 'Left Shoulder',
    description: 'Impingement, Rotatorcuff-ruptur, Frozen Shoulder eller AC-led.',
    coordinates: {
      front: { x: 152, y: Y_POSITIONS.shoulders, radius: 13 },
      back: { x: 160, y: 192, radius: 13 },
    },
    paired: true,
    side: 'left',
  },

  // === CHEST/THORAX ===
  {
    id: 'Bröstrygg',
    label: 'Bröst',
    labelEn: 'Chest',
    description: 'Thorakal segmentell dysfunktion, "Låsning" eller Stress.',
    coordinates: {
      front: { x: CENTER_X, y: 240, radius: 16 },
    },
  },

  // === SCAPULAE (paired, back only) ===
  {
    id: 'Skulderblad',
    label: 'Höger Skulderblad',
    labelEn: 'Right Scapula',
    description: 'Skulderbladsdysfunktion, Muskelspänning eller Snapping scapula.',
    coordinates: {
      back: { x: 65, y: 230, radius: 16 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Skulderblad',
    label: 'Vänster Skulderblad',
    labelEn: 'Left Scapula',
    description: 'Skulderbladsdysfunktion, Muskelspänning eller Snapping scapula.',
    coordinates: {
      back: { x: 135, y: 230, radius: 16 },
    },
    paired: true,
    side: 'left',
  },

  // === ELBOWS (paired) ===
  {
    id: 'Armbåge',
    label: 'Höger Armbåge',
    labelEn: 'Right Elbow',
    description: 'Lateral epikondylit (Tennis), Medial (Golf) eller Bursit.',
    coordinates: {
      front: { x: 40, y: Y_POSITIONS.elbows, radius: 12 },
      back: { x: 32, y: 305, radius: 12 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Armbåge',
    label: 'Vänster Armbåge',
    labelEn: 'Left Elbow',
    description: 'Lateral epikondylit (Tennis), Medial (Golf) eller Bursit.',
    coordinates: {
      front: { x: 160, y: Y_POSITIONS.elbows, radius: 12 },
      back: { x: 168, y: 305, radius: 12 },
    },
    paired: true,
    side: 'left',
  },

  // === LOWER BACK ===
  {
    id: 'Ländrygg',
    label: 'Ländrygg',
    labelEn: 'Lower Back',
    description: 'Lumbago (Ryggskott), Ischias, Diskbråck eller Spinal stenos.',
    coordinates: {
      back: { x: CENTER_X, y: 320, radius: 15 },
    },
  },

  // === WRISTS (paired) ===
  {
    id: 'Handled',
    label: 'Höger Handled',
    labelEn: 'Right Wrist',
    description: 'Karpaltunnelsyndrom, TFCC-skada eller Överbelastning.',
    coordinates: {
      front: { x: 34, y: Y_POSITIONS.wrists, radius: 10 },
      back: { x: 27, y: 395, radius: 10 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Handled',
    label: 'Vänster Handled',
    labelEn: 'Left Wrist',
    description: 'Karpaltunnelsyndrom, TFCC-skada eller Överbelastning.',
    coordinates: {
      front: { x: 166, y: Y_POSITIONS.wrists, radius: 10 },
      back: { x: 173, y: 395, radius: 10 },
    },
    paired: true,
    side: 'left',
  },

  // === GROIN/HIP (paired) ===
  {
    id: 'Ljumskar',
    label: 'Höger Ljumske',
    labelEn: 'Right Groin',
    description: 'FAI (Impingement), Adduktor-tendinopati eller Sportbråck.',
    coordinates: {
      front: { x: 82, y: Y_POSITIONS.pubicSymphysis, radius: 12 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Ljumskar',
    label: 'Vänster Ljumske',
    labelEn: 'Left Groin',
    description: 'FAI (Impingement), Adduktor-tendinopati eller Sportbråck.',
    coordinates: {
      front: { x: 118, y: Y_POSITIONS.pubicSymphysis, radius: 12 },
    },
    paired: true,
    side: 'left',
  },

  // === HIP JOINTS (paired) ===
  {
    id: 'Höft',
    label: 'Höger Höft',
    labelEn: 'Right Hip',
    description: 'Höftledsartros, FAI, Labrumskada eller Trochanterit.',
    coordinates: {
      front: { x: 68, y: 415, radius: 14 },
      back: { x: 68, y: 445, radius: 14 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Höft',
    label: 'Vänster Höft',
    labelEn: 'Left Hip',
    description: 'Höftledsartros, FAI, Labrumskada eller Trochanterit.',
    coordinates: {
      front: { x: 132, y: 415, radius: 14 },
      back: { x: 132, y: 445, radius: 14 },
    },
    paired: true,
    side: 'left',
  },

  // === BUTTOCKS (paired, back only) ===
  {
    id: 'Säte',
    label: 'Höger Säte',
    labelEn: 'Right Buttock',
    description: 'Gluteal tendinopati, Piriformis-syndrom eller Höftledsartros.',
    coordinates: {
      back: { x: 72, y: 450, radius: 14 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Säte',
    label: 'Vänster Säte',
    labelEn: 'Left Buttock',
    description: 'Gluteal tendinopati, Piriformis-syndrom eller Höftledsartros.',
    coordinates: {
      back: { x: 128, y: 450, radius: 14 },
    },
    paired: true,
    side: 'left',
  },

  // === POSTERIOR THIGH (paired, back only) ===
  {
    id: 'Lår (Bak)',
    label: 'Höger Baksida Lår',
    labelEn: 'Right Hamstring',
    description: 'Hamstrings-ruptur/tendinopati (Löparskada).',
    coordinates: {
      back: { x: 72, y: Y_POSITIONS.midThigh, radius: 14 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Lår (Bak)',
    label: 'Vänster Baksida Lår',
    labelEn: 'Left Hamstring',
    description: 'Hamstrings-ruptur/tendinopati (Löparskada).',
    coordinates: {
      back: { x: 128, y: Y_POSITIONS.midThigh, radius: 14 },
    },
    paired: true,
    side: 'left',
  },

  // === ANTERIOR THIGH (paired, front only) ===
  {
    id: 'Lår (Fram)',
    label: 'Höger Framsida Lår',
    labelEn: 'Right Quadriceps',
    description: 'Quadriceps-sträckning, Patellarsenstendinopati eller Kontusion.',
    coordinates: {
      front: { x: 74, y: Y_POSITIONS.midThigh, radius: 14 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Lår (Fram)',
    label: 'Vänster Framsida Lår',
    labelEn: 'Left Quadriceps',
    description: 'Quadriceps-sträckning, Patellarsenstendinopati eller Kontusion.',
    coordinates: {
      front: { x: 126, y: Y_POSITIONS.midThigh, radius: 14 },
    },
    paired: true,
    side: 'left',
  },

  // === KNEES (paired) ===
  {
    id: 'Knä',
    label: 'Höger Knä',
    labelEn: 'Right Knee',
    description: 'Patellofemoralt smärtsyndrom (PFSS), Menisk, Korsband eller Artros.',
    coordinates: {
      front: { x: 74, y: Y_POSITIONS.knees, radius: 14 },
      back: { x: 73, y: 618, radius: 14 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Knä',
    label: 'Vänster Knä',
    labelEn: 'Left Knee',
    description: 'Patellofemoralt smärtsyndrom (PFSS), Menisk, Korsband eller Artros.',
    coordinates: {
      front: { x: 126, y: Y_POSITIONS.knees, radius: 14 },
      back: { x: 127, y: 618, radius: 14 },
    },
    paired: true,
    side: 'left',
  },

  // === SHIN (paired, front only) ===
  {
    id: 'Underben',
    label: 'Höger Smalben',
    labelEn: 'Right Shin',
    description: 'Medialt Tibialt Stressyndrom (Benhinnor) eller Kompartment.',
    coordinates: {
      front: { x: 75, y: Y_POSITIONS.midCalf, radius: 12 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Underben',
    label: 'Vänster Smalben',
    labelEn: 'Left Shin',
    description: 'Medialt Tibialt Stressyndrom (Benhinnor) eller Kompartment.',
    coordinates: {
      front: { x: 125, y: Y_POSITIONS.midCalf, radius: 12 },
    },
    paired: true,
    side: 'left',
  },

  // === CALF (paired, back only) ===
  {
    id: 'Vad',
    label: 'Höger Vad',
    labelEn: 'Right Calf',
    description: 'Gastrocnemius-ruptur (Gubbvad) eller Akillestendinopati.',
    coordinates: {
      back: { x: 74, y: Y_POSITIONS.midCalf, radius: 12 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Vad',
    label: 'Vänster Vad',
    labelEn: 'Left Calf',
    description: 'Gastrocnemius-ruptur (Gubbvad) eller Akillestendinopati.',
    coordinates: {
      back: { x: 126, y: Y_POSITIONS.midCalf, radius: 12 },
    },
    paired: true,
    side: 'left',
  },

  // === ANKLES (paired) ===
  {
    id: 'Fotled',
    label: 'Höger Fotled',
    labelEn: 'Right Ankle',
    description: 'Fotledsstukning, Akillestendinit eller Impingement.',
    coordinates: {
      front: { x: 74, y: Y_POSITIONS.ankles, radius: 11 },
      back: { x: 72, y: 778, radius: 11 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Fotled',
    label: 'Vänster Fotled',
    labelEn: 'Left Ankle',
    description: 'Fotledsstukning, Akillestendinit eller Impingement.',
    coordinates: {
      front: { x: 126, y: Y_POSITIONS.ankles, radius: 11 },
      back: { x: 128, y: 778, radius: 11 },
    },
    paired: true,
    side: 'left',
  },

  // === HEEL (paired, back only) ===
  {
    id: 'Häl',
    label: 'Höger Häl',
    labelEn: 'Right Heel',
    description: 'Plantar fasciit (Hälsporre), Haglunds häl eller Fettkudde.',
    coordinates: {
      back: { x: 72, y: 795, radius: 11 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Häl',
    label: 'Vänster Häl',
    labelEn: 'Left Heel',
    description: 'Plantar fasciit (Hälsporre), Haglunds häl eller Fettkudde.',
    coordinates: {
      back: { x: 128, y: 795, radius: 11 },
    },
    paired: true,
    side: 'left',
  },

  // === FOOT (paired, front only) ===
  {
    id: 'Fot',
    label: 'Höger Fot',
    labelEn: 'Right Foot',
    description: "Metatarsalgi, Morton's neurom eller Hallux valgus.",
    coordinates: {
      front: { x: 75, y: Y_POSITIONS.feet, radius: 12 },
    },
    paired: true,
    side: 'right',
  },
  {
    id: 'Fot',
    label: 'Vänster Fot',
    labelEn: 'Left Foot',
    description: "Metatarsalgi, Morton's neurom eller Hallux valgus.",
    coordinates: {
      front: { x: 125, y: Y_POSITIONS.feet, radius: 12 },
    },
    paired: true,
    side: 'left',
  },
];

// Helper to get regions for a specific view
export const getRegionsForView = (view: 'front' | 'back' | 'side'): SkeletonRegion[] => {
  return SKELETON_REGIONS.filter(region => region.coordinates[view] !== undefined);
};

// Helper to mirror x-coordinate (for generating mirrored pairs)
export const mirrorX = (x: number): number => {
  return CENTER_X + (CENTER_X - x);
};
