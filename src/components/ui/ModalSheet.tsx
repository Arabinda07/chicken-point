import React from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core';

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
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      purpose="form"
      width={560}
      maxHeight="88dvh"
      padding={0}
      className={`rounded-t-[var(--radius-panel)] sm:rounded-[var(--radius-panel)] bg-white text-[#231917] border border-[#E6DEC8] shadow-2xl overflow-hidden ${className}`.trim()}
    >
      <div className="flex flex-col max-h-[88dvh]">
        {/* Mobile Grab Handle Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="sheet-grab-handle" aria-hidden="true" />
        </div>

        <DialogHeader
          title={title}
          subtitle={subtitle}
          onOpenChange={(open) => {
            if (!open) onClose();
          }}
          className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E6DEC8] bg-[#FAF7F2]/80"
        />

        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </Dialog>
  );
};
