import { NativeModulesProxy } from 'expo-modules-core';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    isSupportedLanguage,
    resources,
    type AppLanguage,
} from './resources';

const supportedLanguageCodes = Object.keys(SUPPORTED_LANGUAGES) as AppLanguage[];

type LocaleShape = { languageCode?: string | null };

type LocalizationModule = typeof import('expo-localization');

const isLocalizationModuleAvailable = Boolean(NativeModulesProxy?.ExpoLocalization);

const fallbackLocalesFromIntl = (): LocaleShape[] => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale) {
      const [languageCode] = locale.split('-');
      return [{ languageCode }];
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('Intl locale detection failed, using default language.', error);
    }
  }

  return [];
};

const loadLocales = async (): Promise<LocaleShape[]> => {
  if (!isLocalizationModuleAvailable) {
    return fallbackLocalesFromIntl();
  }

  try {
    const localization: LocalizationModule = await import('expo-localization');
    if (typeof localization.getLocales === 'function') {
      return localization.getLocales();
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('expo-localization getLocales failed, falling back to Intl locale.', error);
    }
  }

  return fallbackLocalesFromIntl();
};

const resolveInitialLanguage = async (): Promise<AppLanguage> => {
  const locales = await loadLocales();

  for (let index = 0; index < locales.length; index += 1) {
    const languageCode = locales[index]?.languageCode;
    if (languageCode && isSupportedLanguage(languageCode)) {
      return languageCode;
    }
  }

  return DEFAULT_LANGUAGE;
};

if (!i18n.isInitialized) {
  // eslint-disable-next-line import/no-named-as-default-member
  i18n.use(initReactI18next);

  const initializeI18n = async (): Promise<void> => {
    try {
      // eslint-disable-next-line import/no-named-as-default-member
      await i18n.init({
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: supportedLanguageCodes,
        defaultNS: 'translation',
        interpolation: { escapeValue: false },
        compatibilityJSON: 'v4',
        returnNull: false,
        react: { useSuspense: false },
      });

      const initialLanguage = await resolveInitialLanguage();
      if (initialLanguage !== i18n.language) {
        // eslint-disable-next-line import/no-named-as-default-member
        await i18n.changeLanguage(initialLanguage);
      }
    } catch (error) {
      console.warn('i18n initialization failed', error);
    }
  };

  void initializeI18n();
}

export { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, i18n, isSupportedLanguage, resources };
export type { AppLanguage };

