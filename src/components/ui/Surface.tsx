import React from 'react';

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'paper' | 'bezel' | 'floating' | 'flat';
  children: React.ReactNode;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  variant = 'paper',
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

  return (
    <div className={`${getVariantStyles()} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
