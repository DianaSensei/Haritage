import { CONFIG } from '@/core/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_LANGUAGE, i18n, isSupportedLanguage, type AppLanguage } from '@/shared/i18n';

type LanguageState = {
  language: AppLanguage;
};

type LanguageActions = {
  setLanguage: (language: AppLanguage) => void;
};

type LanguageStore = LanguageState & LanguageActions;

const resolveInitialLanguage = (): AppLanguage => {
  const current = i18n.language;
  if (isSupportedLanguage(current)) {
    return current;
  }
  return DEFAULT_LANGUAGE;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: resolveInitialLanguage(),
      setLanguage: (language) => {
        if (!isSupportedLanguage(language)) {
          console.warn(`Attempted to set unsupported language: ${language}`);
          return;
        }

        if (get().language === language) {
          return;
        }

        set({ language });

        void i18n.changeLanguage(language).catch((error) => {
          console.warn('Failed to change language', error);
        });
      },
    }),
    {
      name: CONFIG.STORAGE_KEYS.LANGUAGE_PREFERENCE,
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        const storedLanguage = state?.language;
        if (isSupportedLanguage(storedLanguage) && storedLanguage !== i18n.language) {
          void i18n.changeLanguage(storedLanguage).catch((error) => {
            console.warn('Failed to apply stored language', error);
          });
        }
      },
    }
  )
);
