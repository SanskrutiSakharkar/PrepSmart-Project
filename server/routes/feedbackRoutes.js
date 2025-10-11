const express = require('express');
const auth = require('../middleware/authMiddleware');
const FeedbackResult = require('../models/FeedbackResult');

const router = express.Router();

// POST /save
router.post('/save', auth, async (req, res) => {
  const { matchScore, sentiment, emotion, fillerWords, keywordsMatched = [], missingKeywords = [], suggestions = [], context = 'combined' } = req.body;

  try {
    const saved = await FeedbackResult.create({
      userId: req.user.id,
      context,
      matchScore,
      missingKeywords,
      sentiment,
      emotion,
      fillerWords,
      keywordsMatched,
      suggestions
    });
    res.json({ msg: 'Feedback saved', suggestions, id: saved._id });
  } catch (err) {
    console.error('Save feedback error:', err.message || err);
    res.status(500).json({ msg: 'Server error while saving feedback' });
  }
});

// GET /history
router.get('/history', auth, async (req, res) => {
  try {
    const items = await FeedbackResult.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(items);
  } catch (err) {
    console.error('Get feedback history error:', err.message || err);
    res.status(500).json({ msg: 'Failed to load feedback history' });
  }
});

// POST /ai (static fallback)
router.post('/ai', auth, async (req, res) => {
  const { answer, question, topic } = req.body;
  if (!answer || !question || !topic) return res.status(400).json({ msg: "Missing question, answer, or topic" });

  // Static placeholder feedback
  const feedback = `
    Feedback placeholder: Make your answer structured, clear, and provide examples.
    Score: 3/5
  `;
  res.json({ feedback: feedback.trim() });
});

module.exports = router;
