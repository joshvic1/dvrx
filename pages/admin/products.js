"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import styles from "@/styles/AdminProductList.module.css";
import { useToast } from "@/context/ToastContext"; // ✅ import toast
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminProductsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { addToast } = useToast(); // ✅ use toast context

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [selected, setSelected] = useState([]);

  // confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // single id OR "bulk"

  // fetch products from backend
  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/products/admin?page=${pageNum}&limit=50&search=${search}&sort=${sort}`
      );
      const data = await res.json();
      if (res.ok) {
        if (pageNum === 1) {
          setProducts(data.products);
        } else {
          setProducts((prev) => [...prev, ...data.products]);
        }
        setTotalPages(data.pages);

        // ✅ use backend result directly
        if (pageNum === 1) setFiltered(data.products);
        else setFiltered((prev) => [...prev, ...data.products]);
      } else {
        console.error(data.message || "Failed to load products");
        addToast(data.message || "Failed to load products", "error");
      }
    } catch (err) {
      console.error("Error fetching products", err);
      addToast("Error fetching products", "error");
    } finally {
      setLoading(false);
    }
  };

  // re-fetch on search/sort change
  useEffect(() => {
    fetchProducts(1);
    setPage(1);
  }, [search, sort]);

  // 🚨 remove this block (no need for extra filtering)
  // useEffect(() => { ... }, [search, sort, products]);

  useEffect(() => {
    fetchProducts(1);
    setPage(1);
  }, [search, sort]);

  // 🔎 Local search + sort
  useEffect(() => {
    let list = [...products];

    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    list.sort((a, b) => {
      if (sort === "latest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    setFiltered(list);
  }, [search, sort, products]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  const goToEdit = (id) => router.push(`/admin/edit-product/${id}`);

  // ✅ Confirm delete trigger
  const requestDelete = (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const requestBulkDelete = () => {
    if (selected.length === 0) {
      addToast("No products selected", "error");
      return;
    }
    setDeleteTarget("bulk");
    setConfirmOpen(true);
  };

  // ✅ Final delete handler (single + bulk)
  const handleDelete = async () => {
    try {
      if (deleteTarget === "bulk") {
        const res = await fetch(`${API_URL}/api/products/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selected }),
        });
        const data = await res.json();

        if (!res.ok) {
          console.error("Bulk delete error:", data);
          addToast(data.message || "Bulk delete failed", "error");
          return;
        }

        setProducts((prev) => prev.filter((p) => !selected.includes(p._id)));
        addToast(
          `Deleted ${data.deletedCount || selected.length} products`,
          "success"
        );
        setSelected([]);
      } else {
        const res = await fetch(`${API_URL}/api/products/${deleteTarget}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          console.error("Delete failed:", data);
          addToast(data.message || "Failed to delete product", "error");
          return;
        }

        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget));
        addToast("Product deleted ✅", "success");
      }
    } catch (err) {
      console.error("Delete error:", err);
      addToast("Server error while deleting", "error");
    } finally {
      setConfirmOpen(false);
      setDeleteTarget(null);
    }
  };

  // ✅ Mass selection
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((p) => p._id));
    }
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>All Products</h1>

        {/* 🔎 Search + Filter + Mass Actions */}
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={styles.filter}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

          <button onClick={selectAll} className={styles.selectAll}>
            {selected.length === filtered.length
              ? "Unselect All"
              : "Select All"}
          </button>

          {selected.length > 0 && (
            <button
              onClick={requestBulkDelete}
              className={styles.deleteSelected}
            >
              Delete Selected ({selected.length})
            </button>
          )}
        </div>

        {filtered.length === 0 && !loading && <p>No products found.</p>}

        <div className={styles.grid}>
          {filtered.map((product) => (
            <div key={product._id} className={styles.card}>
              <input
                type="checkbox"
                checked={selected.includes(product._id)}
                onChange={() => toggleSelect(product._id)}
              />
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className={styles.image}
              />
              <h3>{product.name}</h3>
              <p>₦{product.price.toLocaleString("en-NG")}</p>
              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
              <div className={styles.totalSold}>
                <strong>Total Sold:</strong> {product.totalSoldQty || 0} - ₦
                {(product.totalSoldAmount || 0).toLocaleString("en-NG")}
              </div>

              {product.hasVariants && (
                <div className={styles.variants}>
                  <strong>Variants:</strong>
                  {product.variants.map((variant, i) => (
                    <div key={i} className={styles.variant}>
                      <em>{variant.name}:</em>{" "}
                      {variant.values
                        .map((v) => `${v.value} (${v.stock})`)
                        .join(", ")}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.actionsRow}>
                <button
                  onClick={() => goToEdit(product._id)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={() => requestDelete(product._id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {page < totalPages && (
          <div className={styles.loadMoreWrapper}>
            <button
              onClick={handleLoadMore}
              className={styles.loadMoreBtn}
              disabled={loading}
            >
              {loading ? "Loading..." : "See More"}
            </button>
          </div>
        )}

        {/* ⚡ ConfirmDialog */}
        <ConfirmDialog
          open={confirmOpen}
          title="Confirm Delete"
          message={
            deleteTarget === "bulk"
              ? `Delete ${selected.length} selected products?`
              : "Are you sure you want to delete this product?"
          }
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
