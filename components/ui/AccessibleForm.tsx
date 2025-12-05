/**
 * Accessible Form Components
 *
 * WCAG 2.1 AA compliant form elements with:
 * - Proper label associations
 * - Error states with aria-describedby
 * - Required field indicators
 * - Focus management
 */

import React, { forwardRef, useId, ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

interface BaseInputProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  hideLabel?: boolean;
}

// ============================================
// FORM FIELD WRAPPER
// ============================================

interface FormFieldProps extends BaseInputProps {
  children: (props: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
  }) => ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  hideLabel = false,
  children,
  className = ''
}) => {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${className}`}>
      <label
        htmlFor={id}
        className={hideLabel
          ? 'sr-only'
          : 'block text-sm font-medium text-slate-700 mb-1.5'
        }
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
        {required && <span className="sr-only"> (obligatorisk)</span>}
      </label>

      {hint && !error && (
        <p id={hintId} className="text-sm text-slate-500 mb-2">
          {hint}
        </p>
      )}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required
      })}

      {error && (
        <p
          id={errorId}
          className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================
// TEXT INPUT
// ============================================

interface TextInputProps extends BaseInputProps, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  hint,
  required,
  hideLabel,
  className = '',
  ...inputProps
}, ref) => {
  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      hideLabel={hideLabel}
    >
      {(ariaProps) => (
        <input
          ref={ref}
          {...inputProps}
          {...ariaProps}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all duration-200
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20'
            }
            focus:outline-none focus:ring-4
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}
          `}
        />
      )}
    </FormField>
  );
});

TextInput.displayName = 'TextInput';

// ============================================
// TEXTAREA
// ============================================

interface TextAreaProps extends BaseInputProps, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  hint,
  required,
  hideLabel,
  className = '',
  ...textareaProps
}, ref) => {
  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      hideLabel={hideLabel}
    >
      {(ariaProps) => (
        <textarea
          ref={ref}
          {...textareaProps}
          {...ariaProps}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-y min-h-[100px]
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20'
            }
            focus:outline-none focus:ring-4
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}
          `}
        />
      )}
    </FormField>
  );
});

TextArea.displayName = 'TextArea';

// ============================================
// SELECT
// ============================================

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends BaseInputProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  required,
  hideLabel,
  options,
  placeholder,
  className = '',
  ...selectProps
}, ref) => {
  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      required={required}
      hideLabel={hideLabel}
    >
      {(ariaProps) => (
        <select
          ref={ref}
          {...selectProps}
          {...ariaProps}
          className={`
            w-full px-4 py-3 rounded-xl border transition-all duration-200 appearance-none
            bg-no-repeat bg-right pr-10
            ${error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-200 bg-white focus:border-primary-500 focus:ring-primary-500/20'
            }
            focus:outline-none focus:ring-4
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}
          `}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '1.5em 1.5em'
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
});

Select.displayName = 'Select';

// ============================================
// CHECKBOX
// ============================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  className = '',
  ...inputProps
}, ref) => {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <div className="flex items-start">
        <input
          ref={ref}
          type="checkbox"
          id={id}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? true : undefined}
          className="
            w-5 h-5 mt-0.5 rounded border-slate-300 text-primary-600
            focus:ring-primary-500 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          {...inputProps}
        />
        <div className="ml-3">
          <label
            htmlFor={id}
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p id={descriptionId} className="text-sm text-slate-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 ml-8" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

// ============================================
// RADIO GROUP
// ============================================

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required = false,
  orientation = 'vertical',
  className = ''
}) => {
  const groupId = useId();
  const errorId = error ? `${groupId}-error` : undefined;

  return (
    <fieldset
      className={className}
      role="radiogroup"
      aria-required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
    >
      <legend className="text-sm font-medium text-slate-700 mb-3">
        {label}
        {required && (
          <>
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            <span className="sr-only"> (obligatorisk)</span>
          </>
        )}
      </legend>

      <div className={`
        ${orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3'}
      `}>
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const descriptionId = option.description ? `${optionId}-description` : undefined;

          return (
            <div key={option.value} className="flex items-start">
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                aria-describedby={descriptionId}
                className="
                  w-5 h-5 mt-0.5 border-slate-300 text-primary-600
                  focus:ring-primary-500 focus:ring-offset-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              <div className="ml-3">
                <label
                  htmlFor={optionId}
                  className={`text-sm font-medium cursor-pointer ${
                    option.disabled ? 'text-slate-400' : 'text-slate-700'
                  }`}
                >
                  {option.label}
                </label>
                {option.description && (
                  <p id={descriptionId} className="text-sm text-slate-500 mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};

// ============================================
// FORM ERROR SUMMARY
// ============================================

interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title = 'Vänligen korrigera följande fel:'
}) => {
  const errorEntries = Object.entries(errors).filter(([_, msg]) => msg);

  if (errorEntries.length === 0) return null;

  return (
    <div
      role="alert"
      aria-labelledby="error-summary-title"
      className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <h3
        id="error-summary-title"
        className="text-sm font-bold text-red-800 mb-2"
      >
        {title}
      </h3>
      <ul className="list-disc list-inside space-y-1">
        {errorEntries.map(([field, message]) => (
          <li key={field} className="text-sm text-red-700">
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ============================================
// SCREEN READER ONLY UTILITY
// ============================================

export const ScreenReaderOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <span className="sr-only">{children}</span>
);

// ============================================
// EXPORTS
// ============================================

export default {
  FormField,
  TextInput,
  TextArea,
  Select,
  Checkbox,
  RadioGroup,
  FormErrorSummary,
  ScreenReaderOnly
};
