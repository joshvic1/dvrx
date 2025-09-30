"use client";

import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/CartSidebar.module.css";
import MobileCartBar from "./MobileCartBar";

export default function CartSidebar() {
  const [isDesktop, setIsDesktop] = useState(false);
  const { cart, updateQty, removeFromCart, hydrated } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [prevCartLength, setPrevCartLength] = useState(0);
  const excludedPaths = ["/cart", "/checkout", "/profile"];

  const router = useRouter();

  // Open sidebar only if cart has items & not on /cart or /checkout

  // ✅ track screen size
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1020);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const [manualClose, setManualClose] = useState(false);

  // ✅ sidebar open state (desktop only)
  useEffect(() => {
    if (!isDesktop) return; // skip mobile

    const excludedPaths = ["/cart", "/checkout", "/profile"];
    if (excludedPaths.includes(router.pathname) || cart.length === 0) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [cart, router.pathname, isDesktop]);

  // Reset manualClose on route change
  useEffect(() => {
    setManualClose(false);
  }, [router.pathname]);

  // Add body margin when sidebar is open
  // ✅ avoid body margin shift on mobile
  useEffect(() => {
    if (isDesktop) {
      document.body.style.marginRight = isOpen ? "16rem" : "0";
      return () => {
        document.body.style.marginRight = "0";
      };
    }
  }, [isOpen, isDesktop]);

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.png";
    if (image.startsWith("http")) return image;
    return image.startsWith("/") ? image : `/${image}`;
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const handleClose = () => setIsOpen(false);
  // Get total quantity of a product across all variants
  const getTotalQtyForProduct = (productId) => {
    return cart
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.qty, 0);
  };

  if (!hydrated) {
    return <aside className={styles.sidebarPlaceholder}></aside>;
  }
  // ✅ return
  if (!isDesktop) {
    return <MobileCartBar />; // only render mobile
  }

  if (!isOpen) return null; // desktop hidden
  return (
    <>
      {isDesktop ? (
        <aside className={styles.sidebar}>
          {/* Sidebar Header */}
          <div className={styles.sidebarHeader}>
            <h2>Your Cart</h2>
            <button
              onClick={handleClose}
              className={styles.closeBtn}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Cart Items */}
          <div className={styles.items}>
            {cart.length === 0 && (
              <p className={styles.empty}>Your cart is empty.</p>
            )}

            {cart.map((item) => {
              const totalProductQty = cart
                .filter((i) => i.productId === item.productId)
                .reduce((sum, i) => sum + i.qty, 0);

              return (
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

                    {/* Variant display */}
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <p className={styles.itemVariant}>
                        {Object.entries(item.variants)
                          .map(([name, value]) => `${name}: ${value}`)
                          .join(", ")}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className={styles.qtyControls}>
                      <button
                        onClick={() =>
                          item.qty === 1
                            ? removeFromCart(
                                item.productId,
                                item.variants || {}
                              )
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
                        title={
                          typeof item.stock === "number" &&
                          totalProductQty >= item.stock
                            ? `Only ${item.stock} in stock`
                            : "Add more"
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

                  {/* Remove Item */}
                  <button
                    className={styles.removeBtn}
                    onClick={() =>
                      removeFromCart(item.productId, item.variants || {})
                    }
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Total:</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              onClick={() => router.push("/checkout")}
            >
              Checkout
            </button>
          </div>
        </aside>
      ) : (
        <MobileCartBar />
      )}
    </>
  );
}
