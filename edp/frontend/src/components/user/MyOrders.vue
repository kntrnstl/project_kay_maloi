<template>
  <div class="orders-container">
    <h2 class="title">My Orders</h2>

    <!-- ✅ STATUS FILTER -->
    <div class="filter-box">
      <label>Status:</label>
      <select v-model="selectedStatus" class="filter-select">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="out of delivery">Out of Delivery</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>

    <div v-if="loading" class="loading">Loading your orders...</div>

    <div v-else-if="filteredOrders.length === 0" class="no-orders">
      No orders found for this status.
    </div>

    <div v-else>
      <div
        class="order-card"
        v-for="order in filteredOrders"
        :key="order.order_id"
      >
        <!-- Order Header -->
        <div class="order-header">
          <div>
            <span class="order-id">Order #{{ order.order_id }}</span>
            <span class="date">{{ formatDate(order.created_at) }}</span>
          </div>

          <span class="status" :class="order.status.toLowerCase()">
            {{ order.status }}
          </span>
        </div>

        <!-- Items -->
        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.item_id"
            class="order-item"
          >
            <img
              class="item-img"
              :src="item.image_url || '/placeholder.png'"
              alt="Product image"
            />

            <div class="item-info">
              <h4>{{ item.product_name }}</h4>
              <p>Size: {{ item.size }}</p>
              <p>Qty: {{ item.quantity }}</p>
            </div>

            <div class="item-price">
              ₱{{ item.price.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="order-summary">
          <span>Total:</span>
          <strong>₱{{ order.total.toLocaleString() }}</strong>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const orders = ref([]);
const loading = ref(true);
const selectedStatus = ref(""); // NEW

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:3000/api/orders/my", {
      headers: { Authorization: `Bearer ${token}` }
    });

    orders.value = res.data;
  } catch (err) {
    console.error("Error loading orders", err);
  } finally {
    loading.value = false;
  }
});

// ✅ COMPUTED FILTERED ORDERS
const filteredOrders = computed(() => {
  if (!selectedStatus.value) return orders.value; // show all
  return orders.value.filter(
    (o) => o.status.toLowerCase() === selectedStatus.value.toLowerCase()
  );
});

// Format date
const formatDate = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.title {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 20px;
}

.loading,
.no-orders {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
}

.order-card {
  background: white;
  padding: 18px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 0 10px #e5e5e5;
  border: 1px solid #e8e8e8;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-id {
  font-weight: 700;
  color: #222;
}

.date {
  display: block;
  font-size: 13px;
  color: #777;
}

.status {
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}

.status.preparing {
  background: #ffe7a1;
  color: #8a6000;
}

.status.shipping {
  background: #b3d8ff;
  color: #004b8a;
}

.status.completed {
  background: #c5f7c5;
  color: #006400;
}

.status.cancelled {
  background: #ffd2d2;
  color: #8a0000;
}

.order-items {
  margin-top: 10px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
}

.item-info h4 {
  font-size: 15px;
  margin-bottom: 4px;
}

.item-info p {
  font-size: 13px;
  color: #555;
}

.item-price {
  margin-left: auto;
  font-weight: bold;
}

.order-summary {
  display: flex;
  justify-content: flex-end;
  font-size: 19px;
  margin-top: 15px;
}

.order-summary strong {
  margin-left: 8px;
  color: #d9534f;
}
.filter-box {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
</style>
