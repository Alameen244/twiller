import mongoose from 'mongoose';
import Tweet from '../models/tweetModel.js';
import Comment from '../models/commentModel.js';
import User from '../models/userModel.js';
import TweetTranslation from '../models/tweetTranslationModel.js';
import CommentTranslation from '../models/commentTranslationModel.js';
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

// Shared cached batch-translation helper for both tweets and comments.
const translateEntityBatch = async ({
  req,
  res,
  rawIds,
  entityLabel,
  Model,
  CacheModel,
  cacheField,
}) => {
  try {
    if (!Array.isArray(rawIds) || rawIds.length === 0 || rawIds.length > MAX_IDS_PER_REQUEST) {
      return res
        .status(400)
        .json({ message: `Send between 1 and ${MAX_IDS_PER_REQUEST} ${entityLabel} ids.` });
    }
    const ids = [...new Set(rawIds)].filter(
      (id) => typeof id === 'string' && mongoose.isValidObjectId(id)
    );
    if (ids.length === 0) return res.status(400).json({ message: `No valid ${entityLabel} ids.` });

    const user = await findUserFromToken(req);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const language = user.language || DEFAULT_LANGUAGE;

    const docs = await Model.find({ _id: { $in: ids } }).select('content');
    const withText = docs.filter((d) => d.content && d.content.trim());

    const translations = {};
    const cached = await CacheModel.find({
      [cacheField]: { $in: withText.map((d) => d._id) },
      language,
    }).select(`${cacheField} text changed`);
    for (const row of cached) {
      translations[row[cacheField].toString()] = { text: row.text, translated: row.changed };
    }

    const missing = withText.filter((d) => !translations[d._id.toString()]);
    let partial = false;
    if (missing.length > 0) {
      try {
        const result = await translateBatch(
          missing.map((d) => ({ id: d._id.toString(), text: d.content })),
          LANGUAGES[language].name
        );
        const rows = [];
        for (const doc of missing) {
          const id = doc._id.toString();
          const text = result.get(id);
          if (!text) {
            partial = true;
            continue;
          }
          const changed = !same(text, doc.content);
          translations[id] = { text: changed ? text : doc.content, translated: changed };
          rows.push({
            updateOne: {
              filter: { [cacheField]: doc._id, language },
              update: {
                $setOnInsert: { text: translations[id].text, changed, createdAt: new Date() },
              },
              upsert: true,
            },
          });
        }
        if (rows.length > 0) {
          await CacheModel.bulkWrite(rows, { ordered: false }).catch((e) =>
            console.error('Saving translation cache failed:', e.message)
          );
        }
      } catch {
        partial = true;
      }
    }

    return res.status(200).json({ language, translations, partial });
  } catch (err) {
    console.error(`translate ${entityLabel}s failed:`, err);
    return res.status(200).json({ language: DEFAULT_LANGUAGE, translations: {}, partial: true });
  }
};

// POST /api/v1/tweets/translate  body: { tweetIds: [...] }
export const translateTweets = (req, res) =>
  translateEntityBatch({
    req,
    res,
    rawIds: req.body?.tweetIds,
    entityLabel: 'tweet',
    Model: Tweet,
    CacheModel: TweetTranslation,
    cacheField: 'tweet',
  });

// POST /api/v1/comments/translate  body: { commentIds: [...] }
export const translateComments = (req, res) =>
  translateEntityBatch({
    req,
    res,
    rawIds: req.body?.commentIds,
    entityLabel: 'comment',
    Model: Comment,
    CacheModel: CommentTranslation,
    cacheField: 'comment',
  });
