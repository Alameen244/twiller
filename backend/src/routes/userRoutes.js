import express from 'express';
import { registerUser, getLoggedInUser, updateUser ,sendPhoneOtp , confirmPhoneOtp} from '../controllers/userController.js';
import { verifyFirebaseToken, optionalFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import { otpRateLimiter } from '../middlewares/otpRateLimiter.js';

const router = express.Router();

router.post('/register', optionalFirebaseToken, registerUser);
router.get('/loggedinuser', optionalFirebaseToken, getLoggedInUser);
router.patch('/userupdate/:email', verifyFirebaseToken, updateUser);
router.post('/phone/send-otp', verifyFirebaseToken, otpRateLimiter, sendPhoneOtp);
router.post('/phone/verify-otp', verifyFirebaseToken, confirmPhoneOtp);

export default router;
