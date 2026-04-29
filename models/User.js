const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: String,
  bio: String,
  location: String,
  avatar: String,
  public_repos: Number,
  followers: Number,
  following: Number,
  // how many of their repos use each language
  languages: { type: Map, of: Number, default: {} },
  topics: { type: Map, of: Number, default: {} },
  created_at: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);