const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// GET USER ORDERS + ITEMS
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get orders of this user
    const [orders] = await pool.execute(
      `SELECT id AS order_id, total, status, created_at
       FROM orders 
       WHERE user_id = ?
       ORDER BY id DESC`,
      [userId]
    );

    // Get items inside each order
    for (let order of orders) {
      const [items] = await pool.execute(
        `SELECT 
          oi.id AS item_id,
          p.name AS product_name,
          ps.size AS size,
          oi.quantity,
          oi.price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_sizes ps ON oi.size_id = ps.id
        WHERE oi.order_id = ?`,
        [order.order_id]
      );

      order.items = items;
    }

    res.json(orders);

  } catch (err) {
    console.error("MY ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
