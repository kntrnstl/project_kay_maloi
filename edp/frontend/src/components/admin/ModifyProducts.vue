<template>
  <div class="modify-products-page">

    <!-- Custom Notification -->
    <div 
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

    <!-- Header -->
    <div class="header">
      <h2 class="title">Manage Products 🛒</h2>
    </div>

    <!-- Products Table -->
    <div class="table-container">
      <table class="products-table modern-table">
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
            <td><span class="category-tag">{{ product.category || "No Category" }}</span></td>
            <td>₱{{ parseFloat(product.price).toFixed(2) }}</td>

            <!-- Sizes -->
            <td>
              <ul class="size-stock-list">
                <li v-for="size in product.sizes" :key="size.id" :class="{'low-stock': size.stock < 5 && size.stock > 0, 'out-stock': size.stock === 0}">
                  {{ size.size }} ({{ size.stock }})
                </li>
                <li v-if="product.sizes.length === 0" class="empty-stock">— N/A —</li>
              </ul>
            </td>

            <td class="actions">
              <!-- Edit button as pencil icon using Font Awesome -->
                <button class="icon-btn btn-edit" @click="openEdit(product)" title="Edit Product">
                  <i class="fas fa-pencil-alt"></i>
                </button>

              <!-- Delete button with confirmation -->
              <button class="icon-btn btn-delete" @click="prepareDelete(product.product_id, product.name)" title="Delete Product">
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

    <!-- EDIT MODAL -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <h3>Edit Product</h3>
        <div class="modal-body">
          <label>Name</label>
          <input v-model="form.name" placeholder="Product Name" />

          <label>Description</label>
          <textarea v-model="form.description" placeholder="Description"></textarea>

          <label>Price</label>
          <input type="number" v-model="form.price" placeholder="₱" />

          <label>Category</label>
          <select v-model="form.category_id">
            <option disabled value="">Select category</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>

          <h4>Sizes & Stock</h4>
          <div class="size-list">
            <div v-for="s in form.sizes" :key="s.id" class="size-item">
              <span class="size-name">{{ s.size }}</span>
              <input type="number" v-model="s.stock" class="stock-input" />
                <button class="btn-check" @click="updateSizeStock(s)" title="Update Stock">
                  <i class="fas fa-check"></i>
                </button>
                  <button class="btn-remove" @click="prepareDeleteSize(s)" title="Delete Size">
                    <i class="fas fa-trash-alt"></i>
                  </button>
            </div>
          </div>

          <div class="add-size-box">
            <input placeholder="Size" v-model="newSize.size" />
            <input placeholder="Stock" type="number" v-model="newSize.stock" />
            <button class="btn-add-size" @click="addSize">Add Size</button>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="updateProduct" class="btn-save">Save Changes</button>
          <button @click="closeModal" class="btn-cancel">Close</button>
        </div>
      </div>
    </div>
      <!-- Size Delete Confirmation -->
      <div v-if="sizeConfirmDelete.show" class="confirm-overlay">
        <div class="confirm-box">
          <p class="confirm-message">Are you sure you want to delete size <strong>{{ sizeConfirmDelete.sizeName }}</strong>?</p>
          <div class="confirm-actions">
            <button @click="confirmDeleteSize" class="confirm-btn">Yes</button>
            <button @click="cancelDeleteSize" class="cancel-btn">No</button>
          </div>
        </div>
      </div>


  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ModifyProducts",
  data() {
    return {
      products: [],
      categories: [],
      showModal: false,
      form: {
        id: null,
        name: "",
        description: "",
        price: 0,
        category_id: "",
        sizes: [],
      },
      newSize: { size: "", stock: "" },
      notification: { show: false, message: "", type: "" },
      confirmDelete: { show: false, id: null, name: "" },
      sizeConfirmDelete: { show: false, id: null, sizeName: "" },
    };
  },

  methods: {
    showNotification(type, message) {
      this.notification.type = type;
      this.notification.message = message;
      this.notification.show = true;
      setTimeout(() => (this.notification.show = false), 3000);
    },

    async fetchProducts() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } });
        this.products = res.data;
      } catch (err) {
        console.error(err);
        this.showNotification("error", "Failed to fetch products");
      }
    },
      // called when clicking the trash icon
        prepareDeleteSize(size) {
          this.sizeConfirmDelete.id = size.id;
          this.sizeConfirmDelete.sizeName = size.size;
          this.sizeConfirmDelete.show = true;
        },
    async fetchCategories() {
      try {
        const res = await axios.get("/api/categories");
        this.categories = res.data;
      } catch (err) {
        console.error(err);
      }
    },
      cancelDeleteSize() {
    this.sizeConfirmDelete.show = false;
  },

    openEdit(product) {
      this.form = JSON.parse(JSON.stringify(product));
      this.form.id = product.product_id;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.newSize = { size: "", stock: "" };
    },

    async updateProduct() {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`/api/admin/products/${this.form.id}`, this.form, { headers: { Authorization: `Bearer ${token}` } });
        this.fetchProducts();
        this.closeModal();
        this.showNotification("success", "Product updated successfully");
      } catch (err) {
        console.error(err);
        this.showNotification("error", "Failed to update product");
      }
    },

    prepareDelete(id, name) {
      this.confirmDelete.id = id;
      this.confirmDelete.name = name;
      this.confirmDelete.show = true;
    },

    async confirmDeleteProduct() {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/admin/products/${this.confirmDelete.id}`, { headers: { Authorization: `Bearer ${token}` } });
        this.showNotification("success", "Product deleted successfully");
        this.fetchProducts();
      } catch (err) {
        console.error(err);
        this.showNotification("error", "Failed to delete product");
      } finally {
        this.confirmDelete.show = false;
      }
    },

    cancelDelete() {
      this.confirmDelete.show = false;
    },

    async updateSizeStock(size) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`/api/admin/products/sizes/${size.id}`, { stock: size.stock }, { headers: { Authorization: `Bearer ${token}` } });
        this.showNotification("success", "Stock updated!");
        this.fetchProducts();
      } catch (err) {
        console.error(err);
        this.showNotification("error", "Failed to update stock");
      }
    },

        async deleteSize(sizeId) {
          try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/admin/products/sizes/${sizeId}`, { headers: { Authorization: `Bearer ${token}` } });
            this.showNotification("success", "Size removed successfully!");
            this.fetchProducts();
          } catch (err) {
            console.error(err);
            this.showNotification("error", "Failed to remove size");
          }
        },

          async confirmDeleteSize() {
            try {
              const token = localStorage.getItem("token");
              await axios.delete(`/api/admin/products/sizes/${this.sizeConfirmDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              // Remove size from form.sizes immediately so modal updates
              this.form.sizes = this.form.sizes.filter(
                (s) => s.id !== this.sizeConfirmDelete.id
              );

              this.showNotification("success", "Size removed!");
            } catch (err) {
              console.error(err);
              this.showNotification("error", "Failed to remove size");
            } finally {
              this.sizeConfirmDelete.show = false;
            }
          },
        async addSize() {
          if (!this.newSize.size || !this.newSize.stock) {
            this.showNotification("error", "Enter size and stock");
            return;
          }
          try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
              `/api/admin/products/${this.form.id}/sizes`,
              this.newSize,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Add the new size directly to modal
            this.form.sizes.push(res.data);

            this.newSize = { size: "", stock: "" };
            this.showNotification("success", "Size added!");
          } catch (err) {
            console.error(err);
            this.showNotification("error", "Failed to add size");
          }
        },
  },
  mounted() {
    this.fetchProducts();
    this.fetchCategories();
  },
};
</script>

<style scoped>
/* Use the first code table styles */
.modify-products-page {
  padding: 30px;
  font-family: 'Inter', sans-serif;
  background: #f5fdf9;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 32px;
  font-weight: 800;
  color: #1A5E46;
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.05);
  border: 1px solid #e0f5ea;
}

.products-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
}

.products-table th {
  text-align: left;
  padding: 16px 20px;
  background: #f5fdf9;
  color: #0a3c2b;
  font-weight: 700;
  border-bottom: 2px solid #0a3c2b;
  position: sticky;
  top: 0;
}

.products-table td {
  padding: 14px 20px;
  color: #333;
  border-bottom: 1px solid #e0f5ea;
  vertical-align: top;
  transition: background-color 0.3s ease;
}

.products-table tbody tr:hover {
  background: #f0fff6;
}

.category-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: #0a3c2b;
  color: white;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid #00CC99;
}

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
  color: #ffaa00;
  font-weight: 700;
}

.out-stock {
  color: #d62828;
  font-weight: 700;
}

.empty-stock {
  font-style: italic;
  color: #777;
}

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

.icon-btn i {
  font-size: 16px; /* adjust size */
  display: block;
}


.btn-edit { color: #1e7952; }
.btn-edit:hover { background: rgba(0, 204, 153, 0.1); border-color: #1e7952; }

.btn-delete { color: #d62828; }
.btn-delete:hover { background: rgba(255, 0, 0, 0.1); border-color: #d62828; }

/* Notifications */
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
.custom-notif.success { background: #00CC99; box-shadow: 0 5px 15px rgba(0, 204, 153, 0.3); color: #1A5E46; }
.custom-notif.error { background: #d62828; box-shadow: 0 5px 15px rgba(214, 40, 40, 0.3); }

/* Modal backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Pop-up modal animation & compressed */
.modal-content {
  width: 500px;
  max-width: 95%;
  max-height: 85vh; /* compressed max height */
  background: #f5fdf9;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.2);
  transform: scale(0.8);
  opacity: 0;
  animation: modalPop 0.35s forwards;
  border: 2px solid #00CC99;
  display: flex;
  flex-direction: column;
}

/* Modal backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55); /* slightly darker for contrast */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Pop-up modal animation & compressed */
.modal-content {
  width: 480px;
  max-width: 95%;
  max-height: 85vh; /* compressed max height */
  background: #0a3c2b; /* main dark green */
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
  transform: scale(0.8);
  opacity: 0;
  animation: modalPop 0.35s forwards;
  border: 2px solid #00CC99;
  display: flex;
  flex-direction: column;
  color: #e0f5ea; /* light text for readability */
  font-family: 'Inter', sans-serif;
}

/* Scrollable content */
.modal-body {
  overflow-y: auto;
  padding-right: 5px;
}


/* Scrollbar */
.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-track {
  background: #144732;
  border-radius: 6px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: #00CC99;
  border-radius: 6px;
}

/* Modal header */
.modal-content h3 {
  font-size: 22px;
  font-weight: 700;
  color: #00CC99;
  margin-bottom: 15px;
  border-bottom: 1px solid #00CC99;
  padding-bottom: 6px;
}

/* Inputs and textarea */
.modal-body input,
.modal-body textarea {
  width: 95%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #00CC99;
  font-size: 14px;
  color: #0a3c2b;
  background: #e0f5ea;
  transition: all 0.3s ease;
}

.modal-body select{
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #00CC99;
  font-size: 14px;
  color: #0a3c2b;
  background: #e0f5ea;
  transition: all 0.3s ease;
}

.modal-body input:focus,
.modal-body select:focus,
.modal-body textarea:focus {
  outline: none;
  box-shadow: 0 0 6px rgba(0, 204, 153, 0.6);
  border-color: #00CC99;
}

/* Sizes list */
.size-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px; /* scrollable */
  overflow-y: auto;
}

.size-item {
  display: flex;
  align-items: center; /* vertically centers input & buttons */
  gap: 10px; /* spacing between elements */
}

.size-name {
  flex: 1;
  font-weight: 600;
  padding-bottom: 12px;
  color: #e0f5ea;
}
.stock-input {
  width: 65px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid #00CC99;
}

/* Buttons */
.btn-remove {
  padding: 8px 10px;
  margin-bottom: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-add-size {
  padding: 10px 198px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  margin-left: 1px;
  align-items: center;
}

.btn-remove { background: #d62828; color: #fff; }
.btn-remove:hover { background: #ff4c4c; }

.btn-add-size { background: #00CC99; color: #0a3c2b; }
.btn-add-size:hover { background: #1A5E46; color: #e0f5ea; }

.btn-check {
  background: #00CC99;
  color: #0a3c2b;
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-check:hover {
  background: #1A5E46;
  color: #e0f5ea;
}

.btn-check i {
  font-size: 16px; /* size of the check icon */
}


/* Modal actions */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}


.btn-save { background: #00CC99; color: #0a3c2b; padding: 10px 16px; border-radius: 12px; }
.btn-save:hover { background: #1A5E46; color: #e0f5ea; }

.btn-cancel { background: #d62828; color: #fff; padding: 10px 16px; border-radius: 12px; }
.btn-cancel:hover { background: #ff4c4c; }

/* Modal pop animation */
@keyframes modalPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Confirmation Modal */
.confirm-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:10000; }
.confirm-box { background:white; padding:25px 30px; border-radius:20px; text-align:center; max-width:400px; box-shadow:0 12px 28px rgba(0,0,0,0.25); }
.confirm-message { margin-bottom:20px; font-weight:600; color:#071815; }
.confirm-actions { display:flex; justify-content:space-around; }
.confirm-btn { padding:10px 22px; border-radius:12px; border:none; background: linear-gradient(135deg,#00b061,#00773d); color:#fff; font-weight:600; cursor:pointer; transition:all 0.3s ease;}
.confirm-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(0,255,150,0.3);}
.cancel-btn { padding:10px 22px; border-radius:12px; border:none; background: linear-gradient(135deg,#d62828,#9b1d1d); color:#fff; font-weight:600; cursor:pointer; transition:all 0.3s ease;}
.cancel-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(255,0,0,0.3);}
</style>
