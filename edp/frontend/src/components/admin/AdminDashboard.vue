<template>
  <div class="admin-dashboard">

    <!-- Header -->
    <header class="admin-header">
      <div class="header-left">
        <div class="hamburger" @click="toggleSidebar">
          <div :class="{ bar: true, change1: sidebarOpen }"></div>
          <div :class="{ bar: true, change2: sidebarOpen }"></div>
          <div :class="{ bar: true, change3: sidebarOpen }"></div>
        </div>
        <h1>Admin Panel</h1>
      </div>
    </header>

    <!-- Body -->
    <div class="dashboard-body">

      <!-- Sidebar -->
      <aside :class="['sidebar', { closed: !sidebarOpen }]">
        <ul class="sidebar-menu">
          <li @click="selectView('inventory')" :class="{ active: currentView==='inventory' }">
            <span class="icon">📦</span>
            <transition name="slide-fade" mode="out-in">
              <span v-if="showText" class="label">View Inventory</span>
            </transition>
          </li>

          <li @click="selectView('addProduct')" :class="{ active: currentView==='addProduct' }">
            <span class="icon">➕</span>
            <transition name="slide-fade" mode="out-in">
              <span v-if="showText" class="label">Add Product</span>
            </transition>
          </li>

          <li @click="selectView('manageOrders')" :class="{ active: currentView==='manageOrders' }">
            <span class="icon">✏️</span>
            <transition name="slide-fade" mode="out-in">
              <span v-if="showText" class="label">Modify Orders</span>
            </transition>
          </li>

          <li @click="selectView('categories')" :class="{ active: currentView==='categories' }">
            <span class="icon">🗂</span>
            <transition name="slide-fade" mode="out-in">
              <span v-if="showText" class="label">Categories</span>
            </transition>
          </li>
        </ul>

        <!-- Logout at bottom -->
        <ul class="sidebar-logout">
          <li @click="logout">
            <span class="icon">🚪</span>
            <transition name="slide-fade" mode="out-in">
              <span v-if="showText" class="label">Logout</span>
            </transition>
          </li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <transition name="fade" mode="out-in">
          <component :is="currentViewComponent" :key="currentView" class="content-card" />
        </transition>
      </main>

    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import ViewInventory from './ViewInventory.vue'
import AddProduct from './AddProduct.vue'
import ManageOrders from './ManageOrders.vue'
import Categories from './Categories.vue'

export default {
  setup() {
    const router = useRouter();

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      router.push('/'); // redirect to login or home
    };

    return { logout };
  },
  data() {
    return {
      currentView: 'inventory',
      sidebarOpen: true,
      showText: true,
      isAnimating: false
    }
  },
  computed: {
    currentViewComponent() {
      switch (this.currentView) {
        case 'inventory': return ViewInventory
        case 'addProduct': return AddProduct
        case 'manageOrders': return ManageOrders
        case 'categories': return Categories
        default: return ViewInventory
      }
    }
  },
  methods: {
    toggleSidebar() {
      if (this.isAnimating) return
      this.isAnimating = true

      if (this.sidebarOpen) {
        // slide + fade text out first
        this.showText = false
        // wait before collapsing sidebar
        setTimeout(() => {
          this.sidebarOpen = false
          this.isAnimating = false
        }, 150)
      } else {
        // expand sidebar first
        this.sidebarOpen = true
        // fade + slide text in after a short delay
        setTimeout(() => {
          this.showText = true
          this.isAnimating = false
        }, 200)
      }
    },
    selectView(view) {
      this.currentView = view
      if (window.innerWidth < 900) this.sidebarOpen = false
    }
  }
}
</script>

<style scoped>
/* ---------------- Base Layout ---------------- */
/* ---------------- Fonts ---------------- */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

/* ---------------- Base Layout ---------------- */
.admin-dashboard {
  font-family: 'Inter', sans-serif;
  background: #f5f7f6; /* light background to contrast dark green theme */
  color: #071815;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ---------------- Header ---------------- */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 35px;
  background: #041c12; /* dark green */
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #0a3c2b;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #00ffcc;
  margin: 0;
}

/* ---------------- Hamburger ---------------- */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  cursor: pointer;
}
.hamburger .bar {
  height: 3px;
  background-color: #00ffcc;
  border-radius: 2px;
  transition: all 0.3s ease;
}
.bar.change1 { transform: rotate(-45deg) translate(-5px, 6px); }
.bar.change2 { opacity: 0; }
.bar.change3 { transform: rotate(45deg) translate(-5px, -6px); }

/* ---------------- Body ---------------- */
.dashboard-body {
  display: flex;
  flex: 1;
  height: calc(100vh - 70px);
  overflow: hidden;
}

/* ---------------- Sidebar ---------------- */
.sidebar {
  width: 220px;
  background: #041c12;
  padding: 25px 20px;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #0a3c2b;
}

.sidebar.closed {
  width: 60px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 12px;
  border-radius: 12px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: all 0.2s ease;
  color: #00ffcc;
}

.sidebar li:hover {
  background: linear-gradient(135deg, #0a3c2b, #1a5e46);
  color: #fff;
}

.sidebar li.active {
  background: #1aff99;
  color: #071815;
  font-weight: 600;
}

.sidebar .icon {
  font-size: 18px;
  margin-right: 10px;
  min-width: 20px;
  text-align: center;
}

/* ---------------- Text Slide + Fade Animation ---------------- */
.slide-fade-enter-active {
  transition: all 0.3s ease;
  transition-delay: 0.01s;
}
.slide-fade-leave-active {
  transition: all 0.1s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-15px);
}
.slide-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}

/* ---------------- Main Content ---------------- */
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 30px;
  overflow: auto;
}

/* ---------------- Content Card ---------------- */
.content-card {
  max-width: 1200px;
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', sans-serif;
  color: #071815;
}

/* ---------------- Add Product Inputs ---------------- */
.add-product-container input,
.add-product-container textarea,
.add-product-container select {
  width: 100%;
  padding: 12px 15px;
  margin: 10px 0;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 128, 0.3);
  background: rgba(0, 255, 128, 0.05);
  color: #071815;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  height: 45px;
  box-sizing: border-box;
}
.add-product-container textarea {
  height: 90px;
  resize: none;
}
.add-product-container input:focus,
.add-product-container textarea:focus,
.add-product-container select:focus {
  border-color: #00ffcc;
  background: rgba(0, 255, 128, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 128, 0.3);
}

/* ---------------- Sizes Inputs ---------------- */
.sizes-inputs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.sizes-inputs input {
  flex: 1;
  height: 45px;
}
.sizes-inputs button {
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #00ffcc, #00cc99);
  color: #071815;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 45px;
}
.sizes-inputs button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 255, 128, 0.3);
}

/* ---------------- Sizes List ---------------- */
.add-product-container ul {
  padding-left: 0;
  list-style: none;
  margin-top: 10px;
}
.add-product-container ul li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
}
.add-product-container ul li button {
  padding: 3px 8px;
  font-size: 12px;
  border-radius: 8px;
  border: none;
  background: #ff4d4d;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}
.add-product-container ul li button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(255, 77, 77, 0.3);
}

/* ---------------- Submit Button ---------------- */
.submit-btn {
  margin-top: 20px;
  width: 100%;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #00ffcc, #00cc99);
  color: #071815;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 45px;
}
.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 255, 128, 0.3);
}

/* ---------------- Fast Fade + Slide Transition ---------------- */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-enter-to { opacity: 1; transform: translateY(0); }
.fade-leave-from { opacity: 1; transform: translateY(0); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ---------------- Sidebar Logout ---------------- */
.sidebar-logout {
  margin-top: auto;
}

/* ---------------- Responsive ---------------- */
@media(max-width:900px){
  .sidebar {
    position: absolute;
    top: 60px;
    left: 0;
    height: calc(100vh - 60px);
    transform: translateX(-100%);
    width: 220px;
    z-index: 50;
  }
  .sidebar.open { transform: translateX(0); }
}

</style>
