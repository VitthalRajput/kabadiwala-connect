import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      prefixText,
      suffixText,
      containerClassName = '',
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center rounded-lg border border-gray-300 bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-saffron-500 focus-within:border-saffron-500 shadow-sm overflow-hidden">
          {leftIcon && <div className="pl-3 text-gray-400 shrink-0 pointer-events-none">{leftIcon}</div>}

          {prefixText && (
            <span className="pl-3 pr-1 text-sm font-medium text-gray-500 select-none">
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`w-full py-2 px-3 text-sm text-gray-900 bg-transparent placeholder-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
            {...props}
          />

          {suffixText && (
            <span className="pr-3 pl-1 text-sm font-medium text-gray-500 select-none">
              {suffixText}
            </span>
          )}

          {rightIcon && <div className="pr-3 text-gray-400 shrink-0">{rightIcon}</div>}
        </div>

        {error ? (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

