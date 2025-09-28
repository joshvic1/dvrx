"use client";
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // for initial load
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Load user from localStorage on app start
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (err) {
      console.error("Auth load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save user/token to localStorage whenever it changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  // Signup
  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        toast.success(data.message || "Signup successful");
      } else {
        toast.error(data.message || "Signup failed");
      }
      return { ...data, success: res.ok };
    } catch (err) {
      return { success: false, message: "Server error" };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        return { success: true, message: data.message || "Login successful" };
      } else {
        return {
          success: false,
          message: data.message || "Invalid email or password",
        };
      }
    } catch (err) {
      return { success: false, message: "Server error" };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    toast.success("Logged out");
  };

  // ✅ Add updateUser helper (optional but useful)
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    toast.success("Profile updated");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser,
        updateUser,
        signup,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  return useContext(AuthContext);
}
