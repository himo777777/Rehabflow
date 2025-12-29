/**
 * Accessibility Utilities - WCAG 2.1 AA Compliance
 *
 * Comprehensive accessibility utilities for:
 * - ARIA attributes and live regions
 * - Focus management
 * - Keyboard navigation
 * - Screen reader announcements
 * - Color contrast utilities
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';

// ============================================================================
// ARIA UTILITIES
// ============================================================================

/**
 * ARIA role types for common patterns
 */
export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'button'
  | 'checkbox'
  | 'dialog'
  | 'grid'
  | 'gridcell'
  | 'link'
  | 'listbox'
  | 'menu'
  | 'menuitem'
  | 'option'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'slider'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'tabpanel'
  | 'textbox'
  | 'timer'
  | 'tooltip'
  | 'tree'
  | 'treeitem';

/**
 * ARIA live region politeness levels
 */
export type AriaLive = 'off' | 'polite' | 'assertive';

/**
 * Generate ARIA props for interactive elements
 */
export const ariaProps = {
  /**
   * Button with expanded state
   */
  expandButton: (expanded: boolean, controlsId: string) => ({
    role: 'button' as const,
    'aria-expanded': expanded,
    'aria-controls': controlsId,
  }),

  /**
   * Toggle button
   */
  toggleButton: (pressed: boolean, label: string) => ({
    role: 'button' as const,
    'aria-pressed': pressed,
    'aria-label': label,
  }),

  /**
   * Tab panel
   */
  tabPanel: (id: string, labelledBy: string, selected: boolean) => ({
    role: 'tabpanel' as const,
    id,
    'aria-labelledby': labelledBy,
    hidden: !selected,
    tabIndex: selected ? 0 : -1,
  }),

  /**
   * Tab
   */
  tab: (id: string, controls: string, selected: boolean) => ({
    role: 'tab' as const,
    id,
    'aria-controls': controls,
    'aria-selected': selected,
    tabIndex: selected ? 0 : -1,
  }),

  /**
   * Progress indicator
   */
  progress: (value: number, min = 0, max = 100, label?: string) => ({
    role: 'progressbar' as const,
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-label': label || `${Math.round((value / max) * 100)}% slutfört`,
  }),

  /**
   * Live region for dynamic content
   */
  liveRegion: (live: AriaLive = 'polite', atomic = true) => ({
    'aria-live': live,
    'aria-atomic': atomic,
  }),

  /**
   * Dialog
   */
  dialog: (labelledBy: string, describedBy?: string) => ({
    role: 'dialog' as const,
    'aria-modal': true,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  }),

  /**
   * Alert dialog
   */
  alertDialog: (labelledBy: string, describedBy?: string) => ({
    role: 'alertdialog' as const,
    'aria-modal': true,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
  }),

  /**
   * Slider
   */
  slider: (
    value: number,
    min: number,
    max: number,
    step: number,
    label: string,
    valueText?: string
  ) => ({
    role: 'slider' as const,
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-label': label,
    'aria-valuetext': valueText || `${value}`,
    tabIndex: 0,
  }),

  /**
   * List item in a selection list
   */
  option: (selected: boolean, label: string) => ({
    role: 'option' as const,
    'aria-selected': selected,
    'aria-label': label,
  }),

  /**
   * Checkbox
   */
  checkbox: (checked: boolean | 'mixed', label: string) => ({
    role: 'checkbox' as const,
    'aria-checked': checked,
    'aria-label': label,
    tabIndex: 0,
  }),

  /**
   * Radio button
   */
  radio: (checked: boolean, label: string) => ({
    role: 'radio' as const,
    'aria-checked': checked,
    'aria-label': label,
    tabIndex: checked ? 0 : -1,
  }),
};

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousActiveElement: Element | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }

  /**
   * Activate the focus trap
   */
  activate(): void {
    this.previousActiveElement = document.activeElement;
    this.updateFocusableElements();

    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate(): void {
    this.container.removeEventListener('keydown', this.handleKeyDown);

    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };
}

/**
 * Hook for managing focus trap in React components
 */
export function useFocusTrap(isActive: boolean): React.RefObject<HTMLDivElement> {
  const containerRef = useRef<HTMLDivElement>(null);
  const trapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isActive) {
      trapRef.current = new FocusTrap(containerRef.current);
      trapRef.current.activate();
    } else {
      trapRef.current?.deactivate();
    }

    return () => {
      trapRef.current?.deactivate();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(selectors));
  },

  /**
   * Focus the first focusable element in a container
   */
  focusFirst: (container: HTMLElement): boolean => {
    const elements = focusManager.getFocusableElements(container);
    if (elements.length > 0) {
      elements[0].focus();
      return true;
    }
    return false;
  },

  /**
   * Focus the last focusable element in a container
   */
  focusLast: (container: HTMLElement): boolean => {
    const elements = focusManager.getFocusableElements(container);
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
      return true;
    }
    return false;
  },

  /**
   * Move focus to the next/previous focusable element
   */
  moveFocus: (container: HTMLElement, direction: 'next' | 'prev'): boolean => {
    const elements = focusManager.getFocusableElements(container);
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) {
      return direction === 'next'
        ? focusManager.focusFirst(container)
        : focusManager.focusLast(container);
    }

    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % elements.length
        : (currentIndex - 1 + elements.length) % elements.length;

    elements[nextIndex].focus();
    return true;
  },
};

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Common keyboard key codes
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Keyboard navigation handler for lists
 */
export function useListKeyboardNavigation(
  itemCount: number,
  onSelect: (index: number) => void,
  options: {
    wrap?: boolean;
    orientation?: 'vertical' | 'horizontal';
    initialIndex?: number;
  } = {}
): {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  getItemProps: (index: number) => Record<string, any>;
} {
  const { wrap = true, orientation = 'vertical', initialIndex = 0 } = options;
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const prevKey = orientation === 'vertical' ? Keys.ARROW_UP : Keys.ARROW_LEFT;
      const nextKey = orientation === 'vertical' ? Keys.ARROW_DOWN : Keys.ARROW_RIGHT;

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          setActiveIndex((current) => {
            const next = current + 1;
            return wrap ? next % itemCount : Math.min(next, itemCount - 1);
          });
          break;

        case prevKey:
          event.preventDefault();
          setActiveIndex((current) => {
            const prev = current - 1;
            return wrap ? (prev + itemCount) % itemCount : Math.max(prev, 0);
          });
          break;

        case Keys.HOME:
          event.preventDefault();
          setActiveIndex(0);
          break;

        case Keys.END:
          event.preventDefault();
          setActiveIndex(itemCount - 1);
          break;

        case Keys.ENTER:
        case Keys.SPACE:
          event.preventDefault();
          onSelect(activeIndex);
          break;
      }
    },
    [activeIndex, itemCount, onSelect, wrap, orientation]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      role: 'option',
      'aria-selected': index === activeIndex,
      tabIndex: index === activeIndex ? 0 : -1,
      onFocus: () => setActiveIndex(index),
      onClick: () => {
        setActiveIndex(index);
        onSelect(index);
      },
    }),
    [activeIndex, onSelect]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getItemProps,
  };
}

/**
 * Hook for roving tabindex pattern
 */
export function useRovingTabIndex(
  itemCount: number,
  options: {
    orientation?: 'vertical' | 'horizontal' | 'both';
    wrap?: boolean;
  } = {}
): {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  getTabIndex: (index: number) => number;
  handleKeyDown: (event: React.KeyboardEvent) => void;
} {
  const { orientation = 'horizontal', wrap = true } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = activeIndex;
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';

      switch (event.key) {
        case Keys.ARROW_RIGHT:
          if (isHorizontal) {
            event.preventDefault();
            newIndex = wrap
              ? (activeIndex + 1) % itemCount
              : Math.min(activeIndex + 1, itemCount - 1);
          }
          break;

        case Keys.ARROW_LEFT:
          if (isHorizontal) {
            event.preventDefault();
            newIndex = wrap
              ? (activeIndex - 1 + itemCount) % itemCount
              : Math.max(activeIndex - 1, 0);
          }
          break;

        case Keys.ARROW_DOWN:
          if (isVertical) {
            event.preventDefault();
            newIndex = wrap
              ? (activeIndex + 1) % itemCount
              : Math.min(activeIndex + 1, itemCount - 1);
          }
          break;

        case Keys.ARROW_UP:
          if (isVertical) {
            event.preventDefault();
            newIndex = wrap
              ? (activeIndex - 1 + itemCount) % itemCount
              : Math.max(activeIndex - 1, 0);
          }
          break;

        case Keys.HOME:
          event.preventDefault();
          newIndex = 0;
          break;

        case Keys.END:
          event.preventDefault();
          newIndex = itemCount - 1;
          break;
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    },
    [activeIndex, itemCount, orientation, wrap]
  );

  const getTabIndex = useCallback(
    (index: number) => (index === activeIndex ? 0 : -1),
    [activeIndex]
  );

  return {
    activeIndex,
    setActiveIndex,
    getTabIndex,
    handleKeyDown,
  };
}

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

/**
 * Announce message to screen readers
 */
export function announce(
  message: string,
  politeness: AriaLive = 'polite',
  timeout = 1000
): void {
  const container = document.createElement('div');
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', politeness);
  container.setAttribute('aria-atomic', 'true');
  container.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;

  document.body.appendChild(container);

  // Delay to ensure screen reader picks up the change
  requestAnimationFrame(() => {
    container.textContent = message;
  });

  setTimeout(() => {
    document.body.removeChild(container);
  }, timeout);
}

/**
 * Hook for announcing state changes
 */
export function useAnnounce(): (message: string, politeness?: AriaLive) => void {
  return useCallback((message: string, politeness: AriaLive = 'polite') => {
    announce(message, politeness);
  }, []);
}

// ============================================================================
// SKIP LINKS
// ============================================================================

/**
 * Skip link target IDs
 */
export const skipTargets = {
  mainContent: 'main-content',
  navigation: 'main-nav',
  search: 'search-input',
  footer: 'footer',
};

/**
 * Create skip link props
 */
export const skipLink = {
  /**
   * Props for the skip link element
   */
  link: (targetId: string, label: string) => ({
    href: `#${targetId}`,
    className: 'skip-link sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-primary-600 focus:shadow-lg focus:rounded-lg',
    children: label,
  }),

  /**
   * Props for the skip link target
   */
  target: (id: string) => ({
    id,
    tabIndex: -1,
  }),
};

// ============================================================================
// COLOR CONTRAST UTILITIES
// ============================================================================

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG requirements
 */
export function meetsContrastRequirement(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

// ============================================================================
// MOTION PREFERENCES
// ============================================================================

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * Hook to detect high contrast mode
 */
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return highContrast;
}

export default {
  ariaProps,
  FocusTrap,
  useFocusTrap,
  focusManager,
  Keys,
  useListKeyboardNavigation,
  useRovingTabIndex,
  announce,
  useAnnounce,
  skipTargets,
  skipLink,
  getContrastRatio,
  meetsContrastRequirement,
  useReducedMotion,
  useHighContrast,
};
