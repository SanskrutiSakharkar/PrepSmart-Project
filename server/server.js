// server/server.js
require('dotenv').config(); // Load .env variables first

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import route modules
const codingRoundRoutes = require('./routes/codingRound');
const techAnswersRoutes = require('./routes/techAnswers');
const techQuestionsRoutes = require('./routes/techQuestions');
const progressRoutes = require('./routes/progress');


const app = express();

// Connect to MongoDB
connectDB();

// CORS middleware (adjust origin if needed)
// server.js
app.use(cors({
  origin: ["http://localhost:3000", "http://54.221.107.160"],
  credentials: false
}));


// JSON parser (limit to prevent huge payloads)
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Main API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/analyze', require('./routes/analysisRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/voice-feedback', require('./routes/voiceFeedbackRoutes'));
app.use('/api/coding-round', codingRoundRoutes);
app.use('/api/tech-answers', techAnswersRoutes);
app.use('/api/tech-questions', techQuestionsRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ msg: 'API route not found' });
});


// General error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ msg: 'Server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
