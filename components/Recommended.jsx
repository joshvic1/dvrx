"use client";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Recommended.module.css";
import Homestyles from "../styles/Home.module.css";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { getUserRecommendations } from "../utils/recommendations";
import ProductCard from "@/components/ProductCard";

const Recommended = ({ products }) => {
  const { wishlist } = useWishlist();

  const { cart, addToCart, removeFromCart, updateQty } = useCart();
  const [recommended, setRecommended] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const getLocal = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  // Load recommendations once
  useEffect(() => {
    const viewed = getLocal("recentlyViewed");
    const ordered = getLocal("recentlyOrdered");
    const topRecommendations = getUserRecommendations(
      products,
      wishlist,
      viewed,
      ordered
    );
    setRecommended(topRecommendations);
  }, [wishlist, products]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < recommended.length) {
          setLoading(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 8, recommended.length));
            setLoading(false);
          }, 500); // simulate fetch delay
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [visibleCount, recommended]);

  if (recommended.length === 0) return null;

  const visibleProducts = recommended.slice(0, visibleCount);

  return (
    <section className={styles.recommendedSection}>
      <motion.section
        className={Homestyles.productGrid}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        {visibleProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </motion.section>

      {/* Loader at the bottom */}
      {visibleCount < recommended.length && (
        <div ref={loaderRef} className={styles.loaderWrapper}>
          {loading && <div className={styles.spinner}></div>}
        </div>
      )}
    </section>
  );
};

export default Recommended;
