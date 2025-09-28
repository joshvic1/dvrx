"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";
import styles from "../../styles/OrderDetail.module.css";

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const auth = useAuth() || {};
  const { user } = auth;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!id || !user) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${id}`);
        const data = await res.json();
        if (data.customerEmail !== user.email) {
          return router.push("/orders"); // prevent viewing others' orders
        }
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

  if (!user) return <p>Please login to view your order.</p>;
  if (loading) return <p>Loading order details...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className={styles.container}>
      <h2>Order Details</h2>
      <div className={styles.orderHeader}>
        <span>Order Code: {order.orderCode}</span>
        <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
        <span>Status: {order.status}</span>
      </div>

      <ul className={styles.itemsList}>
        {order.items.map((item, idx) => (
          <li key={idx}>
            <span>
              {item.name} × {item.qty}
            </span>
            <span>₦{(item.price * item.qty).toLocaleString()}</span>
          </li>
        ))}
      </ul>

      <div className={styles.total}>
        <strong>Total:</strong>
        <span>₦{order.total.toLocaleString()}</span>
      </div>
    </div>
  );
}
