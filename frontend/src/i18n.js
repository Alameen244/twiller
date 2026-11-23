import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";
import zh from "./locales/zh.json";
import fr from "./locales/fr.json";

// Must match the backend list in constants/languages.js.
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "fr", name: "French", nativeName: "Français" },
];

export const DEFAULT_LANGUAGE = "en";
export const LANGUAGE_STORAGE_KEY = "twitter-language";

const codes = SUPPORTED_LANGUAGES.map((l) => l.code);

// Logged-out pages use the last saved language. After login the backend value wins (see AuthContext).
const readSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return codes.includes(saved) ? saved : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    hi: { translation: hi },
    pt: { translation: pt },
    zh: { translation: zh },
    fr: { translation: fr },
  },
  lng: readSavedLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false }, // React already escapes
});

const applyLanguage = (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // storage blocked: the language still works for this session
  }
};

i18n.on("languageChanged", applyLanguage);
applyLanguage(i18n.language);

export default i18n;
