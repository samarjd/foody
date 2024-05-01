const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    summary: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    cover: {
      type: String,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVisible: {
      type: Boolean,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    views: {
      type: Number,
      default: 0
    },
    viewedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    viewedIPs: [String],
  },
  {
    timestamps: true,
  }
);

const PostModel = model('Post', PostSchema);
module.exports = PostModel;