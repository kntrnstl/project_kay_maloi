<template>
  <div class="products-view">
    <div class="header">
      <h2 class="title">Explore Our Products 🛍️</h2>
    </div>

    <input
      v-model="searchQuery"
      placeholder="Search products..."
      class="search-input"
    />

    <div class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product.product_id"
        class="product-card"
      >
        <div class="product-image-placeholder">
          <span class="product-price-badge">₱{{ product.price }}</span>
        </div>
        
        <div class="card-content">
          <h3>{{ product.name }}</h3>
          <p class="description">{{ product.description }}</p>
          <p class="category">Category: <span>{{ product.category }}</span></p>

          <label class="input-label">
            Size:
            <select v-model="selectedSize[product.product_id]" class="input-select">
              <option
                v-for="size in product.sizes"
                :key="size.id"
                :value="size"
              >
                {{ size.size }} (Stock: {{ size.stock }})
              </option>
            </select>
          </label>

          <label class="input-label">
            Quantity:
            <input
              type="number"
              v-model.number="quantity[product.product_id]"
              min="1"
              class="input-qty"
              :max="selectedSize[product.product_id]?.stock || 1"
            />
          </label>

          <div class="buttons">
            <button class="btn-add-cart" @click="addToCart(product)">
              Add to Cart
            </button>
            <button class="btn-details" @click="showDetails(product.product_id)">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="!filteredProducts.length" class="no-products">
      No products match your search.
    </p>



    <div :class="['custom-notif', notification.type, { show: notification.show }]">
      {{ notification.message }}
    </div>

 <ProductDetails
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
    />
  </div>
</template>

<script>
import axios from 'axios'
import ProductDetails from './ProductDetails.vue' // Keep original import path

export default {
  components: { ProductDetails },
  data() {
    return {
      products: [],
      searchQuery: '',
      selectedSize: {},
      quantity: {},
      selectedProduct: null,
      // ADDED: Notification state
      notification: {
        show: false,
        message: '',
        type: 'success' // 'success' or 'error'
      },
      notificationTimer: null
    }
  },
  computed: {
    // KEPT: Original computed logic
    filteredProducts() {
      if (!this.searchQuery) return this.products
      return this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  async created() {
    // KEPT: Original created hook/fetch logic
    try {
      const res = await axios.get('http://localhost:3000/api/products')
      this.products = res.data
      this.products.forEach(p => {
        this.selectedSize[p.product_id] = p.sizes[0] || null
        this.quantity[p.product_id] = 1
      })
    } catch (err) {
      console.error(err)
      this.showNotification('Failed to load products.', 'error')
    }
  },
  methods: {
    // ADDED: Notification method (replacing alert())
    showNotification(message, type = 'success') {
      this.notification.message = message
      this.notification.type = type
      this.notification.show = true

      clearTimeout(this.notificationTimer)
      this.notificationTimer = setTimeout(() => {
        this.notification.show = false
      }, 3000)
    },
    async addToCart(product) {
      const size = this.selectedSize[product.product_id]
      const qty = this.quantity[product.product_id]

      // Replaced alert() with notification
      if (!size) return this.showNotification('Please select a size', 'error')
      if (qty < 1 || qty > size.stock) return this.showNotification(`Quantity must be between 1 and ${size.stock}`, 'error')

      const token = localStorage.getItem('token')
      // Replaced alert() with notification
      if (!token) return this.showNotification('Please login first.', 'error')

      try {
        // KEPT: Original axios post logic
        await axios.post(
          'http://localhost:3000/api/cart',
          { product_id: product.product_id, size_id: size.id, quantity: qty, price: product.price },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        // Replaced alert() with notification
        this.showNotification(`${product.name} added to cart!`, 'success')
      } catch (err) {
        console.error(err)
        // Replaced alert() with notification
        const message = err.response?.data?.message || 'Failed to add to cart'
        this.showNotification(message, 'error')
      }
    },
    async showDetails(productId) {
      try {
        // KEPT: Original details fetching logic
        const res = await axios.get(`http://localhost:3000/api/products/${productId}`)
        this.selectedProduct = res.data
      } catch (err) {
        // Replaced alert() with notification
        this.showNotification('Failed to fetch product details', 'error')
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
/* ---------------- Base Styling (Mint Theme) ---------------- */
.products-view {
  font-family: 'Inter', sans-serif;
  max-width: 1200px;
  margin: 0px auto;
  padding: 10px 20px 40px;
  border-radius: 10px;
  background: #ecf0ee; /* Matching background */
  color: #071815; /* Matching text color */
}

.header {
  text-align: center;
  margin-bottom: 40px;
}
.title {
  font-family: 'Poppins', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #041c12;
}

/* --- Search Input --- */
.search-input {
  width: 100%;
  max-width: 450px;
  padding: 12px 18px;
  margin: 0 auto 40px auto;
  display: block;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  font-size: 1rem;
}
.search-input:focus {
  border-color: #0f3d2e;
  outline: 2px solid #0f3d2e;
}

/* --- Products Grid --- */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.product-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  /* CHANGED: Dark background on hover */
  background: #0f3d2e; 
  /* CHANGED: Text elements inside card need to be white for contrast */
  color: #f5f7f6;
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 255, 204, 0.2);
}

/* Ensure text inside the card is readable when card is dark */
.product-card:hover h3, 
.product-card:hover .description,
.product-card:hover .category,
.product-card:hover .category span,
.product-card:hover .input-label,
.product-card:hover .input-label:not(button) {
    color: #f5f7f6; /* Light color for contrast */
}

.product-image-placeholder {
  background: linear-gradient(135deg, #e9fffb, #d5f7ee);
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #00ffcc;
}

.product-price-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #00ffcc;
  color: #041c12;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 22px;
  color: #041c12;
  margin-bottom: 8px;
}
.description {
  font-size: 14px;
  color: #555;
  margin-bottom: 15px;
  flex-grow: 1;
}

.category {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
}
.category span {
  font-weight: 700;
  color: #0a3c2b;
}

/* --- Input Styling (Size/Quantity) --- */
.input-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.input-select, .input-qty {
  width: 60%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: 0.2s;
  font-size: 1rem;
}
.input-select:focus, .input-qty:focus {
  border-color: #00cc99;
  outline: 1px solid rgba(0, 204, 153, 0.5);
}
.input-qty {
  width: 50px; /* Smaller width for quantity */
  text-align: center;
}

/* --- Button Group --- */
.buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.buttons button {
  flex: 1;
  padding: 12px 0;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-cart {
  background: linear-gradient(135deg, #00ffcc, #00cc99);
  color: #071815;
}
.btn-add-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 255, 128, 0.3);
}

.btn-details {
  background: #ffffff;
  color: #0a3c2b;
  border: 2px solid #00cc99;
}
.btn-details:hover {
  /* CHANGED: Dark background on hover */
  background: #0f3d2e;
  /* CHANGED: White text for contrast */
  color: #ffffff; 
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.no-products {
  text-align: center;
  font-weight: 600;
  color: #555;
  padding: 40px;
}

/* --- Custom Notification (Copied from Cart) --- */
.custom-notif {
  position: fixed;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 25px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 9999;
}
.custom-notif.show { top: 30px; opacity:1; pointer-events:auto; }
.custom-notif.success { 
  background: #00ffcc; 
  color: #071815;
  box-shadow: 0 5px 15px rgba(0, 255, 204, 0.3); 
}
.custom-notif.error { 
  background: #e63946; 
  color: white; 
  box-shadow: 0 5px 15px rgba(230,57,70,0.3); 
}
</style>