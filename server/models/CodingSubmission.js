const mongoose = require('mongoose');

const CodingSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingQuestion', required: true },
  code: String,
  language: String,
  output: String,
  passed: Boolean,
  suggestions: [String],
  submittedAt: { type: Date, default: Date.now }
});

// This line prevents OverwriteModelError:
module.exports = mongoose.models.CodingSubmission || mongoose.model('CodingSubmission', CodingSubmissionSchema);
