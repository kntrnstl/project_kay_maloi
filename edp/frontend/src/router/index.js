import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../components/Auth.vue';
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import UserDashboard from '../components/user/UserDashboard.vue';
import Verify from '../components/verify.vue';   // <<--- ADD THIS
// if your verify file is in views folder:
// import Verify from '../views/verify.vue';

const routes = [
  { path: '/', component: Auth },

  // NEW VERIFY PAGE
  { path: '/verify', component: Verify }, // <<--- ADD THIS

  {
    path: '/admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/user',
    component: UserDashboard,
    meta: { requiresAuth: true, role: 'user' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Prevent access to dashboards if not verified
  if (to.meta.requiresAuth) {
    if (!token) return next('/'); 
    if (to.meta.role && to.meta.role !== role) return next('/');
  }

  next();
});

export default router;
