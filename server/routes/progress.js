const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const CodingSubmission = require("../models/CodingSubmission");
const AnalysisResult = require("../models/AnalysisResult");
const FeedbackResult = require("../models/FeedbackResult");
const Resume = require("../models/Resume");
const TechQuestion = require("../models/TechQuestion");
const VoiceFeedback = require("../models/VoiceFeedback");

function calcGrowth(arr, field) {
  if (!arr.length) return 0;
  const first = arr[0][field] || 0;
  const last = arr[arr.length - 1][field] || 0;
  return +(last - first).toFixed(2);
}

const getStartEnd = arr =>
  arr.length ? { start: arr[0], end: arr[arr.length - 1] } : { start: {}, end: {} };

router.get("/summary", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Fetch all relevant docs
    const voice = await VoiceFeedback.find({ userId: objectUserId }).sort({ timestamp: 1 });
    const coding = await CodingSubmission.find({ userId: objectUserId }).sort({ submittedAt: 1 });
    const resumes = await Resume.find({ userId: objectUserId }).sort({ uploadedAt: 1 });
    const analysis = await AnalysisResult.find({ userId: objectUserId }).sort({ analyzedAt: 1 });
    const feedback = await FeedbackResult.find({ userId: objectUserId }).sort({ createdAt: 1 });

    // Trends: as before
    const feedbackVoice = feedback.filter(f => f.context === "voice");
    const sentimentTrend = feedbackVoice.map(f => ({
      date: f.createdAt,
      sentiment: typeof f.sentiment === "number" ? f.sentiment : 0
    }));
    const fillerTrend = feedbackVoice.map(f => ({
      date: f.createdAt,
      filler_count: typeof f.fillerWords === "number" ? f.fillerWords : 0
    }));

    // Coding accuracy trend
    const codingTrend = coding.map(c => ({
      date: c.submittedAt,
      correct: c.passed ? 1 : 0,
      total: 1,
      accuracy: c.passed ? 100 : 0,
    }));

    // Resume match percent trend (from AnalysisResult)
    const resumeTrend = analysis.map(a => ({
      date: a.analyzedAt,
      match_percent: typeof a.matchScore === "number" ? a.matchScore : 0,
    }));

    // Growth calculations
    const codingGrowth = calcGrowth(codingTrend, "accuracy");
    const techGrowth = 0; // Implement if you track tech MCQs per user
    const sentimentGrowth = calcGrowth(sentimentTrend, "sentiment");
    const fillerGrowth = calcGrowth(fillerTrend, "filler_count");
    const resumeGrowth = calcGrowth(resumeTrend, "match_percent");

    // --- FEEDBACK MERGE LOGIC: Collect feedback from all sources ---

    // 1. VoiceFeedback direct suggestions (optional, if present)
    const voiceFeedbacks = voice.map(v => ({
      date: v.timestamp,
      feedback:
        Array.isArray(v.suggestions) && v.suggestions.length > 0
          ? v.suggestions.join("; ")
          : v.feedback || v.ai_feedback || "(No feedback)",
      type: "Voice"
    }));

    // 2. CodingSubmission suggestions
    const codingFeedbacks = coding
      .filter(c => Array.isArray(c.suggestions) && c.suggestions.length > 0)
      .map(c => ({
        date: c.submittedAt,
        feedback: c.suggestions.join("; "),
        type: "Coding"
      }));

    // 3. FeedbackResult (resume, voice, or combined)
    const feedbackResults = feedback.map(f => ({
      date: f.createdAt,
      feedback:
        Array.isArray(f.suggestions) && f.suggestions.length > 0
          ? f.suggestions.join("; ")
          : (f.matchScore !== undefined
              ? `Resume match: ${f.matchScore}%`
              : f.sentiment || f.emotion || "(No feedback)"),
      type: f.context ? f.context.charAt(0).toUpperCase() + f.context.slice(1) : "Other"
    }));

    // 4. Resume analysis (from AnalysisResult, as info)
    const resumeFeedbacks = analysis.map(a => ({
      date: a.analyzedAt,
      feedback: a.matchScore !== undefined ? `Resume match score: ${a.matchScore}%` : "",
      type: "Resume"
    }));

    // Merge all and sort DESCENDING by date
    const allFeedbacks = [
      ...voiceFeedbacks,
      ...codingFeedbacks,
      ...feedbackResults,
      ...resumeFeedbacks
    ]
      .filter(f => f.feedback && f.feedback.trim() !== "")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    res.json({
      growth: {
        coding: { ...getStartEnd(codingTrend), diff: codingGrowth },
        tech: { ...getStartEnd([]), diff: techGrowth },
        sentiment: { ...getStartEnd(sentimentTrend), diff: sentimentGrowth },
        filler: { ...getStartEnd(fillerTrend), diff: fillerGrowth },
        resume: { ...getStartEnd(resumeTrend), diff: resumeGrowth }
      },
      sentimentTrend,
      fillerTrend,
      codingTrend,
      techTrend: [],
      resumeTrend,
      feedbackLog: allFeedbacks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get progress summary" });
  }
});

module.exports = router;
