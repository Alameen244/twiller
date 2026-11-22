import Tweet from '../models/tweetModel.js';
import User from '../models/userModel.js';
import { isWithinTimeWindow } from '../utils/timeWindow.js';
import { TIME_WINDOWS } from '../constants/timeWindows.js';
import { AUDIO_LIMITS } from '../constants/audioLimits.js';
import { reserveTweetSlot, releaseTweetSlot } from '../services/subscriptionService.js';
import { hasUploadGrant, consumeUploadGrant } from '../services/audioGrantService.js';
import {
  uploadAudioToCloudinary,
  deleteAudioFromCloudinary,
  removeTempFile,
} from '../services/audioStorageService.js';

const AUTHOR_FIELDS = '-firebaseUid -phoneNumber -isPhoneVerified';
const MAX_CAPTION_LENGTH = 280;
const WINDOW_MESSAGE = `Audio tweets can be posted only between ${TIME_WINDOWS.AUDIO_UPLOAD.label}.`;

// An error we want to show to the user with a specific status and code.
class AudioTweetError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

// The email comes from the verified Firebase token. Without it we must not query,
// because an undefined email would match any user.
const findUserFromToken = async (req) => {
  const email = req.firebaseUser?.email;
  if (!email) return null;
  return User.findOne({ email }).collation({ locale: 'en', strength: 2 });
};

// Runs BEFORE multer, so a blocked request never makes the server receive up to 100 MB.
export const precheckAudioUpload = async (req, res, next) => {
  try {
    if (!isWithinTimeWindow(TIME_WINDOWS.AUDIO_UPLOAD)) {
      return res.status(403).json({ code: 'AUDIO_WINDOW_CLOSED', message: WINDOW_MESSAGE });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!(await hasUploadGrant(user._id))) {
      return res.status(403).json({
        code: 'AUDIO_OTP_REQUIRED',
        message: 'Verify the OTP sent to your email before uploading audio.',
      });
    }

    req.dbUser = user;
    return next();
  } catch (err) {
    console.error('precheckAudioUpload failed:', err);
    return res.status(500).json({ message: 'Could not start the audio upload' });
  }
};

// POST /api/v1/tweets/audio  (multipart: field "audio" + optional text field "content")
export const createAudioTweet = async (req, res) => {
  const filePath = req.file?.path;
  let slotReserved = false;
  let uploaded = null; // Cloudinary response, kept so we can delete it if something fails later
  const user = req.dbUser;

  try {
    if (!req.file) {
      throw new AudioTweetError(400, 'AUDIO_REQUIRED', 'Audio file is required.');
    }

    const caption = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (caption.length > MAX_CAPTION_LENGTH) {
      throw new AudioTweetError(
        400,
        'CAPTION_TOO_LONG',
        `Caption can be at most ${MAX_CAPTION_LENGTH} characters.`,
      );
    }

    // The window could have closed while the file was uploading to our server.
    if (!isWithinTimeWindow(TIME_WINDOWS.AUDIO_UPLOAD)) {
      throw new AudioTweetError(403, 'AUDIO_WINDOW_CLOSED', WINDOW_MESSAGE);
    }

    // Use up the OTP grant (atomic, single use).
    if (!(await consumeUploadGrant(user._id))) {
      throw new AudioTweetError(
        403,
        'AUDIO_OTP_REQUIRED',
        'Verify the OTP sent to your email before uploading audio.',
      );
    }

    // Reserve one slot of the plan limit, exactly like a text tweet.
    const slot = await reserveTweetSlot(user._id, () =>
      Tweet.countDocuments({ author: user._id }),
    );
    if (!slot.allowed) {
      throw new AudioTweetError(
        403,
        'TWEET_LIMIT_REACHED',
        `You have reached the ${slot.plan.name} plan limit of ${slot.plan.tweetLimit} tweet(s). Upgrade your plan to post more.`,
        { plan: slot.plan.id, limit: slot.plan.tweetLimit },
      );
    }
    slotReserved = true;

    try {
      uploaded = await uploadAudioToCloudinary(filePath);
    } catch (err) {
      console.error('Cloudinary audio upload failed:', err);
      throw new AudioTweetError(502, 'AUDIO_UPLOAD_FAILED', 'Audio upload failed. Please try again.');
    }

    // Trust Cloudinary's measured duration, not anything sent by the browser.
    const duration = Number(uploaded.duration);
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new AudioTweetError(
        422,
        'AUDIO_DURATION_UNKNOWN',
        'Could not read the audio duration. Please use a different audio file.',
      );
    }
    if (duration > AUDIO_LIMITS.MAX_DURATION_SECONDS) {
      throw new AudioTweetError(
        422,
        'AUDIO_TOO_LONG',
        'Audio is too long. The maximum duration is 5 minutes.',
      );
    }

    const tweet = new Tweet({
      author: user._id,
      content: caption,
      audio: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        duration,
        bytes: uploaded.bytes ?? req.file.size,
      },
    });
    await tweet.save();
    uploaded = null; // saved, so it must NOT be deleted in the cleanup below
    slotReserved = false; // the slot is now really used

    await tweet.populate('author', AUTHOR_FIELDS);
    return res.status(201).json(tweet);
  } catch (err) {
    // Undo everything that was done before the failure.
    if (uploaded) await deleteAudioFromCloudinary(uploaded.public_id);
    if (slotReserved) await releaseTweetSlot(user._id);

    if (err instanceof AudioTweetError) {
      return res.status(err.status).json({
        code: err.code,
        message: err.message,
        error: err.message, // same field the text-tweet errors use
        ...err.extra,
      });
    }
    console.error('createAudioTweet failed:', err);
    return res.status(500).json({ message: 'Could not post the audio tweet' });
  } finally {
    await removeTempFile(filePath);
  }
};
