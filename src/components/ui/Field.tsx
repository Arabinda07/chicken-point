import React, { useId } from 'react';

export interface FieldInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  isLabelHidden?: boolean;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  isRequired?: boolean;
}

export const FieldInput = React.forwardRef<HTMLInputElement, FieldInputProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      value,
      onChange,
      icon,
      isRequired = false,
      id,
      className = '',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descId = description ? `${inputId}-desc` : undefined;

    return (
      <div className="field space-y-1.5 w-full">
        <label
          htmlFor={inputId}
          className={
            isLabelHidden
              ? 'visually-hidden'
              : 'block text-xs font-bold text-[#111314]'
          }
        >
          {label}
          {isRequired && (
            <span className="text-[#a84222] font-semibold ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {description && !isLabelHidden && (
          <p id={descId} className="text-xs text-[#7c4226] leading-snug">
            {description}
          </p>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span
              className="pointer-events-none absolute left-3.5 text-[#7c4226] inline-flex items-center"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={isRequired}
            aria-describedby={descId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full min-h-[44px] ${
              icon ? 'pl-10 pr-3.5' : 'px-3.5'
            } py-2.5 text-base sm:text-sm text-[#111314] placeholder:text-[#7c4226]/70 rounded-[var(--radius-control)] border border-[#d8cab6] bg-[#FAF7F2] focus:bg-white focus:border-[#a84222] focus:ring-2 focus:ring-[#a84222]/25 outline-none transition-[border-color,background-color,box-shadow] duration-150 ease-[var(--ease-out-expo)] ${className}`.trim()}
            {...props}
          />
        </div>
      </div>
    );
  },
);

FieldInput.displayName = 'FieldInput';
