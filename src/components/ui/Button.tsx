import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  tone?: 'crimson' | 'whatsapp' | 'gold' | 'default';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  tone = 'crimson',
  size = 'md',
  className = '',
  isLoading = false,
  disabled = false,
  ...props
}, ref) => {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-2 font-semibold select-none cursor-pointer transition-[transform,background-color,border-color,box-shadow] duration-150 ease-[var(--ease-out-expo)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-97";

  const sizeClasses = {
    sm: "px-3.5 py-2 min-h-[38px] text-xs rounded-[var(--radius-chip)]",
    md: "px-4 py-2.5 min-h-[44px] text-sm rounded-[var(--radius-control)]",
    lg: "px-6 py-3.5 min-h-[50px] text-base rounded-[var(--radius-control)]",
  };

  const getToneClasses = () => {
    if (variant === 'primary') {
      if (tone === 'whatsapp') {
        return "bg-[#15803D] hover:bg-[#166534] text-white shadow-xs";
      }
      if (tone === 'gold') {
        return "bg-[#e0b81f] hover:bg-[#ebd3a2] text-[#111314] shadow-xs";
      }
      // Primary Brand Accent (#a84222 brick-red -> #6c2b11 brown-deep)
      return "bg-[#a84222] hover:bg-[#6c2b11] text-white shadow-xs";
    }

    if (variant === 'secondary') {
      return "bg-[#FFFFFF] border border-[#d8cab6] text-[#111314] hover:bg-[#f5ebd6]/60 hover:border-[#c2ae93] shadow-2xs";
    }

    if (variant === 'outline') {
      if (tone === 'whatsapp') {
        return "bg-transparent border border-[#15803D]/40 text-[#15803D] hover:bg-[#15803D]/10";
      }
      return "bg-transparent border border-[#d8cab6] text-[#7c4226] hover:border-[#a84222]/50 hover:text-[#6c2b11] hover:bg-[#f5ebd6]/50";
    }

    if (variant === 'ghost') {
      return "bg-transparent text-[#7c4226] hover:text-[#111314] hover:bg-[#f5ebd6]/60";
    }

    return "";
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeClasses[size]} ${getToneClasses()} ${className}`.trim()}
      {...props}
    >
      <span className={`inline-flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>

      {isLoading && (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
