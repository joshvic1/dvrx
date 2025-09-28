"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "@/styles/AlsoLike.module.css";
import ProductCard from "@/components/ProductCard";

export default function AlsoLike({ currentProduct }) {
  const [alsoLikeProducts, setAlsoLikeProducts] = useState([]);
  const [scrollState, setScrollState] = useState({
    leftVisible: false,
    rightVisible: false,
  });

  const scrollRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch related products
  useEffect(() => {
    if (!currentProduct) return;

    const fetchAlsoLike = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/products?category=${currentProduct.category}`
        );
        const categoryProducts = await res.json();

        // Shuffle so it changes on reload
        const shuffled = categoryProducts
          .filter((p) => p._id !== currentProduct._id) // exclude self
          .sort(() => 0.5 - Math.random()) // shuffle
          .slice(0, 12); // limit

        setAlsoLikeProducts(shuffled);
      } catch (err) {
        console.error("Error fetching also like products:", err);
      }
    };

    fetchAlsoLike();
  }, [currentProduct]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    direction === "left"
      ? (scrollRef.current.scrollLeft -= scrollAmount)
      : (scrollRef.current.scrollLeft += scrollAmount);
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setScrollState({
      leftVisible: el.scrollLeft > 0,
      rightVisible: el.scrollLeft + el.clientWidth < el.scrollWidth,
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [alsoLikeProducts]);

  return (
    <div className={styles.alsoLikeSection}>
      <h3 className={styles.alsoLikeTitle}>You May Also Like</h3>

      <div className={styles.carouselWrapper}>
        {scrollState.leftVisible && (
          <button
            className={styles.scrollBtnLeft}
            onClick={() => scroll("left")}
          >
            <FaChevronLeft />
          </button>
        )}

        <div className={styles.alsoLikeGrid} ref={scrollRef}>
          {alsoLikeProducts.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>

        {scrollState.rightVisible && (
          <button
            className={styles.scrollBtnRight}
            onClick={() => scroll("right")}
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}
