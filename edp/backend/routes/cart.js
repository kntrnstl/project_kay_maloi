const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authMiddleware');

// =========================
// GET CART ITEMS
// =========================
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create cart
    const [[cart]] = await pool.execute(
      "SELECT * FROM carts WHERE user_id = ?",
      [userId]
    );

    let cartId = null;

    if (!cart) {
      const [newCart] = await pool.execute(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
      );
      cartId = newCart.insertId;
      return res.json([]);  // cart exists but empty
    } else {
      cartId = cart.id;
    }

    // GET cart items with name + size
    const [items] = await pool.execute(
      `SELECT 
        ci.id,
        ci.product_id,
        ci.size_id,
        ci.quantity,
        ci.price,
        p.name,
        ps.size
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN product_sizes ps ON ps.id = ci.size_id
      WHERE ci.cart_id = ?`,
      [cartId]
    );

    res.json(items);

  } catch (err) {
    console.error("CART GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// ADD ITEM TO CART
// =========================
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, size_id, quantity, price } = req.body;

    // Get or create cart
    const [[cart]] = await pool.execute(
      "SELECT * FROM carts WHERE user_id = ?",
      [userId]
    );

    let cartId = null;

    if (!cart) {
      const [newCart] = await pool.execute(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId]
      );
      cartId = newCart.insertId;
    } else {
      cartId = cart.id;
    }

    // Check if item exists (same product + size)
    const [existing] = await pool.execute(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND size_id = ?",
      [cartId, product_id, size_id]
    );

    if (existing.length > 0) {
      await pool.execute(
        "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
        [quantity, existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO cart_items (cart_id, product_id, size_id, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [cartId, product_id, size_id, quantity, price]
      );
    }

    res.json({ message: "Added to cart" });

  } catch (err) {
    console.error("CART ADD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// UPDATE QUANTITY
// =========================
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    await pool.execute(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [quantity, req.params.itemId]
    );

    res.json({ message: "Cart updated" });

  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================
// REMOVE ITEM
// =========================
router.delete('/:itemId', auth, async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM cart_items WHERE id = ?",
      [req.params.itemId]
    );

    res.json({ message: "Item removed" });

  } catch (err) {
    console.error("DELETE CART ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
