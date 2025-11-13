<template>
  <div class="auth-wrapper">
    <div class="auth-container">

      <!-- Left: Slideshow card -->
      <div class="slideshow-card">
        <transition-group name="fade" tag="div" class="slideshow-container">
          <img
            v-for="(img, index) in images"
            v-show="currentImage === index"
            :key="index"
            :src="img"
            class="slideshow-img"
          />
        </transition-group>
      </div>

      <!-- Right: Login/Register card -->
      <div class="auth-card">
        <div class="card-content" :class="{ 'register-mode': !isLogin }">
          <div class="card-header">
            <div class="logo">
            </div>
            <h1>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h1>
            <p class="subtitle">{{ isLogin ? 'Sign in to continue' : 'Join us today' }}</p>
          </div>

          <form @submit.prevent="isLogin ? login() : register()" class="auth-form">
            <div class="input-group" v-if="!isLogin">
              <input
                v-model="username"
                placeholder="Username"
                required
                class="modern-input"
              />
              <div class="input-icon">👤</div>
            </div>

            <div class="input-group">
              <input
                v-model="email"
                placeholder="Email"
                type="email"
                required
                class="modern-input"
              />
              <div class="input-icon">✉️</div>
            </div>

            <div class="input-group">
              <input
                v-model="password"
                placeholder="Password"
                type="password"
                required
                class="modern-input"
              />
              <div class="input-icon">🔒</div>
            </div>

            <button type="submit" class="auth-button">
              <span>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
              <div class="button-icon">→</div>
            </button>
          </form>

          <div class="auth-footer">
            <p class="toggle-text">
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <span class="toggle-link" @click="toggleForm">
                {{ isLogin ? "Sign up" : "Sign in" }}
              </span>
            </p>
          </div>

          <div v-if="message" :class="['message', messageType]">
            <div class="message-icon">{{ messageType === 'success' ? '✓' : '⚠' }}</div>
            {{ message }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

import img1 from '../assets/img/ONING.jpg';
import img2 from '../assets/img/ONING.jpg';
import img3 from '../assets/img/ONING.jpg';
import img4 from '../assets/img/ONING.jpg';
import img5 from '../assets/img/ONING.jpg';

export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      isLogin: true,
      username: '',
      email: '',
      password: '',
      message: '',
      messageType: 'success',
      images: [img1, img2, img3, img4, img5],
      currentImage: 0
    };
  },
  mounted() {
    this.startSlideshow();
  },
  methods: {
    toggleForm() {
      this.isLogin = !this.isLogin;
      this.username = '';
      this.email = '';
      this.password = '';
      this.message = '';
    },
    startSlideshow() {
      setInterval(() => {
        this.currentImage = (this.currentImage + 1) % this.images.length;
      }, 3000);
    },
    async register() {
      try {
        const res = await axios.post('/api/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password
        });
        this.message = res.data.message;
        this.messageType = 'success';
        this.toggleForm();
      } catch (err) {
        this.message = err.response?.data?.message || 'Error registering';
        this.messageType = 'error';
      }
    },
    async login() {
      try {
        const res = await axios.post('/api/auth/login', {
          email: this.email,
          password: this.password
        });
        const userRole = res.data.user.role;

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', userRole);

        this.message = 'Login successful! Redirecting...';
        this.messageType = 'success';

        setTimeout(() => {
          if (userRole === 'admin') this.router.push('/admin');
          else this.router.push('/user');
        }, 500);
      } catch (err) {
        this.message = err.response?.data?.message || 'Login failed';
        this.messageType = 'error';
      }
    }
  }
};
</script>

<style scoped>
.auth-wrapper {
  background: #0d2b1f;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;  
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.auth-container {
  display: flex;
  align-items: stretch;
  gap: 0;
  max-width: 860px; /* Increased to accommodate wider auth-card */
  width: 100%;
}

/* ----------------- Slideshow Card ----------------- */
.slideshow-card {
  width: 500px; /* 380px + 10% = 418px */
  height: 550px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  position: relative;
  flex-shrink: 0; 
  right: 100px;
}

.slideshow-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.slideshow-img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  position: absolute;
  top: 0;
  left: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

/* ----------------- Login/Register Card ----------------- */
.auth-card {
  background: rgba(255, 255, 255, 0.0.1);
  backdrop-filter: blur(18px);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.12);
  width: 500px; /* 380px + 10% = 418px */
  height: 550px;
  position: relative;
  left: -20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.card-content {
  padding: 48px 20px; /* Increased horizontal padding for wider card */
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  transition: padding 0.3s ease;
}

/* Adjust content upward for registration form */
.card-content.register-mode {
  padding-top: 36px; /* Reduced top padding for registration */
  padding-bottom: 36px; /* Reduced bottom padding for registration */
}

/* ----------------- Header ----------------- */
.card-header {
  text-align: center;
  margin-bottom: 36px;
  flex-shrink: 0;
}

.card-content.register-mode .card-header {
  margin-bottom: 28px; /* Reduced margin for registration */
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #ccc;
}

/* ----------------- Form ----------------- */
.auth-form {
  margin-bottom: 20px;
  flex: 1;
}

.card-content.register-mode .auth-form {
  margin-bottom: 16px; /* Reduced margin for registration */
}

/* ----------------- Inputs ----------------- */
.input-group {
  position: relative;
  margin-bottom: 20px;
}

.card-content.register-mode .input-group {
  margin-bottom: 16px; /* Reduced margin for registration */
}

.modern-input {
  width: 100%;
  padding: 16px 50px 16px 18px;
  border-radius: 12px;
  background: rgba(8, 24, 18, 0.9); /* darker green tone */
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 15px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}


.modern-input::placeholder {
  color: rgba(255,255,255,0.5);
}

.modern-input:focus {
  outline: none;
  border-color: #1aff99;
  box-shadow: 0 0 12px rgba(26, 255, 153, 0.5);
  background: rgba(10, 35, 25, 0.95);
}

.input-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #fff;
  pointer-events: none;
}

/* ----------------- Button ----------------- */
.auth-button {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #0a3c2b, #1a5e46);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  margin-top: auto;
  gap: 10px; /* optional spacing between text and icon */
}

.card-content.register-mode .auth-button {
  margin-top: 20px; /* Adjusted for registration */
}

.auth-button:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.4);
}

.button-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.auth-button:hover .button-icon {
  transform: translateX(5px);
}

/* ----------------- Footer ----------------- */
.auth-footer {
  text-align: center;
  flex-shrink: 0;
  top: -10px;
}

.card-content.register-mode .auth-footer {
  margin-top: 10px; /* Reduced margin for registration */
}

.toggle-text {
  font-size: 13px;
  color: #ccc;
}

.toggle-link {
  color: #ff8a00;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
  transition: all 0.3s ease;
}

.toggle-link:hover {
  text-decoration: underline;
}

/* ----------------- Messages ----------------- */
.message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
  flex-shrink: 0;
}

.card-content.register-mode .message {
  margin-top: 14px; /* Reduced margin for registration */
}

.message.success {
  background: rgba(0,255,128,0.15);
  color: #00ff80;
  border: 1px solid rgba(0,255,128,0.3);
}

.message.error {
  background: rgba(255,0,0,0.12);
  color: #ff4d4d;
  border: 1px solid rgba(255,0,0,0.3);
}

.message-icon {
  font-size: 16px;
  font-weight: bold;
}

/* ----------------- Animations ----------------- */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px);}
  to { opacity: 1; transform: translateY(0);}
}

/* Responsive */
@media(max-width: 900px){
  .auth-container{
    flex-direction: column;
    align-items: center;
    max-width: 100%;
  }
  .slideshow-card{
    width: 100%;
    max-width: 418px;
    height: 400px;
  }
  .auth-card{
    width: 100%;
    max-width: 418px;
    height: auto;
    left: 0;
    margin-bottom: 20px;
  }
  .card-content {
    padding: 40px 30px;
  }
  .card-content.register-mode {
    padding-top: 32px;
    padding-bottom: 32px;
  }
}
</style>