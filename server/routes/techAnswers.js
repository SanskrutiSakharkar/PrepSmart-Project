const express = require('express');
const router = express.Router();

// POST /feedback (static placeholder)
router.post('/feedback', async (req, res) => {
  const { question, answer, topic } = req.body;
  if (!question || !answer || !topic) return res.status(400).json({ error: "Missing question, answer, or topic" });

  const feedback = `
    Placeholder feedback: Review your technical answer for clarity, correctness, and completeness.
    Score: 3/5
  `;
  res.json({ feedback: feedback.trim() });
});

module.exports = router;
