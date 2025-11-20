<template>
  <div class="modify-products-page">
    <h2 class="title">Manage Products</h2>

    <!-- Products Table -->
    <div class="table-container">
      <table class="products-table">
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
            <td>{{ product.category || "No Category" }}</td>
            <td>₱{{ product.price }}</td>

            <!-- Sizes -->
            <td>
              <div v-for="size in product.sizes" :key="size.id" class="size-tag">
                {{ size.size }} — Stock: {{ size.stock }}
              </div>
            </td>

            <td>
              <button class="edit-btn" @click="openEdit(product)">Edit</button>
              <button class="delete-btn" @click="deleteProduct(product.product_id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- EDIT MODAL -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <h3>Edit Product</h3>

        <label>Name</label>
        <input v-model="form.name" />

        <label>Description</label>
        <textarea v-model="form.description"></textarea>

        <label>Price</label>
        <input type="number" v-model="form.price" />

        <label>Category</label>
        <select v-model="form.category_id">
          <option disabled value="">Select category</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">
            {{ c.name }}
          </option>
        </select>

        <!-- SIZES -->
        <h4>Sizes & Stock</h4>

        <div class="size-list">
          <div v-for="s in form.sizes" :key="s.id" class="size-item">
            <strong>{{ s.size }}</strong>
            <input type="number" v-model="s.stock" class="stock-input" />
            <button class="update-stock-btn" @click="updateSizeStock(s)">Update</button>
            <button class="remove-size-btn" @click="deleteSize(s.id)">X</button>
          </div>
        </div>

        <!-- Add new size -->
        <div class="add-size-box">
          <input placeholder="Size" v-model="newSize.size" />
          <input placeholder="Stock" type="number" v-model="newSize.stock" />
          <button class="add-size-btn" @click="addSize">Add Size</button>
        </div>

        <div class="modal-actions">
          <button @click="updateProduct" class="save-btn">Save Changes</button>
          <button @click="closeModal" class="cancel-btn">Close</button>
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
      newSize: {
        size: "",
        stock: ""
      }
    };
  },

  methods: {
    async fetchProducts() {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.products = res.data;
    },

    async fetchCategories() {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/categories");
      this.categories = res.data;
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
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/admin/products/${this.form.id}`,
        {
          name: this.form.name,
          description: this.form.description,
          price: this.form.price,
          category_id: this.form.category_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.fetchProducts();
      this.closeModal();
    },

    async deleteProduct(id) {
      if (!confirm("Are you sure you want to delete this product?")) return;

      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.fetchProducts();
    },

    async updateSizeStock(size) {
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/admin/products/sizes/${size.id}`,
        { stock: size.stock },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Stock updated!");
      this.fetchProducts();
    },

    async deleteSize(sizeId) {
      if (!confirm("Delete size?")) return;

      const token = localStorage.getItem("token");

      await axios.delete(`/api/admin/products/sizes/${sizeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Size removed!");
      this.fetchProducts();
    },

    async addSize() {
      if (!this.newSize.size || !this.newSize.stock) {
        alert("Enter size and stock.");
        return;
      }

      const token = localStorage.getItem("token");

      await axios.post(
        `/api/admin/products/${this.form.id}/sizes`,
        {
          size: this.newSize.size,
          stock: this.newSize.stock,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.newSize = { size: "", stock: "" };
      this.fetchProducts();
    }
  },

  mounted() {
    this.fetchProducts();
    this.fetchCategories();
  },
};
</script>

<style scoped>
.modify-products-page {
  padding: 20px;
}

.title {
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.products-table th,
.products-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.size-tag {
  background: #eef;
  padding: 3px 6px;
  margin: 2px 0;
  border-radius: 4px;
  font-size: 12px;
}

.edit-btn {
  background: #007bff;
  color: white;
  padding: 5px 8px;
  margin-right: 5px;
  border: none;
  border-radius: 4px;
}

.delete-btn {
  background: #d9534f;
  color: white;
  padding: 5px 8px;
  border: none;
  border-radius: 4px;
}

/* MODAL */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  width: 450px;
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.modal-content input,
.modal-content textarea,
.modal-content select {
  width: 100%;
  padding: 8px;
  margin: 6px 0 12px 0;
}

.size-list {
  margin-bottom: 10px;
}

.size-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.stock-input {
  width: 70px;
  margin: 0 8px;
}

.update-stock-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 5px 8px;
  margin-right: 5px;
}

.remove-size-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 8px;
}

.add-size-box {
  display: flex;
  gap: 5px;
  margin-bottom: 15px;
}

.add-size-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
}

.modal-actions {
  text-align: right;
}

.save-btn {
  background: #28a745;
  color: white;
  padding: 8px 12px;
}

.cancel-btn {
  background: gray;
  color: white;
  padding: 8px 12px;
  margin-left: 5px;
}
</style>
