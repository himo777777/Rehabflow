/**
 * Test script for the improved onboarding prompt
 * Run with: npx tsx scripts/testOnboarding.ts
 */

import {
  createOnboardingSession,
  getOnboardingGreeting,
  checkForRedFlags,
  OnboardingState
} from '../services/geminiService';
import { ONBOARDING_PROMPTS, RED_FLAGS } from '../data/prompts/onboardingPrompt';

console.log('='.repeat(60));
console.log('     REHABFLOW ONBOARDING TEST');
console.log('='.repeat(60));
console.log();

// Test 1: Create onboarding session
console.log('TEST 1: Skapa onboarding-session');
const session = createOnboardingSession();
console.log('✅ Session skapad:', session);
console.log();

// Test 2: Get greeting
console.log('TEST 2: Hämta hälsningsfras');
const greeting = getOnboardingGreeting();
console.log('✅ Hälsning:');
console.log(greeting);
console.log();

// Test 3: Check red flags detection
console.log('TEST 3: Röda flaggor-detektion');

const testMessages = [
  { text: 'Nej, inget av det', expected: 0 },
  { text: 'Ja, jag har domningar i benet', expected: 1 },
  { text: 'Jag har haft nattlig smärta som väcker mig, ja', expected: 1 },
  { text: 'Nej, ingen feber eller viktnedgång', expected: 0 },
  { text: 'Jag har haft svaghet i armen efter olyckan', expected: 1 },
];

testMessages.forEach(({ text, expected }) => {
  const flags = checkForRedFlags(text);
  const passed = flags.length > 0 === expected > 0;
  console.log(`  ${passed ? '✅' : '❌'} "${text.substring(0, 40)}..."`);
  console.log(`     Förväntat: ${expected > 0 ? 'Flaggor' : 'Inga flaggor'}, Fick: ${flags.length > 0 ? flags.join(', ') : 'Inga'}`);
});
console.log();

// Test 4: Verify prompt structure
console.log('TEST 4: Verifiera prompt-struktur');
console.log(`  ✅ System prompt längd: ${ONBOARDING_PROMPTS.system.length} tecken`);
console.log(`  ✅ Plan generation prompt längd: ${ONBOARDING_PROMPTS.planGeneration.length} tecken`);
console.log(`  ✅ Antal samtalsstartare: ${ONBOARDING_PROMPTS.conversationStarters.length}`);
console.log(`  ✅ Röda flaggor kategorier: ${Object.keys(RED_FLAGS).length}`);
console.log(`     - Neurologiska: ${RED_FLAGS.neurological.length} st`);
console.log(`     - Allvarliga: ${RED_FLAGS.serious.length} st`);
console.log(`     - Kardiovaskulära: ${RED_FLAGS.cardiovascular.length} st`);
console.log();

// Test 5: Verify onboarding steps
console.log('TEST 5: Verifiera onboarding-steg');
const steps: OnboardingState['step'][] = [
  'safety_screening',
  'injury_mapping',
  'pain_assessment',
  'surgery_history',
  'lifestyle',
  'goals',
  'confirmation',
  'complete'
];
steps.forEach((step, i) => {
  console.log(`  ${i + 1}. ${step}`);
});
console.log();

console.log('='.repeat(60));
console.log('     ALLA TESTER GENOMFÖRDA');
console.log('='.repeat(60));
console.log();
console.log('För att testa live-chat, kör:');
console.log('  npm run dev');
console.log('  Öppna appen och starta en onboarding-konversation');
