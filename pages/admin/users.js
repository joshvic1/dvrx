"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/ConfirmDialog";
import styles from "@/styles/AdminUsers.module.css";

export default function AdminUsersPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, ids: [] });
  const [editUser, setEditUser] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const handleViewOrders = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/admin/${userId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }, // include token if required
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedUser(data.user);
        setOrders(data.orders);
        setShowOrdersModal(true);
      } else {
        alert(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/users/admin/${userId}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");

      setSelectedUserOrders(data); // { user, orders }
    } catch (err) {
      alert(err.message);
    }
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUsers = async (pg = 1) => {
    try {
      const res = await fetch(`${API_URL}/api/users/admin?page=${pg}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected((prev) =>
      prev.length === users.length ? [] : users.map((u) => u._id)
    );

  const confirmBulkDelete = () => {
    if (selected.length === 0) return;
    setConfirm({ open: true, ids: selected });
  };

  const doBulkDelete = async (ids) => {
    setConfirm({ open: false, ids: [] });
    setUsers((prev) => prev.filter((u) => !ids.includes(u._id)));
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_URL}/api/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setSelected([]);
      fetchUsers(page);
    } catch (err) {
      console.error("Bulk delete error:", err);
      fetchUsers(page);
    }
  };

  const deleteSingle = async (id) => {
    setConfirm({ open: false, ids: [] });
    try {
      await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setSelected((prev) => prev.filter((x) => x !== id));
      fetchUsers(page);
    } catch (err) {
      console.error(err);
      fetchUsers(page);
    }
  };

  const saveUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${editUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");
      setEditUser(null);
      fetchUsers(page);
    } catch (err) {
      console.error("Update user error:", err);
    }
  };

  const filteredUsers = (users || []).filter(
    (u) =>
      u?.name?.toLowerCase().includes(search.toLowerCase()) ||
      u?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / 20);

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>All Users ({total})</h1>

        <div className={styles.toolbar}>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <div className={styles.actions}>
            <button onClick={toggleSelectAll} className={styles.btn}>
              {selected.length === (users?.length || 0)
                ? "Unselect All"
                : "Select All"}
            </button>

            <button
              onClick={confirmBulkDelete}
              className={styles.danger}
              disabled={selected.length === 0}
            >
              Delete Selected ({selected.length})
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(u._id)}
                      onChange={() => toggleSelect(u._id)}
                    />
                  </td>
                  <td>
                    {u.profileImage ? (
                      <img
                        src={`${API_URL}/${u.profileImage}`}
                        alt={u.name}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder} />
                    )}
                  </td>
                  <td>
                    <div className={styles.card}>
                      <h3>{u.name}</h3>

                      <p>Orders: {u.ordersCount}</p>

                      <button
                        onClick={() => handleViewOrders(u._id)}
                        className={styles.btn}
                      >
                        View Orders
                      </button>
                    </div>
                  </td>

                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`${styles.role} ${
                        u.role === "admin" ? styles.admin : styles.customer
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actionsCell}>
                    <button
                      onClick={() => setEditUser(u)}
                      className={styles.btn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirm({ open: true, ids: [u._id] })}
                      className={styles.danger}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>

        {/* Confirm dialog */}
        <ConfirmDialog
          open={confirm.open}
          title="Confirm Delete"
          message={`Delete ${confirm.ids.length} user(s)?`}
          onConfirm={() => {
            if (confirm.ids.length === 1) {
              deleteSingle(confirm.ids[0]);
            } else {
              doBulkDelete(confirm.ids);
            }
          }}
          onCancel={() => setConfirm({ open: false, ids: [] })}
        />

        {/* Edit modal */}
        {editUser && (
          <div
            className={styles.modalOverlay}
            onClick={() => setEditUser(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Edit User</h3>
              <label>
                Name
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                />
              </label>
              <label>
                Role
                <select
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser({ ...editUser, role: e.target.value })
                  }
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setEditUser(null)}
                  className={styles.btn}
                >
                  Cancel
                </button>
                <button onClick={saveUser} className={styles.primary}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {showOrdersModal && selectedUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>Orders for {selectedUser.name}</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowOrdersModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className={styles.modalContent}>
                {orders.length > 0 ? (
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order._id}
                          onClick={() =>
                            (window.location.href = `/admin/orders?expand=${order._id}`)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          <td>{order.orderCode}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>₦{order.total.toLocaleString()}</td>
                          <td>
                            <span
                              className={`${styles.status} ${
                                styles[order.status]
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>{order.items?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No orders found for this user.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
