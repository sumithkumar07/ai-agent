import React, { forwardRef } from 'react';

/**
 * Accessible input component with proper ARIA support
 * Features:
 * - Proper labeling and description
 * - Error handling with ARIA
 * - Focus management
 * - Screen reader support
 */
const AccessibleInput = forwardRef(({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const inputId = id || `input-${name}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  
  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 dark:border-gray-600'
    }
    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
  `;
  
  return (
    <div className={`${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && (
            <span 
              className="text-red-500 ml-1" 
              aria-label="required"
            >
              *
            </span>
          )}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[errorId, helperTextId].filter(Boolean).join(' ') || undefined}
        className={`${baseInputClasses} ${inputClassName}`}
        {...props}
      />
      
      {helperText && (
        <p 
          id={helperTextId}
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
      
      {error && (
        <p 
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;