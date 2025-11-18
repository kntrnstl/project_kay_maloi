<template>
  <div class="inventory-container">

    <div 
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

    <div v-if="confirmDelete.show" class="confirm-overlay">
      <div class="confirm-box">
        <p class="confirm-message">Are you sure you want to delete <strong>{{ confirmDelete.name }}</strong>?</p>
        <div class="confirm-actions">
          <button @click="confirmDeleteProduct" class="confirm-btn">Yes, Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <div class="header-section">
      <h2 class="page-title">Product Inventory 📦</h2>
      
      <div class="summary-card">
        <span class="summary-value">{{ products.length }}</span>
        <span class="summary-label">Total Products Listed</span>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th class="stock-col">Sizes & Stock</th>
            <th class="action-col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.product_id">
            <td class="id-col">{{ product.product_id }}</td>
            <td class="name-col">{{ product.name }}</td>
            <td><span class="category-tag">{{ product.category_name || 'Uncategorized' }}</span></td>
            <td class="price-col">₱{{ parseFloat(product.price).toFixed(2) }}</td>
            <td class="stock-col">
              <ul class="size-stock-list">
                <li v-for="size in product.sizes" :key="size.id" :class="{'low-stock': size.stock < 5 && size.stock > 0, 'out-stock': size.stock === 0}">
                  {{ size.size }} ({{ size.stock }})
                </li>
                <li v-if="product.sizes.length === 0" class="empty-stock">
                  — N/A —
                </li>
              </ul>
            </td>
            <td class="action-col">
              <button 
                class="icon-btn delete-btn" 
                @click="prepareDelete(product.product_id, product.name)"
                title="Delete Product"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5M10 11v6m4-6v6m-6-12h8m-11 0h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="6" class="no-data">No products available in the inventory.</td>
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
      },
      confirmDelete: {
        show: false,
        id: null,
        name: ''
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
        // NOTE: Adjusted URL to be relative, assume base URL is configured globally.
        const res = await axios.get('/api/admin/products', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        this.products = res.data.map(p => ({
          ...p,
          // Handle cases where category might be an object or just a string/null
          category_name: p.category?.name || p.category || 'Uncategorized',
          sizes: p.sizes || []
        }));

      } catch (err) {
        console.error(err);
        this.showNotification('error', 'Failed to fetch products');
      }
    },

    prepareDelete(id, name) {
      this.confirmDelete.id = id;
      this.confirmDelete.name = name;
      this.confirmDelete.show = true;
    },

    async confirmDeleteProduct() {
      try {
        await axios.delete(`/api/admin/products/${this.confirmDelete.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.showNotification('success', 'Product deleted successfully');
        this.fetchProducts();
      } catch (err) {
        console.error(err);
        this.showNotification('error', 'Failed to delete product');
      } finally {
        this.confirmDelete.show = false;
      }
    },

    cancelDelete() {
      this.confirmDelete.show = false;
    }
  }
}
</script>

<style scoped>
/* ---------------- Color Palette ---------------- */
/* Primary/Accent: #1A5E46 (Deep Forest Green) */
/* Secondary Accent: #00CC99 (Vibrant Mint) */
/* Background: #f5fdf9 (Very Pale Mint) */
/* White: #ffffff */

/* ---------------- Base Container ---------------- */
.inventory-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 40px;
  background: #ffffff;
  border-radius: 20px;
  /* Cleaner, single shadow */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  color: #071815;
  font-family: 'Inter', sans-serif;
}

/* ---------------- Header & Summary Card (New) ---------------- */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e0f5ea;
}

.page-title {
  color: #1A5E46; /* Deep Forest Green */
  font-weight: 800;
  font-size: 32px;
  margin: 0;
  letter-spacing: -0.5px;
}

.summary-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 25px;
    background: #e9fffb; /* Pale Mint BG */
    border: 1px solid #00CC99;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 204, 153, 0.1);
}

.summary-value {
    font-size: 28px;
    font-weight: 900;
    color: #1A5E46;
}

.summary-label {
    font-size: 14px;
    font-weight: 600;
    color: #00CC99;
    letter-spacing: 0.5px;
}

/* ---------------- Table Wrapper ---------------- */
.table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.05);
  border: 1px solid #e0f5ea;
}

/* ---------------- Modern Table ---------------- */
.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #ffffff;
}

/* Specific Column Widths for readability */
.id-col { width: 50px; }
.action-col { width: 90px; text-align: center; }
.stock-col { width: 200px; }
.price-col { width: 100px; }

/* ---------------- Table Header ---------------- */
thead th {
  text-align: left;
  padding: 16px 20px;
  background: #f5fdf9; /* Pale Mint Header BG */
  color: #1A5E46;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 2px solid #00CC99;
  letter-spacing: 0.2px;
  font-size: 15px;
  text-transform: uppercase;
}

/* ---------------- Table Body ---------------- */
tbody td {
  padding: 14px 20px;
  color: #333;
  border-bottom: 1px solid #e0f5ea;
  vertical-align: top;
  transition: background-color 0.3s ease;
}

tbody tr:hover {
  background: #f0fff6;
}

/* Category Tag */
.category-tag {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 8px;
    background: #e9fffb;
    color: #1A5E46;
    font-weight: 600;
    font-size: 13px;
    border: 1px solid #00CC99;
}

/* ---------------- Sizes List ---------------- */
.size-stock-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
  line-height: 1.6;
}
.size-stock-list li {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}
.low-stock {
    color: #ffaa00; /* Amber for warning */
    font-weight: 700;
}
.out-stock {
    color: #d62828; /* Red for critical */
    font-weight: 700;
}
.empty-stock {
    font-style: italic;
    color: #777;
}

/* ---------------- Action Button (Icon Style) ---------------- */
.icon-btn {
    background: none;
    border: 2px solid transparent;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icon-btn svg {
    width: 20px;
    height: 20px;
}

.delete-btn {
  color: #d62828; /* Red icon color */
}
.delete-btn:hover {
    background: rgba(255, 0, 0, 0.1);
    border-color: #d62828;
}

/* ---------------- Notifications ---------------- */
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
  transition: all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  z-index: 9999;
}
.custom-notif.show {
  top: 30px;
  opacity: 1;
  pointer-events: auto;
}
.custom-notif.success {
  background: #00CC99; /* Solid Mint Success */
  box-shadow: 0 5px 15px rgba(0, 204, 153, 0.3);
  color: #1A5E46;
}
.custom-notif.error {
  background: #d62828;
  box-shadow: 0 5px 15px rgba(214, 40, 40, 0.3);
}

/* ---------------- Confirmation Modal ---------------- */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5); /* Slightly darker overlay */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.25s forwards;
}

.confirm-box {
  background: white;
  padding: 30px 40px;
  border-radius: 15px;
  max-width: 450px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3);
  transform: scale(0.95);
  animation: scaleUp 0.25s forwards;
}
.confirm-message {
  font-size: 18px;
  margin-bottom: 25px;
  font-weight: 500;
  color: #333;
}
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}
.confirm-btn, .cancel-btn {
  padding: 12px 25px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}
.confirm-btn {
  background: #d62828; /* Solid Red for delete action */
  color: #fff;
}
.confirm-btn:hover {
  background: #b82323;
  transform: translateY(-1px);
}
.cancel-btn {
  background: #f0f0f0;
  color: #555;
}
.cancel-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

/* ---------------- Animations ---------------- */
@keyframes fadeIn { to { opacity:1; } }
@keyframes scaleUp { to { transform: scale(1); } }

/* ---------------- Empty Table Text ---------------- */
.no-data {
  text-align: center;
  font-style: italic;
  color: #666;
  padding: 30px 0 !important; /* Important to override smaller cell padding */
  font-size: 16px !important;
  background: #fcfcfc;
}

/* ---------------- Responsive Table ---------------- */
@media(max-width:900px){
    .inventory-container {
        padding: 20px;
        margin: 20px auto;
    }
    .header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    .page-title { font-size: 28px; }
    .modern-table th,
    .modern-table td { padding:12px 10px; font-size:14px; }
    .size-stock-list li { font-size:13px; }
    .action-col { text-align: left; }
}
</style>