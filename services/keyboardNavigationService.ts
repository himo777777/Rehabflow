/**
 * Keyboard Navigation Service - Sprint 5.15
 *
 * Advanced keyboard navigation and shortcuts system.
 * Features:
 * - Global keyboard shortcuts
 * - Context-aware shortcuts
 * - Shortcut registration/unregistration
 * - Shortcut conflict detection
 * - Vim-style navigation mode
 * - Search/filter with keyboard
 * - Shortcut hints overlay
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';
export type KeyboardContext = 'global' | 'modal' | 'form' | 'list' | 'editor' | string;

export interface KeyBinding {
  key: string;
  modifiers?: ModifierKey[];
  description: string;
  context?: KeyboardContext;
  action: () => void | Promise<void>;
  preventDefault?: boolean;
  enabled?: boolean;
  group?: string;
}

export interface ShortcutGroup {
  id: string;
  name: string;
  description?: string;
  shortcuts: KeyBinding[];
}

export interface KeyboardEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  target: EventTarget | null;
}

export interface NavigationState {
  currentIndex: number;
  items: HTMLElement[];
  loop: boolean;
  orientation: 'horizontal' | 'vertical' | 'both';
}

export interface KeyboardConfig {
  enabled: boolean;
  showHints: boolean;
  hintDelay: number;
  vimModeEnabled: boolean;
  preventDefaultInForms: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_CONFIG = 'rehabflow-keyboard-config';
const FORM_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];

const DEFAULT_CONFIG: KeyboardConfig = {
  enabled: true,
  showHints: true,
  hintDelay: 1000,
  vimModeEnabled: false,
  preventDefaultInForms: false,
};

// ============================================================================
// KEYBOARD NAVIGATION SERVICE
// ============================================================================

class KeyboardNavigationService {
  private config: KeyboardConfig = DEFAULT_CONFIG;
  private shortcuts: Map<string, KeyBinding> = new Map();
  private groups: Map<string, ShortcutGroup> = new Map();
  private activeContext: KeyboardContext = 'global';
  private contextStack: KeyboardContext[] = ['global'];
  private isListening: boolean = false;
  private hintTimeout: number | null = null;
  private hintsVisible: boolean = false;

  // Vim mode state
  private vimMode: 'normal' | 'insert' | 'visual' = 'normal';
  private vimBuffer: string = '';

  constructor() {
    this.loadConfig();
    this.registerDefaultShortcuts();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('[Keyboard] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Keyboard] Failed to save config:', error);
    }
  }

  /**
   * Initialize keyboard navigation
   */
  public init(config?: Partial<KeyboardConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    if (!this.config.enabled) {
      logger.info('[Keyboard] Navigation disabled');
      return;
    }

    this.startListening();
    logger.info('[Keyboard] Navigation initialized');
  }

  /**
   * Start listening for keyboard events
   */
  public startListening(): void {
    if (this.isListening || typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  public stopListening(): void {
    if (!this.isListening) return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.isListening = false;
  }

  // --------------------------------------------------------------------------
  // DEFAULT SHORTCUTS
  // --------------------------------------------------------------------------

  private registerDefaultShortcuts(): void {
    // Navigation shortcuts
    this.registerGroup({
      id: 'navigation',
      name: 'Navigering',
      description: 'Navigera i applikationen',
      shortcuts: [
        {
          key: 'g',
          modifiers: ['alt'],
          description: 'Gå till hem',
          action: () => this.navigate('/'),
          group: 'navigation',
        },
        {
          key: 'e',
          modifiers: ['alt'],
          description: 'Gå till övningar',
          action: () => this.navigate('/exercises'),
          group: 'navigation',
        },
        {
          key: 'p',
          modifiers: ['alt'],
          description: 'Gå till framsteg',
          action: () => this.navigate('/progress'),
          group: 'navigation',
        },
        {
          key: 's',
          modifiers: ['alt'],
          description: 'Gå till inställningar',
          action: () => this.navigate('/settings'),
          group: 'navigation',
        },
      ],
    });

    // Search shortcuts
    this.registerGroup({
      id: 'search',
      name: 'Sök',
      shortcuts: [
        {
          key: 'k',
          modifiers: ['ctrl'],
          description: 'Öppna sök',
          action: () => this.openSearch(),
          preventDefault: true,
          group: 'search',
        },
        {
          key: '/',
          description: 'Fokusera sökfält',
          action: () => this.focusSearch(),
          group: 'search',
        },
        {
          key: 'Escape',
          description: 'Stäng sök/modal',
          action: () => this.closeModal(),
          context: 'modal',
          group: 'search',
        },
      ],
    });

    // Action shortcuts
    this.registerGroup({
      id: 'actions',
      name: 'Åtgärder',
      shortcuts: [
        {
          key: 'n',
          modifiers: ['ctrl'],
          description: 'Ny session',
          action: () => this.triggerAction('new-session'),
          preventDefault: true,
          group: 'actions',
        },
        {
          key: 's',
          modifiers: ['ctrl'],
          description: 'Spara',
          action: () => this.triggerAction('save'),
          preventDefault: true,
          group: 'actions',
        },
        {
          key: '?',
          modifiers: ['shift'],
          description: 'Visa kortkommandon',
          action: () => this.toggleHints(),
          group: 'actions',
        },
      ],
    });

    // List navigation
    this.registerGroup({
      id: 'list',
      name: 'Listnavigering',
      shortcuts: [
        {
          key: 'ArrowUp',
          description: 'Föregående objekt',
          action: () => this.navigateList('up'),
          context: 'list',
          group: 'list',
        },
        {
          key: 'ArrowDown',
          description: 'Nästa objekt',
          action: () => this.navigateList('down'),
          context: 'list',
          group: 'list',
        },
        {
          key: 'Enter',
          description: 'Välj objekt',
          action: () => this.selectListItem(),
          context: 'list',
          group: 'list',
        },
        {
          key: 'Home',
          description: 'Första objektet',
          action: () => this.navigateList('first'),
          context: 'list',
          group: 'list',
        },
        {
          key: 'End',
          description: 'Sista objektet',
          action: () => this.navigateList('last'),
          context: 'list',
          group: 'list',
        },
      ],
    });

    // Vim mode shortcuts
    if (this.config.vimModeEnabled) {
      this.registerGroup({
        id: 'vim',
        name: 'Vim-läge',
        shortcuts: [
          {
            key: 'j',
            description: 'Nedåt',
            action: () => this.vimMove('down'),
            group: 'vim',
          },
          {
            key: 'k',
            description: 'Uppåt',
            action: () => this.vimMove('up'),
            group: 'vim',
          },
          {
            key: 'h',
            description: 'Vänster',
            action: () => this.vimMove('left'),
            group: 'vim',
          },
          {
            key: 'l',
            description: 'Höger',
            action: () => this.vimMove('right'),
            group: 'vim',
          },
          {
            key: 'i',
            description: 'Insert-läge',
            action: () => this.setVimMode('insert'),
            group: 'vim',
          },
          {
            key: 'Escape',
            description: 'Normal-läge',
            action: () => this.setVimMode('normal'),
            group: 'vim',
          },
        ],
      });
    }
  }

  // --------------------------------------------------------------------------
  // SHORTCUT MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Register a keyboard shortcut
   */
  public register(binding: KeyBinding): void {
    const key = this.getBindingKey(binding);

    // Check for conflicts
    if (this.shortcuts.has(key)) {
      logger.warn('[Keyboard] Shortcut conflict:', key);
    }

    this.shortcuts.set(key, { ...binding, enabled: binding.enabled ?? true });
    logger.debug('[Keyboard] Registered:', key);
  }

  /**
   * Register a group of shortcuts
   */
  public registerGroup(group: ShortcutGroup): void {
    this.groups.set(group.id, group);
    group.shortcuts.forEach(shortcut => this.register(shortcut));
  }

  /**
   * Unregister a shortcut
   */
  public unregister(key: string, modifiers?: ModifierKey[]): void {
    const bindingKey = this.getBindingKey({ key, modifiers } as KeyBinding);
    this.shortcuts.delete(bindingKey);
  }

  /**
   * Unregister all shortcuts in a group
   */
  public unregisterGroup(groupId: string): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    group.shortcuts.forEach(shortcut => {
      const key = this.getBindingKey(shortcut);
      this.shortcuts.delete(key);
    });

    this.groups.delete(groupId);
  }

  /**
   * Enable/disable a shortcut
   */
  public setEnabled(key: string, enabled: boolean, modifiers?: ModifierKey[]): void {
    const bindingKey = this.getBindingKey({ key, modifiers } as KeyBinding);
    const shortcut = this.shortcuts.get(bindingKey);
    if (shortcut) {
      shortcut.enabled = enabled;
    }
  }

  /**
   * Get all registered shortcuts
   */
  public getShortcuts(): KeyBinding[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by context
   */
  public getShortcutsByContext(context: KeyboardContext): KeyBinding[] {
    return this.getShortcuts().filter(s =>
      !s.context || s.context === context || s.context === 'global'
    );
  }

  /**
   * Get all shortcut groups
   */
  public getGroups(): ShortcutGroup[] {
    return Array.from(this.groups.values());
  }

  // --------------------------------------------------------------------------
  // CONTEXT MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Push a context onto the stack
   */
  public pushContext(context: KeyboardContext): void {
    this.contextStack.push(context);
    this.activeContext = context;
    logger.debug('[Keyboard] Context pushed:', context);
  }

  /**
   * Pop the current context
   */
  public popContext(): void {
    if (this.contextStack.length > 1) {
      this.contextStack.pop();
      this.activeContext = this.contextStack[this.contextStack.length - 1];
      logger.debug('[Keyboard] Context popped, now:', this.activeContext);
    }
  }

  /**
   * Set active context directly
   */
  public setContext(context: KeyboardContext): void {
    this.activeContext = context;
    this.contextStack = [context];
  }

  /**
   * Get current context
   */
  public getContext(): KeyboardContext {
    return this.activeContext;
  }

  // --------------------------------------------------------------------------
  // EVENT HANDLING
  // --------------------------------------------------------------------------

  private handleKeyDown = (event: globalThis.KeyboardEvent): void => {
    // Skip if in form element and not configured to handle
    if (this.isFormElement(event.target as HTMLElement) && !this.config.preventDefaultInForms) {
      // Still handle Escape
      if (event.key !== 'Escape') {
        return;
      }
    }

    // Vim mode handling
    if (this.config.vimModeEnabled && this.vimMode === 'normal') {
      this.handleVimKey(event);
      return;
    }

    const bindingKey = this.getEventBindingKey(event);
    const shortcut = this.shortcuts.get(bindingKey);

    if (shortcut && shortcut.enabled) {
      // Check context
      if (shortcut.context && shortcut.context !== 'global' &&
          shortcut.context !== this.activeContext) {
        return;
      }

      if (shortcut.preventDefault) {
        event.preventDefault();
      }

      try {
        shortcut.action();
        logger.debug('[Keyboard] Shortcut triggered:', bindingKey);
      } catch (error) {
        logger.error('[Keyboard] Shortcut error:', bindingKey, error);
      }
    }

    // Show hints on modifier key hold
    if (this.config.showHints && this.isModifierKey(event.key)) {
      this.startHintTimer();
    }
  };

  private handleKeyUp = (event: globalThis.KeyboardEvent): void => {
    // Hide hints when modifier released
    if (this.isModifierKey(event.key)) {
      this.cancelHintTimer();
      if (this.hintsVisible) {
        this.hideHints();
      }
    }
  };

  private handleVimKey(event: globalThis.KeyboardEvent): void {
    this.vimBuffer += event.key;

    // Check for vim commands
    const vimBindings = Array.from(this.shortcuts.values())
      .filter(s => s.group === 'vim');

    for (const binding of vimBindings) {
      if (this.vimBuffer.endsWith(binding.key)) {
        event.preventDefault();
        binding.action();
        this.vimBuffer = '';
        return;
      }
    }

    // Clear buffer after timeout
    setTimeout(() => {
      this.vimBuffer = '';
    }, 500);
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  private getBindingKey(binding: KeyBinding): string {
    const modifiers = (binding.modifiers || []).sort().join('+');
    return modifiers ? `${modifiers}+${binding.key}` : binding.key;
  }

  private getEventBindingKey(event: globalThis.KeyboardEvent): string {
    const modifiers: string[] = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');

    const modifierStr = modifiers.sort().join('+');
    return modifierStr ? `${modifierStr}+${event.key}` : event.key;
  }

  private isFormElement(element: HTMLElement): boolean {
    return FORM_ELEMENTS.includes(element.tagName) ||
           element.isContentEditable;
  }

  private isModifierKey(key: string): boolean {
    return ['Control', 'Alt', 'Shift', 'Meta'].includes(key);
  }

  // --------------------------------------------------------------------------
  // HINT SYSTEM
  // --------------------------------------------------------------------------

  private startHintTimer(): void {
    if (this.hintTimeout) return;

    this.hintTimeout = window.setTimeout(() => {
      this.showHints();
    }, this.config.hintDelay);
  }

  private cancelHintTimer(): void {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }
  }

  private showHints(): void {
    this.hintsVisible = true;
    this.triggerAction('show-hints');
  }

  private hideHints(): void {
    this.hintsVisible = false;
    this.triggerAction('hide-hints');
  }

  /**
   * Toggle hints overlay
   */
  public toggleHints(): void {
    if (this.hintsVisible) {
      this.hideHints();
    } else {
      this.showHints();
    }
  }

  // --------------------------------------------------------------------------
  // NAVIGATION HELPERS
  // --------------------------------------------------------------------------

  private navigate(path: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('keyboard-navigate', { detail: { path } }));
    }
  }

  private openSearch(): void {
    this.triggerAction('open-search');
  }

  private focusSearch(): void {
    const searchInput = document.querySelector<HTMLInputElement>('[data-search-input], input[type="search"]');
    if (searchInput) {
      searchInput.focus();
    }
  }

  private closeModal(): void {
    this.triggerAction('close-modal');
    this.popContext();
  }

  private triggerAction(action: string, data?: unknown): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`keyboard-action-${action}`, { detail: data }));
    }
  }

  // --------------------------------------------------------------------------
  // LIST NAVIGATION
  // --------------------------------------------------------------------------

  private listState: NavigationState | null = null;

  /**
   * Initialize list navigation
   */
  public initListNavigation(
    container: HTMLElement,
    options?: { loop?: boolean; orientation?: 'horizontal' | 'vertical' | 'both' }
  ): void {
    const items = Array.from(container.querySelectorAll<HTMLElement>(
      '[role="option"], [role="menuitem"], [role="listitem"], li, .list-item'
    ));

    this.listState = {
      currentIndex: 0,
      items,
      loop: options?.loop ?? true,
      orientation: options?.orientation ?? 'vertical',
    };

    this.pushContext('list');

    // Set initial tabindex
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    if (items[0]) {
      items[0].focus();
    }
  }

  /**
   * Navigate in list
   */
  public navigateList(direction: 'up' | 'down' | 'left' | 'right' | 'first' | 'last'): void {
    if (!this.listState || this.listState.items.length === 0) return;

    let newIndex = this.listState.currentIndex;

    switch (direction) {
      case 'up':
      case 'left':
        newIndex--;
        break;
      case 'down':
      case 'right':
        newIndex++;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = this.listState.items.length - 1;
        break;
    }

    // Handle looping
    if (this.listState.loop) {
      if (newIndex < 0) newIndex = this.listState.items.length - 1;
      if (newIndex >= this.listState.items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, this.listState.items.length - 1));
    }

    // Update tabindex and focus
    this.listState.items[this.listState.currentIndex].setAttribute('tabindex', '-1');
    this.listState.items[newIndex].setAttribute('tabindex', '0');
    this.listState.items[newIndex].focus();

    this.listState.currentIndex = newIndex;
  }

  /**
   * Select current list item
   */
  public selectListItem(): void {
    if (!this.listState) return;

    const item = this.listState.items[this.listState.currentIndex];
    if (item) {
      item.click();
    }
  }

  /**
   * End list navigation
   */
  public endListNavigation(): void {
    this.listState = null;
    this.popContext();
  }

  // --------------------------------------------------------------------------
  // VIM MODE
  // --------------------------------------------------------------------------

  /**
   * Set vim mode
   */
  public setVimMode(mode: 'normal' | 'insert' | 'visual'): void {
    this.vimMode = mode;
    this.vimBuffer = '';
    logger.debug('[Keyboard] Vim mode:', mode);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vim-mode-change', { detail: { mode } }));
    }
  }

  /**
   * Get current vim mode
   */
  public getVimMode(): 'normal' | 'insert' | 'visual' {
    return this.vimMode;
  }

  private vimMove(direction: 'up' | 'down' | 'left' | 'right'): void {
    // Simulate arrow key press
    const keyMap = {
      up: 'ArrowUp',
      down: 'ArrowDown',
      left: 'ArrowLeft',
      right: 'ArrowRight',
    };

    const event = new KeyboardEvent('keydown', {
      key: keyMap[direction],
      bubbles: true,
    });

    document.activeElement?.dispatchEvent(event);
  }

  // --------------------------------------------------------------------------
  // CONFIGURATION
  // --------------------------------------------------------------------------

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<KeyboardConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  /**
   * Get current configuration
   */
  public getConfig(): KeyboardConfig {
    return { ...this.config };
  }

  /**
   * Enable vim mode
   */
  public enableVimMode(): void {
    this.config.vimModeEnabled = true;
    this.saveConfig();
    this.registerDefaultShortcuts(); // Re-register with vim shortcuts
  }

  /**
   * Disable vim mode
   */
  public disableVimMode(): void {
    this.config.vimModeEnabled = false;
    this.vimMode = 'normal';
    this.saveConfig();
    this.unregisterGroup('vim');
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const keyboardNavigationService = new KeyboardNavigationService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: {
    modifiers?: ModifierKey[];
    context?: KeyboardContext;
    preventDefault?: boolean;
    enabled?: boolean;
  }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const binding: KeyBinding = {
      key,
      modifiers: options?.modifiers,
      description: '',
      context: options?.context,
      preventDefault: options?.preventDefault ?? true,
      enabled: options?.enabled ?? true,
      action: () => callbackRef.current(),
    };

    keyboardNavigationService.register(binding);

    return () => {
      keyboardNavigationService.unregister(key, options?.modifiers);
    };
  }, [key, options?.modifiers, options?.context, options?.preventDefault, options?.enabled]);
}

/**
 * Hook for keyboard context
 */
export function useKeyboardContext(context: KeyboardContext) {
  useEffect(() => {
    keyboardNavigationService.pushContext(context);
    return () => {
      keyboardNavigationService.popContext();
    };
  }, [context]);
}

/**
 * Hook for list navigation
 */
export function useListNavigation(options?: { loop?: boolean; orientation?: 'horizontal' | 'vertical' }) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      keyboardNavigationService.initListNavigation(containerRef.current, options);
    }

    return () => {
      keyboardNavigationService.endListNavigation();
    };
  }, [options]);

  return containerRef;
}

/**
 * Hook for vim mode status
 */
export function useVimMode() {
  const [mode, setMode] = useState(keyboardNavigationService.getVimMode());

  useEffect(() => {
    const handleModeChange = (event: CustomEvent) => {
      setMode(event.detail.mode);
    };

    window.addEventListener('vim-mode-change', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('vim-mode-change', handleModeChange as EventListener);
    };
  }, []);

  return {
    mode,
    isNormal: mode === 'normal',
    isInsert: mode === 'insert',
    isVisual: mode === 'visual',
    setMode: keyboardNavigationService.setVimMode.bind(keyboardNavigationService),
  };
}

/**
 * Hook for shortcut hints
 */
export function useShortcutHints() {
  const [visible, setVisible] = useState(false);
  const [shortcuts, setShortcuts] = useState<KeyBinding[]>([]);

  useEffect(() => {
    const context = keyboardNavigationService.getContext();
    setShortcuts(keyboardNavigationService.getShortcutsByContext(context));

    const handleShow = () => setVisible(true);
    const handleHide = () => setVisible(false);

    window.addEventListener('keyboard-action-show-hints', handleShow);
    window.addEventListener('keyboard-action-hide-hints', handleHide);

    return () => {
      window.removeEventListener('keyboard-action-show-hints', handleShow);
      window.removeEventListener('keyboard-action-hide-hints', handleHide);
    };
  }, []);

  return {
    visible,
    shortcuts,
    groups: keyboardNavigationService.getGroups(),
    toggle: keyboardNavigationService.toggleHints.bind(keyboardNavigationService),
  };
}

export default keyboardNavigationService;
