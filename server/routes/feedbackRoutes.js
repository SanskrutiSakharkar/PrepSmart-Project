const express = require('express');
const auth = require('../middleware/authMiddleware');
const FeedbackResult = require('../models/FeedbackResult');

const router = express.Router();

/**
 * POST /api/feedback/save
 * Body: { matchScore, sentiment, emotion, fillerWords, keywordsMatched, missingKeywords, suggestions, context }
 */
router.post('/save', auth, async (req, res) => {
  try {
    const {
      matchScore,
      sentiment,
      emotion,
      fillerWords,
      keywordsMatched = [],
      missingKeywords = [],
      suggestions = [],
      context = 'combined'
    } = req.body;

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
    console.error('Save feedback error:', err.message);
    res.status(500).json({ msg: 'Server error while saving feedback' });
  }
});

/**
 * GET /api/feedback/history
 * Returns last 20 feedback entries for the user
 */
router.get('/history', auth, async (req, res) => {
  try {
    const items = await FeedbackResult
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(items);
  } catch (err) {
    console.error('Get feedback history error:', err.message);
    res.status(500).json({ msg: 'Failed to load feedback history' });
  }
});

module.exports = router;
