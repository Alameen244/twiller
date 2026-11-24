import express from 'express';
import { getPlans, getMySubscription, createOrder, verifyPayment } from '../controllers/subscriptionController.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import {
  subscriptionReadLimiter,
  paymentWriteLimiter,
} from '../middlewares/rateLimiters/index.js';

const router = express.Router();

router.get('/plans', subscriptionReadLimiter, getPlans);
router.get('/me', verifyFirebaseToken, subscriptionReadLimiter, getMySubscription);
router.post('/order', verifyFirebaseToken, paymentWriteLimiter, createOrder);
router.post('/verify', verifyFirebaseToken, paymentWriteLimiter, verifyPayment);

export default router;
