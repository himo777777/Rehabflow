/**
 * Accessibility Hooks & Utilities
 *
 * WCAG 2.1 AA compliant utilities:
 * - Focus trapping for modals
 * - ARIA live announcements
 * - Keyboard navigation helpers
 * - Reduced motion detection
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================
// FOCUS TRAP HOOK
// ============================================

/**
 * Traps focus within a container (for modals, dialogs)
 * @param isActive - Whether focus trap is active
 * @returns Ref to attach to container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    // Focus first focusable element
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const currentFocusable = getFocusableElements(container);
      if (currentFocusable.length === 0) return;

      const firstElement = currentFocusable[0] as HTMLElement;
      const lastElement = currentFocusable[currentFocusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: go backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: go forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
  );
}

// ============================================
// ARIA LIVE ANNOUNCER
// ============================================

let announcer: HTMLDivElement | null = null;

/**
 * Initialize screen reader announcer (call once at app start)
 */
export function initAnnouncer(): void {
  if (announcer || typeof document === 'undefined') return;

  announcer = document.createElement('div');
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  // Position off-screen but readable by screen readers
  Object.assign(announcer.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0'
  });
  document.body.appendChild(announcer);
}

/**
 * Announce message to screen readers
 * @param message - Message to announce
 * @param priority - 'polite' for non-urgent, 'assertive' for urgent
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (!announcer) {
    initAnnouncer();
  }

  if (announcer) {
    announcer.setAttribute('aria-live', priority);
    // Clear and re-add to trigger announcement
    announcer.textContent = '';
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = message;
      }
    }, 100);
  }
}

/**
 * Hook for making announcements
 */
export function useAnnounce() {
  useEffect(() => {
    initAnnouncer();
  }, []);

  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);
}

// ============================================
// REDUCED MOTION DETECTION
// ============================================

/**
 * Hook to detect user's motion preference
 * @returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// KEYBOARD NAVIGATION HELPERS
// ============================================

/**
 * Arrow key navigation for lists/grids
 */
export function useArrowNavigation(
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical',
  columns: number = 1
) {
  const handleKeyDown = useCallback((e: KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'grid') {
          nextIndex = Math.min(currentIndex + columns, items.length - 1);
          e.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'grid') {
          nextIndex = Math.max(currentIndex - columns, 0);
          e.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'grid') {
          nextIndex = Math.min(currentIndex + 1, items.length - 1);
          e.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'grid') {
          nextIndex = Math.max(currentIndex - 1, 0);
          e.preventDefault();
        }
        break;
      case 'Home':
        nextIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        nextIndex = items.length - 1;
        e.preventDefault();
        break;
    }

    if (nextIndex !== currentIndex && items[nextIndex]) {
      items[nextIndex].focus();
    }

    return nextIndex;
  }, [items, orientation, columns]);

  return handleKeyDown;
}

// ============================================
// SKIP LINK HANDLER
// ============================================

/**
 * Scroll to and focus main content
 */
export function skipToMain(): void {
  const main = document.getElementById('main-content');
  if (main) {
    main.tabIndex = -1;
    main.focus();
    main.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================
// FORM VALIDATION ANNOUNCEMENTS
// ============================================

/**
 * Announce form errors to screen readers
 * @param errors - Array of error messages or single error
 */
export function announceFormErrors(errors: string | string[]): void {
  const errorList = Array.isArray(errors) ? errors : [errors];
  const message = errorList.length === 1
    ? `Fel: ${errorList[0]}`
    : `${errorList.length} fel hittades: ${errorList.join(', ')}`;

  announce(message, 'assertive');
}

/**
 * Generate error summary for screen readers
 */
export function getErrorSummary(errors: Record<string, string>): string {
  const errorEntries = Object.entries(errors).filter(([_, msg]) => msg);
  if (errorEntries.length === 0) return '';

  if (errorEntries.length === 1) {
    return `Ett fel i formuläret: ${errorEntries[0][1]}`;
  }

  return `${errorEntries.length} fel i formuläret: ${errorEntries.map(([_, msg]) => msg).join('. ')}`;
}

// ============================================
// LOADING STATE ANNOUNCEMENTS
// ============================================

/**
 * Announce loading states with appropriate politeness
 */
export function announceLoadingState(isLoading: boolean, loadingMessage?: string, completeMessage?: string): void {
  if (isLoading) {
    announce(loadingMessage || 'Laddar...', 'polite');
  } else if (completeMessage) {
    announce(completeMessage, 'polite');
  }
}

// ============================================
// COLOR CONTRAST UTILITIES
// ============================================

/**
 * Check if color combination meets WCAG AA contrast requirements
 * @param foreground - Foreground color in hex
 * @param background - Background color in hex
 * @param isLargeText - Whether text is large (18pt or 14pt bold)
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(hexToRgb(color1));
  const l2 = getRelativeLuminance(hexToRgb(color2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// ============================================
// EXPORTS
// ============================================

export const a11y = {
  announce,
  announceFormErrors,
  announceLoadingState,
  getErrorSummary,
  skipToMain,
  meetsContrastRequirement
};

export default a11y;
