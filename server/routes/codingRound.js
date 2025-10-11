const express = require('express');
const CodingQuestion = require('../models/CodingQuestion');
const CodingSubmission = require('../models/CodingSubmission');
const authenticate = require('../middleware/authMiddleware');
const { runJudge0 } = require('../utils/judge0');

const router = express.Router();

// GET /questions
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

// POST /submit
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

// GET /history
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

// DELETE /history/:id
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

// POST /ai-question (static fallback)
router.post('/ai-question', authenticate, async (req, res) => {
  const { section, difficulty } = req.body;
  const question = {
    section,
    title: `Sample ${section} problem`,
    description: `Solve a ${difficulty} ${section} coding problem.`,
    starterCode: "",
    testCases: [{ input: "test", expectedOutput: "test" }],
    difficulty
  };
  res.json({ question });
});

// POST /save-ai-question
router.post('/save-ai-question', authenticate, async (req, res) => {
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
});

module.exports = router;
