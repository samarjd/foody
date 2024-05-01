const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String, required: true, min: 4, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, min: 4, unique: true },
    dob: { type: Date, required: true },
    firstname: { type: String, required: true, min: 1 },
    lastname: { type: String, required: true, min: 1 }, 
    cover: { type: String, trim: true },
    userRole: { type: String, trim: true},
    lastOnline: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const UserModel = model('User', UserSchema);
module.exports = UserModel;
