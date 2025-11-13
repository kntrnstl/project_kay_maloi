import { createRouter, createWebHistory } from 'vue-router';
import Auth from '../components/Auth.vue';
import AdminDashboard from '../components/admin/AdminDashboard.vue';
import UserDashboard from '../components/user/UserDashboard.vue';

const routes = [
  { path: '/', component: Auth },
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

// Route guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (to.meta.requiresAuth) {
    if (!token) return next('/'); // not logged in
    if (to.meta.role && to.meta.role !== role) return next('/'); // role mismatch
  }

  next();
});

export default router;
