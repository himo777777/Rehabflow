/**
 * Toast Component
 *
 * Accessible notification system with:
 * - ARIA live regions for screen reader announcements
 * - Role="status" for non-urgent, role="alert" for errors
 * - Dismiss button with proper labeling
 */

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { announce } from '../hooks/useAccessibility';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ElementType; iconColor: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600'
  }
};

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  // Announce new toasts to screen readers
  useEffect(() => {
    if (toasts.length > 0) {
      const latestToast = toasts[toasts.length - 1];
      const priority = latestToast.type === 'error' ? 'assertive' : 'polite';
      announce(`${latestToast.title}: ${latestToast.message}`, priority);
    }
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-label="Notifikationer"
    >
      {toasts.map((toast) => {
        const style = toastStyles[toast.type];
        const IconComponent = style.icon;
        // Use role="alert" for errors (assertive), role="status" for others (polite)
        const role = toast.type === 'error' ? 'alert' : 'status';
        const ariaLive = toast.type === 'error' ? 'assertive' : 'polite';

        return (
          <div
            key={toast.id}
            role={role}
            aria-live={ariaLive}
            aria-atomic="true"
            className={`${style.bg} ${style.border} border rounded-2xl p-4 shadow-lg pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300`}
          >
            <div className="flex gap-3">
              <div className={`${style.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true">
                <IconComponent size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">{toast.title}</h4>
                <p className="text-slate-600 text-sm mt-0.5">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Stäng notifikation: ${toast.title}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
