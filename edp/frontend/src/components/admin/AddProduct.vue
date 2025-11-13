<template>
  <div class="add-product-container">
    <h2>Add Product</h2>

    <input v-model="form.name" placeholder="Product Name" />
    <textarea v-model="form.description" placeholder="Description"></textarea>
    <input v-model.number="form.price" type="number" placeholder="Price" />
    <select v-model="form.category_id">
      <option v-for="cat in categories" :value="cat.id" :key="cat.id">
        {{ cat.name }}
      </option>
    </select>

    <div class="sizes-container">
      <h4>Sizes & Stock</h4>
      <input v-model="newSize.size" placeholder="Size" />
      <input v-model.number="newSize.stock" type="number" placeholder="Stock" />
      <button @click="addSize">Add Size</button>

      <ul>
        <li v-for="(s, index) in form.sizes" :key="index">
          {{ s.size }} : {{ s.stock }}
          <button @click="removeSize(index)">x</button>
        </li>
      </ul>
    </div>

    <button @click="submitProduct">Add Product</button>
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
        price: 0,
        category_id: null,
        sizes: []
      },
      newSize: { size: '', stock: 0 }
    }
  },
  async created() {
    const res = await axios.get('/api/admin/categories', {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    })
    this.categories = res.data
  },
  methods: {
    addSize() {
      if (this.newSize.size && this.newSize.stock >= 0) {
        this.form.sizes.push({ ...this.newSize })
        this.newSize = { size: '', stock: 0 }
      } else {
        alert('Please enter size and stock')
      }
    },
    removeSize(index) {
      this.form.sizes.splice(index, 1)
    },
    async submitProduct() {
      try {
        // Create product
        const { sizes, ...productData } = this.form
        const res = await axios.post('/api/admin/products', productData, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
        const productId = res.data.id

        // Add sizes
        for (let s of sizes) {
          await axios.post(`/api/admin/products/${productId}/sizes`, s, {
            headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
          })
        }

        alert('Product added successfully!')
        // reset form
        this.form = { name: '', description: '', price: 0, category_id: null, sizes: [] }
        this.newSize = { size: '', stock: 0 }
      } catch (err) {
        alert(err.response?.data?.message || 'Error adding product')
      }
    }
  }
}
</script>

<style scoped>
.add-product-container { padding: 20px; max-width: 500px; margin: auto; }
input, textarea, select { display: block; margin: 10px 0; width: 100%; padding: 5px; }
.sizes-container { margin-top: 15px; }
button { margin-top: 10px; padding: 8px 12px; }
ul { padding-left: 15px; margin-top: 10px; }
ul li { margin-bottom: 5px; }
</style>
