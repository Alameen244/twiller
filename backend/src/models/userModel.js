import mongoose from "mongoose";
import { SUPPORTED_LANGUAGE_CODES, DEFAULT_LANGUAGE } from "../constants/languages.js";

const UserSchema = mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  avatar: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  website: { type: String, default: "" },
  firebaseUid: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true, match: /^\+[1-9]\d{7,14}$/ },
  isPhoneVerified: { type: Boolean, default: false },
  notificationsEnabled: { type: Boolean, default: false },
  language: { type: String, enum: SUPPORTED_LANGUAGE_CODES, default: DEFAULT_LANGUAGE },
  joinedDate: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
