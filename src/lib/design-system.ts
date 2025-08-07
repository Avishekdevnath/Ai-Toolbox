/**
 * AI Toolbox Design System
 * 
 * This file contains design tokens, spacing, colors, and typography
 * that should be used consistently across the application.
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
  },
} as const;

// Spacing Scale
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// Typography Scale
export const typography = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-bold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  h5: 'text-lg font-medium',
  h6: 'text-base font-medium',
  body: 'text-base',
  bodySmall: 'text-sm',
  caption: 'text-xs',
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Animation Durations
export const durations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// Common Component Variants
export const buttonVariants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
  destructive: 'bg-error-500 hover:bg-error-600 text-white',
} as const;

export const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border border-gray-200 shadow-md',
  outline: 'bg-transparent border border-gray-200',
} as const;

// Utility Functions
export const designSystem = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  durations,
  buttonVariants,
  cardVariants,
} as const;

export default designSystem; 