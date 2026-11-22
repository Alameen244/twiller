import AudioUploadGrant from '../models/audioUploadGrantModel.js';
import { AUDIO_LIMITS } from '../constants/audioLimits.js';

// Called after the email OTP is verified. Replaces any older grant of the same user.
export const createUploadGrant = async (userId) => {
  const expiresAt = new Date(Date.now() + AUDIO_LIMITS.UPLOAD_GRANT_VALID_MINUTES * 60 * 1000);
  await AudioUploadGrant.findOneAndUpdate(
    { user: userId },
    { expiresAt },
    { upsert: true, setDefaultsOnInsert: true },
  );
  return expiresAt;
};

// Read-only check, used before the file is received. It does NOT use up the grant.
export const hasUploadGrant = async (userId) =>
  Boolean(await AudioUploadGrant.exists({ user: userId, expiresAt: { $gt: new Date() } }));

// Atomically deletes the grant. Returns true only for the one request that got it,
// so a grant can never be used twice, even by parallel requests.
export const consumeUploadGrant = async (userId) => {
  const grant = await AudioUploadGrant.findOneAndDelete({
    user: userId,
    expiresAt: { $gt: new Date() },
  });
  return Boolean(grant);
};
