// Input validation utilities

import { ERROR_MESSAGES } from './errorMessages';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

// Basic validators
export const validators = {
  required: (value: unknown): ValidationResult => {
    const isValid = value !== null && value !== undefined && value !== '';
    return {
      isValid,
      error: isValid ? undefined : ERROR_MESSAGES.REQUIRED_FIELD
    };
  },

  minLength: (min: number) => (value: string): ValidationResult => {
    const isValid = value.length >= min;
    return {
      isValid,
      error: isValid ? undefined : `Minst ${min} tecken krävs`
    };
  },

  maxLength: (max: number) => (value: string): ValidationResult => {
    const isValid = value.length <= max;
    return {
      isValid,
      error: isValid ? undefined : `Max ${max} tecken tillåtet`
    };
  },

  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      error: isValid ? undefined : ERROR_MESSAGES.INVALID_EMAIL
    };
  },

  number: (value: unknown): ValidationResult => {
    const isValid = typeof value === 'number' && !isNaN(value);
    return {
      isValid,
      error: isValid ? undefined : 'Måste vara ett nummer'
    };
  },

  range: (min: number, max: number) => (value: number): ValidationResult => {
    const isValid = value >= min && value <= max;
    return {
      isValid,
      error: isValid ? undefined : `Värdet måste vara mellan ${min} och ${max}`
    };
  },

  age: (value: number): ValidationResult => {
    const isValid = value >= 1 && value <= 120;
    return {
      isValid,
      error: isValid ? undefined : 'Ange en giltig ålder (1-120)'
    };
  },

  painLevel: (value: number): ValidationResult => {
    const isValid = value >= 0 && value <= 10;
    return {
      isValid,
      error: isValid ? undefined : 'Smärtnivå måste vara mellan 0 och 10'
    };
  }
};

// Combine multiple validators
export const combineValidators = <T>(
  ...validatorFns: ((value: T) => ValidationResult)[]
) => (value: T): ValidationResult => {
  for (const validate of validatorFns) {
    const result = validate(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};

// Validate an object against a schema
export interface ValidationSchema<T> {
  [K in keyof T]?: ((value: T[K]) => ValidationResult)[];
}

export const validateObject = <T extends Record<string, unknown>>(
  obj: T,
  schema: ValidationSchema<T>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const key of Object.keys(schema) as (keyof T)[]) {
    const validators = schema[key];
    if (!validators) continue;

    for (const validate of validators) {
      const result = validate(obj[key]);
      if (!result.isValid) {
        errors[key] = result.error;
        isValid = false;
        break;
      }
    }
  }

  return { isValid, errors };
};

// Sanitize user input
export const sanitize = {
  // Remove potentially dangerous HTML
  html: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  // Trim and normalize whitespace
  text: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ');
  },

  // Remove non-numeric characters except decimal point
  number: (input: string): string => {
    return input.replace(/[^\d.-]/g, '');
  }
};
