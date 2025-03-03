const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const CategoryModel = model('Category', CategorySchema);
module.exports = CategoryModel;
