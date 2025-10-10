// server/routes/analysisRoutes.js
const express = require('express');
const axios = require('axios');
const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult'); 
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/analysis/latest
 * Finds the most recent resume/JD, sends to Flask, saves score, returns score
 */
router.post('/latest', auth, async (req, res) => {
  try {
    // Step 1: Find the most recent resume/JD upload by the user
    const latest = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });

    if (!latest) {
      return res.status(404).json({ msg: 'No uploaded resume found for this user.' });
    }

    // Step 2: Send resume and JD to Flask for AI analysis
    const flaskRes = await axios.post('http://localhost:8000/analyze/resume', {   // <-- Note: route is /analyze/resume
      resume: latest.resumeText,
      jobDesc: latest.jobDescText,
    });

    const score = flaskRes.data.match_score;

    // Step 3: Save result to MongoDB for future history view
    await AnalysisResult.create({
      userId: req.user.id,
      resumeId: latest._id,
      matchScore: score,
    });

    // Step 4: Return match score to frontend
    res.json({
      match_score: score,
      message: 'Analysis complete and saved.',
    });
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ msg: 'Server error during AI analysis' });
  }
});

/**
 * GET /api/analysis/history
 * Returns the last 20 analysis results for the user
 */
router.get('/history', auth, async (req, res) => {
  try {
    const history = await AnalysisResult.find({ userId: req.user.id })
      .sort({ analyzedAt: -1 }) // latest first
      .populate('resumeId', 'uploadedAt'); // optional: fetch resume upload date

    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).json({ msg: 'Failed to load analysis history' });
  }
});

module.exports = router;
