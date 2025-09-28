"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, MapPin, Edit, LogOut } from "lucide-react";
import styles from "@/styles/ProfileSidebar.module.css"; // Separate CSS for sidebar

export default function ProfileLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h2 className={styles.title}>MY ACCOUNT</h2>
        <nav className={styles.menu}>
          <button onClick={() => router.push("/profile/orders")}>
            <ShoppingBag size={18} /> Orders
          </button>
          <button onClick={() => router.push("/profile/wishlist")}>
            <Heart size={18} /> Wishlist
          </button>
          <button onClick={() => router.push("/profile/addresses")}>
            <MapPin size={18} /> Addresses
          </button>
          <button onClick={() => router.push("/profile/personal-data")}>
            <Edit size={18} /> Personal Data
          </button>
          <button onClick={() => router.push("/profile/edit-profile")}>
            <Edit size={18} /> Edit Profile
          </button>
          <button onClick={logout} className={styles.signOutBtn}>
            <LogOut size={18} /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Page Content */}
      <main className={styles.content}>{children}</main>
    </div>
  );
}
