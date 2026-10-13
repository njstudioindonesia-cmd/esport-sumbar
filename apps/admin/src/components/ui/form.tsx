import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-accent-text400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-text400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-dark-900 border rounded px-3.5 py-2.5 text-sm text-white placeholder-accent-text400/40 focus:outline-none focus:border-brand-500 transition-colors ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error ? 'border-brand-500/80' : 'border-line'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-text400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-brand-400 font-medium">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-accent-text400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-dark-900 border rounded p-3 text-sm text-white placeholder-accent-text400/40 focus:outline-none focus:border-brand-500 transition-colors ${
            error ? 'border-brand-500/80' : 'border-line'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] text-brand-400 font-medium">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
