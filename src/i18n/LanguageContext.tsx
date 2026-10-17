import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'aura_tennis_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'zh-CN') return 'zh-CN';
if (saved === 'en') return 'en';
    } catch {
      // ignore storage access error
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
  const allowedLanguage: Language =
    newLang === 'zh-CN' ? 'zh-CN' : 'en';

  setLanguageState(allowedLanguage);

  try {
    localStorage.setItem(STORAGE_KEY, allowedLanguage);
  } catch {
    // ignore storage access error
  }
};

  useEffect(() => {
  document.documentElement.lang =
    language === 'zh-CN' ? 'zh-Hans' : 'en';
}, [language]);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text = (langDict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
