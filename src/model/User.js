const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'verified' },
    subscription: { type: String, default: 'usual' },
    premiumToken: { type: Number, default: null },
    // Add other fields as needed
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
