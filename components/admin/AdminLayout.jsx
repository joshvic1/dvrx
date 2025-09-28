"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  Box,
  ShoppingCart,
  Star,
  Users,
  Tag,
  BarChart2,
  Bell,
  Mail,
  Search,
  ChevronDown,
} from "lucide-react";
import styles from "@/styles/AdminLayout.module.css";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // wait until auth finishes loading
    if (!user || user.email !== "director@dvrxtheart.com") {
      router.replace("/"); // redirect if not director
    }
  }, [user, loading, router]);

  // Optionally, show a loader until ready
  if (loading || !user) return <p>Loading admin...</p>;

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const menuItems = [
    { name: "All Products", icon: <Box size={18} />, href: "/admin/products" },
    { name: "Orders", icon: <ShoppingCart size={18} />, href: "/admin/orders" },
    { name: "Reviews", icon: <Star size={18} />, href: "/admin/reviews" },
    { name: "Users", icon: <Users size={18} />, href: "/admin/users" },
    { name: "Promocodes", icon: <Tag size={18} />, href: "/admin/promocodes" },
    {
      name: "Analytics",
      icon: <BarChart2 size={18} />,
      href: "/admin/analytics",
    },
    {
      name: "Notifications",
      icon: <Bell size={18} />,
      href: "/admin/notifications",
    },
    { name: "Emails", icon: <Mail size={18} />, href: "/admin/emails" },
    { name: "Logout", icon: <LogOut size={18} />, href: "/" },
  ];

  return (
    <div className={styles.adminWrapper}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.logo}>
          {!collapsed ? <h2>DVRX Admin</h2> : <h2>DA</h2>}
          <button onClick={toggleSidebar} className={styles.collapseBtn}>
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <Link
              href={item.href}
              key={item.name}
              className={`${styles.menuItem} ${
                router.pathname === item.href ? styles.active : ""
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!collapsed && <span className={styles.label}>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content wrapper */}
      <div className={styles.mainWrapper}>
        {/* Top Header */}
        <header className={styles.adminHeader}>
          <div className={styles.headerLeft}>
            <button onClick={toggleSidebar} className={styles.collapseBtn}>
              {collapsed ? "→" : "←"}
            </button>
            <div className={styles.headerSearch}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div
              onClick={() => router.push("/admin/add-product")}
              style={{
                padding: "8px 17px",
                background: "#b8925a",
                color: "#fff",
                fontWeight: "600",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "center",
                width: "fit-content",
              }}
            >
              ➕ Add Product
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerItem}>
              <Bell size={18} />
              <span className={styles.badge}>3</span>
            </div>
            <div className={styles.headerItem}>
              <ChevronDown size={16} />
              <div className={styles.profileDropdown}>
                <p>{user?.email}</p>
                <Link href="/">Logout</Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
