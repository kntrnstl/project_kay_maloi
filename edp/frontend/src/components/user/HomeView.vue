<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Welcome to MyShop!</h1>
        <p class="tagline">Discover our amazing products and exclusive offers.</p>
        <button class="btn-shop-now" @click="goToProducts">
          Shop Now &rarr;
        </button>
      </div>
    </section>

    <div class="main-content container"> 
      
      <section class="featured-products">
        <h2 class="section-title">✨ Featured Items</h2>
        
        <div v-if="featuredProducts.length" class="products-grid">
          <div 
            v-for="product in featuredProducts" 
            :key="product.id" 
            class="product-card"
          >
            <div class="product-image-placeholder">
              <span class="ribbon">Hot 🔥</span>
            </div>

            <div class="card-body">
              <h3>{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
            </div>

            <div class="card-footer">
              <p class="price">₱{{ product.price ? product.price.toFixed(2) : '0.00' }}</p>
              <button class="btn-add-cart">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        <p v-else class="loading-text">Loading featured products...</p>
      </section>

      <hr class="divider">

      <section class="promo-banner">
        <div class="promo-card">
          <h3>New Arrivals!</h3>
          <p>Explore the latest additions to our collection. Don't miss out on fresh styles.</p>
          <button class="btn-view-all" @click="goToProducts">View All</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      featuredProducts: []
    }
  },
  methods: {
    goToProducts() {
      if (this.$router) {
        this.$router.push('/products');
      } else {
        console.warn('Vue Router instance not found. Cannot navigate.');
      }
    }
  },
  async created() {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` } 
      })
      const productsWithPrice = res.data.filter(p => p.price !== undefined && p.price !== null);
      this.featuredProducts = productsWithPrice.slice(0, 4) 
    } catch (err) {
      console.error('Error fetching products:', err)
      this.featuredProducts = [];
    }
  }
}
</script>

<style scoped>
/* ---------------- Base & Layout ---------------- */
.home-view {
  font-family: 'Inter', sans-serif;
  background: #f5f7f6;
  color: #071815;
  border-radius: 10px;
  /* Removed border-radius here as it should be on the header/footer, not the view itself */
}

/* Container now defines the max-width and center alignment */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* NEW: Main Content Padding */
.main-content {
  padding-top: 50px; /* Space below the hero */
  padding-bottom: 60px; /* Space above potential footer */
}

/* ---------------- Hero Section ---------------- */
.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://picsum.photos/1920/600/?random=1') center/cover;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  border-radius: 10px;
  /* Removed margin-bottom here, spacing is now managed by .main-content padding-top */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.hero-content {
  padding: 20px;
}
.hero-content h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
.tagline {
  font-size: 22px;
  font-weight: 300;
  margin-bottom: 30px;
}
.btn-shop-now {
  padding: 14px 35px;
  background: #00ffcc; 
  color: #041c12;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}
.btn-shop-now:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 255, 128, 0.4);
  background: #00e0b3;
}

/* ---------------- Featured Products ---------------- */
.featured-products {
  /* Removed container class from template, so ensure padding is handled by the wrapper */
  margin-bottom: 50px; 
}
.section-title {
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  color: #041c12;
  margin-bottom: 40px;
  text-align: center;
  font-weight: 700;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.product-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.product-image-placeholder {
  background: #e9fffb;
  height: 150px;
  position: relative;
  border-bottom: 1px solid #00cc99;
}
.ribbon {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b6b;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 15px;
  flex-grow: 1;
}
.product-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  color: #041c12;
  margin-bottom: 5px;
}
.product-description {
  font-size: 14px;
  color: #555;
}

.card-footer {
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-card .price {
  font-weight: 800;
  color: #00cc99;
  font-size: 1.5rem;
  margin: 0;
}
.product-card .btn-add-cart {
  padding: 8px 15px;
  background: #00ffcc;
  color: #071815;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.product-card .btn-add-cart:hover {
  background: #00e0b3;
  transform: translateY(-1px);
}
.loading-text {
  text-align: center;
  color: #555;
  font-weight: 600;
  padding: 50px 0;
}

/* ---------------- Promo Banner ---------------- */
.divider {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), #00ffcc, rgba(0, 0, 0, 0));
  margin: 50px auto;
  max-width: 800px;
}

.promo-banner {
    /* Now uses the .main-content's container for padding */
}

.promo-card {
  background: linear-gradient(135deg, #0a3c2b, #041c12);
  color: white;
  /* Removed unnecessary margin: 10px from the card itself */
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
.promo-card h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 30px;
  margin-bottom: 10px;
}
.promo-card p {
  font-size: 18px;
  font-weight: 300;
  margin-bottom: 25px;
}
.btn-view-all {
  padding: 10px 20px;
  background: #00ffcc;
  color: #041c12;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-view-all:hover {
  transform: scale(1.05);
  background: #00e0b3;
}

/* ---------------- Responsive ---------------- */
@media(max-width: 768px) {
  .hero-content h1 {
    font-size: 36px;
  }
  .tagline {
    font-size: 18px;
  }
  .section-title {
    font-size: 26px;
  }
  .products-grid {
    gap: 20px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
  .promo-card {
    padding: 30px;
  }
}
</style>