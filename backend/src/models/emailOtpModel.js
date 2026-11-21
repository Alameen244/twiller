import mongoose from 'mongoose';
import { OTP_PURPOSES } from '../constants/otpPurposes.js';

const EmailOtpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, enum: Object.values(OTP_PURPOSES), required: true },
  otpHash: { type: String, required: true }, // never store the plain OTP
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, default: Date.now }, // for the resend cooldown
  // TTL index: MongoDB deletes the document once this time passes.
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

// One active OTP per user per purpose; a new request overwrites the old one.
EmailOtpSchema.index({ user: 1, purpose: 1 }, { unique: true });

export default mongoose.model('EmailOtp', EmailOtpSchema);
