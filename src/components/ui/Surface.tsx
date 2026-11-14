import React from 'react';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'flat';
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
  const variantStyles =
    variant === 'flat'
      ? 'bg-[#FFFFFF] border border-[#d8cab6] rounded-[var(--radius-panel)] surface-bezel'
      : 'surface-paper';

  const paddingClasses: Record<NonNullable<SurfaceProps['padding']>, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`${variantStyles} ${paddingClasses[padding]} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
