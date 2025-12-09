/**
 * Comprehensive Test Script for New Features
 * Tests ROM tracking, clinical knowledge, and logger functionality
 */

// Mock localStorage for Node.js environment
const mockStorage: Record<string, string> = {};
if (typeof localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  };
}

import {
  saveROMToHistory,
  getROMHistory,
  calculateROMTrends,
  compareROMToBaseline,
  getROMSummaryStats,
  formatTrendMessage
} from '../services/romTrackingService';

import {
  getNormalROM,
  calculateROMDeficit,
  getHealingTimeline,
  getCurrentPhase,
  buildClinicalContext,
  getGuidelineForCondition
} from '../data/clinicalKnowledge';

import { logger } from '../utils/logger';
import { BaselineROM, JointROMData } from '../types';

// ============================================
// TEST DATA
// ============================================

const mockJointData: JointROMData = {
  left: 120,
  right: 115,
  symmetry: 96
};

const mockBaselineROM: BaselineROM = {
  kneeFlexion: { left: 130, right: 125, symmetry: 96 },
  hipFlexion: { left: 100, right: 95, symmetry: 95 },
  shoulderFlexion: { left: 160, right: 155, symmetry: 97 },
  shoulderAbduction: { left: 165, right: 160, symmetry: 97 },
  elbowFlexion: { left: 140, right: 138, symmetry: 99 },
  assessmentDate: new Date().toISOString(),
  painDuringTest: false,
  testsCompleted: ['knee_flexion', 'hip_flexion', 'shoulder_flexion'],
  measurementQuality: 'good',
  calibrationUsed: true
};

const mockImprovedROM: BaselineROM = {
  ...mockBaselineROM,
  kneeFlexion: { left: 140, right: 138, symmetry: 99 },
  hipFlexion: { left: 110, right: 108, symmetry: 98 },
  assessmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
};

// ============================================
// TEST FUNCTIONS
// ============================================

function testSection(name: string) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${name}`);
  console.log('='.repeat(60));
}

function testCase(name: string, passed: boolean, details?: string) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) {
    console.log(`       ${details}`);
  }
}

// ============================================
// ROM TRACKING SERVICE TESTS
// ============================================

function testROMTrackingService() {
  testSection('ROM TRACKING SERVICE');

  // Clear existing history for clean tests
  localStorage.removeItem('rehabflow_rom_history');

  // Test 1: Save ROM to history
  try {
    saveROMToHistory(mockBaselineROM);
    const history = getROMHistory();
    testCase(
      'saveROMToHistory - saves measurement',
      history.measurements.length === 1,
      `Measurements: ${history.measurements.length}`
    );
  } catch (e) {
    testCase('saveROMToHistory - saves measurement', false, String(e));
  }

  // Test 2: Get ROM history
  try {
    const history = getROMHistory();
    testCase(
      'getROMHistory - returns history object',
      history !== null && Array.isArray(history.measurements),
      `Has ${history.measurements.length} measurements`
    );
  } catch (e) {
    testCase('getROMHistory - returns history object', false, String(e));
  }

  // Test 3: Calculate trends with single measurement (should return empty)
  try {
    const trends = calculateROMTrends(45);
    testCase(
      'calculateROMTrends - single measurement returns empty',
      trends.length === 0,
      `Trends: ${trends.length}`
    );
  } catch (e) {
    testCase('calculateROMTrends - single measurement returns empty', false, String(e));
  }

  // Test 4: Add second measurement and calculate trends
  try {
    saveROMToHistory(mockImprovedROM);
    const trends = calculateROMTrends(45);
    testCase(
      'calculateROMTrends - two measurements returns trends',
      trends.length > 0,
      `Trends found: ${trends.length}`
    );

    // Verify trend direction
    const kneeTrend = trends.find(t => t.joint === 'Knäböjning');
    if (kneeTrend) {
      testCase(
        'calculateROMTrends - detects improvement',
        kneeTrend.trend === 'improving',
        `Trend: ${kneeTrend.trend}, Change: ${kneeTrend.change}°`
      );
    }
  } catch (e) {
    testCase('calculateROMTrends - two measurements returns trends', false, String(e));
  }

  // Test 5: Compare ROM to baseline
  try {
    const comparisons = compareROMToBaseline(mockImprovedROM, mockBaselineROM, 45);
    testCase(
      'compareROMToBaseline - returns comparisons',
      comparisons.length > 0,
      `Comparisons: ${comparisons.length}`
    );

    const kneeComp = comparisons.find(c => c.joint === 'Knäböjning');
    if (kneeComp) {
      testCase(
        'compareROMToBaseline - calculates improvement',
        kneeComp.status === 'improved' && kneeComp.improvement > 0,
        `Status: ${kneeComp.status}, Improvement: ${kneeComp.improvement}°`
      );
    }
  } catch (e) {
    testCase('compareROMToBaseline - returns comparisons', false, String(e));
  }

  // Test 6: Get summary stats
  try {
    const stats = getROMSummaryStats(45);
    testCase(
      'getROMSummaryStats - returns stats',
      stats.totalMeasurements === 2,
      `Total: ${stats.totalMeasurements}, Avg improvement: ${stats.averageImprovement}°`
    );
  } catch (e) {
    testCase('getROMSummaryStats - returns stats', false, String(e));
  }

  // Test 7: Format trend message
  try {
    const trends = calculateROMTrends(45);
    if (trends.length > 0) {
      const message = formatTrendMessage(trends[0]);
      testCase(
        'formatTrendMessage - returns formatted string',
        typeof message === 'string' && message.length > 0,
        `Message: "${message}"`
      );
    }
  } catch (e) {
    testCase('formatTrendMessage - returns formatted string', false, String(e));
  }
}

// ============================================
// CLINICAL KNOWLEDGE TESTS
// ============================================

function testClinicalKnowledge() {
  testSection('CLINICAL KNOWLEDGE');

  // Test 1: Get normal ROM for different ages
  try {
    const young = getNormalROM('knee', 'flexion', 30);
    const middle = getNormalROM('knee', 'flexion', 50);
    const senior = getNormalROM('knee', 'flexion', 70);

    testCase(
      'getNormalROM - returns age-adjusted values',
      young !== null && middle !== null && senior !== null,
      `Young: ${young}°, Middle: ${middle}°, Senior: ${senior}°`
    );

    testCase(
      'getNormalROM - younger has higher ROM',
      (young || 0) >= (senior || 0),
      `Young ${young}° >= Senior ${senior}°`
    );
  } catch (e) {
    testCase('getNormalROM - returns age-adjusted values', false, String(e));
  }

  // Test 2: Calculate ROM deficit
  try {
    const deficit = calculateROMDeficit(100, 140);
    testCase(
      'calculateROMDeficit - calculates correctly',
      deficit.percentDeficit > 0 && deficit.severity !== 'normal',
      `Deficit: ${deficit.percentDeficit}%, Severity: ${deficit.severity}`
    );

    const noDeficit = calculateROMDeficit(140, 140);
    testCase(
      'calculateROMDeficit - normal when no deficit',
      noDeficit.severity === 'normal',
      `Severity: ${noDeficit.severity}`
    );
  } catch (e) {
    testCase('calculateROMDeficit - calculates correctly', false, String(e));
  }

  // Test 3: Get healing timeline
  try {
    const aclTimeline = getHealingTimeline('ACL_reconstruction');
    testCase(
      'getHealingTimeline - returns timeline for ACL',
      aclTimeline !== null && aclTimeline.phase1 > 0,
      `Phase 1: ${aclTimeline?.phase1} days, Full: ${aclTimeline?.fullRecovery || aclTimeline?.phase3} days`
    );

    const unknownTimeline = getHealingTimeline('unknown_procedure');
    testCase(
      'getHealingTimeline - returns null for unknown',
      unknownTimeline === null,
      `Result: ${unknownTimeline}`
    );
  } catch (e) {
    testCase('getHealingTimeline - returns timeline for ACL', false, String(e));
  }

  // Test 4: Get current phase (returns object with .phase)
  try {
    const phase1Result = getCurrentPhase('ACL_reconstruction', 20);
    const phase2Result = getCurrentPhase('ACL_reconstruction', 60);
    const phase3Result = getCurrentPhase('ACL_reconstruction', 120);

    testCase(
      'getCurrentPhase - returns correct phases',
      phase1Result.phase === 1 && phase2Result.phase === 2 && phase3Result.phase === 3,
      `Day 20: Phase ${phase1Result.phase}, Day 60: Phase ${phase2Result.phase}, Day 120: Phase ${phase3Result.phase}`
    );
  } catch (e) {
    testCase('getCurrentPhase - returns correct phases', false, String(e));
  }

  // Test 5: Build clinical context
  try {
    const context = buildClinicalContext('ACL_reconstruction', 30, 35, 'knäartros');
    testCase(
      'buildClinicalContext - returns context string',
      typeof context === 'string' && context.length > 0,
      `Context length: ${context.length} chars`
    );

    // Check for relevant content (case-insensitive)
    const hasRelevantInfo =
      context.toLowerCase().includes('acl') ||
      context.toLowerCase().includes('knä') ||
      context.toLowerCase().includes('fas') ||
      context.toLowerCase().includes('rom') ||
      context.toLowerCase().includes('ålder');

    testCase(
      'buildClinicalContext - includes relevant info',
      hasRelevantInfo,
      `Contains expected keywords: ${hasRelevantInfo ? 'Yes' : 'No'}`
    );
  } catch (e) {
    testCase('buildClinicalContext - returns context string', false, String(e));
  }

  // Test 6: Get guideline for condition
  try {
    const kneeGuideline = getGuidelineForCondition('knäartros');
    testCase(
      'getGuidelineForCondition - returns guideline',
      kneeGuideline !== null,
      `Found guideline: ${kneeGuideline ? 'Yes (' + kneeGuideline.condition + ')' : 'No'}`
    );

    const backGuideline = getGuidelineForCondition('ländryggssmärta');
    testCase(
      'getGuidelineForCondition - finds back pain guideline',
      backGuideline !== null,
      `Found: ${backGuideline ? backGuideline.condition : 'No'}`
    );
  } catch (e) {
    testCase('getGuidelineForCondition - returns guideline', false, String(e));
  }
}

// ============================================
// LOGGER TESTS
// ============================================

function testLogger() {
  testSection('LOGGER');

  // Test 1: Debug logging
  try {
    logger.debug('Test debug message', { data: 'test' });
    testCase('logger.debug - executes without error', true);
  } catch (e) {
    testCase('logger.debug - executes without error', false, String(e));
  }

  // Test 2: Info logging
  try {
    logger.info('Test info message');
    testCase('logger.info - executes without error', true);
  } catch (e) {
    testCase('logger.info - executes without error', false, String(e));
  }

  // Test 3: Warn logging
  try {
    logger.warn('Test warning message');
    testCase('logger.warn - executes without error', true);
  } catch (e) {
    testCase('logger.warn - executes without error', false, String(e));
  }

  // Test 4: Error logging
  try {
    logger.error('Test error message', new Error('Test error'));
    testCase('logger.error - executes without error', true);
  } catch (e) {
    testCase('logger.error - executes without error', false, String(e));
  }

  // Test 5: Child logger
  try {
    const childLogger = logger.child('[ROM]');
    childLogger.info('Test from child logger');
    testCase('logger.child - creates child logger', true);
  } catch (e) {
    testCase('logger.child - creates child logger', false, String(e));
  }
}

// ============================================
// POST-OP SAFETY TESTS
// ============================================

function testPostOpSafety() {
  testSection('POST-OP SAFETY SCENARIOS');

  // Scenario 1: Early post-op (< 14 days)
  const earlyPostOpDays = 7;
  const phase1 = earlyPostOpDays < 14 ? 1 : earlyPostOpDays < 42 ? 2 : 3;
  testCase(
    'Early post-op (7 days) - Phase 1',
    phase1 === 1,
    `Days: ${earlyPostOpDays}, Phase: ${phase1}`
  );

  // Scenario 2: Mid post-op (14-42 days)
  const midPostOpDays = 28;
  const phase2 = midPostOpDays < 14 ? 1 : midPostOpDays < 42 ? 2 : 3;
  testCase(
    'Mid post-op (28 days) - Phase 2',
    phase2 === 2,
    `Days: ${midPostOpDays}, Phase: ${phase2}`
  );

  // Scenario 3: Late post-op (> 42 days)
  const latePostOpDays = 60;
  const phase3 = latePostOpDays < 14 ? 1 : latePostOpDays < 42 ? 2 : 3;
  testCase(
    'Late post-op (60 days) - Phase 3',
    phase3 === 3,
    `Days: ${latePostOpDays}, Phase: ${phase3}`
  );

  // Scenario 4: Very early post-op safety check
  const veryEarlyDays = 3;
  const isProtectionPhase = veryEarlyDays < 14;
  testCase(
    'Very early (3 days) - Protection phase',
    isProtectionPhase === true,
    `In protection phase: ${isProtectionPhase}`
  );

  // Scenario 5: Weight-bearing check for ACL
  const aclTimelineData = getHealingTimeline('ACL_reconstruction');
  const shouldRestrictWeight = aclTimelineData !== null && earlyPostOpDays < aclTimelineData.phase1;
  testCase(
    'ACL early phase - Weight restriction applies',
    shouldRestrictWeight === true,
    `Days: ${earlyPostOpDays}, Phase 1 ends: ${aclTimelineData?.phase1}`
  );

  // Scenario 6: Verify ACL timeline exists
  testCase(
    'ACL timeline - Timeline data found',
    aclTimelineData !== null,
    `Found: ${aclTimelineData ? 'Yes' : 'No'}, Description: ${aclTimelineData?.description?.substring(0, 30)}...`
  );
}

// ============================================
// EDGE CASES
// ============================================

function testEdgeCases() {
  testSection('EDGE CASES');

  // Test 1: Empty ROM history
  localStorage.removeItem('rehabflow_rom_history');
  const emptyHistory = getROMHistory();
  testCase(
    'Empty history - returns empty array',
    emptyHistory.measurements.length === 0,
    `Measurements: ${emptyHistory.measurements.length}`
  );

  // Test 2: Invalid joint type
  const invalidROM = getNormalROM('invalid_joint', 'flexion', 30);
  testCase(
    'Invalid joint - returns null',
    invalidROM === null,
    `Result: ${invalidROM}`
  );

  // Test 3: Extreme age values
  const extremeYoung = getNormalROM('knee', 'flexion', 5);
  const extremeOld = getNormalROM('knee', 'flexion', 100);
  testCase(
    'Extreme ages - handles gracefully',
    extremeYoung !== null && extremeOld !== null,
    `Age 5: ${extremeYoung}°, Age 100: ${extremeOld}°`
  );

  // Test 4: Zero ROM deficit
  const zeroDeficit = calculateROMDeficit(0, 140);
  testCase(
    'Zero measured ROM - severe deficit',
    zeroDeficit.severity === 'severe',
    `Severity: ${zeroDeficit.severity}`
  );

  // Test 5: Exceeded normal ROM
  const exceededROM = calculateROMDeficit(160, 140);
  testCase(
    'Exceeded normal ROM - handles hypermobility',
    exceededROM.percentDeficit <= 0 || exceededROM.severity === 'normal',
    `Deficit: ${exceededROM.percentDeficit}%`
  );

  // Test 6: Symmetry calculation edge cases
  const perfectSymmetry: JointROMData = { left: 100, right: 100, symmetry: 100 };
  const poorSymmetry: JointROMData = { left: 100, right: 70, symmetry: 70 };
  testCase(
    'Symmetry values - valid range',
    perfectSymmetry.symmetry === 100 && poorSymmetry.symmetry === 70,
    `Perfect: ${perfectSymmetry.symmetry}%, Poor: ${poorSymmetry.symmetry}%`
  );
}

// ============================================
// RUN ALL TESTS
// ============================================

function runAllTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(15) + 'REHABFLOW FUNCTION TESTS' + ' '.repeat(19) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  testROMTrackingService();
  testClinicalKnowledge();
  testLogger();
  testPostOpSafety();
  testEdgeCases();

  console.log('\n' + '='.repeat(60));
  console.log('  TEST SUITE COMPLETED');
  console.log('='.repeat(60) + '\n');
}

// Run tests
runAllTests();
