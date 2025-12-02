import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Key to listen for (e.g., 'k', 'Enter', 'Escape') */
  key: string;
  /** Whether Ctrl/Cmd key must be pressed */
  ctrl?: boolean;
  /** Whether Shift key must be pressed */
  shift?: boolean;
  /** Whether Alt key must be pressed */
  alt?: boolean;
  /** Whether Meta (Cmd on Mac) key must be pressed */
  meta?: boolean;
  /** Callback when shortcut is triggered */
  handler: (event: KeyboardEvent) => void;
  /** Description for accessibility/help */
  description?: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether shortcut is currently enabled */
  enabled?: boolean;
}

/**
 * Hook for registering multiple keyboard shortcuts
 *
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param deps - Dependencies array (like useEffect)
 *
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', ctrl: true, handler: () => openSearch(), description: 'Öppna sök' },
 *   { key: 'Escape', handler: () => closeModal(), description: 'Stäng' },
 *   { key: 's', ctrl: true, handler: () => save(), preventDefault: true },
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  deps: React.DependencyList = []
): void {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      // Skip if disabled
      if (shortcut.enabled === false) continue;

      // Check if key matches
      const keyMatches =
        event.key.toLowerCase() === shortcut.key.toLowerCase() ||
        event.code.toLowerCase() === `key${shortcut.key.toLowerCase()}`;

      if (!keyMatches) continue;

      // Check modifier keys
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      // For shortcuts with modifiers, allow in input fields
      const hasModifier = shortcut.ctrl || shortcut.alt || shortcut.meta;

      if (!ctrlMatch || !shiftMatch || !altMatch) continue;

      // Skip if in input field and no modifier keys
      if (isInputField && !hasModifier) continue;

      // Trigger the handler
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }

      shortcut.handler(event);
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for detecting if a specific key is currently pressed
 *
 * @param targetKey - The key to listen for
 * @returns Whether the key is currently pressed
 *
 * @example
 * const isShiftPressed = useKeyPress('Shift');
 */
export function useKeyPress(targetKey: string): boolean {
  const pressedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        pressedRef.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        pressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [targetKey]);

  return pressedRef.current;
}

/**
 * Common keyboard shortcuts for Swedish apps
 */
export const COMMON_SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, description: 'Öppna sök' },
  SAVE: { key: 's', ctrl: true, description: 'Spara', preventDefault: true },
  CLOSE: { key: 'Escape', description: 'Stäng' },
  NEW: { key: 'n', ctrl: true, description: 'Ny' },
  HELP: { key: '?', shift: true, description: 'Visa hjälp' },
  NAVIGATE_UP: { key: 'ArrowUp', description: 'Navigera upp' },
  NAVIGATE_DOWN: { key: 'ArrowDown', description: 'Navigera ner' },
  SELECT: { key: 'Enter', description: 'Välj' },
  UNDO: { key: 'z', ctrl: true, description: 'Ångra' },
  REDO: { key: 'z', ctrl: true, shift: true, description: 'Gör om' },
} as const;

export default useKeyboardShortcuts;
