export type Theme = 'dark' | 'bright';

export interface ThemeColors {
  // Background colors
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    sidebar: string;
    card: string;
    input: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    placeholder: string;
  };
  // Border colors
  border: {
    primary: string;
    secondary: string;
    input: string;
    focus: string;
  };
  // Accent colors
  accent: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const themes: Record<Theme, ThemeColors> = {
  dark: {
    bg: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      tertiary: 'bg-gray-700',
      sidebar: 'bg-gray-900',
      card: 'bg-gray-800',
      input: 'bg-gray-700',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-200',
      tertiary: 'text-gray-300',
      muted: 'text-gray-400',
      placeholder: 'text-gray-400',
    },
    border: {
      primary: 'border-gray-700',
      secondary: 'border-gray-600',
      input: 'border-gray-600',
      focus: 'border-purple-500',
    },
    accent: {
      primary: 'bg-purple-600',
      secondary: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600',
    },
  },
  bright: {
    bg: {
      primary: 'bg-white',
      secondary: 'bg-gray-50',
      tertiary: 'bg-gray-100',
      sidebar: 'bg-white',
      card: 'bg-white',
      input: 'bg-gray-50',
    },
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      tertiary: 'text-gray-600',
      muted: 'text-gray-500',
      placeholder: 'text-gray-400',
    },
    border: {
      primary: 'border-gray-200',
      secondary: 'border-gray-300',
      input: 'border-gray-300',
      focus: 'border-purple-500',
    },
    accent: {
      primary: 'bg-purple-600',
      secondary: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600',
    },
  },
};

export const getThemeColors = (theme: Theme): ThemeColors => {
  return themes[theme];
};
