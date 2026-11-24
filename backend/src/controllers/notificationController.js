import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// The email comes from the verified Firebase token. Without it we must not query,
// because an undefined email would match any user.
const findUserFromToken = async (req) => {
  const email = req.firebaseUser?.email;
  if (!email) return null;
  return User.findOne({ email })
    .collation({ locale: 'en', strength: 2 })
    .select('_id notificationsEnabled');
};

// GET /api/v1/notifications?limit=50  -> newest first, plus unread count and the saved preference
export const getNotifications = async (req, res) => {
  try {
    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const parsed = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), MAX_LIMIT) : DEFAULT_LIMIT;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('tweet keyword content authorName read createdAt')
        .lean(),
      Notification.countDocuments({ user: user._id, read: false }),
    ]);

    return res.status(200).json({
      notifications,
      unreadCount,
      notificationsEnabled: user.notificationsEnabled === true,
    });
  } catch (err) {
    console.error('getNotifications failed:', err);
    return res.status(500).json({ message: 'Could not load notifications' });
  }
};

// GET /api/v1/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const unreadCount = await Notification.countDocuments({ user: user._id, read: false });
    return res.status(200).json({
      unreadCount,
      notificationsEnabled: user.notificationsEnabled === true,
    });
  } catch (err) {
    console.error('getUnreadCount failed:', err);
    return res.status(500).json({ message: 'Could not load the unread count' });
  }
};

// PATCH /api/v1/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const result = await Notification.updateMany(
      { user: user._id, read: false },
      { $set: { read: true } }
    );
    return res.status(200).json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error('markAllNotificationsRead failed:', err);
    return res.status(500).json({ message: 'Could not mark notifications as read' });
  }
};

// PATCH /api/v1/notifications/preference   body: { "enabled": true | false }
export const updateNotificationPreference = async (req, res) => {
  try {
    const { enabled } = req.body || {};
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: '"enabled" must be true or false' });
    }

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.updateOne({ _id: user._id }, { $set: { notificationsEnabled: enabled } });
    return res.status(200).json({ message: 'Notification preference updated', notificationsEnabled: enabled });
  } catch (err) {
    console.error('updateNotificationPreference failed:', err);
    return res.status(500).json({ message: 'Could not update the preference' });
  }
};
