import mongoose from "mongoose";
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
  joinedDate: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
