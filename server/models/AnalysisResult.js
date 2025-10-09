const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  matchScore: { type: Number, required: true },
  analyzedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.AnalysisResult || mongoose.model('AnalysisResult', analysisResultSchema);
