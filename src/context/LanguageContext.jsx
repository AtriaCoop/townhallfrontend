import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/i18n/translations";
import { LANGUAGES } from "@/constants/languages";

const DEFAULT_LANG = "en-US";
const STORAGE_KEY = "app_language";

const LanguageContext = createContext({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANG);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  // Basic key-path lookup: e.g. "settings.title"
  function t(key) {
    const parts = key.split(".");
    let current = translations[language];
    for (const part of parts) {
      if (!current || typeof current !== "object") return key;
      current = current[part];
    }
    return current || key;
  }

  const value = {
    language,
    setLanguage: (code) => {
      if (translations[code]) setLanguage(code);
    },
    t,
    languages: LANGUAGES,
  };

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
