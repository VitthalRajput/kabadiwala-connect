import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import enDictionary from '../locales/en.json';
import hiDictionary from '../locales/hi.json';
import mrDictionary from '../locales/mr.json';

export type Language = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

const STORAGE_KEY = 'kabadiwala_lang';

type Dictionary = Record<string, any>;

const dictionaries: Record<Language, Dictionary> = {
  en: enDictionary,
  hi: hiDictionary,
  mr: mrDictionary,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallbackOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to look up a nested key like 'dashboard.stats.totalLots'
function getNestedValue(obj: Dictionary, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'mr') {
        return stored;
      }
    } catch {
      // Ignore localStorage error if cookies disabled
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore localStorage error
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Ignore SSR/env error
    }
  }, [language]);

  const t = useMemo(() => {
    return (
      key: string,
      fallbackOrParams?: string | Record<string, string | number>,
      params?: Record<string, string | number>
    ): string => {
      let defaultText = typeof fallbackOrParams === 'string' ? fallbackOrParams : undefined;
      let interpolations = typeof fallbackOrParams === 'object' ? fallbackOrParams : params;

      // 1. Try selected language dictionary
      let text = getNestedValue(dictionaries[language], key);

      // 2. Fail-safe fallback to English dictionary
      if (!text && language !== 'en') {
        text = getNestedValue(dictionaries.en, key);
      }

      // 3. Fallback to defaultText or the key itself
      if (!text) {
        text = defaultText || key;
      }

      // Handle simple interpolation: {name} -> 'Kunal'
      if (interpolations && typeof text === 'string') {
        Object.entries(interpolations).forEach(([k, v]) => {
          text = (text as string).replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }

      return text;
    };
  }, [language]);

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      availableLanguages: AVAILABLE_LANGUAGES,
    }),
    [language, t]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fail-safe default so hooks won't throw even outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string, fallbackOrParams?: string | Record<string, string | number>) => {
        if (typeof fallbackOrParams === 'string') return fallbackOrParams;
        return getNestedValue(dictionaries.en, key) || key;
      },
      availableLanguages: AVAILABLE_LANGUAGES,
    };
  }
  return context;
};
