import Head from "next/head";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CategoryCard from "../components/CategoryCard";
import Recommended from "@/components/Recommended";
import styles from "../styles/Home.module.css";
import { useCart } from "../context/CartContext";
import Link from "next/link";
import { useLoading } from "../context/LoadingContext";
import { FiShoppingCart } from "react-icons/fi";
import { FaArrowRight, FaThLarge } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import VariantPopup from "@/components/VariantPopup";
import ProductCard from "@/components/ProductCard";
import CategoryPageStyles from "../styles/CategoryPage.module.css";

export default function Home() {
  const { cart, addToCart, removeFromCart, updateQty } = useCart();
  const [products, setProducts] = useState([]);
  const { setLoading } = useLoading();
  const [visibleCount, setVisibleCount] = useState(8);
  const [variantProduct, setVariantProduct] = useState(null);

  // ---------- FILTER STATES ----------
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [tempSort, setTempSort] = useState("recent");
  const [tempCategory, setTempCategory] = useState("all");
  const [tempSubcategory, setTempSubcategory] = useState("all");
  const [tempMinRating, setTempMinRating] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [sort, setSort] = useState("recent");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);

  // ---------- FETCH PRODUCTS ----------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/products");
        const data = await res.json();

        const sortedProducts = data.sort((a, b) => b._id.localeCompare(a._id));
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ---------- FILTER LOGIC ----------
  const filteredProducts = products
    .filter((p) =>
      categoryFilter === "all"
        ? true
        : p.category.toLowerCase() === categoryFilter
    )
    .filter((p) => {
      if (categoryFilter === "all") return true;
      if (categoryFilter === "male")
        return ["male", "unisex"].includes(p.category.toLowerCase());
      if (categoryFilter === "female")
        return ["female", "unisex"].includes(p.category.toLowerCase());
      return p.category.toLowerCase() === categoryFilter;
    })

    .filter((p) => (minRating > 0 ? (p.rating || 0) >= minRating : true))
    .sort((a, b) => {
      if (sort === "recent") return b._id.localeCompare(a._id);
      if (sort === "oldest") return a._id.localeCompare(b._id);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <>
      <Head>
        <title>DVRX — Jewelry for Everyone</title>
      </Head>

      <main className={styles.main}>
        {/* ---------- CATEGORY SECTION ---------- */}
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Categories</h3>
        </div>

        <motion.section
          className={styles.grid}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {["Male", "Female", "Unisex"].map((category, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <CategoryCard
                title={category}
                desc={
                  category === "Male"
                    ? "Chains, rings & bracelets for him"
                    : category === "Female"
                    ? "Necklaces, rings & earrings"
                    : "Bold & subtle pieces for everyone"
                }
                href={`/category/${category.toLowerCase()}`}
                image={`/images/${category.toLowerCase()}.jpg`}
              />
            </motion.div>
          ))}
        </motion.section>

        {/* ---------- RECOMMENDED SECTION ---------- */}
        <div className={styles.sectionHeader2}>
          <h2 className={styles.sectionTitle}> Recommended For You</h2>
        </div>
        {products.length === 0 ? (
          <div className={CategoryPageStyles.productGrid}>
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className={CategoryPageStyles.loadingSkeleton}
                ></div>
              ))}
          </div>
        ) : (
          <Recommended products={products} limit={8} />
        )}

        {/* ---------- ALL PRODUCTS SECTION ---------- */}
        <div
          className={styles.sectionHeader2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className={styles.sectionTitle}>All Products</h3>
          <button
            className={styles.filterBtn}
            onClick={() => setFiltersOpen(true)}
          >
            <MdFilterList size={18} />
          </button>
        </div>

        {/* ---------- FILTER MODAL ---------- */}
        {filtersOpen && (
          <div className={styles.filterModalOverlay}>
            <div className={styles.filterModal}>
              <h3>Filter Products</h3>

              <div className={styles.filterGroup}>
                <label>Sort By</label>
                <select
                  value={tempSort}
                  onChange={(e) => setTempSort(e.target.value)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Category</label>
                <select
                  value={tempCategory}
                  onChange={(e) => setTempCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Subcategory</label>
                <select
                  value={tempSubcategory}
                  onChange={(e) => setTempSubcategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="rings">Rings</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="wristwatches">Wristwatches</option>
                  <option value="earrings">Earrings</option>
                </select>
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

              <div className={styles.modalBtns}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setFiltersOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.applyBtn}
                  onClick={() => {
                    setSort(tempSort);
                    setCategoryFilter(tempCategory);
                    setSubcategoryFilter(tempSubcategory);
                    setMinRating(tempMinRating);
                    setFiltersOpen(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------- PRODUCTS GRID ---------- */}
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
        ) : (
          <motion.section className={styles.productGrid}>
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </motion.section>
        )}
        {variantProduct && (
          <VariantPopup
            product={variantProduct}
            selectedVariants={selectedVariants}
            setSelectedVariants={setSelectedVariants}
            onClose={() => setVariantProduct(null)}
            onConfirm={(selected) => {
              addToCart(variantProduct, 1, {
                name: Object.keys(selected)[0],
                value: Object.values(selected)[0],
              });
              setVariantProduct(null);
              setSelectedVariants({});
            }}
          />
        )}

        {/* ---------- SEE MORE BUTTON ---------- */}
        <div style={{ textAlign: "center" }}>
          {visibleCount < filteredProducts.length && (
            <button
              className={styles.seeMoreBtn}
              onClick={() => setVisibleCount(visibleCount + 8)}
            >
              See More <FaArrowRight />
            </button>
          )}
        </div>
      </main>
    </>
  );
}
