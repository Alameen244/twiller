import mongoose from "mongoose";

// One cached translation per tweet per language. Tweets can't be edited, so it never goes stale.
const TweetTranslationSchema = new mongoose.Schema({
  tweet: { type: mongoose.Schema.Types.ObjectId, ref: "Tweet", required: true },
  language: { type: String, required: true },
  text: { type: String, required: true },
  changed: { type: Boolean, default: true }, // false = the tweet was already in this language
  // Cache rows of deleted tweets clean themselves up after 30 days.
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

TweetTranslationSchema.index({ tweet: 1, language: 1 }, { unique: true });

export default mongoose.model("TweetTranslation", TweetTranslationSchema);
