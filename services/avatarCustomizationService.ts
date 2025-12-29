/**
 * Avatar Customization Service
 *
 * Manages avatar appearance customization including:
 * - Skin tones
 * - Clothing colors
 * - Hair styles
 * - Accessories
 * - Body proportions
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AvatarAppearance {
  skinTone: SkinTone;
  clothingColor: ClothingColor;
  hairStyle: HairStyle;
  hairColor: HairColor;
  bodyType: BodyType;
  gender: 'male' | 'female' | 'neutral';
  accessories: AvatarAccessory[];
}

export type SkinTone =
  | 'light-1'
  | 'light-2'
  | 'light-3'
  | 'medium-1'
  | 'medium-2'
  | 'medium-3'
  | 'dark-1'
  | 'dark-2'
  | 'dark-3';

export type ClothingColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'gray'
  | 'black'
  | 'white'
  | 'pink';

export type HairStyle =
  | 'none'
  | 'short'
  | 'medium'
  | 'long'
  | 'ponytail'
  | 'bun'
  | 'curly'
  | 'buzz';

export type HairColor =
  | 'black'
  | 'brown-dark'
  | 'brown-light'
  | 'blonde'
  | 'red'
  | 'gray'
  | 'white';

export type BodyType =
  | 'slim'
  | 'average'
  | 'athletic'
  | 'broad';

export type AvatarAccessory =
  | 'headband'
  | 'wristband'
  | 'glasses'
  | 'watch';

// ============================================================================
// COLOR PALETTES
// ============================================================================

export const SKIN_TONE_COLORS: Record<SkinTone, string> = {
  'light-1': '#ffe0bd',
  'light-2': '#ffdbac',
  'light-3': '#ffd0a0',
  'medium-1': '#e0ac69',
  'medium-2': '#c68642',
  'medium-3': '#a57033',
  'dark-1': '#8d5524',
  'dark-2': '#5c3317',
  'dark-3': '#3b1f0f',
};

export const CLOTHING_COLORS: Record<ClothingColor, { primary: string; secondary: string }> = {
  blue: { primary: '#4f86f7', secondary: '#3b6fd9' },
  green: { primary: '#22c55e', secondary: '#16a34a' },
  red: { primary: '#ef4444', secondary: '#dc2626' },
  purple: { primary: '#a855f7', secondary: '#9333ea' },
  orange: { primary: '#f97316', secondary: '#ea580c' },
  teal: { primary: '#14b8a6', secondary: '#0d9488' },
  gray: { primary: '#6b7280', secondary: '#4b5563' },
  black: { primary: '#1f2937', secondary: '#111827' },
  white: { primary: '#f9fafb', secondary: '#e5e7eb' },
  pink: { primary: '#ec4899', secondary: '#db2777' },
};

export const HAIR_COLORS: Record<HairColor, string> = {
  'black': '#1a1a1a',
  'brown-dark': '#3d2314',
  'brown-light': '#7b5a47',
  'blonde': '#d4a55e',
  'red': '#a43820',
  'gray': '#9ca3af',
  'white': '#f3f4f6',
};

export const PANTS_COLOR = '#2d3748';
export const SHOE_COLOR = '#333333';

// ============================================================================
// BODY PROPORTIONS
// ============================================================================

export const BODY_PROPORTIONS: Record<BodyType, {
  torsoScale: { x: number; y: number; z: number };
  armScale: number;
  legScale: number;
}> = {
  slim: {
    torsoScale: { x: 0.9, y: 1, z: 0.9 },
    armScale: 0.9,
    legScale: 0.95,
  },
  average: {
    torsoScale: { x: 1, y: 1, z: 1 },
    armScale: 1,
    legScale: 1,
  },
  athletic: {
    torsoScale: { x: 1.1, y: 1, z: 1.05 },
    armScale: 1.1,
    legScale: 1.05,
  },
  broad: {
    torsoScale: { x: 1.2, y: 0.98, z: 1.1 },
    armScale: 1.15,
    legScale: 1.1,
  },
};

// ============================================================================
// DEFAULT APPEARANCE
// ============================================================================

export const DEFAULT_APPEARANCE: AvatarAppearance = {
  skinTone: 'light-2',
  clothingColor: 'blue',
  hairStyle: 'short',
  hairColor: 'brown-dark',
  bodyType: 'average',
  gender: 'neutral',
  accessories: [],
};

// ============================================================================
// SERVICE
// ============================================================================

class AvatarCustomizationService {
  private currentAppearance: AvatarAppearance = { ...DEFAULT_APPEARANCE };
  private storageKey = 'avatar_customization';
  private listeners: Set<(appearance: AvatarAppearance) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get current appearance
   */
  getAppearance(): AvatarAppearance {
    return { ...this.currentAppearance };
  }

  /**
   * Update appearance
   */
  setAppearance(appearance: Partial<AvatarAppearance>): void {
    this.currentAppearance = {
      ...this.currentAppearance,
      ...appearance,
    };
    this.saveToStorage();
    this.notifyListeners();
    logger.info('[AvatarCustomization] Appearance updated', appearance);
  }

  /**
   * Reset to default
   */
  resetToDefault(): void {
    this.currentAppearance = { ...DEFAULT_APPEARANCE };
    this.saveToStorage();
    this.notifyListeners();
    logger.info('[AvatarCustomization] Reset to default');
  }

  /**
   * Get colors for current appearance
   */
  getColors(): {
    skin: string;
    shirt: string;
    shirtSecondary: string;
    pants: string;
    shoes: string;
    hair: string;
  } {
    return {
      skin: SKIN_TONE_COLORS[this.currentAppearance.skinTone],
      shirt: CLOTHING_COLORS[this.currentAppearance.clothingColor].primary,
      shirtSecondary: CLOTHING_COLORS[this.currentAppearance.clothingColor].secondary,
      pants: PANTS_COLOR,
      shoes: SHOE_COLOR,
      hair: HAIR_COLORS[this.currentAppearance.hairColor],
    };
  }

  /**
   * Get body proportions
   */
  getProportions(): typeof BODY_PROPORTIONS['average'] {
    return BODY_PROPORTIONS[this.currentAppearance.bodyType];
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: (appearance: AvatarAppearance) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get available options
   */
  getOptions(): {
    skinTones: SkinTone[];
    clothingColors: ClothingColor[];
    hairStyles: HairStyle[];
    hairColors: HairColor[];
    bodyTypes: BodyType[];
    accessories: AvatarAccessory[];
  } {
    return {
      skinTones: Object.keys(SKIN_TONE_COLORS) as SkinTone[],
      clothingColors: Object.keys(CLOTHING_COLORS) as ClothingColor[],
      hairStyles: ['none', 'short', 'medium', 'long', 'ponytail', 'bun', 'curly', 'buzz'],
      hairColors: Object.keys(HAIR_COLORS) as HairColor[],
      bodyTypes: Object.keys(BODY_PROPORTIONS) as BodyType[],
      accessories: ['headband', 'wristband', 'glasses', 'watch'],
    };
  }

  /**
   * Toggle accessory
   */
  toggleAccessory(accessory: AvatarAccessory): void {
    const accessories = [...this.currentAppearance.accessories];
    const index = accessories.indexOf(accessory);

    if (index >= 0) {
      accessories.splice(index, 1);
    } else {
      accessories.push(accessory);
    }

    this.setAppearance({ accessories });
  }

  /**
   * Check if accessory is equipped
   */
  hasAccessory(accessory: AvatarAccessory): boolean {
    return this.currentAppearance.accessories.includes(accessory);
  }

  // Private methods

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentAppearance = {
          ...DEFAULT_APPEARANCE,
          ...parsed,
        };
      }
    } catch (error) {
      logger.warn('[AvatarCustomization] Failed to load from storage', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.currentAppearance));
    } catch (error) {
      logger.warn('[AvatarCustomization] Failed to save to storage', error);
    }
  }

  private notifyListeners(): void {
    const appearance = this.getAppearance();
    this.listeners.forEach((listener) => {
      try {
        listener(appearance);
      } catch (error) {
        logger.error('[AvatarCustomization] Listener error', error);
      }
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const avatarCustomizationService = new AvatarCustomizationService();

// ============================================================================
// REACT HOOK
// ============================================================================

import { useState, useEffect } from 'react';

export function useAvatarCustomization() {
  const [appearance, setAppearance] = useState<AvatarAppearance>(
    avatarCustomizationService.getAppearance()
  );

  useEffect(() => {
    const unsubscribe = avatarCustomizationService.subscribe(setAppearance);
    return unsubscribe;
  }, []);

  return {
    appearance,
    colors: avatarCustomizationService.getColors(),
    proportions: avatarCustomizationService.getProportions(),
    options: avatarCustomizationService.getOptions(),
    setAppearance: (partial: Partial<AvatarAppearance>) =>
      avatarCustomizationService.setAppearance(partial),
    resetToDefault: () => avatarCustomizationService.resetToDefault(),
    toggleAccessory: (accessory: AvatarAccessory) =>
      avatarCustomizationService.toggleAccessory(accessory),
    hasAccessory: (accessory: AvatarAccessory) =>
      avatarCustomizationService.hasAccessory(accessory),
  };
}

export default avatarCustomizationService;
