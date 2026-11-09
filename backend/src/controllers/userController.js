import User from '../models/user.js';

// Register new user
export const registerUser = async (req, res) => {
  try {
    const existinguser = await User.findOne({ email: req.body.email });
    if (existinguser) {
      return res.status(200).send(existinguser);
    }
    const newUser = new User(req.body);
    await newUser.save();
    return res.status(201).send(newUser);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Get logged in user by email
export const getLoggedInUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send({ error: 'Email required' });
    }
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).send({ error: 'User not found' });
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { username, displayName, bio, location, website, avatar } = req.body;

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

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).send({ error: 'No valid fields provided for update' });
    }

    const updated = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, upsert: false }
    );
    return res.status(200).send(updated);
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};
