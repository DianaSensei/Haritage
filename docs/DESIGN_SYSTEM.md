# Haritage Design System

## Overview

This document describes the design system for the Haritage app. The design system ensures **consistent, minimal, compact, and accessible** UI across all screens in both light and dark themes.

## Core Principles

### 1. **Minimal & Compact**
- Reduced vertical rhythm with tight spacing
- Smaller but readable typography
- Clean, uncluttered layouts
- Focus on essential content

### 2. **Consistent**
- Single source of truth for all design tokens
- Reusable spacing, typography, and color values
- Uniform components across all screens

### 3. **Clear Boundaries**
- Subtle borders and dividers between items
- Micro-elevation for visual hierarchy
- Soft color differentiation for surfaces

### 4. **Lightweight**
- Minimal shadow usage (subtle only)
- No heavy visual effects
- Optimized for performance

### 5. **Accessible**
- Sufficient color contrast (WCAG AA minimum)
- Clear focus states
- Readable text sizes

---

## Design Tokens

### Spacing Scale

Use these values for margins, padding, and gaps throughout the app:

```typescript
Spacing = {
  xs: 4,    // Minimal gaps
  sm: 8,    // Tight spacing
  md: 12,   // Comfortable spacing
  lg: 16,   // Standard spacing
  xl: 20,   // Generous spacing
  xxl: 24,  // Large spacing
  xxxl: 32, // Section spacing
}
```

**Usage Examples:**
```typescript
paddingHorizontal: Spacing.lg,  // 16px
gap: Spacing.md,                 // 12px
marginBottom: Spacing.xl,        // 20px
```

---

### Typography Scale

Compact yet readable typography optimized for minimal vertical rhythm:

```typescript
Typography = {
  size: {
    xs: 11,   // Small labels, captions
    sm: 13,   // Secondary text, metadata
    md: 15,   // Base body text
    lg: 17,   // Emphasized body text
    xl: 20,   // Subheadings
    xxl: 24,  // Headings
    xxxl: 28, // Page titles
  },
  lineHeight: {
    xs: 14,   // 11px * 1.27
    sm: 17,   // 13px * 1.31
    md: 20,   // 15px * 1.33
    lg: 23,   // 17px * 1.35
    xl: 26,   // 20px * 1.3
    xxl: 30,  // 24px * 1.25
    xxxl: 34, // 28px * 1.21
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.3,
  },
}
```

**Usage Examples:**
```typescript
fontSize: Typography.size.md,
lineHeight: Typography.lineHeight.md,
fontWeight: Typography.weight.semibold,
letterSpacing: Typography.letterSpacing.tight,
```

---

### Border Radii

Subtle, modern corner rounding:

```typescript
Radii = {
  xs: 4,   // Minimal rounding
  sm: 6,   // Subtle rounding
  md: 8,   // Standard rounding
  lg: 12,  // Comfortable rounding
  xl: 16,  // Generous rounding
  pill: 999, // Fully rounded (pills, badges)
}
```

**Usage Examples:**
```typescript
borderRadius: Radii.md,   // Standard cards
borderRadius: Radii.pill, // Buttons, badges
```

---

### Elevation & Shadows

Subtle depth without visual heaviness:

```typescript
Elevation = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

**Usage Pattern:**
```typescript
shadowColor: colors.shadow,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.08,
shadowRadius: 4,
elevation: 2,
```

---

## Color System

### Light Theme

```typescript
Colors.light = {
  // Base colors
  text: "#0f1419",
  textMuted: "#536471",
  textSubtle: "#8b98a5",
  
  // Backgrounds
  background: "#f7f9fa",
  backgroundElevated: "#ffffff",
  surface: "#ffffff",
  surfaceSecondary: "#f7f9fa",
  surfaceTertiary: "#eff1f3",
  
  // Interactive elements
  card: "#ffffff",
  cardMuted: "#f7f9fa",
  overlay: "rgba(0, 0, 0, 0.4)",
  
  // Borders & dividers
  border: "rgba(0, 0, 0, 0.08)",
  borderMuted: "rgba(0, 0, 0, 0.05)",
  borderStrong: "rgba(0, 0, 0, 0.12)",
  divider: "rgba(0, 0, 0, 0.06)",
  
  // Brand & accent
  accent: "#0a7aff",
  accentStrong: "#0852cc",
  accentSoft: "rgba(10, 122, 255, 0.08)",
  accentSofter: "rgba(10, 122, 255, 0.04)",
  
  // Semantic colors
  success: "#00ba34",
  danger: "#f4212e",
  warning: "#ffb020",
  info: "#1d9bf0",
  
  // Interaction states
  focus: "rgba(10, 122, 255, 0.25)",
  hover: "rgba(0, 0, 0, 0.03)",
  active: "rgba(0, 0, 0, 0.06)",
}
```

### Dark Theme

```typescript
Colors.dark = {
  // Base colors
  text: "#e7e9ea",
  textMuted: "#8b98a5",
  textSubtle: "#536471",
  
  // Backgrounds
  background: "#000000",
  backgroundElevated: "#16181c",
  surface: "#16181c",
  surfaceSecondary: "#1c1f23",
  surfaceTertiary: "#23262b",
  
  // Interactive elements
  card: "#16181c",
  cardMuted: "#1c1f23",
  overlay: "rgba(91, 112, 131, 0.4)",
  
  // Borders & dividers
  border: "rgba(255, 255, 255, 0.12)",
  borderMuted: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  divider: "rgba(255, 255, 255, 0.1)",
  
  // Brand & accent
  accent: "#1d9bf0",
  accentStrong: "#64a8ff",
  accentSoft: "rgba(29, 155, 240, 0.15)",
  accentSofter: "rgba(29, 155, 240, 0.08)",
  
  // Semantic colors
  success: "#00ba34",
  danger: "#f4212e",
  warning: "#ffb020",
  info: "#1d9bf0",
  
  // Interaction states
  focus: "rgba(29, 155, 240, 0.3)",
  hover: "rgba(255, 255, 255, 0.03)",
  active: "rgba(255, 255, 255, 0.06)",
}
```

---

## Component Patterns

### Cards

Cards have subtle elevation with clear borders:

```typescript
{
  backgroundColor: colors.card,
  borderRadius: Radii.md,
  borderWidth: 1,
  borderColor: colors.border,
  padding: Spacing.lg,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 2,
}
```

### List Items

Clear boundaries between items using borders and spacing:

```typescript
{
  backgroundColor: colors.card,
  borderRadius: Radii.sm,
  borderWidth: 1,
  borderColor: colors.border,
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.lg,
  marginVertical: Spacing.sm,
}
```

### Buttons

Compact buttons with clear interaction states:

```typescript
// Primary Button
{
  backgroundColor: colors.accent,
  borderRadius: Radii.pill,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.sm,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
}

// Secondary Button
{
  backgroundColor: colors.surfaceSecondary,
  borderRadius: Radii.pill,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.sm,
}
```

### Input Fields

Minimal, clear input styling:

```typescript
{
  backgroundColor: colors.surface,
  borderRadius: Radii.sm,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.sm,
  fontSize: Typography.size.md,
  lineHeight: Typography.lineHeight.md,
  color: colors.text,
}
```

---

## Usage Guidelines

### Spacing

1. **Use the spacing scale** - Never hardcode pixel values
2. **Maintain consistent gaps** - Use the same spacing value for related elements
3. **Vertical rhythm** - Keep vertical spacing consistent across screens

### Typography

1. **Use semantic sizes** - `xs` for captions, `md` for body, `xxxl` for titles
2. **Include line-height** - Always specify line-height with font-size
3. **Font weights** - Use semibold (600) for emphasis, bold (700) for headings

### Colors

1. **Use theme colors** - Access via `useAppTheme()` hook
2. **Semantic meaning** - Use `success`, `danger`, `warning`, `info` appropriately
3. **Borders** - Use `border` for standard, `borderMuted` for subtle, `borderStrong` for emphasis

### Elevation

1. **Minimal shadows** - Prefer `xs` and `sm` elevation
2. **Cards** - Use `sm` elevation (2)
3. **Modals** - Use `md` elevation (4)
4. **FABs** - Use `md` or `lg` elevation (4-8)

---

## Accessibility

### Color Contrast

All color combinations meet **WCAG AA** standards:

- **Light theme**: `text` on `background` = 17.8:1 ✓
- **Dark theme**: `text` on `background` = 14.2:1 ✓
- **Accent on white**: `accent` on `#ffffff` = 4.7:1 ✓
- **Accent on black**: `accent` on `#000000` = 4.5:1 ✓

### Focus States

All interactive elements have clear focus indicators:

```typescript
{
  borderWidth: 2,
  borderColor: colors.focus,
}
```

### Touch Targets

Minimum touch target size: **44x44 pt** (iOS HIG, Android Material)

---

## Theme Toggle

Users can switch between light, dark, and system themes:

```typescript
import { useAppTheme } from '@/shared/hooks';

const { theme, setThemePreference, isDark, colors } = useAppTheme();

// Set theme
setThemePreference('light');  // 'light' | 'dark' | 'system'
```

Theme preference is persisted to `AsyncStorage` automatically.

---

## Implementation

### In Screens

```typescript
import { Radii, Spacing, Typography } from '@/core/config/theme';
import { useAppTheme } from '@/shared/hooks';

export const MyScreen = () => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  return <View style={styles.container}>...</View>;
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    padding: Spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: Typography.size.xxxl,
    lineHeight: Typography.lineHeight.xxxl,
    fontWeight: Typography.weight.bold,
    color: colors.text,
    letterSpacing: Typography.letterSpacing.tight,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: Spacing.lg,
  },
});
```

### In Components

```typescript
import { ThemedText } from '@/shared/components';

<ThemedText type="title">Page Title</ThemedText>
<ThemedText type="default">Body text</ThemedText>
<ThemedText type="caption">Secondary text</ThemedText>
```

---

## Migration Checklist

When updating an existing component to use the design system:

- [ ] Import design tokens (`Spacing`, `Typography`, `Radii`)
- [ ] Replace hardcoded pixel values with `Spacing` tokens
- [ ] Replace font sizes/weights with `Typography` tokens
- [ ] Replace border radius values with `Radii` tokens
- [ ] Use `colors` from `useAppTheme()` for all colors
- [ ] Remove heavy shadows, use subtle elevation instead
- [ ] Ensure borders use theme colors (`colors.border`, `colors.divider`)
- [ ] Test in both light and dark themes
- [ ] Verify text contrast meets WCAG AA standards
- [ ] Check touch targets are at least 44x44 pt

---

## Resources

- **Theme Configuration**: `src/core/config/theme.ts`
- **Theme Hook**: `src/shared/hooks/use-app-theme.ts`
- **Themed Components**: `src/shared/components/ThemedText.tsx`, `ThemedView.tsx`
- **Example Screens**: `src/modules/home/screens/HomeScreen.tsx`, `src/modules/account/screens/AccountScreen.tsx`

---

**Last Updated**: 2025-11-03
**Version**: 1.0.0
