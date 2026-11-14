import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className = '',
}) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = React.useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = React.useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = window.setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 175);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111314]/50 backdrop-blur-xs overscroll-contain ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`${
          isClosing ? 'animate-sheet-down' : 'animate-sheet-up'
        } w-full sm:max-w-[540px] max-h-[90dvh] sm:max-h-[88dvh] flex flex-col rounded-t-2xl rounded-b-none sm:rounded-2xl bg-[#FFFFFF] text-[#111314] border border-[#d8cab6] shadow-2xl overflow-hidden outline-none ${className}`.trim()}
      >
        {/* Mobile Grab Handle Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center bg-[#f5ebd6]/60 flex-shrink-0">
          <div className="sheet-grab-handle !mb-0" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#d8cab6] bg-[#FAF7F2] flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display font-semibold text-base sm:text-lg text-[#111314] leading-snug"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[#7c4226] mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="press-scale inline-flex items-center justify-center w-9 h-9 -mr-1 rounded-[var(--radius-concentric-control)] text-[#7c4226] hover:text-[#111314] hover:bg-[#f5ebd6] cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84222]/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="px-5 py-4 sm:px-6 border-t border-[#d8cab6] bg-[#FAF7F2] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
