<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Components
import HomeView from './HomeView.vue';
import ProductsView from './ProductsView.vue';
import CartView from './CartView.vue';
import ContactView from './ContactView.vue';

// Router
const router = useRouter();

// --- STATE ---
const currentView = ref('home');
const cart = ref(JSON.parse(localStorage.getItem('cart') || '[]'));
const showLogoutConfirm = ref(false);
const notification = ref({ show: false, type: 'success', message: '' });

// --- WATCHERS ---
// Keep localStorage in sync whenever cart changes
watch(cart, (newCart) => localStorage.setItem('cart', JSON.stringify(newCart)), { deep: true });

// --- METHODS ---
const setView = (view) => {
  currentView.value = view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const confirmLogout = () => showLogoutConfirm.value = true;

const showNotification = (type, message) => {
  notification.value = { show: true, type, message };
  setTimeout(() => notification.value.show = false, 3000);
};

const logout = () => {
  showLogoutConfirm.value = false;
  showNotification('success', 'You have logged out successfully!');
  
  setTimeout(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  }, 1000);
};

const addToCart = (item) => {
  const existing = cart.value.find(i => i.product_id === item.product_id && i.size === item.size);
  if (existing) existing.quantity += item.quantity;
  else cart.value.push(item);
  showNotification('success', `${item.name} added to cart!`);
};

const updateCart = (updatedCart) => cart.value = updatedCart;

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
  showNotification('success', 'Item removed from cart!');
};
</script>

<template>
  <div class="user-dashboard">

    <!-- Notification -->
    <div class="custom-notif" :class="[notification.type, { show: notification.show }]">
      {{ notification.message }}
    </div>

    <!-- NAVBAR -->
    <nav class="navbar">
      <h1 class="logo">MyShop<span class="dot">.</span></h1>
      <ul class="nav-links">
        <li>
            <a @click.prevent="setView('home')" :class="{ active: currentView==='home' }">
            <span class="nav-link-inner">Home</span>
            </a>
        </li>
        <li>
            <a @click.prevent="setView('products')" :class="{ active: currentView==='products' }">
            <span class="nav-link-inner">Products</span>
            </a>
        </li>
        <li class="cart-link-item">
            <a @click.prevent="setView('cart')" :class="{ active: currentView==='cart' }">
            <span class="nav-link-inner">
                <svg class="cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.75 3.5c-.966 0-1.75.784-1.75 1.75v1.5a.75.75 0 001.5 0v-1.5c0-.138.112-.25.25-.25h.5a.75.75 0 000-1.5h-.5z"/>
                <path fill-rule="evenodd" d="M3.75 5.25a.75.75 0 01.75-.75h14.25a.75.75 0 010 1.5H4.5a.75.75 0 01-.75-.75zM17.5 7.5a.75.75 0 00-1.5 0v.5H8.75V7.5a.75.75 0 00-1.5 0v.5h-.5a2.25 2.25 0 00-2.25 2.25v8.25c0 1.24.978 2.25 2.25 2.25h12.5c1.272 0 2.25-1.01 2.25-2.25v-8.25a2.25 2.25 0 00-2.25-2.25h-.5v-.5zM7.25 10.5h9.5V19h-9.5v-8.5z" clip-rule="evenodd"/>
                </svg>
                Cart
            </span>
            <span class="cart-count" v-if="cart.length">{{ cart.length }}</span>
            </a>
        </li>
        <li>
            <a @click.prevent="setView('contact')" :class="{ active: currentView==='contact' }">
            <span class="nav-link-inner">Contact</span>
            </a>
        </li>
     </ul>
      <button class="logout-btn" @click="confirmLogout">Logout</button>
    </nav>

    <!-- MAIN VIEW -->
            <transition name="slide-up" mode="out-in">
            <div class="view-container" :key="currentView">
                <HomeView v-if="currentView==='home'" @navigate="setView" />
                <ProductsView v-if="currentView==='products'" @add-to-cart="addToCart" />
                <CartView v-if="currentView==='cart'" :cart="cart" @update-cart="updateCart" @remove-item="removeFromCart" @navigate="setView" />
                <ContactView v-if="currentView==='contact'" />
            </div>
            </transition>


    <!-- LOGOUT MODAL -->
    <div v-if="showLogoutConfirm" class="confirm-overlay">
      <div class="confirm-box">
        <p>Are you sure you want to logout?</p>
        <div class="confirm-actions">
          <button class="confirm-btn" @click="logout">Yes</button>
          <button class="cancel-btn" @click="showLogoutConfirm=false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-section">
          <h4>MyShop<span class="dot">.</span></h4>
          <p>Premium footwear for every step, delivered right to your door.</p>
        </div>
        <div class="footer-section nav-links-footer">
          <h4>Quick Links</h4>
          <ul>
            <li><a @click.prevent="setView('home')">Home</a></li>
            <li><a @click.prevent="setView('products')">Shop</a></li>
            <li><a @click.prevent="setView('contact')">Support</a></li>
          </ul>
        </div>
        <div class="footer-section contact-info">
          <h4>Contact Us</h4>
          <p>Email: support@myshop.com</p>
          <p>Phone: +63 912 345 6789</p>
          <p>123 Green St, Naujan, Oriental Mindoro</p>
        </div>
        <div class="footer-section social-media">
          <h4>Follow Us</h4>
          <div class="social-buttons">
            <a href="#" target="_blank" class="social-btn"><span class="icon">f</span></a>
            <a href="#" target="_blank" class="social-btn"><span class="icon">in</span></a>
            <a href="#" target="_blank" class="social-btn"><span class="icon">t</span></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© {{ new Date().getFullYear() }} MyShop. All rights reserved.</p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* ===== GLOBAL ===== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;700&display=swap');

.user-dashboard {
  font-family: 'Inter', sans-serif;
  color: #34495e;
  background: #f8f9fa;
  min-height: 100vh;
}

/* ===== NAVBAR ===== */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f3d2e;
  padding: 16px 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 26px;
  color: #fff;
  cursor: pointer;
}
.logo .dot {
  color: #7bf2b3;
}

.nav-links {
  display: flex;
  gap: 28px;
  list-style: none;
}

.nav-links a {
  color: #d8efe3;
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;
  position: relative;
  transition: color 0.3s;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0%;
  height: 3px;
  background: #7bf2b3;
  border-radius: 2px;
  transition: width 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #7bf2b3;
}
.nav-links a:hover::after,
.nav-links a.active::after {
  width: 100%;
}

/* Cart */
.cart-link-item {
  position: relative;
}
.cart-icon {
  width: 22px;
  height: 22px;
  margin-right: 5px;
}
.cart-count {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ff4d4d;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 50%;
  border: 2px solid #0f3d2e;
}

/* Logout button */
.logout-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #ff4d4d, #ff1a1a);
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255,77,77,0.2);
}
.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(255,77,77,0.4);
}

/* ===== VIEW CONTAINER ===== */
.view-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 140px);
  position: relative;
}

/* ===== NOTIFICATIONS ===== */
.custom-notif {
  position: fixed;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 24px;
  font-weight: 600;
  font-size: 15px;
  border-radius: 12px;
  color: #fff;
  opacity: 0;
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 9999;
}
.custom-notif.show { top: 20px; opacity: 1; pointer-events: auto; }
.custom-notif.success { background: linear-gradient(135deg,#00b061,#00773d); box-shadow:0 5px 15px rgba(0,255,150,0.3);}
.custom-notif.error { background: linear-gradient(135deg,#d62828,#9b1d1d); box-shadow:0 5px 15px rgba(255,0,0,0.3);}

/* ===== LOGOUT MODAL ===== */
.confirm-overlay { position:fixed; inset:0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:10000; }
.confirm-box { background:white; padding:25px 30px; border-radius:20px; text-align:center; max-width:400px; box-shadow:0 12px 28px rgba(0,0,0,0.25); }
.confirm-box p { margin-bottom:20px; font-weight:600; color:#071815; }
.confirm-actions { display:flex; justify-content:space-around; }
.confirm-btn { padding:10px 22px; border-radius:12px; border:none; background: linear-gradient(135deg,#00b061,#00773d); color:#fff; font-weight:600; cursor:pointer; transition:all 0.3s ease;}
.confirm-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(0,255,150,0.3);}
.cancel-btn { padding:10px 22px; border-radius:12px; border:none; background: linear-gradient(135deg,#d62828,#9b1d1d); color:#fff; font-weight:600; cursor:pointer; transition:all 0.3s ease;}
.cancel-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow:0 6px 18px rgba(255,0,0,0.3);}



/* Navbar links */
.nav-links li a {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  font-size: 16px;
  text-decoration: none;
  position: relative;
  transition: color 0.3s;
}

/* Inner wrapper for icon + text (underline applies here) */
.nav-link-inner {
  display: flex;
  align-items: center;
  position: relative;
}

/* Underline */
.nav-link-inner::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0%;
  height: 3px;
  background: #7bf2b3;
  border-radius: 2px;
  transition: width 0.3s;
}

/* Active / hover */
.nav-links a:hover .nav-link-inner::after,
.nav-links a.active .nav-link-inner::after {
  width: 100%;
}

/* Cart icon + badge */
.cart-link-item {
  position: relative;
}

.cart-icon {
  width: 22px;
  height: 22px;
}

.cart-count {
  position: absolute;
  top: -6px;
  right: -2px; /* tighter to icon */
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  font-size: 10px;
  font-weight: 700;
  padding: 0 5px;
  border-radius: 50%;
  text-align: center;
  background: #ff4d4d;
  color: white;
  border: 2px solid #0f3d2e;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}



/* Slide-down transition for view switching */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from {
  transform: translateY(-30px); /* start above */
  opacity: 0;
}
.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.slide-up-leave-to {
  transform: translateY(30px); /* move down when leaving */
  opacity: 0;
}
/* ===== FOOTER ===== */
.footer {
  background: #0f3d2e;
  color: #d8efe3;
  padding: 40px 50px 25px;
  font-family: 'Inter', sans-serif;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #145943;
}

.footer-section h4 {
  font-weight: 700;
  font-size: 18px;
  color: #7bf2b3;
  margin-bottom: 16px;
}
.footer-section p, .footer-section a {
  color: #d8efe3;
  font-size: 14px;
  margin-bottom: 8px;
  text-decoration: none;
}
.footer-section a:hover { color: #fff; }

.nav-links-footer ul {
  list-style: none;
  padding: 0;
}
.nav-links-footer li { margin-bottom: 8px; }

.social-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #145943;
  color: #ecf0f1;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s;
}
.social-btn:hover {
  transform: scale(1.1);
  background: #7bf2b3;
  color: #0f3d2e;
}

.footer-bottom {
  text-align: center;
  margin-top: 20px;
  font-size: 13px;
  color: #c0e9d4;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 992px) {
  .navbar { padding: 15px 20px; }
  .nav-links { display: none; }
}

@media (max-width: 768px) {
  .view-container { padding: 20px 12px; }
  .footer-top { grid-template-columns: 1fr 1fr; gap: 25px; }
  .footer { padding: 30px 20px 15px; }
  .logout-btn { padding: 8px 15px; font-size: 14px; }
}

</style>