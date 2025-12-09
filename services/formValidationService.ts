/**
 * Form Validation Service - Sprint 5.12
 *
 * Advanced form validation with real-time feedback.
 * Features:
 * - Schema-based validation
 * - Real-time field validation
 * - Custom validators
 * - Async validation (uniqueness checks)
 * - Localized error messages
 * - Accessibility support (ARIA)
 * - Form state management
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ValidatorFn<T = unknown> = (value: T, context?: ValidationContext) => ValidationResult;
export type AsyncValidatorFn<T = unknown> = (value: T, context?: ValidationContext) => Promise<ValidationResult>;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorKey?: string; // For i18n
  details?: Record<string, unknown>;
}

export interface ValidationContext {
  formData: Record<string, unknown>;
  fieldName: string;
  touched: boolean;
  dirty: boolean;
}

export interface FieldSchema<T = unknown> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea';
  required?: boolean;
  validators?: ValidatorFn<T>[];
  asyncValidators?: AsyncValidatorFn<T>[];
  defaultValue?: T;
  placeholder?: string;
  options?: { value: string; label: string }[];
  dependsOn?: string[];
  validateOn?: 'change' | 'blur' | 'submit';
  debounceMs?: number;
}

export interface FormSchema {
  id: string;
  fields: FieldSchema[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrorsOn?: 'touched' | 'dirty' | 'submit' | 'always';
}

export interface FieldState<T = unknown> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
  valid: boolean;
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  validating: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// ============================================================================
// ERROR MESSAGES (Swedish)
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  required: 'Detta fält är obligatoriskt',
  email: 'Ange en giltig e-postadress',
  minLength: 'Måste vara minst {min} tecken',
  maxLength: 'Får vara max {max} tecken',
  min: 'Måste vara minst {min}',
  max: 'Får vara max {max}',
  pattern: 'Ogiltigt format',
  url: 'Ange en giltig URL',
  phone: 'Ange ett giltigt telefonnummer',
  date: 'Ange ett giltigt datum',
  dateMin: 'Datumet måste vara efter {min}',
  dateMax: 'Datumet måste vara före {max}',
  number: 'Måste vara ett nummer',
  integer: 'Måste vara ett heltal',
  positive: 'Måste vara ett positivt tal',
  personnummer: 'Ange ett giltigt personnummer',
  postalCode: 'Ange ett giltigt postnummer',
  match: 'Fälten matchar inte',
  unique: 'Värdet finns redan',
  password: 'Lösenordet måste innehålla minst en stor bokstav, en liten bokstav och en siffra',
  passwordStrength: 'Lösenordet är för svagt',
  custom: 'Ogiltig inmatning',
};

function formatError(key: string, params?: Record<string, unknown>): string {
  let message = ERROR_MESSAGES[key] || ERROR_MESSAGES.custom;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      message = message.replace(`{${k}}`, String(v));
    });
  }
  return message;
}

// ============================================================================
// BUILT-IN VALIDATORS
// ============================================================================

export const validators = {
  /**
   * Required field validator
   */
  required: (message?: string): ValidatorFn => (value) => {
    const isEmpty = value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0);
    return {
      valid: !isEmpty,
      error: isEmpty ? (message || formatError('required')) : undefined,
      errorKey: 'required',
    };
  },

  /**
   * Email validator
   */
  email: (message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(value);
    return {
      valid,
      error: valid ? undefined : (message || formatError('email')),
      errorKey: 'email',
    };
  },

  /**
   * Minimum length validator
   */
  minLength: (min: number, message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    const valid = value.length >= min;
    return {
      valid,
      error: valid ? undefined : (message || formatError('minLength', { min })),
      errorKey: 'minLength',
      details: { min, actual: value.length },
    };
  },

  /**
   * Maximum length validator
   */
  maxLength: (max: number, message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    const valid = value.length <= max;
    return {
      valid,
      error: valid ? undefined : (message || formatError('maxLength', { max })),
      errorKey: 'maxLength',
      details: { max, actual: value.length },
    };
  },

  /**
   * Minimum value validator (numbers)
   */
  min: (min: number, message?: string): ValidatorFn<number> => (value) => {
    if (value === null || value === undefined) return { valid: true };
    const valid = value >= min;
    return {
      valid,
      error: valid ? undefined : (message || formatError('min', { min })),
      errorKey: 'min',
      details: { min, actual: value },
    };
  },

  /**
   * Maximum value validator (numbers)
   */
  max: (max: number, message?: string): ValidatorFn<number> => (value) => {
    if (value === null || value === undefined) return { valid: true };
    const valid = value <= max;
    return {
      valid,
      error: valid ? undefined : (message || formatError('max', { max })),
      errorKey: 'max',
      details: { max, actual: value },
    };
  },

  /**
   * Pattern validator (regex)
   */
  pattern: (regex: RegExp, message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    const valid = regex.test(value);
    return {
      valid,
      error: valid ? undefined : (message || formatError('pattern')),
      errorKey: 'pattern',
    };
  },

  /**
   * URL validator
   */
  url: (message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    try {
      new URL(value);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: message || formatError('url'),
        errorKey: 'url',
      };
    }
  },

  /**
   * Swedish phone number validator
   */
  phone: (message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    // Swedish phone: 07XXXXXXXX or +46XXXXXXXXX
    const phoneRegex = /^(\+46|0)[7-9]\d{8}$/;
    const cleaned = value.replace(/[\s-]/g, '');
    const valid = phoneRegex.test(cleaned);
    return {
      valid,
      error: valid ? undefined : (message || formatError('phone')),
      errorKey: 'phone',
    };
  },

  /**
   * Swedish personnummer validator
   */
  personnummer: (message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };

    // Remove separators
    const cleaned = value.replace(/[-\s]/g, '');

    // Must be 10 or 12 digits
    if (!/^\d{10}$|^\d{12}$/.test(cleaned)) {
      return {
        valid: false,
        error: message || formatError('personnummer'),
        errorKey: 'personnummer',
      };
    }

    // Get last 10 digits for Luhn check
    const digits = cleaned.slice(-10);

    // Luhn algorithm
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      let digit = parseInt(digits[i]);
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }

    const valid = sum % 10 === 0;
    return {
      valid,
      error: valid ? undefined : (message || formatError('personnummer')),
      errorKey: 'personnummer',
    };
  },

  /**
   * Swedish postal code validator
   */
  postalCode: (message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    const cleaned = value.replace(/[\s]/g, '');
    const valid = /^\d{5}$/.test(cleaned);
    return {
      valid,
      error: valid ? undefined : (message || formatError('postalCode')),
      errorKey: 'postalCode',
    };
  },

  /**
   * Date validator
   */
  date: (message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };
    const date = new Date(value);
    const valid = !isNaN(date.getTime());
    return {
      valid,
      error: valid ? undefined : (message || formatError('date')),
      errorKey: 'date',
    };
  },

  /**
   * Date range validator
   */
  dateRange: (min?: string, max?: string, message?: string): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { valid: false, error: formatError('date'), errorKey: 'date' };
    }

    if (min && date < new Date(min)) {
      return {
        valid: false,
        error: message || formatError('dateMin', { min }),
        errorKey: 'dateMin',
      };
    }

    if (max && date > new Date(max)) {
      return {
        valid: false,
        error: message || formatError('dateMax', { max }),
        errorKey: 'dateMax',
      };
    }

    return { valid: true };
  },

  /**
   * Number validator
   */
  number: (message?: string): ValidatorFn => (value) => {
    if (value === null || value === undefined || value === '') return { valid: true };
    const valid = !isNaN(Number(value));
    return {
      valid,
      error: valid ? undefined : (message || formatError('number')),
      errorKey: 'number',
    };
  },

  /**
   * Integer validator
   */
  integer: (message?: string): ValidatorFn => (value) => {
    if (value === null || value === undefined || value === '') return { valid: true };
    const valid = Number.isInteger(Number(value));
    return {
      valid,
      error: valid ? undefined : (message || formatError('integer')),
      errorKey: 'integer',
    };
  },

  /**
   * Positive number validator
   */
  positive: (message?: string): ValidatorFn<number> => (value) => {
    if (value === null || value === undefined) return { valid: true };
    const valid = value > 0;
    return {
      valid,
      error: valid ? undefined : (message || formatError('positive')),
      errorKey: 'positive',
    };
  },

  /**
   * Field match validator (for password confirmation)
   */
  match: (fieldName: string, message?: string): ValidatorFn => (value, context) => {
    if (!context) return { valid: true };
    const otherValue = context.formData[fieldName];
    const valid = value === otherValue;
    return {
      valid,
      error: valid ? undefined : (message || formatError('match')),
      errorKey: 'match',
    };
  },

  /**
   * Password strength validator
   */
  password: (options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  }): ValidatorFn<string> => (value) => {
    if (!value) return { valid: true };

    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecial = false,
    } = options || {};

    const errors: string[] = [];

    if (value.length < minLength) {
      errors.push(`minst ${minLength} tecken`);
    }
    if (requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('en stor bokstav');
    }
    if (requireLowercase && !/[a-z]/.test(value)) {
      errors.push('en liten bokstav');
    }
    if (requireNumber && !/\d/.test(value)) {
      errors.push('en siffra');
    }
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('ett specialtecken');
    }

    if (errors.length > 0) {
      return {
        valid: false,
        error: `Lösenordet måste innehålla: ${errors.join(', ')}`,
        errorKey: 'password',
      };
    }

    return { valid: true };
  },

  /**
   * Custom validator
   */
  custom: <T>(fn: (value: T) => boolean, message: string): ValidatorFn<T> => (value) => {
    const valid = fn(value);
    return {
      valid,
      error: valid ? undefined : message,
      errorKey: 'custom',
    };
  },
};

// ============================================================================
// ASYNC VALIDATORS
// ============================================================================

export const asyncValidators = {
  /**
   * Uniqueness check (simulated)
   */
  unique: (
    checkFn: (value: string) => Promise<boolean>,
    message?: string
  ): AsyncValidatorFn<string> => async (value) => {
    if (!value) return { valid: true };

    try {
      const isUnique = await checkFn(value);
      return {
        valid: isUnique,
        error: isUnique ? undefined : (message || formatError('unique')),
        errorKey: 'unique',
      };
    } catch {
      return { valid: true }; // Assume valid on error
    }
  },

  /**
   * Debounced async validator wrapper
   */
  debounce: <T>(
    validator: AsyncValidatorFn<T>,
    ms: number
  ): AsyncValidatorFn<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let lastValue: T;

    return (value, context) => {
      return new Promise((resolve) => {
        lastValue = value;
        clearTimeout(timeoutId);

        timeoutId = setTimeout(async () => {
          if (value === lastValue) {
            const result = await validator(value, context);
            resolve(result);
          }
        }, ms);
      });
    };
  },
};

// ============================================================================
// FORM VALIDATION SERVICE
// ============================================================================

class FormValidationService {
  private schemas: Map<string, FormSchema> = new Map();
  private formStates: Map<string, FormState> = new Map();
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // --------------------------------------------------------------------------
  // SCHEMA MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Register a form schema
   */
  public registerSchema(schema: FormSchema): void {
    this.schemas.set(schema.id, schema);
    logger.debug('[Validation] Schema registered:', schema.id);
  }

  /**
   * Get a form schema
   */
  public getSchema(formId: string): FormSchema | null {
    return this.schemas.get(formId) || null;
  }

  /**
   * Unregister a form schema
   */
  public unregisterSchema(formId: string): void {
    this.schemas.delete(formId);
    this.formStates.delete(formId);
  }

  // --------------------------------------------------------------------------
  // FORM STATE MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Initialize form state
   */
  public initializeForm(formId: string): FormState {
    const schema = this.schemas.get(formId);
    if (!schema) {
      throw new Error(`Schema not found: ${formId}`);
    }

    const state: FormState = {
      values: {},
      errors: {},
      touched: {},
      dirty: {},
      validating: {},
      isValid: true,
      isSubmitting: false,
      submitCount: 0,
    };

    // Set default values
    for (const field of schema.fields) {
      state.values[field.name] = field.defaultValue ?? '';
      state.errors[field.name] = null;
      state.touched[field.name] = false;
      state.dirty[field.name] = false;
      state.validating[field.name] = false;
    }

    this.formStates.set(formId, state);
    return state;
  }

  /**
   * Get form state
   */
  public getFormState(formId: string): FormState | null {
    return this.formStates.get(formId) || null;
  }

  /**
   * Update field value
   */
  public async setFieldValue(
    formId: string,
    fieldName: string,
    value: unknown
  ): Promise<FormState> {
    const state = this.formStates.get(formId);
    const schema = this.schemas.get(formId);

    if (!state || !schema) {
      throw new Error(`Form not initialized: ${formId}`);
    }

    state.values[fieldName] = value;
    state.dirty[fieldName] = true;

    // Validate on change if configured
    const field = schema.fields.find(f => f.name === fieldName);
    if (field?.validateOn === 'change' || schema.validateOnChange) {
      await this.validateField(formId, fieldName);
    }

    this.formStates.set(formId, state);
    return { ...state };
  }

  /**
   * Set field touched
   */
  public async setFieldTouched(
    formId: string,
    fieldName: string
  ): Promise<FormState> {
    const state = this.formStates.get(formId);
    const schema = this.schemas.get(formId);

    if (!state || !schema) {
      throw new Error(`Form not initialized: ${formId}`);
    }

    state.touched[fieldName] = true;

    // Validate on blur if configured
    const field = schema.fields.find(f => f.name === fieldName);
    if (field?.validateOn === 'blur' || schema.validateOnBlur) {
      await this.validateField(formId, fieldName);
    }

    this.formStates.set(formId, state);
    return { ...state };
  }

  // --------------------------------------------------------------------------
  // VALIDATION
  // --------------------------------------------------------------------------

  /**
   * Validate a single field
   */
  public async validateField(
    formId: string,
    fieldName: string
  ): Promise<ValidationResult> {
    const state = this.formStates.get(formId);
    const schema = this.schemas.get(formId);

    if (!state || !schema) {
      return { valid: false, error: 'Form not initialized' };
    }

    const field = schema.fields.find(f => f.name === fieldName);
    if (!field) {
      return { valid: false, error: 'Field not found' };
    }

    const value = state.values[fieldName];
    const context: ValidationContext = {
      formData: state.values,
      fieldName,
      touched: state.touched[fieldName],
      dirty: state.dirty[fieldName],
    };

    // Clear debounce timer
    const timerKey = `${formId}:${fieldName}`;
    const existingTimer = this.debounceTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Run sync validators
    const syncValidators = field.validators || [];

    // Add required validator if needed
    if (field.required) {
      syncValidators.unshift(validators.required());
    }

    for (const validator of syncValidators) {
      const result = validator(value, context);
      if (!result.valid) {
        state.errors[fieldName] = result.error || null;
        state.isValid = this.checkFormValidity(state);
        this.formStates.set(formId, state);
        return result;
      }
    }

    // Run async validators
    const asyncValidatorList = field.asyncValidators || [];
    if (asyncValidatorList.length > 0) {
      state.validating[fieldName] = true;
      this.formStates.set(formId, state);

      const debounceMs = field.debounceMs || 300;

      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          for (const asyncValidator of asyncValidatorList) {
            const result = await asyncValidator(value, context);
            if (!result.valid) {
              state.errors[fieldName] = result.error || null;
              state.validating[fieldName] = false;
              state.isValid = this.checkFormValidity(state);
              this.formStates.set(formId, state);
              resolve(result);
              return;
            }
          }

          state.errors[fieldName] = null;
          state.validating[fieldName] = false;
          state.isValid = this.checkFormValidity(state);
          this.formStates.set(formId, state);
          resolve({ valid: true });
        }, debounceMs);

        this.debounceTimers.set(timerKey, timer);
      });
    }

    state.errors[fieldName] = null;
    state.isValid = this.checkFormValidity(state);
    this.formStates.set(formId, state);
    return { valid: true };
  }

  /**
   * Validate entire form
   */
  public async validateForm(formId: string): Promise<Record<string, ValidationResult>> {
    const schema = this.schemas.get(formId);
    if (!schema) {
      throw new Error(`Schema not found: ${formId}`);
    }

    const results: Record<string, ValidationResult> = {};

    for (const field of schema.fields) {
      results[field.name] = await this.validateField(formId, field.name);
    }

    return results;
  }

  /**
   * Check if form is valid
   */
  private checkFormValidity(state: FormState): boolean {
    return Object.values(state.errors).every(e => e === null);
  }

  // --------------------------------------------------------------------------
  // FORM SUBMISSION
  // --------------------------------------------------------------------------

  /**
   * Submit form
   */
  public async submitForm<T extends Record<string, unknown>>(
    formId: string,
    onSubmit: (values: T) => Promise<void> | void
  ): Promise<{ success: boolean; errors?: Record<string, string> }> {
    const state = this.formStates.get(formId);
    if (!state) {
      return { success: false, errors: { form: 'Form not initialized' } };
    }

    state.isSubmitting = true;
    state.submitCount++;
    this.formStates.set(formId, state);

    // Validate all fields
    await this.validateForm(formId);

    // Check for errors
    const errors: Record<string, string> = {};
    Object.entries(state.errors).forEach(([key, error]) => {
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      state.isSubmitting = false;
      this.formStates.set(formId, state);
      return { success: false, errors };
    }

    // Submit
    try {
      await onSubmit(state.values as T);
      state.isSubmitting = false;
      this.formStates.set(formId, state);
      return { success: true };
    } catch (error) {
      state.isSubmitting = false;
      this.formStates.set(formId, state);
      logger.error('[Validation] Submit error:', error);
      return {
        success: false,
        errors: { form: error instanceof Error ? error.message : 'Ett fel inträffade' },
      };
    }
  }

  /**
   * Reset form
   */
  public resetForm(formId: string): FormState {
    return this.initializeForm(formId);
  }

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // --------------------------------------------------------------------------

  /**
   * Get field error (respecting showErrorsOn config)
   */
  public getFieldError(formId: string, fieldName: string): string | null {
    const state = this.formStates.get(formId);
    const schema = this.schemas.get(formId);

    if (!state || !schema) return null;

    const error = state.errors[fieldName];
    if (!error) return null;

    const showOn = schema.showErrorsOn || 'touched';

    switch (showOn) {
      case 'always':
        return error;
      case 'touched':
        return state.touched[fieldName] ? error : null;
      case 'dirty':
        return state.dirty[fieldName] ? error : null;
      case 'submit':
        return state.submitCount > 0 ? error : null;
      default:
        return null;
    }
  }

  /**
   * Get ARIA attributes for field
   */
  public getAriaAttributes(formId: string, fieldName: string): Record<string, string> {
    const state = this.formStates.get(formId);
    const error = this.getFieldError(formId, fieldName);

    const attrs: Record<string, string> = {};

    if (error) {
      attrs['aria-invalid'] = 'true';
      attrs['aria-describedby'] = `${fieldName}-error`;
    }

    if (state?.validating[fieldName]) {
      attrs['aria-busy'] = 'true';
    }

    return attrs;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const formValidationService = new FormValidationService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook for using form validation
 */
export function useForm<T extends Record<string, unknown>>(schema: FormSchema) {
  const [state, setState] = useState<FormState>(() => {
    formValidationService.registerSchema(schema);
    return formValidationService.initializeForm(schema.id);
  });

  useEffect(() => {
    return () => {
      formValidationService.unregisterSchema(schema.id);
    };
  }, [schema.id]);

  const setFieldValue = useCallback(async (fieldName: string, value: unknown) => {
    const newState = await formValidationService.setFieldValue(schema.id, fieldName, value);
    setState(newState);
  }, [schema.id]);

  const setFieldTouched = useCallback(async (fieldName: string) => {
    const newState = await formValidationService.setFieldTouched(schema.id, fieldName);
    setState(newState);
  }, [schema.id]);

  const validateField = useCallback(async (fieldName: string) => {
    const result = await formValidationService.validateField(schema.id, fieldName);
    setState(formValidationService.getFormState(schema.id) || state);
    return result;
  }, [schema.id, state]);

  const validateForm = useCallback(async () => {
    const results = await formValidationService.validateForm(schema.id);
    setState(formValidationService.getFormState(schema.id) || state);
    return results;
  }, [schema.id, state]);

  const submitForm = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    const result = await formValidationService.submitForm(schema.id, onSubmit);
    setState(formValidationService.getFormState(schema.id) || state);
    return result;
  }, [schema.id, state]);

  const resetForm = useCallback(() => {
    const newState = formValidationService.resetForm(schema.id);
    setState(newState);
  }, [schema.id]);

  const getFieldError = useCallback((fieldName: string) => {
    return formValidationService.getFieldError(schema.id, fieldName);
  }, [schema.id]);

  const getAriaAttributes = useCallback((fieldName: string) => {
    return formValidationService.getAriaAttributes(schema.id, fieldName);
  }, [schema.id]);

  const register = useCallback((fieldName: string) => ({
    name: fieldName,
    value: state.values[fieldName] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(fieldName, e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value);
    },
    onBlur: () => setFieldTouched(fieldName),
    ...getAriaAttributes(fieldName),
  }), [state.values, setFieldValue, setFieldTouched, getAriaAttributes]);

  return {
    // State
    values: state.values as T,
    errors: state.errors,
    touched: state.touched,
    dirty: state.dirty,
    validating: state.validating,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    submitCount: state.submitCount,

    // Methods
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    submitForm,
    resetForm,
    getFieldError,
    getAriaAttributes,
    register,
  };
}

/**
 * Hook for single field validation
 */
export function useFieldValidation<T>(
  value: T,
  validatorList: ValidatorFn<T>[],
  options?: { validateOnChange?: boolean; debounceMs?: number }
) {
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const validate = useCallback(() => {
    for (const validator of validatorList) {
      const result = validator(value);
      if (!result.valid) {
        setError(result.error || null);
        return false;
      }
    }
    setError(null);
    return true;
  }, [value, validatorList]);

  useEffect(() => {
    if (options?.validateOnChange) {
      const timer = setTimeout(() => {
        validate();
      }, options?.debounceMs || 300);
      return () => clearTimeout(timer);
    }
  }, [value, options?.validateOnChange, options?.debounceMs, validate]);

  return {
    error,
    validating,
    validate,
    isValid: error === null,
  };
}

export default formValidationService;
