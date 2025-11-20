const express = require("express");
const router = express.Router();
const pool = require("../../db");
const auth = require("../../middleware/authMiddleware");

router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
});


// ========================================
// 1. TOTAL SALES (STATUS: delivered)
// ========================================
router.get("/total-sales", async (req, res) => {
  try {
    const [result] = await pool.execute(`
      SELECT SUM(total) AS total_sales
      FROM orders
      WHERE status = 'delivered'
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("TOTAL SALES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 2. TOTAL USERS
// ========================================
router.get("/total-users", async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT COUNT(*) AS total_users FROM users
    `);

    res.json(users[0]);
  } catch (err) {
    console.error("TOTAL USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 3. ORDERS SUMMARY
// ========================================
router.get("/orders-summary", async (req, res) => {
  try {
    const [summary] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) AS count
      FROM orders
      GROUP BY status
    `);

    res.json(summary);
  } catch (err) {
    console.error("ORDER SUMMARY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 4. SALES PER DAY
// ========================================
router.get("/sales-per-day", async (req, res) => {
  try {
    const { start, end } = req.query;

    const [data] = await pool.execute(
      `
      SELECT 
        DATE(created_at) AS date,
        SUM(total) AS daily_sales
      FROM orders
      WHERE status = 'delivered'
      AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
      `,
      [start, end]
    );

    res.json(data);

  } catch (err) {
    console.error("SALES PER DAY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 5. TOP SELLING PRODUCTS
// ========================================
router.get("/top-products", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.name,
        SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'delivered'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    console.error("TOP PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 6. MONTHLY SALES
// ========================================
router.get("/monthly-sales", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(total) AS monthly_sales
      FROM orders
      WHERE status = 'delivered'
      GROUP BY month
      ORDER BY month ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("MONTHLY SALES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
