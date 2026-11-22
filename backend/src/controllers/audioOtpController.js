import User from '../models/userModel.js';
import { isWithinTimeWindow } from '../utils/timeWindow.js';
import { TIME_WINDOWS } from '../constants/timeWindows.js';
import { OTP_PURPOSES } from '../constants/otpPurposes.js';
import { AUDIO_LIMITS } from '../constants/audioLimits.js';
import { createEmailOtp, verifyEmailOtp, OTP_TTL_MINUTES } from '../services/otpService.js';
import { sendOtpEmail } from '../services/emailService.js';
import { createUploadGrant } from '../services/audioGrantService.js';

const WINDOW_MESSAGE = `Audio tweets can be posted only between ${TIME_WINDOWS.AUDIO_UPLOAD.label}.`;

const OTP_FAIL_MESSAGES = {
  invalid: 'That code is incorrect.',
  expired: 'That code has expired. Request a new one.',
  too_many_attempts: 'Too many wrong attempts. Request a new code.',
};

// The email comes from the verified Firebase token. Without it we must not query,
// because an undefined email would match any user.
const findUserFromToken = async (req) => {
  const email = req.firebaseUser?.email;
  if (!email) return null;
  return User.findOne({ email }).collation({ locale: 'en', strength: 2 });
};

// "ab****@gmail.com"
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`;
};

// Step 1 of an audio upload: email an OTP to the registered address.
export const requestAudioOtp = async (req, res) => {
  try {
    if (!isWithinTimeWindow(TIME_WINDOWS.AUDIO_UPLOAD)) {
      return res.status(403).json({ code: 'AUDIO_WINDOW_CLOSED', message: WINDOW_MESSAGE });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = await createEmailOtp(user._id, OTP_PURPOSES.AUDIO_UPLOAD);
    await sendOtpEmail({
      to: user.email,
      otp,
      validMinutes: OTP_TTL_MINUTES,
      purpose: OTP_PURPOSES.AUDIO_UPLOAD,
    });

    return res.status(200).json({
      message: 'OTP sent',
      maskedEmail: maskEmail(user.email),
      validMinutes: OTP_TTL_MINUTES,
    });
  } catch (err) {
    if (err.message === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({ message: 'Could not send the email. Try again later.' });
    }
    console.error('requestAudioOtp failed:', err);
    return res.status(500).json({ message: 'Could not send OTP' });
  }
};

// Step 2: check the OTP. On success the user gets a single-use upload grant.
export const verifyAudioOtp = async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!/^\d{6}$/.test(code || '')) {
      return res.status(400).json({ message: 'Enter the 6-digit code' });
    }

    if (!isWithinTimeWindow(TIME_WINDOWS.AUDIO_UPLOAD)) {
      return res.status(403).json({ code: 'AUDIO_WINDOW_CLOSED', message: WINDOW_MESSAGE });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = await verifyEmailOtp(user._id, code, OTP_PURPOSES.AUDIO_UPLOAD);
    if (!result.ok) return res.status(400).json({ message: OTP_FAIL_MESSAGES[result.reason] });

    await createUploadGrant(user._id);
    return res.status(200).json({
      message: 'Verified. You can upload your audio tweet now.',
      grantValidMinutes: AUDIO_LIMITS.UPLOAD_GRANT_VALID_MINUTES,
    });
  } catch (err) {
    console.error('verifyAudioOtp failed:', err);
    return res.status(500).json({ message: 'Could not verify the code' });
  }
};
