const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const VoiceFeedback = require('../models/VoiceFeedback');

router.post('/save', authenticate, async (req, res) => {
  const { emotion, pitch, energy, tempo, suggestions, audioFileName } = req.body;
  try {
    const feedback = await VoiceFeedback.create({ userId: req.user.id, emotion, pitch, energy, tempo, suggestions, audioFileName });
    res.json({ success: true, feedback });
  } catch (e) {
    console.error('Failed to save:', e);
    res.status(500).json({ success: false, error: 'DB save failed' });
  }
});

router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await VoiceFeedback.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await VoiceFeedback.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Delete failed' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { emotion, pitch, energy, tempo, suggestions, audioFileName } = req.body;
  try {
    const feedback = await VoiceFeedback.create({ userId: req.user.id, emotion, pitch, energy, tempo, suggestions, audioFileName });
    res.json({ success: true, feedback });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Route / failed to save' });
  }
});

module.exports = router;
