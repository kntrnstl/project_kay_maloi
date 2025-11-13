<template>
  <div>
    <h2>Categories</h2>
    <form @submit.prevent="addCategory">
      <input v-model="newCategory" placeholder="New Category" required />
      <button type="submit">Add</button>
    </form>

    <ul>
      <li v-for="cat in categories" :key="cat.id">
        <input v-model="cat.name" @blur="updateCategory(cat)" />
        <button @click="deleteCategory(cat.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
      newCategory: ''
    }
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      const res = await axios.get('/api/admin/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.categories = res.data;
    },
    async addCategory() {
      await axios.post('/api/admin/categories', { name: this.newCategory }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.newCategory = '';
      this.fetchCategories();
    },
    async updateCategory(cat) {
      await axios.put(`/api/admin/categories/${cat.id}`, { name: cat.name }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    },
    async deleteCategory(id) {
      if (!confirm('Delete category?')) return;
      await axios.delete(`/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.fetchCategories();
    }
  }
}
</script>
