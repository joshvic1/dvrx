"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";

export default function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState("light");
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const socket = useRef(null);

  // Track window width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    handleResize(); // set initial value

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Theme handling
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Socket notifications
  useEffect(() => {
    if (!user) return;
    socket.current = io(process.env.NEXT_PUBLIC_API_URL);
    socket.current.emit("register", user.email);

    socket.current.on("newNotification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user]);

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const sharedProps = {
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
  };

  return (
    <>
      {isMobile ? (
        <MobileHeader {...sharedProps} />
      ) : (
        <DesktopHeader {...sharedProps} />
      )}
    </>
  );
}
