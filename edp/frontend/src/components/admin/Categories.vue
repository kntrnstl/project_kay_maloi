<template>
  <div class="category-container">

    <div 
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

    <div v-if="confirmDelete.show" class="confirm-overlay">
      <div class="confirm-box">
        <p class="confirm-message">Are you sure you want to delete <strong>{{ confirmDelete.name }}</strong>? This cannot be undone.</p>
        <div class="confirm-actions">
          <button @click="confirmDeleteCategory" class="confirm-btn">Yes, Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <h2 class="page-title">Manage Categories 🏷️</h2>

    <div class="add-card">
      <input 
        v-model="newCategory"
        type="text"
        placeholder="Enter new category name"
        class="input-modern"
        @keyup.enter="addCategory"
      />
      <button class="btn-add-modern" @click="addCategory">
        + Add Category
      </button>
    </div>

    <div class="category-list">
      <div 
        class="category-card"
        v-for="cat in categories"
        :key="cat.id"
      >
        <input 
          v-model="cat.name"
          @blur="updateCategory(cat)"
          class="category-input"
        />
        <button 
            class="btn-delete-modern icon-btn" 
            @click="prepareDelete(cat.id, cat.name)"
            title="Delete Category"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 5v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5M10 11v6m4-6v6m-6-12h8m-11 0h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>

      <p v-if="categories.length === 0" class="empty">
        No categories found. Start by adding one above.
      </p>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      categories: [],
      newCategory: "",
      notification: {
        show: false,
        type: "",
        message: ""
      },
      confirmDelete: {
        show: false,
        id: null,
        name: ""
      }
    };
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    showNotif(type, msg) {
      this.notification.type = type;
      this.notification.message = msg;
      this.notification.show = true;

      setTimeout(() => (this.notification.show = false), 2500);
    },

    async fetchCategories() {
      try {
        const res = await axios.get("/api/admin/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        this.categories = res.data;
      } catch (err) {
        this.showNotif("error", "Failed to load categories");
      }
    },

    async addCategory() {
      if (!this.newCategory.trim()) {
        this.showNotif("error", "Category name cannot be empty");
        return;
      }

      try {
        await axios.post(
          "/api/admin/categories",
          { name: this.newCategory },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );

        this.showNotif("success", "Category added");
        this.newCategory = "";
        this.fetchCategories();
      } catch (err) {
        this.showNotif("error", "Failed to add category");
      }
    },

    async updateCategory(cat) {
      if (!cat.name.trim()) {
        this.showNotif("error", "Category cannot be empty");
        // Re-fetch to revert local changes if possible, or handle error state
        this.fetchCategories(); 
        return;
      }

      try {
        await axios.put(
          `/api/admin/categories/${cat.id}`,
          { name: cat.name },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );

        this.showNotif("success", "Updated successfully");
      } catch (err) {
        this.showNotif("error", "Update failed");
      }
    },

    prepareDelete(id, name) {
      this.confirmDelete.id = id;
      this.confirmDelete.name = name;
      this.confirmDelete.show = true;
    },

    async confirmDeleteCategory() {
      try {
        await axios.delete(`/api/admin/categories/${this.confirmDelete.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        this.showNotif("success", "Category deleted");
        this.fetchCategories();
      } catch {
        this.showNotif("error", "Delete failed");
      } finally {
        this.confirmDelete.show = false;
      }
    },

    cancelDelete() {
      this.confirmDelete.show = false;
    }
  }
};
</script>

<style scoped>
/* ---------------- Color Palette ---------------- */
/* Primary/Action: #1A5E46 (Deep Forest Green) */
/* Secondary Accent: #00CC99 (Vibrant Mint) */
/* Background: #f5fdf9 (Very Pale Mint) */
/* Red: #d62828 */

/* ---------------- Base Container ---------------- */
.category-container {
    max-width: 700px;
    margin: 40px auto;
    padding: 35px;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    font-family: 'Inter', sans-serif;
    color: #1A5E46;
}

/* ---------------- Header ---------------- */
.page-title {
    color: #1A5E46;
    font-weight: 800;
    font-size: 28px;
    margin-bottom: 30px;
    text-align: center;
    letter-spacing: -0.2px;
}

/* ---------------- Add Card (Input/Button) ---------------- */
.add-card { 
    display: flex; 
    gap: 15px; 
    margin-bottom: 35px; 
}

.input-modern { 
    flex: 1; 
    padding: 14px 18px; 
    border-radius: 12px; 
    border: 1px solid #cce8dd; 
    outline: none; 
    font-size: 16px; 
    color: #333;
    background: #f5fdf9;
    transition: all 0.3s ease;
}

.input-modern:focus { 
    border-color: #00CC99; 
    box-shadow: 0 0 0 3px rgba(0, 204, 153, 0.2); 
    background: #ffffff;
}

.btn-add-modern { 
    background: #1A5E46; /* Deep Green Solid for primary action */
    color: white; 
    padding: 14px 25px; 
    border: none; 
    border-radius: 12px; 
    cursor: pointer; 
    font-weight: 600; 
    font-size: 16px;
    transition: all 0.3s ease; 
}

.btn-add-modern:hover { 
    background: #00CC99; 
    transform: translateY(-2px); 
    box-shadow: 0 8px 18px rgba(0, 204, 153, 0.3); 
}

/* ---------------- Category List ---------------- */
.category-list { 
    display: flex; 
    flex-direction: column; 
    gap: 12px; 
}

.category-card { 
    display: flex; 
    align-items: center; 
    padding: 8px 15px 8px 20px;
    background: #fcfcfc;
    border: 1px solid #e0f5ea; 
    border-radius: 12px; 
    justify-content: space-between; 
    transition: all 0.3s ease;
}

.category-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #00CC99;
    background: #f0fff6;
}

.category-input { 
    flex: 1; 
    padding: 8px 0; /* Padding inside the card padding */
    border: none; 
    background: transparent; 
    font-size: 16px; 
    font-weight: 500;
    color: #1A5E46;
    outline: none; 
}

.category-input:focus { 
    /* Use a light highlight for active editing */
    border-bottom: 2px solid #00CC99;
}

.empty { 
    text-align: center; 
    font-style: italic; 
    padding-top: 20px; 
    color: #777; 
}

/* ---------------- Delete Button (Icon Style) ---------------- */
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
    width: 18px;
    height: 18px;
}

.btn-delete-modern {
    color: #d62828; /* Red icon color */
}
.btn-delete-modern:hover {
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
  background: #00CC99;
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
    background: rgba(0,0,0,0.5); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
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
    background: #d62828; 
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

@keyframes fadeIn {
  to { opacity: 1; }
}
@keyframes scaleUp {
  to { transform: scale(1); }
}

/* ---------------- Responsive ---------------- */
@media (max-width: 550px) {
    .category-container {
        margin: 20px 15px;
        padding: 25px;
    }
    .add-card {
        flex-direction: column;
        gap: 10px;
    }
    .btn-add-modern {
        width: 100%;
    }
    .confirm-actions {
        flex-direction: column;
        gap: 10px;
    }
    .confirm-btn, .cancel-btn {
        min-width: 100%;
    }
}
</style>