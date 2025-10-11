const express = require('express');
const auth = require('../middleware/authMiddleware');
const FeedbackResult = require('../models/FeedbackResult');
const axios = require('axios');

const router = express.Router();

// Docker-friendly Ollama URL
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';
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
 * POST /api/feedback/ai
 * Generate AI-based personalized feedback using Ollama-mini
 * Body: { answer, question, topic }
 */
router.post('/ai', auth, async (req, res) => {
  try {
    const { answer, question, topic } = req.body;

    if (!answer || !question || !topic) {
      return res.status(400).json({ msg: "Missing question, answer, or topic" });
    }

    const prompt = `
      You are an expert interviewer for ${topic}.
      Question: "${question}"
      Candidate answer: "${answer}"
      Provide a brief review, improvement suggestions, and a 1-5 score in 3 lines.
    `;

    // Fallback in case Ollama fails
    let feedback = "AI feedback temporarily unavailable.";

    try {
      const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt
      });

      feedback = ollamaRes.data?.response || feedback;
    } catch (err) {
      console.error("Ollama call failed:", err.message);
      if (err.response) console.error("Ollama response data:", err.response.data);
    }

    res.json({ feedback: feedback.trim() });

  } catch (err) {
    console.error('AI feedback generation error:', err.message || err);
    res.status(500).json({ msg: 'Failed to generate AI feedback' });
  }
});

module.exports = router;
