// pages/admin/reviews.jsx
"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmDialog from "@/components/ConfirmDialog";
import styles from "@/styles/AdminReviews.module.css";

export default function AdminReviewsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState({ open: false, ids: [] });
  const [viewReview, setViewReview] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchReviews = async (p = 1, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/reviews/admin?page=${p}&limit=20&search=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");

      if (append) setReviews((prev) => [...prev, ...data.reviews]);
      else setReviews(data.reviews);

      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, false);
  }, [search]);

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected((prev) =>
      prev.length === reviews.length ? [] : reviews.map((r) => r._id)
    );

  const confirmBulkDelete = () => {
    if (selected.length === 0) return;
    setConfirm({ open: true, ids: selected });
  };

  const doBulkDelete = async (ids) => {
    setConfirm({ open: false, ids: [] });
    // optimistic update
    setReviews((prev) => prev.filter((r) => !ids.includes(r._id)));

    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Bulk delete failed");
      }

      fetchReviews(1, false);
      setSelected([]);
    } catch (err) {
      console.error(err);
      fetchReviews(1, false);
    }
  };

  const deleteSingle = async (id) => {
    setConfirm({ open: false, ids: [] });
    try {
      await fetch(`${API_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((prev) => prev.filter((r) => r._id !== id));
      setSelected((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error(err);
      fetchReviews(1, false);
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>All Reviews</h1>
        <p className={styles.subheading}>
          Manage and moderate customer reviews across your products
        </p>

        <div className={styles.toolbar}>
          <input
            placeholder="Search by product, email, comment or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <div className={styles.actions}>
            <button onClick={toggleSelectAll} className={styles.btn}>
              {selected.length === reviews.length
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

        <div className={styles.grid}>
          {reviews.map((r) => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardTop}>
                <input
                  type="checkbox"
                  checked={selected.includes(r._id)}
                  onChange={() => toggleSelect(r._id)}
                />
                <div className={styles.prod}>
                  {r.product?.image ? (
                    <img src={r.product.image} alt={r.product.name} />
                  ) : (
                    <div className={styles.placeholder} />
                  )}
                  <div>
                    <div className={styles.prodName}>
                      {r.product?.name || "Product removed"}
                    </div>
                    {r.product?.price != null && (
                      <div className={styles.price}>
                        ₦{Number(r.product.price).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.body}>
                <div className={styles.meta}>
                  <div className={styles.email}>{r.customerEmail}</div>
                  <div className={styles.rating}>Rating: {r.rating}/5</div>
                </div>

                <p className={styles.comment}>{r.comment}</p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.date}>
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className={styles.controls}>
                  <button
                    onClick={() => setViewReview(r)}
                    className={styles.btn}
                  >
                    View
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, ids: [r._id] })}
                    className={styles.danger}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {page < pages && (
          <div className={styles.loadMoreWrap}>
            <button
              className={styles.loadMore}
              onClick={() => fetchReviews(page + 1, true)}
            >
              {loading ? "Loading..." : "See More"}
            </button>
          </div>
        )}

        {/* View modal */}
        {viewReview && (
          <div
            className={styles.modalOverlay}
            onClick={() => setViewReview(null)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Review Details</h3>
              <div className={styles.modalRow}>
                <strong>Product</strong>
                <div>{viewReview.product?.name || "—"}</div>
              </div>
              <div className={styles.modalRow}>
                <strong>Price</strong>
                <div>
                  {viewReview.product?.price
                    ? `₦${Number(viewReview.product.price).toLocaleString()}`
                    : "—"}
                </div>
              </div>
              <div className={styles.modalRow}>
                <strong>Customer</strong>
                <div>{viewReview.customerEmail}</div>
              </div>
              <div className={styles.modalRow}>
                <strong>Rating</strong>
                <div>{viewReview.rating}</div>
              </div>
              <div className={styles.modalRow}>
                <strong>Comment</strong>
                <div>{viewReview.comment}</div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setViewReview(null)}
                  className={styles.btn}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setConfirm({ open: true, ids: [viewReview._id] });
                    setViewReview(null);
                  }}
                  className={styles.danger}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm dialog */}
        <ConfirmDialog
          open={confirm.open}
          title="Confirm Delete"
          message={`Delete ${confirm.ids.length} review(s)?`}
          onConfirm={() => {
            if (confirm.ids.length === 1) {
              deleteSingle(confirm.ids[0]);
            } else {
              doBulkDelete(confirm.ids);
            }
          }}
          onCancel={() => setConfirm({ open: false, ids: [] })}
        />
      </div>
    </AdminLayout>
  );
}
