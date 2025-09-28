"use client";
import axios from "axios";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/AdminEditProduct.module.css";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EditProductPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const { id } = router.query;
  const [manualSales, setManualSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    subcategory: "",
    images: [],
    hasVariants: false,
    stock: "",
    variants: [],
  });

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
          setForm({
            name: data.name,
            price: data.price,
            description: data.description,
            category: data.category,
            subcategory: data.subcategory,
            images: data.images || [],
            hasVariants: data.hasVariants,
            stock: data.stock,
            variants: data.variants || [],
            manualSoldQty: data.manualSoldQty || 0,
            manualSoldAmount: data.manualSoldAmount || 0,
          });
          setManualSales(data.manualSales || []);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Handle simple input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleRemoveManualSale = async (createdAt) => {
    if (!confirm("Are you sure you want to remove this manual sale?")) return;

    try {
      const res = await axios.patch(
        `${API_URL}/api/products/${id}/manual-sale`,
        { action: "remove", createdAt }
      );

      if (res.data.product) {
        setManualSales(res.data.product.manualSales || []);
        alert("Manual sale removed successfully");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to remove manual sale");
    }
  };

  // ✅ Handle variant name change
  const handleVariantChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[index][field] = value;
      return { ...prev, variants: updated };
    });
  };

  // ✅ Handle variant value change
  const handleVariantValueChange = (variantIndex, valueIndex, field, value) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[variantIndex].values[valueIndex][field] =
        field === "stock" ? Number(value) || 0 : value;
      return { ...prev, variants: updated };
    });
  };

  // ✅ Add new variant row
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", values: [] }],
    }));
  };

  // ✅ Remove variant row
  const removeVariant = (index) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated.splice(index, 1);
      return { ...prev, variants: updated };
    });
  };

  // ✅ Add new value to a variant
  const addVariantValue = (variantIndex) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[variantIndex].values.push({ value: "", stock: 0 });
      return { ...prev, variants: updated };
    });
  };

  // ✅ Remove value from a variant
  const removeVariantValue = (variantIndex, valueIndex) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[variantIndex].values.splice(valueIndex, 1);
      return { ...prev, variants: updated };
    });
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Product updated successfully!");
        router.push("/admin/products");
      } else {
        alert(data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return <p>Loading product...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Edit Product</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="subcategory"
            placeholder="Subcategory"
            value={form.subcategory}
            onChange={handleChange}
          />
          <div>
            <label>Product Images</label>
            {form.images.map((img, i) => (
              <div key={i} className={styles.imageRow}>
                <input
                  type="text"
                  value={img}
                  onChange={(e) => {
                    const updated = [...form.images];
                    updated[i] = e.target.value;
                    setForm({ ...form, images: updated });
                  }}
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...form.images];
                    updated.splice(i, 1);
                    setForm({ ...form, images: updated });
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm({ ...form, images: [...form.images, ""] })}
            >
              + Add Image
            </button>
          </div>

          <label>
            <input
              type="checkbox"
              name="hasVariants"
              checked={form.hasVariants}
              onChange={handleChange}
            />{" "}
            Has Variants?
          </label>

          {!form.hasVariants && (
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={form.stock}
              onChange={handleChange}
            />
          )}

          {form.hasVariants && (
            <div className={styles.variants}>
              <h3>Variants</h3>
              {form.variants.map((variant, i) => (
                <div key={i} className={styles.variantBlock}>
                  <div className={styles.variantRow}>
                    <input
                      type="text"
                      placeholder="Variant Name (e.g. Color)"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(i, "name", e.target.value)
                      }
                    />
                    <button type="button" onClick={() => removeVariant(i)}>
                      Remove
                    </button>
                  </div>

                  {/* Values for this variant */}
                  <div className={styles.values}>
                    {variant.values.map((val, j) => (
                      <div key={j} className={styles.valueRow}>
                        <input
                          type="text"
                          placeholder="Value (e.g. Red)"
                          value={val.value}
                          onChange={(e) =>
                            handleVariantValueChange(
                              i,
                              j,
                              "value",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={val.stock}
                          onChange={(e) =>
                            handleVariantValueChange(
                              i,
                              j,
                              "stock",
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantValue(i, j)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addVariantValue(i)}>
                      + Add Value
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addVariant}>
                + Add Variant
              </button>
            </div>
          )}
          <p>Manual Sold Qty</p>
          <input
            type="number"
            name="manualSoldQty"
            placeholder="Manual Sold Qty"
            value={form.manualSoldQty}
            onChange={handleChange}
          />
          <p>Manual Sold Price</p>
          <input
            type="number"
            name="manualSoldAmount"
            placeholder="Manual Sold Amount (₦)"
            value={form.manualSoldAmount}
            onChange={handleChange}
          />
          <h4>Manual Sales</h4>
          {manualSales.length === 0 && <p>No manual sales yet</p>}
          <ul>
            {manualSales.map((ms, idx) => (
              <li key={idx} className={styles.manualSaleItem}>
                <span>
                  Qty: {ms.qty} | Amount: ₦{ms.amount.toLocaleString()} | Date:{" "}
                  {new Date(ms.createdAt).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveManualSale(ms.createdAt)}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button type="submit" className={styles.submitBtn}>
            Save Changes
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
