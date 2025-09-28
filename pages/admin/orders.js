"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/ConfirmDialog";
import styles from "@/styles/AdminOrders.module.css";
import { useRouter } from "next/router";

const STATUS_LIST = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const { expand } = router.query;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, ids: [] });

  const fetchOrders = async (
    pageNumber = 1,
    status = statusFilter,
    append = false,
    search = searchTerm
  ) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/orders/admin/orders?page=${pageNumber}&limit=20&status=${status}&search=${search}`
      );
      const data = await res.json();

      if (append) setOrders((prev) => [...prev, ...data.orders]);
      else setOrders(data.orders);

      setPages(data.pages);
      setPage(data.page);

      if (!append) {
        const counts = { all: data.totalByStatus.all || 0 };
        STATUS_LIST.forEach((s) => (counts[s] = data.totalByStatus[s] || 0));
        setStatusCounts(counts);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, statusFilter, false, searchTerm);
  }, [statusFilter, searchTerm]);

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0)
      setSelectedOrders([]);
    else setSelectedOrders(orders.map((o) => o._id));
  };

  const confirmDeleteOrders = (ids) => {
    setConfirmDialog({ open: true, ids });
  };

  const deleteOrders = async (ids) => {
    setConfirmDialog({ open: false, ids: [] });
    try {
      setOrders((prev) => prev.filter((o) => !ids.includes(o._id)));
      setSelectedOrders([]);
      await fetch(`${API_URL}/api/orders/admin/orders/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    } catch (err) {
      console.error(err);
      fetchOrders(1, statusFilter, false, searchTerm);
    }
  };

  const changeStatus = async (ids, status) => {
    if (!status) return;
    try {
      setOrders((prev) =>
        prev.map((o) => (ids.includes(o._id) ? { ...o, status } : o))
      );
      setSelectedOrders([]);
      await fetch(`${API_URL}/api/orders/admin/orders/bulk-update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });
    } catch (err) {
      console.error(err);
      fetchOrders(1, statusFilter, false, searchTerm);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.ordersWrapper}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by customer, tracking code, address, product, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.statusFilter}>
          <button
            className={statusFilter === "all" ? styles.activeStatus : ""}
            onClick={() => setStatusFilter("all")}
          >
            All ({statusCounts.all || 0})
          </button>
          {STATUS_LIST.map((status) => (
            <button
              key={status}
              className={statusFilter === status ? styles.activeStatus : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {statusCounts[status] || 0})
            </button>
          ))}
        </div>

        {selectedOrders.length > 0 && (
          <div className={styles.bulkActions}>
            <button
              className={styles.deleteBtn}
              onClick={() => confirmDeleteOrders(selectedOrders)}
            >
              Delete Selected
            </button>
            <select
              className={styles.statusSelect}
              onChange={(e) => changeStatus(selectedOrders, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Change Status
              </option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.ordersTable}>
          <div className={styles.tableHeader}>
            <input
              type="checkbox"
              checked={
                selectedOrders.length === orders.length && orders.length > 0
              }
              onChange={toggleSelectAll}
            />
            <span>Thumbnail</span>
            <span>Date</span>
            <span>Tracking Code</span>
            <span>Total</span>
            <span>Items</span>
            <span>Status</span>
            <span>Expand</span>
          </div>

          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              selected={selectedOrders.includes(order._id)}
              toggleSelect={() => toggleSelectOrder(order._id)}
              setModalImage={setModalImage}
              autoExpand={expand === order._id}
            />
          ))}

          {page < pages && (
            <button
              className={styles.loadMore}
              onClick={() =>
                fetchOrders(page + 1, statusFilter, true, searchTerm)
              }
            >
              {loading ? "Loading..." : "See More"}
            </button>
          )}
        </div>

        {modalImage && (
          <div className={styles.modal} onClick={() => setModalImage(null)}>
            <img src={modalImage} alt="Item" />
          </div>
        )}

        <ConfirmDialog
          open={confirmDialog.open}
          title="Confirm Delete"
          message={`Are you sure you want to delete ${confirmDialog.ids.length} order(s)?`}
          onConfirm={() => deleteOrders(confirmDialog.ids)}
          onCancel={() => setConfirmDialog({ open: false, ids: [] })}
        />
      </div>
    </AdminLayout>
  );
}

function OrderRow({
  order,
  selected,
  toggleSelect,
  setModalImage,
  autoExpand,
}) {
  const [expanded, setExpanded] = useState(autoExpand || false);

  useEffect(() => {
    if (autoExpand) setExpanded(true);
  }, [autoExpand]);

  const firstImage = order.items?.[0]?.image;

  return (
    <div className={styles.orderRow}>
      <div className={styles.rowHeader}>
        <input type="checkbox" checked={selected} onChange={toggleSelect} />
        <img src={firstImage} alt="thumbnail" className={styles.thumbnail} />
        <span>{new Date(order.createdAt).toLocaleString()}</span>
        <span>{order.orderCode}</span>
        <span>₦{order.total?.toLocaleString()}</span>
        <span>{order.items?.length} items</span>
        <span
          className={`${styles.statusBadge} ${
            styles[
              "status" +
                order.status.charAt(0).toUpperCase() +
                order.status.slice(1)
            ]
          }`}
        >
          {order.status}
        </span>
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "−" : "+"}
        </button>
      </div>

      <div
        className={`${styles.rowContent} ${expanded ? styles.expanded : ""}`}
      >
        {expanded && (
          <>
            <div className={styles.customerDetails}>
              <p>
                <strong>Customer:</strong> {order.customerName}
              </p>
              <p>
                <strong>Email:</strong> {order.customerEmail}
              </p>
              <p>
                <strong>Address:</strong> {order.shippingAddress}
              </p>
            </div>

            {order.items.map((item) => (
              <div key={item._id} className={styles.itemExpanded}>
                <img
                  src={item.image}
                  alt={item.name}
                  onClick={() => setModalImage(item.image)}
                />
                <div className={styles.itemDetails}>
                  <p>{item.name}</p>
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <p className={styles.variants}>
                      {Object.entries(item.variants)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                  <p>Qty: {item.qty}</p>
                  <p>₦{item.price?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
