import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  chamfer?: boolean;
  ticketNotch?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', chamfer = true, ticketNotch = false, ...props }, ref) => {
    let shapeClass = 'rounded-lg';
    if (chamfer) shapeClass = 'chamfer-card';

    return (
      <div
        ref={ref}
        className={`bg-dark-800 border border-line ${shapeClass} transition-colors ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 pb-3 flex flex-col gap-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`font-display font-extrabold text-lg text-white uppercase tracking-wide leading-snug ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-accent-text400 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`p-5 pt-3 border-t border-line flex items-center justify-between gap-4 text-xs ${className}`}
    {...props}
  >
    {children}
  </div>
);
