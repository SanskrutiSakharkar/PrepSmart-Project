const express = require('express');
const CodingQuestion = require('../models/CodingQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const authenticate = require('../middleware/authMiddleware');
const { runJudge0 } = require('../utils/judge0');
const axios = require('axios');

const router = express.Router();
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';

// Get all questions for a section
router.get('/questions', authenticate, async (req, res) => {
  const { section } = req.query;
  try {
    const questions = await CodingQuestion.find({ section });
    res.json(questions);
  } catch (err) {
    console.error("Fetch coding questions error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Submit code for grading
router.post('/submit', authenticate, async (req, res) => {
  const { questionId, code, language } = req.body;
  const userId = req.user.id;

  try {
    const question = await CodingQuestion.findById(questionId);
    const testCase = question?.testCases?.[0] || {};
    let output = "", passed = false, statusDesc = "", suggestions = [];

    const judgeRes = await runJudge0({
      source_code: code,
      language,
      stdin: testCase.input || "",
      expected_output: testCase.expectedOutput || ""
    });

    output = judgeRes.stdout || judgeRes.compile_output || judgeRes.stderr || '';
    statusDesc = judgeRes.status?.description || "";
    passed = statusDesc === "Accepted";

    if (!passed) {
      suggestions.push("Check your logic and output format.");
      if (judgeRes.stderr) suggestions.push("Errors: " + judgeRes.stderr);
      if (judgeRes.compile_output) suggestions.push("Compiler says: " + judgeRes.compile_output);
      if (statusDesc) suggestions.push("Status: " + statusDesc);
      if (language === 'python' && !code.includes('def')) suggestions.push('Use Python functions for clean code.');
      if (language === 'react' && !code.includes('useState')) suggestions.push('Try React hooks for state.');
      if (language === 'mysql' && !code.toLowerCase().includes('select')) suggestions.push('Use SELECT to retrieve data.');
    } else {
      suggestions.push("Great job! Your code passed.");
    }

    await CodingSubmission.create({
      userId,
      questionId,
      code,
      language,
      output,
      passed,
      suggestions
    });

    res.json({ output, passed, suggestions, status: statusDesc });
  } catch (err) {
    console.error("Code submission error:", err.message || err);
    res.status(500).json({ error: "Failed to submit code" });
  }
});

// Get history
router.get('/history', authenticate, async (req, res) => {
  const userId = req.user.id;
  try {
    const submissions = await CodingSubmission.find({ userId }).populate('questionId');
    res.json(submissions);
  } catch (err) {
    console.error("Fetch submission history error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Delete a submission
router.delete('/history/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await CodingSubmission.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ msg: "Submission not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete submission error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// AI question generation
router.post('/ai-question', authenticate, async (req, res) => {
  const { section, difficulty } = req.body;
  const sectionMap = {
    python: "Python",
    react: "JavaScript (ReactJS)",
    mysql: "SQL"
  };
  const language = sectionMap[section] || "Python";

  const prompt = `
Generate a ${difficulty} ${language} coding interview problem as a JSON object with these keys:
{
  "title": "...",
  "description": "...",
  "starterCode": "...",
  "testCases": [{"input": "...", "expectedOutput": "..."}, ...],
  "difficulty": "${difficulty}",
  "section": "${section}"
}
Only output the JSON object, no extra text.
`;

  try {
    const ollamaRes = await axios.post(`${OLLAMA_URL}/api/generate`, { model: "llama2", prompt });
    let aiJSON = null;
    try {
      const match = ollamaRes.data.response.match(/\{[\s\S]*\}/);
      aiJSON = JSON.parse(match[0]);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse Ollama response." });
    }
    res.json({ question: aiJSON });
  } catch (err) {
    console.error("Ollama question generation error:", err.message || err);
    res.status(500).json({ error: "Failed to generate question." });
  }
});

// Save AI question
router.post('/save-ai-question', authenticate, async (req, res) => {
  try {
    const q = req.body.question;
    if (!q.title || !q.description || !q.section) {
      return res.status(400).json({ success: false, error: "Invalid question data" });
    }

    const saved = await CodingQuestion.create({
      section: q.section,
      title: q.title,
      description: q.description,
      starterCode: q.starterCode,
      testCases: q.testCases,
      difficulty: q.difficulty
    });

    res.json({ success: true, question: saved });
  } catch (err) {
    console.error("Save AI question error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
