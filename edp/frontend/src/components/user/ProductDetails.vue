<template>
  <div class="modal-overlay" v-if="product">
    <div class="modal-box">

      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p>Category: {{ product.category }}</p>
      <p>Price: ₱{{ Number(product.price).toFixed(2) }}</p>

      <div v-if="product.sizes && product.sizes.length">
        <label>Sizes:</label>
        <ul>
          <li v-for="size in product.sizes" :key="size.id">
            {{ size.size }} (Stock: {{ size.stock }})
          </li>
        </ul>
      </div>

      <button class="btn-close" @click="$emit('close')">Close</button>

    </div>
  </div>
</template>

<script>
export default {
  props: ["product"]
}
</script>



<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
}

.modal-box {
  background: #fff;
  padding: 25px;
  width: 400px;
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0,0,0,0.2);
}

.btn-close {
  margin-top: 15px;
  padding: 8px 16px;
  background: #d9534f;
  border: none;
  color: #fff;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
}
</style>
