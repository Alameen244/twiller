import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { translateTweetsApi } from "../Apis/tweetApi";

const CHUNK = 25; // same limit as the backend
const WAIT_MS = 600; // collect tweets that scroll into view, then send ONE request
const SLOW_TRANSLATION_MS = 4000; // show notice only if Gemini/server is noticeably slow
const DELAY_TOAST_KEY = "twitter-translation-delay-lang";

export const clearTranslationDelayNotice = () => {
  try {
    sessionStorage.removeItem(DELAY_TOAST_KEY);
  } catch {
    /* ignore storage errors */
  }
};

const hasNotifiedForLang = (lang) => {
  try {
    return sessionStorage.getItem(DELAY_TOAST_KEY) === lang;
  } catch {
    return false;
  }
};

const markNotifiedForLang = (lang) => {
  try {
    sessionStorage.setItem(DELAY_TOAST_KEY, lang);
  } catch {
    /* ignore storage errors */
  }
};

// Translates only the tweets the user has actually seen, in batches.
// Usage: const { translations, markVisible } = useTweetTranslations();
// Failures are silent: the tweet simply stays in its original language.
export default function useTweetTranslations() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const [store, setStore] = useState({ language, map: {} });
  const seen = useRef(new Set()); // every tweet id that has been on screen
  const asked = useRef(new Set()); // ids already requested for askedLang
  const askedLang = useRef(language);
  const langRef = useRef(language);
  const timer = useRef(null);
  const slowTimer = useRef(null);

  const flush = useCallback(async () => {
    const lang = langRef.current;
    if (askedLang.current !== lang) {
      askedLang.current = lang;
      asked.current = new Set();
    }
    const todo = [...seen.current].filter((id) => !asked.current.has(id));
    todo.forEach((id) => asked.current.add(id));
    if (todo.length === 0) return;

    clearTimeout(slowTimer.current);
    if (!hasNotifiedForLang(lang)) {
      slowTimer.current = setTimeout(() => {
        if (langRef.current !== lang || hasNotifiedForLang(lang)) return;
        markNotifiedForLang(lang);
        toast.info(t("tweet.translationDelayed"), {
          toastId: "translation-delay",
          autoClose: 5000,
        });
      }, SLOW_TRANSLATION_MS);
    }

    try {
      for (let i = 0; i < todo.length; i += CHUNK) {
        try {
          const res = await translateTweetsApi(todo.slice(i, i + CHUNK));
          if (langRef.current !== lang || res.language !== lang) return; // language changed meanwhile
          setStore((prev) => ({
            language: lang,
            map: { ...(prev.language === lang ? prev.map : {}), ...res.translations },
          }));
        } catch {
          // keep the original text
        }
      }
    } finally {
      clearTimeout(slowTimer.current);
    }
  }, [t]);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, WAIT_MS);
  }, [flush]);

  const markVisible = useCallback(
    (id) => {
      seen.current.add(id);
      schedule();
    },
    [schedule],
  );

  // New language: translate everything already on screen again.
  useEffect(() => {
    langRef.current = language;
    clearTimeout(slowTimer.current);
    schedule();
  }, [language, schedule]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      clearTimeout(slowTimer.current);
    };
  }, []);

  return { translations: store.language === language ? store.map : {}, markVisible };
}
