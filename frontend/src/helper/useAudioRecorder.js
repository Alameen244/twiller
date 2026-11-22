import { useCallback, useEffect, useRef, useState } from "react";
import { AUDIO_LIMITS, RECORDER_MIME_CANDIDATES } from "./audioConstants";

const pickRecorderMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  return RECORDER_MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const extensionFor = (mime = "") => {
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
};

const baseMime = (mime = "") => mime.split(";")[0].trim().toLowerCase();

// Reads the duration in the browser. Returns null when the browser can't tell
// (then the backend decides).
const readDuration = (url) =>
  new Promise((resolve, reject) => {
    const probe = new Audio();
    probe.preload = "metadata";
    const timer = setTimeout(() => resolve(null), 5000);
    probe.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(Number.isFinite(probe.duration) ? probe.duration : null);
    };
    probe.onerror = () => {
      clearTimeout(timer);
      reject(new Error("unreadable"));
    };
    probe.src = url;
  });

/**
 * Records audio with the browser's MediaRecorder, or accepts an uploaded file.
 * `audio` is null or { file, url, durationSeconds, source: 'recorded' | 'uploaded' }.
 * Status: 'idle' | 'starting' | 'recording'.
 */
const useAudioRecorder = () => {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState(null);
  const [error, setError] = useState("");

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const urlRef = useRef(null);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const revokeUrl = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  };

  const setNewAudio = (file, durationSeconds, source) => {
    revokeUrl();
    urlRef.current = URL.createObjectURL(file);
    setAudio({ file, url: urlRef.current, durationSeconds, source });
  };

  const reset = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null; // we are discarding, so don't build a file
      recorder.stop();
    }
    recorderRef.current = null;
    clearTimer();
    stopTracks();
    revokeUrl();
    chunksRef.current = [];
    setAudio(null);
    setSeconds(0);
    setError("");
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (status !== "idle") return;
    setError("");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Recording is not supported in this browser. You can upload an audio file instead.");
      return;
    }

    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        clearTimer();
        stopTracks();
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        recorderRef.current = null;

        if (blob.size === 0) {
          setError("Nothing was recorded. Please try again.");
          setStatus("idle");
          return;
        }

        const file = new File([blob], `recording.${extensionFor(type)}`, { type });
        const elapsed = Math.min((Date.now() - startedAt) / 1000, AUDIO_LIMITS.MAX_RECORD_SECONDS);
        setNewAudio(file, elapsed, "recorded");
        setStatus("idle");
      };

      const startedAt = Date.now();
      recorder.start();
      setSeconds(0);
      setStatus("recording");

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        setSeconds(Math.min(Math.floor(elapsed), AUDIO_LIMITS.MAX_RECORD_SECONDS));
        if (elapsed >= AUDIO_LIMITS.MAX_RECORD_SECONDS && recorder.state === "recording") {
          recorder.stop(); // auto-stop at the limit
        }
      }, 250);
    } catch (err) {
      stopTracks();
      clearTimer();
      setStatus("idle");
      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setError("Microphone access was blocked. Allow the microphone in your browser settings and try again.");
      } else if (err?.name === "NotFoundError" || err?.name === "OverconstrainedError") {
        setError("No microphone was found on this device.");
      } else {
        setError("Could not start the recording. Please try again.");
      }
    }
  }, [status]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
  }, []);

  // Accepts an uploaded file. Returns { ok, message }.
  const loadFile = useCallback(async (file) => {
    setError("");
    if (!file) return { ok: false, message: "No file selected." };

    const isAudio = baseMime(file.type).startsWith("audio/") || baseMime(file.type) === "video/webm";
    if (!isAudio) {
      const message = "Unsupported file type. Please choose an audio file.";
      setError(message);
      return { ok: false, message };
    }
    if (file.size > AUDIO_LIMITS.MAX_FILE_SIZE_BYTES) {
      const message = "Audio file is too large. The maximum size is 100 MB.";
      setError(message);
      return { ok: false, message };
    }

    const probeUrl = URL.createObjectURL(file);
    try {
      const duration = await readDuration(probeUrl);
      if (duration !== null && duration > AUDIO_LIMITS.MAX_DURATION_SECONDS) {
        const message = "Audio is too long. The maximum duration is 5 minutes.";
        setError(message);
        return { ok: false, message };
      }
      setNewAudio(file, duration, "uploaded");
      return { ok: true };
    } catch {
      const message = "This audio file could not be read. Please choose another file.";
      setError(message);
      return { ok: false, message };
    } finally {
      URL.revokeObjectURL(probeUrl);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);

  // Release the microphone and the preview URL when the component goes away.
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      clearTimer();
      stopTracks();
      revokeUrl();
    };
  }, []);

  return { status, seconds, audio, error, start, stop, reset, loadFile, clearError };
};

export default useAudioRecorder;
