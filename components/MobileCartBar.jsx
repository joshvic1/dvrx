"use client";

import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/MobileCartBar.module.css";
import { motion } from "framer-motion";
import { FiShoppingBag } from "react-icons/fi";

export default function MobileCartBar() {
  const { cart, updateQty, removeFromCart, hydrated } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [animateDrop, setAnimateDrop] = useState(false);
  const router = useRouter();

  if (!hydrated) {
    return <aside className={styles.sidebarPlaceholder}></aside>;
  }

  const excludedPaths = ["/cart", "/checkout", "/profile"];
  const isExcluded = excludedPaths.includes(router.pathname);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // ✅ always run hooks
  useEffect(() => {
    if (isOpen && cart.length === 0) {
      setIsOpen(false);
    }
  }, [cart, isOpen]);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateDrop(true);
      const timeout = setTimeout(() => setAnimateDrop(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [cartCount]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.png";
    if (image.startsWith("http")) return image;
    return image.startsWith("/") ? image : `/${image}`;
  };

  const handleCheckout = () => {
    setIsOpen(false); // ✅ close before redirect
    router.push("/checkout");
  };

  return (
    <>
      {isExcluded ? null : (
        <>
          {/* Floating bar */}
          {!isOpen && cartCount > 0 && (
            <div
              className={`${styles.floatingBar} ${
                animateDrop ? styles.dropAnimation : ""
              }`}
              onClick={toggleOpen}
            >
              <div className={styles.barInfo}>
                <div>
                  <FiShoppingBag size={22} />
                </div>
                <div className={styles.barContent}>
                  <span className={styles.cartCount}>{cartCount} items</span>
                  <span className={styles.total}>
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
              <div>
                <button
                  className={styles.floatingCheckout}
                  onClick={toggleOpen}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}

          {/* Bottom sheet popup */}
          {isOpen && (
            <div className={styles.overlay}>
              <motion.div
                className={styles.popup}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
              >
                {/* Header */}
                <div className={styles.header}>
                  <h3>
                    <FiShoppingBag /> Your Cart
                  </h3>
                  <button onClick={toggleOpen} className={styles.closeBtn}>
                    ✕
                  </button>
                </div>

                {/* Cart content */}
                <div className={`${styles.content} no-scrollbar`}>
                  {cart.length === 0 ? (
                    <p className={styles.empty}>Your cart is empty.</p>
                  ) : (
                    cart.map((item) => {
                      const totalProductQty = cart
                        .filter((i) => i.productId === item.productId)
                        .reduce((sum, i) => sum + i.qty, 0);

                      return (
                        <div key={item.key} className={styles.cartItem}>
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className={styles.itemImage}
                          />
                          <div className={styles.itemInfo}>
                            <p className={styles.itemName}>{item.name}</p>
                            <p className={styles.itemPrice}>
                              ₦{Number(item.price).toLocaleString()}
                            </p>

                            {/* Variants */}
                            {item.variants &&
                              Object.keys(item.variants).length > 0 && (
                                <p className={styles.itemVariant}>
                                  {Object.entries(item.variants)
                                    .map(([n, v]) => `${n}: ${v}`)
                                    .join(", ")}
                                </p>
                              )}

                            {/* Qty Controls */}
                            <div className={styles.qtyControls}>
                              <button
                                onClick={() => {
                                  if (item.qty === 1) {
                                    removeFromCart(
                                      item.productId,
                                      item.variants || {}
                                    );
                                    if (cart.length === 1) setIsOpen(false);
                                  } else {
                                    updateQty(
                                      item.productId,
                                      item.variants || {},
                                      item.qty - 1
                                    );
                                  }
                                }}
                              >
                                -
                              </button>
                              <span>{item.qty}</span>
                              <button
                                onClick={() => {
                                  if (
                                    typeof item.stock !== "number" ||
                                    totalProductQty < item.stock
                                  ) {
                                    updateQty(
                                      item.productId,
                                      item.variants || {},
                                      item.qty + 1
                                    );
                                  }
                                }}
                                disabled={
                                  typeof item.stock === "number" &&
                                  totalProductQty >= item.stock
                                }
                              >
                                +
                              </button>
                            </div>

                            {typeof item.stock === "number" &&
                              totalProductQty >= item.stock && (
                                <p className={styles.stockWarning}>
                                  Only {item.stock} in stock
                                </p>
                              )}
                          </div>

                          {/* Remove */}
                          <button
                            className={styles.removeBtn}
                            onClick={() =>
                              removeFromCart(
                                item.productId,
                                item.variants || {}
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleCheckout}
                  >
                    Checkout (₦{total.toLocaleString()})
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </>
  );
}
