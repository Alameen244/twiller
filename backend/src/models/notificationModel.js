import mongoose from "mongoose";
import { NOTIFICATION_TTL_SECONDS } from "../constants/notificationKeywords.js";

const NotificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tweet: { type: mongoose.Schema.Types.ObjectId, ref: "Tweet", required: true },
  keyword: { type: String, required: true }, // "cricket" or "science"
  content: { type: String, required: true }, // full tweet text snapshot
  authorName: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Notifications list for a user, newest first.
NotificationSchema.index({ user: 1, createdAt: -1 });
// One notification per user per tweet (prevents duplicates).
NotificationSchema.index({ user: 1, tweet: 1 }, { unique: true });
// Fast cleanup when a tweet is deleted.
NotificationSchema.index({ tweet: 1 });
// Auto-delete after 30 days.
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_TTL_SECONDS });

export default mongoose.model("Notification", NotificationSchema);  
