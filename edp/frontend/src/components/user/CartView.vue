<template>
  <div>
    <h2>Shopping Cart</h2>
    <table v-if="cart.length">
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Total</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in cart" :key="index">
          <td>{{ item.name }}</td>
          <td>{{ item.size }}</td>
          <td>₱{{ item.price }}</td>
          <td>
            <input type="number" v-model.number="item.quantity" min="1" />
          </td>
          <td>₱{{ item.price * item.quantity }}</td>
          <td>
            <button @click="removeItem(index)">X</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Your cart is empty</p>

    <p>Total: ₱{{ totalPrice }}</p>
    <button @click="checkout" :disabled="!cart.length">Checkout</button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  props: ['cart'],
  computed: {
    totalPrice() {
      return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    }
  },
  methods: {
    removeItem(index) {
      this.cart.splice(index, 1)
      this.$emit('update-cart', this.cart)
    },
    async checkout() {
      const token = localStorage.getItem('token')
      if (!token) return alert('Please login first.')

      try {
        const res = await axios.post(
          '/api/orders',
          {
            items: this.cart.map(item => ({
              product_id: item.product_id,
              size_id: item.size_id,
              quantity: item.quantity,
              price: item.price
            })),
            total: this.totalPrice
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        alert('Order placed successfully! Order ID: ' + res.data.orderId)
        this.cart = []
        this.$emit('update-cart', this.cart)
      } catch (err) {
        alert(err.response?.data?.message || 'Checkout failed')
      }
    }
  },
  watch: {
    cart: {
      deep: true,
      handler(val) {
        this.$emit('update-cart', val)
      }
    }
  }
}
</script>
