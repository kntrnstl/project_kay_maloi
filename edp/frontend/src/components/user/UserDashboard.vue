<template>
  <div class="user-dashboard">
    <!-- Navbar -->
    <nav class="navbar">
      <h1 class="logo">MyShop</h1>
      <ul class="nav-links">
        <li><a href="#" @click.prevent="currentView='home'">Home</a></li>
        <li><a href="#" @click.prevent="currentView='products'">Products</a></li>
        <li><a href="#" @click.prevent="currentView='cart'">Cart ({{ cart.length }})</a></li>
        <li><a href="#" @click.prevent="currentView='contact'">Contact</a></li>
        <li><button @click="logout" class="logout-btn">Logout</button></li>
      </ul>
    </nav>

    <!-- Views -->
    <div class="view-container">
      <HomeView v-if="currentView==='home'" />
      <ProductsView
        v-if="currentView==='products'"
        :cart="cart"
        @add-to-cart="addToCart"
      />
      <CartView
        v-if="currentView==='cart'"
        :cart="cart"
        @update-cart="updateCart"
        @remove-item="removeFromCart"
      />
      <ContactView v-if="currentView==='contact'" />
    </div>
  </div>
</template>

<script>
import HomeView from './HomeView.vue'
import ProductsView from './ProductsView.vue'
import CartView from './CartView.vue'
import ContactView from './ContactView.vue'
import { useRouter } from 'vue-router'

export default {
  components: { HomeView, ProductsView, CartView, ContactView },
  data() {
    return {
      currentView: 'home',
      cart: JSON.parse(localStorage.getItem('cart') || '[]')
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.setItem('cart', JSON.stringify(this.cart)) // persist cart
      const router = useRouter()
      router.push('/')
    },
    addToCart(item) {
      const existing = this.cart.find(
        i => i.product_id === item.product_id && i.size === item.size
      )
      if (existing) {
        existing.quantity += item.quantity
      } else {
        this.cart.push(item)
      }
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },
    updateCart(updatedCart) {
      this.cart = updatedCart
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
      localStorage.setItem('cart', JSON.stringify(this.cart))
    }
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: #2d2d2d;
  color: #fff;
}
.nav-links {
  display: flex;
  list-style: none;
  gap: 15px;
}
.nav-links a {
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}
.logout-btn {
  background: red;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
.view-container {
  padding: 20px;
}
</style>
