const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

console.log("📡 auth.js loaded");

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed, role });
    await user.save();

    // ✅ Generate JWT token after registration
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Send token back
    res.status(201).json({
      msg: 'User created',
      token,
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating user', error: err.message });
  }
});

// ✅ PUBLIC: Login route
router.post("/login", async (req, res) => {
  try {
    console.log("🛂 Login endpoint hit");

    const { username, password } = req.body;
    console.log("📨 Received:", username, password ? "(password provided)" : "(no password)");

    if (!username || !password) {
      return res.status(400).json({ msg: "Missing username or password" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is undefined");
      return res.status(500).json({ msg: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ Login success for:", username);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error("🔥 Login route error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


module.exports = router;
