import Subscription from '../models/subscriptionModel.js';
import { PLANS, PLAN_IDS } from '../constants/plans.js';

// Finds the user's subscription, creating a Free one the first time.
// getInitialCount (optional async function) is only called when the document
// is created. It lets existing users start with their current tweet count, so
// someone who already has more tweets than the Free limit cannot post more
// until they upgrade. Their old tweets are never touched.
// It also falls back to Free if a paid plan has expired.
const ensureSubscription = async (userId, getInitialCount) => {
  let sub = await Subscription.findOne({ user: userId });

  if (!sub) {
    const initial = getInitialCount ? await getInitialCount() : 0;
    try {
      sub = await Subscription.findOneAndUpdate(
        { user: userId },
        {
          $setOnInsert: {
            user: userId,
            plan: PLAN_IDS.FREE,
            tweetsUsed: initial,
            startedAt: new Date(),
            expiresAt: null,
          },
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      // Two requests created it at the same moment: just read the winner.
      if (error.code !== 11000) throw error;
      sub = await Subscription.findOne({ user: userId });
    }
  }

  // Paid plan expired -> back to Free. tweetsUsed is kept as it is, so the
  // Free limit (1 tweet) still counts tweets posted during the paid period.
  if (sub.plan !== PLAN_IDS.FREE && sub.expiresAt && sub.expiresAt <= new Date()) {
    const downgraded = await Subscription.findOneAndUpdate(
      { user: userId, plan: { $ne: PLAN_IDS.FREE }, expiresAt: { $lte: new Date() } },
      { $set: { plan: PLAN_IDS.FREE, expiresAt: null } },
      { new: true }
    );
    sub = downgraded || (await Subscription.findOne({ user: userId }));
  }

  return sub;
};

// Tries to use one tweet from the user's quota. This is ATOMIC: the counter
// only goes up if it is still below the limit, so two quick requests cannot
//  slip through. Call it BEFORE saving the tweet.
// Returns { allowed, plan, tweetsUsed }.
export const reserveTweetSlot = async (userId, getInitialCount) => {
  const sub = await ensureSubscription(userId, getInitialCount);
  const plan = PLANS[sub.plan];

  const filter = { user: userId };
  if (plan.tweetLimit !== null) {
    filter.tweetsUsed = { $lt: plan.tweetLimit };
  }

  const updated = await Subscription.findOneAndUpdate(
    filter,
    { $inc: { tweetsUsed: 1 } },
    { new: true }
  );

  if (!updated) {
    return { allowed: false, plan, tweetsUsed: sub.tweetsUsed };
  }
  return { allowed: true, plan, tweetsUsed: updated.tweetsUsed };
};

// Gives the slot back. Only for when saving the tweet FAILED after
// reserveTweetSlot succeeded. Never call it when a user deletes a tweet.
export const releaseTweetSlot = async (userId) => {
  await Subscription.updateOne(
    { user: userId, tweetsUsed: { $gt: 0 } },
    { $inc: { tweetsUsed: -1 } }
  );
};

// Plain object for the frontend (plans page, settings, tweet composer).
export const getSubscriptionSummary = async (userId, getInitialCount) => {
  const sub = await ensureSubscription(userId, getInitialCount);
  const plan = PLANS[sub.plan];
  const unlimited = plan.tweetLimit === null;

  return {
    plan: plan.id,
    planName: plan.name,
    tweetLimit: plan.tweetLimit, // null = unlimited
    tweetsUsed: sub.tweetsUsed,
    tweetsRemaining: unlimited ? null : Math.max(plan.tweetLimit - sub.tweetsUsed, 0),
    startedAt: sub.startedAt,
    expiresAt: sub.expiresAt,
  };
};
