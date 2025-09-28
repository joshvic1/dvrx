"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/Auth.module.css";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { addToast } = useToast();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, router, redirect]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "email") value = value.toLowerCase();
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleLogin = async () => {
    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    if (!email || !password) {
      addToast("All fields required", "error");
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      addToast(result.message, "success");
      router.push(redirect);
    } else {
      addToast(result.message, "error");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--background)",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <div className={styles.authContainer}>
        <h2>Login</h2>
        <div className={styles.authForm}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            onClick={handleLogin}
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className={styles.authExtra}>
          <a href="/forgot-password">Forgot password?</a>
        </p>
        <p className={styles.authExtra}>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}
