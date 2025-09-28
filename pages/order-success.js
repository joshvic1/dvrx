"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import styles from "../styles/OrderSuccess.module.css";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  const { checkoutSuccess } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!order || !order.items || checkoutDone) return;
    checkoutSuccess(order);
    setCheckoutDone(true);
  }, [order, checkoutSuccess, checkoutDone]);

  // fetch order
  useEffect(() => {
    let cancelled = false;

    if (!orderCode) {
      const timer = setTimeout(() => {
        if (!cancelled) {
          setLoading(false);
          setAttempted(true);
        }
      }, 300);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    const fetchOrder = async () => {
      setLoading(true);
      setAttempted(false);
      try {
        const res = await fetch(`${API_URL}/api/orders/code/${orderCode}`);
        const data = await res.json();
        if (!cancelled) {
          setOrder(
            res.ok ? data : { error: data.message || "Order not found" }
          );
        }
      } catch {
        if (!cancelled) setOrder({ error: "Server error" });
      } finally {
        if (!cancelled) {
          setLoading(false);
          setAttempted(true);
        }
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [orderCode, API_URL]);

  // ---- Render states ----
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <p>Processing your order...</p>
      </div>
    );
  }

  if (order?.error) {
    return (
      <div className={styles.container}>
        <h2>❌ {order.error}</h2>
        <a href="/" className={styles.btn}>
          Go Back Home
        </a>
      </div>
    );
  }

  if (attempted && !order) {
    return (
      <div className={styles.container}>
        <h2>❌ Order not found</h2>
        <a href="/" className={styles.btn}>
          Go Back Home
        </a>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <p>Processing your order...</p>
      </div>
    );
  }

  // ---- Success ----
  return (
    <div className={styles.container}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1>✔ Order Confirmed!</h1>
        <p>
          Thank you <strong>{order.customerName}</strong>, your order has been
          placed successfully.
        </p>
      </div>

      {/* Order Card */}
      <div className={styles.orderCard}>
        {order.promoCode && (
          <p className={styles.promo}>
            Promo Applied: <strong>{order.promoCode}</strong>
          </p>
        )}

        {/* Items */}
        {/* Items */}
        {/* Items */}
        <div className={styles.orderItems}>
          {order.items.map((item, idx) => {
            console.log("Order item:", item.variants);
            // 👈 add this line

            return (
              <div key={idx} className={styles.item}>
                <img src={item.image} alt={item.name} />
                <p className={styles.itemName}>{item.name}</p>
                <div className={styles.itemInfo}>
                  {(item.variants || item.variant) &&
                    typeof (item.variants || item.variant) === "object" &&
                    Object.keys(item.variants || item.variant).length > 0 && (
                      <span className={styles.itemVariant}>
                        {Object.entries(item.variants || item.variant)
                          .map(([name, value]) => `${name}: ${value}`)
                          .join(", ")}
                      </span>
                    )}

                  <span className={styles.itemQty}>Qty: {item.qty}</span>
                  <span className={styles.itemPrice}>
                    ₦{(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className={styles.orderSummary}>
          <div>
            <span>Subtotal</span>
            <span>
              ₦
              {order.items
                .reduce((sum, i) => sum + i.price * i.qty, 0)
                .toLocaleString()}
            </span>
          </div>

          {order.promoCode && (
            <div>
              <span>Discount</span>
              <span>-₦{(order.promoDiscount || 0).toLocaleString()}</span>
            </div>
          )}

          <div className="total">
            <span>Total Paid</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>

        {/* Address */}
        <p className={styles.address}>
          <strong>Delivery Address:</strong> {order.shippingAddress}
        </p>
      </div>

      {/* CTA */}
      <div className={styles.viewOrders}>
        <a href="/profile?tab=orders" className={styles.viewOrdersBtn}>
          View Your Orders
        </a>
      </div>
    </div>
  );
}
