// server/routes/upload.js
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Set up Multer to store files locally in /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // create this folder manually in server/
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// JWT Middleware to protect upload route
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // this adds user info to req object
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Upload Endpoint
router.post('/resume', authenticate, upload.single('file'), (req, res) => {
  // File is uploaded and available in req.file
  // Authenticated user's info is in req.user
  res.json({
    message: "Resume uploaded successfully",
    filePath: req.file.path,
    uploadedBy: req.user.id
  });
});

module.exports = router;
