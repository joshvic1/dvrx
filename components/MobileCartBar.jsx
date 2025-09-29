"use client";

import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/MobileCartBar.module.css";

export default function MobileCartBar() {
  const { cart, updateQty, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [animateDrop, setAnimateDrop] = useState(false);
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Animate "drop into basket" whenever an item is added
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

  return (
    <>
      {/* Floating closed bar */}
      {!isOpen && cartCount > 0 && (
        <div
          className={`${styles.floatingBar} ${
            animateDrop ? styles.dropAnimation : ""
          }`}
          onClick={toggleOpen}
        >
          <span className={styles.cartCount}>{cartCount} items</span>
          <span className={styles.cartTotal}>₦{total.toLocaleString()}</span>
          <button
            className={styles.checkoutBtn}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/checkout");
            }}
          >
            Checkout
          </button>
        </div>
      )}

      {/* Fullscreen expanded cart */}
      {isOpen && (
        <div className={styles.fullscreenCart}>
          <div className={styles.cartHeader}>
            <h2>Your Cart</h2>
            <button onClick={toggleOpen} className={styles.closeBtn}>
              ✕
            </button>
          </div>

          <div className={styles.cartItems}>
            {cart.map((item) => (
              <div key={item.key} className={styles.item}>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className={styles.itemImage}
                />
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>
                    ₦{Number(item.price).toLocaleString()}
                  </p>
                  <div className={styles.qtyControls}>
                    <button
                      onClick={() =>
                        item.qty === 1
                          ? removeFromCart(item.productId, item.variants || {})
                          : updateQty(
                              item.productId,
                              item.variants || {},
                              item.qty - 1
                            )
                      }
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() =>
                        updateQty(
                          item.productId,
                          item.variants || {},
                          item.qty + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky footer checkout */}
          <div className={styles.fullscreenFooter}>
            <span>Total: ₦{total.toLocaleString()}</span>
            <button
              className={styles.checkoutBtn}
              onClick={() => router.push("/checkout")}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
