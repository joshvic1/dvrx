"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "../styles/Orders.module.css";
import { FaArrowLeft, FaSpinner, FaRegCheckCircle } from "react-icons/fa";
import ProfileLayout from "@/components/ProfileLayout";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [reviewedMap, setReviewedMap] = useState({});

  const checkIfReviewed = async (productId) => {
    if (!user?.email) return false;
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/check?productId=${productId}&customerEmail=${user.email}`
      );
      const data = await res.json();
      return data.reviewed;
    } catch {
      return false;
    }
  };

  const handleCheckReview = async (productId) => {
    if (reviewedMap[productId] !== undefined) return;
    const reviewed = await checkIfReviewed(productId);
    setReviewedMap((prev) => ({ ...prev, [productId]: reviewed }));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/user/${user.email}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, authLoading, router, API_URL]);

  const toggleExpand = (orderId) =>
    setExpandedOrder(expandedOrder === orderId ? null : orderId);

  const trackOrder = (orderCode) => router.push(`/track-order/${orderCode}`);
  const goToProduct = (id) => router.push(`/product/${id}`);
  const handleGoBack = () =>
    window.history.length > 1 ? router.back() : router.push("/");

  const getImageUrl = (img) =>
    !img
      ? "/placeholder.png"
      : img.startsWith("http")
      ? img
      : img.startsWith("/")
      ? img
      : `/${img}`;

  const handleLoadMore = () => setVisibleCount((p) => p + 10);

  if (authLoading || loading)
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );

  return (
    <div className={styles.ordersContainer}>
      <header className={styles.ordersHeader}>
        <button onClick={handleGoBack} className={styles.goBackIcon}>
          <FaArrowLeft size={18} />
        </button>
        <h2>My Orders</h2>
      </header>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <img
            src="/images/orderlist.jpg" // 👉 you can use a custom illustration here
            alt="No orders"
            className={styles.emptyImage}
          />
          <h3 className={styles.emptyTitle}>No Orders Yet</h3>
          <p className={styles.emptySubtitle}>
            Looks like you haven’t placed any orders. Start shopping and
            discover amazing products!
          </p>
          <button
            className={styles.shopNowBtn}
            onClick={() => router.push("/")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {orders.slice(0, visibleCount).map((order) => {
            const isExpanded = expandedOrder === order._id;
            return (
              <article key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderCode}>
                      ORDER ID:{order.orderCode}
                    </span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}{" "}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className={styles.orderMeta}>
                    <span
                      className={`${styles.orderStatusBadge} ${
                        styles[order.status.toLowerCase()]
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className={styles.orderTotalBadge}>
                      ₦{order.total.toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>

                <div className={styles.orderThumbnailWrapper}>
                  {order.items.slice(0, 3).map((item, i) => (
                    <img
                      key={i}
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className={styles.orderThumbnail}
                      onClick={() => goToProduct(item.productId)}
                    />
                  ))}
                  {order.items.length > 3 && (
                    <span className={styles.moreItems}>
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>

                <div className={styles.orderActions}>
                  <button
                    onClick={() => toggleExpand(order._id)}
                    className={styles.expandBtn}
                  >
                    {isExpanded ? "Close" : "View"} Details
                  </button>
                  <button
                    onClick={() => trackOrder(order.orderCode)}
                    className={styles.trackBtn}
                  >
                    Track Order
                  </button>
                </div>

                <div
                  className={`${styles.itemsWrapper} ${
                    isExpanded ? styles.expanded : ""
                  }`}
                >
                  <div className={styles.invoiceWrapper}>
                    <div className={styles.invoiceTableWrapper}>
                      <table className={styles.invoiceTable}>
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => {
                            const reviewed = reviewedMap[item.productId];
                            if (
                              reviewed === undefined &&
                              order.status.toLowerCase() === "delivered"
                            )
                              handleCheckReview(item.productId);

                            return (
                              <tr key={idx}>
                                <td className={styles.productCell}>
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name}
                                    className={styles.itemImage}
                                    onClick={() => goToProduct(item.productId)}
                                  />
                                  <span
                                    className={styles.itemName}
                                    onClick={() => goToProduct(item.productId)}
                                  >
                                    {item.name}
                                  </span>
                                  {(item.variant || item.variants) &&
                                    typeof (item.variant || item.variants) ===
                                      "object" &&
                                    Object.keys(item.variant || item.variants)
                                      .length > 0 && (
                                      <small className={styles.itemVariant}>
                                        {Object.entries(
                                          item.variant || item.variants
                                        )
                                          .map(([k, v]) => `${k}: ${v}`)
                                          .join(", ")}
                                      </small>
                                    )}

                                  {order.status.toLowerCase() ===
                                    "delivered" && (
                                    <>
                                      {reviewed === undefined && (
                                        <span className={styles.reviewChecking}>
                                          <FaSpinner
                                            className={styles.spinner}
                                          />
                                          Checking...
                                        </span>
                                      )}
                                      {reviewed === false && (
                                        <button
                                          className={styles.leaveReviewBtn}
                                          onClick={() =>
                                            router.push(
                                              `/product/${item.productId}?review=true`
                                            )
                                          }
                                        >
                                          Leave Review
                                        </button>
                                      )}
                                      {reviewed === true && (
                                        <span className={styles.reviewedText}>
                                          <FaRegCheckCircle /> Reviewed
                                        </span>
                                      )}
                                    </>
                                  )}
                                </td>
                                <td>{item.qty}</td>
                                <td>
                                  ₦
                                  {Number(item.price || 0).toLocaleString(
                                    "en-NG"
                                  )}
                                </td>
                                <td>
                                  ₦
                                  {(
                                    Number(item.price || 0) *
                                    Number(item.qty || 0)
                                  ).toLocaleString("en-NG")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className={styles.totalLabel}>
                              Total
                            </td>
                            <td className={styles.totalValue}>
                              ₦{order.total.toLocaleString("en-NG")}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className={styles.invoiceFooter}>
                      <span>
                        Status: <strong>{order.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {visibleCount < orders.length && (
            <div className={styles.loadMoreWrapper}>
              <button onClick={handleLoadMore} className={styles.loadMoreBtn}>
                See more orders
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
