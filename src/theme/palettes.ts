export type ThemeMode = 'dark' | 'light';

export type ThemePalette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  background: string;
  backgroundLight: string;
  backgroundCard: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  borderLight: string;
  white: string;
  black: string;
  amazon: string;
  flipkart: string;
  myntra: string;
  ourPlatform: string;
};

const sharedPlatformColors = {
  amazon: '#ff9900',
  flipkart: '#2874f0',
  myntra: '#ff3f6c',
  ourPlatform: '#6366f1',
};

export const themePalettes: Record<ThemeMode, ThemePalette> = {
  dark: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    secondary: '#ec4899',
    secondaryDark: '#db2777',
    secondaryLight: '#f472b6',
    background: '#0f172a',
    backgroundLight: '#1e293b',
    backgroundCard: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    border: '#334155',
    borderLight: '#475569',
    white: '#ffffff',
    black: '#000000',
    ...sharedPlatformColors,
  },
  light: {
    primary: '#4f46e5',
    primaryDark: '#3730a3',
    primaryLight: '#6366f1',
    secondary: '#db2777',
    secondaryDark: '#be185d',
    secondaryLight: '#ec4899',
    background: '#f8fafc',
    backgroundLight: '#eef2ff',
    backgroundCard: '#ffffff',
    text: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
    border: '#cbd5e1',
    borderLight: '#94a3b8',
    white: '#ffffff',
    black: '#000000',
    ...sharedPlatformColors,
  },
};

