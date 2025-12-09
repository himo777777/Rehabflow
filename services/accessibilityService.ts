/**
 * Accessibility Service - Sprint 5.15
 *
 * Automated accessibility testing and enhancement.
 * Features:
 * - WCAG 2.1 compliance checking
 * - Screen reader announcements
 * - Focus management
 * - Color contrast analysis
 * - Keyboard navigation helpers
 * - ARIA attribute management
 * - Accessibility audit reports
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type IssueSeverity = 'critical' | 'serious' | 'moderate' | 'minor';
export type IssueCategory =
  | 'perceivable'
  | 'operable'
  | 'understandable'
  | 'robust'
  | 'aria'
  | 'contrast'
  | 'keyboard'
  | 'focus'
  | 'forms'
  | 'images'
  | 'headings'
  | 'landmarks';

export interface AccessibilityIssue {
  id: string;
  ruleId: string;
  element: string;
  description: string;
  help: string;
  helpUrl?: string;
  severity: IssueSeverity;
  category: IssueCategory;
  wcagCriteria: string[];
  impact: string;
  suggestion: string;
}

export interface AuditResult {
  timestamp: string;
  url: string;
  passed: number;
  failed: number;
  warnings: number;
  issues: AccessibilityIssue[];
  score: number; // 0-100
  wcagLevel: WCAGLevel;
  duration: number;
}

export interface ContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  isLargeText: boolean;
}

export interface FocusTrap {
  id: string;
  element: HTMLElement;
  firstFocusable: HTMLElement | null;
  lastFocusable: HTMLElement | null;
  previousFocus: HTMLElement | null;
  isActive: boolean;
}

export interface AccessibilityConfig {
  enabled: boolean;
  autoAudit: boolean;
  auditInterval: number;
  announceNavigations: boolean;
  manageFocus: boolean;
  wcagLevel: WCAGLevel;
  customRules: AccessibilityRule[];
}

export interface AccessibilityRule {
  id: string;
  description: string;
  selector: string;
  test: (element: HTMLElement) => boolean;
  severity: IssueSeverity;
  category: IssueCategory;
  wcagCriteria: string[];
  help: string;
  suggestion: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_CONFIG = 'rehabflow-a11y-config';
const STORAGE_KEY_AUDITS = 'rehabflow-a11y-audits';

const DEFAULT_CONFIG: AccessibilityConfig = {
  enabled: true,
  autoAudit: false,
  auditInterval: 60000, // 1 minute
  announceNavigations: true,
  manageFocus: true,
  wcagLevel: 'AA',
  customRules: [],
};

// Focusable element selectors
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'details > summary',
].join(', ');

// ============================================================================
// BUILT-IN RULES
// ============================================================================

const BUILT_IN_RULES: AccessibilityRule[] = [
  // Images
  {
    id: 'img-alt',
    description: 'Images must have alt text',
    selector: 'img',
    test: (el) => !!el.getAttribute('alt') || el.getAttribute('role') === 'presentation',
    severity: 'critical',
    category: 'images',
    wcagCriteria: ['1.1.1'],
    help: 'All images must have alternative text',
    suggestion: 'Add an alt attribute describing the image content',
  },
  {
    id: 'img-alt-empty',
    description: 'Decorative images should have empty alt',
    selector: 'img[role="presentation"], img[aria-hidden="true"]',
    test: (el) => el.getAttribute('alt') === '',
    severity: 'minor',
    category: 'images',
    wcagCriteria: ['1.1.1'],
    help: 'Decorative images should have empty alt text',
    suggestion: 'Set alt="" for decorative images',
  },

  // Buttons
  {
    id: 'button-name',
    description: 'Buttons must have accessible names',
    selector: 'button, [role="button"]',
    test: (el) => {
      const hasText = (el.textContent?.trim() || '').length > 0;
      const hasAriaLabel = !!el.getAttribute('aria-label');
      const hasAriaLabelledby = !!el.getAttribute('aria-labelledby');
      const hasTitle = !!el.getAttribute('title');
      return hasText || hasAriaLabel || hasAriaLabelledby || hasTitle;
    },
    severity: 'critical',
    category: 'operable',
    wcagCriteria: ['4.1.2'],
    help: 'Buttons must have discernible text',
    suggestion: 'Add text content, aria-label, or aria-labelledby',
  },

  // Links
  {
    id: 'link-name',
    description: 'Links must have accessible names',
    selector: 'a[href]',
    test: (el) => {
      const hasText = (el.textContent?.trim() || '').length > 0;
      const hasAriaLabel = !!el.getAttribute('aria-label');
      const hasImg = el.querySelector('img[alt]') !== null;
      return hasText || hasAriaLabel || hasImg;
    },
    severity: 'critical',
    category: 'operable',
    wcagCriteria: ['2.4.4', '4.1.2'],
    help: 'Links must have discernible text',
    suggestion: 'Add link text or aria-label',
  },

  // Forms
  {
    id: 'label-input',
    description: 'Form inputs must have labels',
    selector: 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
    test: (el) => {
      const id = el.getAttribute('id');
      const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false;
      const hasAriaLabel = !!el.getAttribute('aria-label');
      const hasAriaLabelledby = !!el.getAttribute('aria-labelledby');
      const hasTitle = !!el.getAttribute('title');
      const hasPlaceholder = !!el.getAttribute('placeholder');
      return hasLabel || hasAriaLabel || hasAriaLabelledby || hasTitle || hasPlaceholder;
    },
    severity: 'critical',
    category: 'forms',
    wcagCriteria: ['1.3.1', '4.1.2'],
    help: 'Form elements must have labels',
    suggestion: 'Add a <label> element or aria-label attribute',
  },

  // Headings
  {
    id: 'heading-order',
    description: 'Heading levels should not skip',
    selector: 'h1, h2, h3, h4, h5, h6',
    test: (el) => {
      const level = parseInt(el.tagName[1]);
      const allHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const index = allHeadings.indexOf(el);
      if (index === 0) return level === 1;
      const prevHeading = allHeadings[index - 1];
      const prevLevel = parseInt(prevHeading.tagName[1]);
      return level <= prevLevel + 1;
    },
    severity: 'moderate',
    category: 'headings',
    wcagCriteria: ['1.3.1'],
    help: 'Headings should follow a logical order',
    suggestion: 'Ensure heading levels increase by 1',
  },
  {
    id: 'page-has-h1',
    description: 'Page should have exactly one h1',
    selector: 'body',
    test: () => document.querySelectorAll('h1').length === 1,
    severity: 'serious',
    category: 'headings',
    wcagCriteria: ['1.3.1'],
    help: 'Pages should have exactly one h1 heading',
    suggestion: 'Ensure there is exactly one h1 on the page',
  },

  // Landmarks
  {
    id: 'landmark-main',
    description: 'Page should have a main landmark',
    selector: 'body',
    test: () => document.querySelector('main, [role="main"]') !== null,
    severity: 'serious',
    category: 'landmarks',
    wcagCriteria: ['1.3.1'],
    help: 'Pages should have a main landmark',
    suggestion: 'Add <main> or role="main" to the main content area',
  },

  // Keyboard
  {
    id: 'tabindex-positive',
    description: 'Avoid positive tabindex values',
    selector: '[tabindex]',
    test: (el) => {
      const tabindex = parseInt(el.getAttribute('tabindex') || '0');
      return tabindex <= 0;
    },
    severity: 'serious',
    category: 'keyboard',
    wcagCriteria: ['2.4.3'],
    help: 'Avoid using positive tabindex values',
    suggestion: 'Use tabindex="0" or natural document order',
  },

  // ARIA
  {
    id: 'aria-valid-attr',
    description: 'ARIA attributes must be valid',
    selector: '[aria-hidden], [aria-label], [aria-labelledby], [aria-describedby]',
    test: (el) => {
      const ariaLabelledby = el.getAttribute('aria-labelledby');
      const ariaDescribedby = el.getAttribute('aria-describedby');

      if (ariaLabelledby) {
        const ids = ariaLabelledby.split(' ');
        for (const id of ids) {
          if (!document.getElementById(id)) return false;
        }
      }

      if (ariaDescribedby) {
        const ids = ariaDescribedby.split(' ');
        for (const id of ids) {
          if (!document.getElementById(id)) return false;
        }
      }

      return true;
    },
    severity: 'critical',
    category: 'aria',
    wcagCriteria: ['4.1.2'],
    help: 'ARIA references must point to existing elements',
    suggestion: 'Ensure aria-labelledby and aria-describedby point to valid IDs',
  },

  // Focus
  {
    id: 'focus-visible',
    description: 'Interactive elements should have visible focus',
    selector: 'a, button, input, select, textarea, [tabindex="0"]',
    test: (el) => {
      const styles = window.getComputedStyle(el);
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      // Check if focus styles are not removed
      return outline !== 'none' || boxShadow !== 'none';
    },
    severity: 'serious',
    category: 'focus',
    wcagCriteria: ['2.4.7'],
    help: 'Interactive elements must have visible focus indicator',
    suggestion: 'Add :focus styles with outline or box-shadow',
  },
];

// ============================================================================
// ACCESSIBILITY SERVICE
// ============================================================================

class AccessibilityService {
  private config: AccessibilityConfig = DEFAULT_CONFIG;
  private audits: AuditResult[] = [];
  private focusTraps: Map<string, FocusTrap> = new Map();
  private liveRegion: HTMLElement | null = null;
  private auditInterval: number | null = null;

  constructor() {
    this.loadConfig();
    this.createLiveRegion();
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

      const audits = localStorage.getItem(STORAGE_KEY_AUDITS);
      if (audits) {
        this.audits = JSON.parse(audits);
      }
    } catch (error) {
      logger.error('[Accessibility] Failed to load config:', error);
    }
  }

  private saveConfig(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(this.config));
    } catch (error) {
      logger.error('[Accessibility] Failed to save config:', error);
    }
  }

  private saveAudits(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const recentAudits = this.audits.slice(-20);
      localStorage.setItem(STORAGE_KEY_AUDITS, JSON.stringify(recentAudits));
    } catch (error) {
      logger.error('[Accessibility] Failed to save audits:', error);
    }
  }

  /**
   * Initialize accessibility service
   */
  public init(config?: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();

    if (this.config.autoAudit) {
      this.startAutoAudit();
    }

    logger.info('[Accessibility] Initialized');
  }

  // --------------------------------------------------------------------------
  // LIVE REGION (Screen Reader Announcements)
  // --------------------------------------------------------------------------

  private createLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
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

    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = '';

    // Use setTimeout to ensure the announcement is made
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 100);

    logger.debug('[Accessibility] Announced:', message);
  }

  /**
   * Announce route change
   */
  public announceRouteChange(title: string): void {
    if (!this.config.announceNavigations) return;
    this.announce(`Navigerade till ${title}`);
  }

  // --------------------------------------------------------------------------
  // FOCUS MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Create a focus trap
   */
  public createFocusTrap(id: string, element: HTMLElement): FocusTrap {
    const focusableElements = this.getFocusableElements(element);

    const trap: FocusTrap = {
      id,
      element,
      firstFocusable: focusableElements[0] || null,
      lastFocusable: focusableElements[focusableElements.length - 1] || null,
      previousFocus: document.activeElement as HTMLElement,
      isActive: false,
    };

    this.focusTraps.set(id, trap);
    return trap;
  }

  /**
   * Activate focus trap
   */
  public activateFocusTrap(id: string): void {
    const trap = this.focusTraps.get(id);
    if (!trap) return;

    trap.isActive = true;
    trap.previousFocus = document.activeElement as HTMLElement;

    // Focus first element
    if (trap.firstFocusable) {
      trap.firstFocusable.focus();
    }

    // Add keydown listener
    trap.element.addEventListener('keydown', this.handleTrapKeydown);
  }

  /**
   * Deactivate focus trap
   */
  public deactivateFocusTrap(id: string): void {
    const trap = this.focusTraps.get(id);
    if (!trap) return;

    trap.isActive = false;
    trap.element.removeEventListener('keydown', this.handleTrapKeydown);

    // Restore previous focus
    if (trap.previousFocus) {
      trap.previousFocus.focus();
    }
  }

  /**
   * Remove focus trap
   */
  public removeFocusTrap(id: string): void {
    this.deactivateFocusTrap(id);
    this.focusTraps.delete(id);
  }

  private handleTrapKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const trap = Array.from(this.focusTraps.values()).find(t => t.isActive);
    if (!trap) return;

    const focusableElements = this.getFocusableElements(trap.element);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  /**
   * Get all focusable elements within container
   */
  public getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  /**
   * Focus first element in container
   */
  public focusFirst(container: HTMLElement): void {
    const focusable = this.getFocusableElements(container);
    if (focusable[0]) {
      focusable[0].focus();
    }
  }

  /**
   * Move focus to element with announcement
   */
  public moveFocus(element: HTMLElement, announcement?: string): void {
    element.focus();
    if (announcement) {
      this.announce(announcement);
    }
  }

  // --------------------------------------------------------------------------
  // CONTRAST ANALYSIS
  // --------------------------------------------------------------------------

  /**
   * Check color contrast ratio
   */
  public checkContrast(foreground: string, background: string, isLargeText: boolean = false): ContrastResult {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    // WCAG thresholds
    const aaThreshold = isLargeText ? 3 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7;

    return {
      foreground,
      background,
      ratio: Math.round(ratio * 100) / 100,
      passesAA: ratio >= aaThreshold,
      passesAAA: ratio >= aaaThreshold,
      isLargeText,
    };
  }

  /**
   * Get relative luminance of a color
   */
  private getLuminance(color: string): number {
    const rgb = this.parseColor(color);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse color string to RGB
   */
  private parseColor(color: string): [number, number, number] {
    // Create a temporary element to compute the color
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return [0, 0, 0];
  }

  /**
   * Analyze contrast for element
   */
  public analyzeElementContrast(element: HTMLElement): ContrastResult | null {
    const style = window.getComputedStyle(element);
    const foreground = style.color;
    const background = this.getBackgroundColor(element);

    if (!background) return null;

    const fontSize = parseFloat(style.fontSize);
    const fontWeight = parseInt(style.fontWeight) || 400;
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

    return this.checkContrast(foreground, background, isLargeText);
  }

  /**
   * Get effective background color
   */
  private getBackgroundColor(element: HTMLElement): string | null {
    let current: HTMLElement | null = element;

    while (current) {
      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;

      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }

      current = current.parentElement;
    }

    return 'rgb(255, 255, 255)'; // Default white
  }

  // --------------------------------------------------------------------------
  // ACCESSIBILITY AUDIT
  // --------------------------------------------------------------------------

  /**
   * Run accessibility audit
   */
  public async runAudit(): Promise<AuditResult> {
    const startTime = Date.now();
    const issues: AccessibilityIssue[] = [];
    let passed = 0;

    const allRules = [...BUILT_IN_RULES, ...this.config.customRules];

    for (const rule of allRules) {
      const elements = document.querySelectorAll<HTMLElement>(rule.selector);

      for (const element of elements) {
        try {
          const passes = rule.test(element);

          if (passes) {
            passed++;
          } else {
            issues.push({
              id: `issue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              ruleId: rule.id,
              element: this.getSelector(element),
              description: rule.description,
              help: rule.help,
              severity: rule.severity,
              category: rule.category,
              wcagCriteria: rule.wcagCriteria,
              impact: this.getImpactDescription(rule.severity),
              suggestion: rule.suggestion,
            });
          }
        } catch (error) {
          logger.error('[Accessibility] Rule error:', rule.id, error);
        }
      }
    }

    const result: AuditResult = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      passed,
      failed: issues.length,
      warnings: issues.filter(i => i.severity === 'moderate' || i.severity === 'minor').length,
      issues,
      score: this.calculateScore(passed, issues),
      wcagLevel: this.config.wcagLevel,
      duration: Date.now() - startTime,
    };

    this.audits.push(result);
    this.saveAudits();

    logger.info('[Accessibility] Audit complete:', {
      score: result.score,
      issues: issues.length,
      duration: result.duration,
    });

    return result;
  }

  private calculateScore(passed: number, issues: AccessibilityIssue[]): number {
    const total = passed + issues.length;
    if (total === 0) return 100;

    // Weight issues by severity
    const weightedIssues = issues.reduce((sum, issue) => {
      const weights = { critical: 10, serious: 5, moderate: 2, minor: 1 };
      return sum + weights[issue.severity];
    }, 0);

    const score = Math.max(0, 100 - (weightedIssues / total) * 100);
    return Math.round(score);
  }

  private getImpactDescription(severity: IssueSeverity): string {
    const descriptions = {
      critical: 'Förhindrar användare med funktionsnedsättning från att använda innehållet',
      serious: 'Skapar betydande hinder för användare med funktionsnedsättning',
      moderate: 'Skapar viss svårighet för användare med funktionsnedsättning',
      minor: 'Kan vara besvärande men blockerar inte åtkomst',
    };
    return descriptions[severity];
  }

  private getSelector(element: HTMLElement): string {
    const parts: string[] = [];
    let current: HTMLElement | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        parts.unshift(selector);
        break;
      }
      if (current.className) {
        const classes = current.className.split(' ')
          .filter(c => c && !c.startsWith('_'))
          .slice(0, 2)
          .join('.');
        if (classes) selector += `.${classes}`;
      }
      parts.unshift(selector);
      current = current.parentElement;
    }

    return parts.join(' > ');
  }

  /**
   * Start auto audit
   */
  public startAutoAudit(): void {
    if (this.auditInterval) return;

    this.auditInterval = window.setInterval(() => {
      this.runAudit();
    }, this.config.auditInterval);
  }

  /**
   * Stop auto audit
   */
  public stopAutoAudit(): void {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = null;
    }
  }

  /**
   * Get audit history
   */
  public getAuditHistory(): AuditResult[] {
    return [...this.audits];
  }

  /**
   * Get latest audit
   */
  public getLatestAudit(): AuditResult | null {
    return this.audits[this.audits.length - 1] || null;
  }

  // --------------------------------------------------------------------------
  // ARIA HELPERS
  // --------------------------------------------------------------------------

  /**
   * Set ARIA attributes
   */
  public setAria(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(`aria-${key}`, value);
    });
  }

  /**
   * Generate unique ID
   */
  public generateId(prefix: string = 'a11y'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  /**
   * Connect label to input
   */
  public connectLabel(input: HTMLElement, label: HTMLElement): void {
    const id = input.id || this.generateId('input');
    input.id = id;
    label.setAttribute('for', id);
  }

  /**
   * Create described by relationship
   */
  public describeBy(element: HTMLElement, description: HTMLElement): void {
    const id = description.id || this.generateId('desc');
    description.id = id;
    element.setAttribute('aria-describedby', id);
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const accessibilityService = new AccessibilityService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for accessibility auditing
 */
export function useAccessibilityAudit() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAudit = useCallback(async () => {
    setIsAuditing(true);
    try {
      const auditResult = await accessibilityService.runAudit();
      setResult(auditResult);
      return auditResult;
    } finally {
      setIsAuditing(false);
    }
  }, []);

  return {
    result,
    isAuditing,
    runAudit,
    history: accessibilityService.getAuditHistory(),
  };
}

/**
 * Hook for screen reader announcements
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    accessibilityService.announce(message, priority);
  }, []);

  return announce;
}

/**
 * Hook for focus trap
 */
export function useFocusTrap(active: boolean = false) {
  const containerRef = useRef<HTMLElement | null>(null);
  const trapIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (active) {
      trapIdRef.current = accessibilityService.generateId('trap');
      accessibilityService.createFocusTrap(trapIdRef.current, containerRef.current);
      accessibilityService.activateFocusTrap(trapIdRef.current);
    }

    return () => {
      if (trapIdRef.current) {
        accessibilityService.removeFocusTrap(trapIdRef.current);
      }
    };
  }, [active]);

  return containerRef;
}

/**
 * Hook for contrast checking
 */
export function useContrastCheck(foreground: string, background: string, isLargeText?: boolean) {
  const [result, setResult] = useState<ContrastResult | null>(null);

  useEffect(() => {
    if (foreground && background) {
      setResult(accessibilityService.checkContrast(foreground, background, isLargeText));
    }
  }, [foreground, background, isLargeText]);

  return result;
}

/**
 * Hook for focus management on mount
 */
export function useFocusOnMount(shouldFocus: boolean = true) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus]);

  return ref;
}

export default accessibilityService;
