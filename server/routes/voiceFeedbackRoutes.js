const express = require("express");
const router = express.Router();
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const authenticate = require("../middleware/authMiddleware");
const VoiceFeedback = require("../models/VoiceFeedback");

// Multer memory storage for audio files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- POST: Save voice feedback manually ---
router.post("/save", authenticate, async (req, res) => {
  const { emotion, pitch, energy, tempo, suggestions, audioFileName } = req.body;
  try {
    const feedback = await VoiceFeedback.create({
      userId: req.user.id,
      emotion,
      pitch,
      energy,
      tempo,
      suggestions,
      audioFileName,
    });
    res.json({ success: true, feedback });
  } catch (e) {
    console.error("Failed to save:", e);
    res.status(500).json({ success: false, error: "DB save failed" });
  }
});

// --- GET: Voice feedback history ---
router.get("/history", authenticate, async (req, res) => {
  try {
    const history = await VoiceFeedback.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(history);
  } catch (e) {
    console.error("Failed to fetch history:", e);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// --- DELETE: Remove feedback by ID ---
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const deleted = await VoiceFeedback.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true });
  } catch (e) {
    console.error("Delete failed:", e);
    res.status(500).json({ success: false, error: "Delete failed" });
  }
});

// --- POST: Analyze audio via AI engine ---
router.post("/analyze", authenticate, upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

  try {
    // Prepare multipart form data to send to AI engine
    const formData = new FormData();
    formData.append("audio", req.file.buffer, req.file.originalname);

    // Use AI_ENGINE_URL from env
    const aiUrl = process.env.AI_ENGINE_URL || "http://ai_engine:8000";

    const response = await axios.post(`${aiUrl}/analyze/audio`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000, // 60s timeout
    });

    const result = response.data;

    // Save to MongoDB automatically
    const feedback = await VoiceFeedback.create({
      userId: req.user.id,
      emotion: result.emotion,
      pitch: result.pitch,
      energy: result.energy,
      tempo: result.tempo,
      suggestions: result.suggestions || [],
      audioFileName: req.file.originalname,
    });

    res.json(result);
  } catch (err) {
    console.error("Error forwarding audio to AI engine:", err.message || err);
    res.status(502).json({ error: "AI Engine not reachable or analysis failed" });
  }
});

// --- POST fallback for /api/voice-feedback (legacy) ---
router.post("/", authenticate, async (req, res) => {
  const { emotion, pitch, energy, tempo, suggestions, audioFileName } = req.body;
  try {
    const feedback = await VoiceFeedback.create({
      userId: req.user.id,
      emotion,
      pitch,
      energy,
      tempo,
      suggestions,
      audioFileName,
    });
    res.json({ success: true, feedback });
  } catch (e) {
    console.error("Route / failed to save:", e);
    res.status(500).json({ success: false, error: "Route / failed to save" });
  }
});

module.exports = router;
