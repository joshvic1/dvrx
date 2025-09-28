"use client";
import { useState } from "react";
import Link from "next/link";
import { FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import VariantPopup from "./VariantPopup";
import styles from "../styles/PopupProductCard.module.css";

export default function PopupProductCard({ product }) {
  const { cart, addToCart, removeFromCart, updateQty } = useCart();
  const [variantProduct, setVariantProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Find items in cart
  const cartItems = cart.filter((item) => item.productId === product._id);
  const quantityInCart = cartItems.reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );
  const lastVariantItem = cartItems.slice(-1)[0];
  const remainingStock = product.stock - quantityInCart;

  return (
    <>
      <div className={styles.card}>
        {/* Product clickable image */}
        <Link href={`/product/${product._id}`} className={styles.imageWrapper}>
          <img src={product.image} alt={product.name} />
        </Link>

        <div className={styles.info}>
          {/* Price emphasized */}
          <p className={styles.price}>
            ₦{product.price.toLocaleString("en-NG")}
          </p>
          {/* Product name smaller */}
          <Link href={`/product/${product._id}`} className={styles.name}>
            {product.name}
          </Link>

          {/* Cart actions */}
          {quantityInCart > 0 ? (
            <div className={styles.qtyCounter}>
              <button
                onClick={() => {
                  if (!lastVariantItem) return;
                  const variants = lastVariantItem.variants || null;

                  if (lastVariantItem.qty > 1) {
                    updateQty(product._id, variants, lastVariantItem.qty - 1);
                  } else {
                    removeFromCart(product._id, variants);
                  }
                }}
              >
                <FiMinus />
              </button>

              <span>{quantityInCart}</span>

              <button
                disabled={remainingStock <= 0}
                onClick={() => {
                  if (remainingStock <= 0) return;

                  if (product.variants && product.variants.length > 0) {
                    setVariantProduct(product);
                  } else {
                    const variants = lastVariantItem?.variants || null;
                    updateQty(
                      product._id,
                      variants,
                      (lastVariantItem?.qty || 0) + 1
                    );
                  }
                }}
              >
                <FiPlus />
              </button>
            </div>
          ) : (
            <button
              className={styles.addBtn}
              onClick={() => {
                if (product.variants && product.variants.length > 0) {
                  setVariantProduct(product);
                } else {
                  addToCart(product, 1);
                }
              }}
            >
              <FiShoppingCart /> Add
            </button>
          )}
        </div>
      </div>

      {/* Variant selection modal */}
      {variantProduct && (
        <VariantPopup
          product={variantProduct}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants}
          onClose={() => setVariantProduct(null)}
          onConfirm={(selected) => {
            addToCart(
              product,
              1,
              selected && Object.keys(selected).length > 0 ? selected : null
            );
            setVariantProduct(null);
            setSelectedVariants({});
          }}
        />
      )}
    </>
  );
}
