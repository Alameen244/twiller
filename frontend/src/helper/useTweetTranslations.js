import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateTweetsApi } from "../Apis/tweetApi";

const CHUNK = 25; // same limit as the backend
const WAIT_MS = 600; // collect tweets that scroll into view, then send ONE request

// Translates only the tweets the user has actually seen, in batches.
// Usage: const { translations, markVisible } = useTweetTranslations();
// Failures are silent: the tweet simply stays in its original language.
export default function useTweetTranslations() {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const [store, setStore] = useState({ language, map: {} });
  const seen = useRef(new Set()); // every tweet id that has been on screen
  const asked = useRef(new Set()); // ids already requested for askedLang
  const askedLang = useRef(language);
  const langRef = useRef(language);
  const timer = useRef(null);

  const flush = useCallback(async () => {
    const lang = langRef.current;
    if (askedLang.current !== lang) {
      askedLang.current = lang;
      asked.current = new Set();
    }
    const todo = [...seen.current].filter((id) => !asked.current.has(id));
    todo.forEach((id) => asked.current.add(id));

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
  }, []);

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
    schedule();
  }, [language, schedule]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { translations: store.language === language ? store.map : {}, markVisible };
}
