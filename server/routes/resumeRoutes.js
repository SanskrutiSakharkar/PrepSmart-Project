const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==== 1. UPLOAD RESUME & JD ====
// POST /api/resume/upload
router.post(
  '/upload',
  authMiddleware,
  upload.fields([{ name: 'resume' }, { name: 'jobDesc' }]),
  async (req, res) => {
    try {
      const resumeFile = req.files.resume?.[0];
      const jdFile = req.files.jobDesc?.[0];

      if (!resumeFile || !jdFile) {
        return res.status(400).json({ msg: 'Both Resume and Job Description files are required.' });
      }

      // Extract plain text from PDF or DOCX
      const extractText = async (file) => {
        if (file.mimetype === 'application/pdf') {
          const data = await pdfParse(file.buffer);
          return data.text;
        } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          return result.value;
        } else {
          return 'Unsupported file type';
        }
      };

      const resumeText = await extractText(resumeFile);
      const jdText = await extractText(jdFile);

      // Save both to DB
      const newUpload = new Resume({
        userId: req.user.id,
        resumeText,
        jobDescText: jdText,
        uploadedAt: new Date(),
      });

      await newUpload.save();

      res.json({ msg: 'Files uploaded and text extracted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error while processing upload.' });
    }
  }
);

// ==== 2. GET LATEST RESUME/JD TEXTS ====
// GET /api/resume/texts
router.get('/texts', authMiddleware, async (req, res) => {
  try {
    const lastUpload = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    if (!lastUpload) {
      return res.status(404).json({ msg: 'No resume/job description uploaded yet.' });
    }
    res.json({
      resumeText: lastUpload.resumeText || "",
      jdText: lastUpload.jobDescText || ""
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error while fetching resume/job description text.' });
  }
});

// ==== 3. AI MATCH ENDPOINT ====
// GET /api/resume/run-ai-match
router.get('/run-ai-match', authMiddleware, async (req, res) => {
  try {
    const lastUpload = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });

    if (!lastUpload) {
      return res.status(404).json({ result: "No resume/job description uploaded yet." });
    }

    const resumeWords = new Set(lastUpload.resumeText.toLowerCase().split(/\W+/));
    const jdWords = new Set(lastUpload.jobDescText.toLowerCase().split(/\W+/));
    const commonWords = [...resumeWords].filter(w => jdWords.has(w) && w.length > 2);
    const percentMatch = jdWords.size === 0 ? 0 : Math.round((commonWords.length / jdWords.size) * 100);

    res.json({
      result: `AI Match Score: ${percentMatch}%\n\nMatched Keywords: ${commonWords.slice(0, 20).join(", ")}${commonWords.length > 20 ? ", ..." : ""}`,
      matchPercent: percentMatch,
      matchedKeywords: commonWords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Server error during AI match." });
  }
});

module.exports = router;
