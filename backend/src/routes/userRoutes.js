import express from 'express';
import { registerUser, getLoggedInUser, updateUser ,sendPhoneOtp , confirmPhoneOtp} from '../controllers/userController.js';
import { verifyFirebaseToken, optionalFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';

import { forgotPasswordRequest, forgotPasswordReset } from '../controllers/passwordResetController.js';
import {
  startLoginSession,
  verifyLoginSession,
  resendLoginOtp,
  getLoginHistory,
} from '../controllers/loginSessionController.js';
import {
  emailOtpRateLimiter,
  mobileOtpRateLimiter,
  languageOtpRequestLimiter,
  languageOtpVerifyLimiter,
  forgotPasswordOtpLimiter,
  loginSessionRateLimiter,
  registerLimiter,
  userReadLimiter,
  userWriteLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
} from '../middlewares/rateLimiters/index.js';
import { requestLanguageOtp, verifyLanguageOtp } from '../controllers/languageController.js';

const router = express.Router();

router.post('/register', registerLimiter, optionalFirebaseToken, registerUser);
router.get('/loggedinuser', userReadLimiter, optionalFirebaseToken, getLoggedInUser);
router.patch('/userupdate/:email', verifyFirebaseToken, userWriteLimiter, updateUser);
router.post('/phone/send-otp', verifyFirebaseToken, mobileOtpRateLimiter, sendPhoneOtp);
router.post('/phone/verify-otp', verifyFirebaseToken, otpVerifyLimiter, confirmPhoneOtp);

// Language change: English needs no OTP, French uses email OTP, others use mobile SMS OTP
router.post('/language/request-otp', verifyFirebaseToken, languageOtpRequestLimiter, requestLanguageOtp);
router.post('/language/verify-otp', verifyFirebaseToken, languageOtpVerifyLimiter, verifyLanguageOtp);

// Forgot password (public, user is logged out)
router.post('/forgot-password/request', forgotPasswordOtpLimiter, forgotPasswordRequest);
router.post('/forgot-password/reset', passwordResetLimiter, forgotPasswordReset);

// Login sessions: device info, Chrome email OTP, mobile time window, history
router.post('/login-session', verifyFirebaseToken, loginSessionRateLimiter, startLoginSession);
router.post('/login-session/verify', verifyFirebaseToken, otpVerifyLimiter, verifyLoginSession);
router.post('/login-session/resend-otp', verifyFirebaseToken, emailOtpRateLimiter, resendLoginOtp);
router.get('/login-history', verifyFirebaseToken, userReadLimiter, getLoginHistory);
export default router;
