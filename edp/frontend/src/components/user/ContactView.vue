<template>
  <div class="contact-view">
    <div class="header-container">
      <h2 class="title">Get in Touch <span class="accent-text">24/7</span></h2>
      <p class="subtitle">Have a question or feedback? Our dedicated team is ready to assist you. Fill out the form below.</p>
    </div>

    <div
      class="custom-notif"
      :class="[{ show: notification.show }, notification.type]"
    >
      {{ notification.message }}
    </div>

    <form @submit.prevent="submitForm" class="contact-form">
      <div class="row-group">
        <div class="form-field">
          <input v-model="name" placeholder="Your Name" required class="input-soft-ui" />
        </div>

        <div class="form-field">
          <input v-model="email" type="email" placeholder="Your Email" required class="input-soft-ui" />
        </div>
      </div>

      <div class="form-field full-width">
        <textarea v-model="message" placeholder="Your Detailed Message" required class="input-soft-ui"></textarea>
      </div>

      <div class="form-field full-width">
        <button type="submit" class="btn-submit-soft-ui">Send Message</button>
      </div>
    </form>
    
    <div class="contact-info">
      <p>Or reach us directly:</p>
      <p class="email-link">support@myshop.com</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      message: '',
      notification: {
        show: false,
        message: '',
        type: 'success',
      },
      notificationTimer: null
    }
  },
  methods: {
    showNotification(message, type = 'success') {
      this.notification.message = message
      this.notification.type = type
      this.notification.show = true
      
      clearTimeout(this.notificationTimer);
      this.notificationTimer = setTimeout(() => (this.notification.show = false), 3000)
    },
    submitForm() {
      if (!this.name || !this.email || !this.message) {
        this.showNotification("Please fill in all fields.", "error")
        return
      }

      // Simulate API call success
      this.showNotification(`Thank you ${this.name}, your message has been sent successfully!`, 'success')
      this.name = '';
      this.email = '';
      this.message = '';
    },
  },
}
</script>

<style scoped>
/* ---------------- Custom Color Palette ---------------- */
/* Primary Dark Color: #0f3d2e (Dark Forest Green) */
/* Complimentary Light Color (Input BG): #f1fcf8 (Desaturated Mint) */
/* Accent: #00ffcc (Bright Mint/Aqua) */
/* Background: #ecf0f3 (Very Light Gray) */

/* ---------------- Core Container ---------------- */
.contact-view {
  max-width: 800px;
  margin: 80px auto;
  padding: 50px;
  background: #ffffff; 
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02); 
  font-family: 'Inter', sans-serif;
  color: #0f3d2e; /* Using the Dark Green for primary text */
}

/* ---------------- Header Styling ---------------- */
.header-container {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 38px;
  margin-bottom: 10px;
  color: #0f3d2e; /* Dark Green Primary */
  font-weight: 800;
  letter-spacing: -0.5px;
}

.accent-text {
    color: #00ffcc; /* Mint accent for pop */
}

.subtitle {
  font-size: 17px;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
}

/* ---------------- Form Layout ADJUSTMENTS ---------------- */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 25px; 
}

.row-group {
  display: flex;
  /* Increased gap for more separation */
  gap: 30px; 
}

.form-field {
  flex: 1;
}

/* ---------------- Input Styling (Soft UI / Light Neumorphism) ---------------- */
.input-soft-ui {
  box-sizing: border-box; /* Crucial for safe layout */
  width: 100%;
  padding: 16px 20px;
  border-radius: 15px;
  font-size: 16px;
  background: #f1fcf8; /* Complimentary Light Mint Background */
  color: #0f3d2e; /* Dark Green input text */
  border: none;
  transition: all 0.3s ease;
  
  /* Soft inner shadow */
  box-shadow: 
    inset 3px 3px 6px #d1d9e6, 
    inset -3px -3px 6px #ffffff;
}

.input-soft-ui::placeholder {
  color: #a0a0a0;
  font-weight: 400;
}

.input-soft-ui:focus {
  outline: none;
  background: #ffffff; 
  /* Focus ring uses the Dark Green and Mint accent */
  box-shadow: 0 0 0 3px #0f3d2e, 0 0 0 6px rgba(0, 255, 204, 0.3); 
}

textarea.input-soft-ui {
  min-height: 180px; 
  resize: vertical;
}

/* ---------------- Button Styling (Prominent Mint) ---------------- */
.btn-submit-soft-ui {
  width: 100%;
  padding: 18px 0;
  font-size: 18px;
  font-weight: 700;
  border-radius: 15px;
  border-color:black;
  /* High contrast mint background */
  background: white; 
  color: #0f3d2e; /* Dark Green text on mint button */
  cursor: pointer;
  transition: all 0.3s ease; 
  letter-spacing: 0.5px;
  box-shadow: 0 5px 15px rgba(0, 255, 204, 0.2); 
}

.btn-submit-soft-ui:hover {
  transform: translateY(-3px); /* Lift */
  background: #0f3d2e;
  color:white;
  border-color:white;
}

/* ---------------- Footer Info ---------------- */
.contact-info {
    text-align: center;
    margin-top: 50px;
    padding-top: 25px;
    border-top: 1px solid #e0e0e0;
}
.contact-info p {
    color: #777;
    font-size: 15px;
}
.email-link {
    font-size: 18px;
    font-weight: 600;
    color: #0f3d2e; /* Dark Green link color */
    margin-top: 5px;
}

/* ---------------- Notifications ---------------- */
.custom-notif {
  position: fixed;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 28px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  color: #fff;
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
  background: #00ffcc; 
  color: #0f3d2e; /* Dark Green text for high contrast success */
  box-shadow: 0 5px 15px rgba(0, 255, 150, 0.4);
}
.custom-notif.error {
  background: #e63946;
  color: white; 
  box-shadow: 0 5px 15px rgba(230,57,70,0.4);
}

/* ---------------- Responsive ---------------- */
@media (max-width: 768px) {
  .contact-view {
    margin: 40px 20px;
    padding: 30px;
  }
  
  .row-group {
    /* Ensure fields stack cleanly on mobile */
    flex-direction: column;
    gap: 20px;
  }

  .title {
    font-size: 32px;
  }
}
</style>