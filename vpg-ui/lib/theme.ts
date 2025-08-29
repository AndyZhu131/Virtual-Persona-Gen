export type Theme = 'dark' | 'light';

export interface ThemeColors {
  // Core colors using hex values
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  
  // Additional semantic colors
  border: string;
  borderHover: string;
  input: string;
  inputBorder: string;
  card: string;
  sidebar: string;
  muted: string;
  success: string;
  warning: string;
  error: string;
  button: string; // Primary button color (maps to purple)
  purple: string; // Purple color for buttons
  sidebarDark: string; // Darker sidebar background for buttons
  sidebarHighlight: string; // Highlight color for selected items
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    // Core palette (Character.ai-inspired)
    background: '#1A1A1A',
    surface: '#2C2C2C',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    accent: '#10a37f',
    
    // Additional semantic colors
    border: '#2d2d2d',
    borderHover: '#3d3d3d',
    input: '#2C2C2C',
    inputBorder: '#404040',
    card: '#1e1e1e',
    sidebar: '#1A1A1A',
    muted: '#6b6b6b',
    success: '#10a37f',
    warning: '#f59e0b',
    error: '#ef4444',
    button: '#8B5CF6', // Primary button color (maps to purple)
    purple: '#8B5CF6', // Vibrant purple for dark theme
    sidebarDark: '#2C2C2C', // Darker sidebar background for buttons
    sidebarHighlight: '#2C2C2C', // Highlight color for selected items
  },
  light: {
    // Core palette (Notion/Slack-inspired)
    background: '#f7f7f8',
    surface: '#ffffff',
    textPrimary: '#202123',
    textSecondary: '#6b6b6b',
    accent: '#10a37f',
    
    // Additional semantic colors
    border: '#e5e5e5',
    borderHover: '#d1d1d1',
    input: '#ffffff',
    inputBorder: '#d1d1d1',
    card: '#ffffff',
    sidebar: '#f7f7f8',
    muted: '#9ca3af',
    success: '#10a37f',
    warning: '#f59e0b',
    error: '#ef4444',
    button: '#7c3aed', // Primary button color (maps to purple)
    purple: '#7c3aed', // Purple for light theme
    sidebarDark: '#e5e5e5', // Darker sidebar background for buttons
    sidebarHighlight: '#e5e5e5', // Highlight color for selected items
  },
};

export const getThemeColors = (theme: Theme): ThemeColors => {
  return themes[theme];
};

// Helper function to get CSS custom property values
export const getThemeCSSVariables = (theme: Theme): Record<string, string> => {
  const colors = themes[theme];
  return {
    '--color-background': colors.background,
    '--color-surface': colors.surface,
    '--color-textPrimary': colors.textPrimary,
    '--color-textSecondary': colors.textSecondary,
    '--color-accent': colors.accent,
    '--color-border': colors.border,
    '--color-borderHover': colors.borderHover,
    '--color-input': colors.input,
    '--color-inputBorder': colors.inputBorder,
    '--color-card': colors.card,
    '--color-sidebar': colors.sidebar,
    '--color-muted': colors.muted,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--color-button': colors.button,
    '--color-purple': colors.purple,
    '--color-sidebarDark': colors.sidebarDark,
    '--color-sidebarHighlight': colors.sidebarHighlight,
  };
};
