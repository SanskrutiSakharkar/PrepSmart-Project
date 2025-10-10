const express = require('express');
const CodingQuestion = require('../models/CodingQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const authenticate = require('../middleware/authMiddleware');
const { runJudge0 } = require('../utils/judge0');
const axios = require('axios');

const router = express.Router();

// Get all questions for section
router.get('/questions', authenticate, async (req, res) => {
  const { section } = req.query;
  const questions = await CodingQuestion.find({ section });
  res.json(questions);
});

// Submit code for grading (with Judge0)
router.post('/submit', authenticate, async (req, res) => {
  const { questionId, code, language } = req.body;
  const userId = req.user.id;
  const question = await CodingQuestion.findById(questionId);
  const testCase = question && question.testCases && question.testCases[0] ? question.testCases[0] : {};
  let output = "", passed = false, statusDesc = "", suggestions = [];

  try {
    const judgeRes = await runJudge0({
      source_code: code,
      language: language,
      stdin: testCase.input || "",
      expected_output: testCase.expectedOutput || ""
    });
    output = judgeRes.stdout || judgeRes.compile_output || judgeRes.stderr || '';
    statusDesc = judgeRes.status ? judgeRes.status.description : "";
    passed = judgeRes.status && judgeRes.status.description === "Accepted";

    if (!passed) {
      suggestions.push("Check your logic and output format.");
      if (judgeRes.stderr) suggestions.push("Your code has errors: " + judgeRes.stderr);
      if (judgeRes.compile_output) suggestions.push("Compiler says: " + judgeRes.compile_output);
      if (statusDesc) suggestions.push("Status: " + statusDesc);
      if (language === 'python' && !code.includes('def')) suggestions.push('Use Python functions for clean code.');
      if (language === 'react' && !code.includes('useState')) suggestions.push('Try React hooks for state.');
      if (language === 'mysql' && !code.toLowerCase().includes('select')) suggestions.push('Use SELECT to retrieve data.');
    } else {
      suggestions.push("Great job! Your code passed.");
    }
  } catch (err) {
    output = "Code judge error: " + err.message;
    suggestions.push("Server error, please try again.");
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
});

// Get history for current user
router.get('/history', authenticate, async (req, res) => {
  const userId = req.user.id;
  const submissions = await CodingSubmission.find({ userId }).populate('questionId');
  res.json(submissions);
});

// === NEW: Delete a coding submission by ID ===
router.delete('/history/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await CodingSubmission.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ msg: "Submission not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// === NEW: AI Question Generation Route with Ollama ===
router.post('/ai-question', authenticate, async (req, res) => {
  const { section, difficulty } = req.body;
  const sectionMap = {
    python: "Python",
    react: "JavaScript (ReactJS)",
    mysql: "SQL"
  };
  const language = sectionMap[section] || "Python";

  const ollamaPrompt = `
Generate a ${difficulty} ${language} coding interview problem as a JSON object with these keys:
{
  "title": "...",
  "description": "...",
  "starterCode": "...",
  "testCases": [{"input": "...", "expectedOutput": "..."}, ...],
  "difficulty": "${difficulty}",
  "section": "${section}"
}
Be concise. Only output the JSON object, no extra text.
`;

  try {
    const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
      model: "llama3",
      prompt: ollamaPrompt,
      stream: false
    });

    let aiJSON = null;
    try {
      const match = ollamaRes.data.response.match(/\{[\s\S]*\}/);
      aiJSON = JSON.parse(match[0]);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse Ollama response." });
    }
    res.json({ question: aiJSON });
  } catch (err) {
    console.error("Ollama question generation error:", err);
    res.status(500).json({ error: "Failed to generate question." });
  }
});

// === NEW: Save AI-Generated Question ===
router.post('/save-ai-question', authenticate, async (req, res) => {
  try {
    const q = req.body.question;
    if (!q.title || !q.description || !q.section) {
      return res.status(400).json({ success: false, error: "Invalid question data" });
    }
    // Save to MongoDB
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
