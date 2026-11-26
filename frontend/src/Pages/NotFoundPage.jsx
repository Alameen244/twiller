import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TwitterLogo from "../Components/TwitterLogo";
import WaveCanvas from "../Components/NotFound/WaveCanvas";
import "./NotFoundPage.css";

function formatAttemptedPath(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return "/404";
  const cleaned = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return cleaned.length > 34 ? `${cleaned.slice(0, 31)}...` : cleaned;
}

/**
 * Animated single-viewport 404 page inspired by MotionSites' Agent Wave pattern
 * adapted to Twiller's pitch-black nocturnal palette and #1d9bf0 accent.
 */
export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef(null);
  const magneticRef = useRef(null);

  const attemptedPath = formatAttemptedPath(location.state?.from);

  const goHome = () => navigate("/", { replace: true });

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t("notFound.documentTitle");
    return () => {
      document.title = previousTitle;
    };
  }, [t]);

  useEffect(() => {
    const handler = (event) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        if (window.history.length > 1) navigate(-1);
        else navigate("/", { replace: true });
      } else if (
        (event.key === "h" || event.key === "H") &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // Release entrance transforms once finished (with two-rAF fallback if animations don't fire).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const nodes = Array.from(root.querySelectorAll(".tw-nf-appear"));
    const markSettled = (node) => node.classList.add("is-in");

    const cleanups = nodes.map((node) => {
      const onEnd = () => markSettled(node);
      node.addEventListener("animationend", onEnd, { once: true });
      return () => node.removeEventListener("animationend", onEnd);
    });

    let rafA = 0;
    let rafB = 0;
    rafA = window.requestAnimationFrame(() => {
      rafB = window.requestAnimationFrame(() => {
        for (const node of nodes) {
          const animations = node.getAnimations?.() || [];
          const active = animations.some(
            (anim) => anim.playState === "running" || anim.playState === "finished"
          );
          if (!active) markSettled(node);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(rafA);
      window.cancelAnimationFrame(rafB);
      cleanups.forEach((off) => off());
    };
  }, []);

  // Pointer-only magnetic hover on the primary CTA wrapper (never moves hit-test origin).
  useEffect(() => {
    const wrapper = magneticRef.current;
    if (!wrapper) return undefined;

    const canHover = window.matchMedia?.(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    )?.matches;
    if (!canHover) return undefined;

    const target = wrapper.querySelector(".tw-nf-btn");
    if (!target) return undefined;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const commit = () => {
      frame = 0;
      target.style.transform = `translate3d(${nextX.toFixed(1)}px, ${nextY.toFixed(1)}px, 0)`;
    };

    const onMove = (event) => {
      const rect = wrapper.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / Math.max(1, rect.width / 2);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / Math.max(1, rect.height / 2);
      nextX = Math.max(-1, Math.min(1, dx)) * 6;
      nextY = Math.max(-1, Math.min(1, dy)) * 4;
      if (!frame) frame = window.requestAnimationFrame(commit);
    };

    const onLeave = () => {
      nextX = 0;
      nextY = 0;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      target.style.transform = "";
    };

    wrapper.addEventListener("pointermove", onMove, { passive: true });
    wrapper.addEventListener("pointerleave", onLeave);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      target.style.transform = "";
      wrapper.removeEventListener("pointermove", onMove);
      wrapper.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="tw-nf-root">
      <div className="tw-nf-stage" aria-hidden="true">
        <WaveCanvas />
      </div>
      <div className="tw-nf-scrim" aria-hidden="true" />
      <div className="tw-nf-grain" aria-hidden="true" />

      <header className="tw-nf-header">
        <button
          type="button"
          className="tw-nf-brand tw-nf-appear tw-nf-appear--scale"
          style={{ "--d": "0.06s" }}
          onClick={goHome}
          aria-label="Twiller"
        >
          <TwitterLogo size={20} />
          <span>
            Twiller<span className="tw-nf-brand-tag">.app</span>
          </span>
        </button>

        <div
          className="tw-nf-path-pill tw-nf-appear tw-nf-appear--scale"
          style={{ "--d": "0.1s" }}
          title={attemptedPath}
        >
          <span className="tw-nf-path-dot" aria-hidden="true" />
          <span className="tw-nf-path-text">{attemptedPath}</span>
        </div>

        <button
          type="button"
          className="tw-nf-btn tw-nf-btn--ghost tw-nf-btn--compact tw-nf-header-cta tw-nf-appear tw-nf-appear--scale"
          style={{ "--d": "0.14s" }}
          onClick={goHome}
        >
          {t("notFound.navHome")}
        </button>
      </header>

      <main className="tw-nf-hero">
        <div className="tw-nf-copy">
          <p
            className="tw-nf-numeral tw-nf-appear tw-nf-appear--numeral"
            style={{ "--d": "0.08s" }}
            aria-label="404"
          >
            404
          </p>

          <div
            className="tw-nf-badge tw-nf-appear tw-nf-appear--pop"
            style={{ "--d": "0.16s" }}
          >
            <svg
              className="tw-nf-spark"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
            </svg>
            <span>{t("notFound.badge")}</span>
          </div>

          <h1 className="tw-nf-h1">
            <span
              className="tw-nf-line tw-nf-appear tw-nf-appear--mask"
              style={{ "--d": "0.22s" }}
            >
              {t("notFound.titleBefore")}{" "}
              <em className="tw-nf-em">{t("notFound.titleEmphasis")}</em>
            </span>
            <span
              className="tw-nf-line tw-nf-appear tw-nf-appear--mask"
              style={{ "--d": "0.3s" }}
            >
              {t("notFound.titleSecondLine")}
            </span>
          </h1>

          <p
            className="tw-nf-lede tw-nf-appear tw-nf-appear--soft"
            style={{ "--d": "0.38s" }}
          >
            {t("notFound.subtitle")}
          </p>

          <div className="tw-nf-actions">
            <span
              ref={magneticRef}
              className="tw-nf-mag tw-nf-appear tw-nf-appear--scale"
              style={{ "--d": "0.44s" }}
            >
              <button
                type="button"
                className="tw-nf-btn tw-nf-btn--solid"
                onClick={goHome}
              >
                <span>{t("notFound.backHome")}</span>
                <svg
                  className="tw-nf-arrow"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </span>

            <button
              type="button"
              className="tw-nf-btn tw-nf-btn--ghost tw-nf-appear tw-nf-appear--soft"
              style={{ "--d": "0.5s" }}
              onClick={goBack}
            >
              {t("notFound.goBack")}
            </button>
          </div>
        </div>
      </main>

      <footer className="tw-nf-stats">
        <div
          className="tw-nf-stat tw-nf-appear tw-nf-appear--stat"
          style={{ "--d": "0.54s" }}
        >
          <svg
            className="tw-nf-stat-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
          <span>{t("notFound.statStatus")}</span>
        </div>

        <div
          className="tw-nf-stat tw-nf-appear tw-nf-appear--stat"
          style={{ "--d": "0.58s" }}
        >
          <svg
            className="tw-nf-stat-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12h4l3-7 4 14 3-7h4" />
          </svg>
          <span>{t("notFound.statRedirect")}</span>
        </div>

        <div
          className="tw-nf-stat tw-nf-appear tw-nf-appear--stat"
          style={{ "--d": "0.62s" }}
        >
          <span className="tw-nf-kbd" aria-hidden="true">
            H
          </span>
          <span>{t("notFound.statShortcut")}</span>
        </div>
      </footer>
    </div>
  );
}
