const mongoose = require('mongoose');

const feedbackResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  context: { type: String, enum: ['resume', 'voice', 'combined'], default: 'combined' },
  matchScore: Number,
  missingKeywords: [String],
  sentiment: String,
  emotion: String,
  fillerWords: Number,
  keywordsMatched: [String],
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.FeedbackResult || mongoose.model('FeedbackResult', feedbackResultSchema);
