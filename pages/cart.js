"use client";
import { useEffect } from "react";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/CartPage.module.css";
import toast from "react-hot-toast";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQty,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
    resetPromoCode,
  } = useCart();
  useEffect(() => {
    return () => {
      // When CartPage unmounts, clear promo unless going directly to checkout
      if (!window.location.pathname.startsWith("/checkout")) {
        resetPromoCode();
      }
    };
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCode) return toast.error("Enter a promo code");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/promocodes/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promoCode: promoCode.toUpperCase() }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid promo code");
        setDiscount(0);
      } else {
        toast.success(
          `🎉 Promo applied! You saved ₦${data.amount.toLocaleString()}`
        );
        setDiscount(data.amount || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while applying promo");
      setDiscount(0);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 1),
    0
  );
  const totalAfterDiscount = Math.max(total - discount, 0);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className={styles.emptyCart}>
          Cart is empty. <Link href="/">Go shopping</Link>
        </p>
      ) : (
        <>
          <div>
            {cart.map((item) => (
              <div key={item.key} className={styles.cartItem}>
                <div className={styles.productImage}>
                  <Image
                    src={
                      item.image ||
                      "https://via.placeholder.com/80x80?text=No+Image"
                    }
                    alt={item.name}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.productDetails}>
                  <h3 className={styles.productName}>{item.name}</h3>
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <p className={styles.productVariant}>
                      {Object.entries(item.variants)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" | ")}
                    </p>
                  )}
                  <p className={styles.productPrice}>
                    ₦{item.price.toLocaleString()}
                  </p>
                </div>
                <input
                  type="number"
                  value={item.qty || 1}
                  onChange={(e) =>
                    updateQty(
                      item.productId, // 👈 use productId
                      item.variants || {}, // 👈 keep variants
                      parseInt(e.target.value) || 1
                    )
                  }
                  min="1"
                  className={styles.qtyInput}
                />
                <button
                  onClick={() => {
                    removeFromCart(item.productId, item.variants || {}); // 👈 use productId + variants
                    toast("Item removed from cart");
                  }}
                  className={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className={styles.promoWrapper}>
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className={styles.promoInput}
            />
            <button onClick={handleApplyPromo} className={styles.applyPromoBtn}>
              Apply
            </button>
          </div>

          <div className={styles.totalWrapper}>
            <div className={styles.totalLine}>
              <span>Subtotal:</span>
              <span>
                ₦
                {cart
                  .reduce((sum, item) => sum + item.price * item.qty, 0)
                  .toLocaleString("en-NG")}
              </span>
            </div>

            {discount > 0 && (
              <div className={styles.totalLineDiscount}>
                <span>Promo discount:</span>
                <span>-₦{discount.toLocaleString("en-NG")}</span>
              </div>
            )}

            <div className={styles.totalLineBold}>
              <span>Total:</span>
              <span>₦{totalAfterDiscount.toLocaleString("en-NG")}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className={styles.checkoutWrapper}>
            <Link href="/checkout">
              <button className={styles.checkoutBtn}>
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
