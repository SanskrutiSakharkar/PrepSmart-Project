const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

router.post('/resume', authenticate, upload.single('file'), (req, res) => {
  res.json({
    message: "Resume uploaded successfully",
    filePath: req.file.path,
    uploadedBy: req.user.id
  });
});

module.exports = router;
