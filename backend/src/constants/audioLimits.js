// Limits for audio tweets. Single source of truth for the backend.
export const AUDIO_LIMITS = {
  MAX_DURATION_SECONDS: 300, // 5 minutes
  MAX_FILE_SIZE_BYTES: 100 * 1024 * 1024, // 100 MB
  UPLOAD_GRANT_VALID_MINUTES: 15, // how long a verified OTP stays usable for one upload
};

// MIME types we accept (compared without codec details, e.g. "audio/webm;codecs=opus" -> "audio/webm").
export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'video/webm', // some browsers label audio-only WebM this way
  'audio/ogg',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
];
