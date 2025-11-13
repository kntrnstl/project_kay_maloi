const express = require('express');
const router = express.Router();
const pool = require('../../db');
const adminAuth = require('../../middleware/adminAuth');

// GET all categories
router.get('/', adminAuth, async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
  res.json(rows);
});

// CREATE category
router.post('/', adminAuth, async (req, res) => {
  const { name } = req.body;
  const [result] = await pool.execute('INSERT INTO categories (name) VALUES (?)', [name]);
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
});

// UPDATE category
router.put('/:id', adminAuth, async (req, res) => {
  const { name } = req.body;
  await pool.execute('UPDATE categories SET name=? WHERE id=?', [name, req.params.id]);
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
});

// DELETE category
router.delete('/:id', adminAuth, async (req, res) => {
  await pool.execute('DELETE FROM categories WHERE id=?', [req.params.id]);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
