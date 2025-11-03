/**
 * Design Tokens & Theme System
 * 
 * This file defines a comprehensive, minimal, and compact design system.
 * - Single source of truth for colors, spacing, typography, radii, and shadows
 * - Light and dark themes with cohesive, comfortable colors
 * - Clear boundaries between items without visual clutter
 * - Optimized for continuous, focused user experience
 */

import { Platform } from "react-native";

// ============================================================================
// DESIGN TOKENS (Theme-agnostic constants)
// ============================================================================

/**
 * Spacing scale - compact design with consistent rhythm
 * Use these values throughout the app for margins, padding, gaps
 */
export const Spacing = {
  xs: 4,   // 4px - Minimal gaps
  sm: 8,   // 8px - Tight spacing
  md: 12,  // 12px - Comfortable spacing
  lg: 16,  // 16px - Standard spacing
  xl: 20,  // 20px - Generous spacing
  xxl: 24, // 24px - Large spacing
  xxxl: 32, // 32px - Section spacing
} as const;

/**
 * Typography scale - compact yet readable
 * Optimized for minimal vertical rhythm
 */
export const Typography = {
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
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.3,
  },
} as const;

/**
 * Border radius - subtle, modern corners
 */
export const Radii = {
  xs: 4,   // Minimal rounding
  sm: 6,   // Subtle rounding
  md: 8,   // Standard rounding
  lg: 12,  // Comfortable rounding
  xl: 16,  // Generous rounding
  pill: 999, // Fully rounded (pills, badges)
} as const;

/**
 * Elevation & Shadow - subtle depth without heaviness
 */
export const Elevation = {
  none: {
    shadowColor: 'transparent',
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
} as const;

// ============================================================================
// COLOR TOKENS (Theme-specific colors)
// ============================================================================

const tintColorLight = "#0a7aff";
const tintColorDark = "#64a8ff";

export const Colors = {
  light: {
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
    
    // Borders & dividers - subtle but clear
    border: "rgba(0, 0, 0, 0.08)",
    borderMuted: "rgba(0, 0, 0, 0.05)",
    borderStrong: "rgba(0, 0, 0, 0.12)",
    divider: "rgba(0, 0, 0, 0.06)",
    
    // Icons
    icon: "#536471",
    iconMuted: "#8b98a5",
    iconSubtle: "#aab8c2",
    
    // Brand & accent colors
    tint: tintColorLight,
    accent: "#0a7aff",
    accentStrong: "#0852cc",
    accentSoft: "rgba(10, 122, 255, 0.08)",
    accentSofter: "rgba(10, 122, 255, 0.04)",
    
    // Tab bar
    tabIconDefault: "#536471",
    tabIconSelected: tintColorLight,
    
    // Semantic colors
    success: "#00ba34",
    successSoft: "rgba(0, 186, 52, 0.1)",
    danger: "#f4212e",
    dangerSoft: "rgba(244, 33, 46, 0.1)",
    warning: "#ffb020",
    warningSoft: "rgba(255, 176, 32, 0.1)",
    info: "#1d9bf0",
    infoSoft: "rgba(29, 155, 240, 0.1)",
    
    // Utility colors
    textLink: "#0a7aff",
    highlight: "#e6f2ff",
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowSubtle: "rgba(0, 0, 0, 0.04)",
    
    // Focus & interaction states
    focus: "rgba(10, 122, 255, 0.25)",
    hover: "rgba(0, 0, 0, 0.03)",
    active: "rgba(0, 0, 0, 0.06)",
  },
  dark: {
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
    
    // Borders & dividers - subtle but clear
    border: "rgba(255, 255, 255, 0.12)",
    borderMuted: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.16)",
    divider: "rgba(255, 255, 255, 0.1)",
    
    // Icons
    icon: "#8b98a5",
    iconMuted: "#536471",
    iconSubtle: "#3d4448",
    
    // Brand & accent colors
    tint: tintColorDark,
    accent: "#1d9bf0",
    accentStrong: "#64a8ff",
    accentSoft: "rgba(29, 155, 240, 0.15)",
    accentSofter: "rgba(29, 155, 240, 0.08)",
    
    // Tab bar
    tabIconDefault: "#8b98a5",
    tabIconSelected: tintColorDark,
    
    // Semantic colors
    success: "#00ba34",
    successSoft: "rgba(0, 186, 52, 0.15)",
    danger: "#f4212e",
    dangerSoft: "rgba(244, 33, 46, 0.15)",
    warning: "#ffb020",
    warningSoft: "rgba(255, 176, 32, 0.15)",
    info: "#1d9bf0",
    infoSoft: "rgba(29, 155, 240, 0.15)",
    
    // Utility colors
    textLink: "#1d9bf0",
    highlight: "#1c2e3f",
    shadow: "rgba(255, 255, 255, 0.1)",
    shadowSubtle: "rgba(255, 255, 255, 0.04)",
    
    // Focus & interaction states
    focus: "rgba(29, 155, 240, 0.3)",
    hover: "rgba(255, 255, 255, 0.03)",
    active: "rgba(255, 255, 255, 0.06)",
  },
};

/**
 * Font families - platform-optimized system fonts
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Helper to get elevation style based on theme
 */
export const getElevation = (
  level: keyof typeof Elevation,
  colorScheme: 'light' | 'dark'
) => {
  const baseStyle = Elevation[level];
  const shadowColor = colorScheme === 'dark' 
    ? Colors.dark.shadow 
    : Colors.light.shadow;
  
  return {
    ...baseStyle,
    shadowColor,
  };
};

/**
 * Helper to create consistent list item separator style
 */
export const getListSeparatorStyle = (colorScheme: 'light' | 'dark') => ({
  height: 1,
  backgroundColor: colorScheme === 'dark' 
    ? Colors.dark.divider 
    : Colors.light.divider,
});

/**
 * Helper to get focus ring style for accessibility
 */
export const getFocusRingStyle = (colorScheme: 'light' | 'dark') => ({
  borderWidth: 2,
  borderColor: colorScheme === 'dark' 
    ? Colors.dark.focus 
    : Colors.light.focus,
});
