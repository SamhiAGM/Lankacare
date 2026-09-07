'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/translations/en';
import { si } from '@/translations/si';
import { ta } from '@/translations/ta';

export type Language = 'en' | 'si' | 'ta';

export const translations = { en, si, ta };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof en | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('moh_lang') as Language | null;
    if (saved && ['en', 'si', 'ta'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('moh_lang', lang);
  };

  const t = (key: keyof typeof en | string): string => {
    const currentDict = translations[language] as Record<string, string>;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    const defaultDict = en as Record<string, string>;
    if (defaultDict[key]) {
      return defaultDict[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
