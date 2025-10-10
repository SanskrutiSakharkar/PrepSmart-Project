const express = require('express');
const auth = require('../middleware/authMiddleware');
const FeedbackResult = require('../models/FeedbackResult');
const axios = require('axios');

const router = express.Router();
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';

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
    console.error('Save feedback error:', err.message || err);
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
    console.error('Get feedback history error:', err.message || err);
    res.status(500).json({ msg: 'Failed to load feedback history' });
  }
});

/**
 * Optional: Generate AI-based personalized feedback (future)
 * POST /api/feedback/ai
 * Body: { answer, question, topic }
 */
router.post('/ai', auth, async (req, res) => {
  try {
    const { answer, question, topic } = req.body;
    const prompt = `
      You are an expert interviewer for ${topic}.
      Question: "${question}"
      Candidate answer: "${answer}"
      Provide a brief review, improvement suggestions, and a 1-5 score in 3 lines.
    `;

    const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3',
      prompt
    });

    const feedback = ollamaRes.data?.response || 'AI feedback not available.';
    res.json({ feedback: feedback.trim() });
  } catch (err) {
    console.error('AI feedback generation error:', err.message || err);
    res.status(500).json({ msg: 'Failed to generate AI feedback' });
  }
});

module.exports = router;
