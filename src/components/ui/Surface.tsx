import React from 'react';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'bezel' | 'floating' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  variant = 'paper',
  padding = 'none',
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'paper':
        return 'surface-paper';
      case 'bezel':
        return 'surface-bezel bg-white rounded-[var(--radius-panel)]';
      case 'floating':
        return 'surface-floating';
      case 'flat':
        return 'bg-white border border-[var(--color-border-hairline)] rounded-[var(--radius-panel)]';
      default:
        return 'surface-paper';
    }
  };

  const paddingClasses: Record<NonNullable<SurfaceProps['padding']>, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  return (
    <div
      className={`${getVariantStyles()} ${paddingClasses[padding]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
