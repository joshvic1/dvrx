"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);

  // ✅ Must point to backend (e.g., http://localhost:5000)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ✅ Load wishlist from backend when user logs in
  useEffect(() => {
    if (!user || !token) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setWishlist(data.wishlist || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };

    fetchWishlist();
  }, [user, token]);

  // ✅ Add item to wishlist
  const addToWishlist = async (item) => {
    if (!user || !token) {
      addToast("You must be logged in to save products", "info");
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item._id }),
      });

      const data = await res.json();
      if (data.success) {
        setWishlist(data.wishlist || []);
        addToast("❤️ Product saved to wishlist", "success");
        return true;
      } else {
        addToast(data.message || "Error saving product", "error");
      }
    } catch (err) {
      console.error("Add to wishlist error:", err);
      addToast("Server error", "error");
    }

    return false;
  };

  // ✅ Remove item from wishlist
  const removeFromWishlist = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setWishlist(data.wishlist || []);
        addToast("Product removed from wishlist", "success");
      } else {
        addToast(data.message || "Error removing product", "error");
      }
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      addToast("Server error", "error");
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
