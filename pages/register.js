"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Auth.module.css";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const router = useRouter();
  const { addToast } = useToast();
  const { signup, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Redirect logged-in users
  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "email") {
      value = value.toLowerCase();
      if (!isValidEmail(value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRegister = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    if (!name || !email || !password) {
      addToast("All fields are required", "error");
      return;
    }

    if (!isValidEmail(email)) {
      addToast("Please enter a valid email address", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await signup(name, email, password);

      if (result.success) {
        addToast(
          "🎉 Registration successful! Redirecting to login...",
          "success"
        );
        setTimeout(() => router.push("/login"), 1500);
      } else {
        addToast(result.message || "Registration failed", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Server error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = () => {
    const { name, email, password } = formData;
    return name.trim() && password.trim() && isValidEmail(email.trim());
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
        <h2>Create an Account</h2>
        <div className={styles.authForm}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          {emailError && <p className={styles.inputError}>{emailError}</p>}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            onClick={handleRegister}
            disabled={loading || !isFormValid()}
            className={!isFormValid() ? styles.disabledBtn : ""}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className={styles.authExtra}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
