const express = require('express');
const router = express.Router();
const axios = require('axios');

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
    const ollamaRes = await axios.post(
      'http://localhost:11434/api/generate',
      { model: "llama3", prompt },
      { responseType: 'stream' }
    );
    let feedback = '';
    ollamaRes.data.on('data', (chunk) => {
      chunk.toString().split('\n').forEach(line => {
        if (line.trim() === '') return;
        try {
          const obj = JSON.parse(line);
          if (obj.response) feedback += obj.response;
        } catch (e) {}
      });
    });
    ollamaRes.data.on('end', () => {
      res.json({ feedback: feedback.trim() });
    });
  } catch (err) {
    console.error("Ollama feedback error:", err.message);
    res.status(500).json({ error: 'Failed to get feedback.' });
  }
});

module.exports = router;
