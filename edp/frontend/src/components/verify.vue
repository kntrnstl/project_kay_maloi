<template>
  <div class="auth-wrapper">

    <div class="verify-card">
      <h1>Email Verification</h1>
      <p class="subtitle">Enter the 6-digit code sent to your Gmail</p>

      <!-- EMAIL (read-only) -->
      <div class="input-group">
        <input 
          class="modern-input"
          v-model="email"
          placeholder="Email"
          readonly
        />
        <div class="input-icon">✉️</div>
      </div>

      <!-- CODE -->
      <div class="input-group">
        <input 
          class="modern-input"
          v-model="code"
          maxlength="6"
          placeholder="Verification Code"
        />
        <div class="input-icon">🔢</div>
      </div>

      <!-- VERIFY -->
      <button class="auth-button" @click="verifyEmail">
        <span>Verify Email</span>
        <div class="button-icon">✓</div>
      </button>

      <!-- RESEND CODE -->
      <button class="resend-btn" @click="resendCode">
        Resend Verification Code
      </button>

      <!-- MESSAGE -->
      <div v-if="message" :class="['message', messageType]">
        <div class="message-icon">{{ messageType === 'success' ? '✓' : '⚠' }}</div>
        {{ message }}
      </div>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: localStorage.getItem("pendingEmail") || "",
      code: "",
      message: "",
      messageType: "success",
    };
  },

  methods: {
    // ======================
    // VERIFY EMAIL
    // ======================
   async verifyEmail() {
  if (this.code.length !== 6) {
    this.message = "Verification code must be 6 digits.";
    this.messageType = "error";
    return;
  }

  try {
    const res = await axios.post("/api/auth/verify", {
      email: this.email,
      code: this.code
    });

    this.message = res.data.message;
    this.messageType = "success";

    // AUTO LOGIN
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.user.role);

    localStorage.removeItem("pendingEmail");

    setTimeout(() => {
      if (res.data.user.role === "admin") this.$router.push("/");
      else this.$router.push("/");
    }, 1000);

  } catch (err) {
    this.message = err.response?.data?.message || "Verification failed";
    this.messageType = "error";
  }
},

    // ======================
    // RESEND CODE
    // ======================
    async resendCode() {
      try {
        const res = await axios.post("/api/auth/resend", {
          email: this.email
        });

        this.message = res.data.message;
        this.messageType = "success";

      } catch (err) {
        this.message = err.response?.data?.message || "Could not resend code.";
        this.messageType = "error";
      }
    }
  }
};
</script>

<style scoped>
.verify-card {
  width: 450px;
  padding: 40px;
  border-radius: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(18px);
  border: 2px solid rgba(255,255,255,0.15);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  color: white;
  text-align: center;
}
.subtitle {
  margin-bottom: 20px;
  color: #ccc;
}
.resend-btn {
  width: 100%;
  margin-top: 15px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.resend-btn:hover {
  background: rgba(255,255,255,0.2);
}
</style>
