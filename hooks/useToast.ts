import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';
import { UI_CONFIG } from '../constants';

interface UseToastReturn {
  toasts: ToastMessage[];
  showToast: (type: ToastType, title: string, message: string) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // Convenience methods
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  info: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
}

/**
 * Custom hook for managing toast notifications
 */
function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: ToastMessage = { id, type, title, message };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, UI_CONFIG.TOAST_DURATION_MS);

    return id;
  }, [removeToast]);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message: string) => {
    showToast('success', title, message);
  }, [showToast]);

  const error = useCallback((title: string, message: string) => {
    showToast('error', title, message);
  }, [showToast]);

  const info = useCallback((title: string, message: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const warning = useCallback((title: string, message: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    info,
    warning
  };
}

export default useToast;
