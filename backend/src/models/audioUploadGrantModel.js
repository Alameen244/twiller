import mongoose from 'mongoose';

// Proof that the user passed the email OTP and may upload ONE audio tweet.
// One grant per user. MongoDB deletes it automatically once expiresAt passes.
const AudioUploadGrantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

export default mongoose.model('AudioUploadGrant', AudioUploadGrantSchema);
