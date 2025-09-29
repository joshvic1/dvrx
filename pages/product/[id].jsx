"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/ProductDetails.module.css";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { toast } from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { FaChevronLeft, FaChevronRight, FaShoppingCart } from "react-icons/fa";
import { FaChevronDown, FaChevronUp, FaHeart, FaEdit } from "react-icons/fa";
import { useWishlist } from "@/context/WishlistContext";
import LoginModal from "@/components/LoginModal";
import { MdFilterList } from "react-icons/md";
import AlsoLike from "@/components/AlsoLike";

// ⭐ Star rating component
function StarRating({ value, onChange, readOnly }) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={styles.star}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          {star <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const scrollRef = useRef(null);
  const scrollAlsoLikeRef = useRef(null);

  const { user, token } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const { id } = router.query;
  const { cart, addToCart, removeFromCart, updateQty } = useCart();
  const [showReviewFilterDropdown, setShowReviewFilterDropdown] =
    useState(false);
  const [reviewFilter, setReviewFilter] = useState("latest"); // default filter

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [alsoLikeProducts, setAlsoLikeProducts] = useState([]);
  const [showModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [canReview, setCanReview] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [variantError, setVariantError] = useState("");
  const [stockError, setStockError] = useState("");

  const handleAddToCartClick = () => {
    // Check variants first
    if (product.variants && product.variants.length > 0) {
      const missingVariant = product.variants.find(
        (v) => !selectedVariants[v.name]
      );
      if (missingVariant) {
        setVariantError(`Please select ${missingVariant.name}`);
        return;
      }
    }

    // Total in cart for this product
    const totalQuantity = cart
      .filter((item) => item.productId === product._id)
      .reduce((sum, item) => sum + (item.qty || 0), 0);

    // Stock check
    if (typeof product.stock === "number" && totalQuantity >= product.stock) {
      setStockError(`Only ${product.stock} in stock `);
      return;
    }

    // Clear error if valid
    setStockError("");

    // Add to cart
    addToCart(product, 1, selectedVariants || null);
  };

  useEffect(() => {
    if (router.query.review === "true") {
      setShowReviewModal(true);
    }
  }, [router.query.review]);

  useEffect(() => {
    if (!user || !product) {
      setCanReview(false);
      return;
    }

    const checkReviewEligibility = async () => {
      try {
        // 1️⃣ Check if user has already reviewed
        const resReviews = await fetch(
          `${API_URL}/api/reviews?productId=${product._id}`
        );
        const reviewsData = await resReviews.json();
        const alreadyReviewed = reviewsData.some(
          (r) => r.customerEmail === user.email
        );

        if (alreadyReviewed) {
          setCanReview(false);
          return;
        }

        // 2️⃣ Check if user purchased & delivered
        const resOrders = await fetch(
          `${API_URL}/api/orders/user/${user.email}`
        );
        const orders = await resOrders.json();

        const hasDeliveredOrder = orders.some((order) =>
          order.items.some(
            (item) =>
              item.productId === product._id && order.status === "delivered"
          )
        );

        setCanReview(hasDeliveredOrder);
      } catch (err) {
        console.error("Error checking review eligibility:", err);
        setCanReview(false);
      }
    };

    checkReviewEligibility();
  }, [product, user]);

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewText(review.comment);
    setReviewRating(review.rating);
    setShowReviewModal(true);
  };

  const isInWishlist = product
    ? wishlist.some((item) => item._id === product._id)
    : false;

  const handleWishlistClick = () => {
    console.log(
      "wishlist click — user:",
      !!user,
      "showLoginModal before:",
      showLoginModal
    );
    if (!user) {
      setShowLoginModal(true); // open modal
      return;
    }

    if (isInWishlist) removeFromWishlist(product._id);
    else addToWishlist(product);
  };

  // Separate scroll positions for reviews & also like carousel
  const [reviewScroll, setReviewScroll] = useState({
    leftVisible: false,
    rightVisible: false,
  });
  const [alsoLikeScroll, setAlsoLikeScroll] = useState({
    leftVisible: false,
    rightVisible: false,
  });

  // Helpers
  // --- Add this state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];
  // fallback to old field

  // Helper to handle arrows
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.png";
    if (image.startsWith("http")) return image;
    return image.startsWith("/") ? image : `/${image}`;
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (name.length < 3) return email;
    return `${name[0]}*****${name.slice(-2)}@${domain}`;
  };

  // Scroll functions...
  const scrollReviews = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      direction === "left"
        ? (scrollRef.current.scrollLeft -= scrollAmount)
        : (scrollRef.current.scrollLeft += scrollAmount);
    }
  };

  const checkReviewScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setReviewScroll({
      leftVisible: el.scrollLeft > 0,
      rightVisible: el.scrollLeft + el.clientWidth < el.scrollWidth,
    });
  };

  const scrollAlsoLike = (direction) => {
    if (!scrollAlsoLikeRef.current) return;
    const scrollAmount = 300;
    direction === "left"
      ? (scrollAlsoLikeRef.current.scrollLeft -= scrollAmount)
      : (scrollAlsoLikeRef.current.scrollLeft += scrollAmount);
  };

  const checkAlsoLikeScroll = () => {
    const el = scrollAlsoLikeRef.current;
    if (!el) return;
    setAlsoLikeScroll({
      leftVisible: el.scrollLeft > 0,
      rightVisible: el.scrollLeft + el.clientWidth < el.scrollWidth,
    });
  };

  // Place this near other handlers, at top level in ProductPage
  const handleReviewFilter = (type) => {
    setReviewFilter(type);
    setShowReviewFilterDropdown(false); // close dropdown after selecting

    const sortedReviews = [...reviews];

    switch (type) {
      case "latest":
        sortedReviews.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      case "oldest":
        sortedReviews.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "star":
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setReviews(sortedReviews);
  };

  const handleAddToCart = () => {
    // Check if all variants are selected
    if (product.variants && product.variants.length > 0) {
      const missingVariant = product.variants.find(
        (v) => !selectedVariants[v.name]
      );
      if (missingVariant) {
        setVariantError(`Please select ${missingVariant.name}`);
        return;
      }
    }

    // Add to cart
    addToCart(product, 1, selectedVariants);
  };

  // Fetch product + reviews
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) setProduct(null);
        else setProduct(await res.json());
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reviews?productId=${id}`);
        setReviews(await res.json());
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  // Track views
  useEffect(() => {
    if (!product) return; // ⛔️ Stop if product not loaded yet

    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // Add new one with timestamp
    viewed.unshift({
      _id: product._id,
      category: product.category,
      subCategory: product.subCategory,
      addedAt: Date.now(),
    });

    // Keep only latest 20
    viewed = viewed.slice(0, 20);

    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
  }, [product]);

  // Fetch "also like" products
  useEffect(() => {
    if (!id || !product) return;
    const recentlyViewed =
      JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    const fetchAlsoLike = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/products?category=${product.category}`
        );
        const categoryProducts = await res.json();

        const combined = [
          ...recentlyViewed.filter((rv) => rv._id !== product._id),
          ...categoryProducts.filter(
            (cp) =>
              cp._id !== product._id &&
              !recentlyViewed.some((rv) => rv._id === cp._id)
          ),
        ].slice(0, 20);

        setAlsoLikeProducts(combined);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAlsoLike();
  }, [id, product]);

  useEffect(() => {
    const reviewEl = scrollRef.current;
    if (reviewEl) {
      checkReviewScroll();
      reviewEl.addEventListener("scroll", checkReviewScroll);
    }
    const alsoEl = scrollAlsoLikeRef.current;
    if (alsoEl) {
      checkAlsoLikeScroll();
      alsoEl.addEventListener("scroll", checkAlsoLikeScroll);
    }
    window.addEventListener("resize", checkReviewScroll);
    window.addEventListener("resize", checkAlsoLikeScroll);

    return () => {
      reviewEl?.removeEventListener("scroll", checkReviewScroll);
      alsoEl?.removeEventListener("scroll", checkAlsoLikeScroll);
      window.removeEventListener("resize", checkReviewScroll);
      window.removeEventListener("resize", checkAlsoLikeScroll);
    };
  }, [reviews, alsoLikeProducts]);

  // Handle adding review
  const handleSubmitReview = async () => {
    if (!reviewText || !reviewRating) {
      addToast("Please fill all fields", "error");
      return;
    }

    try {
      setSubmitting(true);

      let res, data;

      if (editingReview) {
        // Edit existing review
        res = await fetch(`${API_URL}/api/reviews/${editingReview._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: reviewRating,
            comment: reviewText,
          }),
        });
        data = await res.json();

        if (res.ok) {
          addToast("Review updated!", "success");

          // Update reviews in state instantly
          setReviews((prev) =>
            prev.map((r) => (r._id === data._id ? data : r))
          );

          setShowReviewModal(false);
          setEditingReview(null);
          setReviewText("");
          setReviewRating(0);
        } else {
          addToast(data.message || "Failed to update review", "error");
        }
      } else {
        // New review
        res = await fetch(`${API_URL}/api/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            rating: reviewRating,
            comment: reviewText,
          }),
        });
        data = await res.json();

        if (res.ok) {
          addToast("Review submitted!", "success");
          setReviews([data, ...reviews]);
          setShowReviewModal(false);
          setReviewText("");
          setReviewRating(0);
        } else {
          addToast(data.message || "Failed to add review", "error");
        }
      }
    } catch (err) {
      console.error(err);
      addToast("Server error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Render description
  const renderDescription = (desc) => {
    const words = desc?.split(" ") || [];
    if (words.length <= 50)
      return <p dangerouslySetInnerHTML={{ __html: desc }} />;

    const shortDesc = words.slice(0, 50).join(" ");
    return (
      <div>
        <p
          dangerouslySetInnerHTML={{
            __html: showFullDesc ? desc : shortDesc + "...",
          }}
          className={showFullDesc ? styles.fullDesc : styles.truncatedDesc}
        />
        <button
          className={styles.viewMoreBtn}
          onClick={() => setShowFullDesc(!showFullDesc)}
        >
          {showFullDesc ? (
            <>
              View Less <FaChevronUp />
            </>
          ) : (
            <>
              View More <FaChevronDown />
            </>
          )}
        </button>
      </div>
    );
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.imageWrapper}>
          <Skeleton height={300} />
        </div>
        <div className={styles.details}>
          <Skeleton height={30} width="60%" />
          <Skeleton height={25} width="30%" />
          <Skeleton count={4} />
        </div>
      </div>
    );

  if (!product) return <p>Product not found.</p>;

  const cartItem = cart.find((item) => item._id === product._id);
  // Total quantity of this product in cart (all variants)
  const quantityInCart = cart
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalQuantity = cart
    .filter((item) => item.productId === product._id)
    .reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <div className={styles.container}>
      {/* Top section */}
      <div className={styles.topSection}>
        <div className={styles.imageWrapper}>
          <div className={styles.gallery}>
            {/* Thumbnails - vertical scroll */}
            <div className={styles.thumbnails}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`${product.name} ${idx + 1}`}
                  className={`${styles.thumbnail} ${
                    idx === currentImageIndex ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>

            {/* Main image with arrows + wishlist */}
            <div className={styles.mainImage}>
              <button
                onClick={handlePrevImage}
                className={`${styles.arrowBtn} ${styles.leftArrow}`}
              >
                <FaChevronLeft />
              </button>

              <img
                src={getImageUrl(images[currentImageIndex])}
                alt={product.name}
              />

              <button
                onClick={handleNextImage}
                className={`${styles.arrowBtn} ${styles.rightArrow}`}
              >
                <FaChevronRight />
              </button>

              {/* ✅ Now inside .mainImage */}
              <button
                className={`${styles.wishlistBtn} ${
                  isInWishlist ? styles.active : ""
                }`}
                onClick={handleWishlistClick}
              >
                <FaHeart /> {isInWishlist ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className={styles.details}>
          <div className={styles.reviewSection}>
            {canReview && (
              <button onClick={() => setShowReviewModal(true)}>
                Write a Review
              </button>
            )}

            <div className={styles.avgRating}>
              <StarRating value={Math.round(avgRating)} />
            </div>
          </div>

          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.price}>
            ₦{Number(product.price).toLocaleString()}
          </p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className={styles.variantWrapper}>
              {product.variants.map((variant) => (
                <div key={variant.name} className={styles.variantGroup}>
                  <span className={styles.variantLabel}>{variant.name}:</span>
                  <div className={styles.variantOptions}>
                    {variant.values.map((v) => {
                      const isSelected =
                        selectedVariants[variant.name] === v.value;
                      return (
                        <button
                          key={v._id}
                          className={`${styles.variantPill} ${
                            isSelected ? styles.selected : ""
                          }`}
                          onClick={() => {
                            setSelectedVariants((prev) => ({
                              ...prev,
                              [variant.name]: v.value,
                            }));
                            setVariantError("");
                          }}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {variantError && (
                <p className={styles.variantError}>{variantError}</p>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <div className={styles.addToCartWrapper}>
            <button className={styles.addBtn} onClick={handleAddToCartClick}>
              Add to Cart
              {cart.filter((item) => item.productId === product._id).length >
                0 && (
                <span className={styles.cartCounter}>
                  {cart
                    .filter((item) => item.productId === product._id)
                    .reduce((sum, item) => sum + (item.qty || 0), 0)}
                </span>
              )}
            </button>

            {stockError && <p className={styles.stockWarning}>{stockError}</p>}
          </div>

          {/* Description */}
          <div className={styles.description}>
            {renderDescription(product.description)}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingReview ? "Edit Review" : "Write a Review"}</h3>

            <StarRating value={reviewRating} onChange={setReviewRating} />
            <textarea
              rows="4"
              placeholder="Your review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <br />
            <button onClick={handleSubmitReview} disabled={submitting}>
              {submitting
                ? "Submitting..."
                : editingReview
                ? "Update Review"
                : "Submit"}
            </button>

            <button
              onClick={() => {
                setShowReviewModal(false);
                setEditingReview(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        prefillEmail={user?.email || ""}
      />

      {/* Reviews Section */}
      <div className={styles.reviewsWrapper}>
        <div className={styles.reviewHeader}>
          <div className={styles.reviewHeaderLeft}>
            <h2>
              Reviews ({reviews.length})
              <span className={styles.accentLine}></span>
            </h2>
          </div>

          <div className={styles.reviewHeaderRight}>
            {/* Filter Button */}
            <div className={styles.reviewFilterWrapper}>
              <button
                className={styles.filterIconBtn}
                onClick={() =>
                  setShowReviewFilterDropdown(!showReviewFilterDropdown)
                }
                title="Filter reviews"
              >
                <MdFilterList />
              </button>

              {showReviewFilterDropdown && (
                <div className={styles.filterDropdown}>
                  <button
                    onClick={() => handleReviewFilter("latest")}
                    className={
                      reviewFilter === "latest" ? styles.activeFilter : ""
                    }
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => handleReviewFilter("oldest")}
                    className={
                      reviewFilter === "oldest" ? styles.activeFilter : ""
                    }
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => handleReviewFilter("star")}
                    className={
                      reviewFilter === "star" ? styles.activeFilter : ""
                    }
                  >
                    Highest Rating
                  </button>
                </div>
              )}
            </div>

            {/* Scroll Buttons */}
            <div className={styles.headerScrollBtns}>
              <button
                onClick={() => scrollReviews("left")}
                disabled={!reviewScroll.leftVisible}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => scrollReviews("right")}
                disabled={!reviewScroll.rightVisible}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className={`${styles.reviewList} no-scrollbar`} ref={scrollRef}>
          {reviews.length === 0 ? (
            <p className={styles.noReviews}>No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className={styles.reviewCard}>
                <div className={styles.avatar}>👤</div>
                <div className={styles.reviewText}>
                  {r.customerEmail === user?.email && (
                    <button
                      className={styles.editReviewBtn}
                      onClick={() => {
                        setEditingReview(r);
                        setReviewRating(r.rating);
                        setReviewText(r.comment);
                        setShowReviewModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                  )}
                  <p>{r.comment}</p>
                  <div className={styles.userRating}>
                    <StarRating value={r.rating} readOnly />
                  </div>
                  <small>{maskEmail(r.customerEmail)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* You May Also Like */}
      <AlsoLike currentProduct={product} />
    </div>
  );
}
