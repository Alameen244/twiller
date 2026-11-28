import mongoose from "mongoose";

// One cached translation per comment per target language. Comments cannot be edited, so cache stays valid.
const CommentTranslationSchema = new mongoose.Schema({
  comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true },
  language: { type: String, required: true },
  text: { type: String, required: true },
  changed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});

CommentTranslationSchema.index({ comment: 1, language: 1 }, { unique: true });

export default mongoose.model("CommentTranslation", CommentTranslationSchema);
