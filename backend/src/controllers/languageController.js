import User from '../models/userModel.js';
import { verifyService } from '../config/twilio.js';
import { OTP_PURPOSES } from '../constants/otpPurposes.js';
import {
  OTP_CHANNELS,
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  getOtpChannelForLanguage,
} from '../constants/languages.js';
import { createEmailOtp, verifyEmailOtp, OTP_TTL_MINUTES } from '../services/otpService.js';
import { sendOtpEmail } from '../services/emailService.js';

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

// "+91******10"
const maskPhone = (phone) => `${phone.slice(0, 3)}${'*'.repeat(Math.max(phone.length - 5, 1))}${phone.slice(-2)}`;

const hasVerifiedPhone = (user) => Boolean(user.isPhoneVerified && user.phoneNumber);

const PHONE_REQUIRED = {
  code: 'PHONE_NOT_VERIFIED',
  message: 'Verify your mobile number in Settings > Your account before changing the language.',
};

// Step 1: send the OTP. French -> email OTP, every other language -> SMS to the verified phone.
export const requestLanguageOtp = async (req, res) => {
  try {
    const { language } = req.body || {};
    if (!isSupportedLanguage(language)) {
      return res.status(400).json({ code: 'INVALID_LANGUAGE', message: 'Unsupported language' });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Picking the current language does nothing and sends no OTP.
    if ((user.language || DEFAULT_LANGUAGE) === language) {
      return res.status(200).json({ changed: false, language });
    }

    if (getOtpChannelForLanguage(language) === OTP_CHANNELS.EMAIL) {
      const otp = await createEmailOtp(user._id, OTP_PURPOSES.LANGUAGE_CHANGE);
      await sendOtpEmail({
        to: user.email,
        otp,
        validMinutes: OTP_TTL_MINUTES,
        purpose: OTP_PURPOSES.LANGUAGE_CHANGE,
      });
      return res.status(200).json({
        message: 'OTP sent',
        channel: OTP_CHANNELS.EMAIL,
        maskedTarget: maskEmail(user.email),
        validMinutes: OTP_TTL_MINUTES,
      });
    }

    if (!hasVerifiedPhone(user)) return res.status(400).json(PHONE_REQUIRED);

    await verifyService.verifications.create({ to: user.phoneNumber, channel: 'sms' });
    return res.status(200).json({
      message: 'OTP sent',
      channel: OTP_CHANNELS.SMS,
      maskedTarget: maskPhone(user.phoneNumber),
    });
  } catch (err) {
    if (err.message === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({ message: 'Could not send the email. Try again later.' });
    }
    if (Number(err.code) === 21608) {
      return res.status(403).json({
        code: 'TWILIO_UNVERIFIED_NUMBER',
        message:
          'This phone number is not verified in the Twilio Trial account. Please use a verified demo number.',
      });
    }
    if (err.status === 429) {
      return res.status(429).json({ message: 'Too many attempts. Try again later.' });
    }
    console.error('requestLanguageOtp failed:', err);
    return res.status(500).json({ message: 'Could not send OTP' });
  }
};

// Step 2: check the OTP. The language is saved ONLY here, after verification succeeds.
export const verifyLanguageOtp = async (req, res) => {
  try {
    const { language, code } = req.body || {};
    if (!isSupportedLanguage(language)) {
      return res.status(400).json({ code: 'INVALID_LANGUAGE', message: 'Unsupported language' });
    }
    if (!/^\d{6}$/.test(code || '')) {
      return res.status(400).json({ message: 'Enter the 6-digit code' });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if ((user.language || DEFAULT_LANGUAGE) === language) {
      return res.status(200).json({ changed: false, language });
    }

    if (getOtpChannelForLanguage(language) === OTP_CHANNELS.EMAIL) {
      const result = await verifyEmailOtp(user._id, code, OTP_PURPOSES.LANGUAGE_CHANGE);
      if (!result.ok) return res.status(400).json({ message: OTP_FAIL_MESSAGES[result.reason] });
    } else {
      if (!hasVerifiedPhone(user)) return res.status(400).json(PHONE_REQUIRED);
      const check = await verifyService.verificationChecks.create({ to: user.phoneNumber, code });
      if (check.status !== 'approved') {
        return res.status(400).json({ message: OTP_FAIL_MESSAGES.invalid });
      }
    }

    await User.updateOne({ _id: user._id }, { $set: { language } });
    return res.status(200).json({ message: 'Language updated', changed: true, language });
  } catch (err) {
    // Twilio returns 404 when the code expired or was already used
    if (err.status === 404) {
      return res.status(400).json({ message: OTP_FAIL_MESSAGES.expired });
    }
    if (Number(err.code) === 60202) {
      return res.status(400).json({ message: OTP_FAIL_MESSAGES.too_many_attempts });
    }
    console.error('verifyLanguageOtp failed:', err);
    return res.status(500).json({ message: 'Could not verify the code' });
  }
};
