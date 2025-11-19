// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // your MySQL pool
require('dotenv').config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS  // App password (NOT normal password)
  }
});

// =====================
// REGISTER (USER only)
// =====================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Gmail-only check (optional)
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Only Gmail accounts allowed." });
    }

    // Check duplicate
    const [existingUser] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.execute(
      "INSERT INTO users (username, email, password, role, verified, verification_code) VALUES (?, ?, ?, 'user', 0, ?)",
      [username, email, hashedPassword, code]
    );

    // Email sender
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is: ${code}`
    });

    res.status(201).json({ message: "Verification code sent to your Gmail!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// =====================
// LOGIN (User or Admin)
// =====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: 'Invalid email or password' });

    const user = rows[0];

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    if (user.verified === 0) {
  return res.status(400).json({ message: "Please verify your email first." });
}

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post("/resend", async (req, res) => {
  const { email } = req.body;

  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0)
    return res.status(400).json({ message: "Email not found" });

  if (rows[0].verified === 1)
    return res.status(400).json({ message: "Email is already verified" });

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  await pool.execute(
    "UPDATE users SET verification_code = ? WHERE email = ?",
    [newCode, email]
  );

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your new verification code",
    text: `Your verification code is: ${newCode}`
  });

  res.json({ message: "Verification code resent!" });
});

// =====================
// VERIFY EMAIL
// =====================
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Email not found" });

    const user = rows[0];

    if (user.verified === 1)
      return res.status(400).json({ message: "Email already verified" });

    if (user.verification_code !== code)
      return res.status(400).json({ message: "Invalid verification code" });

    await pool.execute(
      "UPDATE users SET verified = 1, verification_code = NULL WHERE email = ?",
      [email]
    );

    // AUTO-LOGIN: generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
