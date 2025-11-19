const express = require("express");
const router = express.Router();
const pool = require("../../db");
const auth = require("../../middleware/authMiddleware");

// ===========================
// GET ALL ORDERS + USER + ITEMS + PRODUCT DETAILS
// ===========================
router.get("/", auth, async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all orders with user info
    const [orders] = await pool.execute(
      `SELECT 
        o.id AS order_id,
        o.user_id,
        o.total,
        o.status,
        o.created_at,
        u.username
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.id DESC`
    );

    // Get order items for each order
    for (let order of orders) {
      const [items] = await pool.execute(
        `SELECT 
           oi.id,
           oi.product_id,
           oi.size_id,
           oi.quantity,
           oi.price,
           p.name AS product_name,
           ps.size AS size
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         JOIN product_sizes ps ON ps.id = oi.size_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );

      order.items = items; // attach items to each order
    }

    res.json(orders);

  } catch (err) {
    console.error("ADMIN ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===========================
// UPDATE STATUS
// ===========================
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    await pool.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    res.json({ message: "Status updated" });

  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
