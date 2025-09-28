"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // ✅ Import router
import styles from "../styles/Checkout.module.css";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginModal({ show, onClose, prefillEmail }) {
  const { login } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    email: prefillEmail || "",
    password: "",
  });

  // 👇 Sync email when prefillEmail changes
  useEffect(() => {
    if (prefillEmail) {
      setLoginData((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      addToast("Enter email and password", "error");
      return;
    }
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      addToast(result.message || "Login successful", "success");
      onClose();
    } else {
      addToast(result.message || "Invalid credentials", "error");
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <h3>Login to Continue</h3>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={loginData.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleChange}
        />

        <div className={styles.popupButtons}>
          <button onClick={handleLogin}>Login</button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>

        {/* 👇 Add this new line */}
        <p className={styles.registerText}>
          Don’t have an account?{" "}
          <span
            onClick={() => {
              onClose();
              router.push("/register");
            }}
            className={styles.registerLink}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
