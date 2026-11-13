import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Handle native cancel event (ESC key press)
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  // Light dismiss fallback handler (clicks on backdrop outside dialog content)
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog || e.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInside =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInside) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id="modal-sheet-dialog"
      closedby="any"
      onCancel={handleCancel}
      onClick={handleClick}
      className={`p-0 m-0 sm:m-auto w-full sm:max-w-xl max-h-[90dvh] sm:max-h-[85dvh] fixed bottom-0 sm:relative sm:bottom-auto rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] bg-white text-[#231917] border border-[#E6DEC8] shadow-2xl overflow-hidden backdrop:bg-[#231917]/65 backdrop:backdrop-blur-sm transition-all duration-200 ease-out-expo open:animate-in open:fade-in-0 open:slide-in-from-bottom-8 sm:open:zoom-in-95 ${className}`.trim()}
    >
      <div className="flex flex-col max-h-[90dvh] sm:max-h-[85dvh]">
        {/* Mobile Grab Handle Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="sheet-grab-handle" aria-hidden="true" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E6DEC8] flex items-start justify-between gap-4 bg-[#FAF7F2]/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg sm:text-xl text-[#231917]">
                {title}
              </h2>
            </div>
            {subtitle && (
              <div className="text-xs text-[#665852] mt-0.5">
                {subtitle}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-[var(--radius-chip)] text-[#665852] hover:text-[#231917] hover:bg-[#F3EFE6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A83A2F]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sheet Content */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </dialog>
  );
};
