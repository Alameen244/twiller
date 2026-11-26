import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  tweet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tweet",
    required: true,
    index: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.index({ tweet: 1, timestamp: -1 });

export default mongoose.model("Comment", CommentSchema);
