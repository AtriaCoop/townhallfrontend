import { useLanguage } from "@/context/LanguageContext";

export function useTranslation() {
  const { t, language, setLanguage, languages } = useLanguage();
  return { t, language, setLanguage, languages };
}
