"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, MapPin, Edit, LogOut } from "lucide-react";
import { useRouter } from "next/router"; // pages router; change to next/navigation if using App Router
import styles from "@/styles/ProfileSidebar.module.css";
import { useSearchParams } from "next/navigation";

// your real components (keep these as-is)
import Orders from "./orders";
import Wishlist from "./wishlist";
import Addresses from "./addresses";
import PersonalData from "./PersonalData";

// Small local fallbacks so the tab switch won't crash if you don't have those files yet
function Placeholder({ title }) {
  return (
    <div className={styles.placeholder}>
      <h3>{title}</h3>
      <p className={styles.placeholderText}>
        This section isn't implemented in this build. Coming soon.
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";
  const [activeTab, setActiveTab] = useState(initialTab); // default
  const router = useRouter();
  useEffect(() => {
    const tab = searchParams.get("tab") || "orders";
    setActiveTab(tab);
  }, [searchParams]);
  // Redirect if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      // use router when possible
      try {
        router.push("/login");
      } catch {
        window.location.href = "/login";
      }
    }
  }, [user, authLoading, router]);

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <Orders />;
      case "wishlist":
        return <Wishlist />;
      case "addresses":
        return <Addresses />;

      case "edit-profile":
        return <PersonalData />;
      default:
        return <Orders />;
    }
  };

  if (authLoading) return <div className={styles.centered}>Loading...</div>;
  if (!user) return <div className={styles.centered}>Redirecting...</div>;

  // small helper to render menu button
  const MenuButton = ({ id, label, Icon }) => (
    <button
      aria-current={activeTab === id ? "true" : "false"}
      className={`${styles.menuBtn} ${activeTab === id ? styles.active : ""}`}
      onClick={() => setActiveTab(id)}
    >
      <span className={styles.iconWrap}>
        <Icon size={16} />
      </span>
      <span className={styles.labelText}>{label}</span>
    </button>
  );

  const initials =
    (user?.name || "U")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className={styles.wrapper}>
      <div className={styles.profileContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || "User"}</div>
              <div className={styles.userEmail}>{user?.email || ""}</div>
            </div>
          </div>

          <nav className={styles.menu}>
            <MenuButton id="orders" label="Orders" Icon={ShoppingBag} />
            <MenuButton id="wishlist" label="Wishlist" Icon={Heart} />
            <MenuButton id="addresses" label="Addresses" Icon={MapPin} />

            <MenuButton id="edit-profile" label="Edit Profile" Icon={Edit} />

            <button
              className={`${styles.menuBtn} ${styles.signOutBtn}`}
              onClick={() => logout()}
            >
              <span className={styles.iconWrap}>
                <LogOut size={16} />
              </span>
              <span className={styles.labelText}>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className={styles.content}>
          <section className={styles.tabContent}>{renderContent()}</section>
        </main>
      </div>

      {/* Mobile compact bottom tab (shown on small screens) */}
      <div className={styles.mobileTabs}>
        <button
          onClick={() => setActiveTab("orders")}
          className={`${styles.mobileTabBtn} ${
            activeTab === "orders" ? styles.mobileActive : ""
          }`}
        >
          <ShoppingBag size={18} />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab("wishlist")}
          className={`${styles.mobileTabBtn} ${
            activeTab === "wishlist" ? styles.mobileActive : ""
          }`}
        >
          <Heart size={18} />
          <span>Wishlist</span>
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`${styles.mobileTabBtn} ${
            activeTab === "addresses" ? styles.mobileActive : ""
          }`}
        >
          <MapPin size={18} />
          <span>Address</span>
        </button>

        <button
          onClick={() => setActiveTab("edit-profile")}
          className={`${styles.mobileTabBtn} ${
            activeTab === "edit-profile" ? styles.mobileActive : ""
          }`}
        >
          <Edit size={18} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
