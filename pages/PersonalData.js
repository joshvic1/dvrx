"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/ProfileSidebar.module.css";
import toast from "react-hot-toast";

export default function PersonalData() {
  const { user, token, setUser } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- State ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  // --- Initialize form data from user ---
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updatePersonalData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Personal data updated!");
        setUser((prev) => ({ ...prev, ...formData }));
      } else toast.error(data.message || "Update failed");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.personalDataSection}>
      <h2>👤 Personal Information</h2>
      <form
        className={styles.personalDataForm}
        onSubmit={(e) => e.preventDefault()}
      >
        <div className={styles.inputGroup}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            disabled
            className={styles.disabledInput}
          />
          <small className={styles.hint}>
            Email cannot be changed for security reasons.
          </small>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={updatePersonalData}
            disabled={loading}
            className={styles.saveBtn}
          >
            {loading ? "Saving..." : "Update Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
