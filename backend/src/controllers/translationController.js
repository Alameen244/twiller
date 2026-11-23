import mongoose from 'mongoose';
import Tweet from '../models/tweetModel.js';
import User from '../models/userModel.js';
import TweetTranslation from '../models/tweetTranslationModel.js';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages.js';
import { translateBatch } from '../services/translationService.js';

const MAX_IDS_PER_REQUEST = 25;

const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// The email comes from the verified Firebase token. Without it we must not query.
const findUserFromToken = async (req) => {
  const email = req.firebaseUser?.email;
  if (!email) return null;
  return User.findOne({ email }).collation({ locale: 'en', strength: 2 });
};

// Body: { tweetIds: [...] }. The target language is the one saved on the user (set only after OTP),
// never a value from the request. Returns { language, translations: { [id]: { text, translated } }, partial }.
// If Gemini is down or out of quota, `partial` is true and the page just shows the original text.
export const translateTweets = async (req, res) => {
  try {
    const { tweetIds } = req.body || {};
    if (!Array.isArray(tweetIds) || tweetIds.length === 0 || tweetIds.length > MAX_IDS_PER_REQUEST) {
      return res.status(400).json({ message: `Send between 1 and ${MAX_IDS_PER_REQUEST} tweet ids.` });
    }
    const ids = [...new Set(tweetIds)].filter(
      (id) => typeof id === 'string' && mongoose.isValidObjectId(id)
    );
    if (ids.length === 0) return res.status(400).json({ message: 'No valid tweet ids.' });

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const language = user.language || DEFAULT_LANGUAGE;

    // Tweet text, or the caption of an audio tweet (both live in `content`).
    const tweets = await Tweet.find({ _id: { $in: ids } }).select('content');
    const withText = tweets.filter((t) => t.content && t.content.trim());

    const translations = {};
    const cached = await TweetTranslation.find({
      tweet: { $in: withText.map((t) => t._id) },
      language,
    }).select('tweet text changed');
    for (const row of cached) {
      translations[row.tweet.toString()] = { text: row.text, translated: row.changed };
    }

    // One Gemini call for everything that is not cached yet.
    const missing = withText.filter((t) => !translations[t._id.toString()]);
    let partial = false;
    if (missing.length > 0) {
      try {
        const result = await translateBatch(
          missing.map((t) => ({ id: t._id.toString(), text: t.content })),
          LANGUAGES[language].name
        );
        const rows = [];
        for (const t of missing) {
          const id = t._id.toString();
          const text = result.get(id);
          if (!text) {
            partial = true; // Gemini skipped this one: it shows in the original language
            continue;
          }
          const changed = !same(text, t.content);
          translations[id] = { text: changed ? text : t.content, translated: changed };
          rows.push({
            updateOne: {
              filter: { tweet: t._id, language },
              update: { $setOnInsert: { text: translations[id].text, changed, createdAt: new Date() } },
              upsert: true,
            },
          });
        }
        if (rows.length > 0) {
          await TweetTranslation.bulkWrite(rows, { ordered: false }).catch((e) =>
            console.error('Saving translation cache failed:', e.message)
          );
        }
      } catch {
        partial = true; // Gemini down, rate limited, or out of quota: fail safe
      }
    }

    return res.status(200).json({ language, translations, partial });
  } catch (err) {
    console.error('translateTweets failed:', err);
    return res.status(200).json({ language: DEFAULT_LANGUAGE, translations: {}, partial: true });
  }
};
