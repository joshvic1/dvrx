"use client";
import { useState, useEffect } from "react";
import styles from "../styles/Checkout.module.css";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import LoginModal from "@/components/LoginModal";
import LastMinutePopup from "@/components/LastMinutePopup";

import { useRef } from "react";

export default function Checkout() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const [errors, setErrors] = useState({});

  const { user, token, login, signup } = useAuth();
  const { cart, clearCart, promoCode, setPromoCode, discount, setDiscount } =
    useCart();

  const { addToast } = useToast();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    houseNumber: "",
    street: "",
    localGovt: "",
    state: "",
    country: "Nigeria",
  });
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showLastMinute, setShowLastMinute] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();

        // Match homepage logic
        const sortedProducts = data.sort((a, b) => b._id.localeCompare(a._id));
        setAllProducts(sortedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAddresses(data.addresses);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "email" ? value.toLowerCase().replace(/\s+/g, "") : value,
    });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]:
        name === "email" ? value.toLowerCase().replace(/\s+/g, "") : value,
    });
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      addToast("Enter email and password", "error");
      return;
    }
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      setFormData((prev) => ({ ...prev, email: loginData.email }));
      setShowLoginPopup(false);
      addToast(result.message || "Login successful", "success");
      fetchAddresses();
    } else addToast(result.message || "Invalid credentials", "error");
  };

  const handleApplyPromo = async () => {
    if (!promoCode) return addToast("Enter a promo code", "error");
    try {
      const res = await fetch(`${API_URL}/api/promocodes/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: promoCode.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || "Invalid promo code", "error");
        setDiscount(0);
      } else {
        addToast(
          `🎉 Promo applied! You saved ₦${data.amount.toLocaleString()}`,
          "success"
        );
        setDiscount(data.amount || 0);
      }
    } catch (err) {
      console.error(err);
      addToast("Server error while applying promo", "error");
      setDiscount(0);
    }
  };

  const handleCheckout = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      (user && !selectedAddress) ||
      (!user && !formData.address.trim())
    ) {
      addToast("Please fill all required fields", "error");
      return;
    }

    if (!isValidEmail(formData.email)) {
      addToast("Please enter a valid email address", "error");
      return;
    }

    if (cart.length === 0) {
      addToast("Your cart is empty", "error");
      return;
    }

    setLoading(true); // Start loading
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = Math.max(subtotal - discount, 0); // ✅ apply discount

    try {
      let currentUser = user;

      // Handle guest signup if not logged in
      if (!token) {
        if (!password) {
          addToast("Enter a password to create an account", "info");
          setLoading(false);
          return;
        }

        const result = await signup(formData.name, formData.email, password);
        if (!result.success) {
          if (result.message === "User already exists") {
            setLoginData({ email: formData.email, password: "" });
            setShowLoginPopup(true);
            addToast("You already have an account, please login.", "info");
          } else addToast(result.message || "Signup failed", "error");
          setLoading(false);
          return;
        }

        currentUser = result.user;
      }

      // Handle selected or new address
      let finalAddress = "";
      if (user) {
        finalAddress = selectedAddress;
        if (token && selectedAddress === "__new__") {
          const { houseNumber, street, localGovt, state, country } = newAddress;
          if (!houseNumber || !street || !localGovt || !state) {
            addToast("Please complete the new address form", "error");
            setLoading(false);
            return;
          }
          const resAddr = await fetch(`${API_URL}/api/address`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newAddress),
          });
          const dataAddr = await resAddr.json();
          if (resAddr.ok) {
            finalAddress = `${houseNumber}, ${street}, ${localGovt}, ${state}, ${country}`;
            setAddresses(dataAddr.addresses);
            setSelectedAddress(finalAddress);
          } else {
            addToast(dataAddr.message || "Failed to save address", "error");
            setLoading(false);
            return;
          }
        }
      } else finalAddress = formData.address;

      // ✅ Place order safely
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item._id || item.productId,
              name: item.name,
              price: item.price,
              qty: item.qty,
              variants: item.variants || {}, // include variants properly
              image: item.image,
            })),
            total,
            customerName: formData.name,
            customerEmail: formData.email,
            shippingAddress: finalAddress,
            promoCode: promoCode ? promoCode.toUpperCase() : undefined,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          addToast(errorData.message || "Order failed", "error");
          setLoading(false);
          return; // exit function
        }

        const data = await res.json();
        addToast(`✅ Order placed! Code: ${data.orderCode}`, "success");
        clearCart();
        setPromoCode(""); // ✅ reset promo
        setDiscount(0);
        localStorage.removeItem("cart"); // ✅ force clear local cache
        // only clear if order is successful

        setTimeout(() => {
          window.location.href = `/order-success?orderCode=${data.orderCode}`;
        }, 1000);
      } catch (err) {
        console.error(err);
        addToast("Server error while placing order", "error");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error(err);
      addToast("Unexpected error occurred", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (promoCode) {
      if (discount > 0) {
        // Already applied
        addToast(
          `✅ Promo "${promoCode}" applied. Discount: ₦${discount.toLocaleString()}`,
          "success"
        );
      } else {
        // Promo exists but discount is missing → re-validate
        (async () => {
          try {
            const res = await fetch(`${API_URL}/api/promocodes/apply`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ promoCode: promoCode.toUpperCase() }),
            });
            const data = await res.json();
            if (res.ok) {
              setDiscount(data.amount || 0);
            } else {
              setDiscount(0);
            }
          } catch (err) {
            console.error(err);
            setDiscount(0);
          }
        })();
      }
    }
  }, [promoCode]);
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your full name";
      nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nameRef.current?.focus();
    } else if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current?.focus();
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current?.focus();
    } else if (!formData.phone.trim()) {
      newErrors.phone = "Please enter your phone number";
      phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      phoneRef.current?.focus();
    } else if (user && !selectedAddress) {
      newErrors.address = "Please select a delivery address";
      // dropdown already visible → no scroll needed
    } else if (!user && !formData.address.trim()) {
      newErrors.address = "Please enter your delivery address";
      addressRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      addressRef.current?.focus();
    } else if (cart.length === 0) {
      addToast("Your cart is empty", "error");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // ✅ all good
  };

  return (
    <div className={styles.checkoutContainer}>
      <h2 className={styles.heading}>🛒 Checkout</h2>
      <div className={styles.checkoutWrapper}>
        {/* Left: Form */}
        <div className={styles.formSection}>
          <h3>Customer Information</h3>
          <input
            ref={nameRef}
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          <input
            ref={emailRef}
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            readOnly={!!token}
            style={{
              backgroundColor: token ? "#2c2c2c" : "#fff", // dark gray for dark mode
              color: token ? "#fff" : "#000", // white text for readability
              cursor: token ? "not-allowed" : "text",
              border: token ? "1px solid #555" : "1px solid #ccc", // optional
            }}
          />
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          <input
            ref={phoneRef}
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
          {/* Address Section */}
          {user ? (
            <div className="addressSection">
              <label>Select Address</label>
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
              >
                <option value="">-- Choose an address --</option>
                {addresses.map((addr, idx) => (
                  <option
                    key={idx}
                    value={`${addr.houseNumber}, ${addr.street}, ${addr.localGovt}, ${addr.state}, ${addr.country}`}
                  >
                    {addr.houseNumber}, {addr.street}, {addr.localGovt},{" "}
                    {addr.state}, {addr.country}
                  </option>
                ))}
                <option value="__new__">➕ Add New Address</option>
              </select>
            </div>
          ) : (
            <div className="addressSection">
              <label>Delivery Address</label>
              <textarea
                ref={addressRef}
                name="address"
                placeholder="Enter your full delivery address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
              {errors.address && (
                <p className={styles.errorText}>{errors.address}</p>
              )}
            </div>
          )}
          {token && selectedAddress === "__new__" && (
            <div className="newAddressForm">
              <h4>Add New Address</h4>
              <input
                name="houseNumber"
                placeholder="House Number"
                value={newAddress.houseNumber}
                onChange={handleAddressChange}
              />
              <input
                name="street"
                placeholder="Delivery address in details"
                value={newAddress.street}
                onChange={handleAddressChange}
              />
              <input
                name="localGovt"
                placeholder="Local Government"
                value={newAddress.localGovt}
                onChange={handleAddressChange}
              />
              <input
                name="state"
                placeholder="State"
                value={newAddress.state}
                onChange={handleAddressChange}
              />
              <input
                name="country"
                placeholder="Country"
                value={newAddress.country}
                onChange={handleAddressChange}
              />
            </div>
          )}

          {!token && (
            <div className="guestPassword">
              <p>
                <strong>Create a password so you can track your orders</strong>
              </p>
              <input
                type="password"
                name="password"
                placeholder="Create a Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="loginPrompt flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span>Already have an account?</span>
                <span
                  className="loginText cursor-pointer font-semibold text-yellow-600 dark:text-yellow-400 hover:underline"
                  onClick={() => {
                    setLoginData({ ...loginData, email: formData.email });
                    setShowLoginPopup(true);
                  }}
                >
                  Login
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className={styles.summarySection}>
          <h3>Order Summary</h3>
          <div className={styles.promoWrapper}>
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />

            <button onClick={handleApplyPromo}>Apply</button>
          </div>

          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <ul className={styles.cartList}>
              {cart.map((item) => (
                <li key={item.key} className={styles.cartItem}>
                  {/* Product thumbnail */}
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className={styles.cartItemImage}
                  />
                  {/* Product info */}
                  <div className={styles.cartItemInfo}>
                    <strong>{item.name}</strong>
                    <p>
                      ₦{item.price.toLocaleString("en-NG")} × {item.qty}
                    </p>

                    {/* Show variants if available */}
                    {item.variants && Object.keys(item.variants).length > 0 && (
                      <p className={styles.cartItemVariant}>
                        {Object.entries(item.variants)
                          .map(([name, value]) => `${name}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Total price for this item */}
                  <span>
                    ₦{(item.price * item.qty).toLocaleString("en-NG")}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.totalWrapper}>
            <div className={styles.totalLine}>
              <span>Subtotal:</span>
              <span>
                ₦
                {cart
                  .reduce((sum, item) => sum + item.price * item.qty, 0)
                  .toLocaleString("en-NG")}
              </span>
            </div>
            {discount > 0 && (
              <div className={styles.totalLineDiscount}>
                <span>Promo discount:</span>
                <span>-₦{discount.toLocaleString("en-NG")}</span>
              </div>
            )}
            <div className={styles.totalLineBold}>
              <span>Total:</span>
              <span>
                ₦
                {Math.max(
                  cart.reduce((sum, item) => sum + item.price * item.qty, 0) -
                    discount,
                  0
                ).toLocaleString("en-NG")}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (validateForm()) {
                setShowLastMinute(true);
              }
            }}
            disabled={loading}
            className={styles.checkoutBtn}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
      <LastMinutePopup
        show={showLastMinute}
        onClose={() => setShowLastMinute(false)}
        onConfirm={handleCheckout} // runs original checkout when confirmed
        products={allProducts}
        total={Math.max(
          cart.reduce((sum, item) => sum + item.price * item.qty, 0) - discount,
          0
        )}
      />

      {/* Login Popup */}
      <LoginModal
        show={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        prefillEmail={formData.email}
      />
    </div>
  );
}
