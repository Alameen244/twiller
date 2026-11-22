import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AUDIO_LIMITS, ALLOWED_AUDIO_MIME_TYPES } from '../constants/audioLimits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Same temp folder the image uploads use.
const tempDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// "audio/webm;codecs=opus" -> "audio/webm"
const baseMimeType = (mimetype = '') => mimetype.split(';')[0].trim().toLowerCase();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_AUDIO_MIME_TYPES.includes(baseMimeType(file.mimetype))) {
    return cb(null, true);
  }
  const error = new Error('INVALID_AUDIO_TYPE');
  error.code = 'INVALID_AUDIO_TYPE';
  return cb(error);
};

const audioUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: AUDIO_LIMITS.MAX_FILE_SIZE_BYTES, files: 1 },
});

// Runs multer and turns its errors into clear JSON responses.
export const uploadAudioSingle = (req, res, next) => {
  audioUpload.single('audio')(req, res, (err) => {
    if (!err) return next();

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        code: 'AUDIO_TOO_LARGE',
        message: 'Audio file is too large. The maximum size is 100 MB.',
      });
    }
    if (err.code === 'INVALID_AUDIO_TYPE') {
      return res.status(415).json({
        code: 'INVALID_AUDIO_TYPE',
        message: 'Unsupported file type. Please upload an audio file.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        code: 'INVALID_AUDIO_FIELD',
        message: 'Send exactly one audio file in the "audio" field.',
      });
    }

    console.error('Audio upload middleware error:', err);
    return res.status(400).json({ message: 'Could not read the uploaded file.' });
  });
};
