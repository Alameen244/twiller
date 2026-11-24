import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';
import { findNotificationKeyword } from '../constants/notificationKeywords.js';

// Creates one notification for every user who has notifications enabled
// (except the tweet's author) when the tweet text contains a keyword.
// Never throws: a notification problem must not break posting a tweet.
export const notifyKeywordTweet = async (tweet, author) => {
  try {
    const keyword = findNotificationKeyword(tweet.content);
    if (!keyword) return 0;

    const recipients = await User.find({
      notificationsEnabled: true,
      _id: { $ne: author._id },
    })
      .select('_id')
      .lean();
    if (recipients.length === 0) return 0;

    const authorName = author.displayName || author.username;
    const docs = recipients.map((recipient) => ({
      user: recipient._id,
      tweet: tweet._id,
      keyword,
      content: tweet.content, // full text snapshot
      authorName,
    }));

    await Notification.insertMany(docs, { ordered: false });
    return docs.length;
  } catch (error) {
    console.error('notifyKeywordTweet failed:', error);
    return 0;
  }
};

// Removes the notifications of a deleted tweet. Never throws.
export const deleteNotificationsForTweet = async (tweetId) => {
  try {
    await Notification.deleteMany({ tweet: tweetId });
  } catch (error) {
    console.error('deleteNotificationsForTweet failed:', error);
  }
};
