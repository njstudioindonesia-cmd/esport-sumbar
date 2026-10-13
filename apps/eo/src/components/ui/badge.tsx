import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'marawa' | 'success' | 'warning' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  chamfer?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'brand',
  size = 'md',
  chamfer = true,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-display font-bold uppercase tracking-wider select-none';

  const chamferClass = chamfer ? 'chamfer-badge' : 'rounded';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  const variantStyles = {
    brand: 'bg-brand-500/20 text-brand-400 border border-brand-500/40',
    marawa: 'bg-[#F5B700]/15 text-[#F5B700] border border-[#F5B700]/40 shadow-sm shadow-[#F5B700]/10',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
    warning: 'bg-[#F5B700]/20 text-[#F5B700] border border-[#F5B700]/40',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
    neutral: 'bg-dark-700 text-accent-text400 border border-line',
    outline: 'bg-transparent text-accent-text100 border border-line-strong',
  }[variant];

  return (
    <span
      className={`${baseStyles} ${chamferClass} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
