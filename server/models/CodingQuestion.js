const mongoose = require('mongoose');

const CodingQuestionSchema = new mongoose.Schema({
  section: { type: String, enum: ['python', 'react', 'mysql'], required: true },
  title: String,
  description: String,
  starterCode: String,
  testCases: [{ input: String, expectedOutput: String }],
  difficulty: String
});

// This line prevents OverwriteModelError:
module.exports = mongoose.models.CodingQuestion || mongoose.model('CodingQuestion', CodingQuestionSchema);
