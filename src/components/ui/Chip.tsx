import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  tone?: 'crimson' | 'whatsapp' | 'gold';
}

export const Chip: React.FC<ChipProps> = ({
  children,
  active = false,
  icon,
  tone = 'crimson',
  className = '',
  ...props
}) => {
  const getActiveStyles = () => {
    if (!active) {
      return "bg-[#FAF7F2] border-[#E6DEC8] text-[#665852] hover:bg-[#F3EFE6] hover:text-[#231917] hover:border-[#E6DEC8]";
    }

    if (tone === 'whatsapp') {
      return "bg-[#15803D]/10 border-[#15803D] text-[#15803D] font-bold shadow-xs";
    }

    if (tone === 'gold') {
      return "bg-[#D99B26]/15 border-[#D99B26] text-[#872B22] font-bold shadow-xs";
    }

    // Default crimson
    return "bg-[#A83A2F]/10 border-[#A83A2F] text-[#872B22] font-bold shadow-xs";
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-[var(--radius-chip)] border transition-all duration-150 ease-out-expo select-none cursor-pointer [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A83A2F]/30 ${getActiveStyles()} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
