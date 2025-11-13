const express = require('express');
const router = express.Router();
const pool = require('../../db'); // DB connection
const adminAuth = require('../../middleware/adminAuth'); // admin auth middleware

// Example: get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
