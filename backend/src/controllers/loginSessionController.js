import mongoose from 'mongoose';
import User from '../models/userModel.js';
import LoginHistory from '../models/loginHistoryModel.js';
import { getDeviceInfo } from '../utils/deviceInfo.js';
import { isWithinTimeWindow } from '../utils/timeWindow.js';
import { TIME_WINDOWS } from '../constants/timeWindows.js';
import { OTP_PURPOSES } from '../constants/otpPurposes.js';
import { createEmailOtp, verifyEmailOtp, OTP_TTL_MINUTES } from '../services/otpService.js';
import { sendOtpEmail } from '../services/emailService.js';

const HISTORY_LIMIT = 50;
const MOBILE_WINDOW_MESSAGE = `Mobile login is allowed only between ${TIME_WINDOWS.MOBILE_LOGIN.label}.`;

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

const sendLoginOtp = async (user) => {
  const otp = await createEmailOtp(user._id, OTP_PURPOSES.LOGIN);
  await sendOtpEmail({
    to: user.email,
    otp,
    validMinutes: OTP_TTL_MINUTES,
    purpose: OTP_PURPOSES.LOGIN,
  });
};

// The frontend calls this right after Firebase sign-in succeeds.
export const startLoginSession = async (req, res) => {
  try {
    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { browserFamily, ...info } = getDeviceInfo(
      req,
      req.body?.screenWidth,
      req.body?.isBrave === true,
      req.body?.deviceType,
    );

    // Rule: mobile logins are allowed only between 10:00 AM and 1:00 PM IST.
    if (info.deviceType === 'mobile' && !isWithinTimeWindow(TIME_WINDOWS.MOBILE_LOGIN)) {
      await LoginHistory.create({
        user: user._id,
        ...info,
        status: 'blocked',
        blockReason: `Mobile login outside ${TIME_WINDOWS.MOBILE_LOGIN.label}`,
      });
      return res.status(403).json({ code: 'MOBILE_LOGIN_WINDOW', message: MOBILE_WINDOW_MESSAGE });
    }

    // Rule: Chrome needs an email OTP, Microsoft browsers (and others) log in directly.
    const needsOtp = browserFamily === 'chrome';
    const session = await LoginHistory.create({
      user: user._id,
      ...info,
      status: needsOtp ? 'pending' : 'success',
    });

    if (!needsOtp) return res.status(201).json({ requiresOtp: false, sessionId: session._id });

    try {
      await sendLoginOtp(user);
    } catch (err) {
      await session.deleteOne(); // no OTP went out, so there is no login attempt to keep
      throw err;
    }
    return res
      .status(201)
      .json({ requiresOtp: true, sessionId: session._id, maskedEmail: maskEmail(user.email) });
  } catch (err) {
    if (err.message === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({ message: 'Could not send the email. Try again later.' });
    }
    console.error('startLoginSession failed:', err);
    return res.status(500).json({ message: 'Could not start login session' });
  }
};

export const verifyLoginSession = async (req, res) => {
  try {
    const { sessionId, code } = req.body || {};
    if (!mongoose.isValidObjectId(sessionId) || !/^\d{6}$/.test(code || '')) {
      return res.status(400).json({ message: 'Enter the 6-digit code' });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const session = await LoginHistory.findOne({
      _id: sessionId,
      user: user._id,
      status: 'pending',
    });
    if (!session) return res.status(404).json({ message: 'Login session not found' });

    const result = await verifyEmailOtp(user._id, code, OTP_PURPOSES.LOGIN);
    if (!result.ok) return res.status(400).json({ message: OTP_FAIL_MESSAGES[result.reason] });

    session.status = 'success';
    await session.save();
    return res.status(200).json({ message: 'Login verified' });
  } catch (err) {
    console.error('verifyLoginSession failed:', err);
    return res.status(500).json({ message: 'Could not verify login' });
  }
};

export const resendLoginOtp = async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const session = await LoginHistory.exists({
      _id: sessionId,
      user: user._id,
      status: 'pending',
    });
    if (!session) return res.status(404).json({ message: 'Login session not found' });

    await sendLoginOtp(user);
    return res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    if (err.message === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({ message: 'Could not send the email. Try again later.' });
    }
    console.error('resendLoginOtp failed:', err);
    return res.status(500).json({ message: 'Could not send OTP' });
  }
};

// Only the owner can read this (IP addresses are private).
export const getLoginHistory = async (req, res) => {
  try {
    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await LoginHistory.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .select('-user -__v')
      .lean();
    return res.status(200).json(history);
  } catch (err) {
    console.error('getLoginHistory failed:', err);
    return res.status(500).json({ message: 'Could not load login history' });
  }
};
