/**
 * RehabFlow Premium Design System
 * ================================
 * A comprehensive design system with glassmorphism, gradients, and smooth animations.
 * Based on medical/healthcare UX best practices with Swedish localization.
 */

import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import {
  Check, AlertCircle, Info, AlertTriangle, X,
  ChevronRight, Loader2, Sparkles
} from 'lucide-react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const tokens = {
  // Color Palette - Medical/Health focused with trust-inspiring blues and greens
  colors: {
    // Primary - Deep medical blue
    primary: {
      50: '#EEF5FF',
      100: '#D9E8FF',
      200: '#BCE0FF',
      300: '#8ECCFF',
      400: '#59ADFF',
      500: '#3B8EFF',
      600: '#1A6DFF',
      700: '#1456E0',
      800: '#1745B5',
      900: '#193C8F',
      950: '#142757',
    },
    // Accent - Healing teal/cyan
    accent: {
      50: '#ECFEFF',
      100: '#CFFAFE',
      200: '#A5F3FC',
      300: '#67E8F9',
      400: '#22D3EE',
      500: '#06B6D4',
      600: '#0891B2',
      700: '#0E7490',
      800: '#155E75',
      900: '#164E63',
      950: '#083344',
    },
    // Success - Vibrant green for positive outcomes
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    // Warning - Warm amber
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    // Danger - Alert red
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    // Neutral slate
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #3B8EFF 0%, #1A6DFF 50%, #1456E0 100%)',
    accent: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 50%, #0891B2 100%)',
    success: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
    warning: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
    danger: 'linear-gradient(135deg, #F87171 0%, #EF4444 50%, #DC2626 100%)',
    premium: 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #6B73E8 100%)',
    hero: 'linear-gradient(135deg, #1A6DFF 0%, #06B6D4 100%)',
    dark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    glow: 'radial-gradient(circle at center, rgba(59,142,255,0.15) 0%, transparent 70%)',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    glow: {
      primary: '0 0 40px rgba(59, 142, 255, 0.3)',
      accent: '0 0 40px rgba(6, 182, 212, 0.3)',
      success: '0 0 40px rgba(16, 185, 129, 0.3)',
      warning: '0 0 40px rgba(245, 158, 11, 0.3)',
      danger: '0 0 40px rgba(239, 68, 68, 0.3)',
    },
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    full: '9999px',
  },

  // Spacing
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  // Typography
  typography: {
    fonts: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'JetBrains Mono, Menlo, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Z-Index
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
    toast: 500,
  },

  // Transitions
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ============================================================================
// ANIMATION VARIANTS (Framer Motion)
// ============================================================================

export const animations: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  slideInBottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
  },
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  float: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  },
};

// Transition presets
export const transitions = {
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
  smooth: { type: 'tween' as const, duration: 0.3, ease: 'easeOut' as const },
  bounce: { type: 'spring' as const, stiffness: 500, damping: 25 },
  slow: { type: 'tween' as const, duration: 0.5, ease: 'easeInOut' as const },
};

// ============================================================================
// GLASS CARD COMPONENT
// ============================================================================

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'solid' | 'gradient';
  hover?: boolean;
  glow?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const glassVariants = {
  default: 'bg-white/80 backdrop-blur-xl border border-white/30',
  elevated: 'bg-white/90 backdrop-blur-2xl border border-white/40 shadow-xl',
  subtle: 'bg-white/50 backdrop-blur-lg border border-white/20',
  solid: 'bg-white border border-slate-200',
  gradient: 'bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl border border-white/40',
};

const glowColors = {
  primary: 'shadow-[0_0_40px_rgba(59,142,255,0.15)]',
  accent: 'shadow-[0_0_40px_rgba(6,182,212,0.15)]',
  success: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
  warning: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
  danger: 'shadow-[0_0_40px_rgba(239,68,68,0.15)]',
  none: '',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const roundedClasses = {
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
  '3xl': 'rounded-[2rem]',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(({
  children,
  variant = 'default',
  hover = true,
  glow = 'none',
  padding = 'lg',
  rounded = '2xl',
  className = '',
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={transitions.spring}
      className={`
        relative overflow-hidden
        ${glassVariants[variant]}
        ${glowColors[glow]}
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        shadow-lg shadow-slate-200/50
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  disabled?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-primary-600 to-primary-700
    text-white font-semibold
    shadow-lg shadow-primary-500/25
    hover:from-primary-700 hover:to-primary-800
    hover:shadow-xl hover:shadow-primary-500/30
    active:scale-[0.98]
  `,
  secondary: `
    bg-slate-100 text-slate-700 font-semibold
    hover:bg-slate-200 hover:text-slate-900
    active:scale-[0.98]
  `,
  outline: `
    bg-transparent border-2 border-primary-600
    text-primary-600 font-semibold
    hover:bg-primary-50 hover:border-primary-700
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-slate-600 font-medium
    hover:bg-slate-100 hover:text-slate-900
    active:scale-[0.98]
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600
    text-white font-semibold
    shadow-lg shadow-red-500/25
    hover:from-red-600 hover:to-red-700
    hover:shadow-xl hover:shadow-red-500/30
    active:scale-[0.98]
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-emerald-600
    text-white font-semibold
    shadow-lg shadow-emerald-500/25
    hover:from-emerald-600 hover:to-emerald-700
    hover:shadow-xl hover:shadow-emerald-500/30
    active:scale-[0.98]
  `,
  gradient: `
    bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600
    text-white font-semibold
    shadow-lg shadow-purple-500/25
    hover:shadow-xl hover:shadow-purple-500/30
    active:scale-[0.98]
    bg-[length:200%_100%] hover:bg-right
  `,
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-lg gap-3',
};

const buttonRounded = {
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = 'xl',
  className = '',
  disabled,
  children,
  onClick,
  type = 'button',
}) => {
  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${buttonRounded[rounded]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
};

// ============================================================================
// ICON BUTTON COMPONENT
// ============================================================================

interface IconButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  icon,
  label,
  className = '',
  onClick,
  disabled,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center rounded-xl
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  inputSize = 'md',
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-2.5 text-base',
    lg: 'py-3 text-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl
            bg-white/80 backdrop-blur-sm
            border-2 ${error ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-primary-500'}
            ${sizeClasses[inputSize]}
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            text-slate-900 placeholder:text-slate-400
            transition-all duration-200
            focus:outline-none focus:ring-4
            ${error ? 'focus:ring-red-500/10' : 'focus:ring-primary-500/10'}
            focus:bg-white
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// ============================================================================
// BADGE COMPONENT
// ============================================================================

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'gradient';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  outline: 'bg-transparent border-slate-300 text-slate-600',
  gradient: 'bg-gradient-to-r from-primary-500 to-purple-500 text-white border-transparent',
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold
        rounded-full border
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'primary' ? 'bg-primary-500' :
          'bg-current'
        } animate-pulse`} />
      )}
      {icon}
      {children}
    </span>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; label?: string };
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const statColors = {
  primary: {
    bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
    icon: 'bg-primary-400/30',
    text: 'text-white',
    label: 'text-primary-100',
  },
  accent: {
    bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    icon: 'bg-cyan-400/30',
    text: 'text-white',
    label: 'text-cyan-100',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    icon: 'bg-emerald-400/30',
    text: 'text-white',
    label: 'text-emerald-100',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    icon: 'bg-amber-400/30',
    text: 'text-white',
    label: 'text-amber-100',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-500 to-red-600',
    icon: 'bg-red-400/30',
    text: 'text-white',
    label: 'text-red-100',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  color = 'primary',
  size = 'md',
}) => {
  const colors = statColors[color];
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };
  const valueSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={transitions.spring}
      className={`
        relative overflow-hidden rounded-2xl
        ${colors.bg}
        ${sizeClasses[size]}
        shadow-xl
      `}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${colors.label}`}>{label}</span>
          {icon && (
            <div className={`p-2 rounded-xl ${colors.icon}`}>
              {icon}
            </div>
          )}
        </div>
        <div className={`font-bold ${valueSizes[size]} ${colors.text}`}>
          {value}
        </div>
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-sm ${colors.label}`}>
            <span className={trend.value >= 0 ? 'text-emerald-300' : 'text-red-300'}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && <span>{trend.label}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// PROGRESS RING COMPONENT
// ============================================================================

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  children?: ReactNode;
}

const ringColors = {
  primary: { stroke: '#3B8EFF', gradient: ['#3B8EFF', '#1A6DFF'] },
  accent: { stroke: '#06B6D4', gradient: ['#22D3EE', '#0891B2'] },
  success: { stroke: '#10B981', gradient: ['#34D399', '#059669'] },
  warning: { stroke: '#F59E0B', gradient: ['#FBBF24', '#D97706'] },
  danger: { stroke: '#EF4444', gradient: ['#F87171', '#DC2626'] },
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  label,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const colors = ringColors[color];
  const gradientId = `ring-gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.gradient[0]} />
            <stop offset="100%" stopColor={colors.gradient[1]} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          showLabel && (
            <>
              <span className="text-2xl font-bold text-slate-900">
                {Math.round(progress)}%
              </span>
              {label && (
                <span className="text-xs text-slate-500 font-medium mt-0.5">
                  {label}
                </span>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ALERT COMPONENT
// ============================================================================

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
  action?: ReactNode;
}

const alertStyles: Record<AlertVariant, { bg: string; border: string; icon: ReactNode; iconBg: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info size={18} className="text-blue-600" />,
    iconBg: 'bg-blue-100',
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <Check size={18} className="text-emerald-600" />,
    iconBg: 'bg-emerald-100',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle size={18} className="text-amber-600" />,
    iconBg: 'bg-amber-100',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertCircle size={18} className="text-red-600" />,
    iconBg: 'bg-red-100',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  icon,
  action,
}) => {
  const styles = alertStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        relative rounded-2xl p-4 border
        ${styles.bg} ${styles.border}
      `}
    >
      <div className="flex gap-3">
        <div className={`shrink-0 p-2 rounded-xl ${styles.iconBg}`}>
          {icon || styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
          )}
          <div className="text-sm text-slate-600">{children}</div>
          {action && <div className="mt-3">{action}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-400',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'from-primary-500 to-primary-600',
    'from-purple-500 to-purple-600',
    'from-cyan-500 to-cyan-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
  ];
  const colorIndex = name.length % colors.length;

  return (
    <div className="relative inline-flex">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${avatarSizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`
            ${avatarSizes[size]}
            rounded-full
            bg-gradient-to-br ${colors[colorIndex]}
            flex items-center justify-center
            font-bold text-white
            ring-2 ring-white
          `}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`
            absolute -bottom-0.5 -right-0.5
            w-3 h-3 rounded-full
            ${statusColors[status]}
            ring-2 ring-white
          `}
        />
      )}
    </div>
  );
};

// ============================================================================
// SKELETON LOADER COMPONENT
// ============================================================================

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) => {
  const variantClasses = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  return (
    <motion.div
      className={`
        bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
        bg-[length:200%_100%]
        ${variantClasses[variant]}
        ${className}
      `}
      style={{ width, height }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

// ============================================================================
// DIVIDER COMPONENT
// ============================================================================

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-slate-200 self-stretch ${className}`} />;
  }

  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    );
  }

  return <div className={`h-px bg-slate-200 w-full ${className}`} />;
};

// ============================================================================
// PREMIUM FEATURE CARD
// ============================================================================

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  gradient?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  gradient = 'from-primary-500 to-purple-500',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={transitions.spring}
      className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4">{description}</p>
        {action}
      </div>

      {/* Arrow indicator */}
      <motion.div
        className="absolute bottom-6 right-6 text-slate-300 group-hover:text-primary-500 transition-colors"
        initial={{ x: 0, opacity: 0 }}
        whileHover={{ x: 4, opacity: 1 }}
      >
        <ChevronRight size={20} />
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// ANIMATED CONTAINER
// ============================================================================

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: keyof typeof animations;
  delay?: number;
  className?: string;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animations[animation]}
      transition={{ ...transitions.smooth, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// STAGGER CONTAINER
// ============================================================================

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <motion.div variants={animations.staggerItem} className={className}>
      {children}
    </motion.div>
  );
};

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={`
          absolute ${positionClasses[position]}
          px-3 py-1.5 rounded-lg
          bg-slate-900 text-white text-xs font-medium
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none whitespace-nowrap
          z-50
        `}
      >
        {content}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  tokens,
  animations,
  transitions,
  GlassCard,
  Button,
  IconButton,
  Input,
  Badge,
  StatCard,
  ProgressRing,
  Alert,
  Avatar,
  Skeleton,
  Divider,
  FeatureCard,
  AnimatedContainer,
  StaggerContainer,
  StaggerItem,
  Tooltip,
};
