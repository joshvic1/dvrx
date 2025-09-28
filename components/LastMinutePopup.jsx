"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "../styles/LastMinutePopup.module.css";
import { useWishlist } from "@/context/WishlistContext";
import { getUserRecommendations } from "@/utils/recommendations";
import { useCart } from "@/context/CartContext";
import PopupProductCard from "./PopupProductCard";
import { FiShoppingBag } from "react-icons/fi";

export default function LastMinutePopup({
  show,
  onClose,
  onConfirm,
  products,
  total,
}) {
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const [recommended, setRecommended] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false); // 👈 state for button
  const getLocal = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };
  useEffect(() => {
    if (!products?.length || !show) return;
    const viewed = getLocal("recentlyViewed");
    const ordered = getLocal("recentlyOrdered");
    const recs = getUserRecommendations(products, wishlist, viewed, ordered);
    const filterOutCart = (list) =>
      list.filter((item) => !cart.some((c) => c.productId === item._id));
    const filteredRecs = filterOutCart(recs);
    const fallback = filterOutCart(products).slice(0, 6);
    setRecommended(filteredRecs.length > 0 ? filteredRecs : fallback);
  }, [show, products, wishlist]);

  // 👇 Watch for recommendations draining out
  useEffect(() => {
    if (show && recommended.length === 0 && products.length > 0) {
      const filterOutCart = (list) =>
        list.filter((item) => !cart.some((c) => c.productId === item._id));
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      const fallback = filterOutCart(shuffled).slice(0, 6);
      setRecommended(fallback);
    }
  }, [recommended, show, products, cart]);
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(); // wait for parent confirm logic
    } finally {
      setIsProcessing(false); // reset when done
    }
  };
  if (!show) return null;

  return (
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
            <FiShoppingBag /> You Might Have Forgotten
          </h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Scrollable Products */}
        <div className={`${styles.content} no-scrollbar`}>
          {recommended.length > 0 ? (
            <div className={styles.grid}>
              {recommended.map((product) => (
                <PopupProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p>No recommendations available.</p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing
              ? "Processing..."
              : `Place Order (₦${total.toLocaleString("en-NG")})`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
