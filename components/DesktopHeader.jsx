"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Store,
  ChevronDown,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import styles from "../styles/DesktopHeader.module.css";

export default function DesktopHeader({
  cart,
  user,
  logout,
  theme,
  toggleTheme,
  categories,
  notifications,
  unreadCount,
  markAllRead,
  router,
}) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const dropdownRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ Default active category = "male" if available
  useEffect(() => {
    if (categories?.length && !activeCategory) {
      const maleCat = categories.find(
        (cat) => cat.name.toLowerCase() === "male"
      );
      setActiveCategory(maleCat || categories[0]);
    }
  }, [categories, activeCategory]);

  // ✅ Search logic
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        setSearchResults(data || []);
        setShowSearchDropdown((data || []).length > 0);
      } catch {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [search, API_URL]);

  // ✅ Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(null);
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ Mark all notifications as read
  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) markAllRead();
  };

  return (
    <header className={styles.header} ref={dropdownRef}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <Store size={28} className={styles.logoIcon} />
        <span>DVRX</span>
      </Link>

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Orders */}
        <div
          className={styles.dropdownWrapper}
          onMouseEnter={() => setOpenMenu("orders")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={styles.dropdownBtn}
            onClick={() => setOpenMenu(openMenu === "orders" ? null : "orders")}
          >
            Orders <ChevronDown size={14} />
          </button>
          <div
            className={`${styles.dropdownMenu} ${styles.ordersMenu} ${
              openMenu === "orders" ? styles.showMenu : ""
            }`}
          >
            <Link href="/profile?tab=orders" className={styles.dropdownItem}>
              My Orders
            </Link>
            <Link href="/track-order" className={styles.dropdownItem}>
              Track Orders
            </Link>
          </div>
        </div>

        {/* Account */}
        <div
          className={styles.dropdownWrapper}
          onMouseEnter={() => setOpenMenu("account")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={styles.dropdownBtn}
            onClick={() =>
              setOpenMenu(openMenu === "account" ? null : "account")
            }
          >
            Account <ChevronDown size={14} />
          </button>
          <div
            className={`${styles.dropdownMenu} ${styles.accountMenu} ${
              openMenu === "account" ? styles.showMenu : ""
            }`}
          >
            {user ? (
              <>
                <Link href="/profile" className={styles.dropdownItem}>
                  My Profile
                </Link>
                <Link
                  href="/profile?tab=wishlist"
                  className={styles.dropdownItem}
                >
                  Wishlist
                </Link>
                <button className={styles.dropdownItem} onClick={logout}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className={styles.dropdownItem}>
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Categories */}
        <div
          className={styles.dropdownWrapper}
          onMouseEnter={() => setOpenMenu("categories")}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={styles.dropdownBtn}
            onClick={() =>
              setOpenMenu(openMenu === "categories" ? null : "categories")
            }
          >
            Categories <ChevronDown size={14} />
          </button>

          <div
            className={`${styles.megaMenu} ${
              openMenu === "categories" ? styles.showMenu : ""
            }`}
          >
            {/* Left Column */}
            <div className={styles.megaMenuCategories}>
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className={`${styles.megaCategoryItem} ${
                    activeCategory?._id === cat._id ? styles.activeCategory : ""
                  }`}
                  onMouseEnter={() => setActiveCategory(cat)}
                >
                  {cat.name}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className={styles.megaMenuSubcategories}>
              {activeCategory && (
                <Link
                  href={`/category/${activeCategory?.name}`}
                  className={styles.subcategoryItem}
                  key="all"
                >
                  <img
                    src={`/images/${activeCategory?.name}-all.jpg`}
                    alt="All"
                  />
                  <span>All</span>
                </Link>
              )}
              {(activeCategory?.subcategories || []).map((sub, i) => (
                <Link
                  href={`/category/${activeCategory.name.toLowerCase()}?sub=${encodeURIComponent(
                    sub.toLowerCase()
                  )}`}
                  className={styles.subcategoryItem}
                  key={i}
                >
                  <img
                    src={`/images/${activeCategory.name.toLowerCase()}-${sub.toLowerCase()}.jpg`}
                    alt={sub}
                  />
                  <span>{sub}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          onFocus={() =>
            searchResults.length > 0 && setShowSearchDropdown(true)
          }
        />
        {showSearchDropdown && (
          <div className={styles.searchDropdown}>
            {searchResults.map((product) => (
              <Link
                key={product._id}
                href={`/product/${product._id}`}
                className={styles.searchItem}
                onClick={() => setShowSearchDropdown(false)}
              >
                <img src={product.image} alt={product.name} />
                <div>
                  <h4>{product.name}</h4>
                  <p>₦{product.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={styles.themeToggle}
        aria-label="Toggle Theme"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Notifications */}
      <div className={styles.notificationsWrapper}>
        <button
          className={styles.bellBtn}
          onClick={handleOpenNotifications}
          aria-label="Notifications"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className={styles.notificationCount}>{unreadCount}</span>
          )}
        </button>
        {showNotifications && (
          <div className={styles.notificationsDropdown}>
            {notifications.length === 0 ? (
              <p className={styles.noNotifications}>No notifications</p>
            ) : (
              notifications.map((notif, i) => {
                const Wrapper = notif.link
                  ? notif.link.startsWith("http")
                    ? "a"
                    : Link
                  : "div";

                const wrapperProps = notif.link
                  ? notif.link.startsWith("http")
                    ? {
                        href: notif.link,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: styles.notificationItem,
                        onClick: () => setShowNotifications(false),
                      }
                    : {
                        href: notif.link,
                        className: styles.notificationItem,
                        onClick: () => setShowNotifications(false),
                      }
                  : { className: styles.notificationItem };

                return (
                  <Wrapper key={i} {...wrapperProps}>
                    <div
                      className={`${styles.notificationBadge} ${
                        styles[`type-${notif.type || "info"}`]
                      }`}
                    >
                      o
                    </div>
                    <div className={styles.notificationContent}>
                      <p>{notif.message}</p>
                      <small>
                        {new Date(notif.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </Wrapper>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Cart */}
      <div className={styles.cartWrapper}>
        <Link href="/cart" className={styles.cartBtn}>
          <ShoppingCart size={22} />
          <span className={styles.cartCount}>{cart.length}</span>
          <span className={styles.cartPrice}>
            ₦{totalPrice.toLocaleString()}
          </span>
        </Link>
      </div>
    </header>
  );
}
