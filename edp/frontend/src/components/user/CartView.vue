<template>
  <div class="cart-view">
    <div class="header">
      <h2 class="title">Shopping Cart</h2>
      <p class="subtitle" v-if="cart.length">{{ cart.length }} item(s) in cart</p>
    </div>

    <div class="cart-content">
      <!-- Cart Items Table: Uses original table structure wrapped in new card design -->
      <div v-if="cart.length" class="cart-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cart" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.size }}</td>
              <!-- Using original price display -->
              <td>₱{{ item.price }}</td>
              <td class="qty-col">
                <!-- Using original input logic -->
                <input type="number" v-model.number="item.quantity" min="1" @change="updateQuantity(item)" />
              </td>
              <td>₱{{ (item.price * item.quantity).toFixed(2) }}</td>
              <td>
                <!-- Using original remove logic with styled class -->
                <button @click="removeItem(item.id)" class="remove-btn">X</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty Cart State -->
      <div v-else class="empty-cart">
        <p>Your cart is empty. Time to find some great products!</p>
        <!-- FIXED: Replaced router-link with a button using a method -->
        <router-link to="/products" class="btn-shop-now">Go to Shop</router-link>
      </div>

      <!-- Cart Footer: Total and Checkout -->
      <div v-if="cart.length" class="cart-footer">
        <p class="total-price">
          Total: <span>₱{{ totalPrice.toFixed(2) }}</span>
        </p>
        <!-- Using original checkout logic with styled button -->
        <button @click="checkout" :disabled="!cart.length" class="checkout-btn">
          Checkout
        </button>
      </div>
    </div>

    <!-- Custom Notification Element (for replacing alert()) -->
    <div :class="['custom-notif', notification.type, { show: notification.show }]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      // Original data state
      cart: [],
      // ADDED: Notification state (required to replace alert())
      notification: {
        show: false,
        message: '',
        type: 'success' // 'success' or 'error'
      },
      notificationTimer: null
    }
  },
  computed: {
    totalPrice() {
      // Original computed logic (must be kept)
      return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    }
  },
  methods: {
    // NEW: Method to handle navigation without explicit routing
    goToProducts() {
      // This emits an event. Your main application component should listen
      // for this event and handle the actual navigation (e.g., this.$router.push('/products')
      // or changing the active component).
      this.$emit('navigate-to-products');
      this.showNotification('Navigating to the product shop...', 'success');
      console.log('--- CART VIEW: Emitting "navigate-to-products" event. Parent component must handle navigation. ---');
    },

    // ADDED: Notification method (required to replace alert())
    showNotification(message, type = 'success') {
      this.notification.message = message
      this.notification.type = type
      this.notification.show = true

      clearTimeout(this.notificationTimer)
      this.notificationTimer = setTimeout(() => {
        this.notification.show = false
      }, 3000)
    },
    
    // Original fetchCart logic (must be kept)
    async fetchCart() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.cart = res.data
      } catch (err) {
        console.error('Fetch cart error:', err)
      }
    },
    async updateQuantity(item) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(
          `/api/cart/${item.id}`,
          { quantity: item.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        await this.fetchCart()
        // Replaced alert()
        this.showNotification('Quantity updated successfully.', 'success')
      } catch (err) {
        // Replaced alert()
        this.showNotification('Failed to update quantity.', 'error')
      }
    },
    async removeItem(itemId) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`/api/cart/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        await this.fetchCart()
        // Replaced alert()
        this.showNotification('Item removed from cart.', 'error')
      } catch (err) {
        // Replaced alert()
        this.showNotification('Failed to remove item.', 'error')
      }
    },
    async checkout() {
      try {
        const token = localStorage.getItem('token')
        // Replaced alert()
        if (!token) return this.showNotification('Please login first.', 'error')

        await axios.post(
          '/api/orders',
          {
            items: this.cart.map(item => ({
              product_id: item.product_id,
              size_id: item.size_id,
              quantity: item.quantity,
              price: item.price
            })),
            total: this.totalPrice
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // Replaced alert()
        this.showNotification('Order placed successfully!', 'success')
        this.cart = []
        await this.fetchCart()
      } catch (err) {
        // Replaced alert()
        const message = err.response?.data?.message || 'Checkout failed.'
        this.showNotification(message, 'error')
      }
    }
  },
  async mounted() {
    await this.fetchCart()
  }
}
</script>

<style scoped>
/* ---------------- Base Styling ---------------- */
.cart-view {
  font-family: 'Inter', sans-serif;
  max-width: 1000px;
  margin: 30px auto;
  padding: 0 20px;
  background: #f5f7f6; /* Matching background */
  color: #071815; /* Matching text color */
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 40px;
}
.title {
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #041c12; /* Darker heading color */
  margin-bottom: 5px;
}
.subtitle {
  font-size: 18px;
  color: #0a3c2b; /* Dark green accent */
}

/* Cart Card (Table Container) */
.cart-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); /* Matching shadow */
  overflow-x: auto;
  margin-bottom: 20px;
}

.cart-card table {
  width: 100%;
  border-collapse: collapse;
}

.cart-card th, .cart-card td {
  text-align: left;
  padding: 15px 12px;
}

.cart-card th {
  background: #e9fffb; /* Light accent background */
  font-weight: 700;
  color: #041c12;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}
.cart-card th:first-child { border-top-left-radius: 12px; }
.cart-card th:last-child { border-top-right-radius: 12px; }


.cart-card tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.3s ease;
}

.cart-card tbody tr:last-child {
  border-bottom: none;
}

.cart-card tbody tr:hover {
  background: #f0fdf4; /* Subtle hover */
}

/* Quantity Input */
.qty-col {
  width: 100px;
}
.cart-card input[type="number"] {
  width: 70px;
  padding: 8px 5px;
  border-radius: 8px;
  border: 1px solid #ddd;
  text-align: center;
  transition: 0.25s ease;
  font-size: 1rem;
}
.cart-card input[type="number"]:focus {
  border-color: #00ffcc; /* Mint color focus */
  outline: 2px solid rgba(0, 255, 204, 0.4);
}

/* Remove Button - styled for contrast */
.remove-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  /* Adjusting to fit the original 'X' text */
  font-weight: 700; 
}
.remove-btn:hover {
  background: #e63946;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

/* Cart Footer: Total and Checkout */
.cart-footer {
  margin-top: 30px;
  padding: 20px 30px;
  border-radius: 12px;
  background: #e9fffb; /* Light accent background */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-price {
  font-size: 1.4rem;
  font-weight: 600;
  color: #041c12;
}
.total-price span {
  font-size: 2rem;
  font-weight: 800;
  color: #00ffcc; /* Mint accent color */
  margin-left: 10px;
}

.checkout-btn {
  /* Using the exact gradient style from .btn-shop-now */
  background: linear-gradient(135deg, #00ffcc, #00cc99);
  color: #071815;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  padding: 12px 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}
.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  background: #a0a0a0;
  color: #fff;
}
.checkout-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 255, 128, 0.3); /* Mint shadow */
}

/* Empty cart */
.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
.empty-cart p {
  font-weight: 600;
  color: #071815;
  margin-bottom: 20px;
}
/* Reusing the shop now button style (now applied to a button) */
.btn-shop-now {
  padding: 12px 25px;
  background: linear-gradient(135deg, #00ffcc, #00cc99);
  color: #071815;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none; /* For router-link */
  display: inline-block;
}
.btn-shop-now:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 255, 128, 0.3);
}

/* Custom Notification - styles adapted to match the aesthetic */
.custom-notif {
  position: fixed;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 25px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  color: #071815; /* Dark text for success/mint background */
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 9999;
}
.custom-notif.show { top: 30px; opacity:1; pointer-events:auto; }
.custom-notif.success { 
  background: #00ffcc; 
  box-shadow: 0 5px 15px rgba(0, 255, 204, 0.3); 
}
.custom-notif.error { 
  background: #e63946; 
  color: white; /* White text for error/red background */
  box-shadow: 0 5px 15px rgba(230,57,70,0.3); 
}
</style>