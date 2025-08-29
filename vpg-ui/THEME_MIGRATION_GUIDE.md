# Theme System Migration Guide

## Overview

The theme system has been redesigned to use industry-standard dark/light theme palettes inspired by ChatGPT, Notion, and Slack. Instead of Tailwind classes, it now uses CSS custom properties that provide better performance and more consistent theming.

## New Theme Structure

### Theme Names
- **Old:** `'dark' | 'bright'`
- **New:** `'dark' | 'light'`

### Color Properties
The new theme system provides these CSS custom properties:

```css
--color-background      /* Main page background */
--color-surface        /* Secondary surfaces (headers, navbars) */
--color-textPrimary    /* Primary text color */
--color-textSecondary  /* Secondary text color */
--color-accent         /* Primary accent color (ChatGPT green) */
--color-border         /* Border color */
--color-borderHover    /* Hover state border color */
--color-input          /* Input field background */
--color-inputBorder    /* Input field border */
--color-card           /* Card background */
--color-sidebar        /* Sidebar background */
--color-muted          /* Muted text color */
--color-success        /* Success color */
--color-warning        /* Warning color */
--color-error          /* Error color */
```

## Migration Patterns

### 1. Background Colors

**Old (Tailwind classes):**
```tsx
className={`${colors.bg.primary}`}
className={`${colors.bg.secondary}`}
className={`${colors.bg.tertiary}`}
className={`${colors.bg.card}`}
className={`${colors.bg.sidebar}`}
className={`${colors.bg.input}`}
```

**New (CSS custom properties):**
```tsx
className="bg-[var(--color-background)]"
className="bg-[var(--color-surface)]"
className="bg-[var(--color-surface)]"
className="bg-[var(--color-card)]"
className="bg-[var(--color-sidebar)]"
className="bg-[var(--color-input)]"
```

### 2. Text Colors

**Old:**
```tsx
className={`${colors.text.primary}`}
className={`${colors.text.secondary}`}
className={`${colors.text.muted}`}
```

**New:**
```tsx
className="text-[var(--color-textPrimary)]"
className="text-[var(--color-textSecondary)]"
className="text-[var(--color-muted)]"
```

### 3. Border Colors

**Old:**
```tsx
className={`${colors.border.primary}`}
className={`${colors.border.secondary}`}
className={`${colors.border.input}`}
```

**New:**
```tsx
className="border-[var(--color-border)]"
className="border-[var(--color-border)]"
className="border-[var(--color-inputBorder)]"
```

### 4. Accent Colors

**Old:**
```tsx
className={`${colors.accent.primary}`}
className={`${colors.accent.success}`}
className={`${colors.accent.warning}`}
className={`${colors.accent.error}`}
```

**New:**
```tsx
className="bg-[var(--color-accent)]"
className="bg-[var(--color-success)]"
className="bg-[var(--color-warning)]"
className="bg-[var(--color-error)]"
```

## Complete Component Migration Example

### Before (Old Theme System):
```tsx
import { useTheme } from '@/lib/theme-context';

export default function MyComponent() {
  const { colors } = useTheme();
  
  return (
    <div className={`${colors.bg.primary} min-h-screen`}>
      <header className={`${colors.bg.secondary} border-b ${colors.border.primary}`}>
        <h1 className={`${colors.text.primary} text-2xl font-bold`}>
          Title
        </h1>
        <p className={`${colors.text.muted}`}>
          Description
        </p>
      </header>
      <div className={`${colors.bg.card} border ${colors.border.primary} rounded-lg p-4`}>
        <button className={`${colors.bg.accent} ${colors.text.primary} px-4 py-2 rounded`}>
          Action
        </button>
      </div>
    </div>
  );
}
```

### After (New CSS Custom Properties):
```tsx
export default function MyComponent() {
  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <h1 className="text-[var(--color-textPrimary)] text-2xl font-bold">
          Title
        </h1>
        <p className="text-[var(--color-textSecondary)]">
          Description
        </p>
      </header>
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
        <button className="bg-[var(--color-accent)] text-white px-4 py-2 rounded">
          Action
        </button>
      </div>
    </div>
  );
}
```

## Key Benefits of New System

1. **Better Performance**: CSS custom properties are more efficient than dynamic Tailwind classes
2. **Consistent Colors**: Industry-standard palettes that look professional
3. **Smooth Transitions**: Built-in CSS transitions for theme changes
4. **Easier Maintenance**: Centralized color definitions in CSS
5. **Better Accessibility**: Improved contrast ratios and color consistency

## Color Palette Details

### Dark Theme (ChatGPT-inspired)
- **Background**: `#121212` (deep gray, not pure black)
- **Surface**: `#1e1e1e` (slightly lighter gray)
- **Text Primary**: `#e4e6eb` (off-white, not pure white)
- **Text Secondary**: `#a0a0a0` (medium gray)
- **Accent**: `#10a37f` (ChatGPT green)

### Light Theme (Notion/Slack-inspired)
- **Background**: `#f7f7f8` (soft gray, not pure white)
- **Surface**: `#ffffff` (pure white)
- **Text Primary**: `#202123` (dark gray, not pure black)
- **Text Secondary**: `#6b6b6b` (medium gray)
- **Accent**: `#10a37f` (ChatGPT green)

## Testing Your Migration

1. **Check Theme Toggle**: Ensure the theme toggle button works and switches between dark/light
2. **Verify Colors**: Confirm that backgrounds, text, and borders change appropriately
3. **Test Transitions**: Look for smooth color transitions when switching themes
4. **Check Contrast**: Ensure text remains readable in both themes
5. **Validate CSS**: Use browser dev tools to verify CSS custom properties are applied

## Common Issues and Solutions

### Issue: Colors not updating
**Solution**: Ensure you're using the new CSS custom property syntax: `bg-[var(--color-background)]`

### Issue: Theme toggle not working
**Solution**: Check that `ThemeProvider` wraps your app in `layout.tsx`

### Issue: Styling conflicts
**Solution**: Remove any hardcoded color classes that might override the theme system

### Issue: Performance issues
**Solution**: The new system should be more performant, but ensure you're not mixing old and new approaches

## Next Steps

1. **Update Components**: Migrate all components using the patterns above
2. **Test Thoroughly**: Verify theme switching works across all pages
3. **Remove Old Code**: Clean up any remaining references to the old theme system
4. **Optimize**: Consider adding more semantic color variables as needed

## Support

If you encounter issues during migration:
1. Check the browser console for errors
2. Verify CSS custom properties are being applied in dev tools
3. Ensure all imports are updated to use the new theme system
4. Test with a simple component first before migrating complex ones
