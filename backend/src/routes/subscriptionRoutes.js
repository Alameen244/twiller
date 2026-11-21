import express from 'express';
import { getPlans, getMySubscription, createOrder, verifyPayment } from '../controllers/subscriptionController.js';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';

const router = express.Router();

router.get('/plans', getPlans);
router.get('/me', verifyFirebaseToken, getMySubscription);
router.post('/order', verifyFirebaseToken, createOrder);
router.post('/verify', verifyFirebaseToken, verifyPayment);

export default router;
