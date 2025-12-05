/**
 * Modal Component
 * Reusable modal with sticky header, scrollable body, backdrop click close
 *
 * Accessibility features:
 * - Focus trap to keep focus within modal
 * - Escape key to close
 * - ARIA attributes for screen readers
 * - Returns focus to trigger element on close
 */

import React, { useEffect, ReactNode, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap, announce } from '../../hooks/useAccessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  footer?: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  icon,
  iconClassName = 'bg-cyan-500 text-white',
  footer,
  className = '',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true
}) => {
  // Focus trap for accessibility
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Announce modal open to screen readers
  useEffect(() => {
    if (isOpen && title) {
      announce(`Dialog öppnad: ${title}`, 'polite');
    }
  }, [isOpen, title]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={focusTrapRef}
        className={`bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${className}`}
      >
        {/* Sticky Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`p-2 rounded-xl ${iconClassName}`}>
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h2 id="modal-title" className="font-bold text-slate-800 text-lg">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-slate-500 text-sm">{subtitle}</p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Stäng"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
