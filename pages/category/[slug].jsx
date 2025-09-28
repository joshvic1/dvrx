import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import styles from "../../styles/CategoryPage.module.css";
import { SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function CategoryPage() {
  const router = useRouter();
  const { slug, sub } = router.query;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcategories, setSubcategories] = useState(["All"]);
  const [activeSubcategory, setActiveSubcategory] = useState("All");

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Temp states for popup
  const [tempPriceRange, setTempPriceRange] = useState([0, 100000]);
  const [tempMinRating, setTempMinRating] = useState(0);
  const [tempSubcategory, setTempSubcategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [minRating, setMinRating] = useState(0);

  const [displayedProducts, setDisplayedProducts] = useState([]);
  const PRODUCTS_PER_LOAD = 12;

  // Initialize displayed products when filteredProducts change
  useEffect(() => {
    setDisplayedProducts(filteredProducts.slice(0, PRODUCTS_PER_LOAD));
  }, [filteredProducts]);

  // Load more products on scroll
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100; // 100px from bottom

      if (bottom && displayedProducts.length < filteredProducts.length) {
        const nextProducts = filteredProducts.slice(
          displayedProducts.length,
          displayedProducts.length + PRODUCTS_PER_LOAD
        );
        setDisplayedProducts((prev) => [...prev, ...nextProducts]);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayedProducts, filteredProducts]);

  // Cart context
  const { cart, addToCart, removeFromCart, updateQty } = useCart();

  const openFilters = () => {
    setTempPriceRange(priceRange);
    setTempMinRating(minRating);
    setTempSubcategory(activeSubcategory);
    setFiltersOpen(true);
  };

  const getImageUrl = (image) => {
    if (!image) return "/placeholder.png";
    if (image.startsWith("http")) return image;
    return image.startsWith("/") ? image : `/${image}`;
  };

  useEffect(() => {
    if (sub) setActiveSubcategory(sub);
    else setActiveSubcategory("All");
  }, [sub]);

  const fetchProductsWithRatings = async (products) => {
    const productsWithRatings = await Promise.all(
      products.map(async (p) => {
        const res = await fetch(
          `http://localhost:5000/api/reviews?productId=${p._id}`
        );
        const reviews = await res.json();
        const avgRating =
          reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);
        return { ...p, rating: avgRating };
      })
    );
    return productsWithRatings;
  };

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:5000/api/products?category=${slug}`)
      .then((res) => res.json())
      .then(async (data) => {
        const updated = data.map((p) => ({
          ...p,
          qty: 1,
          image:
            p.image ||
            "https://images.unsplash.com/photo-1590080875831-7b38d3a7a4f4?q=80&w=1200&auto=format",
        }));

        // fetch average rating per product
        const productsWithRatings = await fetchProductsWithRatings(updated);

        setProducts(productsWithRatings);
        setFilteredProducts(productsWithRatings);

        const subs = Array.from(
          new Set(updated.map((p) => p.subcategory))
        ).filter(Boolean);

        const subcategoryObjects = [
          { slug: "all", display: "All" },
          ...subs.map((sub) => ({
            slug: sub.toLowerCase(),
            display: sub.charAt(0).toUpperCase() + sub.slice(1),
          })),
        ];

        setSubcategories(subcategoryObjects);
      })
      .catch(console.error);
  }, [slug]);

  const applyFilters = () => {
    setPriceRange(tempPriceRange);
    setMinRating(tempMinRating);
    setActiveSubcategory(tempSubcategory);
    setFiltersOpen(false);
  };

  useEffect(() => {
    let result = products.filter(
      (p) =>
        (priceRange[0] === null || p.price >= priceRange[0]) &&
        (priceRange[1] === null || p.price <= priceRange[1])
    );

    if (minRating > 0)
      result = result.filter((p) => (p.rating || 0) >= minRating);
    if (activeSubcategory && activeSubcategory.toLowerCase() !== "all")
      result = result.filter(
        (p) => p.subcategory.toLowerCase() === activeSubcategory.toLowerCase()
      );

    setFilteredProducts(result);
  }, [priceRange, minRating, products, activeSubcategory]);

  return (
    <main className={styles.main}>
      {/* ---------- Header ---------- */}
      <div className={styles.sectionHeader}>
        <div className={styles.categoryHeader}>
          <h1 className={styles.sectionTitle}>{slug?.toUpperCase()}</h1>
          <div className={styles.subcategoryScroll}>
            {subcategories.map((subItem) => (
              <button
                key={subItem.slug}
                className={`${styles.subcategoryBtn} ${
                  activeSubcategory === subItem.slug
                    ? styles.activeSubcategory
                    : ""
                }`}
                onClick={() => {
                  setActiveSubcategory(subItem.slug);
                  router.push(
                    {
                      pathname: `/category/${slug}`,
                      query:
                        subItem.slug === "all" ? {} : { sub: subItem.slug },
                    },
                    undefined,
                    { shallow: true }
                  );
                }}
              >
                {subItem.display}
              </button>
            ))}
          </div>

          <button className={styles.sectionBtn} onClick={openFilters}>
            <SlidersHorizontal size={18} style={{ marginRight: "8px" }} />
            Filter
          </button>
        </div>
      </div>

      {/* ---------- Filter Panel ---------- */}
      {filtersOpen && (
        <div className={styles.filterModalOverlay}>
          <div className={styles.filterModal}>
            <h3>Filter Products</h3>

            <div className={styles.filterGroup}>
              <label>Price Range (₦)</label>
              <div className={styles.priceInputs}>
                <input
                  type="number"
                  value={tempPriceRange[0] || ""}
                  onChange={(e) =>
                    setTempPriceRange([
                      Number(e.target.value),
                      tempPriceRange[1],
                    ])
                  }
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={tempPriceRange[1] || ""}
                  onChange={(e) =>
                    setTempPriceRange([
                      tempPriceRange[0],
                      Number(e.target.value),
                    ])
                  }
                  placeholder="Max"
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label>Minimum Rating</label>
              <select
                value={tempMinRating}
                onChange={(e) => setTempMinRating(Number(e.target.value))}
              >
                <option value={0}>All</option>
                <option value={1}>1 ★ & up</option>
                <option value={2}>2 ★ & up</option>
                <option value={3}>3 ★ & up</option>
                <option value={4}>4 ★ & up</option>
                <option value={5}>5 ★ only</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Subcategory</label>
              <select
                value={tempSubcategory}
                onChange={(e) => setTempSubcategory(e.target.value)}
              >
                {subcategories.map((sub) => (
                  <option key={sub.slug} value={sub.slug}>
                    {sub.display}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalBtns}>
              <button
                className={styles.cancelBtn}
                onClick={() => setFiltersOpen(false)}
              >
                Cancel
              </button>
              <button className={styles.applyBtn} onClick={applyFilters}>
                Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Products Grid ---------- */}
      <section className={styles.productsSection}>
        {products.length === 0 ? (
          <div className={styles.productGrid}>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className={styles.loadingSkeleton}
                ></div>
              ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p>No products match your filter.</p>
        ) : (
          <motion.div
            className={styles.productGrid}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
          >
            {displayedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
