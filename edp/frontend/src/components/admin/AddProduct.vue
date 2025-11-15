<template>
  <div class="add-product-container">

    <!-- Modern Custom Notification -->
    <div 
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

    <h2>Add Product</h2>

    <!-- Product Name -->
    <input 
      v-model="form.name" 
      type="text" 
      placeholder="Product Name"
    />
    <p v-if="errors.name" class="error">{{ errors.name }}</p>

    <!-- Description -->
    <textarea 
      v-model="form.description" 
      placeholder="Description"
    ></textarea>
    <p v-if="errors.description" class="error">{{ errors.description }}</p>

    <!-- Price with Peso Sign -->
    <div class="input-with-symbol">
      <span class="symbol">₱</span>
      <input 
        v-model.number="form.price" 
        type="number" 
        min="0" 
        step="0.01" 
        placeholder="Price"
      />
    </div>
    <p v-if="errors.price" class="error">{{ errors.price }}</p>

    <!-- Category Select -->
    <select v-model="form.category_id">
      <option disabled :value="null">Select Category</option>
      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
        {{ cat.name }}
      </option>
    </select>
    <p v-if="errors.category_id" class="error">{{ errors.category_id }}</p>

    <!-- Sizes Section -->
    <div class="sizes-section">

      <!-- Add Size Card -->
      <div class="card add-size-card">
        <h4>Add Size & Stock</h4>
          <div class="sizes-inputs">
            <input 
              v-model="newSize.size" 
              type="text"
              placeholder="Size"
              maxlength="2"
            />

          <input 
            v-model.number="newSize.stock" 
            type="number"
            min="0"
            placeholder="Stock"
          />
          <button @click="addSize">Add</button>
        </div>

        <p v-if="errors.sizes" class="error">{{ errors.sizes }}</p>
      </div>

      <!-- Added Sizes Card -->
      <div class="card added-size-card">
        <h4 class="title">Added Sizes and Stocks</h4>

        <ul class="size-list">
          <li 
            v-for="(s, index) in form.sizes" 
            :key="index" 
            class="size-item"
          >
            <span><b>Size:</b> {{ s.size }}</span>
            <span><b>Stock:</b> {{ s.stock }}</span>

            <button 
              class="remove-btn"
              @click="removeSize(index)"
            >
              ✕
            </button>
          </li>

          <li v-if="form.sizes.length === 0" class="empty">
            No sizes added yet
          </li>
        </ul>
      </div>

    </div>

    <!-- Submit Button -->
    <button class="submit-btn" @click="submitProduct">Add Product</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      categories: [],

      form: {
        name: '',
        description: '',
        price: '',
        category_id: null,
        sizes: []
      },

      newSize: { size: '', stock: '' },

      errors: {},

      // Custom Notification
      notification: {
        show: false,
        message: '',
        type: '' // "success" or "error"
      }
    }
  },

  watch: {
    "form.name"(v) { if (v) this.errors.name = null },
    "form.description"(v) { if (v) this.errors.description = null },
    "form.price"(v) { if (v > 0) this.errors.price = null },
    "form.category_id"(v) { if (v) this.errors.category_id = null },
    "form.sizes"(v) { if (v.length > 0) this.errors.sizes = null },
    "newSize.size"(v) { if (v) this.errors.sizes = null },
    "newSize.stock"(v) { if (v >= 0) this.errors.sizes = null }
  },

  async created() {
    try {
      const res = await axios.get('/api/admin/categories', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      })
      this.categories = res.data
    } catch (err) {
      console.error(err)
    }
  },

  methods: {
    // Show modern custom notification
    showNotification(type, message) {
      this.notification.type = type;
      this.notification.message = message;
      this.notification.show = true;

      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },

    addSize() {
      if (!this.newSize.size || this.newSize.stock === '') {
        this.errors.sizes = "Please enter size and stock."
        return
      }
      if (this.newSize.size > 99) {
        this.errors.sizes = "Size can only have up to 2 digits."
        return
      }

      this.form.sizes.push({ ...this.newSize })
      this.newSize = { size: '', stock: '' }
    },

    removeSize(index) {
      this.form.sizes.splice(index, 1)
    },

    validateForm() {
      this.errors = {}

      if (!this.form.name) this.errors.name = "Product name is required."
      if (!this.form.description) this.errors.description = "Description is required."
      if (!this.form.price || this.form.price <= 0) this.errors.price = "Price must be greater than 0."
      if (!this.form.category_id) this.errors.category_id = "Please select a category."
      if (this.form.sizes.length === 0) this.errors.sizes = "Add at least one size and stock."

      return Object.keys(this.errors).length === 0
    },

    async submitProduct() {
      if (!this.validateForm()) {
        this.showNotification("error", "Please fix the errors before submitting.");
        return;
      }

      try {
        const { sizes, ...productData } = this.form

        const res = await axios.post('/api/admin/products', productData, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })

        const productId = res.data.id

        for (let s of sizes) {
          await axios.post(`/api/admin/products/${productId}/sizes`, s, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
          })
        }

        // Reset form
        this.form = { name: '', description: '', price: '', category_id: null, sizes: [] }
        this.newSize = { size: '', stock: '' }

        this.showNotification("success", "Product successfully added!");

      } catch (err) {
        this.showNotification("error", "Something went wrong while adding the product.");
      }
    }
  }
}
</script>

<style scoped>
.add-product-container {
  max-width: 600px;
  margin: auto;
  padding: 25px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  color: #071815;
  font-family: 'Inter', sans-serif;
}

h2 {
  color: #0a3c2b;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
}

.add-product-container input,
.add-product-container textarea,
.add-product-container select {
  width: 100%;
  padding: 12px 15px;
  margin: 10px 0;
  border-radius: 12px;
  border: 1px solid #1a5e46;
  background: #f5fdf9;
  color: #0a3c2b;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.add-product-container input:focus,
.add-product-container textarea:focus,
.add-product-container select:focus {
  border-color: #041c12;
  box-shadow: 0 0 8px 2px rgba(4, 28, 18, 0.7);
}

.add-product-container textarea {
  height: 90px;
  resize: none;
}

.input-with-symbol {
  position: relative;
  width: 100%;
  margin: 10px 0;
}
.input-with-symbol .symbol {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #0a3c2b;
  font-weight: 600;
  pointer-events: none;
}
.input-with-symbol input {
  padding-left: 28px;
}

.sizes-section {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.card {
  background: #f5fdf9;
  padding: 20px;
  border-radius: 15px;
  flex: 1;
  min-width: 250px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}
.card h4 {
  font-weight: 600;
  color: #0a3c2b;
  margin-bottom: 15px;
}

.sizes-inputs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.sizes-inputs input {
  flex: 1;
  height: 45px;
}
.sizes-inputs button {
  height: 45px;
  padding: 0 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #1a5e46, #0a3c2b);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.sizes-inputs button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,255,128,0.3);
}

.added-size-card ul {
  padding-left: 0;
  list-style: none;
}
.added-size-card ul li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #0a3c2b;
}
.added-size-card ul li button {
  padding: 3px 8px;
  font-size: 12px;
  border-radius: 8px;
  border: none;
  background: #ff4d4d;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.added-size-card ul li button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(255, 77, 77, 0.3);
}
.added-size-card ul li.empty {
  font-style: italic;
  color: #666;
}

.submit-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #0a3c2b, #1a5e46);
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 45px;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,255,128,0.2);
}

.error {
  color: #d10000;
  font-size: 13px;
  margin-top: -5px;
  margin-bottom: 8px;
  padding-left: 3px;
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
</style>
