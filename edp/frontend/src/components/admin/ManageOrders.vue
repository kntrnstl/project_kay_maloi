<template>
  <div class="manage-orders">
    <h2>Manage Orders</h2>

    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>User</th>
          <th>Total</th>
          <th>Status</th>
          <th>Items</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="order in orders" :key="order.order_id">
          <td>{{ order.order_id }}</td>
          <td>{{ order.username }}</td>
          <td>₱{{ order.total }}</td>

          <td>
            <select v-model="order.status">
              <option>pending</option>
              <option>preparing</option>
              <option>out for delivery</option>
              <option>delivered</option>
            </select>
          </td>

          <!-- INNER TABLE ibinalik -->
          <td>
            <table class="inner-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="item in order.items" :key="item.id">
                  <td>{{ item.product_name }}</td>
                  <td>{{ item.size }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>₱{{ item.price }}</td>
                </tr>
              </tbody>
            </table>
          </td>

          <td>
            <button @click="updateStatus(order)">Update</button>
          </td>
        </tr>
      </tbody>

    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      orders: []
    };
  },

  methods: {
    async fetchOrders() {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.orders = res.data;
    },

    async updateStatus(order) {
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/admin/orders/${order.order_id}`,
        { status: order.status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Status updated!");
    }
  },

  mounted() {
    this.fetchOrders();
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.inner-table {
  width: 100%;
  border: 1px solid #999;
  background: #fafafa;
}
.inner-table th,
.inner-table td {
  padding: 5px;
  border: 1px solid #ccc;
}
</style>
