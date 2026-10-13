'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'marawa' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  chamfer?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      chamfer = true,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-display font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const chamferClass = chamfer ? 'chamfer-btn' : 'rounded';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-5 py-2.5 gap-2',
      lg: 'text-base px-7 py-3.5 gap-2.5',
    }[size];

    const variantStyles = {
      primary:
        'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 active:translate-y-0.5',
      secondary:
        'bg-dark-700 hover:bg-dark-600 text-white border border-line hover:border-line-strong active:translate-y-0.5',
      outline:
        'bg-transparent hover:bg-brand-500/10 text-brand-400 hover:text-brand-500 border border-brand-500/60 active:translate-y-0.5',
      ghost:
        'bg-transparent hover:bg-dark-800 text-accent-text400 hover:text-white',
      danger:
        'bg-red-700 hover:bg-red-800 text-white shadow-md shadow-red-700/20 active:translate-y-0.5',
      marawa:
        'bg-[#F5B700] hover:bg-[#E0A700] text-black font-extrabold shadow-lg shadow-amber-500/20 active:translate-y-0.5',
      warning:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 active:translate-y-0.5',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${chamferClass} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = 'Button';
