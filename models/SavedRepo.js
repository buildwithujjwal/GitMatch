const mongoose = require('mongoose');

const savedRepoSchema = new mongoose.Schema({
  username: { type: String, required: true },
  repo_name: { type: String, required: true },
  repo_url: { type: String, required: true },
  description: String,
  stars: Number,
  language: String,
  issue_title: String, // ✅ add
  issue_url: String, // ✅ add
  issue_number: Number, // ✅ add
  saved_at: { type: Date, default: Date.now },
});

// one user can't save the same repo twice
savedRepoSchema.index({ username: 1, repo_name: 1 }, { unique: true });

module.exports = mongoose.model('SavedRepo', savedRepoSchema);