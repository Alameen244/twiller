import User from '../models/userModel.js';
import PasswordReset from '../models/passwordResetModel.js';
import { adminAuth } from '../config/firebaseAdmin.js';
import { verifyService } from '../config/twilio.js';
import { getISTDayKey } from '../utils/istDate.js';
import { createEmailOtp, verifyEmailOtp, OTP_TTL_MINUTES } from '../services/otpService.js';
import { sendPasswordResetOtpEmail } from '../services/emailService.js';

const E164 = /^\+[1-9]\d{7,14}$/;
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const DAILY_LIMIT_MESSAGE = 'You can use this option only one time per day.';

const OTP_FAIL_MESSAGES = {
  invalid: 'That code is incorrect.',
  expired: 'That code has expired. Request a new one.',
  too_many_attempts: 'Too many wrong attempts. Request a new code.',
};

// Finds the user from the chosen method. Returns { user } or { status, message }.
const resolveUser = async ({ method, email, phoneNumber }) => {
  if (method === 'email') {
    const value = String(email || '').trim();
    if (!EMAIL_FORMAT.test(value)) return { status: 400, message: 'Enter a valid email address' };
    // collation strength 2 = case-insensitive match
    const user = await User.findOne({ email: value }).collation({ locale: 'en', strength: 2 });
    if (!user) return { status: 404, message: 'No account found with this email' };
    return { user };
  }
  if (method === 'phone') {
    const value = String(phoneNumber || '').trim();
    if (!E164.test(value)) return { status: 400, message: 'Enter a valid phone number' };
    const user = await User.findOne({ phoneNumber: value, isPhoneVerified: true });
    if (!user) return { status: 404, message: 'No account found with this verified phone number' };
    return { user };
  }
  return { status: 400, message: 'Choose email or phone' };
};

// Passwords live in Firebase. Google-only accounts have no password to reset.
const getPasswordAccount = async (user) => {
  try {
    const fbUser = await adminAuth.getUserByEmail(user.email);
    const hasPassword = fbUser.providerData.some((p) => p.providerId === 'password');
    if (!hasPassword) {
      return {
        status: 400,
        code: 'GOOGLE_ONLY',
        message: 'This account uses Google sign-in. Please sign in with Google.',
      };
    }
    return { fbUser };
  } catch (err) {
    if (err.code === 'auth/user-not-found') return { status: 404, message: 'No account found' };
    throw err;
  }
};

export const forgotPasswordRequest = async (req, res) => {
  const body = req.body || {};
  try {
    const found = await resolveUser(body);
    if (found.status) return res.status(found.status).json({ message: found.message });
    const { user } = found;

    const account = await getPasswordAccount(user);
    if (account.status)
      return res.status(account.status).json({ code: account.code, message: account.message });

    // Read-only check. The limit is only consumed after a successful reset. 
    if (await PasswordReset.exists({ user: user._id, dayKey: getISTDayKey() }))
      return res.status(429).json({ code: 'DAILY_LIMIT', message: DAILY_LIMIT_MESSAGE });

    if (body.method === 'email') {
      const otp = await createEmailOtp(user._id);
      await sendPasswordResetOtpEmail({ to: user.email, otp, validMinutes: OTP_TTL_MINUTES });
    } else {
      await verifyService.verifications.create({ to: user.phoneNumber, channel: 'sms' });
    }
    return res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    if (Number(err.code) === 21608) {
      return res.status(403).json({
        code: 'TWILIO_UNVERIFIED_NUMBER',
        message:
          'This phone number is not verified in the Twilio Trial account. Please use a verified demo number.',
      });
    }
    if (err.message === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({ message: 'Could not send the email. Try again later.' });
    }
    const status = err.status === 429 ? 429 : 500;
    if (status === 500) console.error('forgotPasswordRequest failed:', err);
    return res.status(status).json({
      message: status === 429 ? 'Too many attempts. Try again later.' : 'Could not send OTP',
    });
  }
};

export const forgotPasswordReset = async (req, res) => {
  const body = req.body || {};
  try {
    const { method, code, newPassword } = body;

    // Validate the password first: Twilio uses up a code once it is approved,
    // so a bad password must not be discovered after the OTP check.
    if (
      typeof newPassword !== 'string' ||
      newPassword.length < MIN_PASSWORD_LENGTH ||
      newPassword.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        message: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
      });
    }
    if (!/^\d{6}$/.test(code || '')) {
      return res.status(400).json({ message: 'Enter the 6-digit code' });
    }

    const found = await resolveUser(body);
    if (found.status) return res.status(found.status).json({ message: found.message });
    const { user } = found;

    const account = await getPasswordAccount(user);
    if (account.status)
      return res.status(account.status).json({ code: account.code, message: account.message });

    const dayKey = getISTDayKey();
    if (await PasswordReset.exists({ user: user._id, dayKey }))
      return res.status(429).json({ code: 'DAILY_LIMIT', message: DAILY_LIMIT_MESSAGE });

    // Verify the OTP
    if (method === 'email') {
      const result = await verifyEmailOtp(user._id, code);
      if (!result.ok) return res.status(400).json({ message: OTP_FAIL_MESSAGES[result.reason] });
    } else {
      const check = await verifyService.verificationChecks.create({ to: user.phoneNumber, code });
      if (check.status !== 'approved')
        return res.status(400).json({ message: 'That code is incorrect.' });
    }

    // Claim today's slot atomically. The unique index {user, dayKey} rejects a second claim.
    try {
      await PasswordReset.create({ user: user._id, dayKey, method });
    } catch (err) {
      if (err.code === 11000)
        return res.status(429).json({ code: 'DAILY_LIMIT', message: DAILY_LIMIT_MESSAGE });
      throw err;
    }

    // Set the new password in Firebase. If this fails, give the slot back.
    try {
      await adminAuth.updateUser(account.fbUser.uid, { password: newPassword });
    } catch (err) {
      await PasswordReset.deleteOne({ user: user._id, dayKey });
      throw err;
    }

    // Sign out old sessions. The password is already changed, so a failure here is only logged.
    try {
      await adminAuth.revokeRefreshTokens(account.fbUser.uid);
    } catch (err) {
      console.error('revokeRefreshTokens failed:', err);
    }

    return res.status(200).json({
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (err) {
    // Twilio returns 404 when the code expired or was already used
    if (body.method === 'phone' && err.status === 404) {
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    }
    if (err.code === 'auth/invalid-password') {
      return res.status(400).json({ message: 'Password is too weak. Use a longer password.' });
    }
    console.error('forgotPasswordReset failed:', err);
    return res.status(500).json({ message: 'Could not reset password' });
  }
};
