import { ThemeColors } from './theme';

export function applyThemeClasses(
  baseClasses: string,
  themeColors: ThemeColors,
  replacements: Record<string, keyof ThemeColors['bg'] | keyof ThemeColors['text'] | keyof ThemeColors['border']>
): string {
  let result = baseClasses;
  
  Object.entries(replacements).forEach(([search, colorKey]) => {
    const category = getColorCategory(colorKey);
    if (category && themeColors[category][colorKey as keyof typeof themeColors[typeof category]]) {
      const colorClass = themeColors[category][colorKey as keyof typeof themeColors[typeof category]];
      result = result.replace(search, colorClass);
    }
  });
  
  return result;
}

function getColorCategory(colorKey: string): 'bg' | 'text' | 'border' | null {
  if (colorKey.startsWith('bg-')) return 'bg';
  if (colorKey.startsWith('text-')) return 'text';
  if (colorKey.startsWith('border-')) return 'border';
  return null;
}

// Helper function to create theme-aware class names
export function createThemeClasses(
  themeColors: ThemeColors,
  classes: {
    bg?: keyof ThemeColors['bg'];
    text?: keyof ThemeColors['text'];
    border?: keyof ThemeColors['border'];
    additional?: string;
  }
): string {
  const result: string[] = [];
  
  if (classes.bg) {
    result.push(themeColors.bg[classes.bg]);
  }
  
  if (classes.text) {
    result.push(themeColors.text[classes.text]);
  }
  
  if (classes.border) {
    result.push(themeColors.border[classes.border]);
  }
  
  if (classes.additional) {
    result.push(classes.additional);
  }
  
  return result.join(' ');
}
