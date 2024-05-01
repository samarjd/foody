const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    flagged: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    flags: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    flaggedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],    
  },
  {
    timestamps: true,
  }
);

const CommentModel = model('Comment', CommentSchema);
module.exports = CommentModel;