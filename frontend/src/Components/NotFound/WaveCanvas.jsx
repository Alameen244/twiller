import { useEffect, useRef } from "react";

const RIBBONS = [
  { amp: 42, freq: 0.0024, speed: 0.00075, phase: 0.2, yRatio: 0.41, color: "rgba(255, 255, 255, 0.09)", width: 1.0 },
  { amp: 56, freq: 0.0019, speed: -0.00058, phase: 1.6, yRatio: 0.45, color: "rgba(255, 255, 255, 0.16)", width: 1.1 },
  { amp: 48, freq: 0.0028, speed: 0.00095, phase: 3.1, yRatio: 0.48, color: "rgba(29, 155, 240, 0.48)", width: 1.5, primary: true },
  { amp: 34, freq: 0.0033, speed: -0.00082, phase: 4.5, yRatio: 0.52, color: "rgba(255, 255, 255, 0.11)", width: 0.9 },
  { amp: 28, freq: 0.0022, speed: 0.00048, phase: 5.7, yRatio: 0.56, color: "rgba(255, 255, 255, 0.055)", width: 0.8 },
];

const SPARK_INDICES = Array.from({ length: 24 }, (_, idx) => (idx + 0.5) / 24);

/**
 * Lightweight 60fps harmonic signal-wave canvas for the 404 viewport.
 * Caps DPR at 2, pauses in background tabs, and renders a crisp static frame
 * when prefers-reduced-motion is enabled.
 */
export default function WaveCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reduceMotion = Boolean(motionQuery?.matches);
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let pointerX = 0.5;
    let pointerY = 0.48;
    let targetX = 0.5;
    let targetY = 0.48;
    let pointerActive = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, Math.floor(rect.width || window.innerWidth));
      height = Math.max(320, Math.floor(rect.height || window.innerHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (timeMs) => {
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric center glow anchored behind the focal horizon.
      const glowX = width * (0.5 + (pointerX - 0.5) * 0.08);
      const glowY = height * 0.44;
      const glow = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        Math.max(width, height) * 0.46
      );
      glow.addColorStop(0, "rgba(29, 155, 240, 0.14)");
      glow.addColorStop(0.45, "rgba(29, 155, 240, 0.04)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const scaleFactor = width < 640 ? 0.72 : 1;
      const step = width < 640 ? 10 : 8;

      for (const ribbon of RIBBONS) {
        ctx.beginPath();
        ctx.lineWidth = ribbon.width;
        ctx.strokeStyle = ribbon.color;
        if (ribbon.primary) {
          ctx.shadowColor = "rgba(29, 155, 240, 0.42)";
          ctx.shadowBlur = 14;
        } else {
          ctx.shadowBlur = 0;
        }

        const baseY = height * ribbon.yRatio;
        const t = timeMs * ribbon.speed + ribbon.phase;

        for (let x = -step; x <= width + step; x += step) {
          const normX = x / width;
          const envelope = Math.sin(Math.max(0, Math.min(1, normX)) * Math.PI);
          const distCursor = Math.abs(normX - pointerX);
          const pointerLift = pointerActive
            ? Math.exp(-distCursor * distCursor * 18) * (pointerY - 0.48) * 56
            : 0;

          const waveA = Math.sin(x * ribbon.freq + t);
          const waveB = Math.cos(x * ribbon.freq * 1.65 - t * 1.35) * 0.42;
          const y = baseY + (waveA + waveB) * ribbon.amp * scaleFactor * (0.45 + 0.55 * envelope) + pointerLift;

          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;

      // Ride sparse micro-nodes smoothly along the primary X-blue harmonic trace.
      const primary = RIBBONS[2];
      const pt = timeMs * primary.speed + primary.phase;
      const baseY = height * primary.yRatio;

      for (let i = 0; i < SPARK_INDICES.length; i += 1) {
        const normX = SPARK_INDICES[i];
        const x = normX * width;
        const envelope = Math.sin(normX * Math.PI);
        const distCursor = Math.abs(normX - pointerX);
        const pointerLift = pointerActive
          ? Math.exp(-distCursor * distCursor * 18) * (pointerY - 0.48) * 56
          : 0;
        const y =
          baseY +
          (Math.sin(x * primary.freq + pt) + Math.cos(x * primary.freq * 1.65 - pt * 1.35) * 0.42) *
            primary.amp *
            scaleFactor *
            (0.45 + 0.55 * envelope) +
          pointerLift;

        const alpha = (0.28 + 0.55 * envelope) * (i % 3 === 0 ? 1 : 0.65);
        ctx.fillStyle = i % 3 === 0 ? `rgba(29, 155, 240, ${alpha.toFixed(2)})` : `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(x, y, i % 3 === 0 ? 1.8 : 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (now) => {
      pointerX += (targetX - pointerX) * 0.08;
      pointerY += (targetY - pointerY) * 0.08;
      drawFrame(now);
      if (!reduceMotion && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      targetX = Math.max(0, Math.min(1, event.clientX / Math.max(1, window.innerWidth)));
      targetY = Math.max(0, Math.min(1, event.clientY / Math.max(1, window.innerHeight)));
      pointerActive = true;
    };

    const handleVisibility = () => {
      window.cancelAnimationFrame(rafId);
      if (!reduceMotion && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleMotionChange = (event) => {
      reduceMotion = event.matches;
      window.cancelAnimationFrame(rafId);
      drawFrame(1800);
      if (!reduceMotion && !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    resize();
    drawFrame(1800);
    if (!reduceMotion && !document.hidden) {
      rafId = window.requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery?.addEventListener?.("change", handleMotionChange);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery?.removeEventListener?.("change", handleMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="tw-nf-canvas" aria-hidden="true" />;
}
