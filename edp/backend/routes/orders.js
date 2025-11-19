const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Insert order with DEFAULT status = 'pending'
    const [orderResult] = await pool.execute(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending')",
      [userId, total]
    );

    const orderId = orderResult.insertId;

    // Insert order_items (NO size_id if not existing)
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, size_id, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.size_id, item.quantity, item.price]
      );
    }

    // Clear cart_items only
    await pool.execute(
      "DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = ?)",
      [userId]
    );

    res.json({ message: "Order placed successfully!" });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
