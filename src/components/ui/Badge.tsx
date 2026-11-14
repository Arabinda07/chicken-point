import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: React.ReactNode;
  tone?: 'neutral' | 'amber' | 'ocher' | 'crimson' | 'whatsapp';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  icon,
  className = '',
  ...props
}) => {
  const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
    neutral: 'bg-[#f5ebd6] text-[#7c4226] border-[#d8cab6]',
    amber: 'bg-[#ebd3a2]/60 text-[#6c2b11] border-[#e0b81f]/60',
    ocher: 'bg-[#ebd3a2]/60 text-[#6c2b11] border-[#e0b81f]/60',
    crimson: 'bg-[#a84222]/10 text-[#a84222] border-[#a84222]/25',
    whatsapp: 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/25',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${toneClasses[tone]} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="flex-shrink-0 inline-flex items-center">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
