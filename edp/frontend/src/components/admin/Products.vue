<template>
  <div class="products-page">
    <h1>Products</h1>

    <!-- Create / Update form -->
    <form @submit.prevent="editing ? updateProduct() : createProduct()" class="form-container">
      <input v-model="productName" placeholder="Product Name" required />
      <select v-model="categoryId" required>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
      <input v-model.number="price" type="number" placeholder="Price" required />

      <div class="form-buttons">
        <button type="submit">{{ editing ? 'Update' : 'Create' }}</button>
        <button v-if="editing" type="button" @click="cancelEdit">Cancel</button>
      </div>
    </form>

    <!-- Products Table -->
    <table class="products-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.category_name }}</td>
          <td>{{ product.price }}</td>
          <td>
            <button @click="editProduct(product)">Edit</button>
            <button @click="deleteProduct(product.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      categories: [],
      productName: '',
      categoryId: '',
      price: null,
      editing: false,
      editId: null,
      message: ''
    };
  },
  mounted() {
    this.getProducts();
    this.getCategories();
  },
  methods: {
    async getProducts() {
      try {
        const res = await axios.get('/api/admin/products', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.products = res.data;
      } catch (err) {
        this.message = err.response?.data?.message || 'Error fetching products';
      }
    },
    async getCategories() {
      try {
        const res = await axios.get('/api/admin/categories', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.categories = res.data;
      } catch (err) {
        this.message = err.response?.data?.message || 'Error fetching categories';
      }
    },
    async createProduct() {
      try {
        await axios.post('/api/admin/products', {
          name: this.productName,
          category_id: this.categoryId,
          price: this.price
        }, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.message = 'Product created';
        this.resetForm();
        this.getProducts();
      } catch (err) {
        this.message = err.response?.data?.message || 'Error creating product';
      }
    },
    editProduct(product) {
      this.editing = true;
      this.editId = product.id;
      this.productName = product.name;
      this.categoryId = product.category_id;
      this.price = product.price;
    },
    async updateProduct() {
      try {
        await axios.put(`/api/admin/products/${this.editId}`, {
          name: this.productName,
          category_id: this.categoryId,
          price: this.price
        }, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.message = 'Product updated';
        this.resetForm();
        this.getProducts();
      } catch (err) {
        this.message = err.response?.data?.message || 'Error updating product';
      }
    },
    async deleteProduct(id) {
      if (!confirm('Are you sure you want to delete this product?')) return;
      try {
        await axios.delete(`/api/admin/products/${id}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        this.message = 'Product deleted';
        this.getProducts();
      } catch (err) {
        this.message = err.response?.data?.message || 'Error deleting product';
      }
    },
    cancelEdit() {
      this.resetForm();
    },
    resetForm() {
      this.editing = false;
      this.editId = null;
      this.productName = '';
      this.categoryId = '';
      this.price = null;
      this.message = '';
    }
  }
};
</script>

<style scoped>
.products-page {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background-color: #111;
  color: #eee;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(255,255,255,0.1);
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 8px #fff;
}

.form-container {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.form-container input,
.form-container select {
  padding: 8px 12px;
  flex: 1;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: rgba(255,255,255,0.05);
  color: #fff;
  outline: none;
  box-shadow: 0 0 10px rgba(255,255,255,0.1);
}

.form-buttons {
  display: flex;
  gap: 10px;
  width: 100%;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  background-color: #222;
  color: #fff;
  cursor: pointer;
  flex: 1;
  box-shadow: 0 0 8px rgba(255,255,255,0.1);
  transition: all 0.2s;
}

button:hover {
  box-shadow: 0 0 12px rgba(255,255,255,0.3);
  background-color: #333;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.products-table th,
.products-table td {
  border: 1px solid #444;
  padding: 10px;
  text-align: left;
}

.products-table th {
  background-color: #222;
}

.products-table td {
  background-color: rgba(255,255,255,0.05);
}

.message {
  margin-top: 15px;
  color: #7CFC00; /* neon green glow style */
  text-align: center;
  text-shadow: 0 0 8px #7CFC00;
}
</style>
