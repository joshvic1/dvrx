import React, { useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import styles from "@/styles/VariantPopup.module.css";

export default function VariantPopup({
  product,
  selectedVariants,
  setSelectedVariants,
  onConfirm,
  onClose,
}) {
  const [errors, setErrors] = useState({});

  const handleChange = (variantName, value) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: value,
    }));

    // clear error for that variant
    setErrors((prev) => ({ ...prev, [variantName]: "" }));
  };

  const handleAddToCart = () => {
    const newErrors = {};
    product.variants?.forEach((v) => {
      if (!selectedVariants[v.name]) {
        newErrors[v.name] = `Select a ${v.name}`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(selectedVariants);
  };

  return (
    <div className={styles.variantPopupOverlay}>
      <div className={styles.variantPopup}>
        {/* Header */}
        <div className={styles.variantPopupHeader}>
          <Link
            href={`/product/${product._id}`}
            className={styles.tooltipWrapper}
          >
            <img
              src={product.image}
              alt={product.name}
              className={styles.variantPopupImage}
            />
            <span className={styles.tooltip}>See more</span>
          </Link>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.variantPopupBody}>
          <Link
            href={`/products/${product._id}`}
            className={`${styles.variantTitle} ${styles.tooltipWrapper}`}
          >
            {product.name}
            <span className={styles.tooltip}>See more</span>
          </Link>

          {/* Price + Rating */}
          <div className={styles.variantMeta}>
            <span className={styles.variantPrice}>
              ₦{product.price.toLocaleString()}
            </span>
            <div className={styles.variantRating}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  size={16}
                  className={
                    i < (product.rating || 0)
                      ? `${styles.star} ${styles.filled}`
                      : styles.star
                  }
                />
              ))}
            </div>
          </div>

          {/* Variants */}
          {Array.isArray(product?.variants) &&
            product.variants.map((variant, i) => (
              <div key={i} className={styles.variantGroup}>
                <p className={styles.variantLabel}>Select {variant.name}</p>

                <div className={styles.variantOptions}>
                  {variant.values?.map((val, j) => {
                    const isSelected =
                      selectedVariants[variant.name] === val.value;
                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleChange(variant.name, val.value)}
                        className={`${styles.variantPill} ${
                          isSelected ? styles.selected : ""
                        }`}
                      >
                        {val.value}
                      </button>
                    );
                  })}
                </div>

                {/* Inline error */}
                {errors[variant.name] && (
                  <p className={styles.error}>{errors[variant.name]}</p>
                )}
              </div>
            ))}

          {/* Action */}
          <button onClick={handleAddToCart} className={styles.addToCartBtn}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
