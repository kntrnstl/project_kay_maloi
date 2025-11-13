<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li @click="currentView = 'inventory'">View Inventory</li>
        <li @click="currentView = 'addProduct'">Add Product</li>
        <li @click="currentView = 'manageProduct'">Modify Product</li>
        <li @click="currentView = 'categories'">Categories</li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <component :is="currentViewComponent" />
    </main>
  </div>
</template>

<script>
// Import the sub-components (views) for CRUD
import ViewInventory from './ViewInventory.vue'
import AddProduct from './AddProduct.vue'
import ManageProduct from './ManageProduct.vue'
import Categories from './Categories.vue'

export default {
  data() {
    return {
      currentView: 'inventory' // default selected view
    }
  },
  computed: {
    currentViewComponent() {
      switch(this.currentView) {
        case 'inventory': return ViewInventory
        case 'addProduct': return AddProduct
        case 'manageProduct': return ManageProduct
        case 'categories': return Categories
        default: return ViewInventory
      }
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 220px;
  background-color: #111;
  color: #fff;
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 20px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 15px 0;
  cursor: pointer;
  transition: 0.2s;
}

.sidebar li:hover {
  color: #00ffcc; /* glow effect for hover */
}

.main-content {
  flex: 1;
  padding: 30px;
  background-color: #f5f5f5;
}
</style>
