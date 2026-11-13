import User from '../models/user.js';

const PRIVATE_FIELDS = ['phoneNumber', 'isPhoneVerified', 'firebaseUid'];

// Owner sees everything; anyone else gets the profile without private fields.
const serializeUser = (user, req) => {
  const obj = user.toObject();
  const viewer = req.firebaseUser?.email?.toLowerCase();
  if (!viewer || viewer !== user.email?.toLowerCase()) {
    PRIVATE_FIELDS.forEach((f) => delete obj[f]);
  }
  return obj;
};

export const registerUser = async (req, res) => {
  try {
    const existinguser = await User.findOne({ email: req.body.email });
    if (existinguser) {
      return res.status(200).send(serializeUser(existinguser, req));
    }
    const { username, displayName, avatar, email } = req.body; // never accept phone fields here
    const newUser = new User({ username, displayName, avatar, email });
    await newUser.save();
    return res.status(201).send(serializeUser(newUser, req));
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

export const getLoggedInUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send({ error: 'Email required' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: 'User not found' });
    return res.status(200).send(serializeUser(user, req));
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { username, displayName, bio, location, website, avatar } = req.body;
    if (req.firebaseUser.email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).send({ error: 'You can only edit your own profile' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ error: 'No valid fields provided for update' });
    }

    const updated = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, upsert: false }
    );
    return res.status(200).send(serializeUser(updated, req));
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
import { verifyService } from '../config/twilio.js';

const E164 = /^\+[1-9]\d{7,14}$/;

export const sendPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!E164.test(phoneNumber || ''))
      return res.status(400).json({ message: 'Enter a valid phone number' });

    const taken = await User.findOne({ phoneNumber, email: { $ne: req.firebaseUser.email } });
    if (taken) return res.status(409).json({ message: 'Phone number already in use' });

    await verifyService.verifications.create({ to: phoneNumber, channel: 'sms' });
    return res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
     if (Number(err.code) === 21608) {
      return res.status(403).json({
        code: 'TWILIO_UNVERIFIED_NUMBER',
        message:
          'This phone number is not verified in the Twilio Trial account. Please use a verified demo number.',
      });
    }
    const status = err.status === 429 ? 429 : 500;
    return res.status(status).json({
      message: status === 429 ? 'Too many attempts. Try again later.' : 'Could not send OTP',
    });
  }
};

export const confirmPhoneOtp = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!E164.test(phoneNumber || '') || !/^\d{6}$/.test(code || ''))
      return res.status(400).json({ message: 'Invalid request' });

    const check = await verifyService.verificationChecks.create({ to: phoneNumber, code });
    if (check.status !== 'approved')
      return res.status(400).json({ message: 'That code is incorrect.' });

    const { uid, email } = req.firebaseUser;
    const user = await User.findOneAndUpdate(
      { email },
      { firebaseUid: uid, phoneNumber, isPhoneVerified: true },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  } catch (err) {
    // Twilio returns 404 when the code expired or was already used
    if (err.status === 404)
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    return res.status(500).json({ message: 'Verification failed' });
  }
};
