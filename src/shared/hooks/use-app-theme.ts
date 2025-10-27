import { useMemo } from 'react';

import { Colors } from '@/core/config/theme';
import { useThemeStore } from '@/core/store/slices/themeSlice';

import { useColorScheme } from './use-color-scheme';

export const useAppTheme = () => {
  const theme = useColorScheme();
  const themePreference = useThemeStore((state) => state.themePreference);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const systemColorScheme = useThemeStore((state) => state.systemColorScheme);

  const colorSchemeKey = theme as keyof typeof Colors;
  const colors = useMemo(() => Colors[colorSchemeKey], [colorSchemeKey]);

  return {
    theme,
    isDark: theme === 'dark',
    themePreference,
    setThemePreference,
    systemColorScheme,
    colors,
  } as const;
};
