"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard"; // import your ProductCard
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import styles from "../styles/Wishlist.module.css";
import Link from "next/link";

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { wishlist } = useWishlist();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push("/login?redirect=/wishlist");
  }, [user, router]);

  // Sort wishlist descending (latest first)
  const sortedWishlist = [...wishlist].reverse();

  if (!user) return null; // prevent flicker before redirect

  return (
    <div className={styles.main}>
      {/* Wishlist Header */}
      <div className={styles.wishlistHeader}>
        <FiHeart className={styles.emptyIcon} />
        <h3 className={styles.sectionTitle}>MY WISHLIST</h3>
      </div>

      {/* Empty Wishlist */}
      {sortedWishlist.length === 0 ? (
        <div className={styles.emptyWishlist}>
          <div className={styles.emptyIcon}>💖</div>
          <h3 className={styles.emptyTitle}>Your Wishlist is Empty</h3>
          <p className={styles.emptyText}>
            Browse products and add your favorites here!
          </p>
          <Link href="/">
            <button className={styles.emptyBtn}>
              Go Back to Homepage <FiShoppingCart />
            </button>
          </Link>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {sortedWishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
