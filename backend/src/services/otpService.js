import 'dotenv/config';
import crypto from 'crypto';
import EmailOtp from '../models/emailOtpModel.js';
import { OTP_PURPOSES } from '../constants/otpPurposes.js';

const { OTP_HMAC_SECRET } = process.env;
if (!OTP_HMAC_SECRET) {
  throw new Error('Missing OTP_HMAC_SECRET in backend .env');
}

export const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

// The OTP is never stored in plain text, only this keyed hash.
// The purpose is part of the hash, so a code for one purpose can't be used for another.
const hashOtp = (userId, purpose, otp) =>
  crypto.createHmac('sha256', OTP_HMAC_SECRET).update(`${userId}:${purpose}:${otp}`).digest('hex');

// Creates (or replaces) the user's OTP for this purpose and returns the plain 6-digit code to email.
export const createEmailOtp = async (userId, purpose = OTP_PURPOSES.PASSWORD_RESET) => {
  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await EmailOtp.findOneAndUpdate(
    { user: userId, purpose },
    {
      otpHash: hashOtp(userId, purpose, otp),
      attempts: 0,
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
    { upsert: true, setDefaultsOnInsert: true },
  );
  return otp;
};

// Returns { ok: true } or { ok: false, reason: 'invalid' | 'expired' | 'too_many_attempts' }.
export const verifyEmailOtp = async (userId, otp, purpose = OTP_PURPOSES.PASSWORD_RESET) => {
  // Count the attempt first, atomically, so parallel guesses can't beat the limit.
  const record = await EmailOtp.findOneAndUpdate(
    { user: userId, purpose, attempts: { $lt: MAX_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { new: true },
  );

  if (!record) {
    const exists = await EmailOtp.exists({ user: userId, purpose });
    return { ok: false, reason: exists ? 'too_many_attempts' : 'expired' };
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    return { ok: false, reason: 'expired' };
  }

  const expected = Buffer.from(record.otpHash, 'hex');
  const actual = Buffer.from(hashOtp(userId, purpose, otp), 'hex');
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  if (!matches) return { ok: false, reason: 'invalid' };

  await record.deleteOne(); // single use
  return { ok: true };
};
