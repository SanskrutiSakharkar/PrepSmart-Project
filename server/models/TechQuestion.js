const mongoose = require('mongoose');

const TechQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  topic: String,
  difficulty: String
});

module.exports = mongoose.models.TechQuestion || mongoose.model('TechQuestion', TechQuestionSchema);
