const express = require('express');
const axios = require('axios');
const Resume = require('../models/Resume');
const AnalysisResult = require('../models/AnalysisResult'); 
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/analysis/latest
router.post('/latest', auth, async (req, res) => {
  try {
    const latest = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    if (!latest) {
      return res.status(404).json({ msg: 'No uploaded resume found for this user.' });
    }

    const flaskRes = await axios.post('http://localhost:8000/analyze/resume', {
      resume: latest.resumeText,
      jobDesc: latest.jobDescText,
    });

    const score = flaskRes.data.match_score;

    await AnalysisResult.create({
      userId: req.user.id,
      resumeId: latest._id,
      matchScore: score,
    });

    res.json({
      match_score: score,
      message: 'Analysis complete and saved.',
    });
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.status(500).json({ msg: 'Server error during analysis' });
  }
});

// GET /api/analysis/history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await AnalysisResult.find({ userId: req.user.id })
      .sort({ analyzedAt: -1 })
      .populate('resumeId', 'uploadedAt');
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).json({ msg: 'Failed to load analysis history' });
  }
});

module.exports = router;
