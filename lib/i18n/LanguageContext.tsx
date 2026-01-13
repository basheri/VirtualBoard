'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { content, Language } from './content';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof content.en;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved && (saved === 'en' || saved === 'ar')) {
        setLanguage(saved);
      } else if (navigator.language.startsWith('ar')) {
        setLanguage('ar');
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Update font based on language
      if (language === 'ar') {
        document.body.classList.add('font-arabic');
        document.body.classList.remove('font-sans');
      } else {
        document.body.classList.add('font-sans');
        document.body.classList.remove('font-arabic');
      }
    }
  }, [language, mounted]);

  const value = {
    language,
    setLanguage,
    t: content[language],
    dir: (language === 'ar' ? 'rtl' : 'ltr') as 'ltr' | 'rtl',
  };

  // Avoid hydration mismatch by rendering nothing until mounted, 
  // or you could render a loader, or just render children with default (but might flicker)
  // For landing page, flicker is better than blank.
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
