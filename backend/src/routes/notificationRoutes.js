import express from 'express';
import { verifyFirebaseToken } from '../middlewares/firebaseAuth.middleware.js';
import { notificationReadLimiter, notificationWriteLimiter } from '../middlewares/rateLimiters/notificationRateLimiters.js';
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  updateNotificationPreference,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', verifyFirebaseToken, notificationReadLimiter, getNotifications);
router.get('/unread-count', verifyFirebaseToken, notificationReadLimiter, getUnreadCount);
router.patch('/read-all', verifyFirebaseToken, notificationWriteLimiter, markAllNotificationsRead);
router.patch('/preference', verifyFirebaseToken, notificationWriteLimiter, updateNotificationPreference);

export default router;
