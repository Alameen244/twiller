import mongoose from 'mongoose';
import { PLAN_IDS } from '../constants/plans.js';

const SubscriptionSchema = new mongoose.Schema({
  // One subscription document per user.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: Object.values(PLAN_IDS), default: PLAN_IDS.FREE },
  // Counter instead of counting tweets, so deleting a tweet cannot give quota back.
  tweetsUsed: { type: Number, default: 0, min: 0 },
  startedAt: { type: Date, default: Date.now },
  // null for the Free plan. Paid plans fall back to Free once this passes.
  // (No TTL index here: the document must stay, only the plan changes.)
  expiresAt: { type: Date, default: null },
});

export default mongoose.model('Subscription', SubscriptionSchema);
