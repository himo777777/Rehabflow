// Swedish error messages for better user experience
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Kunde inte ansluta till servern. Kontrollera din internetanslutning.',
  TIMEOUT: 'Förfrågan tog för lång tid. Försök igen.',

  // API errors
  API_KEY_MISSING: 'API-nyckel saknas. Kontakta support.',
  API_RATE_LIMIT: 'För många förfrågningar. Vänta en stund och försök igen.',
  API_ERROR: 'Ett fel uppstod vid kommunikation med AI-tjänsten.',

  // AI errors
  AI_GENERATION_FAILED: 'Kunde inte generera program. Försök igen.',
  AI_PARSING_ERROR: 'Kunde inte tolka AI-svaret. Försök igen.',
  AI_CHAT_ERROR: 'Kunde inte ansluta till coachen just nu.',

  // Storage errors
  STORAGE_SAVE_ERROR: 'Kunde inte spara dina framsteg.',
  STORAGE_LOAD_ERROR: 'Kunde inte ladda sparad data.',
  SYNC_ERROR: 'Kunde inte synkronisera med molnet.',

  // Form errors
  VALIDATION_ERROR: 'Vänligen kontrollera att alla fält är korrekt ifyllda.',
  REQUIRED_FIELD: 'Detta fält är obligatoriskt.',
  INVALID_EMAIL: 'Ange en giltig e-postadress.',

  // General
  UNKNOWN_ERROR: 'Ett oväntat fel uppstod. Försök igen.',
  TRY_AGAIN: 'Försök igen',
  CONTACT_SUPPORT: 'Om problemet kvarstår, kontakta support.'
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

// Helper to get user-friendly error message
export const getErrorMessage = (error: unknown, fallbackKey: ErrorMessageKey = 'UNKNOWN_ERROR'): string => {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT;
    }
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return ERROR_MESSAGES.API_RATE_LIMIT;
    }
  }

  return ERROR_MESSAGES[fallbackKey];
};
