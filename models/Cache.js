const mongoose = require('mongoose');

const cacheSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  results: { type: Array, default: [] },
  has_more: Boolean,
  cached_at: { type: Date, default: Date.now }
});

// auto-delete documents after 24 hours
cacheSchema.index({ cached_at: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Cache', cacheSchema);