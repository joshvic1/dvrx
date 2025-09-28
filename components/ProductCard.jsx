"use client";
import { useState } from "react";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import VariantPopup from "./VariantPopup";
import styles from "../styles/ProductCard.module.css"; // You can move styles here

export default function ProductCard({ product }) {
  const { cart, addToCart, removeFromCart, updateQty } = useCart();
  const [variantProduct, setVariantProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Cart info
  const cartItem = cart.find((item) => item.productId === product._id);
  // Sum of all quantities for this product across all variants
  const quantityInCart = cart
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + (item.qty || 0), 0);

  // Always take the last added variant for +/- buttons
  const lastVariantItem = cart
    .filter((item) => item.productId === product._id)
    .slice(-1)[0];
  const remainingStock = product.stock - quantityInCart;

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <Link
          href={`/product/${product._id}`}
          className={styles.productCardModern}
        >
          <div className={styles.imageWrapper}>
            <img src={product.image} alt={product.name} />
          </div>

          <div className={styles.productInfo}>
            <h5 className={styles.productTitle}>{product.name}</h5>

            <div className={styles.priceCartInline}>
              <span className={styles.price}>
                ₦{product.price.toLocaleString()}
              </span>

              {quantityInCart > 0 ? (
                <div className={styles.qtyCounterInline}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (!lastVariantItem) return;

                      const variants = lastVariantItem.variants || null;

                      if (lastVariantItem.qty > 1) {
                        updateQty(
                          product._id,
                          variants,
                          lastVariantItem.qty - 1
                        );
                      } else {
                        removeFromCart(product._id, variants);
                      }
                    }}
                  >
                    -
                  </button>

                  <span>{quantityInCart}</span>
                  <button
                    disabled={remainingStock <= 0}
                    onClick={(e) => {
                      e.preventDefault();
                      if (remainingStock <= 0) return; // prevent adding extra

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
                    +
                  </button>
                </div>
              ) : (
                <button
                  className={styles.cartBtnModern}
                  onClick={(e) => {
                    e.preventDefault();
                    if (product.variants && product.variants.length > 0) {
                      setVariantProduct(product);
                    } else {
                      addToCart(product, 1);
                    }
                  }}
                >
                  <FiShoppingCart />
                </button>
              )}
            </div>
          </div>
          <div>
            {remainingStock <= 0 && (
              <p className={styles.stockWarning}>
                Only {product.stock} in stock
              </p>
            )}
          </div>
        </Link>
      </motion.div>

      {variantProduct && (
        <VariantPopup
          product={variantProduct}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants} // <-- just pass it down
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
