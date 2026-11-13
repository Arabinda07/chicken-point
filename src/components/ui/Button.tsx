import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'bezel';
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
    "relative inline-flex items-center justify-center gap-2 font-semibold select-none cursor-pointer transition-all duration-150 ease-out-expo focus:outline-none disabled:pointer-events-none disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 active:scale-97";

  const sizeClasses = {
    sm: "px-3 py-1.5 min-h-[38px] text-xs rounded-[var(--radius-chip)]",
    md: "px-4 py-2.5 min-h-[44px] text-sm rounded-[var(--radius-control)]",
    lg: "px-6 py-3.5 min-h-[50px] text-base rounded-[var(--radius-control)]",
  };

  const getToneClasses = () => {
    if (variant === 'primary') {
      if (tone === 'whatsapp') {
        return "bg-[#15803D] hover:bg-[#166534] text-white shadow-sm hover:shadow-md border border-[#15803D]/20";
      }
      if (tone === 'gold') {
        return "bg-[#D99B26] hover:bg-[#B8811A] text-white shadow-sm hover:shadow-md border border-[#D99B26]/20";
      }
      // default crimson
      return "bg-[#A83A2F] hover:bg-[#872B22] text-white shadow-sm hover:shadow-md border border-[#A83A2F]/20";
    }

    if (variant === 'secondary') {
      return "control-surface text-[#231917] hover:border-[#A83A2F]/40 shadow-xs";
    }

    if (variant === 'outline') {
      if (tone === 'whatsapp') {
        return "bg-transparent border border-[#15803D]/40 text-[#15803D] hover:bg-[#15803D]/10";
      }
      return "bg-transparent border border-[#E6DEC8] text-[#665852] hover:border-[#A83A2F]/40 hover:text-[#A83A2F] hover:bg-[#FAF7F2]";
    }

    if (variant === 'ghost') {
      return "bg-transparent text-[#665852] hover:text-[#231917] hover:bg-[#FAF7F2]";
    }

    if (variant === 'bezel') {
      return "surface-bezel bg-white text-[#231917] hover:bg-[#FAF7F2]";
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
