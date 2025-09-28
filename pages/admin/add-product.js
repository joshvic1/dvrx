"use client";
import { useState } from "react";
import styles from "@/styles/ProductForm.module.css";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AddProductPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "male",
    subcategory: "rings",
    images: [],
    hasVariants: false,
    stock: 0,
    variants: [],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let payload = {
        ...form,
        price: Number(form.price),
        category: form.category.toLowerCase(),
        subcategory: form.subcategory.toLowerCase(),
        images: form.images.filter((img) => img.trim() !== ""),
      };

      if (form.hasVariants) {
        // pass the variants to backend
        payload.variants = form.variants;
        // no need to set payload.stock here, backend will calculate it
      } else {
        payload.stock = Number(form.stock) || 0;
        payload.variants = [];
      }

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Product added successfully!");
        setForm({
          name: "",
          price: "",
          description: "",
          category: "male",
          subcategory: "rings",
          images: [],
          hasVariants: false,
          stock: 0,
          variants: [],
        });
      } else {
        setMessage(`❌ ${data.message || "Failed to add product"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };
  const addImage = () => {
    setForm({ ...form, images: [...form.images, ""] });
  };

  const updateImage = (index, value) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({ ...form, images: newImages });
  };

  const removeImage = (index) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setForm({ ...form, images: newImages });
  };

  const addVariant = () => {
    setForm({
      ...form,
      variants: [...form.variants, { name: "", values: [] }],
    });
  };

  const updateVariantName = (index, value) => {
    const newVariants = [...form.variants];
    newVariants[index].name = value;
    setForm({ ...form, variants: newVariants });
  };

  const addValue = (variantIndex) => {
    const newVariants = [...form.variants];
    newVariants[variantIndex].values.push({ value: "", stock: 0 });
    setForm({ ...form, variants: newVariants });
  };

  const updateValue = (variantIndex, valueIndex, field, value) => {
    const newVariants = [...form.variants];
    newVariants[variantIndex].values[valueIndex][field] =
      field === "stock" ? Number(value) || 0 : value;
    setForm({ ...form, variants: newVariants });
  };

  const removeValue = (variantIndex, valueIndex) => {
    const newVariants = [...form.variants];
    newVariants[variantIndex].values.splice(valueIndex, 1);
    setForm({ ...form, variants: newVariants });
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        <h1 className={styles.heading}>Add Product</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Name:
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Price:
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Description:
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={styles.textarea}
            />
          </label>

          <label className={styles.label}>
            Category:
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </label>

          <label className={styles.label}>
            Subcategory:
            <select
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="rings">Rings</option>
              <option value="necklaces">Necklaces</option>
              <option value="bracelets">Bracelets</option>
              <option value="wristwatches">Wristwatches</option>
              <option value="earrings">Earrings</option>
            </select>
          </label>

          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.hasVariants}
              onChange={(e) =>
                setForm({
                  ...form,
                  hasVariants: e.target.checked,
                  variants: [],
                })
              }
            />
            <span>Has Variants?</span>
          </div>

          {form.hasVariants ? (
            <div>
              <h3 className={styles.variantHeader}>Variants</h3>
              {form.variants.map((variant, i) => (
                <div key={i} className={styles.variantCard}>
                  <input
                    type="text"
                    placeholder="Variant Name (e.g. Color)"
                    value={variant.name}
                    onChange={(e) => updateVariantName(i, e.target.value)}
                    className={styles.input}
                  />
                  {variant.values.map((val, j) => (
                    <div key={j} className={styles.valueRow}>
                      <input
                        type="text"
                        placeholder="Value (e.g. Red)"
                        value={val.value}
                        onChange={(e) =>
                          updateValue(i, j, "value", e.target.value)
                        }
                        className={styles.input}
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={val.stock}
                        onChange={(e) =>
                          updateValue(i, j, "stock", e.target.value)
                        }
                        className={styles.input}
                        style={{ maxWidth: "120px" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeValue(i, j)}
                        className={styles.smallButton}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addValue(i)}
                    className={styles.smallButton}
                  >
                    + Add Value
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className={styles.smallButton}
              >
                + Add Variant
              </button>
            </div>
          ) : (
            <label className={styles.label}>
              Stock:
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className={styles.input}
              />
            </label>
          )}

          <div className={styles.label}>
            <span>Product Images:</span>
            {form.images.map((img, i) => (
              <div key={i} className={styles.valueRow}>
                <input
                  type="text"
                  placeholder={`Image URL ${i + 1}`}
                  value={img}
                  onChange={(e) => updateImage(i, e.target.value)}
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className={styles.smallButton}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImage}
              className={styles.smallButton}
            >
              + Add Image
            </button>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </AdminLayout>
  );
}
