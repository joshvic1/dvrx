"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "@/styles/AdminPromoCodes.module.css";
import AdminLayout from "@/components/admin/AdminLayout";

const PROMO_LIMIT = 10;

export default function PromoCodesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [promoCodes, setPromoCodes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: null,
    code: "",
    amount: "",
    active: true,
    expiresAt: "",
    totalUsageLimit: 0,
    perUserLimit: 1,
    requireLogin: false,
  });

  const [loading, setLoading] = useState(false);

  // Fetch promo codes
  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/promocodes`, {
        params: { page, limit: PROMO_LIMIT, search },
      });
      setPromoCodes(res.data.promoCodes);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, [page, search]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create or update promo code
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await axios.put(`${API_URL}/api/promocodes/${form.id}`, form);
        alert("Promo code updated!");
      } else {
        await axios.post(`${API_URL}/api/promocodes`, form);
        alert("Promo code created!");
      }
      setForm({
        id: null,
        code: "",
        amount: "",
        active: true,
        expiresAt: "",
        totalUsageLimit: 0,
        perUserLimit: 1,
        requireLogin: false,
      });
      fetchPromoCodes();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Error creating/updating promo code"
      );
    }
  };

  // Edit promo code
  const handleEdit = (promo) => {
    setForm({
      id: promo._id,
      code: promo.code,
      amount: promo.amount,
      active: promo.active,
      expiresAt: promo.expiresAt
        ? new Date(promo.expiresAt).toISOString().split("T")[0]
        : "",
      totalUsageLimit: promo.totalUsageLimit,
      perUserLimit: promo.perUserLimit,
      requireLogin: promo.requireLogin,
    });
  };

  // Delete promo code
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await axios.delete(`${API_URL}/api/promocodes/${id}`);
      fetchPromoCodes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete promo code");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selected.length) return alert("Select promo codes to delete");
    if (!confirm("Are you sure you want to delete selected promo codes?"))
      return;
    try {
      await axios.post(`${API_URL}/api/promocodes/bulk-delete`, {
        ids: selected,
      });
      setSelected([]);
      fetchPromoCodes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected promo codes");
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Promo Codes</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Code"
            required
            className={styles.formInput}
          />

          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
            className={styles.formInput}
          />
          <input
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
            className={styles.formInput}
          />
          <input
            name="totalUsageLimit"
            type="number"
            value={form.totalUsageLimit}
            onChange={handleChange}
            placeholder="Total usage limit"
            className={styles.formInput}
          />
          <input
            name="perUserLimit"
            type="number"
            value={form.perUserLimit}
            onChange={handleChange}
            placeholder="Per user limit"
            className={styles.formInput}
          />
          <label>
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
              className={styles.formInput}
            />{" "}
            Active
          </label>
          <label>
            <input
              name="requireLogin"
              type="checkbox"
              checked={form.requireLogin}
              onChange={handleChange}
              className={styles.formInput}
            />{" "}
            Require login
          </label>
          <button type="submit" className={styles.formButton}>
            {form.id ? "Update" : "Create"}
          </button>
        </form>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />

        {/* Bulk delete button */}
        {selected.length > 0 && (
          <button onClick={handleBulkDelete} className={styles.bulkDelete}>
            Delete Selected ({selected.length})
          </button>
        )}

        {/* Promo codes table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? promoCodes.map((p) => p._id) : []
                    )
                  }
                  checked={
                    selected.length === promoCodes.length &&
                    promoCodes.length > 0
                  }
                />
              </th>
              <th>Code</th>
              <th>Amount</th>
              <th>Active</th>
              <th>Expires</th>
              <th>Total Usage</th>
              <th>Per User</th>
              <th>Require Login</th>
              <th>Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promo) => (
              <tr key={promo._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(promo._id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked
                          ? [...prev, promo._id]
                          : prev.filter((id) => id !== promo._id)
                      )
                    }
                  />
                </td>
                <td>{promo.code}</td>
                <td>₦{promo.amount}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      promo.active ? styles.badgeActive : styles.badgeInactive
                    }`}
                  >
                    {promo.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {promo.expiresAt
                    ? new Date(promo.expiresAt).toLocaleDateString()
                    : "-"}
                </td>
                <td>{promo.totalUsageLimit || "∞"}</td>
                <td>{promo.perUserLimit}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      promo.requireLogin ? styles.badgeYes : styles.badgeNo
                    }`}
                  >
                    {promo.requireLogin ? "Yes" : "No"}
                  </span>
                </td>
                <td>{promo.usageCount || 0}</td>
                <td>
                  <button
                    onClick={() => handleEdit(promo)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo._id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          {Array.from({ length: Math.ceil(total / PROMO_LIMIT) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`${styles.pageButton} ${
                page === i + 1 ? styles.activePage : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
