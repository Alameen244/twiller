import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayKey: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ }, // IST day, e.g. 2026-11-14
  method: { type: String, enum: ['email', 'phone'], required: true },
  // Keep 30 days of history, then MongoDB deletes the document automatically.
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

// This index is what makes "once per day" atomic: a second insert for the
// same user on the same IST day fails with duplicate key error 11000.
PasswordResetSchema.index({ user: 1, dayKey: 1 }, { unique: true });

export default mongoose.model('PasswordReset', PasswordResetSchema);
