"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Layers,
} from "lucide-react";
import { FiShoppingBag } from "react-icons/fi";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { CiSearch, CiLogout, CiLogin } from "react-icons/ci";
import { VscAccount } from "react-icons/vsc";
import { TbUserSquareRounded } from "react-icons/tb";
import { MdFavorite } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import styles from "../styles/MobileHeader.module.css";
import { motion } from "framer-motion";

export default function MobileHeader({
  cart,
  user,
  logout,
  theme,
  toggleTheme,
  categories,
  notifications,
  unreadCount,
  markAllRead,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState("categories");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ Search logic
  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/search?q=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [search, API_URL]);

  // ✅ Close menu on link click
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      {/* === TopBar === */}
      <div className={styles.topBar}>
        <button onClick={() => setMenuOpen(true)} className={styles.topIconBtn}>
          <Menu size={24} />
        </button>

        <Link href="/" className={styles.logo}>
          DVRX
        </Link>

        <div className={styles.rightIcons}>
          <button
            onClick={() => setSearchOpen((prev) => !prev)}
            className={styles.topIconBtn}
          >
            <Search size={22} />
          </button>

          <Link href="/cart" className={styles.topIconBtn}>
            <ShoppingCart size={22} />
            {cart.length > 0 && (
              <span className={styles.topBadge}>{cart.length}</span>
            )}
          </Link>
        </div>
      </div>

      {/* === Search dropdown === */}
      {searchOpen && (
        <div className={styles.searchDropdown}>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() => setSearchOpen(false)}>
              <X size={18} />
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((p) => (
                <Link
                  key={p._id}
                  href={`/product/${p._id}`}
                  className={styles.searchItem}
                  onClick={() => setSearchOpen(false)}
                >
                  <img src={p.image} alt={p.name} />
                  <div>
                    <h4>{p.name}</h4>
                    <p>₦{p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === Fullscreen Menu === */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className={styles.sheetOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            className={styles.bottomSheet}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          >
            {/* Handle */}
            <div className={styles.handleBack}>
              <div className={styles.sheetHandle}></div>{" "}
            </div>

            {/* === Header (notif + theme) === */}
            <div className={styles.sheetHeader}>
              <div className={styles.sheetHeaderLeft}></div>

              <div className={styles.sheetHeaderRight}>
                {/* Notifications */}
                <div className={styles.notifWrapper}>
                  <button
                    onClick={() => setNotifOpen((prev) => !prev)}
                    className={styles.sheetIconBtn}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className={styles.sheetBadge}>{unreadCount}</span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className={styles.notifDropdown}>
                      {notifications.length === 0 ? (
                        <p className={styles.noNotif}>No notifications</p>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className={styles.notificationItem}>
                            {n.message}
                          </div>
                        ))
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllRead}
                          className={styles.markAll}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Theme toggle */}
                <button onClick={toggleTheme} className={styles.sheetIconBtn}>
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {/* === Accordion Content === */}
            <div className={styles.sheetContent}>
              {/* Orders */}
              {/* Orders Accordion */}
              <div className={styles.sheetAccordion}>
                <button
                  className={styles.sheetTrigger}
                  onClick={() =>
                    setOpenCategory(openCategory === "orders" ? null : "orders")
                  }
                >
                  <span>
                    <FiShoppingBag size={18} /> Orders
                  </span>
                  <ChevronDown
                    className={openCategory === "orders" ? styles.rotate : ""}
                    size={18}
                  />
                </button>

                {openCategory === "orders" && (
                  <motion.div
                    className={styles.sheetPanel}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul>
                      <li>
                        <Link
                          href="/profile?tab=orders"
                          onClick={handleLinkClick}
                        >
                          <RiShoppingBag3Fill
                            size={16}
                            className={styles.subIcon}
                          />{" "}
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link href="/track-order" onClick={handleLinkClick}>
                          <CiSearch size={16} className={styles.subIcon} />{" "}
                          Track Orders
                        </Link>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Account */}
              <div className={styles.sheetAccordion}>
                <button
                  className={styles.sheetTrigger}
                  onClick={() =>
                    setOpenCategory(
                      openCategory === "account" ? null : "account"
                    )
                  }
                >
                  <span>
                    <VscAccount size={18} /> Account
                  </span>
                  <ChevronDown
                    className={openCategory === "account" ? styles.rotate : ""}
                    size={18}
                  />
                </button>
                {openCategory === "account" && (
                  <motion.div
                    className={styles.sheetPanel}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul>
                      {user ? (
                        <>
                          <li>
                            <Link href="/profile" onClick={handleLinkClick}>
                              <TbUserSquareRounded
                                size={16}
                                className={styles.subIcon}
                              />{" "}
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/profile?tab=wishlist"
                              onClick={handleLinkClick}
                            >
                              <MdFavorite
                                size={16}
                                className={styles.subIcon}
                              />{" "}
                              Wishlist
                            </Link>
                          </li>
                          <li>
                            <button onClick={logout}>
                              <CiLogout size={16} className={styles.subIcon} />{" "}
                              Sign out
                            </button>
                          </li>
                        </>
                      ) : (
                        <li>
                          <Link href="/login" onClick={handleLinkClick}>
                            <CiLogin size={16} className={styles.subIcon} />{" "}
                            Sign in
                          </Link>
                        </li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </div>

              {/* Categories */}
              <div className={styles.sheetAccordion}>
                <button
                  className={styles.sheetTrigger}
                  onClick={() =>
                    setOpenCategory(
                      openCategory === "categories" ? null : "categories"
                    )
                  }
                >
                  <span>
                    <BiSolidCategory size={18} /> Categories
                  </span>
                  <ChevronDown
                    className={
                      openCategory === "categories" ? styles.rotate : ""
                    }
                    size={18}
                  />
                </button>
                {openCategory === "categories" && (
                  <motion.div
                    className={styles.subMenuThumbs}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {[
                      {
                        text: "Male",
                        href: "/category/male",
                        thumb: "/images/male.jpg",
                      },
                      {
                        text: "Female",
                        href: "/category/female",
                        thumb: "/images/female.jpg",
                      },
                      {
                        text: "Unisex",
                        href: "/category/unisex",
                        thumb: "/images/unisex.jpg",
                      },
                    ].map((cat, i) => (
                      <motion.div
                        key={i}
                        className={styles.subMenuItem}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 150 }}
                      >
                        <Link href={cat.href} onClick={handleLinkClick}>
                          <img src={cat.thumb} alt={cat.text} />
                          <span>{cat.text}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </header>
  );
}
