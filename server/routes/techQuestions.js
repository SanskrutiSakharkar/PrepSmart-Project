// server/routes/techQuestions.js
const express = require('express');
const TechQuestion = require('../models/TechQuestion');
const axios = require('axios');
const router = express.Router();

// Get all questions for a section (for answering)
router.get('/', async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = topic ? { topic } : {};
    const questions = await TechQuestion.find(filter).sort({ _id: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate a question using Ollama for a given topic
router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    const prompt = `Generate a technical interview question for software engineering freshers, focused on ${topic}. Do not provide an answer, only the question.`;
    const ollamaRes = await axios.post(
      'http://ollama:11434/api/generate',
      { model: "llama3", prompt },
      { responseType: 'stream' }
    );
    let result = '';
    ollamaRes.data.on('data', (chunk) => {
      chunk.toString().split('\n').forEach(line => {
        if (line.trim() === '') return;
        try {
          const obj = JSON.parse(line);
          if (obj.response) result += obj.response;
        } catch (e) { /* Ignore JSON parse errors */ }
      });
    });
    ollamaRes.data.on('end', () => {
      res.json({ question: result.trim() });
    });
  } catch (err) {
    console.error("Ollama question gen error:", err.message);
    res.status(500).json({ error: 'Failed to generate question.' });
  }
});

// Save a new (AI or user) question
router.post('/save', async (req, res) => {
  try {
    const { question, topic, difficulty = "ai" } = req.body;
    const saved = await TechQuestion.create({ question, topic, difficulty });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save question.' });
  }
});

module.exports = router;
