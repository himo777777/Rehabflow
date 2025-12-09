/**
 * Theme Context - Sprint 5.6
 *
 * Provides dark/light mode theming throughout the app.
 * Features:
 * - System preference detection
 * - Manual override
 * - Persistence to localStorage
 * - CSS variable-based theming
 * - Smooth transitions
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceHover: string;

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Border colors
  border: string;
  borderHover: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Shadows
  shadow: string;
  shadowLg: string;
}

export interface ThemeContextValue {
  /** Current theme setting (light, dark, or system) */
  theme: Theme;
  /** Resolved theme (light or dark) */
  resolvedTheme: ResolvedTheme;
  /** Whether dark mode is active */
  isDark: boolean;
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Current color values */
  colors: ThemeColors;
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

const LIGHT_COLORS: ThemeColors = {
  // Primary - emerald green
  primary: '#059669',
  primaryHover: '#047857',
  primaryActive: '#065f46',

  // Backgrounds
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  backgroundTertiary: '#f3f4f6',
  surface: '#ffffff',
  surfaceHover: '#f9fafb',

  // Text
  text: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  textInverse: '#ffffff',

  // Borders
  border: '#e5e7eb',
  borderHover: '#d1d5db',

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Shadows
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

const DARK_COLORS: ThemeColors = {
  // Primary - emerald green (lighter for dark mode)
  primary: '#34d399',
  primaryHover: '#6ee7b7',
  primaryActive: '#10b981',

  // Backgrounds
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  surface: '#1e293b',
  surfaceHover: '#334155',

  // Text
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  textInverse: '#0f172a',

  // Borders
  border: '#334155',
  borderHover: '#475569',

  // Status
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // Shadows
  shadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
};

// ============================================================================
// STORAGE KEY
// ============================================================================

const THEME_STORAGE_KEY = 'rehabflow-theme';

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Resolved theme based on setting and system preference
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    // Add transition class for smooth theme change
    root.classList.add('theme-transition');

    // Set theme attribute
    root.setAttribute('data-theme', resolvedTheme);

    // Set color-scheme for native elements
    root.style.colorScheme = resolvedTheme;

    // Apply CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssKey, value);
    });

    // Remove transition class after animation
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);

    logger.debug('[Theme] Applied theme:', resolvedTheme);

    return () => clearTimeout(timeout);
  }, [resolvedTheme, colors]);

  // Set theme and persist
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    logger.debug('[Theme] Theme set to:', newTheme);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-[var(--color-text-secondary)]">
          Tema
        </span>
      )}

      <div className="flex items-center bg-[var(--color-background-tertiary)] rounded-lg p-1">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'light'
              ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          }`}
          aria-label="Ljust tema"
          title="Ljust tema"
        >
          <SunIcon />
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          }`}
          aria-label="Mörkt tema"
          title="Mörkt tema"
        >
          <MoonIcon />
        </button>

        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded-md transition-colors ${
            theme === 'system'
              ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
          }`}
          aria-label="Systemtema"
          title="Följ systemet"
        >
          <SystemIcon />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function SunIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

// ============================================================================
// CSS FOR TRANSITIONS (add to global CSS)
// ============================================================================

export const themeTransitionCSS = `
  .theme-transition,
  .theme-transition *,
  .theme-transition *::before,
  .theme-transition *::after {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
  }

  :root {
    --color-primary: ${LIGHT_COLORS.primary};
    --color-primary-hover: ${LIGHT_COLORS.primaryHover};
    --color-primary-active: ${LIGHT_COLORS.primaryActive};
    --color-background: ${LIGHT_COLORS.background};
    --color-background-secondary: ${LIGHT_COLORS.backgroundSecondary};
    --color-background-tertiary: ${LIGHT_COLORS.backgroundTertiary};
    --color-surface: ${LIGHT_COLORS.surface};
    --color-surface-hover: ${LIGHT_COLORS.surfaceHover};
    --color-text: ${LIGHT_COLORS.text};
    --color-text-secondary: ${LIGHT_COLORS.textSecondary};
    --color-text-muted: ${LIGHT_COLORS.textMuted};
    --color-text-inverse: ${LIGHT_COLORS.textInverse};
    --color-border: ${LIGHT_COLORS.border};
    --color-border-hover: ${LIGHT_COLORS.borderHover};
    --color-success: ${LIGHT_COLORS.success};
    --color-warning: ${LIGHT_COLORS.warning};
    --color-error: ${LIGHT_COLORS.error};
    --color-info: ${LIGHT_COLORS.info};
    --color-shadow: ${LIGHT_COLORS.shadow};
    --color-shadow-lg: ${LIGHT_COLORS.shadowLg};
  }

  [data-theme="dark"] {
    --color-primary: ${DARK_COLORS.primary};
    --color-primary-hover: ${DARK_COLORS.primaryHover};
    --color-primary-active: ${DARK_COLORS.primaryActive};
    --color-background: ${DARK_COLORS.background};
    --color-background-secondary: ${DARK_COLORS.backgroundSecondary};
    --color-background-tertiary: ${DARK_COLORS.backgroundTertiary};
    --color-surface: ${DARK_COLORS.surface};
    --color-surface-hover: ${DARK_COLORS.surfaceHover};
    --color-text: ${DARK_COLORS.text};
    --color-text-secondary: ${DARK_COLORS.textSecondary};
    --color-text-muted: ${DARK_COLORS.textMuted};
    --color-text-inverse: ${DARK_COLORS.textInverse};
    --color-border: ${DARK_COLORS.border};
    --color-border-hover: ${DARK_COLORS.borderHover};
    --color-success: ${DARK_COLORS.success};
    --color-warning: ${DARK_COLORS.warning};
    --color-error: ${DARK_COLORS.error};
    --color-info: ${DARK_COLORS.info};
    --color-shadow: ${DARK_COLORS.shadow};
    --color-shadow-lg: ${DARK_COLORS.shadowLg};
  }
`;

export default ThemeProvider;
