import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  hapticService,
  HAPTIC_PATTERNS,
  DEFAULT_HAPTIC_CONFIG,
  HapticPatternName,
} from '../../services/hapticService';

// Mock navigator.vibrate
const mockVibrate = vi.fn().mockReturnValue(true);

describe('HAPTIC_PATTERNS', () => {
  const patternNames: HapticPatternName[] = [
    'success',
    'repComplete',
    'setComplete',
    'exerciseComplete',
    'warning',
    'error',
    'achievement',
    'countdown',
    'start',
    'phaseChange',
    'tap',
    'doubleTap',
  ];

  it('should have all 12 predefined patterns', () => {
    expect(Object.keys(HAPTIC_PATTERNS).length).toBe(12);
  });

  it.each(patternNames)('should have valid %s pattern', (name) => {
    const pattern = HAPTIC_PATTERNS[name];

    expect(pattern).toBeDefined();
    expect(pattern.pattern).toBeDefined();
    expect(Array.isArray(pattern.pattern)).toBe(true);
    expect(pattern.pattern.length).toBeGreaterThan(0);
    expect(pattern.description).toBeDefined();
    expect(typeof pattern.description).toBe('string');
    expect([1, 2, 3]).toContain(pattern.intensity);
  });

  it('should have only positive durations in patterns', () => {
    Object.values(HAPTIC_PATTERNS).forEach((pattern) => {
      pattern.pattern.forEach((duration) => {
        expect(duration).toBeGreaterThan(0);
      });
    });
  });

  it('should have appropriate intensities', () => {
    // Light patterns should be intensity 1
    expect(HAPTIC_PATTERNS.tap.intensity).toBe(1);
    expect(HAPTIC_PATTERNS.countdown.intensity).toBe(1);

    // Strong patterns should be intensity 3
    expect(HAPTIC_PATTERNS.error.intensity).toBe(3);
    expect(HAPTIC_PATTERNS.exerciseComplete.intensity).toBe(3);
  });
});

describe('DEFAULT_HAPTIC_CONFIG', () => {
  it('should have correct default values', () => {
    expect(DEFAULT_HAPTIC_CONFIG.enabled).toBe(true);
    expect(DEFAULT_HAPTIC_CONFIG.respectReducedMotion).toBe(true);
    expect(DEFAULT_HAPTIC_CONFIG.throttleMs).toBeGreaterThan(0);
  });
});

describe('hapticService', () => {
  beforeEach(() => {
    // Setup mock
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });
    mockVibrate.mockClear();

    // Reset service state
    hapticService.enable();
    hapticService.updateConfig({
      throttleMs: 0, // Disable throttling for tests
    });
  });

  afterEach(() => {
    hapticService.stop();
    hapticService.updateConfig(DEFAULT_HAPTIC_CONFIG);
  });

  describe('isAvailable', () => {
    it('should return true when vibrate is supported and enabled', () => {
      expect(hapticService.isAvailable()).toBe(true);
    });

    it('should return false when disabled', () => {
      hapticService.disable();
      expect(hapticService.isAvailable()).toBe(false);
    });
  });

  describe('vibrate', () => {
    it('should call navigator.vibrate with correct pattern', () => {
      hapticService.vibrate('success');

      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.success.pattern);
    });

    it('should return true on successful vibration', () => {
      const result = hapticService.vibrate('success');
      expect(result).toBe(true);
    });

    it('should return false when disabled', () => {
      hapticService.disable();
      mockVibrate.mockClear(); // Clear the stop() call from disable()
      const result = hapticService.vibrate('success');

      expect(result).toBe(false);
      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should return false for unknown pattern', () => {
      // @ts-expect-error Testing invalid input
      const result = hapticService.vibrate('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('vibrateCustom', () => {
    it('should vibrate with custom pattern', () => {
      const customPattern = [100, 50, 100];
      hapticService.vibrateCustom(customPattern);

      expect(mockVibrate).toHaveBeenCalledWith(customPattern);
    });

    it('should return false when disabled', () => {
      hapticService.disable();
      const result = hapticService.vibrateCustom([100]);

      expect(result).toBe(false);
    });
  });

  describe('throttling', () => {
    beforeEach(() => {
      hapticService.updateConfig({ throttleMs: 100 });
      hapticService.resetThrottle();
      mockVibrate.mockClear();
    });

    it('should throttle rapid vibrations', async () => {
      hapticService.vibrate('tap');
      hapticService.vibrate('tap');
      hapticService.vibrate('tap');

      // Should only have called once due to throttling
      expect(mockVibrate).toHaveBeenCalledTimes(1);
    });

    it('should allow vibration after throttle period', async () => {
      hapticService.vibrate('tap');

      // Wait for throttle period
      await new Promise((resolve) => setTimeout(resolve, 150));

      hapticService.vibrate('tap');

      expect(mockVibrate).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('should call vibrate with 0 to stop', () => {
      hapticService.stop();

      expect(mockVibrate).toHaveBeenCalledWith(0);
    });
  });

  describe('convenience methods', () => {
    it('success should vibrate with success pattern', () => {
      hapticService.success();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.success.pattern);
    });

    it('onRepComplete should vibrate with repComplete pattern', () => {
      hapticService.onRepComplete();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.repComplete.pattern);
    });

    it('onSetComplete should vibrate with setComplete pattern', () => {
      hapticService.onSetComplete();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.setComplete.pattern);
    });

    it('onExerciseComplete should vibrate with exerciseComplete pattern', () => {
      hapticService.onExerciseComplete();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.exerciseComplete.pattern);
    });

    it('warning should vibrate with warning pattern', () => {
      hapticService.warning();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.warning.pattern);
    });

    it('error should vibrate with error pattern', () => {
      hapticService.error();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.error.pattern);
    });

    it('onAchievement should vibrate with achievement pattern', () => {
      hapticService.onAchievement();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.achievement.pattern);
    });

    it('tick should vibrate with countdown pattern', () => {
      hapticService.tick();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.countdown.pattern);
    });

    it('tap should vibrate with tap pattern', () => {
      hapticService.tap();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.tap.pattern);
    });

    it('onPhaseChange should vibrate with phaseChange pattern', () => {
      hapticService.onPhaseChange();
      expect(mockVibrate).toHaveBeenCalledWith(HAPTIC_PATTERNS.phaseChange.pattern);
    });
  });

  describe('enable/disable', () => {
    it('enable should allow vibrations', () => {
      hapticService.disable();
      hapticService.enable();

      const result = hapticService.vibrate('tap');
      expect(result).toBe(true);
    });

    it('disable should prevent vibrations', () => {
      hapticService.disable();

      const result = hapticService.vibrate('tap');
      expect(result).toBe(false);
    });

    it('disable should stop ongoing vibration', () => {
      hapticService.disable();

      expect(mockVibrate).toHaveBeenCalledWith(0);
    });

    it('toggle should switch state', () => {
      const initialState = hapticService.isAvailable();
      hapticService.toggle();
      const newState = hapticService.isAvailable();

      expect(newState).toBe(!initialState);

      // Toggle back
      hapticService.toggle();
    });
  });

  describe('configuration', () => {
    it('updateConfig should update settings', () => {
      hapticService.updateConfig({ throttleMs: 200 });
      const config = hapticService.getConfig();

      expect(config.throttleMs).toBe(200);
    });

    it('getConfig should return current config', () => {
      const config = hapticService.getConfig();

      expect(config.enabled).toBeDefined();
      expect(config.respectReducedMotion).toBeDefined();
      expect(config.throttleMs).toBeDefined();
    });

    it('getPatterns should return all patterns', () => {
      const patterns = hapticService.getPatterns();

      expect(Object.keys(patterns).length).toBe(12);
      expect(patterns.success).toBeDefined();
      expect(patterns.error).toBeDefined();
    });

    it('addPattern should add custom pattern', () => {
      const customPattern = {
        pattern: [200, 100, 200],
        description: 'Custom test pattern',
        intensity: 2 as const,
      };

      hapticService.addPattern('success', customPattern);
      const patterns = hapticService.getPatterns();

      expect(patterns.success).toEqual(customPattern);

      // Restore original
      hapticService.addPattern('success', HAPTIC_PATTERNS.success);
    });
  });
});

describe('hapticService without vibration support', () => {
  beforeEach(() => {
    // Remove vibrate support
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it('should handle missing vibration API gracefully', () => {
    // Creating a new service without vibrate support
    // The singleton already exists, so we just verify it handles it
    expect(() => hapticService.vibrate('success')).not.toThrow();
  });
});

describe('prefers-reduced-motion', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    });
    mockVibrate.mockClear();
  });

  it('should have respectReducedMotion enabled by default', () => {
    const config = hapticService.getConfig();
    expect(config.respectReducedMotion).toBe(true);
  });

  it('should allow disabling respectReducedMotion', () => {
    hapticService.updateConfig({ respectReducedMotion: false });
    const config = hapticService.getConfig();

    expect(config.respectReducedMotion).toBe(false);

    // Reset
    hapticService.updateConfig({ respectReducedMotion: true });
  });
});
