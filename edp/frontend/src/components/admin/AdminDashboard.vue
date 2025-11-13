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
.admin-dashboard {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(160deg, #0d2b1f, #071815);
  color: #fff;
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
  background: rgba(8, 24, 18, 0.9);
  backdrop-filter: blur(12px);
  box-shadow: 0 3px 10px rgba(0,255,128,0.2);
  border-bottom: 2px solid #0a3c2b;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-header h1 {
  font-size: 22px;
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
  overflow: hidden;
}

/* ---------------- Sidebar ---------------- */
.sidebar {
  width: 220px;
  background: rgba(8, 24, 18, 0.85);
  backdrop-filter: blur(12px);
  padding: 25px 20px;
  box-shadow: 0 0 20px rgba(0,255,128,0.15);
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar li:hover {
  background: linear-gradient(135deg, #0a3c2b, #1a5e46);
  color: #00ffcc;
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
  padding: 30px;
  overflow-y: auto;
}

/* ---------------- Content Card ---------------- */
.content-card {
  background: rgba(8, 24, 18, 0.9);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 25px rgba(0,255,128,0.1);
  width: 100%;
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
