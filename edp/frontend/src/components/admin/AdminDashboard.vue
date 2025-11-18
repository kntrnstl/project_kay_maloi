<template>
  <div class="admin-dashboard">

    <!-- Custom Notification -->
    <div
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

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
      <button class="logout-btn" @click="confirmLogout">Logout</button>
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
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <transition name="fade" mode="out-in">
          <component :is="currentViewComponent" :key="currentView" class="content-card" />
        </transition>
      </main>

    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>Are you sure you want to logout?</p>
        <div class="confirm-actions">
          <button class="confirm-btn" @click="logout">Yes</button>
          <button class="cancel-btn" @click="showLogoutConfirm=false">No</button>
        </div>
      </div>
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
      router.push('/');
    };
    return { logout };
  },
  data() {
    return {
      currentView: localStorage.getItem('currentView') || 'inventory',
      sidebarOpen: true,
      showText: true,
      isAnimating: false,
      showLogoutConfirm: false,
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  computed: {
    currentViewComponent() {
      switch(this.currentView) {
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
      if(this.isAnimating) return;
      this.isAnimating = true;
      if(this.sidebarOpen){
        this.showText = false;
        setTimeout(() => { this.sidebarOpen=false; this.isAnimating=false }, 150);
      } else {
        this.sidebarOpen = true;
        setTimeout(() => { this.showText=true; this.isAnimating=false }, 200);
      }
    },
    selectView(view) {
      this.currentView = view;
      localStorage.setItem('currentView', view);
      if(window.innerWidth < 900) this.sidebarOpen = false;
    },
    confirmLogout() {
      this.showLogoutConfirm = true;
    },
    showNotification(type, message){
      this.notification.type = type;
      this.notification.message = message;
      this.notification.show = true;
      setTimeout(() => { this.notification.show = false }, 3000);
    },
    logout(){
      this.showLogoutConfirm = false;
      this.showNotification('success', 'You have logged out successfully!');
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        this.$router.push('/');
      }, 1000);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

.admin-dashboard {
  font-family: 'Inter', sans-serif;
  background: #f5f7f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 35px;
  background: #041c12;
  border-bottom: 2px solid #0a3c2b;
}

.admin-header h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #00ffcc;
  margin: 0;
}

.header-left { display: flex; align-items: center; gap: 20px; }
.admin-header h1 { color: #00ffcc; font-weight: 700; margin:0; }

.logout-btn {
  background: linear-gradient(135deg,#ff4d4d,#ff1a1a);
  color:#fff;
  padding:8px 16px;
  border-radius:12px;
  font-weight:600;
  cursor:pointer;
  transition: all 0.3s ease;
}
.logout-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 18px rgba(255,77,77,0.4);
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
  transition: all 0.35s ease;
  z-index: 9999;
}
.custom-notif.show { top: 20px; opacity:1; pointer-events:auto; }
.custom-notif.success {
  background: linear-gradient(135deg,#00b061,#00773d);
  box-shadow: 0 5px 15px rgba(0,255,150,0.3);
}
.custom-notif.error {
  background: linear-gradient(135deg,#d62828,#9b1d1d);
  box-shadow: 0 5px 15px rgba(255,0,0,0.3);
}

/* ---------------- Sidebar & Body ---------------- */
.dashboard-body { display:flex; flex:1; height: calc(100vh - 70px); overflow:hidden; }
.sidebar { width:220px; background:#041c12; padding:25px 20px; transition: width 0.3s ease; overflow:hidden; border-right:1px solid #0a3c2b; display:flex; flex-direction:column; }
.sidebar.closed { width:60px; }
.sidebar ul { list-style:none; padding:0;margin:0; }
.sidebar li { display:flex; align-items:center; padding:12px 15px; margin-bottom:12px; border-radius:12px; cursor:pointer; font-weight:500; transition: all 0.2s ease; color:#00ffcc; }
.sidebar li:hover { background: linear-gradient(135deg,#0a3c2b,#1a5e46); color:#fff; }
.sidebar li.active { background:#1aff99; color:#071815; font-weight:600; }
.icon { font-size:18px; margin-right:10px; min-width:20px; text-align:center; }

/* ---------------- Hamburger ---------------- */
.hamburger { display:flex; flex-direction:column; justify-content:space-between; width:28px;height:20px; cursor:pointer; }
.bar { height:3px; background-color:#00ffcc; border-radius:2px; transition: all 0.3s ease; }
.bar.change1 { transform: rotate(-45deg) translate(-5px,6px); }
.bar.change2 { opacity:0; }
.bar.change3 { transform: rotate(45deg) translate(-5px,-6px); }

/* ---------------- Main Content ---------------- */
.main-content { flex:1; display:flex; justify-content:center; padding:30px; overflow:auto; }
.content-card { max-width:1200px; width:100%; background:#fff; border-radius:20px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,0.15); }

/* ---------------- Fade ---------------- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from { opacity:0; transform:translateY(10px);}
.fade-enter-to { opacity:1; transform:translateY(0);}
.fade-leave-from { opacity:1; transform:translateY(0);}
.fade-leave-to { opacity:0; transform:translateY(-10px);}

/* ---------------- Logout Modal ---------------- */
.confirm-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:10000; }
.confirm-box { background:white; padding:25px 30px; border-radius:20px; text-align:center; max-width:400px; box-shadow:0 12px 28px rgba(0,0,0,0.25); }
.confirm-box p { margin-bottom:20px; font-weight:600; color:#071815; }
.confirm-actions { display:flex; justify-content:space-around; }
.confirm-btn { padding:10px 22px; border-radius:12px; border:none; background: linear-gradient(135deg,#00b061,#00773d); color:#fff; font-weight:600; cursor:pointer; transition:all 0.3s ease;}
.confirm-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(0,255,150,0.3);}
.cancel-btn { padding:10px 22px; border-radius:12px; border:none; background: linear-gradient(135deg,#d62828,#9b1d1d); color:#fff; font-weight:600; cursor:pointer; transition:all 0.3s ease;}
.cancel-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(255,0,0,0.3);}

/* ---------------- Slide-Fade for Sidebar Labels ---------------- */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

</style>