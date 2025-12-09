import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
  balanceService,
  calculateCenterOfMass,
  calculateCOMVelocity,
  calculateWeightDistribution,
  calculateBalanceCompensation,
  calculateNaturalSway,
  applyBalanceCompensation,
  calculateGroundContact,
  calculateFootIKTarget,
  SEGMENT_MASS,
  DEFAULT_BALANCE_CONFIG,
  SegmentPosition,
  FootPositions,
} from '../../services/balanceService';

// Helper function to create default segment positions
function createDefaultSegmentPositions(): SegmentPosition {
  return {
    head: new THREE.Vector3(0, 1.7, 0),
    trunk: new THREE.Vector3(0, 1.2, 0),
    leftUpperArm: new THREE.Vector3(-0.2, 1.4, 0),
    rightUpperArm: new THREE.Vector3(0.2, 1.4, 0),
    leftForearm: new THREE.Vector3(-0.25, 1.1, 0),
    rightForearm: new THREE.Vector3(0.25, 1.1, 0),
    leftHand: new THREE.Vector3(-0.3, 0.9, 0),
    rightHand: new THREE.Vector3(0.3, 0.9, 0),
    leftUpperLeg: new THREE.Vector3(-0.1, 0.8, 0),
    rightUpperLeg: new THREE.Vector3(0.1, 0.8, 0),
    leftLowerLeg: new THREE.Vector3(-0.1, 0.4, 0),
    rightLowerLeg: new THREE.Vector3(0.1, 0.4, 0),
    leftFoot: new THREE.Vector3(-0.15, 0, 0),
    rightFoot: new THREE.Vector3(0.15, 0, 0),
  };
}

// Helper function to create default foot positions
function createDefaultFootPositions(): FootPositions {
  return {
    left: new THREE.Vector3(-0.15, 0, 0),
    right: new THREE.Vector3(0.15, 0, 0),
    leftNormal: new THREE.Vector3(0, 1, 0),
    rightNormal: new THREE.Vector3(0, 1, 0),
  };
}

describe('SEGMENT_MASS', () => {
  it('should have all segments defined', () => {
    expect(SEGMENT_MASS.head).toBeDefined();
    expect(SEGMENT_MASS.trunk).toBeDefined();
    expect(SEGMENT_MASS.leftUpperArm).toBeDefined();
    expect(SEGMENT_MASS.rightUpperArm).toBeDefined();
    expect(SEGMENT_MASS.leftFoot).toBeDefined();
    expect(SEGMENT_MASS.rightFoot).toBeDefined();
  });

  it('should sum to approximately 1 (100%)', () => {
    const total = Object.values(SEGMENT_MASS).reduce((sum, mass) => sum + mass, 0);
    expect(total).toBeCloseTo(1, 1);
  });

  it('should have trunk as heaviest segment', () => {
    expect(SEGMENT_MASS.trunk).toBeGreaterThan(SEGMENT_MASS.head);
    expect(SEGMENT_MASS.trunk).toBeGreaterThan(SEGMENT_MASS.leftUpperLeg);
  });
});

describe('calculateCenterOfMass', () => {
  it('should calculate COM for symmetric standing pose', () => {
    const positions = createDefaultSegmentPositions();
    const com = calculateCenterOfMass(positions);

    // COM should be roughly centered horizontally
    expect(Math.abs(com.x)).toBeLessThan(0.1);
    // COM should be at reasonable height
    expect(com.y).toBeGreaterThan(0.5);
    expect(com.y).toBeLessThan(1.5);
    // COM should be near Z=0
    expect(Math.abs(com.z)).toBeLessThan(0.1);
  });

  it('should shift COM when limbs move', () => {
    const positions = createDefaultSegmentPositions();
    const comBefore = calculateCenterOfMass(positions);

    // Move left arm far to the left
    positions.leftUpperArm = new THREE.Vector3(-1, 1.4, 0);
    positions.leftForearm = new THREE.Vector3(-1.2, 1.1, 0);
    positions.leftHand = new THREE.Vector3(-1.4, 0.9, 0);

    const comAfter = calculateCenterOfMass(positions);

    // COM should shift left
    expect(comAfter.x).toBeLessThan(comBefore.x);
  });

  it('should return Vector3', () => {
    const positions = createDefaultSegmentPositions();
    const com = calculateCenterOfMass(positions);

    expect(com).toBeInstanceOf(THREE.Vector3);
  });
});

describe('calculateCOMVelocity', () => {
  it('should return zero velocity for stationary COM', () => {
    const com = new THREE.Vector3(0, 1, 0);
    const velocity = calculateCOMVelocity(com, com.clone(), 0.016);

    expect(velocity.length()).toBeCloseTo(0, 5);
  });

  it('should calculate correct velocity for moving COM', () => {
    const previousCOM = new THREE.Vector3(0, 1, 0);
    const currentCOM = new THREE.Vector3(0.1, 1, 0);
    const deltaTime = 0.1; // 100ms

    const velocity = calculateCOMVelocity(previousCOM, currentCOM, deltaTime);

    // Velocity should be 0.1m / 0.1s = 1 m/s in X direction
    expect(velocity.x).toBeCloseTo(1, 1);
    expect(velocity.y).toBeCloseTo(0, 5);
    expect(velocity.z).toBeCloseTo(0, 5);
  });
});

describe('calculateWeightDistribution', () => {
  it('should return even distribution when COM is centered', () => {
    const com = new THREE.Vector3(0, 1, 0);
    const feet = createDefaultFootPositions();

    const distribution = calculateWeightDistribution(com, feet);

    expect(distribution.footPressure.left).toBeCloseTo(0.5, 1);
    expect(distribution.footPressure.right).toBeCloseTo(0.5, 1);
  });

  it('should shift weight to left foot when COM moves left', () => {
    const com = new THREE.Vector3(-0.1, 1, 0); // COM to the left
    const feet = createDefaultFootPositions();

    const distribution = calculateWeightDistribution(com, feet);

    expect(distribution.footPressure.left).toBeGreaterThan(0.5);
    expect(distribution.footPressure.right).toBeLessThan(0.5);
  });

  it('should shift weight to right foot when COM moves right', () => {
    const com = new THREE.Vector3(0.1, 1, 0); // COM to the right
    const feet = createDefaultFootPositions();

    const distribution = calculateWeightDistribution(com, feet);

    expect(distribution.footPressure.right).toBeGreaterThan(0.5);
    expect(distribution.footPressure.left).toBeLessThan(0.5);
  });

  it('should detect single leg stance', () => {
    const com = new THREE.Vector3(-0.14, 1, 0); // COM over left foot
    const feet = createDefaultFootPositions();

    const distribution = calculateWeightDistribution(com, feet);

    expect(distribution.stancePhase).toBe('left');
    expect(distribution.footPressure.left).toBeGreaterThan(0.9);
  });

  it('should calculate stability index', () => {
    const com = new THREE.Vector3(0, 1, 0);
    const feet = createDefaultFootPositions();

    const distribution = calculateWeightDistribution(com, feet);

    expect(distribution.stabilityIndex).toBeGreaterThanOrEqual(0);
    expect(distribution.stabilityIndex).toBeLessThanOrEqual(1);
  });

  it('should calculate base of support', () => {
    const com = new THREE.Vector3(0, 1, 0);
    const feet = createDefaultFootPositions();

    const distribution = calculateWeightDistribution(com, feet);

    expect(distribution.baseOfSupport).toBeDefined();
    expect(distribution.baseOfSupport.width).toBeGreaterThan(0);
    expect(distribution.baseOfSupport.depth).toBeGreaterThan(0);
  });
});

describe('calculateBalanceCompensation', () => {
  it('should return minimal compensation for balanced pose', () => {
    const com = new THREE.Vector3(0, 1, 0);
    const feet = createDefaultFootPositions();
    const weight = calculateWeightDistribution(com, feet);

    const compensation = calculateBalanceCompensation(weight);

    expect(compensation.hipShift.length()).toBeLessThan(0.1);
    expect(Math.abs(compensation.trunkLean.x)).toBeLessThan(0.1);
    expect(Math.abs(compensation.trunkLean.z)).toBeLessThan(0.1);
  });

  it('should compensate when COM is off-center', () => {
    const com = new THREE.Vector3(0.1, 1, 0); // COM to the right
    const feet = createDefaultFootPositions();
    const weight = calculateWeightDistribution(com, feet);

    const compensation = calculateBalanceCompensation(weight);

    // Hip should shift opposite to COM deviation
    expect(compensation.hipShift.x).toBeLessThan(0);
  });

  it('should spread arms when unstable', () => {
    const com = new THREE.Vector3(0.2, 1, 0); // COM far to the right
    const feet = createDefaultFootPositions();
    const weight = calculateWeightDistribution(com, feet);

    const compensation = calculateBalanceCompensation(weight);

    // Arms should spread when unstable
    expect(compensation.armPosition.left.x).toBeLessThan(0);
    expect(compensation.armPosition.right.x).toBeGreaterThan(0);
  });

  it('should respect config compensation strength', () => {
    const com = new THREE.Vector3(0.1, 1, 0);
    const feet = createDefaultFootPositions();
    const weight = calculateWeightDistribution(com, feet);

    const fullCompensation = calculateBalanceCompensation(weight, {
      ...DEFAULT_BALANCE_CONFIG,
      compensationStrength: 1.0,
    });

    const halfCompensation = calculateBalanceCompensation(weight, {
      ...DEFAULT_BALANCE_CONFIG,
      compensationStrength: 0.5,
    });

    expect(Math.abs(fullCompensation.hipShift.x)).toBeGreaterThan(
      Math.abs(halfCompensation.hipShift.x)
    );
  });
});

describe('calculateNaturalSway', () => {
  it('should return sway state', () => {
    const sway = calculateNaturalSway(0);

    expect(sway.offset).toBeInstanceOf(THREE.Vector3);
    expect(sway.velocity).toBeInstanceOf(THREE.Vector3);
    expect(typeof sway.phase).toBe('number');
  });

  it('should change over time', () => {
    const sway1 = calculateNaturalSway(0);
    const sway2 = calculateNaturalSway(1);

    expect(sway1.offset.distanceTo(sway2.offset)).toBeGreaterThan(0);
  });

  it('should stay within amplitude bounds', () => {
    const amplitude = DEFAULT_BALANCE_CONFIG.swayAmplitude;

    for (let t = 0; t < 10; t += 0.1) {
      const sway = calculateNaturalSway(t);
      // Offset should be within amplitude * 2 (due to combining multiple waves)
      expect(Math.abs(sway.offset.x)).toBeLessThan(amplitude * 2);
      expect(Math.abs(sway.offset.z)).toBeLessThan(amplitude * 2);
    }
  });

  it('should keep Y offset at zero', () => {
    const sway = calculateNaturalSway(1.5);
    expect(sway.offset.y).toBe(0);
  });
});

describe('applyBalanceCompensation', () => {
  it('should apply hip shift to position', () => {
    const rootPosition = new THREE.Vector3(0, 1, 0);
    const rootRotation = new THREE.Euler(0, 0, 0);
    const compensation = {
      hipShift: new THREE.Vector3(0.05, 0, 0.02),
      trunkLean: new THREE.Euler(0, 0, 0),
      armPosition: {
        left: new THREE.Vector3(0, 0, 0),
        right: new THREE.Vector3(0, 0, 0),
      },
    };

    const result = applyBalanceCompensation(rootPosition, rootRotation, compensation);

    expect(result.position.x).toBeCloseTo(0.05, 3);
    expect(result.position.z).toBeCloseTo(0.02, 3);
  });

  it('should apply trunk lean to rotation', () => {
    const rootPosition = new THREE.Vector3(0, 1, 0);
    const rootRotation = new THREE.Euler(0, 0, 0);
    const compensation = {
      hipShift: new THREE.Vector3(0, 0, 0),
      trunkLean: new THREE.Euler(0.1, 0, 0.05),
      armPosition: {
        left: new THREE.Vector3(0, 0, 0),
        right: new THREE.Vector3(0, 0, 0),
      },
    };

    const result = applyBalanceCompensation(rootPosition, rootRotation, compensation);

    // Rotation should be different from original
    expect(result.rotation.x).not.toBe(0);
  });
});

describe('calculateGroundContact', () => {
  it('should detect grounded foot', () => {
    const footPosition = new THREE.Vector3(0, 0, 0);
    const contact = calculateGroundContact(footPosition);

    expect(contact.isGrounded).toBe(true);
    expect(contact.penetrationDepth).toBe(0);
  });

  it('should detect airborne foot', () => {
    const footPosition = new THREE.Vector3(0, 0.1, 0);
    const contact = calculateGroundContact(footPosition);

    expect(contact.isGrounded).toBe(false);
  });

  it('should clamp foot to ground', () => {
    const footPosition = new THREE.Vector3(0, -0.05, 0);
    const contact = calculateGroundContact(footPosition);

    expect(contact.position.y).toBe(0);
    expect(contact.penetrationDepth).toBeGreaterThan(0);
  });

  it('should handle custom ground height', () => {
    const footPosition = new THREE.Vector3(0, 0.5, 0);
    const contact = calculateGroundContact(footPosition, 0.5);

    expect(contact.isGrounded).toBe(true);
  });

  it('should return upward normal', () => {
    const footPosition = new THREE.Vector3(0, 0, 0);
    const contact = calculateGroundContact(footPosition);

    expect(contact.normal.x).toBe(0);
    expect(contact.normal.y).toBe(1);
    expect(contact.normal.z).toBe(0);
  });
});

describe('calculateFootIKTarget', () => {
  it('should keep grounded foot on ground', () => {
    const hipPosition = new THREE.Vector3(0, 0.9, 0);
    const footPosition = new THREE.Vector3(0, 0, 0);

    const target = calculateFootIKTarget(hipPosition, footPosition);

    expect(target.y).toBe(0);
  });

  it('should lift swinging foot', () => {
    const hipPosition = new THREE.Vector3(0, 0.9, 0);
    const footPosition = new THREE.Vector3(0, 0.1, 0); // Foot in air

    const target = calculateFootIKTarget(hipPosition, footPosition, 0, 0.05);

    expect(target.y).toBe(0.05); // Step height
  });

  it('should preserve X and Z coordinates', () => {
    const hipPosition = new THREE.Vector3(0, 0.9, 0);
    const footPosition = new THREE.Vector3(0.1, 0, 0.2);

    const target = calculateFootIKTarget(hipPosition, footPosition);

    expect(target.x).toBe(0.1);
    expect(target.z).toBe(0.2);
  });
});

describe('balanceService class', () => {
  beforeEach(() => {
    balanceService.reset();
  });

  describe('update', () => {
    it('should return weight distribution, compensation, and sway', () => {
      const positions = createDefaultSegmentPositions();
      const feet = createDefaultFootPositions();

      const result = balanceService.update(positions, feet, 0.016);

      expect(result.weight).toBeDefined();
      expect(result.compensation).toBeDefined();
      expect(result.sway).toBeDefined();
      expect(result.comVelocity).toBeDefined();
    });

    it('should calculate COM velocity after second update', () => {
      const positions = createDefaultSegmentPositions();
      const feet = createDefaultFootPositions();

      // First update
      balanceService.update(positions, feet, 0.016);

      // Move trunk slightly
      positions.trunk = new THREE.Vector3(0.1, 1.2, 0);

      // Second update
      const result = balanceService.update(positions, feet, 0.016);

      expect(result.comVelocity.length()).toBeGreaterThan(0);
    });
  });

  describe('getWeight', () => {
    it('should return null before first update', () => {
      expect(balanceService.getWeight()).toBeNull();
    });

    it('should return weight after update', () => {
      const positions = createDefaultSegmentPositions();
      const feet = createDefaultFootPositions();
      balanceService.update(positions, feet, 0.016);

      expect(balanceService.getWeight()).not.toBeNull();
    });
  });

  describe('isBalanced', () => {
    it('should return true for balanced pose', () => {
      const positions = createDefaultSegmentPositions();
      const feet = createDefaultFootPositions();
      balanceService.update(positions, feet, 0.016);

      expect(balanceService.isBalanced()).toBe(true);
    });
  });

  describe('getFootIKTargets', () => {
    it('should return targets for both feet', () => {
      const hipPosition = new THREE.Vector3(0, 0.9, 0);
      const leftFoot = new THREE.Vector3(-0.15, 0, 0);
      const rightFoot = new THREE.Vector3(0.15, 0, 0);

      const targets = balanceService.getFootIKTargets(hipPosition, leftFoot, rightFoot);

      expect(targets.left).toBeInstanceOf(THREE.Vector3);
      expect(targets.right).toBeInstanceOf(THREE.Vector3);
    });
  });

  describe('reset', () => {
    it('should clear previous state', () => {
      const positions = createDefaultSegmentPositions();
      const feet = createDefaultFootPositions();
      balanceService.update(positions, feet, 0.016);

      balanceService.reset();

      expect(balanceService.getWeight()).toBeNull();
    });
  });

  describe('config', () => {
    it('should update config', () => {
      balanceService.updateConfig({ swayAmplitude: 0.05 });
      const config = balanceService.getConfig();

      expect(config.swayAmplitude).toBe(0.05);

      // Reset to default
      balanceService.updateConfig({ swayAmplitude: DEFAULT_BALANCE_CONFIG.swayAmplitude });
    });

    it('should return current config', () => {
      const config = balanceService.getConfig();

      expect(config.swayAmplitude).toBeDefined();
      expect(config.swayFrequency).toBeDefined();
      expect(config.compensationStrength).toBeDefined();
      expect(config.stabilityThreshold).toBeDefined();
    });
  });
});
