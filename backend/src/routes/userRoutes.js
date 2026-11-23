import express from 'express';
import { registerUser, getLoggedInUser, updateUser ,sendPhoneOtp , confirmPhoneOtp} from '../controllers/userController.js';
import { verifyFirebaseToken, optionalFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';

import {
  otpRateLimiter,
  languageOtpRequestLimiter,
  languageOtpVerifyLimiter,
} from '../middlewares/otpRateLimiter.js';
import { forgotPasswordRateLimiter } from '../middlewares/forgotPasswordRateLimiter.js';
import { forgotPasswordRequest, forgotPasswordReset } from '../controllers/passwordResetController.js';
import {
  startLoginSession,
  verifyLoginSession,
  resendLoginOtp,
  getLoginHistory,
} from '../controllers/loginSessionController.js';
import { loginSessionRateLimiter, loginOtpRateLimiter } from '../middlewares/loginRateLimiters.js';
import { requestLanguageOtp, verifyLanguageOtp } from '../controllers/languageController.js';

const router = express.Router();

router.post('/register', optionalFirebaseToken, registerUser);
router.get('/loggedinuser', optionalFirebaseToken, getLoggedInUser);
router.patch('/userupdate/:email', verifyFirebaseToken, updateUser);
router.post('/phone/send-otp', verifyFirebaseToken, otpRateLimiter, sendPhoneOtp);
router.post('/phone/verify-otp', verifyFirebaseToken, confirmPhoneOtp);

// Language change: OTP first (email for French, SMS for the rest), language saved only after verify
router.post('/language/request-otp', verifyFirebaseToken, languageOtpRequestLimiter, requestLanguageOtp);
router.post('/language/verify-otp', verifyFirebaseToken, languageOtpVerifyLimiter, verifyLanguageOtp);

// Forgot password (public, user is logged out)
router.post('/forgot-password/request', forgotPasswordRateLimiter, forgotPasswordRequest);
router.post('/forgot-password/reset', forgotPasswordReset);

// Login sessions: device info, Chrome email OTP, mobile time window, history
router.post('/login-session', verifyFirebaseToken, loginSessionRateLimiter, startLoginSession);
router.post('/login-session/verify', verifyFirebaseToken, verifyLoginSession);
router.post('/login-session/resend-otp', verifyFirebaseToken, loginOtpRateLimiter, resendLoginOtp);
router.get('/login-history', verifyFirebaseToken, getLoginHistory);
export default router;
