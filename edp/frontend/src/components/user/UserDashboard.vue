<template>
  <div>
    <h1>User Dashboard</h1>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
export default {
  setup() {
    const router = useRouter();
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      router.push('/');
    };
    return { logout };
  }
};
</script>
