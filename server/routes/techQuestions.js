const express = require('express');
const TechQuestion = require('../models/TechQuestion');
const axios = require('axios');
const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';

// --- Get all questions for a topic ---
router.get('/', async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = topic ? { topic } : {};
    const questions = await TechQuestion.find(filter).sort({ _id: -1 });
    res.json(questions);
  } catch (err) {
    console.error("Fetch questions error:", err);
    res.status(500).json({ error: 'Server error while fetching questions' });
  }
});

// --- Generate AI question ---
router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    const prompt = `Generate a technical interview question for software engineering freshers, focused on ${topic}. Do not provide an answer, only the question.`;

    const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: "llama3",
      prompt
    });

    const result = ollamaRes.data?.response || "Failed to get AI question.";
    res.json({ question: result.trim() });
  } catch (err) {
    console.error("Ollama question generation error:", err.message || err);
    res.status(500).json({ error: 'Failed to generate question.' });
  }
});

// --- Save a new question ---
router.post('/save', async (req, res) => {
  try {
    const { question, topic, difficulty = "ai" } = req.body;
    const saved = await TechQuestion.create({ question, topic, difficulty });
    res.json(saved);
  } catch (err) {
    console.error("Save question error:", err.message || err);
    res.status(500).json({ error: 'Failed to save question.' });
  }
});

module.exports = router;
