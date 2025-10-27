/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a66c2";
const tintColorDark = "#8cbcff";

export const Colors = {
  light: {
    text: "#11181C",
    textMuted: "#687076",
    background: "#eef1f6",
    backgroundMuted: "#e4e8ef",
    surface: "#f3f5f9",
    surfaceSecondary: "#e9edf3",
    surfaceTertiary: "#dde2ea",
    card: "#edf1f6",
    cardMuted: "#e3e7ee",
    overlay: "rgba(15, 17, 19, 0.4)",
    border: "#cdd4dc",
    borderMuted: "#dce2ea",
    divider: "rgba(17, 24, 28, 0.05)",
    icon: "#5a626a",
    iconMuted: "#828991",
    tint: tintColorLight,
    accent: "#0a66c2",
    accentStrong: "#084f97",
    accentSoft: "rgba(10, 102, 194, 0.09)",
    tabIconDefault: "#5a626a",
    tabIconSelected: tintColorLight,
    success: "#2BAF5B",
    successSoft: "rgba(43, 175, 91, 0.14)",
    danger: "#E5484D",
    dangerSoft: "rgba(229, 72, 77, 0.16)",
    warning: "#FFB743",
    warningSoft: "rgba(255, 183, 67, 0.18)",
    info: "#3B82F6",
    infoSoft: "rgba(59, 130, 246, 0.16)",
    textLink: "#0a66c2",
    highlight: "#dde6f4",
    shadow: "rgba(15, 17, 19, 0.05)",
  },
  dark: {
    text: "#ECEDEE",
    textMuted: "#9BA1A6",
    background: "#151718",
    backgroundMuted: "#1a1a1b",
    surface: "#1a1a1b",
    surfaceSecondary: "#202124",
    surfaceTertiary: "#272729",
    card: "#202124",
    cardMuted: "#1f2227",
    overlay: "rgba(0, 0, 0, 0.55)",
    border: "#2f3033",
    borderMuted: "#2a2b2d",
    divider: "rgba(236, 237, 238, 0.12)",
    icon: "#9BA1A6",
    iconMuted: "#6C7074",
    tint: tintColorDark,
    accent: "#4C8FFF",
    accentStrong: "#3a73d9",
    accentSoft: "rgba(76, 143, 255, 0.18)",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    success: "#34C759",
    successSoft: "rgba(52, 199, 89, 0.18)",
    danger: "#FF453A",
    dangerSoft: "rgba(255, 69, 58, 0.18)",
    warning: "#FFB743",
    warningSoft: "rgba(255, 183, 67, 0.18)",
    info: "#60A5FA",
    infoSoft: "rgba(96, 165, 250, 0.18)",
    textLink: "#8cbcff",
    highlight: "#1f2a3a",
    shadow: "rgba(0, 0, 0, 0.35)",
  },
};

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
