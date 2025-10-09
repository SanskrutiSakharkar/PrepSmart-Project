const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },  //  Include user info in token
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });  //  Send token and user back
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//  LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },  // Include user info in token
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });  // Send token and user back
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
