<template>
  <div class="contact-view">
    <h2>Contact Us</h2>
    <form @submit.prevent="submitForm">
      <input v-model="name" placeholder="Your Name" required />
      <input v-model="email" type="email" placeholder="Your Email" required />
      <textarea v-model="message" placeholder="Your Message" required></textarea>
      <button type="submit">Send Message</button>
    </form>
    <p v-if="statusMessage">{{ statusMessage }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      message: '',
      statusMessage: ''
    }
  },
  methods: {
    submitForm() {
      // For now, just simulate submission
      this.statusMessage = `Thank you ${this.name}, your message has been sent!`
      this.name = ''
      this.email = ''
      this.message = ''
    }
  }
}
</script>

<style scoped>
.contact-view {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
input, textarea {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 5px;
}
button {
  padding: 8px 12px;
  cursor: pointer;
}
</style>
