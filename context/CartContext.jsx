"use client";
import { createContext, useContext, useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const auth = useAuth();
  const user = auth?.user || null;
  const [cart, setCart] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  function getTotalQtyForProduct(productId) {
    return cart
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.qty, 0);
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  function resetPromoCode() {
    setPromoCode("");
    setDiscount(0);
  }

  // Load cart on app start
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const res = await fetch(`/api/cart/${user._id}`);
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart || []);
          }
        } catch (err) {
          console.error("Error fetching user cart:", err);
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCart(JSON.parse(savedCart));
      }
    };
    loadCart();
  }, [user]);

  // Save cart whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        try {
          await fetch(`/api/cart/${user._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart }),
          });
        } catch (err) {
          console.error("Error saving cart:", err);
        }
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    };
    saveCart();
  }, [cart, user]);

  // Listen for localStorage updates from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "cart" && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Listen for localStorage updates from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "cart" && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };

    const handleManualEvent = () => {
      if (!user) {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (JSON.stringify(parsed) !== JSON.stringify(cart)) {
            setCart(parsed);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleManualEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleManualEvent);
    };
  }, [user]);

  // Generate a unique key for product+variant combo
  function getKey(productId, variant = {}) {
    if (!variant || Object.keys(variant).length === 0) return productId;
    const variantString = Object.keys(variant)
      .sort()
      .map((k) => `${k}:${variant[k]}`)
      .join("|");
    return `${productId}-${variantString}`;
  }

  function addToCart(product, qty = 1, variant = {}) {
    const q = Math.max(1, Number(qty) || 1);
    variant = variant || {}; // always object
    const key = getKey(product._id, variant);
    const exists = cart.find((item) => item.key === key);

    const normalizedProduct = {
      key,
      productId: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      image: product.image
        ? product.image.startsWith("http")
          ? product.image
          : product.image.startsWith("/")
          ? `${API_URL}${product.image}`
          : `${API_URL}/${product.image}`
        : "/placeholder.png",
      variants: variant,
      stock: product.stock,
    };

    const totalQty = getTotalQtyForProduct(product._id);
    if (typeof product.stock === "number" && totalQty + q > product.stock) {
      // Prevent overselling
      const allowedQty = product.stock - totalQty;
      if (allowedQty <= 0) return; // no stock left
      if (exists) {
        setCart(
          cart.map((item) =>
            item.key === key ? { ...item, qty: item.qty + allowedQty } : item
          )
        );
      } else {
        setCart([...cart, { ...normalizedProduct, qty: allowedQty }]);
      }
      return;
    }

    if (exists) {
      setCart(
        cart.map((item) =>
          item.key === key ? { ...item, qty: (item.qty || 1) + q } : item
        )
      );
    } else {
      setCart([...cart, { ...normalizedProduct, qty: q }]);
    }
  }

  function removeFromCart(productId, variant = {}) {
    const key = getKey(productId, variant || {});
    setCart(cart.filter((item) => item.key !== key));
  }

  function updateQty(productId, variant = {}, qty) {
    const key = getKey(productId, variant || {});
    const item = cart.find((i) => i.key === key);
    if (!item) return;

    const productStock = item.stock;
    const totalQty = getTotalQtyForProduct(productId);

    if (typeof productStock === "number") {
      const otherQty = totalQty - item.qty; // qty of other variants
      if (qty + otherQty > productStock) {
        qty = productStock - otherQty; // cap at remaining stock
        if (qty < 1) qty = 1;
      }
    }

    setCart(
      cart.map((i) => (i.key === key ? { ...i, qty: qty < 1 ? 1 : qty } : i))
    );
  }

  function clearCart(silent = false) {
    setCart([]);
    if (!silent && !user) {
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }

  function checkoutSuccess(order) {
    if (!order || !order.items) return;

    let ordered = JSON.parse(localStorage.getItem("recentlyOrdered")) || [];

    order.items.forEach((item) => {
      ordered = ordered.filter((o) => o.productId !== item.productId);
      ordered.unshift({
        productId: item.productId,
        category: item.category,
        subCategory: item.subCategory,
        date: new Date().toISOString(),
      });
    });

    localStorage.setItem(
      "recentlyOrdered",
      JSON.stringify(ordered.slice(0, 20))
    );

    clearCart(true); // ✅ silent clear
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        checkoutSuccess,
        promoCode,
        setPromoCode,
        discount,
        setDiscount,
        resetPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
