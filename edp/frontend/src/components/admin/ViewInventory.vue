<template>
  <div>
    <h2>Inventory</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Sizes / Stock</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.product_id">
          <td>{{ product.product_id }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.category }}</td>
          <td>{{ product.price }}</td>
          <td>
            <ul>
              <li v-for="size in product.sizes" :key="size.id">
                {{ size.size }} : {{ size.stock }}
              </li>
            </ul>
          </td>
          <td>
            <button @click="deleteProduct(product.product_id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: []
    }
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      const res = await axios.get('/api/admin/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.products = res.data;
    },
    async deleteProduct(id) {
      if (!confirm('Are you sure?')) return;
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.fetchProducts();
    }
  }
}
</script>

<style scoped>
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { padding: 8px; border: 1px solid #ccc; text-align: left; }
button { margin-right: 5px; }
ul { padding-left: 15px; }
</style>
