// Audio tweet limits on the frontend. They only give fast feedback;
// the backend enforces the same limits and is the real check.
export const AUDIO_LIMITS = {
  MAX_DURATION_SECONDS: 300, // 5 minutes (server limit)
  MAX_RECORD_SECONDS: 299, // the recorder stops here, so it never reaches the limit exactly
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB
};

// Window text shown to the user (the backend decides; this is only for the notice).
export const AUDIO_WINDOW_LABEL = '2:00 PM and 7:00 PM IST';

// Browsers differ: Chrome/Firefox record WebM or Ogg, Safari records MP4.
export const RECORDER_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
];

export const formatDuration = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = String(s % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export const formatFileSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};
