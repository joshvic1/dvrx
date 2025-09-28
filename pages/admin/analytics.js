import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "@/styles/AdminAnalytics.module.css";
import AdminLayout from "@/components/admin/AdminLayout";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const filterOptions = [
  { label: "All Time", value: "allTime" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Custom", value: "custom" },
];

const Analytics = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [summary, setSummary] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filter, setFilter] = useState("7d");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [filteredData, setFilteredData] = useState({
    sales: 0,
    orders: 0,
    change: { sales: 0, orders: 0 },
  });

  // Fetch main analytics on mount
  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  // Fetch filtered summary whenever filter changes
  useEffect(() => {
    if (filter === "custom") {
      const { from, to } = customRange;
      if (from && to) {
        fetchFilteredSummary(filter, customRange);
      }
    } else {
      fetchFilteredSummary(filter, customRange);
    }
  }, [filter, customRange]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, salesRes, productsRes, customersRes, categoriesRes] =
        await Promise.all([
          axios.get(`${API_URL}/api/analytics/summary`),
          axios.get(`${API_URL}/api/analytics/sales-over-time?range=30d`),
          axios.get(`${API_URL}/api/analytics/top-products?limit=5`),
          axios.get(`${API_URL}/api/analytics/top-customers?limit=5`),
          axios.get(`${API_URL}/api/analytics/top-categories`),
        ]);

      setSummary(summaryRes.data);
      setSalesOverTime(salesRes.data);
      setTopProducts(productsRes.data);
      setTopCustomers(customersRes.data);
      setTopCategories(categoriesRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredSummary = async (filter, custom) => {
    try {
      const params =
        filter === "custom"
          ? { from: custom.from, to: custom.to }
          : { range: filter };
      const res = await axios.get(`${API_URL}/api/analytics/summary`, {
        params,
      });
      setFilteredData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const salesChartData = {
    labels: salesOverTime.map((item) => item._id),
    datasets: [
      {
        label: "Sales",
        data: salesOverTime.map((item) => item.sales),
        fill: false,
        backgroundColor: "#4f46e5",
        borderColor: "#4f46e5",
        tension: 0.1,
      },
    ],
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomRange((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p className={styles.loading}>Loading analytics...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!summary) return null;

  return (
    <AdminLayout>
      <h1 className={styles.heading}> Analytics</h1>
      <div className={styles.container}>
        {/* Filter Controls */}
        <div className={styles.filterBar}>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              className={filter === opt.value ? styles.activeFilter : ""}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}

          {filter === "custom" && (
            <div className={styles.customRange}>
              <input
                type="date"
                name="from"
                value={customRange.from}
                onChange={handleCustomChange}
              />
              <span>to</span>
              <input
                type="date"
                name="to"
                value={customRange.to}
                onChange={handleCustomChange}
              />
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {/* Summary Cards */}
        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <h3>Total Sales</h3>
            <p className={styles.cardValue}>
              ₦{filteredData.totals?.totalSales?.toLocaleString() || 0}
            </p>
            <p
              className={
                filteredData.change?.sales >= 0
                  ? styles.trendUpBadge
                  : styles.trendDownBadge
              }
            >
              {filteredData.change?.sales?.toFixed(2) || 0}%
            </p>
          </div>

          <div className={styles.card}>
            <h3>Total Orders</h3>
            <p className={styles.cardValue}>
              {filteredData.totals?.totalOrders || 0}
            </p>
            <p
              className={
                filteredData.change?.orders >= 0
                  ? styles.trendUpBadge
                  : styles.trendDownBadge
              }
            >
              {filteredData.change?.orders?.toFixed(2) || 0}%
            </p>
          </div>
        </div>

        {/* Two-column Layout for Charts + Top Products */}
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.section}>
              <h2>Sales Over Time</h2>
              <Line data={salesChartData} />
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.section}>
              <h2>Top Products</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Revenue</th>
                    <th>Qty Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>₦{p.revenue.toLocaleString()}</td>
                      <td>{p.totalQty}</td>
                      <td>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Two-column Layout for Customers + Categories */}
        <div className={styles.row}>
          <div className={styles.column}>
            <div className={styles.section}>
              <h2>Top Customers</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Total Spent</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>₦{c.totalSpent.toLocaleString()}</td>
                      <td>{c.ordersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.section}>
              <h2>Top Categories</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Sales</th>
                    <th>Total Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories.map((c) => (
                    <tr key={c._id}>
                      <td>{c._id}</td>
                      <td>₦{c.totalSales.toLocaleString()}</td>
                      <td>{c.totalQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
