'use client';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Interactive colors
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Form colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  
  // Quiz specific colors
  quizBackground: string;
  quizSurface: string;
  quizText: string;
  quizOptionText: string;
  quizOptionBackground: string;
  quizOptionBorder: string;
  quizOptionHover: string;
  quizOptionSelected: string;
  quizOptionSelectedText: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  background: 'bg-white',
  surface: 'bg-gray-50',
  surfaceSecondary: 'bg-gray-100',
  
  // Text colors
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-700',
  textMuted: 'text-gray-600',
  
  // Border colors
  border: 'border-gray-200',
  borderSecondary: 'border-gray-300',
  
  // Interactive colors
  primary: 'bg-blue-600',
  primaryHover: 'hover:bg-blue-700',
  secondary: 'bg-gray-600',
  secondaryHover: 'hover:bg-gray-700',
  
  // Status colors
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  
  // Form colors
  inputBackground: 'bg-white',
  inputBorder: 'border-gray-300',
  inputText: 'text-gray-900',
  inputPlaceholder: 'placeholder-gray-500',
  
  // Quiz specific colors
  quizBackground: 'bg-gradient-to-br from-blue-50 to-indigo-100',
  quizSurface: 'bg-white',
  quizText: 'text-gray-900',
  quizOptionText: 'text-gray-800',
  quizOptionBackground: 'bg-white',
  quizOptionBorder: 'border-gray-200',
  quizOptionHover: 'hover:bg-gray-50',
  quizOptionSelected: 'bg-blue-50 border-blue-500',
  quizOptionSelectedText: 'text-blue-900',
};

export const darkTheme: ThemeColors = {
  // Background colors
  background: 'bg-gray-900',
  surface: 'bg-gray-800',
  surfaceSecondary: 'bg-gray-700',
  
  // Text colors
  textPrimary: 'text-white',
  textSecondary: 'text-gray-300',
  textMuted: 'text-gray-300',
  
  // Border colors
  border: 'border-gray-600',
  borderSecondary: 'border-gray-500',
  
  // Interactive colors
  primary: 'bg-blue-500',
  primaryHover: 'hover:bg-blue-600',
  secondary: 'bg-gray-500',
  secondaryHover: 'hover:bg-gray-600',
  
  // Status colors
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  
  // Form colors
  inputBackground: 'bg-gray-800',
  inputBorder: 'border-gray-600',
  inputText: 'text-white',
  inputPlaceholder: 'placeholder-gray-400',
  
  // Quiz specific colors
  quizBackground: 'bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900',
  quizSurface: 'bg-gray-800',
  quizText: 'text-white',
  quizOptionText: 'text-gray-200',
  quizOptionBackground: 'bg-gray-800',
  quizOptionBorder: 'border-gray-600',
  quizOptionHover: 'hover:bg-gray-700',
  quizOptionSelected: 'bg-blue-900 border-blue-500',
  quizOptionSelectedText: 'text-blue-100',
};

export function getThemeColors(theme: Theme): ThemeColors {
  return theme === 'dark' ? darkTheme : lightTheme;
}

export function getQuizThemeClasses(theme: Theme) {
  const colors = getThemeColors(theme);
  
  return {
    // Container
    container: `${colors.quizBackground} min-h-screen`,
    
    // Card
    card: `${colors.quizSurface} shadow-2xl border-0`,
    
    // Text
    title: `${colors.quizText} text-2xl font-bold`,
    subtitle: `${colors.textSecondary} text-lg`,
    description: `${colors.textMuted} text-sm`,
    
    // Form elements
    label: `${colors.quizText} text-base font-medium`,
    helpText: `${colors.textMuted} text-sm`,
    
    // Input fields
    input: `w-full px-3 py-2 border ${colors.inputBorder} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.inputBackground} ${colors.inputText}`,
    textarea: `w-full px-3 py-2 border ${colors.inputBorder} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.inputBackground} ${colors.inputText}`,
    select: `w-full px-3 py-2 border ${colors.inputBorder} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.inputBackground} ${colors.inputText}`,
    
    // Radio buttons
    radioContainer: `space-y-2`,
    radioLabel: `flex items-center gap-2 text-sm ${colors.quizOptionText}`,
    radioInput: `text-blue-600 focus:ring-blue-500`,
    radioText: `text-sm ${colors.quizOptionText}`,
    
    // Checkboxes
    checkboxContainer: `space-y-2 text-sm ${colors.quizOptionText}`,
    checkboxLabel: `flex items-center gap-2 text-sm`,
    checkboxInput: `text-blue-600 focus:ring-blue-500`,
    checkboxText: `text-sm ${colors.quizOptionText}`,
    
    // Buttons
    button: `w-full ${colors.primary} ${colors.primaryHover} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300`,
    buttonSecondary: `w-full ${colors.secondary} ${colors.secondaryHover} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300`,
    
    // Status indicators
    required: `${colors.error} ml-1`,
    success: `${colors.success} text-sm`,
    error: `${colors.error} text-sm`,
  };
}
