import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { cloudFolders } from '../constants/cloudFolder.js';

// Cloudinary stores audio under resource_type "video". The response contains
// the real `duration` (seconds), `bytes`, `secure_url` and `public_id`.
export const uploadAudioToCloudinary = (filePath) =>
  cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    folder: cloudFolders.AUDIO,
    timeout: 120000, // 2 minutes, large files on a free server can be slow
  });

// Best effort: never throws, so a cleanup problem can't hide the real error.
export const deleteAudioFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (err) {
    console.error('Could not delete audio from Cloudinary:', publicId, err.message);
  }
};

export const removeTempFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch {
    // already removed
  }
};
