const mongoose = require('mongoose');

const voiceFeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  emotion: String,
  pitch: Number,
  energy: Number,
  tempo: Number,
  suggestions: [String],
  audioFileName: String
});

module.exports = mongoose.models.VoiceFeedback || mongoose.model('VoiceFeedback', voiceFeedbackSchema);
