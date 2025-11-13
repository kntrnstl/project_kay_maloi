<template>
  <div class="product-details" v-if="product">
    <h2>{{ product.name }}</h2>
    <p>{{ product.description }}</p>
    <p>Category: {{ product.category }}</p>
    <p>Price: ${{ product.price.toFixed(2) }}</p>
    <div v-if="product.sizes.length">
      <label>Sizes:</label>
      <ul>
        <li v-for="size in product.sizes" :key="size.id">
          {{ size.size }} ({{ size.stock }})
        </li>
      </ul>
    </div>
    <button @click="$emit('close')">Close</button>
  </div>
</template>

<script>
export default {
  props: ['product']
}
</script>

<style scoped>
.product-details {
  border: 1px solid #ccc;
  padding: 20px;
  background: #fff;
  max-width: 400px;
  margin: 20px auto;
}
</style>
