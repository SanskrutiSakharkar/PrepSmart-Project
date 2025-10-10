const express = require('express');
const router = express.Router();
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * POST /api/feedback
 * Body: { question, answer, topic }
 */
router.post('/feedback', async (req, res) => {
  try {
    const { question, answer, topic } = req.body;

    const prompt = `
      You are an expert interviewer for ${topic}.
      Here is the technical question: "${question}"
      Here is the candidate's answer: "${answer}"
      Please provide:
      - A brief review on correctness
      - Suggestions to improve the answer if any
      - A 1-5 score for the answer (just the number).
      Respond in 3-4 lines.
    `;

    // Use JSON response instead of streaming
    const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "llama3",
      prompt
    });

    const feedback = ollamaRes.data?.response || "AI feedback not available.";
    res.json({ feedback: feedback.trim() });

  } catch (err) {
    console.error("Ollama feedback error:", err.message || err);
    res.status(500).json({ error: 'Failed to get feedback.' });
  }
});

module.exports = router;
