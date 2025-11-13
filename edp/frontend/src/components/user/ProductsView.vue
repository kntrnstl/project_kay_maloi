<template>
  <div class="products-view">
    <h2>Products</h2>

    <!-- Search -->
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
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
        <p>Category: {{ product.category }}</p>
        <p>Price: ₱{{ product.price }}</p>

        <!-- Sizes -->
        <label>
          Size:
          <select v-model="selectedSize[product.product_id]">
            <option
              v-for="size in product.sizes"
              :key="size.id"
              :value="size"
            >
              {{ size.size }} (Stock: {{ size.stock }})
            </option>
          </select>
        </label>

        <!-- Quantity -->
        <label>
          Quantity:
          <input
            type="number"
            v-model.number="quantity[product.product_id]"
            min="1"
            :max="selectedSize[product.product_id]?.stock || 1"
          />
        </label>

        <button @click="addToCart(product)">Add to Cart</button>
      </div>
    </div>

    <p v-if="!filteredProducts.length">No products found.</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: ['cart'],
  data() {
    return {
      products: [],
      searchQuery: '',
      selectedSize: {},
      quantity: {}
    }
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products
      return this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  async created() {
    try {
      const res = await axios.get('/api/products')
      this.products = res.data

      // Initialize selected size and quantity for each product
      this.products.forEach(p => {
        this.selectedSize[p.product_id] = p.sizes[0] || null
        this.quantity[p.product_id] = 1
      })
    } catch (err) {
      console.error(err)
    }
  },
  methods: {
    addToCart(product) {
      const size = this.selectedSize[product.product_id]
      const qty = this.quantity[product.product_id]

      if (!size) {
        alert('Please select a size')
        return
      }

      if (qty < 1 || qty > size.stock) {
        alert(`Quantity must be between 1 and ${size.stock}`)
        return
      }

      // Emit event to parent to update cart
      this.$emit('add-to-cart', {
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        size: size.size,
        size_id: size.id,
        quantity: qty
      })

      alert(`${product.name} added to cart!`)
    }
  }
}
</script>

<style scoped>
.products-view {
  padding: 20px;
}

.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
}

.product-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
}

label {
  display: block;
  margin-top: 10px;
}

button {
  margin-top: 10px;
  padding: 8px 12px;
  cursor: pointer;
  background-color: #2d2d2d;
  color: #fff;
  border: none;
  border-radius: 4px;
}
</style>
