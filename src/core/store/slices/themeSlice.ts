import { CONFIG } from '@/core/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ThemePreference } from '@/shared/types';

export type ThemeName = Exclude<ColorSchemeName, null>;

type ThemeState = {
  themePreference: ThemePreference;
  systemColorScheme: ThemeName;
};

type ThemeActions = {
  setThemePreference: (preference: ThemePreference) => void;
  setSystemColorScheme: (scheme: ThemeName) => void;
};

type ThemeStore = ThemeState & ThemeActions;

const getSystemColorScheme = (): ThemeName => Appearance.getColorScheme() ?? 'light';

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      themePreference: 'system',
      systemColorScheme: getSystemColorScheme(),
      setThemePreference: (preference) => {
        set({ themePreference: preference });
      },
      setSystemColorScheme: (scheme) => {
        if (!scheme) {
          return;
        }

        const current = get().systemColorScheme;
        if (current === scheme) {
          return;
        }

        set({ systemColorScheme: scheme });
      },
    }),
    {
      name: CONFIG.STORAGE_KEYS.THEME_PREFERENCE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themePreference: state.themePreference }),
    }
  )
);
