/**
 * ShareCode editor theme tokens.
 *
 * Use these semantic tokens everywhere — never hardcode hex values in
 * component class strings. This keeps light and dark consistent and
 * makes future theme additions trivial.
 *
 * Dark palette: VS Code Dark+ / OLED-safe (no pure black, slight warmth)
 * Light palette: VS Code Light+ / high-contrast, WCAG AA compliant
 */

export type EditorTheme = 'dark' | 'light';

export const STORAGE_KEY = 'sharecode-editor-theme';

export function getStoredTheme(): EditorTheme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem(STORAGE_KEY) as EditorTheme) ?? 'dark';
}

export function storeTheme(theme: EditorTheme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

/** Semantic token object — destructure what you need in each component. */
export interface ThemeTokens {
  // Page / editor surface
  pageBg: string;
  /** Monaco theme ID */
  monacoTheme: 'vs-dark' | 'vs';

  // Top bars (header + controls)
  barBg: string;
  barBorder: string;

  // Interactive controls (inputs, selects)
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  inputFocusBorder: string;

  // Select dropdown
  dropdownBg: string;
  dropdownBorder: string;
  dropdownItemText: string;
  dropdownItemHoverBg: string;

  // Icon buttons (secondary)
  iconBtnBg: string;
  iconBtnHoverBg: string;
  iconBtnText: string;
  iconBtnHoverText: string;

  // Primary text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Status / live indicator
  liveColor: string;

  // Viewer code surface
  codeBg: string;
}

const dark: ThemeTokens = {
  pageBg:            'bg-[#1e1e1e]',
  monacoTheme:       'vs-dark',

  barBg:             'bg-[#252526]',
  barBorder:         'border-[#2d2d2d]',

  inputBg:           'bg-[#3c3c3c]',
  inputBorder:       'border-[#555]',
  inputText:         'text-white',
  inputPlaceholder:  'placeholder-gray-500',
  inputFocusBorder:  'focus:border-blue-500',

  dropdownBg:        'bg-[#252526]',
  dropdownBorder:    'border-[#3c3c3c]',
  dropdownItemText:  'text-gray-300',
  dropdownItemHoverBg: 'focus:bg-[#3c3c3c]',

  iconBtnBg:         'bg-[#3c3c3c]',
  iconBtnHoverBg:    'hover:bg-[#4c4c4c]',
  iconBtnText:       'text-gray-300',
  iconBtnHoverText:  'hover:text-white',

  textPrimary:       'text-white',
  textSecondary:     'text-gray-300',
  textMuted:         'text-gray-500',

  liveColor:         'text-green-400',

  codeBg:            'bg-gray-950',
};

const light: ThemeTokens = {
  pageBg:            'bg-[#ffffff]',
  monacoTheme:       'vs',

  barBg:             'bg-[#f3f3f3]',
  barBorder:         'border-[#e5e5e5]',

  inputBg:           'bg-white',
  inputBorder:       'border-[#c8c8c8]',
  inputText:         'text-gray-900',
  inputPlaceholder:  'placeholder-gray-400',
  inputFocusBorder:  'focus:border-blue-500',

  dropdownBg:        'bg-white',
  dropdownBorder:    'border-[#e5e5e5]',
  dropdownItemText:  'text-gray-700',
  dropdownItemHoverBg: 'focus:bg-gray-100',

  iconBtnBg:         'bg-white',
  iconBtnHoverBg:    'hover:bg-gray-100',
  iconBtnText:       'text-gray-600',
  iconBtnHoverText:  'hover:text-gray-900',

  textPrimary:       'text-gray-900',
  textSecondary:     'text-gray-600',
  textMuted:         'text-gray-400',

  liveColor:         'text-green-600',

  codeBg:            'bg-gray-50',
};

export const THEMES: Record<EditorTheme, ThemeTokens> = { dark, light };

export function getTokens(theme: EditorTheme): ThemeTokens {
  return THEMES[theme];
}
