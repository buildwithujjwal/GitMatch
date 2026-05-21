const mongoose = require("mongoose");

const breakdownCacheSchema = new mongoose.Schema({
  // unique key: issue_url is the best identifier
  issue_url: { type: String, required: true, unique: true },

  // store the parsed breakdown
  breakdown: {
    debrief: String,
    badges: [String],
    techStack: String,
    prerequisites: String,
    steps: [String],
  },

  // metadata
  issue_title: String,
  repo_name: String,
  cached_at: { type: Date, default: Date.now },
});

// auto-delete after 7 days
breakdownCacheSchema.index({ cached_at: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model("BreakdownCache", breakdownCacheSchema);
