/**
 * AI Services - Modulär struktur för AI-funktionalitet
 *
 * Denna modul är en del av FAS 6: Modularisering
 *
 * Re-exporterar:
 * - AI konfiguration och prompts
 * - Validerings-helpers
 * - Typer för AI-kommunikation
 *
 * Framtida modularisering:
 * - programGenerationService.ts - Programgenerering
 * - chatService.ts - AI-chat
 * - movementAnalysisService.ts - Rörelseanalys
 */

// ============================================
// RE-EXPORTS FROM aiConfig
// ============================================

export {
  // Configuration
  AI_CONFIG,

  // Prompts
  SAFETY_SYSTEM_PROMPT,
  PROGRAM_GENERATION_PROMPT,
  CHAT_SYSTEM_PROMPT,
  MOVEMENT_ANALYSIS_PROMPT,

  // Types
  type AIMessage,
  type AIRequestOptions,
  type AIResponse,
  type StreamCallbacks,
  type GeneratedExercise,
  type GeneratedProgram,

  // Validation helpers
  validateProgramResponse,
  sanitizeAIResponse,
  extractJSON,
} from './aiConfig';

// ============================================
// FACADE FOR EXISTING geminiService
// ============================================

// Re-export main functions from geminiService for backward compatibility
// This allows gradual migration to the new modular structure

import {
  generateRehabProgram,
  chatWithPT,
  chatWithPTStreaming,
  onboardingChatStreaming,
  generateOnboardingFollowUps,
  generateAdaptiveAdjustments,
  generateWeeklyAnalysis,
  generateAlternativeExercise,
} from '../geminiService';

// Program generation
export { generateRehabProgram };

// Chat functionality
export {
  chatWithPT,
  chatWithPTStreaming,
  onboardingChatStreaming
};

// Onboarding
export { generateOnboardingFollowUps };

// Exercise management
export { generateAdaptiveAdjustments, generateAlternativeExercise };

// Analysis
export { generateWeeklyAnalysis };

// ============================================
// CONVENIENCE TYPE EXPORTS
// ============================================

export type { LogLevel, LogEntry } from '../../lib/logger';
