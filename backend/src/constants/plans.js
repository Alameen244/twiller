// Subscription plans. This is the single source of truth: the frontend never
// sends a price, the backend always reads it from here.
// Prices are in rupees. They are converted to paise only once, when the
// Razorpay order is created (Razorpay's API needs the smallest unit).

export const PLAN_IDS = {
  FREE: 'free',
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
};

// tweetLimit: null means unlimited.
// periodDays: how long a paid plan lasts. Free has no expiry (null).
export const PLANS = {
  [PLAN_IDS.FREE]: {
    id: PLAN_IDS.FREE,
    name: 'Free',
    priceInr: 0,
    tweetLimit: 1,
    periodDays: null,
  },
  [PLAN_IDS.BRONZE]: {
    id: PLAN_IDS.BRONZE,
    name: 'Bronze',
    priceInr: 100,
    tweetLimit: 3,
    periodDays: 30,
  },
  [PLAN_IDS.SILVER]: {
    id: PLAN_IDS.SILVER,
    name: 'Silver',
    priceInr: 300,
    tweetLimit: 5,
    periodDays: 30,
  },
  [PLAN_IDS.GOLD]: {
    id: PLAN_IDS.GOLD,
    name: 'Gold',
    priceInr: 1000,
    tweetLimit: null, // unlimited
    periodDays: 30,
  },
};

// Plans a user can actually buy (everything except Free).
export const PAID_PLAN_IDS = [PLAN_IDS.BRONZE, PLAN_IDS.SILVER, PLAN_IDS.GOLD];
