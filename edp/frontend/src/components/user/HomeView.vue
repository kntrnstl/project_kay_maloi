<template>
  <div class="home-view">
    <h2>Welcome to MyShop!</h2>
    <p>Discover our amazing products and special offers.</p>

    <div class="featured-products">
      <h3>Featured Products</h3>
      <div class="products-grid">
        <div v-for="product in featuredProducts" :key="product.id" class="product-card">
          <h4>{{ product.name }}</h4>
          <p>{{ product.description }}</p>
          <p>Price: ${{ product.price.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      featuredProducts: []
    }
  },
  async created() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      // For demo, take first 4 as featured
      this.featuredProducts = res.data.slice(0, 4)
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
.home-view {
  text-align: center;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 15px;
}
.product-card {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
