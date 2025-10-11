const express = require('express');
const TechQuestion = require('../models/TechQuestion');
const router = express.Router();

// GET / (fetch all questions)
router.get('/', async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = topic ? { topic } : {};
    const questions = await TechQuestion.find(filter).sort({ _id: -1 });
    res.json(questions);
  } catch (err) {
    console.error("Fetch questions error:", err.message || err);
    res.status(500).json({ error: 'Server error while fetching questions' });
  }
});

// POST /generate (static template question)
router.post('/generate', async (req, res) => {
  const { topic } = req.body;
  const question = `Sample technical interview question on ${topic}.`;
  res.json({ question });
});

// POST /save
router.post('/save', async (req, res) => {
  const { question, topic, difficulty = "ai" } = req.body;
  try {
    const saved = await TechQuestion.create({ question, topic, difficulty });
    res.json(saved);
  } catch (err) {
    console.error("Save question error:", err.message || err);
    res.status(500).json({ error: 'Failed to save question.' });
  }
});

module.exports = router;
