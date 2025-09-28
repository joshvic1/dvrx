"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import styles from "../../styles/TrackOrder.module.css";

export default function TrackOrderPage() {
  const router = useRouter();
  const { orderCode } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 1️⃣ Hard-coded list of statuses (can later come from backend)
  const allSteps = ["pending", "processing", "shipped", "delivered"];

  useEffect(() => {
    if (!orderCode) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/code/${orderCode}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderCode, API_URL]);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <p>Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.pageWrapper}>
        <p>Order not found.</p>
      </div>
    );
  }

  // 2️⃣ Build the progress info
  const steps = allSteps; // Later you can fetch this list instead of hard-coding
  const currentStep =
    steps.findIndex((s) => s.toLowerCase() === order.status.toLowerCase()) + 1;
  const isDelivered = currentStep === steps.length;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Tracking Order: {order.orderCode}</h2>

        {/* === Progress Bar === */}
        <div className={styles.progressBar}>
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const isActive = stepNumber <= currentStep;
            const last = stepNumber === steps.length;

            return (
              <div key={step} className={styles.stepWrapper}>
                <div
                  className={`${styles.circle} ${
                    isActive ? styles.activeCircle : ""
                  }`}
                >
                  {stepNumber}
                </div>
                <span className={styles.label}>{step}</span>

                {!last && (
                  <div
                    className={`${styles.line} ${
                      stepNumber < currentStep
                        ? isDelivered
                          ? styles.lineDelivered
                          : styles.lineActive
                        : ""
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* === Order Details === */}
        <div className={styles.details}>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Total:</strong> ₦{order.total.toLocaleString("en-NG")}
          </p>
          <p>
            <strong>Customer:</strong> {order.customerName}
          </p>
          <p>
            <strong>Email:</strong> {order.customerEmail}
          </p>
          <p>
            <strong>Shipping:</strong> {order.shippingAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
