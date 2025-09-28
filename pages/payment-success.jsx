import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const router = useRouter();
  const { reference } = router.query;
  const [status, setStatus] = useState("verifying");
  const [orderCode, setOrderCode] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!reference) return;
    async function verify() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/payments/verify?reference=${encodeURIComponent(
            reference
          )}`
        );
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setOrderCode(data.orderCode);
          clearCart(); // clear local cart if payment succeeded
        } else {
          setStatus("failed");
          console.error(data);
        }
      } catch (err) {
        console.error(err);
        setStatus("failed");
      }
    }
    verify();
  }, [reference]);

  if (!reference)
    return <div style={{ padding: 20 }}>Awaiting payment reference...</div>;

  return (
    <div style={{ padding: 20 }}>
      {status === "verifying" && <p>Verifying payment... please wait.</p>}
      {status === "success" && (
        <>
          <h2>Payment successful 🎉</h2>
          <p>
            Your order code: <strong>{orderCode}</strong>
          </p>
          <p>We’ve sent an email with a link so you can track your order.</p>
        </>
      )}
      {status === "failed" && (
        <>
          <h2>Payment verification failed</h2>
          <p>
            We couldn’t verify your payment. If you were charged, contact
            support with reference: <strong>{reference}</strong>
          </p>
        </>
      )}
    </div>
  );
}
