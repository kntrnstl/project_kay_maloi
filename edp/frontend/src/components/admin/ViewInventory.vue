<template>
  <div class="inventory-container">

    <!-- Modern Notification -->
    <div 
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

    <h2>Inventory</h2>

    <div class="table-wrapper">
      <table class="modern-table">
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
            <td>{{ product.category_name || 'Uncategorized' }}</td>
            <td>₱{{ parseFloat(product.price).toFixed(2) }}</td>
            <td>
              <ul>
                <li v-for="size in product.sizes" :key="size.id">
                  {{ size.size }} : {{ size.stock }}
                </li>
                <li v-if="product.sizes.length === 0" class="empty">
                  No sizes
                </li>
              </ul>
            </td>
            <td>
              <button class="delete-btn" @click="deleteProduct(product.product_id)">
                🗑️ Delete
              </button>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="6" class="no-data">No products available</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      notification: {
        show: false,
        message: '',
        type: ''
      }
    }
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    showNotification(type, message) {
      this.notification.type = type;
      this.notification.message = message;
      this.notification.show = true;
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },

    async fetchProducts() {
      try {
        const res = await axios.get('/api/admin/products', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        // Map data to ensure category_name exists
        this.products = res.data.map(p => ({
          ...p,
          category_name: p.category?.name || p.category || 'Uncategorized',
          sizes: p.sizes || []
        }));

      } catch (err) {
        console.error(err);
        this.showNotification('error', 'Failed to fetch products');
      }
    },

    async deleteProduct(id) {
      if (!confirm('Are you sure you want to delete this product?')) return;
      try {
        await axios.delete(`/api/admin/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.showNotification('success', 'Product deleted successfully');
        this.fetchProducts();
      } catch (err) {
        console.error(err);
        this.showNotification('error', 'Failed to delete product');
      }
    }
  }
}
</script>

<style scoped>
.inventory-container {
  max-width: 1000px;
  margin: auto;
  padding: 25px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  color: #071815;
  font-family: 'Inter', sans-serif;
}

h2 {
  color: #0a3c2b;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

thead th {
  text-align: left;
  padding: 14px;
  background: #f5fdf9;
  color: #0a3c2b;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 2px solid #1a5e46;
}

tbody td {
  padding: 12px 14px;
  color: #0a3c2b;
  border-bottom: 1px solid #e0f5ea;
  vertical-align: middle;
}

tbody tr:hover {
  background: #f0fff6;
  transition: background 0.3s ease;
}

tbody ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

tbody li {
  font-size: 14px;
  margin-bottom: 4px;
}

tbody li.empty {
  font-style: italic;
  color: #666;
}

.delete-btn {
  background: linear-gradient(135deg, #ff4d4d, #ff1a1a);
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}
.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.4);
}

/* Modern Notification */
.custom-notif {
  position: fixed;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 25px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  color: white;
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s ease;
  z-index: 9999;
}

.custom-notif.show {
  top: 20px;
  opacity: 1;
  pointer-events: auto;
}

.custom-notif.success {
  background: linear-gradient(135deg, #00b061, #00773d);
  box-shadow: 0 5px 15px rgba(0, 255, 150, 0.3);
}

.custom-notif.error {
  background: linear-gradient(135deg, #d62828, #9b1d1d);
  box-shadow: 0 5px 15px rgba(255, 0, 0, 0.3);
}

.no-data {
  text-align: center;
  font-style: italic;
  color: #666;
  padding: 12px 0;
}

@media(max-width:900px){
  .modern-table th,
  .modern-table td {
    padding: 10px 8px;
    font-size: 14px;
  }
}
</style>
