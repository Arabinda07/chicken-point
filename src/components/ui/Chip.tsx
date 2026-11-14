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
      return "bg-[#FAF7F2] border-[#d8cab6] text-[#7c4226] hover:bg-[#f5ebd6] hover:text-[#111314] hover:border-[#c2ae93]";
    }

    if (tone === 'whatsapp') {
      return "bg-[#15803D]/10 border-[#15803D] text-[#15803D] font-bold shadow-xs";
    }

    if (tone === 'gold') {
      return "bg-[#e0b81f]/20 border-[#e0b81f] text-[#6c2b11] font-bold shadow-xs";
    }

    // Default Wada Brick Red
    return "bg-[#a84222]/10 border-[#a84222] text-[#6c2b11] font-bold shadow-xs";
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-[var(--radius-chip)] border transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-[var(--ease-out-expo)] select-none cursor-pointer [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/35 ${getActiveStyles()} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
