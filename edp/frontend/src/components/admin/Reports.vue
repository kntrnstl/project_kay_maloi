<template>
  <div class="reports-container">

    <div class="reports-header">
        <h2 class="page-title">Business Reports 📊</h2>

        <div class="export-buttons">
            <button class="btn" @click="exportCSV">📄 Export CSV</button>
            <button class="btn btn-secondary" @click="exportPDF">🧾 Export PDF</button>
        </div>
    </div>


    <div class="summary-grid">
      <div class="summary-card">
        <h3>Total Sales</h3>
        <p class="value">₱{{ stats.totalSales.toLocaleString() }}</p>
      </div>

      <div class="summary-card">
        <h3>Total Users</h3>
        <p class="value">{{ stats.totalUsers }}</p>
      </div>

      <div class="summary-card status-delivered">
        <h3>Delivered Orders</h3>
        <p class="value">{{ orderSummary.delivered || 0 }}</p>
      </div>

      <div class="summary-card status-pending">
        <h3>Pending Orders</h3>
        <p class="value">{{ orderSummary.pending || 0 }}</p>
      </div>
    </div>

    <div class="charts-layout">
        <div class="chart-card chart-line">
          <h3>📈 Monthly Sales</h3>
          <div class="chart-area-wrapper">
            <canvas id="monthlySalesChart"></canvas>
          </div>
        </div>

        <div class="chart-card chart-bar">
          <div class="chart-header">
            <h3>📅 Daily Sales</h3>

            <div class="date-filters">
              <input type="date" v-model="dateRange.start">
              <input type="date" v-model="dateRange.end">
              <button class="btn btn-apply" @click="loadDailySales">Apply</button>
            </div>
          </div>
          <div class="chart-area-wrapper">
            <canvas id="dailySalesChart"></canvas>
          </div>
        </div>

        <div class="chart-card chart-small">
          <h3>🔥 Top Selling Products</h3>
          <div class="chart-area-wrapper">
            <canvas id="topProductsChart"></canvas>
          </div>
        </div>

        <div class="chart-card chart-small">
          <h3>🧩 Order Status Breakdown</h3>
          <div class="chart-area-wrapper">
            <canvas id="orderStatusChart"></canvas>
          </div>
        </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// Define the primary color palette based on #0a3c2b
const PRIMARY_COLOR = "#0a3c2b"; // Dark Forest Green (Base)
const ACCENT_COLOR_1 = "#1e7952"; // Mid Green (Buttons, Bar charts)
const ACCENT_COLOR_2 = "#53b584"; // Light Green (Highlight text/values)
const BACKGROUND_LIGHT = "#155a40"; // Card Background
const CONTRAST_COLOR = "#FFFFFF"; // For high readability text

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

    // FETCH DATA methods remain the same...
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

    // CHARTS: Colors updated, scales should auto-adjust to white background
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
              borderColor: ACCENT_COLOR_1, // Mid Green
              backgroundColor: `${ACCENT_COLOR_1}40`, // Mid Green with 25% opacity
              borderWidth: 3,
              tension: 0.4,
            }
          ]
        },
        options: {
            // Set scale colors to black/dark for readability against white chart area
            scales: {
                x: { ticks: { color: "#333" }, grid: { color: "#eee" } },
                y: { ticks: { color: "#333" }, grid: { color: "#eee" } },
            },
            plugins: { legend: { labels: { color: "#333" } } }
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
            backgroundColor: ACCENT_COLOR_1 // Mid Green
          }]
        },
        options: {
            scales: {
                x: { ticks: { color: "#333" }, grid: { color: "#eee" } },
                y: { ticks: { color: "#333" }, grid: { color: "#eee" } },
            },
            plugins: { legend: { labels: { color: "#333" } } }
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
            backgroundColor: PRIMARY_COLOR // Dark Forest Green
          }]
        },
        options: {
            indexAxis: 'y', // Horizontal bars for product names
            scales: {
                x: { ticks: { color: "#333" }, grid: { color: "#eee" } },
                y: { ticks: { color: "#333" }, grid: { color: "#eee" } },
            },
            plugins: { legend: { labels: { color: "#333" } } }
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
            // Distinctive colors for status: Green, Dark Green, Gray, Red
            backgroundColor: [ACCENT_COLOR_1, PRIMARY_COLOR, "#7f8c8d", "#c0392b"],
            hoverBackgroundColor: [ACCENT_COLOR_2, PRIMARY_COLOR, "#95a5a6", "#e74c3c"]
          }]
        },
        options: {
            plugins: { legend: { labels: { color: "#333" } } }
        }
      });
    },

    exportCSV() {
      // Export logic remains the same
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
.reports-container {
  padding: 30px;
  color: #FFFFFF; /* High contrast text */
  background: #0a3c2b; /* Base Dark Forest Green */
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* A clean, readable font stack */
}

/* --- TITLE & HEADERS --- */
.reports-header {
  display: flex;
  justify-content: space-between; /* title left, buttons right */
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap; /* responsive wrapping for smaller screens */
}

.page-title {
  color: #1A5E46;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -0.2px;
  margin: 0;
}

.export-buttons {
  display: flex;
  gap: 15px;
  margin-top: 10px; /* optional for small screens wrap */
}


.chart-card h3 {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 15px;
    color: #FFFFFF;
}

/* --- SUMMARY CARDS --- */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: #155a40; /* Card Background */
  padding: 25px; /* Increased padding */
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
  border-left: 5px solid #1e7952; /* Visual demarcation */
  transition: all 0.2s;
}

.summary-card:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(0,0,0,0.5);
}

.summary-card h3 {
    color: #C8E6C9;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 400;
}

.summary-card .value {
  font-size: 36px;       /* keeps the emphasis */
  font-weight: 700;
  color:white;        /* your light green accent */
  margin-top: 5px;       /* optional spacing from h3 */
}

/* Custom styles for specific cards for visual distinction */
.summary-card.status-delivered {
    border-left-color: #53b584;
}
.summary-card.status-pending {
    border-left-color: #ffc107; /* Yellow/Amber for caution */
}

/* --- CHART LAYOUT --- */
.charts-layout {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two main columns */
    gap: 30px;
}

/* Apply span logic for large charts */
.chart-line, .chart-bar {
    grid-column: span 2;
}
/* Ensure small charts take one column each */
.chart-small {
    grid-column: span 1;
}

/* --- CHART CARDS --- */
.chart-card {
  background: #155a40; /* Card Background */
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}

.chart-area-wrapper {
    /* Critical for readability: set chart area to white */
    background: #FFFFFF;
    padding: 15px;
    border-radius: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* --- FORMS & INPUTS --- */
.date-filters input {
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #1e7952;
    margin-right: 8px;
    background: #0a3c2b; /* Input background same as page background */
    color: #FFFFFF;
    font-size: 14px;
}

/* --- BUTTONS --- */
.export-buttons {
    margin-bottom: 30px;
    display: flex;
    gap: 15px;
}

.btn {
  background: #1e7952; /* Primary Action Green */
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  color: #FFFFFF;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn:hover {
  background: #53b584;
  transform: translateY(-1px);
}

.btn-secondary {
    background: #0a3c2b; /* Darker button for secondary action */
    border: 1px solid #1e7952;
}

.btn-secondary:hover {
    background: #1e7952;
}

.btn-apply {
    padding: 10px 14px;
}
</style>