<template>
  <div class="reports-container">

    <h2 class="page-title">📊 Business Reports</h2>

    <!-- SUMMARY CARDS -->
    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Sales</h3>
        <p class="value">₱{{ stats.totalSales.toLocaleString() }}</p>
      </div>

      <div class="summary-card">
        <h3>Total Users</h3>
        <p class="value">{{ stats.totalUsers }}</p>
      </div>

      <div class="summary-card">
        <h3>Delivered Orders</h3>
        <p class="value">{{ orderSummary.delivered || 0 }}</p>
      </div>

      <div class="summary-card">
        <h3>Pending Orders</h3>
        <p class="value">{{ orderSummary.pending || 0 }}</p>
      </div>
    </div>

    <!-- EXPORT BUTTONS -->
    <div class="export-buttons">
      <button class="btn" @click="exportCSV">📄 Export CSV</button>
      <button class="btn" @click="exportPDF">🧾 Export PDF</button>
    </div>

    <!-- MONTHLY SALES -->
    <div class="chart-card">
      <h3>📈 Monthly Sales</h3>
      <canvas id="monthlySalesChart"></canvas>
    </div>

    <!-- DAILY SALES -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>📅 Daily Sales</h3>

        <div class="date-filters">
          <input type="date" v-model="dateRange.start">
          <input type="date" v-model="dateRange.end">
          <button class="btn" @click="loadDailySales">Apply</button>
        </div>
      </div>

      <canvas id="dailySalesChart"></canvas>
    </div>

    <!-- TOP PRODUCTS -->
    <div class="chart-card">
      <h3>🔥 Top Selling Products</h3>
      <canvas id="topProductsChart"></canvas>
    </div>

    <!-- ORDER STATUS -->
    <div class="chart-card">
      <h3>🧩 Order Status Breakdown</h3>
      <canvas id="orderStatusChart"></canvas>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  name: "Reports",

  data() {
    return {
      stats: {
        totalSales: 0,
        totalUsers: 0,
      },
      orderSummary: {},
      monthlySales: [],
      dailySales: [],
      topProducts: [],

      dateRange: {
        start: "",
        end: "",
      },

      charts: {},
    };
  },

  mounted() {
    this.loadAllReports();
  },

  methods: {

    auth() {
      return {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      };
    },

    async loadAllReports() {
      await Promise.all([
        this.loadTotalSales(),
        this.loadTotalUsers(),
        this.loadOrderSummary(),
        this.loadMonthlySales(),
        this.loadDailySales(),
        this.loadTopProducts(),
      ]);
    },

    // FETCH DATA (NOW WITH AUTH)
    async loadTotalSales() {
      const res = await axios.get("/api/admin/reports/total-sales", this.auth());
      this.stats.totalSales = res.data.total_sales || 0;
    },

    async loadTotalUsers() {
      const res = await axios.get("/api/admin/reports/total-users", this.auth());
      this.stats.totalUsers = res.data.total_users || 0;
    },

    async loadOrderSummary() {
      const res = await axios.get("/api/admin/reports/orders-summary", this.auth());
      this.orderSummary = {};
      res.data.forEach(s => {
        this.orderSummary[s.status] = s.count;
      });
      this.buildOrderStatusChart();
    },

    async loadMonthlySales() {
      const res = await axios.get("/api/admin/reports/monthly-sales", this.auth());
      this.monthlySales = res.data;
      this.buildMonthlySalesChart();
    },

    async loadDailySales() {
      const res = await axios.get("/api/admin/reports/sales-per-day", {
        ...this.auth(),
        params: {
          start: this.dateRange.start || "2024-01-01",
          end: this.dateRange.end || "2099-12-31",
        }
      });
      this.dailySales = res.data;
      this.buildDailySalesChart();
    },

    async loadTopProducts() {
      const res = await axios.get("/api/admin/reports/top-products", this.auth());
      this.topProducts = res.data;
      this.buildTopProductsChart();
    },

    // CHARTS SAME EXACT DESIGN
    buildMonthlySalesChart() {
      const ctx = document.getElementById("monthlySalesChart");
      if (this.charts.monthly) this.charts.monthly.destroy();

      this.charts.monthly = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.monthlySales.map(x => x.month),
          datasets: [
            {
              label: "Sales (₱)",
              data: this.monthlySales.map(x => x.monthly_sales),
              borderColor: "#0f5132",
              backgroundColor: "rgba(15, 81, 50, 0.2)",
              borderWidth: 3,
              tension: 0.4,
            }
          ]
        }
      });
    },

    buildDailySalesChart() {
      const ctx = document.getElementById("dailySalesChart");
      if (this.charts.daily) this.charts.daily.destroy();

      this.charts.daily = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.dailySales.map(x => x.date),
          datasets: [{
            label: "Daily Sales (₱)",
            data: this.dailySales.map(x => x.daily_sales),
            backgroundColor: "#198754"
          }]
        }
      });
    },

    buildTopProductsChart() {
      const ctx = document.getElementById("topProductsChart");
      if (this.charts.top) this.charts.top.destroy();

      this.charts.top = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.topProducts.map(x => x.name),
          datasets: [{
            label: "Units Sold",
            data: this.topProducts.map(x => x.total_sold),
            backgroundColor: "#146c43"
          }]
        }
      });
    },

    buildOrderStatusChart() {
      const ctx = document.getElementById("orderStatusChart");
      if (this.charts.status) this.charts.status.destroy();

      this.charts.status = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(this.orderSummary),
          datasets: [{
            data: Object.values(this.orderSummary),
            backgroundColor: ["#198754", "#0f5132", "#6c757d", "#d9534f"]
          }]
        }
      });
    },

    exportCSV() {
      const csv =
        ["Metric,Value",
        `Total Sales,${this.stats.totalSales}`,
        `Total Users,${this.stats.totalUsers}`].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.csv";
      a.click();
    },

    exportPDF() {
      window.print();
    }
  }
};
</script>

<style scoped>
/* EXACT SAME STYLING YOU PROVIDED */
.reports-container {
  padding: 20px;
  color: #fff;
  background: #0b2518;
}

.page-title {
  font-size: 28px;
  margin-bottom: 25px;
  color: #b7f5c5;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.summary-card {
  background: #145a32;
  padding: 18px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.summary-card .value {
  font-size: 28px;
  font-weight: bold;
  margin-top: 8px;
  color: #b7f5c5;
}

.chart-card {
  margin-top: 30px;
  background: #174d37;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 3px 7px rgba(0,0,0,0.2);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #d2ffe0;
}

.btn {
  background: #198754;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
.btn:hover {
  background: #146c43;
}
</style>
