import { createContext, useContext, useMemo, useState } from "react";

import en from "../i18n/en.json";
import de from "../i18n/de.json";

const dictionaries = { en, de };
const I18nContext = createContext(null);

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem("memind:language") || "en");

  const value = useMemo(() => {
    const dictionary = dictionaries[language] || dictionaries.en;
    const t = (key, fallback) => getNestedValue(dictionary, key) ?? fallback ?? key;
    const localizeText = (valueToTranslate, fallback = "") => {
      if (!valueToTranslate) return fallback;
      if (typeof valueToTranslate === "string") return valueToTranslate;
      if (typeof valueToTranslate === "object") return valueToTranslate[language] || valueToTranslate.en || fallback;
      return fallback;
    };
    const formatDateTime = (dateValue, options) => {
      if (!dateValue) return "";
      const formatter = new Intl.DateTimeFormat(language === "de" ? "de-DE" : "en-US", options);
      return formatter.format(new Date(dateValue));
    };
    return { language, setLanguage, t, localizeText, formatDateTime };
  }, [language]);

  const handleSetLanguage = (nextLanguage) => {
    localStorage.setItem("memind:language", nextLanguage);
    setLanguage(nextLanguage);
  };

  return <I18nContext.Provider value={{ ...value, setLanguage: handleSetLanguage }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
};
