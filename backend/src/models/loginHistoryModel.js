import mongoose from 'mongoose';

const LoginHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    deviceType: { type: String, enum: ['desktop', 'laptop', 'mobile'], required: true },
    ip: { type: String, required: true },
    // success: logged in | pending: waiting for the email OTP | blocked: refused (mobile time window)
    status: { type: String, enum: ['success', 'pending', 'blocked'], required: true },
    blockReason: { type: String },
  },
  { timestamps: true }, // createdAt = login time
);

LoginHistorySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('LoginHistory', LoginHistorySchema);
