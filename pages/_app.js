// pages/_app.js
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { LoadingProvider, useLoading } from "@/context/LoadingContext";
import TopLoader from "@/components/TopLoader";
import Footer from "../components/Footer";
import { WishlistProvider } from "@/context/WishlistContext";

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { loading, setLoading } = useLoading();
  const [filters, setFilters] = useState({ search: "", category: "" });
  const categories = ["Electronics", "Fashion", "Food", "Books"];

  const isAdminRoute = router.pathname.startsWith("/admin"); // ✅ check if admin

  // Router events for page transitions
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router, setLoading]);

  return (
    <>
      <TopLoader isLoading={loading} />
      {!isAdminRoute && ( // ❌ Hide header for admin routes
        <Header categories={categories} onFilter={(data) => setFilters(data)} />
      )}
      <Component {...pageProps} filters={filters} />
      <CartSidebar />
      {!isAdminRoute && <Footer />} {/* Optional: hide footer for admin */}
    </>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <LoadingProvider>
              <AppContent Component={Component} pageProps={pageProps} />
            </LoadingProvider>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default MyApp;
