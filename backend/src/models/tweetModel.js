import mongoose from "mongoose";

// Present only on audio tweets.
const AudioSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // needed to delete the file from Cloudinary
    duration: { type: Number, required: true }, // seconds, as measured by Cloudinary
    bytes: { type: Number, required: true },
  },
  { _id: false }
);

const TweetSchema = mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Text is required unless the tweet is an audio tweet (then it is an optional caption).
  content: {
    type: String,
    required: function () {
      return !this.audio || !this.audio.url;
    },
    default: "",
  },
  likes: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  retweetedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  image: { type: String, default: null },
  audio: { type: AudioSchema, default: null },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Tweet", TweetSchema);
